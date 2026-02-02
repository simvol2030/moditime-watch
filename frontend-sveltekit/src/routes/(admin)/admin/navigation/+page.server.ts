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

export const load: PageServerLoad = async () => {
	const items = queries.adminListNavItems.all() as NavItem[];

	// Group by menu_type and organize hierarchically
	const grouped: Record<string, { topLevel: NavItem[]; children: Record<number, NavItem[]> }> = {};

	for (const item of items) {
		if (!grouped[item.menu_type]) {
			grouped[item.menu_type] = { topLevel: [], children: {} };
		}

		if (item.parent_id === null) {
			grouped[item.menu_type].topLevel.push(item);
		} else {
			if (!grouped[item.menu_type].children[item.parent_id]) {
				grouped[item.menu_type].children[item.parent_id] = [];
			}
			grouped[item.menu_type].children[item.parent_id].push(item);
		}
	}

	return { grouped, allItems: items };
};

export const actions: Actions = {
	update: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const label = formData.get('label')?.toString() || '';
		const href = formData.get('href')?.toString() || '';
		const position = Number(formData.get('position') || 0);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!label || !href) {
			return fail(400, { error: 'Label and href are required' });
		}

		try {
			queries.adminUpdateNavItem.run({ id, label, href, position, is_active });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update navigation item' });
		}
	},

	create: async ({ request }) => {
		const formData = await request.formData();
		const label = formData.get('label')?.toString() || '';
		const href = formData.get('href')?.toString() || '';
		const menu_type = formData.get('menu_type')?.toString() || 'header_desktop';
		const parent_id = formData.get('parent_id')?.toString();
		const position = Number(formData.get('position') || 0);
		const is_active = formData.get('is_active') ? 1 : 0;

		if (!label || !href) {
			return fail(400, { error: 'Label and href are required' });
		}

		try {
			queries.adminCreateNavItem.run({
				label,
				href,
				parent_id: parent_id ? Number(parent_id) : null,
				position,
				menu_type,
				is_active
			});
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to create navigation item' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		try {
			queries.adminDeleteNavItem.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete navigation item' });
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
					queries.reorderNavItem.run({ id: ids[i], position: i + 1 });
				}
			});
			reorder();
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to reorder items' });
		}
	}
};
