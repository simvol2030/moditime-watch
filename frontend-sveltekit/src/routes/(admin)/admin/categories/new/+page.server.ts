import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const createCategory = db.prepare(`
	INSERT INTO categories (slug, name, description, parent_id, image_url, is_active, position)
	VALUES (@slug, @name, @description, @parent_id, @image_url, @is_active, @position)
`);

const listCategories = db.prepare('SELECT id, name FROM categories ORDER BY name');
const getMaxPosition = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM categories');

export const load: PageServerLoad = async () => {
	const categories = listCategories.all() as { id: number; name: string }[];
	const result = getMaxPosition.get() as { next_position: number };
	return { categories, nextPosition: result.next_position };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const parent_id = formData.get('parent_id')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required',
				data: { name, slug, description, parent_id, image_url, is_active, position }
			});
		}

		try {
			createCategory.run({
				slug,
				name,
				description: description || null,
				parent_id: parent_id ? parseInt(parent_id, 10) : null,
				image_url: image_url || null,
				is_active,
				position
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'A category with this slug already exists',
					data: { name, slug, description, parent_id, image_url, is_active, position }
				});
			}
			return fail(500, { error: 'Failed to create category' });
		}

		throw redirect(302, '/admin/categories');
	}
};
