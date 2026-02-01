import { db } from '$lib/server/db/database';
import type { ImportResult, ImportError } from './types';

export function importBrands(rows: Record<string, string>[]): ImportResult {
	const errors: ImportError[] = [];
	let added = 0;
	let updated = 0;

	const findBySlug = db.prepare('SELECT id FROM brands WHERE slug = ?');

	const insert = db.prepare(`
		INSERT INTO brands (slug, name, description, logo_url, country, founded_year, website_url, is_active, position)
		VALUES (@slug, @name, @description, @logo_url, @country, @founded_year, @website_url, @is_active, @position)
	`);

	const update = db.prepare(`
		UPDATE brands SET
			name = @name, description = @description, logo_url = @logo_url,
			country = @country, founded_year = @founded_year, website_url = @website_url,
			is_active = @is_active, position = @position, updated_at = CURRENT_TIMESTAMP
		WHERE id = @id
	`);

	const transaction = db.transaction(() => {
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowNum = i + 2;

			if (!row.slug?.trim()) {
				errors.push({ row: rowNum, field: 'slug', message: 'Slug is required' });
				continue;
			}
			if (!row.name?.trim()) {
				errors.push({ row: rowNum, field: 'name', message: 'Name is required' });
				continue;
			}

			const data = {
				slug: row.slug.trim(),
				name: row.name.trim(),
				description: row.description?.trim() || null,
				logo_url: row.logo_url?.trim() || null,
				country: row.country?.trim() || 'Switzerland',
				founded_year: parseInt(row.founded_year || '') || null,
				website_url: row.website_url?.trim() || null,
				is_active: row.is_active === '0' ? 0 : 1,
				position: parseInt(row.position || '0') || 0
			};

			const existing = findBySlug.get(data.slug) as { id: number } | undefined;

			if (existing) {
				update.run({ ...data, id: existing.id });
				updated++;
			} else {
				insert.run(data);
				added++;
			}
		}
	});

	transaction();
	return { added, updated, errors };
}
