import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getAllCategories = db.prepare('SELECT id, name FROM article_categories ORDER BY position');

const createArticle = db.prepare(`
	INSERT INTO articles (slug, title, subtitle, excerpt, content, image_url, category_id,
		author_name, author_role, author_avatar_url, read_time, is_published, is_featured, published_at)
	VALUES (@slug, @title, @subtitle, @excerpt, @content, @image_url, @category_id,
		@author_name, @author_role, @author_avatar_url, @read_time, @is_published, @is_featured,
		CASE WHEN @is_published = 1 THEN datetime('now') ELSE NULL END)
`);

export const load: PageServerLoad = async () => {
	const categories = getAllCategories.all() as Array<{ id: number; name: string }>;
	return { categories };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const slug = formData.get('slug')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const subtitle = formData.get('subtitle')?.toString() || '';
		const excerpt = formData.get('excerpt')?.toString() || '';
		const content = formData.get('content')?.toString() || '';
		const image_url = formData.get('image_url')?.toString() || '';
		const category_id = parseInt(formData.get('category_id')?.toString() || '0', 10) || null;
		const author_name = formData.get('author_name')?.toString() || '';
		const author_role = formData.get('author_role')?.toString() || '';
		const author_avatar_url = formData.get('author_avatar_url')?.toString() || '';
		const read_time = parseInt(formData.get('read_time')?.toString() || '0', 10) || null;
		const is_published = formData.get('is_published') ? 1 : 0;
		const is_featured = formData.get('is_featured') ? 1 : 0;

		const data = {
			slug, title, subtitle, excerpt, content, image_url, category_id,
			author_name, author_role, author_avatar_url, read_time, is_published, is_featured
		};

		if (!title || !slug) {
			return fail(400, { error: 'Title and slug are required', data });
		}

		try {
			createArticle.run({
				slug,
				title,
				subtitle: subtitle || null,
				excerpt: excerpt || null,
				content: content || null,
				image_url: image_url || null,
				category_id,
				author_name: author_name || null,
				author_role: author_role || null,
				author_avatar_url: author_avatar_url || null,
				read_time,
				is_published,
				is_featured
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'An article with this slug already exists', data });
			}
			return fail(500, { error: 'Failed to create article', data });
		}

		throw redirect(302, '/admin/articles');
	}
};
