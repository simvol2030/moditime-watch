import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';
import { generateResponse, checkRateLimit, sanitizeMessage } from '$lib/server/chat/bot-logic';
import { randomUUID } from 'crypto';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const rawMessage = (body.message || '').toString();
		const message = sanitizeMessage(rawMessage);

		if (!message || message.length < 1) {
			return json({ error: 'Сообщение не может быть пустым' }, { status: 400 });
		}

		// Get or create session
		let sessionId = cookies.get('chat_session_id') || body.session_id;
		if (!sessionId) {
			sessionId = randomUUID();
			queries.createChatSession.run({
				session_id: sessionId,
				ip_address: request.headers.get('x-forwarded-for') || '',
				user_agent: (request.headers.get('user-agent') || '').slice(0, 500),
				page_url: request.headers.get('referer') || ''
			});
			cookies.set('chat_session_id', sessionId, {
				path: '/',
				httpOnly: true,
				sameSite: 'strict',
				secure: process.env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});
		}

		// Rate limiting
		if (!checkRateLimit(sessionId)) {
			return json({ error: 'Слишком много сообщений. Подождите немного.' }, { status: 429 });
		}

		// Save user message
		queries.insertChatMessage.run({
			session_id: sessionId,
			role: 'user',
			content: message,
			metadata_json: null
		});
		queries.updateChatSessionMessage.run(sessionId);

		// Generate bot response (async — supports AI mode)
		const response = await generateResponse(message, sessionId);

		// Save bot response with AI metadata
		queries.insertChatMessageWithAI.run({
			session_id: sessionId,
			role: 'bot',
			content: response.reply,
			metadata_json: response.metadata ? JSON.stringify(response.metadata) : null,
			response_mode: response.response_mode,
			model: response.model || null,
			tokens_prompt: response.tokens_prompt || 0,
			tokens_completion: response.tokens_completion || 0,
			cost: response.cost || 0
		});
		queries.updateChatSessionMessage.run(sessionId);

		// Update session token totals if AI was used
		if (response.tokens_prompt || response.tokens_completion) {
			queries.updateChatSessionTokens.run({
				session_id: sessionId,
				tokens: (response.tokens_prompt || 0) + (response.tokens_completion || 0),
				cost: response.cost || 0
			});
		}

		return json({
			reply: response.reply,
			products: response.products || [],
			session_id: sessionId,
			quick_replies: response.quick_replies || [],
			show_contact_form: response.show_contact_form || false,
			response_mode: response.response_mode
		});
	} catch (err) {
		console.error('[chat API error]', err instanceof Error ? err.message : err, err instanceof Error ? err.stack : '');
		return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
	}
};
