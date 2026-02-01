import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

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
	}
};
