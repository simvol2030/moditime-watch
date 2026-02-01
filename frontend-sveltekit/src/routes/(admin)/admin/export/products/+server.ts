import { db } from '$lib/server/db/database';
import { generateCSV } from '$lib/server/import/csv-parser';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const products = db.prepare(`
		SELECT p.slug, b.slug as brand_slug, c.slug as category_slug,
			p.name, p.sku, p.price / 100.0 as price, p.price_note,
			p.availability_status, p.description, p.specs_json,
			p.is_active, p.is_featured, p.is_new, p.is_limited, p.position,
			(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image,
			(SELECT GROUP_CONCAT(url, '|') FROM product_images WHERE product_id = p.id AND is_main = 0 ORDER BY position) as gallery_images
		FROM products p
		JOIN brands b ON b.id = p.brand_id
		LEFT JOIN categories c ON c.id = p.category_id
		ORDER BY p.position
	`).all() as Record<string, any>[];

	const headers = [
		'slug', 'brand_slug', 'category_slug', 'name', 'sku', 'price', 'price_note',
		'availability_status', 'description', 'specs_json',
		'is_active', 'is_featured', 'is_new', 'is_limited', 'position',
		'main_image', 'gallery_images'
	];

	const rows = products.map((p) => {
		const row: Record<string, string> = {};
		for (const h of headers) {
			row[h] = p[h] != null ? String(p[h]) : '';
		}
		return row;
	});

	const csv = generateCSV(headers, rows);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="products-export.csv"'
		}
	});
};
