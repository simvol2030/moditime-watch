import { db } from '$lib/server/db/database';
import { generateCSV } from '$lib/server/import/csv-parser';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const cities = db.prepare(`
		SELECT slug, name, name_genitive, name_prepositional, name_dative, name_accusative,
			region, population, timezone, delivery_days, delivery_price,
			hero_image_url, hero_title, hero_subtitle, meta_description, is_active, priority
		FROM cities ORDER BY priority DESC, name
	`).all() as Record<string, any>[];

	const headers = [
		'slug', 'name', 'name_genitive', 'name_prepositional', 'name_dative', 'name_accusative',
		'region', 'population', 'timezone', 'delivery_days', 'delivery_price',
		'hero_image_url', 'hero_title', 'hero_subtitle', 'meta_description', 'is_active', 'priority'
	];

	const rows = cities.map((c) => {
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
			'Content-Disposition': 'attachment; filename="cities-export.csv"'
		}
	});
};
