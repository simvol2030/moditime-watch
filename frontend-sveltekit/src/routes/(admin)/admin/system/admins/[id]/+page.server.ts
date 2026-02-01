import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import { hashPassword, isSuperAdmin } from '$lib/server/auth';

interface Admin {
	id: number;
	email: string;
	name: string;
	role: string;
}

export const load: PageServerLoad = async ({ params, parent }) => {
	const { admin: currentAdmin } = await parent();

	if (!currentAdmin || !isSuperAdmin(currentAdmin.role)) {
		throw redirect(302, '/admin/system/admins');
	}

	const admin = queries.adminGetAdmin.get(Number(params.id)) as Admin | undefined;

	if (!admin) {
		throw error(404, 'Admin not found');
	}

	return { adminUser: admin };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const id = Number(params.id);

		const email = formData.get('email')?.toString() || '';
		const name = formData.get('name')?.toString() || '';
		const role = formData.get('role')?.toString() || 'viewer';
		const password = formData.get('password')?.toString() || '';

		if (!email || !name) {
			return fail(400, {
				error: 'Email and name are required',
				data: { email, name, role }
			});
		}

		if (password && password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters',
				data: { email, name, role }
			});
		}

		try {
			if (password) {
				const hashedPassword = await hashPassword(password);
				queries.adminUpdateAdminWithPassword.run({
					id,
					email,
					name,
					role,
					password: hashedPassword
				});
			} else {
				queries.adminUpdateAdmin.run({ id, email, name, role });
			}
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, {
					error: 'An admin with this email already exists',
					data: { email, name, role }
				});
			}
			return fail(500, { error: 'Failed to update admin' });
		}

		throw redirect(302, '/admin/system/admins');
	}
};
