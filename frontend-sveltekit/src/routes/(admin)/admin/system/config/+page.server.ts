import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface ConfigItem {
	id: number;
	key: string;
	value: string | null;
	type: string;
	description: string | null;
}

export const load: PageServerLoad = async () => {
	const config = queries.adminListConfig.all() as ConfigItem[];
	return { config, canManage: true };
};

export const actions: Actions = {
	update: async ({ request }) => {
		const formData = await request.formData();
		const key = formData.get('key')?.toString();
		const value = formData.get('value')?.toString() || '';

		if (!key) {
			return fail(400, { error: 'Key is required' });
		}

		try {
			queries.adminUpdateConfig.run({ key, value });
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to update config' });
		}
	},

	create: async ({ request }) => {
		const formData = await request.formData();
		const key = formData.get('key')?.toString() || '';
		const value = formData.get('value')?.toString() || '';
		const type = formData.get('type')?.toString() || 'string';
		const description = formData.get('description')?.toString() || '';

		if (!key) {
			return fail(400, { error: 'Key is required' });
		}

		try {
			queries.adminCreateConfig.run({
				key,
				value,
				type,
				description: description || null
			});
			return { success: true };
		} catch (error: any) {
			if (error.message?.includes('UNIQUE constraint')) {
				return fail(400, { error: 'A config with this key already exists' });
			}
			return fail(500, { error: 'Failed to create config' });
		}
	},

	delete: async ({ request }) => {
		const formData = await request.formData();
		const key = formData.get('key')?.toString();

		if (!key) {
			return fail(400, { error: 'Key is required' });
		}

		try {
			queries.adminDeleteConfig.run(key);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete config' });
		}
	}
};
