import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface CityArticle {
	id: number;
	city_id: number;
	slug: string;
	title: string;
	city_name: string;
	template_type: string;
	views_count: number;
	is_published: number;
	published_at: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
	const cityFilter = url.searchParams.get('city') || '';
	const cities = queries.getAllCities.all() as Array<{ id: number; name: string }>;

	let articles: CityArticle[];
	if (cityFilter) {
		articles = queries.listCityArticlesByCity.all(Number(cityFilter)) as CityArticle[];
	} else {
		articles = queries.listCityArticles.all() as CityArticle[];
	}

	return { articles, cities, cityFilter };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Article ID is required' });
		}

		try {
			queries.deleteCityArticle.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete article' });
		}
	}
};
