import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

export const load: PageServerLoad = async ({ params }) => {
	const article = queries.getCityArticleById.get(Number(params.id)) as any;
	if (!article) throw error(404, 'Article not found');

	const categories = queries.getAllCityArticleCategoriesForSelect.all() as { id: number; name: string }[];
	const allTags = queries.listCityArticleTags.all() as { id: number; name: string; slug: string }[];
	const articleTags = queries.getCityArticleTags.all(article.id) as { id: number; name: string }[];
	const media = queries.listCityArticleMedia.all(article.id) as any[];
	const related = queries.getRelatedCityArticles.all(article.id) as any[];
	const products = queries.getCityArticleProducts.all(article.id) as any[];

	// Get other articles for the same city (for related editor)
	const cityArticles = queries.listCityArticlesByCity.all(article.city_id) as any[];
	const otherArticles = cityArticles.filter((a: any) => a.id !== article.id);

	return { article, categories, allTags, articleTags, media, related, products, otherArticles };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const fd = await request.formData();
		const id = Number(params.id);
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

		const tagIds = fd.get('tag_ids')?.toString().split(',').filter(Boolean).map(Number) || [];
		const relatedIds = fd.get('related_ids')?.toString().split(',').filter(Boolean).map(Number) || [];

		let mediaItems: any[] = [];
		try {
			const mediaJson = fd.get('media_json')?.toString();
			if (mediaJson) mediaItems = JSON.parse(mediaJson);
		} catch { /* ignore */ }

		if (!city_id || !slug || !title) {
			return fail(400, { error: 'City, title, and slug are required' });
		}

		try {
			const updateAll = db.transaction(() => {
				// Update article
				queries.updateCityArticle.run({
					id, city_id, slug, title, excerpt, content, image_url, template_type,
					meta_title, meta_description, category_id, read_time, is_published
				});

				// Sync tags: remove old, add new
				const existingTags = (queries.getCityArticleTags.all(id) as any[]).map((t: any) => t.id);
				for (const oldId of existingTags) {
					if (!tagIds.includes(oldId)) queries.removeTagFromCityArticle.run(id, oldId);
				}
				for (const newId of tagIds) {
					if (!existingTags.includes(newId)) queries.addTagToCityArticle.run(id, newId);
				}

				// Sync related articles
				const existingRelated = (queries.getRelatedCityArticles.all(id) as any[]).map((r: any) => r.id);
				for (const oldId of existingRelated) {
					if (!relatedIds.includes(oldId)) queries.removeRelatedCityArticle.run(id, oldId);
				}
				for (let i = 0; i < relatedIds.length; i++) {
					if (!existingRelated.includes(relatedIds[i])) {
						queries.addRelatedCityArticle.run(id, relatedIds[i], i);
					}
				}

				// Sync media: delete all, re-insert
				const existingMedia = queries.listCityArticleMedia.all(id) as any[];
				for (const m of existingMedia) {
					queries.deleteCityArticleMedia.run(m.id);
				}
				for (let i = 0; i < mediaItems.length; i++) {
					const m = mediaItems[i];
					if (m.url) {
						queries.addCityArticleMedia.run({
							article_id: id,
							media_type: m.media_type || 'image',
							url: m.url,
							alt_text: m.alt_text || null,
							caption: m.caption || null,
							position: i
						});
					}
				}
			});

			updateAll();
			return { success: true };
		} catch (err: any) {
			if (err.message?.includes('UNIQUE')) return fail(400, { error: 'Article with this slug already exists for this city' });
			return fail(500, { error: 'Failed to update article: ' + (err.message || '') });
		}
	}
};
