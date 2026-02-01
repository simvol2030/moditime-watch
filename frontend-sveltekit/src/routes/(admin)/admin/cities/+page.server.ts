import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface City {
	id: number;
	slug: string;
	name: string;
	region: string | null;
	delivery_days: number;
	delivery_price: string;
	is_active: number;
	priority: number;
	article_count: number;
}

const listCities = db.prepare(`
	SELECT c.*,
		(SELECT COUNT(*) FROM city_articles ca WHERE ca.city_id = c.id) as article_count
	FROM cities c
	ORDER BY c.priority DESC, c.name
`);

const searchCities = db.prepare(`
	SELECT c.*,
		(SELECT COUNT(*) FROM city_articles ca WHERE ca.city_id = c.id) as article_count
	FROM cities c
	WHERE c.name LIKE ? OR c.region LIKE ?
	ORDER BY c.priority DESC, c.name
`);

const deleteCity = db.prepare('DELETE FROM cities WHERE id = ?');

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search')?.trim() || '';

	let cities: City[];
	if (search) {
		const pattern = `%${search}%`;
		cities = searchCities.all(pattern, pattern) as City[];
	} else {
		cities = listCities.all() as City[];
	}

	return { cities, search };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'City ID is required' });
		}

		try {
			deleteCity.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete city' });
		}
	}
};
