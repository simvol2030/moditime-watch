import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { parseSession } from '$lib/server/auth';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	const session = cookies.get('admin_session');

	// Allow access to login page without auth
	if (url.pathname === '/admin/login') {
		return { admin: null };
	}

	if (!session) {
		throw redirect(302, '/admin/login');
	}

	// Parse and validate session
	const admin = parseSession(session);

	if (!admin) {
		// Invalid session, clear cookie and redirect
		cookies.delete('admin_session', { path: '/' });
		throw redirect(302, '/admin/login');
	}

	return { admin };
};
