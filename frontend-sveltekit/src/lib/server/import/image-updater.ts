// Image Updater: match ZIP images to existing products by filename
// Used in "ZIP-only" mode — updates images for existing products without CSV

import { db } from '$lib/server/db/database';
import { resolveGalleryFromZip } from './zip-handler';

export interface ImageMatch {
	filename: string;
	productId: number;
	productName: string;
	productSku: string;
	matchedBy: 'sku' | 'slug' | 'id';
	isGallery: boolean;
	parentFilename?: string;
}

export interface ImageMatchResult {
	matched: ImageMatch[];
	unmatched: string[];
}

export interface ImageUpdateResult {
	updated: number;
	errors: string[];
}

/**
 * Match image filenames to existing products in DB.
 * Tries: SKU match, slug match.
 * Handles gallery suffixes (_2, _3).
 */
export function matchImagesToProducts(filenames: string[]): ImageMatchResult {
	const findProductBySku = db.prepare('SELECT id, name, sku, slug FROM products WHERE sku = ?');
	const findProductBySlug = db.prepare('SELECT id, name, sku, slug FROM products WHERE slug = ?');

	const matched: ImageMatch[] = [];
	const unmatched: string[] = [];

	// Gallery: filename contains _2, _3, _02, _03 suffix before extension
	const galleryPattern = /^(.+?)_(\d+)\.[^.]+$/;

	function findProductMatch(basename: string): { id: number; name: string; sku: string; slug: string; matchedBy: 'sku' | 'slug' | 'id' } | null {
		// 1. Try SKU match (exact)
		let product = findProductBySku.get(basename) as { id: number; name: string; sku: string; slug: string } | undefined;
		if (product) return { ...product, matchedBy: 'sku' };

		// 2. Try SKU match with dots (e.g., T035.617.11.051.00)
		product = findProductBySku.get(basename.replace(/_/g, '.')) as typeof product;
		if (product) return { ...product, matchedBy: 'sku' };

		// 3. Try slug match (exact)
		product = findProductBySlug.get(basename) as typeof product;
		if (product) return { ...product, matchedBy: 'slug' };

		// 4. Try slug match (lowercase, hyphens)
		const slugified = basename.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
		if (slugified !== basename) {
			product = findProductBySlug.get(slugified) as typeof product;
			if (product) return { ...product, matchedBy: 'slug' };
		}

		return null;
	}

	for (const filename of filenames) {
		const basename = filename.replace(/\.[^.]+$/, ''); // strip extension
		const galleryMatch = filename.match(galleryPattern);

		if (galleryMatch) {
			// This is a gallery image — will be handled when its parent is matched
			continue;
		}

		// Try matching as main image
		const product = findProductMatch(basename);

		if (product) {
			matched.push({
				filename,
				productId: product.id,
				productName: product.name,
				productSku: product.sku || '',
				matchedBy: product.matchedBy,
				isGallery: false
			});
		} else {
			unmatched.push(filename);
		}
	}

	// Now handle gallery images
	for (const filename of filenames) {
		const galleryMatch = filename.match(galleryPattern);
		if (!galleryMatch) continue;

		const parentBase = galleryMatch[1];
		const parentMatched = matched.find(m => {
			const mBase = m.filename.replace(/\.[^.]+$/, '');
			return mBase === parentBase;
		});

		if (parentMatched) {
			matched.push({
				filename,
				productId: parentMatched.productId,
				productName: parentMatched.productName,
				productSku: parentMatched.productSku,
				matchedBy: parentMatched.matchedBy,
				isGallery: true,
				parentFilename: parentMatched.filename
			});
		} else {
			unmatched.push(filename);
		}
	}

	return { matched, unmatched };
}

/**
 * Update product images from matched ZIP files.
 * Replaces all existing images for matched products.
 */
export function updateProductImages(
	matches: ImageMatch[],
	imageMap: Map<string, string>,
	thumbMap: Map<string, string>
): ImageUpdateResult {
	const deleteProductImages = db.prepare('DELETE FROM product_images WHERE product_id = ?');
	const insertProductImage = db.prepare(
		'INSERT INTO product_images (product_id, url, thumbnail_url, alt, position, is_main) VALUES (?, ?, ?, ?, ?, ?)'
	);

	let updated = 0;
	const errors: string[] = [];

	// Group by product
	const byProduct = new Map<number, ImageMatch[]>();
	for (const match of matches) {
		const existing = byProduct.get(match.productId) || [];
		existing.push(match);
		byProduct.set(match.productId, existing);
	}

	const transaction = db.transaction(() => {
		for (const [productId, images] of byProduct) {
			// Sort: main first, then gallery by suffix number
			const sorted = images.sort((a, b) => {
				if (a.isGallery !== b.isGallery) return a.isGallery ? 1 : -1;
				return a.filename.localeCompare(b.filename);
			});

			// Delete existing images for this product
			deleteProductImages.run(productId);

			let position = 0;
			for (const img of sorted) {
				const url = imageMap.get(img.filename) || imageMap.get(img.filename.replace(/\.[^.]+$/, ''));
				if (!url) {
					errors.push(`No processed URL for ${img.filename}`);
					continue;
				}
				const thumbUrl = thumbMap.get(img.filename) || thumbMap.get(img.filename.replace(/\.[^.]+$/, '')) || url.replace(/\.webp$/, '-thumb.webp');
				const isMain = !img.isGallery ? 1 : 0;

				insertProductImage.run(productId, url, thumbUrl, img.productName, position, isMain);
				position++;
			}
			updated++;
		}
	});

	transaction();
	return { updated, errors };
}
