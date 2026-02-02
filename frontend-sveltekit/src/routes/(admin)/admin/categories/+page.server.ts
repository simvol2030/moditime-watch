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

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const idsJson = formData.get('ids')?.toString();
		if (!idsJson) return fail(400, { error: 'No IDs provided' });

		try {
			const ids = JSON.parse(idsJson) as number[];
			const reorder = db.transaction(() => {
				for (let i = 0; i < ids.length; i++) {
					queries.reorderCategory.run({ id: ids[i], position: i + 1 });
				}
			});
			reorder();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reorder categories' });
		}
	}
};
