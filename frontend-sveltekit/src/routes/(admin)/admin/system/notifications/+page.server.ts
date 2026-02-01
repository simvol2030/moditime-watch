import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries, getConfigValue } from '$lib/server/db/database';
import { sendTelegramMessage } from '$lib/server/notifications/telegram';
import { sendTestEmail } from '$lib/server/notifications/email';

interface ConfigItem {
	key: string;
	value: string | null;
}

const NOTIFICATION_KEYS = [
	'telegram_enabled',
	'telegram_bot_token',
	'telegram_chat_id',
	'email_enabled',
	'smtp_host',
	'smtp_port',
	'smtp_user',
	'smtp_password',
	'email_from',
	'admin_email'
];

function getNotificationConfig(): Record<string, string> {
	const config: Record<string, string> = {};
	for (const key of NOTIFICATION_KEYS) {
		config[key] = getConfigValue(key) || '';
	}
	return config;
}

export const load: PageServerLoad = async () => {
	const config = getNotificationConfig();
	return { config };
};

export const actions: Actions = {
	saveTelegram: async ({ request }) => {
		const formData = await request.formData();
		const enabled = formData.get('telegram_enabled') === 'on' ? 'true' : 'false';
		const botToken = formData.get('telegram_bot_token')?.toString() || '';
		const chatId = formData.get('telegram_chat_id')?.toString() || '';

		try {
			queries.adminUpdateConfig.run({ key: 'telegram_enabled', value: enabled });
			queries.adminUpdateConfig.run({ key: 'telegram_bot_token', value: botToken });
			queries.adminUpdateConfig.run({ key: 'telegram_chat_id', value: chatId });
			return { success: true, section: 'telegram', message: 'Telegram settings saved' };
		} catch {
			return fail(500, { error: 'Failed to save Telegram settings' });
		}
	},

	saveEmail: async ({ request }) => {
		const formData = await request.formData();
		const enabled = formData.get('email_enabled') === 'on' ? 'true' : 'false';
		const smtpHost = formData.get('smtp_host')?.toString() || '';
		const smtpPort = formData.get('smtp_port')?.toString() || '587';
		const smtpUser = formData.get('smtp_user')?.toString() || '';
		const smtpPassword = formData.get('smtp_password')?.toString() || '';
		const emailFrom = formData.get('email_from')?.toString() || '';
		const adminEmail = formData.get('admin_email')?.toString() || '';

		try {
			queries.adminUpdateConfig.run({ key: 'email_enabled', value: enabled });
			queries.adminUpdateConfig.run({ key: 'smtp_host', value: smtpHost });
			queries.adminUpdateConfig.run({ key: 'smtp_port', value: smtpPort });
			queries.adminUpdateConfig.run({ key: 'smtp_user', value: smtpUser });
			queries.adminUpdateConfig.run({ key: 'smtp_password', value: smtpPassword });
			queries.adminUpdateConfig.run({ key: 'email_from', value: emailFrom });
			queries.adminUpdateConfig.run({ key: 'admin_email', value: adminEmail });
			return { success: true, section: 'email', message: 'Email settings saved' };
		} catch {
			return fail(500, { error: 'Failed to save Email settings' });
		}
	},

	testTelegram: async () => {
		const botToken = getConfigValue('telegram_bot_token');
		const chatId = getConfigValue('telegram_chat_id');

		if (!botToken || !chatId) {
			return fail(400, { error: 'Save Telegram token and chat ID first' });
		}

		const sent = await sendTelegramMessage(
			'\u{2705} <b>Test from Moditime Admin</b>\n\nTelegram notifications are configured correctly.',
			botToken,
			chatId
		);

		if (sent) {
			return { success: true, section: 'telegram', message: 'Test message sent to Telegram' };
		} else {
			return fail(400, { error: 'Failed to send test message. Check token and chat ID.' });
		}
	},

	testEmail: async () => {
		const adminEmail = getConfigValue('admin_email');
		if (!adminEmail) {
			return fail(400, { error: 'Save admin email first' });
		}

		const sent = await sendTestEmail(adminEmail);

		if (sent) {
			return { success: true, section: 'email', message: `Test email sent to ${adminEmail}` };
		} else {
			return fail(400, { error: 'Failed to send test email. Check SMTP settings.' });
		}
	}
};
