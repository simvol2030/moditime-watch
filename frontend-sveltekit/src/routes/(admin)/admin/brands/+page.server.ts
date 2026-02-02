import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

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
	},

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const idsJson = formData.get('ids')?.toString();
		if (!idsJson) return fail(400, { error: 'No IDs provided' });

		try {
			const ids = JSON.parse(idsJson) as number[];
			const reorder = db.transaction(() => {
				for (let i = 0; i < ids.length; i++) {
					queries.reorderBrand.run({ id: ids[i], position: i + 1 });
				}
			});
			reorder();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reorder brands' });
		}
	}
};
