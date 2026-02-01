import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getMaxPriority = db.prepare('SELECT COALESCE(MAX(priority), 0) + 1 as next_priority FROM cities');

const createCity = db.prepare(`
	INSERT INTO cities (slug, name, name_genitive, name_prepositional, name_dative, name_accusative,
		region, population, timezone, delivery_days, delivery_price,
		hero_image_url, hero_title, hero_subtitle, meta_description, is_active, priority)
	VALUES (@slug, @name, @name_genitive, @name_prepositional, @name_dative, @name_accusative,
		@region, @population, @timezone, @delivery_days, @delivery_price,
		@hero_image_url, @hero_title, @hero_subtitle, @meta_description, @is_active, @priority)
`);

export const load: PageServerLoad = async () => {
	const result = getMaxPriority.get() as { next_priority: number };
	return { nextPriority: result.next_priority };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const name_genitive = formData.get('name_genitive')?.toString() || '';
		const name_prepositional = formData.get('name_prepositional')?.toString() || '';
		const name_dative = formData.get('name_dative')?.toString() || '';
		const name_accusative = formData.get('name_accusative')?.toString() || '';
		const region = formData.get('region')?.toString() || '';
		const population = parseInt(formData.get('population')?.toString() || '0', 10) || null;
		const timezone = formData.get('timezone')?.toString() || '';
		const delivery_days = parseInt(formData.get('delivery_days')?.toString() || '3', 10);
		const delivery_price = formData.get('delivery_price')?.toString() || 'Бесплатно';
		const hero_image_url = formData.get('hero_image_url')?.toString() || '';
		const hero_title = formData.get('hero_title')?.toString() || '';
		const hero_subtitle = formData.get('hero_subtitle')?.toString() || '';
		const meta_description = formData.get('meta_description')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const priority = parseInt(formData.get('priority')?.toString() || '0', 10);

		const data = {
			name, slug, name_genitive, name_prepositional, name_dative, name_accusative,
			region, population, timezone, delivery_days, delivery_price,
			hero_image_url, hero_title, hero_subtitle, meta_description, is_active, priority
		};

		if (!name || !slug) {
			return fail(400, { error: 'Name and slug are required', data });
		}

		try {
			createCity.run({
				slug,
				name,
				name_genitive: name_genitive || null,
				name_prepositional: name_prepositional || null,
				name_dative: name_dative || null,
				name_accusative: name_accusative || null,
				region: region || null,
				population: population || null,
				timezone: timezone || null,
				delivery_days,
				delivery_price,
				hero_image_url: hero_image_url || null,
				hero_title: hero_title || null,
				hero_subtitle: hero_subtitle || null,
				meta_description: meta_description || null,
				is_active,
				priority
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'A city with this slug already exists', data });
			}
			return fail(500, { error: 'Failed to create city', data });
		}

		throw redirect(302, '/admin/cities');
	}
};
