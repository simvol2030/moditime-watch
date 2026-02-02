import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';
import { sendTelegramText } from '$lib/server/notifications/telegram';

const PHONE_REGEX = /^[\d\s()+-]{7,20}$/;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const name = (body.name || '').trim();
		const phone = (body.phone || '').trim();

		if (!name || name.length < 2) {
			return json({ error: 'Укажите ваше имя (минимум 2 символа)' }, { status: 400 });
		}

		if (!phone || !PHONE_REGEX.test(phone)) {
			return json({ error: 'Укажите корректный номер телефона' }, { status: 400 });
		}

		// Save to database
		queries.insertCallbackRequest.run({ name, phone });

		// Send Telegram notification (non-blocking)
		sendTelegramText(
			`📞 <b>ОБРАТНЫЙ ЗВОНОК</b>\n\n👤 <b>Имя:</b> ${name}\n📱 <b>Телефон:</b> ${phone}`
		).catch(() => {
			// Don't block the response if Telegram fails
		});

		return json({ success: true });
	} catch {
		return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
	}
};
