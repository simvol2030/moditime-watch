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

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const idsJson = formData.get('ids')?.toString();
		if (!idsJson) return fail(400, { error: 'No IDs provided' });

		try {
			const ids = JSON.parse(idsJson) as number[];
			const reorder = db.transaction(() => {
				for (let i = 0; i < ids.length; i++) {
					queries.reorderCollection.run({ id: ids[i], position: i + 1 });
				}
			});
			reorder();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reorder collections' });
		}
	}
};
