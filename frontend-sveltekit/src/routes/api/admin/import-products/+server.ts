/**
 * Products CSV Import API Endpoint
 *
 * POST /api/admin/import-products
 * Body: FormData with 'file' (CSV), 'mode' ('create' | 'update')
 *
 * Requires admin session (checked via hook)
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/database';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

interface CsvRow {
	slug: string;
	brand_slug: string;
	category_slug: string;
	name: string;
	sku: string;
	price: string;
	availability_status: string;
	availability_text: string;
	description: string;
	is_active: string;
	is_featured: string;
	is_new: string;
	is_limited: string;
	image_urls: string;
	specs_json: string;
	material: string;
	movement: string;
	style: string;
}

interface ImportResult {
	success: boolean;
	created: number;
	updated: number;
	skipped: number;
	errors: string[];
}

// Parse CSV line handling quoted fields
function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		const nextChar = line[i + 1];

		if (char === '"') {
			if (inQuotes && nextChar === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === ',' && !inQuotes) {
			values.push(current.trim());
			current = '';
		} else {
			current += char;
		}
	}

	values.push(current.trim());
	return values;
}

// Parse CSV content
function parseCsv(content: string): CsvRow[] {
	const lines = content.split('\n');
	const rows: CsvRow[] = [];
	let headers: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;

		const values = parseCsvLine(trimmed);

		if (headers.length === 0) {
			headers = values;
			continue;
		}

		const row: Record<string, string> = {};
		headers.forEach((header, index) => {
			row[header] = values[index] || '';
		});

		rows.push(row as unknown as CsvRow);
	}

	return rows;
}

// Validate row
function validateRow(row: CsvRow, rowIndex: number): string[] {
	const errors: string[] = [];
	const prefix = `Row ${rowIndex + 1}`;

	if (!row.slug) errors.push(`${prefix}: slug is required`);
	if (!row.brand_slug) errors.push(`${prefix}: brand_slug is required`);
	if (!row.name) errors.push(`${prefix}: name is required`);
	if (!row.price) errors.push(`${prefix}: price is required`);

	if (row.slug && !/^[a-z0-9-]+$/.test(row.slug)) {
		errors.push(`${prefix}: slug must be lowercase alphanumeric with dashes`);
	}

	const price = parseFloat(row.price);
	if (isNaN(price) || price <= 0) {
		errors.push(`${prefix}: price must be a positive number`);
	}

	const validStatuses = ['in-stock', 'pre-order', 'waitlist'];
	if (row.availability_status && !validStatuses.includes(row.availability_status)) {
		errors.push(`${prefix}: availability_status must be one of: ${validStatuses.join(', ')}`);
	}

	if (row.specs_json && row.specs_json !== '{}') {
		try {
			JSON.parse(row.specs_json);
		} catch {
			errors.push(`${prefix}: specs_json is not valid JSON`);
		}
	}

	return errors;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check admin authentication (simplified - in production use proper session check)
	// This endpoint should be protected by hooks.server.ts or AdminJS auth

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File | null;
		const mode = formData.get('mode') as string || 'create';

		if (!file) {
			throw error(400, 'No file uploaded');
		}

		if (!file.name.endsWith('.csv')) {
			throw error(400, 'File must be a CSV');
		}

		// Read file content
		const content = await file.text();
		const cleanContent = content.replace(/^\uFEFF/, ''); // Remove BOM

		const rows = parseCsv(cleanContent);

		if (rows.length === 0) {
			throw error(400, 'No data rows found in CSV');
		}

		const result: ImportResult = {
			success: false,
			created: 0,
			updated: 0,
			skipped: 0,
			errors: []
		};

		// Validate all rows
		rows.forEach((row, index) => {
			const rowErrors = validateRow(row, index);
			result.errors.push(...rowErrors);
		});

		if (result.errors.length > 0) {
			return json({
				success: false,
				message: 'Validation failed',
				...result
			}, { status: 400 });
		}

		// Prepare statements
		const getBrandBySlug = db.prepare('SELECT id, slug FROM brands WHERE slug = ?');
		const getCategoryBySlug = db.prepare('SELECT id, slug FROM categories WHERE slug = ?');
		const getProductBySlug = db.prepare('SELECT id, slug FROM products WHERE slug = ?');
		const getFilterValue = db.prepare(`
			SELECT fv.id, fv.attribute_id, fv.value
			FROM filter_values fv
			JOIN filter_attributes fa ON fa.id = fv.attribute_id
			WHERE fa.slug = ? AND fv.value = ?
		`);

		const insertBrand = db.prepare(`
			INSERT OR IGNORE INTO brands (slug, name, is_active, created_at, updated_at)
			VALUES (?, ?, 1, datetime('now'), datetime('now'))
		`);

		const insertProduct = db.prepare(`
			INSERT INTO products (
				slug, brand_id, category_id, name, sku, price,
				availability_status, availability_text, description,
				is_active, is_featured, is_new, is_limited, specs_json,
				created_at, updated_at
			) VALUES (
				?, ?, ?, ?, ?, ?,
				?, ?, ?,
				?, ?, ?, ?, ?,
				datetime('now'), datetime('now')
			)
		`);

		const updateProduct = db.prepare(`
			UPDATE products SET
				brand_id = ?, category_id = ?, name = ?, sku = ?, price = ?,
				availability_status = ?, availability_text = ?, description = ?,
				is_active = ?, is_featured = ?, is_new = ?, is_limited = ?, specs_json = ?,
				updated_at = datetime('now')
			WHERE slug = ?
		`);

		const insertImage = db.prepare(`
			INSERT INTO product_images (product_id, url, position, is_main, created_at)
			VALUES (?, ?, ?, ?, datetime('now'))
		`);

		const deleteProductImages = db.prepare('DELETE FROM product_images WHERE product_id = ?');

		const insertProductFilter = db.prepare(`
			INSERT OR IGNORE INTO product_filters (product_id, filter_value_id)
			VALUES (?, ?)
		`);

		const deleteProductFilters = db.prepare('DELETE FROM product_filters WHERE product_id = ?');

		// Process in transaction
		const updateMode = mode === 'update';

		const transaction = db.transaction(() => {
			for (const row of rows) {
				// Get or create brand
				let brandRow = getBrandBySlug.get(row.brand_slug) as { id: number } | undefined;
				if (!brandRow) {
					const brandName = row.brand_slug
						.split('-')
						.map(word => word.charAt(0).toUpperCase() + word.slice(1))
						.join(' ');
					insertBrand.run(row.brand_slug, brandName);
					brandRow = getBrandBySlug.get(row.brand_slug) as { id: number };
				}

				// Get category
				let categoryId: number | null = null;
				if (row.category_slug) {
					const categoryRow = getCategoryBySlug.get(row.category_slug) as { id: number } | undefined;
					if (categoryRow) categoryId = categoryRow.id;
				}

				// Check existing
				const existingProduct = getProductBySlug.get(row.slug) as { id: number } | undefined;

				const priceKopecks = Math.round(parseFloat(row.price) * 100);
				const isActive = row.is_active === '1' || row.is_active === 'true' ? 1 : 0;
				const isFeatured = row.is_featured === '1' || row.is_featured === 'true' ? 1 : 0;
				const isNew = row.is_new === '1' || row.is_new === 'true' ? 1 : 0;
				const isLimited = row.is_limited === '1' || row.is_limited === 'true' ? 1 : 0;

				let productId: number;

				if (existingProduct) {
					if (updateMode) {
						updateProduct.run(
							brandRow.id, categoryId, row.name, row.sku || null, priceKopecks,
							row.availability_status || 'in-stock', row.availability_text || null,
							row.description || null, isActive, isFeatured, isNew, isLimited,
							row.specs_json || '{}', row.slug
						);
						productId = existingProduct.id;
						result.updated++;
					} else {
						result.skipped++;
						continue;
					}
				} else {
					const insertResult = insertProduct.run(
						row.slug, brandRow.id, categoryId, row.name, row.sku || null, priceKopecks,
						row.availability_status || 'in-stock', row.availability_text || null,
						row.description || null, isActive, isFeatured, isNew, isLimited,
						row.specs_json || '{}'
					);
					productId = Number(insertResult.lastInsertRowid);
					result.created++;
				}

				// Handle images
				if (existingProduct && updateMode) {
					deleteProductImages.run(productId);
				}

				if (row.image_urls) {
					const imageUrls = row.image_urls.split(',').map(url => url.trim()).filter(Boolean);
					imageUrls.forEach((url, index) => {
						insertImage.run(productId, url, index, index === 0 ? 1 : 0);
					});
				}

				// Handle filters
				if (existingProduct && updateMode) {
					deleteProductFilters.run(productId);
				}

				const filterMappings: [string, string][] = [
					['material', row.material],
					['movement', row.movement],
					['style', row.style]
				];

				for (const [attrSlug, values] of filterMappings) {
					if (!values) continue;
					const valueList = values.split(',').map(v => v.trim()).filter(Boolean);
					for (const value of valueList) {
						const filterValueRow = getFilterValue.get(attrSlug, value) as { id: number } | undefined;
						if (filterValueRow) {
							insertProductFilter.run(productId, filterValueRow.id);
						}
					}
				}
			}
		});

		try {
			transaction();
			result.success = true;
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			result.errors.push(`Import failed: ${message}`);
		}

		return json({
			success: result.success,
			message: result.success
				? `Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`
				: 'Import failed',
			...result
		});

	} catch (err) {
		console.error('[Import API] Error:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Import failed');
	}
};

// GET - Download template
export const GET: RequestHandler = async () => {
	const template = `# Moditimewatch Products Import Template
# Version: 1.0
#
# Instructions:
# - Save as UTF-8 with BOM (for Excel compatibility)
# - Price in rubles (will be converted to kopecks)
# - Images: comma-separated URLs
# - Filters: comma-separated values (e.g., "gold-18k,mechanical")
# - Leave empty cells for optional fields
#
slug,brand_slug,category_slug,name,sku,price,availability_status,availability_text,description,is_active,is_featured,is_new,is_limited,image_urls,specs_json,material,movement,style
rolex-submariner-example,rolex,mens,Rolex Submariner Example,RS-EXAMPLE,1320000,in-stock,В наличии,"Example product description",1,0,0,0,"","{}",steel,mechanical,sport
`;

	return new Response(template, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="products_template.csv"'
		}
	});
};
