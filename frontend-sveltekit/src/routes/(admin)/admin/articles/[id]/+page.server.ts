import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async ({ params }) => {
	const article = queries.adminGetArticle.get(Number(params.id)) as Record<string, any> | undefined;
	if (!article) throw error(404, 'Article not found');

	const categories = queries.getAllArticleCategories.all() as Array<{ id: number; name: string }>;

	return { article, categories };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();

		const slug = formData.get('slug')?.toString() || '';
		const title = formData.get('title')?.toString() || '';
		const subtitle = formData.get('subtitle')?.toString() || '';
		const excerpt = formData.get('excerpt')?.toString() || '';
		const content = formData.get('content')?.toString() || '';
		const category_id = formData.get('category_id')?.toString() ? Number(formData.get('category_id')) : null;
		const cover_image_url = formData.get('cover_image_url')?.toString() || '';
		const author_name = formData.get('author_name')?.toString() || '';
		const author_role = formData.get('author_role')?.toString() || '';
		const author_avatar_url = formData.get('author_avatar_url')?.toString() || '';
		const read_time = formData.get('read_time')?.toString() ? Number(formData.get('read_time')) : null;
		const is_published = formData.get('is_published') ? 1 : 0;
		const is_featured = formData.get('is_featured') ? 1 : 0;
		const meta_title = formData.get('meta_title')?.toString() || '';
		const meta_description = formData.get('meta_description')?.toString() || '';

		const data = {
			slug, title, subtitle, excerpt, content, category_id, cover_image_url,
			author_name, author_role, author_avatar_url, read_time, is_published,
			is_featured, meta_title, meta_description
		};

		if (!slug || !title || !content) {
			return fail(400, { error: 'Slug, title, and content are required', data });
		}

		try {
			queries.adminUpdateArticle.run({
				id: Number(params.id),
				slug,
				title,
				subtitle: subtitle || null,
				excerpt: excerpt || null,
				content,
				category_id,
				cover_image_url: cover_image_url || null,
				author_name: author_name || null,
				author_role: author_role || null,
				author_avatar_url: author_avatar_url || null,
				read_time,
				is_published,
				is_featured,
				meta_title: meta_title || null,
				meta_description: meta_description || null
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'An article with this slug already exists', data });
			}
			return fail(500, { error: 'Failed to update article', data });
		}

		throw redirect(302, '/admin/articles');
	}
};
