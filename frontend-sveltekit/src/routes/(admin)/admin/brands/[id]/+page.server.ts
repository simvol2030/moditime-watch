import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface Brand {
	id: number;
	slug: string;
	name: string;
	description: string | null;
	logo_url: string | null;
	country: string;
	founded_year: number | null;
	website_url: string | null;
	is_active: number;
	position: number;
}

const getBrand = db.prepare('SELECT * FROM brands WHERE id = ?');
const updateBrand = db.prepare(`
	UPDATE brands SET
		slug = @slug,
		name = @name,
		description = @description,
		logo_url = @logo_url,
		country = @country,
		founded_year = @founded_year,
		website_url = @website_url,
		is_active = @is_active,
		position = @position,
		updated_at = datetime('now')
	WHERE id = @id
`);

export const load: PageServerLoad = async ({ params }) => {
	const brand = getBrand.get(Number(params.id)) as Brand | undefined;

	if (!brand) {
		throw error(404, 'Brand not found');
	}

	return { brand };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

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
			updateBrand.run({
				id,
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
			return fail(500, { error: 'Failed to update brand' });
		}

		throw redirect(302, '/admin/brands');
	}
};
