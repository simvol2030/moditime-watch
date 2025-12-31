import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface Category {
	id: number;
	slug: string;
	name: string;
	description: string | null;
	parent_id: number | null;
	image_url: string | null;
	is_active: number;
	position: number;
}

const getCategory = db.prepare('SELECT * FROM categories WHERE id = ?');
const listCategories = db.prepare('SELECT id, name FROM categories ORDER BY name');
const updateCategory = db.prepare(`
	UPDATE categories SET
		slug = @slug,
		name = @name,
		description = @description,
		parent_id = @parent_id,
		image_url = @image_url,
		is_active = @is_active,
		position = @position,
		updated_at = datetime('now')
	WHERE id = @id
`);

export const load: PageServerLoad = async ({ params }) => {
	const category = getCategory.get(Number(params.id)) as Category | undefined;

	if (!category) {
		throw error(404, 'Category not found');
	}

	// Get all categories except current one for parent selection
	const categories = (listCategories.all() as { id: number; name: string }[])
		.filter(c => c.id !== category.id);

	return { category, categories };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

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
			updateCategory.run({
				id,
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
			return fail(500, { error: 'Failed to update category' });
		}

		throw redirect(302, '/admin/categories');
	}
};
