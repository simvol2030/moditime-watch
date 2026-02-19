import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

interface NavItem {
	id: number;
	label: string;
	href: string;
	parent_id: number | null;
	position: number;
	menu_type: string;
	is_active: number;
	is_main_domain_only: number;
}

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

interface MenuCount {
	menu_type: string;
	cnt: number;
}

const MENU_LABELS: Record<string, string> = {
	header_desktop: 'Навигация (Desktop)',
	header_mobile: 'Навигация (Mobile)',
	footer: 'Footer секции',
	footer_legal: 'Footer правовая',
	city_header: 'City навигация'
};

export const load: PageServerLoad = async ({ url }) => {
	const menu = url.searchParams.get('menu') || '';

	// Counts for overview
	const navCounts = queries.adminCountNavItemsByMenuType.all() as MenuCount[];
	const countsMap: Record<string, number> = {};
	for (const c of navCounts) countsMap[c.menu_type] = c.cnt;

	// Footer counts
	const footerSections = queries.adminGetFooterSections.all() as FooterSection[];
	let footerLinksTotal = 0;
	for (const s of footerSections) {
		const links = queries.adminGetFooterLinks.all(s.id) as FooterLink[];
		footerLinksTotal += links.length;
	}

	// Legal section
	const legalSection = footerSections.find(s => s.title === 'Правовая информация');
	const legalLinksCount = legalSection
		? (queries.adminGetFooterLinks.all(legalSection.id) as FooterLink[]).length
		: 0;

	const menus = [
		{ id: 'header_desktop', label: MENU_LABELS.header_desktop, count: countsMap['header_desktop'] || 0 },
		{ id: 'header_mobile', label: MENU_LABELS.header_mobile, count: countsMap['header_mobile'] || 0 },
		{ id: 'footer', label: MENU_LABELS.footer, count: footerSections.length + footerLinksTotal },
		{ id: 'footer_legal', label: MENU_LABELS.footer_legal, count: legalLinksCount },
		{ id: 'city_header', label: MENU_LABELS.city_header, count: countsMap['city_header'] || 0 }
	];

	// If editing a specific menu, load its data
	let navItems: NavItem[] = [];
	let navTopLevel: NavItem[] = [];
	let navChildren: Record<number, NavItem[]> = {};
	let sections: (FooterSection & { links: FooterLink[] })[] = [];
	let legalLinks: FooterLink[] = [];

	if (menu === 'header_desktop' || menu === 'header_mobile' || menu === 'city_header') {
		navItems = queries.adminGetNavItemsByMenuType.all(menu) as NavItem[];
		for (const item of navItems) {
			if (item.parent_id === null) {
				navTopLevel.push(item);
			} else {
				if (!navChildren[item.parent_id]) navChildren[item.parent_id] = [];
				navChildren[item.parent_id].push(item);
			}
		}
	} else if (menu === 'footer') {
		sections = footerSections.map(s => ({
			...s,
			links: queries.adminGetFooterLinks.all(s.id) as FooterLink[]
		}));
	} else if (menu === 'footer_legal') {
		if (legalSection) {
			legalLinks = queries.adminGetFooterLinks.all(legalSection.id) as FooterLink[];
		}
	}

	return {
		menu,
		menus,
		navTopLevel,
		navChildren,
		sections,
		legalLinks,
		legalSectionId: legalSection?.id || null,
		menuLabel: MENU_LABELS[menu] || ''
	};
};

