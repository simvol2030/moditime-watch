import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface Page {
	id: number;
	slug: string;
	title: string;
	template: string | null;
	is_published: number;
	created_at: string;
	updated_at: string;
}

const listPages = db.prepare('SELECT * FROM pages ORDER BY id');

export const load: PageServerLoad = async () => {
	const pages = listPages.all() as Page[];
	return { pages };
};
