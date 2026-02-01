import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

export const load: PageServerLoad = async ({ url }) => {
	const cityId = url.searchParams.get('city_id');
	const cities = queries.getAllCitiesForSelect.all() as { id: number; name: string }[];
	const categories = queries.getAllCityArticleCategoriesForSelect.all() as { id: number; name: string }[];
	const tags = queries.listCityArticleTags.all() as { id: number; name: string; slug: string }[];

	let city = null;
	if (cityId) {
		city = queries.adminGetCity.get(Number(cityId)) as { id: number; name: string } | undefined;
	}

	return { cities, city, categories, tags, cityId: cityId ? Number(cityId) : null };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const fd = await request.formData();
		const city_id = parseInt(fd.get('city_id')?.toString() || '0');
		const slug = fd.get('slug')?.toString().trim();
		const title = fd.get('title')?.toString().trim();
		const excerpt = fd.get('excerpt')?.toString().trim() || null;
		const content = fd.get('content')?.toString() || null;
		const image_url = fd.get('image_url')?.toString().trim() || null;
		const template_type = fd.get('template_type')?.toString() || 'standard';
		const meta_title = fd.get('meta_title')?.toString().trim() || null;
		const meta_description = fd.get('meta_description')?.toString().trim() || null;
		const category_id = parseInt(fd.get('category_id')?.toString() || '0') || null;
		const read_time = parseInt(fd.get('read_time')?.toString() || '0') || null;
		const is_published = fd.get('is_published') === '1' ? 1 : 0;

		// Tags (comma-separated IDs)
		const tagIds = fd.get('tag_ids')?.toString().split(',').filter(Boolean).map(Number) || [];

		// Media (JSON array)
		let mediaItems: any[] = [];
		try {
			const mediaJson = fd.get('media_json')?.toString();
			if (mediaJson) mediaItems = JSON.parse(mediaJson);
		} catch { /* ignore */ }

		if (!city_id || !slug || !title) {
			return fail(400, { error: 'City, title, and slug are required' });
		}

		try {
			const createArticle = db.transaction(() => {
				// Create article
				const result = queries.createCityArticle.run({
					city_id, slug, title, excerpt, content, image_url, template_type,
					meta_title, meta_description, category_id, read_time, is_published
				});
				const articleId = Number(result.lastInsertRowid);

				// Add tags
				for (const tagId of tagIds) {
					queries.addTagToCityArticle.run(articleId, tagId);
				}

				// Add media
				for (let i = 0; i < mediaItems.length; i++) {
					const m = mediaItems[i];
					queries.addCityArticleMedia.run({
						article_id: articleId,
						media_type: m.media_type || 'image',
						url: m.url || '',
						alt_text: m.alt_text || null,
						caption: m.caption || null,
						position: i
					});
				}

				return articleId;
			});

			createArticle();
			throw redirect(303, `/admin/pseo?city_id=${city_id}`);
		} catch (err: any) {
			if (err.status === 303) throw err;
			if (err.message?.includes('UNIQUE')) return fail(400, { error: 'Article with this slug already exists for this city' });
			return fail(500, { error: 'Failed to create article' });
		}
	}
};
