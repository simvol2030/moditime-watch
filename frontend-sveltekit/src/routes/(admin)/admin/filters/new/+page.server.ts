import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { db } from '$lib/server/db/database';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const type = formData.get('type')?.toString() || 'checkbox';
		const is_active = formData.get('is_active') ? 1 : 0;
		const position = parseInt(formData.get('position')?.toString() || '0', 10);

		if (!name || !slug) {
			return fail(400, {
				error: 'Name and slug are required',
				data: { name, slug, type, is_active, position }
			});
		}

		try {
			db.prepare(
				'INSERT INTO filter_attributes (slug, name, type, is_active, position) VALUES (?, ?, ?, ?, ?)'
			).run(slug, name, type, is_active, position);
		} catch (err: any) {
			if (err.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'A filter with this slug already exists',
					data: { name, slug, type, is_active, position }
				});
			}
			return fail(500, { error: 'Failed to create filter' });
		}

		throw redirect(302, '/admin/filters');
	}
};
