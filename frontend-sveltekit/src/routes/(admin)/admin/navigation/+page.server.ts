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

	move: async ({ request }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const direction = formData.get('direction')?.toString() as 'up' | 'down';

		if (!id || !direction) {
			return fail(400, { error: 'ID and direction are required' });
		}

		try {
			// Get current item
			const current = db.prepare('SELECT * FROM navigation WHERE id = ?').get(id) as NavItem | undefined;
			if (!current) return fail(404, { error: 'Item not found' });

			// Find sibling based on direction and parent_id
			const siblingQuery = current.parent_id !== null
				? `SELECT * FROM navigation
				   WHERE menu_type = ? AND parent_id = ? AND position ${direction === 'up' ? '<' : '>'} ?
				   ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				   LIMIT 1`
				: `SELECT * FROM navigation
				   WHERE menu_type = ? AND parent_id IS NULL AND position ${direction === 'up' ? '<' : '>'} ?
				   ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
				   LIMIT 1`;

			const siblingParams = current.parent_id !== null
				? [current.menu_type, current.parent_id, current.position]
				: [current.menu_type, current.position];

			const sibling = db.prepare(siblingQuery).get(...siblingParams) as NavItem | undefined;

			if (!sibling) {
				return { success: true }; // Already at edge
			}

			// Swap positions
			const swap = db.transaction(() => {
				db.prepare('UPDATE navigation SET position = ? WHERE id = ?').run(sibling.position, current.id);
				db.prepare('UPDATE navigation SET position = ? WHERE id = ?').run(current.position, sibling.id);
			});
			swap();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to move item' });
		}
	}
};
