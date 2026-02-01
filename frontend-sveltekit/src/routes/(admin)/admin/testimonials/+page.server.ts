import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface Testimonial {
	id: number;
	name: string;
	position: string | null;
	avatar_url: string | null;
	text: string;
	choice: string | null;
	is_active: number;
	display_order: number;
}

const listTestimonials = db.prepare('SELECT * FROM testimonials ORDER BY display_order, name');
const deleteTestimonial = db.prepare('DELETE FROM testimonials WHERE id = ?');

export const load: PageServerLoad = async () => {
	const testimonials = listTestimonials.all() as Testimonial[];
	return { testimonials };
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			return fail(400, { error: 'Testimonial ID is required' });
		}

		try {
			deleteTestimonial.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete testimonial' });
		}
	}
};
