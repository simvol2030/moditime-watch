import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

interface Category {
	id: number;
	slug: string;
	name: string;
	parent_id: number | null;
	parent_name: string | null;
	is_active: number;
	position: number;
}

export const load: PageServerLoad = async () => {
	const categories = queries.adminListCategories.all() as Category[];
	return { categories };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Category ID is required' });
		}

		try {
			queries.adminDeleteCategory.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete category' });
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
			const current = db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
			if (!current) return fail(404, { error: 'Category not found' });

			// Find sibling at the same level (same parent_id)
			const sibling = db.prepare(`
				SELECT * FROM categories
				WHERE position ${direction === 'up' ? '<' : '>'} ?
				AND ${current.parent_id ? 'parent_id = ?' : 'parent_id IS NULL'}
				ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				LIMIT 1
			`).get(current.position, ...(current.parent_id ? [current.parent_id] : [])) as Category | undefined;

			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE categories SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE categories SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move category' });
		}
	}
};
