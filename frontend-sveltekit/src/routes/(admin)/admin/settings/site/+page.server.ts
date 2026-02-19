import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const allConfig = queries.getAllSiteConfig.all() as { key: string; value: string }[];
	const config: Record<string, string> = {};
	for (const item of allConfig) {
		config[item.key] = item.value;
	}
	return { config };
};

export const actions: Actions = {
	saveSiteSettings: async ({ request }) => {
		const formData = await request.formData();

		// Collect all config fields
		const fields: Record<string, string> = {
			// Basic
			site_name: formData.get('site_name')?.toString() || '',
			logo_wordmark: formData.get('logo_wordmark')?.toString() || '',
			logo_tagline: formData.get('logo_tagline')?.toString() || '',
			logo_image_url: formData.get('logo_image_url')?.toString() || '',
			logo_mode: formData.get('logo_mode')?.toString() || 'text',
			favicon_url: formData.get('favicon_url')?.toString() || '',
			company_description: formData.get('company_description')?.toString() || '',

			// Contacts
			contact_phone: formData.get('contact_phone')?.toString() || '',
			contact_email: formData.get('contact_email')?.toString() || '',
			contact_address: formData.get('contact_address')?.toString() || '',
			working_hours: formData.get('working_hours')?.toString() || '',
			phone_mode: formData.get('phone_mode')?.toString() || 'direct',

			// Social
			social_telegram: formData.get('social_telegram')?.toString() || '',
			social_vk: formData.get('social_vk')?.toString() || '',
			social_youtube: formData.get('social_youtube')?.toString() || '',
			social_whatsapp: formData.get('social_whatsapp')?.toString() || '',

			// Telegram group
			telegram_group_enabled: formData.get('telegram_group_enabled') ? 'true' : 'false',
			telegram_group_url: formData.get('telegram_group_url')?.toString() || '',
			telegram_group_label: formData.get('telegram_group_label')?.toString() || '',

			// Topbar
			topbar_badge: formData.get('topbar_badge')?.toString() || '',
			topbar_text: formData.get('topbar_text')?.toString() || '',
			topbar_visible: formData.get('topbar_visible') ? 'true' : 'false',

			// Legal
			copyright_text: formData.get('copyright_text')?.toString() || ''
		};

		try {
			const updateStmt = db.prepare('UPDATE site_config SET value = ?, updated_at = datetime(\'now\') WHERE key = ?');
			const insertStmt = db.prepare('INSERT OR IGNORE INTO site_config (key, value, type, description) VALUES (?, ?, \'string\', \'\')');

			db.transaction(() => {
				for (const [key, value] of Object.entries(fields)) {
					const result = updateStmt.run(value, key);
					if (result.changes === 0) {
						insertStmt.run(key, value);
					}
				}
			})();

			return { success: true };
		} catch {
			return fail(500, { error: 'Failed to save settings' });
		}
	}
};
