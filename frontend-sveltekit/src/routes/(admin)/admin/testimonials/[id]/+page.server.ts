import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getTestimonialById = db.prepare('SELECT * FROM testimonials WHERE id = ?');

const updateTestimonial = db.prepare(`
	UPDATE testimonials SET
		name = @name, position = @position, avatar_url = @avatar_url,
		text = @text, choice = @choice, is_active = @is_active, display_order = @display_order
	WHERE id = @id
`);

export const load: PageServerLoad = async ({ params }) => {
	const testimonial = getTestimonialById.get(Number(params.id)) as Record<string, any> | undefined;
	if (!testimonial) throw error(404, 'Testimonial not found');

	return { testimonial };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();

		const name = formData.get('name')?.toString() || '';
		const position = formData.get('position')?.toString() || '';
		const avatar_url = formData.get('avatar_url')?.toString() || '';
		const text = formData.get('text')?.toString() || '';
		const choice = formData.get('choice')?.toString() || '';
		const is_active = formData.get('is_active') ? 1 : 0;
		const display_order = parseInt(formData.get('display_order')?.toString() || '0', 10);

		const data = { name, position, avatar_url, text, choice, is_active, display_order };

		if (!name || !text) {
			return fail(400, { error: 'Name and text are required', data });
		}

		try {
			updateTestimonial.run({
				id: Number(params.id),
				name,
				position: position || null,
				avatar_url: avatar_url || null,
				text,
				choice: choice || null,
				is_active,
				display_order
			});
		} catch (error: any) {
			return fail(500, { error: 'Failed to update testimonial', data });
		}

		throw redirect(302, '/admin/testimonials');
	}
};
