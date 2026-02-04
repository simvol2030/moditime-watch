import { db } from '$lib/server/db/database';
import { generateCSV } from '$lib/server/import/csv-parser';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const filters = db.prepare(`
		SELECT fa.slug as attribute_slug, fa.name as attribute_name, fa.type as attribute_type, fa.position as attribute_position,
			fv.value, fv.label, fv.position
		FROM filter_values fv
		JOIN filter_attributes fa ON fa.id = fv.attribute_id
		ORDER BY fa.position, fv.position
	`).all() as Record<string, any>[];

	const headers = ['attribute_slug', 'attribute_name', 'attribute_type', 'attribute_position', 'value', 'label', 'position'];

	const rows = filters.map((f) => {
		const row: Record<string, string> = {};
		for (const h of headers) {
			row[h] = f[h] != null ? String(f[h]) : '';
		}
		return row;
	});

	const csv = generateCSV(headers, rows);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': 'attachment; filename="filters-export.csv"'
		}
	});
};
