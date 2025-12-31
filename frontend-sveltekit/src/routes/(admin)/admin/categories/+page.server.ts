import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface Category {
	id: number;
	slug: string;
	name: string;
	parent_id: number | null;
	parent_name: string | null;
	is_active: number;
	position: number;
}

const listCategories = db.prepare(`
	SELECT c.*, p.name as parent_name
	FROM categories c
	LEFT JOIN categories p ON c.parent_id = p.id
	ORDER BY c.position, c.name
`);
const deleteCategory = db.prepare('DELETE FROM categories WHERE id = ?');

export const load: PageServerLoad = async () => {
	const categories = listCategories.all() as Category[];
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
			deleteCategory.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete category' });
		}
	}
};
