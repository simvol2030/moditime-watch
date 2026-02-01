import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const tags = queries.listCityArticleTags.all();
	return { tags };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const fd = await request.formData();
		const name = fd.get('name')?.toString().trim();
		const slug = fd.get('slug')?.toString().trim();

		if (!name || !slug) return fail(400, { error: 'Name and slug are required' });

		try {
			queries.createCityArticleTag.run({ name, slug });
			return { success: true };
		} catch (err: any) {
			if (err.message?.includes('UNIQUE')) return fail(400, { error: 'Tag with this name or slug already exists' });
			return fail(500, { error: 'Failed to create tag' });
		}
	},

	delete: async ({ request }) => {
		const fd = await request.formData();
		const id = parseInt(fd.get('id')?.toString() || '0');
		if (!id) return fail(400, { error: 'ID is required' });

		try {
			queries.deleteCityArticleTag.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete tag' });
		}
	}
};
