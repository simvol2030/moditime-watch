import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import { hashPassword, isSuperAdmin } from '$lib/server/auth';

export const load: PageServerLoad = async ({ parent }) => {
	const { admin: currentAdmin } = await parent();

	if (!currentAdmin || !isSuperAdmin(currentAdmin.role)) {
		throw redirect(302, '/admin/system/admins');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';
		const name = formData.get('name')?.toString() || '';
		const role = formData.get('role')?.toString() || 'viewer';

		if (!email || !password || !name) {
			return fail(400, {
				error: 'Email, password, and name are required',
				data: { email, name, role }
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters',
				data: { email, name, role }
			});
		}

		try {
			const hashedPassword = await hashPassword(password);
			queries.adminCreateAdmin.run({
				email,
				password: hashedPassword,
				name,
				role
			});
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'An admin with this email already exists',
					data: { email, name, role }
				});
			}
			return fail(500, { error: 'Failed to create admin' });
		}

		throw redirect(302, '/admin/system/admins');
	}
};
