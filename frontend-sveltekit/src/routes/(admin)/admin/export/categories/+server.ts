import { db } from '$lib/server/db/database';
import { generateCSV } from '$lib/server/import/csv-parser';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const categories = db.prepare(`
		SELECT c.slug, c.name, c.description, p.slug as parent_slug, c.image_url, c.is_active, c.position
		FROM categories c
		LEFT JOIN categories p ON p.id = c.parent_id
		ORDER BY c.position
	`).all() as Record<string, any>[];

	const headers = ['slug', 'name', 'description', 'parent_slug', 'image_url', 'is_active', 'position'];

	const rows = categories.map((c) => {
		const row: Record<string, string> = {};
		for (const h of headers) {
			row[h] = c[h] != null ? String(c[h]) : '';
		}
		return row;
	});

	const csv = generateCSV(headers, rows);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="categories-export.csv"'
		}
	});
};
