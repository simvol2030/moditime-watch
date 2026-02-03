import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

interface Brand {
	id: number;
	slug: string;
	name: string;
	country: string;
	founded_year: number | null;
	is_active: number;
	position: number;
	created_at: string;
}

export const load: PageServerLoad = async () => {
	const brands = queries.adminListBrands.all() as Brand[];
	return { brands };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Brand ID is required' });
		}

		try {
			queries.adminDeleteBrand.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete brand' });
		}
	},

	move: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) {
			return fail(400, { error: 'ID and direction are required' });
		}

		try {
			const current = db.prepare('SELECT * FROM brands WHERE id = ?').get(id) as Brand | undefined;
			if (!current) return fail(404, { error: 'Brand not found' });

			const sibling = db.prepare(`
				SELECT * FROM brands
				WHERE position ${direction === 'up' ? '<' : '>'} ?
				ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				LIMIT 1
			`).get(current.position) as Brand | undefined;

			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE brands SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE brands SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move brand' });
		}
	}
};
