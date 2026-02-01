import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import { canDelete } from '$lib/server/auth';

interface Brand {
	id: number;
	slug: string;
	name: string;
	country: string;
	founded_year: number | null;
	is_active: number;
	position: number;
	created_at: string;
}

export const load: PageServerLoad = async () => {
	const brands = queries.adminListBrands.all() as Brand[];
	return { brands };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Brand ID is required' });
		}

		try {
			queries.adminDeleteBrand.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete brand' });
		}
	}
};
