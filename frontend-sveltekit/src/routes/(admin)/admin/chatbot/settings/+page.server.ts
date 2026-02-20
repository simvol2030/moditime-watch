import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
	const configRows = queries.getAllChatConfig.all() as { key: string; value: string; description: string }[];
	const config: Record<string, string> = {};
	for (const row of configRows) config[row.key] = row.value;

	let quickReplies: string[] = [];
	try { quickReplies = JSON.parse(config.quick_replies_json || '[]'); } catch { /* empty */ }

	const monthlySpend = (queries.getMonthlyAISpend.get() as any)?.total_cost || 0;

	return { config, quickReplies, monthlySpend };
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

		// AI config fields
		const aiFields: Record<string, { value: string; description: string }> = {
			chat_mode: { value: formData.get('chat_mode')?.toString() || 'auto', description: 'Режим работы бота' },
			ai_model: { value: formData.get('ai_model')?.toString() || 'google/gemini-2.0-flash-001', description: 'AI модель' },
			ai_temperature: { value: formData.get('ai_temperature')?.toString() || '0.7', description: 'Температура AI' },
			ai_max_tokens: { value: formData.get('ai_max_tokens')?.toString() || '500', description: 'Макс. токенов ответа' },
			ai_system_prompt: { value: formData.get('ai_system_prompt')?.toString() || '', description: 'Системный промпт AI' },
			ai_history_depth: { value: formData.get('ai_history_depth')?.toString() || '10', description: 'Глубина истории контекста' },
			ai_monthly_budget: { value: formData.get('ai_monthly_budget')?.toString() || '10', description: 'Месячный бюджет AI ($)' }
		};

		// API key: only overwrite if non-empty
		const apiKeyValue = formData.get('openrouter_api_key')?.toString()?.trim();
		if (apiKeyValue) {
			aiFields.openrouter_api_key = { value: apiKeyValue, description: 'OpenRouter API ключ' };
		}

		Object.assign(fields, aiFields);

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
