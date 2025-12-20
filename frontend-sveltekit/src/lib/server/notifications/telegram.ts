/**
 * Telegram notifications module
 *
 * Settings are loaded from database (site_config table).
 * Configure via AdminJS or directly in database:
 * - telegram_enabled: 'true' to enable sending
 * - telegram_bot_token: token from @BotFather
 * - telegram_channel_id: chat/channel ID to send notifications
 */

import { getSettings } from '../db/database';

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

interface TelegramConfig {
	enabled: boolean;
	botToken: string;
	channelId: string;
}

/**
 * Get Telegram configuration from database
 */
function getTelegramConfig(): TelegramConfig {
	const settings = getSettings('telegram');

	return {
		enabled: settings.telegram_enabled === 'true',
		botToken: settings.telegram_bot_token || '',
		channelId: settings.telegram_channel_id || '',
	};
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
 * Send message to Telegram via Bot API
 */
async function sendTelegramMessage(
	config: TelegramConfig,
	message: string
): Promise<boolean> {
	const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				chat_id: config.channelId,
				text: message,
				parse_mode: 'MarkdownV2'
			})
		});

		if (!response.ok) {
			const error = await response.text();
			console.error('[Telegram] API error:', error);
			return false;
		}

		console.log('[Telegram] Message sent successfully');
		return true;
	} catch (error) {
		console.error('[Telegram] Failed to send message:', error);
		return false;
	}
}

/**
 * Log mock message to console
 */
function logMockMessage(order: OrderData): void {
	console.log('='.repeat(60));
	console.log('[Telegram MOCK] Order notification');
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
	console.log('[Telegram MOCK] Configure bot token in admin panel to send real messages');
}

/**
 * Send order notification to Telegram
 *
 * @returns true if message was sent (or mock logged), false on error
 */
export async function sendTelegramNotification(order: OrderData): Promise<boolean> {
	const config = getTelegramConfig();

	// Skip if Telegram notifications disabled
	if (!config.enabled) {
		console.log('[Telegram] Notifications disabled in settings');
		return true; // Return true to not block checkout
	}

	// Check if real credentials configured
	if (config.botToken && config.channelId) {
		try {
			const message = generateOrderMessage(order);
			return await sendTelegramMessage(config, message);
		} catch (error) {
			console.error('[Telegram] Failed to send notification:', error);
			// Don't block checkout on Telegram failure
			return false;
		}
	}

	// Mock implementation - just log
	logMockMessage(order);
	return true;
}
