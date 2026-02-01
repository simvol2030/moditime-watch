/**
 * Telegram notifications module
 *
 * Settings from site_config:
 * - telegram_enabled: 'true' / 'false'
 * - telegram_bot_token: Bot API token from @BotFather
 * - telegram_chat_id: Chat/channel ID to send notifications
 */

import { getConfigValue } from '$lib/server/db/database';

export interface OrderItem {
	name: string;
	brand: string;
	price: number; // in kopecks
	quantity: number;
}

export interface OrderData {
	orderNumber: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string | null;
	address: string;
	comment: string | null;
	totalAmount: number; // in kopecks
	items: OrderItem[];
}

/**
 * Format price from kopecks to rubles
 */
function formatPrice(kopecks: number): string {
	const rubles = kopecks / 100;
	return new Intl.NumberFormat('ru-RU', {
		style: 'decimal',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(rubles) + ' \u20BD';
}

/**
 * Escape HTML special characters for Telegram HTML parse_mode
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * Generate Telegram message for new order notification (HTML format)
 */
function generateOrderMessage(order: OrderData): string {
	const itemsList = order.items
		.map(
			(item, i) =>
				`${i + 1}. <b>${escapeHtml(item.brand)}</b> — ${escapeHtml(item.name)}\n   ${item.quantity} x ${formatPrice(item.price)}`
		)
		.join('\n');

	const lines: string[] = [
		'\u{1F6D2} <b>НОВЫЙ ЗАКАЗ</b>',
		'',
		`\u{1F4CB} <b>Номер:</b> <code>${order.orderNumber}</code>`,
		'',
		`\u{1F464} <b>Клиент:</b> ${escapeHtml(order.customerName)}`,
		`\u{1F4DE} <b>Телефон:</b> ${escapeHtml(order.customerPhone)}`
	];

	if (order.customerEmail) {
		lines.push(`\u{1F4E7} <b>Email:</b> ${escapeHtml(order.customerEmail)}`);
	}

	lines.push(`\u{1F4CD} <b>Адрес:</b> ${escapeHtml(order.address)}`);

	if (order.comment) {
		lines.push(`\u{1F4AC} <b>Комментарий:</b> ${escapeHtml(order.comment)}`);
	}

	lines.push('', '\u{1F4E6} <b>Товары:</b>', itemsList, '', `\u{1F4B0} <b>ИТОГО: ${formatPrice(order.totalAmount)}</b>`);

	return lines.join('\n');
}

/**
 * Send a message via Telegram Bot API
 *
 * @returns true if sent, false on error or not configured
 */
export async function sendTelegramMessage(text: string, botToken?: string, chatId?: string): Promise<boolean> {
	const token = botToken ?? getConfigValue('telegram_bot_token');
	const chat = chatId ?? getConfigValue('telegram_chat_id');

	if (!token || !chat) {
		console.log('[Telegram] Not configured (missing token or chat_id), skipping');
		return false;
	}

	try {
		const url = `https://api.telegram.org/bot${token}/sendMessage`;

		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chat,
				text,
				parse_mode: 'HTML'
			})
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error('[Telegram] API error:', errorBody);
			return false;
		}

		console.log('[Telegram] Message sent successfully');
		return true;
	} catch (err) {
		console.error('[Telegram] Failed to send message:', err);
		return false;
	}
}

/**
 * Send order notification to Telegram
 *
 * Reads telegram_enabled, telegram_bot_token, telegram_chat_id from site_config.
 * If not enabled or not configured → silently skips.
 * Errors are logged but never thrown (order must not be blocked).
 *
 * @returns true if sent, false otherwise
 */
export async function sendTelegramNotification(order: OrderData): Promise<boolean> {
	const enabled = getConfigValue('telegram_enabled');
	if (enabled !== 'true') {
		console.log('[Telegram] Notifications disabled, skipping');
		return false;
	}

	const message = generateOrderMessage(order);
	return sendTelegramMessage(message);
}

/**
 * Send a plain-text Telegram notification (e.g. for cancelled orders)
 */
export async function sendTelegramText(text: string): Promise<boolean> {
	const enabled = getConfigValue('telegram_enabled');
	if (enabled !== 'true') {
		return false;
	}

	return sendTelegramMessage(text);
}
