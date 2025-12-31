import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { decodeSession, type AdminUser } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('admin_session');

	// Allow access to login page without auth
	if (url.pathname === '/admin/login') {
		return { admin: null };
	}

	if (!session) {
		throw redirect(302, '/admin/login');
	}

	// Decode and validate session
	const admin = decodeSession(session);

	if (!admin) {
		cookies.delete('admin_session', { path: '/' });
		throw redirect(302, '/admin/login');
	}

	return { admin };
};
