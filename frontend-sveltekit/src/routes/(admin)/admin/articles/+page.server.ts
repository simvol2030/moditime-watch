import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface Article {
	id: number;
	slug: string;
	title: string;
	category_name: string | null;
	author_name: string | null;
	read_time: number | null;
	views_count: number;
	is_published: number;
	is_featured: number;
	published_at: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
	const categoryFilter = url.searchParams.get('category') || '';
	const categories = queries.adminGetAllArticleCategories.all() as Array<{ id: number; name: string }>;

	let articles: Article[];
	if (categoryFilter) {
		articles = queries.adminListArticlesByCategory.all(Number(categoryFilter)) as Article[];
	} else {
		articles = queries.adminListArticles.all() as Article[];
	}

	return { articles, categories, categoryFilter };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Article ID is required' });
		}

		try {
			queries.adminDeleteArticle.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete article' });
		}
	}
};
