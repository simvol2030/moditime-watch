import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyAdmin, encodeSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	// If already logged in, redirect to admin dashboard
	const session = cookies.get('admin_session');
	if (session) {
		throw redirect(302, '/admin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email')?.toString() || '';
		const password = formData.get('password')?.toString() || '';

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		const admin = await verifyAdmin(email, password);

		if (!admin) {
			return fail(401, {
				error: 'Invalid email or password',
				email
			});
		}

		// Set session cookie
		const sessionData = encodeSession(admin);
		cookies.set('admin_session', sessionData, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		throw redirect(302, '/admin');
	}
};
