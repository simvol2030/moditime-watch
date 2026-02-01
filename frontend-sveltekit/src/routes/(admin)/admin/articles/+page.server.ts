import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const listArticles = db.prepare(`
	SELECT a.*, ac.name as category_name
	FROM articles a
	LEFT JOIN article_categories ac ON ac.id = a.category_id
	ORDER BY a.published_at DESC, a.title
`);

const listArticlesByCategory = db.prepare(`
	SELECT a.*, ac.name as category_name
	FROM articles a
	LEFT JOIN article_categories ac ON ac.id = a.category_id
	WHERE a.category_id = ?
	ORDER BY a.published_at DESC, a.title
`);

const getAllCategories = db.prepare('SELECT id, name FROM article_categories ORDER BY position');
const deleteArticle = db.prepare('DELETE FROM articles WHERE id = ?');

export const load: PageServerLoad = async ({ url }) => {
	const categoryFilter = url.searchParams.get('category') || '';
	const categories = getAllCategories.all() as Array<{ id: number; name: string }>;

	let articles: Article[];
	if (categoryFilter) {
		articles = listArticlesByCategory.all(Number(categoryFilter)) as Article[];
	} else {
		articles = listArticles.all() as Article[];
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
			deleteArticle.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete article' });
		}
	}
};
