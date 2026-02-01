import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface Product {
	id: number;
	slug: string;
	name: string;
	brand_id: number;
	category_id: number | null;
	sku: string | null;
	price: number;
	price_note: string | null;
	availability_status: string;
	description: string | null;
	is_active: number;
	is_featured: number;
	is_new: number;
	is_limited: number;
	position: number;
}

export const load: PageServerLoad = async ({ params }) => {
	const product = queries.adminGetProduct.get(Number(params.id)) as Product | undefined;

	if (!product) {
		throw error(404, 'Product not found');
	}

	const brands = queries.adminSelectActiveBrands.all() as { id: number; name: string }[];
	const categories = queries.adminSelectActiveCategories.all() as { id: number; name: string }[];
	const options = queries.getProductOptions.all(Number(params.id)) as any[];

	return { product, brands, categories, options };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

		const name = formData.get('name')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const brand_id = formData.get('brand_id')?.toString() || '';
		const category_id = formData.get('category_id')?.toString() || '';
		const sku = formData.get('sku')?.toString() || '';
		const price = formData.get('price')?.toString() || '0';
		const price_note = formData.get('price_note')?.toString() || '';
		const availability_status = formData.get('availability_status')?.toString() || 'in-stock';
		const description = formData.get('description')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const is_featured = formData.get('is_featured') ? 1 : 0;
		const is_new = formData.get('is_new') ? 1 : 0;
		const is_limited = formData.get('is_limited') ? 1 : 0;
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		if (!name || !slug || !brand_id) {
			return fail(400, {
				error: 'Name, slug, and brand are required',
				data: {
					name, slug, brand_id, category_id, sku, price, price_note,
					availability_status, description, is_active, is_featured, is_new, is_limited, position
				}
			});
		}

		try {
			queries.adminUpdateProduct.run({
				id,
				slug,
				name,
				brand_id: parseInt(brand_id, 10),
				category_id: category_id ? parseInt(category_id, 10) : null,
				sku: sku || null,
				price: parseInt(price, 10) * 100, // Convert to kopecks
				price_note: price_note || null,
				availability_status,
				description: description || null,
				is_active,
				is_featured,
				is_new,
				is_limited,
				position
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'A product with this slug or SKU already exists',
					data: {
						name, slug, brand_id, category_id, sku, price, price_note,
						availability_status, description, is_active, is_featured, is_new, is_limited, position
					}
				});
			}
			return fail(500, { error: 'Failed to update product' });
		}

		throw redirect(302, '/admin/products');
	}
};
