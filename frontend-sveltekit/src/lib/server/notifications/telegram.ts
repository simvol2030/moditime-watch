/**
 * Telegram notifications module
 *
 * TODO: Configure with real Telegram credentials in .env:
 * - TELEGRAM_BOT_TOKEN - token from @BotFather
 * - TELEGRAM_CHAT_ID - chat/channel ID to send notifications
 */

import { env } from '$env/dynamic/private';

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
 * Format price from kopecks to rubles (for Telegram message)
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
 * Escape special characters for Telegram MarkdownV2
 */
function escapeMarkdown(text: string): string {
	return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

/**
 * Generate Telegram message for new order notification
 */
function generateOrderMessage(order: OrderData): string {
	const itemsList = order.items
		.map(
			(item, i) =>
				`${i + 1}\\. *${escapeMarkdown(item.brand)}* \\- ${escapeMarkdown(item.name)}\n   ${item.quantity} x ${formatPrice(item.price)}`
		)
		.join('\n');

	const message = `
\u{1F6D2} *НОВЫЙ ЗАКАЗ*

\u{1F4CB} *Номер:* \`${order.orderNumber}\`

\u{1F464} *Клиент:* ${escapeMarkdown(order.customerName)}
\u{1F4DE} *Телефон:* ${escapeMarkdown(order.customerPhone)}
${order.customerEmail ? `\u{1F4E7} *Email:* ${escapeMarkdown(order.customerEmail)}` : ''}
\u{1F4CD} *Адрес:* ${escapeMarkdown(order.address)}
${order.comment ? `\u{1F4AC} *Комментарий:* ${escapeMarkdown(order.comment)}` : ''}

\u{1F4E6} *Товары:*
${itemsList}

\u{1F4B0} *ИТОГО: ${formatPrice(order.totalAmount)}*
`.trim();

	return message;
}

/**
 * Send order notification to Telegram
 *
 * @returns true if message was sent (or mock logged), false on error
 */
export async function sendTelegramNotification(order: OrderData): Promise<boolean> {
	const botToken = env.TELEGRAM_BOT_TOKEN;
	const chatId = env.TELEGRAM_CHAT_ID;

	// Check if real credentials configured
	if (botToken && chatId) {
		try {
			const message = generateOrderMessage(order);
			const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					chat_id: chatId,
					text: message,
					parse_mode: 'MarkdownV2'
				})
			});

			if (!response.ok) {
				const error = await response.text();
				console.error('[Telegram] API error:', error);
				return false;
			}

			console.log('[Telegram] Notification sent successfully');
			return true;
		} catch (error) {
			console.error('[Telegram] Failed to send notification:', error);
			return false;
		}
	}

	// Mock implementation - just log
	console.log('='.repeat(60));
	console.log('[Telegram MOCK] Sending order notification');
	console.log('='.repeat(60));
	console.log('');
	console.log('\u{1F6D2} НОВЫЙ ЗАКАЗ');
	console.log('');
	console.log('\u{1F4CB} Номер:', order.orderNumber);
	console.log('\u{1F464} Клиент:', order.customerName);
	console.log('\u{1F4DE} Телефон:', order.customerPhone);
	if (order.customerEmail) {
		console.log('\u{1F4E7} Email:', order.customerEmail);
	}
	console.log('\u{1F4CD} Адрес:', order.address);
	if (order.comment) {
		console.log('\u{1F4AC} Комментарий:', order.comment);
	}
	console.log('');
	console.log('\u{1F4E6} Товары:');
	order.items.forEach((item, i) => {
		console.log(`  ${i + 1}. ${item.brand} - ${item.name}`);
		console.log(`     ${item.quantity} x ${formatPrice(item.price)}`);
	});
	console.log('');
	console.log('\u{1F4B0} ИТОГО:', formatPrice(order.totalAmount));
	console.log('='.repeat(60));

	// In mock mode, always return true
	return true;
}
