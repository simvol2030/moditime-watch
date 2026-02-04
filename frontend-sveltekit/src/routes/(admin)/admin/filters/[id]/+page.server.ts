import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface FilterAttribute {
	id: number;
	slug: string;
	name: string;
	type: string;
	is_active: number;
	position: number;
}

interface FilterValue {
	id: number;
	attribute_id: number;
	value: string;
	label: string;
	position: number;
}

export const load: PageServerLoad = async ({ params }) => {
	const filter = db.prepare('SELECT * FROM filter_attributes WHERE id = ?').get(Number(params.id)) as FilterAttribute | undefined;

	if (!filter) {
		throw error(404, 'Filter not found');
	}

	const values = db.prepare('SELECT * FROM filter_values WHERE attribute_id = ? ORDER BY position').all(Number(params.id)) as FilterValue[];

	return { filter, values };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

		const name = formData.get('name')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const type = formData.get('type')?.toString() || 'checkbox';
		const is_active = formData.get('is_active') ? 1 : 0;
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required',
				data: { name, slug, type, is_active, position }
			});
		}

		try {
			db.prepare(
				'UPDATE filter_attributes SET slug = ?, name = ?, type = ?, is_active = ?, position = ? WHERE id = ?'
			).run(slug, name, type, is_active, position, id);
		} catch (err: any) {
			if (err.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'A filter with this slug already exists',
					data: { name, slug, type, is_active, position }
				});
			}
			return fail(500, { error: 'Failed to update filter' });
		}

		throw redirect(302, '/admin/filters');
	},

	addValue: async ({ request, params }) => {
		const formData = await request.formData();
		const attributeId = Number(params.id);

		const value = formData.get('value')?.toString() || '';
		const valueLabel = formData.get('label')?.toString() || '';
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		if (!value || !valueLabel) {
			return fail(400, { error: 'Value and label are required' });
		}

		try {
			db.prepare(
				'INSERT INTO filter_values (attribute_id, value, label, position) VALUES (?, ?, ?, ?)'
			).run(attributeId, value, valueLabel, position);
		} catch (err: any) {
			if (err.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'This value already exists for this filter' });
			}
			return fail(500, { error: 'Failed to add value' });
		}

		return { success: true };
	},

	deleteValue: async ({ request }) => {
		const formData = await request.formData();
		const valueId = Number(formData.get('value_id'));

		if (!valueId) {
			return fail(400, { error: 'Value ID is required' });
		}

		try {
			// Also clean up product_filters references
			db.prepare('DELETE FROM product_filters WHERE filter_value_id = ?').run(valueId);
			db.prepare('DELETE FROM filter_values WHERE id = ?').run(valueId);
		} catch {
			return fail(500, { error: 'Failed to delete value' });
		}

		return { success: true };
	},

	moveValue: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) {
			return fail(400, { error: 'ID and direction are required' });
		}

		try {
			const current = db.prepare('SELECT * FROM filter_values WHERE id = ?').get(id) as FilterValue | undefined;
			if (!current) return fail(404, { error: 'Value not found' });

			const sibling = db.prepare(`
				SELECT * FROM filter_values
				WHERE attribute_id = ? AND position ${direction === 'up' ? '<' : '>'} ?
				ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				LIMIT 1
			`).get(current.attribute_id, current.position) as FilterValue | undefined;

			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE filter_values SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE filter_values SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move value' });
		}
	}
};
