import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verifyAdmin, createSession } from '$lib/server/auth';

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
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

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

		// Create session cookie
		const session = createSession(admin);
		cookies.set('admin_session', session, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		throw redirect(302, '/admin');
	}
};
