import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const result = queries.getMaxTestimonialOrder.get() as { next_order: number };
	return { nextOrder: result.next_order };
};

export const actions: Actions = {
	default: async ({ request }) => {
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
			queries.createTestimonial.run({
				name,
				position: position || null,
				avatar_url: avatar_url || null,
				text,
				choice: choice || null,
				is_active,
				display_order
			});
		} catch (error: any) {
			return fail(500, { error: 'Failed to create testimonial', data });
		}

		throw redirect(302, '/admin/testimonials');
	}
};
