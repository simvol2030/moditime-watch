import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const listProducts = db.prepare(`
	SELECT p.*, b.name as brand_name, c.name as category_name
	FROM products p
	JOIN brands b ON p.brand_id = b.id
	LEFT JOIN categories c ON p.category_id = c.id
	ORDER BY p.position, p.name
`);
const deleteProduct = db.prepare('DELETE FROM products WHERE id = ?');

export const load: PageServerLoad = async () => {
	const products = listProducts.all() as Product[];
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
			deleteProduct.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete product' });
		}
	}
};
