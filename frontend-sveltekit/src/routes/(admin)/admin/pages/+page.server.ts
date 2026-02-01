import type { PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface Page {
	id: number;
	slug: string;
	title: string;
	template: string | null;
	is_published: number;
	created_at: string;
	updated_at: string;
}

export const load: PageServerLoad = async () => {
	const pages = queries.adminListPages.all() as Page[];
	return { pages };
};
