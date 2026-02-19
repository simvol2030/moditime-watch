import { db } from '$lib/server/db/database';
import type { ImportResult, ImportError } from './types';

function generateSlug(name: string): string {
	const map: Record<string, string> = {
		'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
		'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
		'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
		'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
		'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
	};
	return name
		.toLowerCase()
		.split('')
		.map((c) => map[c] ?? c)
		.join('')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function importProducts(rows: Record<string, string>[]): ImportResult {
	const errors: ImportError[] = [];
	let added = 0;
	let updated = 0;

	// Prepared statements
	const findBrandBySlug = db.prepare('SELECT id FROM brands WHERE slug = ?');
	const findCategoryBySlug = db.prepare('SELECT id FROM categories WHERE slug = ?');
	const findProductBySku = db.prepare('SELECT id FROM products WHERE sku = ?');
	const findProductBySlug = db.prepare('SELECT id FROM products WHERE slug = ?');

	const insertProduct = db.prepare(`
		INSERT INTO products (slug, brand_id, category_id, name, sku, price, price_note,
			availability_status, description, specs_json, is_active, is_featured, is_new, is_limited, position)
		VALUES (@slug, @brand_id, @category_id, @name, @sku, @price, @price_note,
			@availability_status, @description, @specs_json, @is_active, @is_featured, @is_new, @is_limited, @position)
	`);

	const updateProduct = db.prepare(`
		UPDATE products SET
			slug = @slug, brand_id = @brand_id, category_id = @category_id, name = @name,
			price = @price, price_note = @price_note, availability_status = @availability_status,
			description = @description, specs_json = @specs_json, is_active = @is_active,
			is_featured = @is_featured, is_new = @is_new, is_limited = @is_limited,
			position = @position, updated_at = CURRENT_TIMESTAMP
		WHERE id = @id
	`);

	// Images
	const deleteProductImages = db.prepare('DELETE FROM product_images WHERE product_id = ?');
	const insertImage = db.prepare('INSERT INTO product_images (product_id, url, thumbnail_url, alt, position, is_main) VALUES (?, ?, ?, ?, ?, ?)');

	// Brand name lookup (hoisted out of loop)
	const getBrandName = db.prepare('SELECT name FROM brands WHERE id = ?');

	// FTS5 rebuild after import (external content table requires 'rebuild' instead of per-row delete/insert)
	const rebuildFTS = db.prepare("INSERT INTO products_fts(products_fts) VALUES('rebuild')");

	const transaction = db.transaction(() => {
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowNum = i + 2; // +2 because header is row 1, data starts at row 2

			// Required: name
			if (!row.name?.trim()) {
				errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
				continue;
			}

			// Resolve brand
			const brandSlug = row.brand_slug?.trim();
			if (!brandSlug) {
				errors.push({ row: rowNum, field: 'brand_slug', message: 'Brand slug is required' });
				continue;
			}
			const brand = findBrandBySlug.get(brandSlug) as { id: number } | undefined;
			if (!brand) {
				errors.push({ row: rowNum, field: 'brand_slug', message: `Brand "${brandSlug}" not found` });
				continue;
			}

			// Resolve category (optional)
			let categoryId: number | null = null;
			if (row.category_slug?.trim()) {
				const cat = findCategoryBySlug.get(row.category_slug.trim()) as { id: number } | undefined;
				if (!cat) {
					errors.push({ row: rowNum, field: 'category_slug', message: `Category "${row.category_slug}" not found` });
					continue;
				}
				categoryId = cat.id;
			}

			// Price: input in rubles → store in kopecks
			const priceRub = parseFloat(row.price || '0');
			if (isNaN(priceRub) || priceRub < 0) {
				errors.push({ row: rowNum, field: 'price', message: 'Invalid price' });
				continue;
			}
			const priceKopecks = Math.round(priceRub * 100);

			const slug = row.slug?.trim() || generateSlug(row.name.trim());
			const sku = row.sku?.trim() || null;

			const data = {
				slug,
				brand_id: brand.id,
				category_id: categoryId,
				name: row.name.trim(),
				sku,
				price: priceKopecks,
				price_note: row.price_note?.trim() || null,
				availability_status: row.availability_status?.trim() || 'in-stock',
				description: row.description?.trim() || null,
				specs_json: row.specs_json?.trim() || null,
				is_active: row.is_active === '0' ? 0 : 1,
				is_featured: row.is_featured === '1' ? 1 : 0,
				is_new: row.is_new === '1' ? 1 : 0,
				is_limited: row.is_limited === '1' ? 1 : 0,
				position: parseInt(row.position || '0') || 0
			};

			// Upsert by SKU (primary) or slug (fallback)
			let existing: { id: number } | undefined;
			if (sku) {
				existing = findProductBySku.get(sku) as { id: number } | undefined;
			}
			if (!existing) {
				existing = findProductBySlug.get(slug) as { id: number } | undefined;
			}

			let productId: number;

			if (existing) {
				updateProduct.run({ ...data, id: existing.id });
				productId = existing.id;
				updated++;
			} else {
				const result = insertProduct.run(data);
				productId = result.lastInsertRowid as number;
				added++;
			}

			// Images: main_image and gallery_images (pipe-separated URLs)
			// Only touch images if CSV explicitly provides at least one image value.
			// Empty fields mean "don't change existing images" — NOT "delete all images".
			const hasMainImage = row.main_image?.trim();
			const hasGalleryImages = row.gallery_images?.trim();

			if (hasMainImage || hasGalleryImages) {
				deleteProductImages.run(productId);
				let imgPos = 0;

				if (hasMainImage) {
					const url = row.main_image.trim();
					const thumbUrl = url.replace(/\.webp$/, '-thumb.webp');
					insertImage.run(productId, url, thumbUrl, row.name.trim(), imgPos, 1);
					imgPos++;
				}

				if (hasGalleryImages) {
					const urls = row.gallery_images.split('|').map((u) => u.trim()).filter(Boolean);
					for (const url of urls) {
						const thumbUrl = url.replace(/\.webp$/, '-thumb.webp');
						insertImage.run(productId, url, thumbUrl, row.name.trim(), imgPos, 0);
						imgPos++;
					}
				}
			}
		}

		// Rebuild FTS5 index after all product changes (external content table)
		rebuildFTS.run();
	});

	transaction();
	return { added, updated, errors };
}
