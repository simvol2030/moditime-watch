import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete('admin_session', { path: '/' });
		throw redirect(302, '/admin/login');
	}
};
