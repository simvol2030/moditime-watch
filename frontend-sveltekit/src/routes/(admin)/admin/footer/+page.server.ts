import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const listSections = db.prepare('SELECT * FROM footer_sections ORDER BY position');
const listLinks = db.prepare('SELECT * FROM footer_links WHERE section_id = ? ORDER BY position');

const updateSection = db.prepare(`
	UPDATE footer_sections SET title = @title, position = @position, column_number = @column_number, is_active = @is_active
	WHERE id = @id
`);
const createSection = db.prepare(`
	INSERT INTO footer_sections (title, position, column_number, is_active) VALUES (@title, @position, @column_number, @is_active)
`);
const deleteSection = db.prepare('DELETE FROM footer_sections WHERE id = ?');
const deleteSectionLinks = db.prepare('DELETE FROM footer_links WHERE section_id = ?');

const createLink = db.prepare(`
	INSERT INTO footer_links (section_id, label, href, position, is_main_domain_only)
	VALUES (@section_id, @label, @href, @position, @is_main_domain_only)
`);
const updateLink = db.prepare(`
	UPDATE footer_links SET label = @label, href = @href, position = @position, is_main_domain_only = @is_main_domain_only
	WHERE id = @id
`);
const deleteLink = db.prepare('DELETE FROM footer_links WHERE id = ?');

export const load: PageServerLoad = async () => {
	const sections = listSections.all() as FooterSection[];

	const sectionsWithLinks = sections.map((section) => {
		const links = listLinks.all(section.id) as FooterLink[];
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
			updateSection.run({ id, title, position, column_number, is_active });
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
			createSection.run({ title, position, column_number, is_active });
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
				deleteSectionLinks.run(id);
				deleteSection.run(id);
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
			createLink.run({ section_id, label, href, position, is_main_domain_only });
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
			updateLink.run({ id, label, href, position, is_main_domain_only });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update link' });
		}
	},

	deleteLink: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			deleteLink.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete link' });
		}
	}
};
