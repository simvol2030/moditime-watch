import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const configRows = queries.getAllChatConfig.all() as { key: string; value: string; description: string }[];
	const config: Record<string, string> = {};
	for (const row of configRows) config[row.key] = row.value;

	let quickReplies: string[] = [];
	try { quickReplies = JSON.parse(config.quick_replies_json || '[]'); } catch { /* empty */ }

	return { config, quickReplies };
};

export const actions: Actions = {
	save: async ({ request }) => {
		const formData = await request.formData();

		const fields: Record<string, { value: string; description: string }> = {
			bot_name: { value: formData.get('bot_name')?.toString() || 'Modi', description: 'Имя бота' },
			bot_avatar_emoji: { value: formData.get('bot_avatar_emoji')?.toString() || '\u231A', description: 'Эмодзи-аватар бота' },
			welcome_message: { value: formData.get('welcome_message')?.toString() || '', description: 'Приветственное сообщение' },
			offline_message: { value: formData.get('offline_message')?.toString() || '', description: 'Сообщение при отсутствии ответа' },
			auto_open_delay: { value: formData.get('auto_open_delay')?.toString() || '0', description: 'Задержка автооткрытия (0 = не открывать)' },
			working_hours: {
				value: JSON.stringify({
					start: formData.get('working_hours_start')?.toString() || '10:00',
					end: formData.get('working_hours_end')?.toString() || '20:00'
				}),
				description: 'Часы работы'
			}
		};

		// Quick replies: collect from numbered fields
		const quickReplies: string[] = [];
		for (let i = 0; i < 10; i++) {
			const qr = formData.get(`quick_reply_${i}`)?.toString()?.trim();
			if (qr) quickReplies.push(qr);
		}
		fields.quick_replies_json = {
			value: JSON.stringify(quickReplies),
			description: 'Быстрые ответы'
		};

		try {
			for (const [key, { value, description }] of Object.entries(fields)) {
				queries.setChatConfig.run({ key, value, description });
			}
			return { success: true };
		} catch {
			return fail(500, { error: 'Ошибка сохранения' });
		}
	}
};
