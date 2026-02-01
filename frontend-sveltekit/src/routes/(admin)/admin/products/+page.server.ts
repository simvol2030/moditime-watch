import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface Product {
	id: number;
	slug: string;
	name: string;
	brand_id: number;
	brand_name: string;
	category_id: number | null;
	category_name: string | null;
	price: number;
	is_active: number;
	is_featured: number;
	position: number;
}

export const load: PageServerLoad = async () => {
	const products = queries.adminListProducts.all() as Product[];
	return { products };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Product ID is required' });
		}

		try {
			queries.adminDeleteProduct.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete product' });
		}
	}
};
