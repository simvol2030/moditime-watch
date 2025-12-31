import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const createBrand = db.prepare(`
	INSERT INTO brands (slug, name, description, logo_url, country, founded_year, website_url, is_active, position)
	VALUES (@slug, @name, @description, @logo_url, @country, @founded_year, @website_url, @is_active, @position)
`);

const getMaxPosition = db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM brands');

export const load: PageServerLoad = async () => {
	const result = getMaxPosition.get() as { next_position: number };
	return { nextPosition: result.next_position };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const description = formData.get('description')?.toString() || '';
		const logo_url = formData.get('logo_url')?.toString() || '';
		const country = formData.get('country')?.toString() || 'Switzerland';
		const founded_year = formData.get('founded_year')?.toString() || '';
		const website_url = formData.get('website_url')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		// Validation
		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required',
				data: { name, slug, description, logo_url, country, founded_year, website_url, is_active, position }
			});
		}

		try {
			createBrand.run({
				slug,
				name,
				description: description || null,
				logo_url: logo_url || null,
				country,
				founded_year: founded_year ? parseInt(founded_year, 10) : null,
				website_url: website_url || null,
				is_active,
				position
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'A brand with this slug already exists',
					data: { name, slug, description, logo_url, country, founded_year, website_url, is_active, position }
				});
			}
			return fail(500, { error: 'Failed to create brand' });
		}

		throw redirect(302, '/admin/brands');
	}
};
