import { db } from '$lib/server/db/database';
import { generateCSV } from '$lib/server/import/csv-parser';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const brands = db.prepare(`
		SELECT slug, name, description, logo_url, country, founded_year, website_url, is_active, position
		FROM brands ORDER BY position
	`).all() as Record<string, any>[];

	const headers = ['slug', 'name', 'description', 'logo_url', 'country', 'founded_year', 'website_url', 'is_active', 'position'];

	const rows = brands.map((b) => {
		const row: Record<string, string> = {};
		for (const h of headers) {
			row[h] = b[h] != null ? String(b[h]) : '';
		}
		return row;
	});

	const csv = generateCSV(headers, rows);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="brands-export.csv"'
		}
	});
};
