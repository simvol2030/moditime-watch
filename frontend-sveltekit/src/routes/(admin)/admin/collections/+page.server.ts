import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

interface Collection {
	id: number;
	slug: string;
	category: string;
	title: string;
	description: string | null;
	image_url: string | null;
	link_text: string | null;
	link_href: string | null;
	is_active: number;
	position: number;
	product_count: number;
}

export const load: PageServerLoad = async () => {
	const collections = queries.adminListCollections.all() as Collection[];
	return { collections };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Collection ID is required' });
		}

		try {
			queries.adminDeleteCollection.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete collection' });
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
			const current = db.prepare('SELECT * FROM collections WHERE id = ?').get(id) as Collection | undefined;
			if (!current) return fail(404, { error: 'Collection not found' });

			const sibling = db.prepare(`
				SELECT * FROM collections
				WHERE position ${direction === 'up' ? '<' : '>'} ?
				ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				LIMIT 1
			`).get(current.position) as Collection | undefined;

			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE collections SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE collections SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move collection' });
		}
	}
};
