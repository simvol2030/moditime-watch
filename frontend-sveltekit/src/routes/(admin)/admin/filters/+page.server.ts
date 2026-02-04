import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface FilterAttribute {
	id: number;
	slug: string;
	name: string;
	type: string;
	is_active: number;
	position: number;
	values_count: number;
}

export const load: PageServerLoad = async () => {
	const filters = db.prepare(`
		SELECT fa.*, COUNT(fv.id) as values_count
		FROM filter_attributes fa
		LEFT JOIN filter_values fv ON fv.attribute_id = fa.id
		GROUP BY fa.id
		ORDER BY fa.position
	`).all() as FilterAttribute[];

	return { filters };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) {
			return fail(400, { error: 'Filter ID is required' });
		}

		try {
			const deleteFilter = db.transaction(() => {
				// Clean up product_filters referencing these values
				db.prepare(`
					DELETE FROM product_filters WHERE filter_value_id IN (
						SELECT id FROM filter_values WHERE attribute_id = ?
					)
				`).run(id);
				db.prepare('DELETE FROM filter_values WHERE attribute_id = ?').run(id);
				db.prepare('DELETE FROM filter_attributes WHERE id = ?').run(id);
			});
			deleteFilter();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete filter' });
		}
	},

	move: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) {
			return fail(400, { error: 'ID and direction are required' });
		}

		try {
			const current = db.prepare('SELECT * FROM filter_attributes WHERE id = ?').get(id) as FilterAttribute | undefined;
			if (!current) return fail(404, { error: 'Filter not found' });

			const sibling = db.prepare(`
				SELECT * FROM filter_attributes
				WHERE position ${direction === 'up' ? '<' : '>'} ?
				ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				LIMIT 1
			`).get(current.position) as FilterAttribute | undefined;

			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE filter_attributes SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE filter_attributes SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move filter' });
		}
	}
};
