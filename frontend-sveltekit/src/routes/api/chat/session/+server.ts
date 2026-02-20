import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries, seedChatbot } from '$lib/server/db/database';
import { randomUUID } from 'crypto';

export const GET: RequestHandler = async ({ cookies }) => {
	try {
		// Ensure chatbot data is seeded
		seedChatbot();

		let sessionId = cookies.get('chat_session_id');
		let messages: any[] = [];

		if (sessionId) {
			const session = queries.getChatSession.get(sessionId) as any;
			if (session) {
				messages = queries.getChatMessagesBySession.all(sessionId) as any[];
				queries.markChatMessagesRead.run(sessionId);
			} else {
				// Cookie exists but session deleted — create new
				sessionId = null;
			}
		}

		if (!sessionId) {
			sessionId = randomUUID();
			cookies.set('chat_session_id', sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: false,
				maxAge: 60 * 60 * 24 * 7
			});
		}

		// Load config
		const configRows = queries.getAllChatConfig.all() as { key: string; value: string }[];
		const config: Record<string, string> = {};
		for (const row of configRows) config[row.key] = row.value;

		let quickReplies: string[] = [];
		try { quickReplies = JSON.parse(config.quick_replies_json || '[]'); } catch { /* empty */ }

		return json({
			session_id: sessionId,
			config: {
				bot_name: config.bot_name || 'Modi',
				bot_avatar_emoji: config.bot_avatar_emoji || '\u231A',
				welcome_message: config.welcome_message || 'Здравствуйте! Я Modi — ваш консультант по часам. Чем могу помочь?',
				quick_replies: quickReplies,
				is_enabled: config.is_enabled !== 'false'
			},
			messages: messages.map(m => ({
				id: m.id,
				role: m.role,
				content: m.content,
				created_at: m.created_at
			}))
		});
	} catch {
		return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
	}
};
