import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getAllCities = db.prepare('SELECT id, name FROM cities ORDER BY name');

const createArticle = db.prepare(`
	INSERT INTO city_articles (city_id, slug, title, excerpt, content, image_url, template_type, is_published)
	VALUES (@city_id, @slug, @title, @excerpt, @content, @image_url, @template_type, @is_published)
`);

export const load: PageServerLoad = async () => {
	const cities = getAllCities.all() as Array<{ id: number; name: string }>;
	return { cities };
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
		const is_published = formData.get('is_published') ? 1 : 0;

		const data = { city_id, slug, title, excerpt, content, image_url, template_type, is_published };

		if (!city_id || !slug || !title) {
			return fail(400, { error: 'City, slug, and title are required', data });
		}

		try {
			createArticle.run({
				city_id,
				slug,
				title,
				excerpt: excerpt || null,
				content: content || null,
				image_url: image_url || null,
				template_type,
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
