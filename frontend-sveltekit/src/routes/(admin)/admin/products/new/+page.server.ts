import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const brands = queries.adminSelectActiveBrands.all() as { id: number; name: string }[];
	const categories = queries.adminSelectActiveCategories.all() as { id: number; name: string }[];
	const result = queries.adminGetMaxProductPosition.get() as { next_position: number };
	return { brands, categories, nextPosition: result.next_position };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

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
			queries.adminCreateProduct.run({
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
			return fail(500, { error: 'Failed to create product' });
		}

		throw redirect(302, '/admin/products');
	}
};
