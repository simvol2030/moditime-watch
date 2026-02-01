import { db } from '$lib/server/db/database';
import type { ImportResult, ImportError } from './types';

export function importCityArticles(rows: Record<string, string>[]): ImportResult {
	const errors: ImportError[] = [];
	let added = 0;
	let updated = 0;

	const findCityBySlug = db.prepare('SELECT id FROM cities WHERE slug = ?');
	const findArticle = db.prepare('SELECT id FROM city_articles WHERE city_id = ? AND slug = ?');

	const insert = db.prepare(`
		INSERT INTO city_articles (city_id, slug, title, excerpt, content, image_url,
			template_type, is_published, source_file, imported_at)
		VALUES (@city_id, @slug, @title, @excerpt, @content, @image_url,
			@template_type, @is_published, @source_file, CURRENT_TIMESTAMP)
	`);

	const update = db.prepare(`
		UPDATE city_articles SET
			title = @title, excerpt = @excerpt, content = @content, image_url = @image_url,
			template_type = @template_type, is_published = @is_published,
			source_file = @source_file, imported_at = CURRENT_TIMESTAMP,
			updated_at = CURRENT_TIMESTAMP
		WHERE id = @id
	`);

	const transaction = db.transaction(() => {
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowNum = i + 2;

			// Resolve city
			const citySlug = row.city_slug?.trim();
			if (!citySlug) {
				errors.push({ row: rowNum, field: 'city_slug', message: 'City slug is required' });
				continue;
			}
			const city = findCityBySlug.get(citySlug) as { id: number } | undefined;
			if (!city) {
				errors.push({ row: rowNum, field: 'city_slug', message: `City "${citySlug}" not found` });
				continue;
			}

			if (!row.slug?.trim()) {
				errors.push({ row: rowNum, field: 'slug', message: 'Article slug is required' });
				continue;
			}
			if (!row.title?.trim()) {
				errors.push({ row: rowNum, field: 'title', message: 'Title is required' });
				continue;
			}

			const data = {
				city_id: city.id,
				slug: row.slug.trim(),
				title: row.title.trim(),
				excerpt: row.excerpt?.trim() || null,
				content: row.content?.trim() || null,
				image_url: row.image_url?.trim() || null,
				template_type: row.template_type?.trim() || 'standard',
				is_published: row.is_published === '0' ? 0 : 1,
				source_file: row.source_file?.trim() || 'csv-import'
			};

			const existing = findArticle.get(city.id, data.slug) as { id: number } | undefined;

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
