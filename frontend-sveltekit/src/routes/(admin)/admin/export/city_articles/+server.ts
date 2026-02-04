import { db } from '$lib/server/db/database';
import { generateCSV } from '$lib/server/import/csv-parser';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const articles = db.prepare(`
		SELECT c.slug as city_slug, ca.slug, ca.title, ca.excerpt, ca.content, ca.image_url,
			ca.template_type, ca.is_published, ca.source_file
		FROM city_articles ca
		JOIN cities c ON c.id = ca.city_id
		ORDER BY c.name, ca.title
	`).all() as Record<string, any>[];

	const headers = ['city_slug', 'slug', 'title', 'excerpt', 'content', 'image_url', 'template_type', 'is_published', 'source_file'];

	const rows = articles.map((a) => {
		const row: Record<string, string> = {};
		for (const h of headers) {
			row[h] = a[h] != null ? String(a[h]) : '';
		}
		return row;
	});

	const csv = generateCSV(headers, rows);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="city-articles-export.csv"'
		}
	});
};
