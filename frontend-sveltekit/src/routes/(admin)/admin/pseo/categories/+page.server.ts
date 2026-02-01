import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const categories = queries.listCityArticleCategories.all();
	return { categories };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const name = fd.get('name')?.toString().trim();
		const slug = fd.get('slug')?.toString().trim();
		const description = fd.get('description')?.toString().trim() || null;
		const position = parseInt(fd.get('position')?.toString() || '0') || 0;
		const is_active = fd.get('is_active') === '1' ? 1 : 0;

		if (!name || !slug) return fail(400, { error: 'Name and slug are required' });

		try {
			queries.createCityArticleCategory.run({ name, slug, description, position, is_active });
			return { success: true };
		} catch (err: any) {
			if (err.message?.includes('UNIQUE')) return fail(400, { error: 'Category with this slug already exists' });
			return fail(500, { error: 'Failed to create category' });
		}
	},

	update: async ({ request }) => {
		const fd = await request.formData();
		const id = parseInt(fd.get('id')?.toString() || '0');
		const name = fd.get('name')?.toString().trim();
		const slug = fd.get('slug')?.toString().trim();
		const description = fd.get('description')?.toString().trim() || null;
		const position = parseInt(fd.get('position')?.toString() || '0') || 0;
		const is_active = fd.get('is_active') === '1' ? 1 : 0;

		if (!id || !name || !slug) return fail(400, { error: 'ID, name and slug are required' });

		try {
			queries.updateCityArticleCategory.run({ id, name, slug, description, position, is_active });
			return { success: true };
		} catch (err: any) {
			if (err.message?.includes('UNIQUE')) return fail(400, { error: 'Category with this slug already exists' });
			return fail(500, { error: 'Failed to update category' });
		}
	},

	delete: async ({ request }) => {
		const fd = await request.formData();
		const id = parseInt(fd.get('id')?.toString() || '0');
		if (!id) return fail(400, { error: 'ID is required' });

		try {
			queries.deleteCityArticleCategory.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete category' });
		}
	}
};
