import { db } from '$lib/server/db/database';
import type { ImportResult, ImportError } from './types';

export function importCategories(rows: Record<string, string>[]): ImportResult {
	const errors: ImportError[] = [];
	let added = 0;
	let updated = 0;

	const findBySlug = db.prepare('SELECT id FROM categories WHERE slug = ?');

	const insert = db.prepare(`
		INSERT INTO categories (slug, name, description, parent_id, image_url, is_active, position)
		VALUES (@slug, @name, @description, @parent_id, @image_url, @is_active, @position)
	`);

	const update = db.prepare(`
		UPDATE categories SET
			name = @name, description = @description, parent_id = @parent_id,
			image_url = @image_url, is_active = @is_active, position = @position,
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

			// Resolve parent by slug
			let parentId: number | null = null;
			if (row.parent_slug?.trim()) {
				const parent = findBySlug.get(row.parent_slug.trim()) as { id: number } | undefined;
				if (!parent) {
					errors.push({ row: rowNum, field: 'parent_slug', message: `Parent category "${row.parent_slug}" not found` });
					continue;
				}
				parentId = parent.id;
			}

			const data = {
				slug: row.slug.trim(),
				name: row.name.trim(),
				description: row.description?.trim() || null,
				parent_id: parentId,
				image_url: row.image_url?.trim() || null,
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
