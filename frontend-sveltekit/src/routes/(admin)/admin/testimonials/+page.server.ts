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

	move: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) {
			return fail(400, { error: 'ID and direction are required' });
		}

		try {
			const current = db.prepare('SELECT * FROM testimonials WHERE id = ?').get(id) as Testimonial | undefined;
			if (!current) return fail(404, { error: 'Testimonial not found' });

			const sibling = db.prepare(`
				SELECT * FROM testimonials
				WHERE display_order ${direction === 'up' ? '<' : '>'} ?
				ORDER BY display_order ${direction === 'up' ? 'DESC' : 'ASC'}
				LIMIT 1
			`).get(current.display_order) as Testimonial | undefined;

			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE testimonials SET display_order = ? WHERE id = ?').run(sibling.display_order, current.id);
				db.prepare('UPDATE testimonials SET display_order = ? WHERE id = ?').run(current.display_order, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move testimonial' });
		}
	}
};
