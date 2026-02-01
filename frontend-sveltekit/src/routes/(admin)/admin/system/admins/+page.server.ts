import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import { isSuperAdmin } from '$lib/server/auth';

interface Admin {
	id: number;
	email: string;
	name: string;
	role: string;
	created_at: string;
}

export const load: PageServerLoad = async ({ parent }) => {
	const { admin: currentAdmin } = await parent();

	// Only super-admin can view this page
	if (!currentAdmin || !isSuperAdmin(currentAdmin.role)) {
		return { admins: [], canManage: false };
	}

	const admins = queries.adminListAdmins.all() as Admin[];
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
			queries.adminDeleteAdmin.run(id);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete admin' });
		}
	}
};
