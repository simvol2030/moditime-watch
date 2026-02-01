import { db } from '$lib/server/db/database';
import type { ImportResult, ImportError } from './types';

export function importCities(rows: Record<string, string>[]): ImportResult {
	const errors: ImportError[] = [];
	let added = 0;
	let updated = 0;

	const findBySlug = db.prepare('SELECT id FROM cities WHERE slug = ?');

	const insert = db.prepare(`
		INSERT INTO cities (slug, name, name_genitive, name_prepositional, name_dative, name_accusative,
			region, population, timezone, delivery_days, delivery_price,
			hero_image_url, hero_title, hero_subtitle, meta_description, is_active, priority)
		VALUES (@slug, @name, @name_genitive, @name_prepositional, @name_dative, @name_accusative,
			@region, @population, @timezone, @delivery_days, @delivery_price,
			@hero_image_url, @hero_title, @hero_subtitle, @meta_description, @is_active, @priority)
	`);

	const update = db.prepare(`
		UPDATE cities SET
			name = @name, name_genitive = @name_genitive, name_prepositional = @name_prepositional,
			name_dative = @name_dative, name_accusative = @name_accusative,
			region = @region, population = @population, timezone = @timezone,
			delivery_days = @delivery_days, delivery_price = @delivery_price,
			hero_image_url = @hero_image_url, hero_title = @hero_title, hero_subtitle = @hero_subtitle,
			meta_description = @meta_description, is_active = @is_active, priority = @priority,
			updated_at = CURRENT_TIMESTAMP
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
				name_genitive: row.name_genitive?.trim() || null,
				name_prepositional: row.name_prepositional?.trim() || null,
				name_dative: row.name_dative?.trim() || null,
				name_accusative: row.name_accusative?.trim() || null,
				region: row.region?.trim() || null,
				population: parseInt(row.population || '') || null,
				timezone: row.timezone?.trim() || null,
				delivery_days: parseInt(row.delivery_days || '3') || 3,
				delivery_price: row.delivery_price?.trim() || 'Бесплатно',
				hero_image_url: row.hero_image_url?.trim() || null,
				hero_title: row.hero_title?.trim() || null,
				hero_subtitle: row.hero_subtitle?.trim() || null,
				meta_description: row.meta_description?.trim() || null,
				is_active: row.is_active === '0' ? 0 : 1,
				priority: parseInt(row.priority || '0') || 0
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
