import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
const listBrands = db.prepare('SELECT id, name FROM brands WHERE is_active = 1 ORDER BY name');
const listCategories = db.prepare('SELECT id, name FROM categories WHERE is_active = 1 ORDER BY name');
const getProductOptions = db.prepare('SELECT * FROM product_options WHERE product_id = ? ORDER BY position, option_type');
const addProductOption = db.prepare(`
	INSERT INTO product_options (product_id, option_type, option_label, option_value, option_value_label, price_modifier, is_default, position)
	VALUES (@product_id, @option_type, @option_label, @option_value, @option_value_label, @price_modifier, @is_default, @position)
`);
const removeProductOption = db.prepare('DELETE FROM product_options WHERE id = ? AND product_id = ?');
const getMaxOptionPosition = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM product_options WHERE product_id = ?');
const updateProduct = db.prepare(`
	UPDATE products SET
		slug = @slug,
		name = @name,
		brand_id = @brand_id,
		category_id = @category_id,
		sku = @sku,
		price = @price,
		price_note = @price_note,
		availability_status = @availability_status,
		description = @description,
		is_active = @is_active,
		is_featured = @is_featured,
		is_new = @is_new,
		is_limited = @is_limited,
		position = @position,
		updated_at = datetime('now')
	WHERE id = @id
`);

export const load: PageServerLoad = async ({ params }) => {
	const product = getProduct.get(Number(params.id)) as Product | undefined;

	if (!product) {
		throw error(404, 'Product not found');
	}

	const brands = listBrands.all() as { id: number; name: string }[];
	const categories = listCategories.all() as { id: number; name: string }[];
	const options = getProductOptions.all(product.id) as Array<{
		id: number;
		option_type: string;
		option_label: string;
		option_value: string;
		option_value_label: string | null;
		price_modifier: number;
		is_default: number;
		position: number;
	}>;

	return { product, brands, categories, options };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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
			updateProduct.run({
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
	},

	addOption: async ({ request, params }) => {
		const formData = await request.formData();
		const product_id = Number(params.id);

		const option_type = formData.get('option_type')?.toString() || '';
		const option_label = formData.get('option_label')?.toString() || '';
		const option_value = formData.get('option_value')?.toString() || '';
		const option_value_label = formData.get('option_value_label')?.toString() || '';
		const price_modifier = parseInt(formData.get('price_modifier')?.toString() || '0', 10);
		const is_default = formData.get('is_default') ? 1 : 0;

		if (!option_type || !option_label || !option_value) {
			return fail(400, { error: 'Option type, label, and value are required' });
		}

		const nextPos = getMaxOptionPosition.get(product_id) as { next_pos: number };

		try {
			addProductOption.run({
				product_id,
				option_type,
				option_label,
				option_value,
				option_value_label: option_value_label || null,
				price_modifier,
				is_default,
				position: nextPos.next_pos
			});
		} catch (error: any) {
			return fail(500, { error: 'Failed to add option' });
		}

		return { success: true };
	},

	removeOption: async ({ request, params }) => {
		const formData = await request.formData();
		const option_id = formData.get('option_id');
		const product_id = Number(params.id);

		if (!option_id) {
			return fail(400, { error: 'Option ID is required' });
		}

		try {
			removeProductOption.run(Number(option_id), product_id);
		} catch (error: any) {
			return fail(500, { error: 'Failed to remove option' });
		}

		return { success: true };
	}
};
