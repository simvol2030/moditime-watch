import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

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

export const load: PageServerLoad = async () => {
	const testimonials = queries.listTestimonials.all() as Testimonial[];
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
			queries.deleteTestimonial.run(Number(id));
			return { success: true };
		} catch (error) {
			return fail(500, { error: 'Failed to delete testimonial' });
		}
	},

	reorder: async ({ request }) => {
		const formData = await request.formData();
		const idsJson = formData.get('ids')?.toString();
		if (!idsJson) return fail(400, { error: 'No IDs provided' });

		try {
			const ids = JSON.parse(idsJson) as number[];
			const reorder = db.transaction(() => {
				for (let i = 0; i < ids.length; i++) {
					queries.reorderTestimonial.run({ id: ids[i], display_order: i + 1 });
				}
			});
			reorder();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reorder testimonials' });
		}
	}
};
