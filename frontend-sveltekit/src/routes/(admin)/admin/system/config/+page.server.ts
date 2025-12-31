import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';
import { isSuperAdmin } from '$lib/server/auth';

interface ConfigItem {
	id: number;
	key: string;
	value: string | null;
	type: string;
	description: string | null;
}

const listConfig = db.prepare('SELECT * FROM site_config ORDER BY key');
const updateConfig = db.prepare(`
	UPDATE site_config SET
		value = @value,
		updated_at = datetime('now')
	WHERE key = @key
`);
const createConfig = db.prepare(`
	INSERT INTO site_config (key, value, type, description)
	VALUES (@key, @value, @type, @description)
`);
const deleteConfig = db.prepare('DELETE FROM site_config WHERE key = ?');

export const load: PageServerLoad = async ({ parent }) => {
	const { admin: currentAdmin } = await parent();

	if (!currentAdmin || !isSuperAdmin(currentAdmin.role)) {
		return { config: [], canManage: false };
	}

	const config = listConfig.all() as ConfigItem[];
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
			updateConfig.run({ key, value });
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
			createConfig.run({
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
			deleteConfig.run(key);
			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to delete config' });
		}
	}
};
