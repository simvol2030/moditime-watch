import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';
import { isSuperAdmin } from '$lib/server/auth';

interface Admin {
	id: number;
	email: string;
	name: string;
	role: string;
	created_at: string;
}

const listAdmins = db.prepare('SELECT id, email, name, role, created_at FROM admins ORDER BY id');
const deleteAdmin = db.prepare('DELETE FROM admins WHERE id = ?');

export const load: PageServerLoad = async ({ parent }) => {
	const { admin: currentAdmin } = await parent();

	// Only super-admin can view this page
	if (!currentAdmin || !isSuperAdmin(currentAdmin.role)) {
		return { admins: [], canManage: false };
	}

	const admins = listAdmins.all() as Admin[];
	return { admins, canManage: true };
};

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		const formData = await request.formData();
		const id = Number(formData.get('id'));

		if (!id) {
			return fail(400, { error: 'Admin ID is required' });
		}

		// Don't allow deleting yourself
		// (we'd need session info to check this properly)

		try {
			deleteAdmin.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete admin' });
		}
	}
};
