import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const cities = queries.getAllCitiesForSelect.all() as Array<{ id: number; name: string }>;
	const categories = queries.getAllCityArticleCategoriesForSelect.all() as Array<{ id: number; name: string }>;
	return { cities, categories };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const city_id = parseInt(formData.get('city_id')?.toString() || '0', 10);
		const slug = formData.get('slug')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const excerpt = formData.get('excerpt')?.toString() || '';
		const content = formData.get('content')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const template_type = formData.get('template_type')?.toString() || 'standard';
		const meta_title = formData.get('meta_title')?.toString() || '';
		const meta_description = formData.get('meta_description')?.toString() || '';
		const category_id_raw = formData.get('category_id')?.toString() || '';
		const category_id = category_id_raw ? parseInt(category_id_raw, 10) : null;
		const read_time_raw = formData.get('read_time')?.toString() || '';
		const read_time = read_time_raw ? parseInt(read_time_raw, 10) : null;
		const is_published = formData.get('is_published') ? 1 : 0;

		const data = { city_id, slug, title, excerpt, content, image_url, template_type, meta_title, meta_description, category_id, read_time, is_published };

		if (!city_id || !slug || !title) {
			return fail(400, { error: 'City, slug, and title are required', data });
		}

		try {
			queries.createCityArticle.run({
				city_id,
				slug,
				title,
				excerpt: excerpt || null,
				content: content || null,
				image_url: image_url || null,
				template_type,
				meta_title: meta_title || null,
				meta_description: meta_description || null,
				category_id,
				read_time,
				is_published
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'An article with this slug already exists for this city', data });
			}
			return fail(500, { error: 'Failed to create article', data });
		}

		throw redirect(302, '/admin/city-articles');
	}
};
