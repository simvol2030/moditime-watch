import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getMaxPosition = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM collections');
const createCollection = db.prepare(`
	INSERT INTO collections (slug, category, title, description, image_url, link_text, link_href, is_active, position)
	VALUES (@slug, @category, @title, @description, @image_url, @link_text, @link_href, @is_active, @position)
`);

export const load: PageServerLoad = async () => {
	const result = getMaxPosition.get() as { next_position: number };
	return { nextPosition: result.next_position };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

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
			createCollection.run({
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
			return fail(500, { error: 'Failed to create collection', data });
		}

		throw redirect(302, '/admin/collections');
	}
};
