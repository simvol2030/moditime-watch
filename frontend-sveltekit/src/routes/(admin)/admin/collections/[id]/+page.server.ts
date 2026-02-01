import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

interface Collection {
	id: number;
	slug: string;
	category: string;
	title: string;
	description: string | null;
	image_url: string | null;
	link_text: string | null;
	link_href: string | null;
	is_active: number;
	position: number;
}

export const load: PageServerLoad = async ({ params }) => {
	const collection = queries.adminGetCollection.get(Number(params.id)) as Collection | undefined;

	if (!collection) {
		throw error(404, 'Collection not found');
	}

	const collectionProducts = queries.adminGetCollectionProducts.all(collection.id) as any[];
	const allProducts = queries.adminGetAllProductsForCollection.all() as any[];

	return { collection, collectionProducts, allProducts };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

		const title = formData.get('title')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const category = formData.get('category')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const link_text = formData.get('link_text')?.toString() || '';
		const link_href = formData.get('link_href')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		const data = { title, slug, category, description, image_url, link_text, link_href, is_active, position };

		if (!title || !slug || !category) {
			return fail(400, { error: 'Title, slug, and category are required', data });
		}

		try {
			queries.adminUpdateCollection.run({
				id,
				slug,
				category,
				title,
				description: description || null,
				image_url: image_url || null,
				link_text: link_text || null,
				link_href: link_href || null,
				is_active,
				position
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'A collection with this slug already exists', data });
			}
			return fail(500, { error: 'Failed to update collection', data });
		}

		throw redirect(302, '/admin/collections');
	},

	addProduct: async ({ request, params }) => {
		const formData = await request.formData();
		const productId = Number(formData.get('product_id'));
		const collectionId = Number(params.id);

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		try {
			const maxPos = db.prepare(
				'SELECT COALESCE(MAX(position), 0) + 1 as next FROM collection_products WHERE collection_id = ?'
			).get(collectionId) as { next: number };
			queries.adminAddProductToCollection.run(collectionId, productId, maxPos.next);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to add product' });
		}
	},

	removeProduct: async ({ request, params }) => {
		const formData = await request.formData();
		const productId = Number(formData.get('product_id'));
		const collectionId = Number(params.id);

		if (!productId) {
			return fail(400, { error: 'Product ID is required' });
		}

		try {
			queries.adminRemoveProductFromCollection.run(collectionId, productId);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to remove product' });
		}
	}
};
