import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const listCollections = db.prepare(`
	SELECT c.*,
		(SELECT COUNT(*) FROM collection_products cp WHERE cp.collection_id = c.id) as product_count
	FROM collections c
	ORDER BY c.position, c.title
`);
const deleteCollection = db.prepare('DELETE FROM collections WHERE id = ?');

export const load: PageServerLoad = async () => {
	const collections = listCollections.all() as Collection[];
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
			deleteCollection.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete collection' });
		}
	}
};
