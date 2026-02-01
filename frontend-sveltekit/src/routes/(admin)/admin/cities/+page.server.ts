import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

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

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search')?.trim() || '';

	let cities: City[];
	if (search) {
		const pattern = `%${search}%`;
		cities = queries.adminSearchCities.all(pattern, pattern) as City[];
	} else {
		cities = queries.adminListCities.all() as City[];
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
			queries.adminDeleteCity.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete city' });
		}
	}
};
