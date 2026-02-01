import type { LayoutServerLoad } from './$types';

// Admin panel is now open access (no authentication)
export const load: LayoutServerLoad = async () => {
	return {
		admin: {
			id: 1,
			email: 'admin@moditime-watch.ru',
			name: 'Administrator',
			role: 'super-admin' as const
		}
	};
};
