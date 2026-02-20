import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';
import { sendTelegramText } from '$lib/server/notifications/telegram';

const PHONE_REGEX = /^[\d\s()+-]{7,20}$/;

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		const sessionId = cookies.get('chat_session_id') || body.session_id;
		const name = (body.name || '').trim();
		const phone = (body.phone || '').trim();
		const email = (body.email || '').trim();

		if (!name || name.length < 2) {
			return json({ error: 'Укажите ваше имя (минимум 2 символа)' }, { status: 400 });
		}

		if (!phone || !PHONE_REGEX.test(phone)) {
			return json({ error: 'Укажите корректный номер телефона' }, { status: 400 });
		}

		if (!sessionId) {
			return json({ error: 'Сессия чата не найдена' }, { status: 400 });
		}

		// Update session with contact info
		queries.updateChatSessionContact.run({
			session_id: sessionId,
			visitor_name: name,
			visitor_email: email || null,
			visitor_phone: phone
		});

		// Add system message
		queries.insertChatMessage.run({
			session_id: sessionId,
			role: 'system',
			content: `Посетитель оставил контакт: ${name}, ${phone}${email ? ', ' + email : ''}`,
			metadata_json: null
		});

		// Telegram notification (non-blocking)
		sendTelegramText(
			`💬 <b>ЧАТБОТ — ЗАПРОС КОНСУЛЬТАНТА</b>\n\n👤 <b>Имя:</b> ${name}\n📱 <b>Телефон:</b> ${phone}${email ? '\n📧 <b>Email:</b> ' + email : ''}`
		).catch(() => {});

		return json({ success: true });
	} catch {
		return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
	}
};
