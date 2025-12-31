import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';
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

const listBrands = db.prepare('SELECT * FROM brands ORDER BY position, name');
const deleteBrand = db.prepare('DELETE FROM brands WHERE id = ?');

export const load: PageServerLoad = async () => {
	const brands = listBrands.all() as Brand[];
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
			deleteBrand.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete brand' });
		}
	}
};
