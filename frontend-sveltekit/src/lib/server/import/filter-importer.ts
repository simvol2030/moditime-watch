import { db } from '$lib/server/db/database';
import type { ImportResult, ImportError } from './types';

export function importFilters(rows: Record<string, string>[]): ImportResult {
	const errors: ImportError[] = [];
	let added = 0;
	let updated = 0;

	const findAttrBySlug = db.prepare('SELECT id FROM filter_attributes WHERE slug = ?');
	const findValue = db.prepare('SELECT id FROM filter_values WHERE attribute_id = ? AND value = ?');

	const insertAttr = db.prepare(`
		INSERT INTO filter_attributes (slug, name, type, is_active, position)
		VALUES (@slug, @name, @type, 1, @position)
	`);

	const insertValue = db.prepare(`
		INSERT INTO filter_values (attribute_id, value, label, position)
		VALUES (@attribute_id, @value, @label, @position)
	`);

	const updateValue = db.prepare(`
		UPDATE filter_values SET label = @label, position = @position WHERE id = @id
	`);

	const transaction = db.transaction(() => {
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			const rowNum = i + 2;

			if (!row.attribute_slug?.trim()) {
				errors.push({ row: rowNum, field: 'attribute_slug', message: 'Attribute slug is required' });
				continue;
			}
			if (!row.value?.trim()) {
				errors.push({ row: rowNum, field: 'value', message: 'Value is required' });
				continue;
			}
			if (!row.label?.trim()) {
				errors.push({ row: rowNum, field: 'label', message: 'Label is required' });
				continue;
			}

			// Find or create attribute
			let attr = findAttrBySlug.get(row.attribute_slug.trim()) as { id: number } | undefined;
			if (!attr) {
				if (!row.attribute_name?.trim()) {
					errors.push({ row: rowNum, field: 'attribute_name', message: 'Attribute name is required for new attributes' });
					continue;
				}
				insertAttr.run({
					slug: row.attribute_slug.trim(),
					name: row.attribute_name.trim(),
					type: row.attribute_type?.trim() || 'checkbox',
					position: parseInt(row.attribute_position || '0') || 0
				});
				attr = findAttrBySlug.get(row.attribute_slug.trim()) as { id: number };
			}

			const valueData = {
				attribute_id: attr.id,
				value: row.value.trim(),
				label: row.label.trim(),
				position: parseInt(row.position || '0') || 0
			};

			const existing = findValue.get(attr.id, valueData.value) as { id: number } | undefined;

			if (existing) {
				updateValue.run({ ...valueData, id: existing.id });
				updated++;
			} else {
				insertValue.run(valueData);
				added++;
			}
		}
	});

	transaction();
	return { added, updated, errors };
}
