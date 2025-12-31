import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface PageRecord {
	id: number;
	slug: string;
	title: string;
	content: string | null;
	template: string | null;
	meta_json: string | null;
	is_published: number;
}

const getPage = db.prepare('SELECT * FROM pages WHERE id = ?');
const updatePage = db.prepare(`
	UPDATE pages SET
		slug = @slug,
		title = @title,
		content = @content,
		template = @template,
		meta_json = @meta_json,
		is_published = @is_published,
		updated_at = datetime('now')
	WHERE id = @id
`);

export const load: PageServerLoad = async ({ params }) => {
	const page = getPage.get(Number(params.id)) as PageRecord | undefined;

	if (!page) {
		throw error(404, 'Page not found');
	}

	// Parse meta_json for form
	let meta = {};
	if (page.meta_json) {
		try {
			meta = JSON.parse(page.meta_json);
		} catch {
			meta = {};
		}
	}

	return { page, meta };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

		const title = formData.get('title')?.toString() || '';
		const slug = formData.get('slug')?.toString() || '';
		const content = formData.get('content')?.toString() || '';
		const template = formData.get('template')?.toString() || '';
		const is_published = formData.get('is_published') ? 1 : 0;

		// Build meta_json from form fields
		const meta: Record<string, string> = {};
		const metaFields = ['meta_title', 'meta_description', 'phone', 'email', 'address', 'working_hours'];
		for (const field of metaFields) {
			const value = formData.get(field)?.toString();
			if (value) {
				meta[field] = value;
			}
		}

		if (!title || !slug) {
			return fail(400, {
				error: 'Title and slug are required',
				data: { title, slug, content, template, is_published, meta }
			});
		}

		try {
			updatePage.run({
				id,
				slug,
				title,
				content: content || null,
				template: template || null,
				meta_json: Object.keys(meta).length > 0 ? JSON.stringify(meta) : null,
				is_published
			});
		} catch (err: any) {
			if (err.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'A page with this slug already exists',
					data: { title, slug, content, template, is_published, meta }
				});
			}
			return fail(500, { error: 'Failed to update page' });
		}

		return { success: true };
	}
};
