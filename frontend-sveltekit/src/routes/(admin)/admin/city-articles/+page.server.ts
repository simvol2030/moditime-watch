import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const listArticles = db.prepare(`
	SELECT ca.*, c.name as city_name
	FROM city_articles ca
	JOIN cities c ON c.id = ca.city_id
	ORDER BY c.name, ca.published_at DESC
`);

const listArticlesByCity = db.prepare(`
	SELECT ca.*, c.name as city_name
	FROM city_articles ca
	JOIN cities c ON c.id = ca.city_id
	WHERE ca.city_id = ?
	ORDER BY ca.published_at DESC
`);

const getAllCities = db.prepare('SELECT id, name FROM cities ORDER BY name');
const deleteArticle = db.prepare('DELETE FROM city_articles WHERE id = ?');

export const load: PageServerLoad = async ({ url }) => {
	const cityFilter = url.searchParams.get('city') || '';
	const cities = getAllCities.all() as Array<{ id: number; name: string }>;

	let articles: CityArticle[];
	if (cityFilter) {
		articles = listArticlesByCity.all(Number(cityFilter)) as CityArticle[];
	} else {
		articles = listArticles.all() as CityArticle[];
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
			deleteArticle.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete article' });
		}
	}
};
