import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface City {
	id: number;
	name: string;
	slug: string;
	hero_title: string | null;
	hero_subtitle: string | null;
	hero_image_url: string | null;
	meta_description: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
	const cityId = url.searchParams.get('city_id');
	const categoryFilter = url.searchParams.get('category');
	const statusFilter = url.searchParams.get('status');

	const cities = queries.getAllCitiesForSelect.all() as { id: number; name: string }[];
	const categories = queries.getAllCityArticleCategoriesForSelect.all() as { id: number; name: string }[];

	let articles: any[] = [];
	let city: City | null = null;
	let stats = { total: 0, published: 0, draft: 0 };

	if (cityId) {
		city = queries.adminGetCity.get(Number(cityId)) as City | null;

		let allArticles = queries.listCityArticlesByCity.all(Number(cityId)) as any[];

		// Calculate stats before filtering
		stats.total = allArticles.length;
		stats.published = allArticles.filter((a: any) => a.is_published === 1).length;
		stats.draft = stats.total - stats.published;

		// Apply filters
		if (categoryFilter) {
			allArticles = allArticles.filter((a: any) => String(a.category_id) === categoryFilter);
		}
		if (statusFilter === 'published') {
			allArticles = allArticles.filter((a: any) => a.is_published === 1);
		} else if (statusFilter === 'draft') {
			allArticles = allArticles.filter((a: any) => a.is_published !== 1);
		}

		// Load tags for each article
		for (const article of allArticles) {
			article.tags = queries.getCityArticleTags.all(article.id);
		}

		articles = allArticles;
	}

	return { cities, city, articles, categories, stats, cityId: cityId ? Number(cityId) : null, categoryFilter, statusFilter };
};

export const actions: Actions = {
	updateCitySeo: async ({ request }) => {
		const fd = await request.formData();
		const cityId = parseInt(fd.get('city_id')?.toString() || '0');
		const hero_title = fd.get('hero_title')?.toString().trim() || null;
		const hero_subtitle = fd.get('hero_subtitle')?.toString().trim() || null;
		const hero_image_url = fd.get('hero_image_url')?.toString().trim() || null;
		const meta_description = fd.get('meta_description')?.toString().trim() || null;

		if (!cityId) return fail(400, { error: 'City ID is required' });

		try {
			queries.adminUpdateCity.run({
				id: cityId,
				hero_title,
				hero_subtitle,
				hero_image_url,
				meta_description,
				// Preserve all other fields
				...(queries.adminGetCity.get(cityId) as any),
				updated_at: undefined
			});
			return { success: true, message: 'City SEO settings saved' };
		} catch {
			return fail(500, { error: 'Failed to update city SEO' });
		}
	},

	deleteArticle: async ({ request }) => {
		const fd = await request.formData();
		const id = parseInt(fd.get('id')?.toString() || '0');
		if (!id) return fail(400, { error: 'Article ID is required' });

		try {
			queries.deleteCityArticle.run(id);
			return { success: true, message: 'Article deleted' };
		} catch {
			return fail(500, { error: 'Failed to delete article' });
		}
	}
};