export const actions: Actions = {
	// ===================== NAV ITEMS =====================
	createNavItem: async ({ request }) => {
		const fd = await request.formData();
		const label = fd.get('label')?.toString() || '';
		const href = fd.get('href')?.toString() || '';
		const menu_type = fd.get('menu_type')?.toString() || 'header_desktop';
		const parent_id = fd.get('parent_id')?.toString();
		const position = Number(fd.get('position') || 999);
		const is_active = fd.get('is_active') ? 1 : 0;

		if (!label || !href) return fail(400, { error: 'Название и URL обязательны' });

		try {
			queries.adminCreateNavItem.run({
				label, href,
				parent_id: parent_id ? Number(parent_id) : null,
				position, menu_type, is_active
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось создать пункт' });
		}
	},

	updateNavItem: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const label = fd.get('label')?.toString() || '';
		const href = fd.get('href')?.toString() || '';
		const position = Number(fd.get('position') || 0);
		const is_active = fd.get('is_active') ? 1 : 0;

		if (!label || !href) return fail(400, { error: 'Название и URL обязательны' });

		try {
			queries.adminUpdateNavItem.run({ id, label, href, position, is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось обновить пункт' });
		}
	},

	deleteNavItem: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));

		try {
			const tx = db.transaction(() => {
				queries.adminDeleteNavItemChildren.run(id);
				queries.adminDeleteNavItem.run(id);
			});
			tx();
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось удалить пункт' });
		}
	},

	moveNavItem: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const direction = fd.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) return fail(400, { error: 'ID и направление обязательны' });

		try {
			const current = db.prepare('SELECT * FROM navigation_items WHERE id = ?').get(id) as NavItem | undefined;
			if (!current) return fail(404, { error: 'Пункт не найден' });

			const siblingQuery = current.parent_id !== null
				? `SELECT * FROM navigation_items WHERE menu_type = ? AND parent_id = ? AND position ${direction === 'up' ? '<' : '>'} ? ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'} LIMIT 1`
				: `SELECT * FROM navigation_items WHERE menu_type = ? AND parent_id IS NULL AND position ${direction === 'up' ? '<' : '>'} ? ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'} LIMIT 1`;

			const siblingParams = current.parent_id !== null
				? [current.menu_type, current.parent_id, current.position]
				: [current.menu_type, current.position];

			const sibling = db.prepare(siblingQuery).get(...siblingParams) as NavItem | undefined;
			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE navigation_items SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE navigation_items SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось переместить пункт' });
		}
	},

	// ===================== FOOTER SECTIONS =====================
	createSection: async ({ request }) => {
		const fd = await request.formData();
		const title = fd.get('title')?.toString() || '';
		const position = Number(fd.get('position') || 999);
		const column_number = Number(fd.get('column_number') || 1);
		const is_active = fd.get('is_active') ? 1 : 0;

		if (!title) return fail(400, { error: 'Название обязательно' });

		try {
			queries.createFooterSection.run({ title, position, column_number, is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось создать секцию' });
		}
	},

	updateSection: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const title = fd.get('title')?.toString() || '';
		const position = Number(fd.get('position') || 0);
		const column_number = Number(fd.get('column_number') || 1);
		const is_active = fd.get('is_active') ? 1 : 0;

		if (!title) return fail(400, { error: 'Название обязательно' });

		try {
			queries.updateFooterSection.run({ id, title, position, column_number, is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось обновить секцию' });
		}
	},

	deleteSection: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));

		try {
			const tx = db.transaction(() => {
				queries.deleteFooterSectionLinks.run(id);
				queries.deleteFooterSection.run(id);
			});
			tx();
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось удалить секцию' });
		}
	},

	moveSection: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const direction = fd.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) return fail(400, { error: 'ID и направление обязательны' });

		try {
			const current = db.prepare('SELECT * FROM footer_sections WHERE id = ?').get(id) as FooterSection | undefined;
			if (!current) return fail(404, { error: 'Секция не найдена' });

			const sibling = db.prepare(`SELECT * FROM footer_sections WHERE position ${direction === 'up' ? '<' : '>'} ? ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'} LIMIT 1`).get(current.position) as FooterSection | undefined;
			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE footer_sections SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE footer_sections SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось переместить секцию' });
		}
	},

	// ===================== FOOTER LINKS =====================
	createLink: async ({ request }) => {
		const fd = await request.formData();
		const section_id = Number(fd.get('section_id'));
		const label = fd.get('label')?.toString() || '';
		const href = fd.get('href')?.toString() || '';
		const position = Number(fd.get('position') || 999);
		const is_main_domain_only = fd.get('is_main_domain_only') ? 1 : 0;

		if (!label || !href) return fail(400, { error: 'Название и URL обязательны' });

		try {
			queries.createFooterLink.run({ section_id, label, href, position, is_main_domain_only });
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось создать ссылку' });
		}
	},

	updateLink: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const label = fd.get('label')?.toString() || '';
		const href = fd.get('href')?.toString() || '';
		const position = Number(fd.get('position') || 0);
		const is_main_domain_only = fd.get('is_main_domain_only') ? 1 : 0;

		if (!label || !href) return fail(400, { error: 'Название и URL обязательны' });

		try {
			queries.updateFooterLink.run({ id, label, href, position, is_main_domain_only });
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось обновить ссылку' });
		}
	},

	deleteLink: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));

		try {
			queries.deleteFooterLink.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось удалить ссылку' });
		}
	},

	moveLink: async ({ request }) => {
		const fd = await request.formData();
		const id = Number(fd.get('id'));
		const direction = fd.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) return fail(400, { error: 'ID и направление обязательны' });

		try {
			const current = db.prepare('SELECT * FROM footer_links WHERE id = ?').get(id) as FooterLink | undefined;
			if (!current) return fail(404, { error: 'Ссылка не найдена' });

			const sibling = db.prepare(`SELECT * FROM footer_links WHERE section_id = ? AND position ${direction === 'up' ? '<' : '>'} ? ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'} LIMIT 1`).get(current.section_id, current.position) as FooterLink | undefined;
			if (!sibling) return { success: true };

			const swap = db.transaction(() => {
				db.prepare('UPDATE footer_links SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE footer_links SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();
			return { success: true };
		} catch {
			return fail(500, { error: 'Не удалось переместить ссылку' });
		}
	}
};
