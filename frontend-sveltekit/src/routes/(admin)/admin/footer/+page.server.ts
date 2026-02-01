import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface FooterSection {
	id: number;
	title: string;
	position: number;
	column_number: number;
	is_active: number;
}

interface FooterLink {
	id: number;
	section_id: number;
	label: string;
	href: string;
	position: number;
	is_main_domain_only: number;
}


export const load: PageServerLoad = async () => {
	const sections = queries.adminGetFooterSections.all() as FooterSection[];

	const sectionsWithLinks = sections.map((section) => {
		const links = queries.adminGetFooterLinks.all(section.id) as FooterLink[];
		return { ...section, links };
	});

	return { sections: sectionsWithLinks };
};

export const actions: Actions = {
	updateSection: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const title = formData.get('title')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const column_number = Number(formData.get('column_number') || 1);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!title) return fail(400, { error: 'Title is required' });

		try {
			queries.updateFooterSection.run({ id, title, position, column_number, is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update section' });
		}
	},

	createSection: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const column_number = Number(formData.get('column_number') || 1);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!title) return fail(400, { error: 'Title is required' });

		try {
			queries.createFooterSection.run({ title, position, column_number, is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to create section' });
		}
	},

	deleteSection: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			const tx = db.transaction(() => {
				queries.deleteFooterSectionLinks.run(id);
				queries.deleteFooterSection.run(id);
			});
			tx();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete section' });
		}
	},

	createLink: async ({ request }) => {
		const formData = await request.formData();
		const section_id = Number(formData.get('section_id'));
		const label = formData.get('label')?.toString() || '';
		const href = formData.get('href')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const is_main_domain_only = formData.get('is_main_domain_only') ? 1 : 0;

		if (!label || !href) return fail(400, { error: 'Label and URL are required' });

		try {
			queries.createFooterLink.run({ section_id, label, href, position, is_main_domain_only });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to create link' });
		}
	},

	updateLink: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const label = formData.get('label')?.toString() || '';
		const href = formData.get('href')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const is_main_domain_only = formData.get('is_main_domain_only') ? 1 : 0;

		if (!label || !href) return fail(400, { error: 'Label and URL are required' });

		try {
			queries.updateFooterLink.run({ id, label, href, position, is_main_domain_only });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update link' });
		}
	},

	deleteLink: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			queries.deleteFooterLink.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete link' });
		}
	}
};
