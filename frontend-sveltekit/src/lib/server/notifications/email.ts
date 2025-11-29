/**
 * Email notifications module
 *
 * Configure with real SMTP credentials in .env:
 * - SMTP_HOST (e.g., smtp.gmail.com, smtp.yandex.ru)
 * - SMTP_PORT (usually 587 for TLS, 465 for SSL)
 * - SMTP_USER (your email)
 * - SMTP_PASSWORD (app password or regular password)
 * - SMTP_FROM (sender email address)
 * - SMTP_SECURE (optional: "true" for port 465)
 *
 * For admin notifications:
 * - ADMIN_EMAIL (recipient for order notifications)
 */

import { env } from '$env/dynamic/private';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

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

// Cached transporter instance
let transporter: Transporter | null = null;

/**
 * Get or create nodemailer transporter
 */
function getTransporter(): Transporter | null {
	if (transporter) return transporter;

	const host = env.SMTP_HOST;
	const port = parseInt(env.SMTP_PORT || '587', 10);
	const user = env.SMTP_USER;
	const pass = env.SMTP_PASSWORD;
	const secure = env.SMTP_SECURE === 'true' || port === 465;

	if (!host || !user || !pass) {
		return null;
	}

	transporter = nodemailer.createTransport({
		host,
		port,
		secure,
		auth: { user, pass },
		// Connection timeout settings
		connectionTimeout: 10000, // 10 seconds
		greetingTimeout: 10000,
		socketTimeout: 15000
	});

	return transporter;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

/**
 * Format price from kopecks to rubles
 */
function formatPrice(kopecks: number): string {
	const rubles = kopecks / 100;
	return new Intl.NumberFormat('ru-RU', {
		style: 'currency',
		currency: 'RUB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(rubles);
}

/**
 * Generate HTML email template for order confirmation
 */
function generateOrderEmailHtml(order: OrderData): string {
	const itemsHtml = order.items
		.map(
			(item) => `
		<tr>
			<td style="padding: 12px; border-bottom: 1px solid #eee;">
				<strong>${escapeHtml(item.brand)}</strong><br>
				${escapeHtml(item.name)}
			</td>
			<td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
				${item.quantity}
			</td>
			<td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
				${formatPrice(item.price * item.quantity)}
			</td>
		</tr>
	`
		)
		.join('');

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Заказ ${escapeHtml(order.orderNumber)} - Moditimewatch</title>
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="text-align: center; margin-bottom: 30px;">
		<h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">MODITIMEWATCH</h1>
		<p style="color: #666; margin: 5px 0;">Премиальные часы</p>
	</div>

	<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
		<h2 style="color: #1a1a1a; margin: 0 0 10px;">Спасибо за заказ!</h2>
		<p style="margin: 0; color: #666;">
			Номер заказа: <strong style="color: #1a1a1a;">${escapeHtml(order.orderNumber)}</strong>
		</p>
	</div>

	<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Детали заказа</h3>

	<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
		<thead>
			<tr style="background: #f8f8f8;">
				<th style="padding: 12px; text-align: left;">Товар</th>
				<th style="padding: 12px; text-align: center;">Кол-во</th>
				<th style="padding: 12px; text-align: right;">Сумма</th>
			</tr>
		</thead>
		<tbody>
			${itemsHtml}
		</tbody>
		<tfoot>
			<tr>
				<td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">
					Итого:
				</td>
				<td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #1a1a1a;">
					${formatPrice(order.totalAmount)}
				</td>
			</tr>
		</tfoot>
	</table>

	<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Доставка</h3>

	<table style="width: 100%; margin-bottom: 20px;">
		<tr>
			<td style="padding: 8px 0; color: #666; width: 120px;">Получатель:</td>
			<td style="padding: 8px 0;">${escapeHtml(order.customerName)}</td>
		</tr>
		<tr>
			<td style="padding: 8px 0; color: #666;">Телефон:</td>
			<td style="padding: 8px 0;">${escapeHtml(order.customerPhone)}</td>
		</tr>
		<tr>
			<td style="padding: 8px 0; color: #666;">Адрес:</td>
			<td style="padding: 8px 0;">${escapeHtml(order.address)}</td>
		</tr>
		${
			order.comment
				? `
		<tr>
			<td style="padding: 8px 0; color: #666;">Комментарий:</td>
			<td style="padding: 8px 0;">${escapeHtml(order.comment)}</td>
		</tr>
		`
				: ''
		}
	</table>

	<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center;">
		<p style="margin: 0 0 10px; color: #666;">
			Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.
		</p>
		<p style="margin: 0; color: #666;">
			Телефон: <a href="tel:+74951234567" style="color: #1a1a1a;">+7 (495) 123-45-67</a>
		</p>
	</div>

	<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
		<p>&copy; ${new Date().getFullYear()} Moditimewatch. Все права защищены.</p>
	</div>
</body>
</html>
`;
}

/**
 * Generate HTML email template for admin notification
 */
function generateAdminOrderEmailHtml(order: OrderData): string {
	const itemsHtml = order.items
		.map(
			(item) => `
		<tr>
			<td style="padding: 8px; border: 1px solid #ddd;">${escapeHtml(item.brand)} - ${escapeHtml(item.name)}</td>
			<td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
			<td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(item.price * item.quantity)}</td>
		</tr>
	`
		)
		.join('');

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Новый заказ ${escapeHtml(order.orderNumber)}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<h1 style="color: #d32f2f; margin-bottom: 20px;">🛒 Новый заказ!</h1>

	<div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
		<strong>Номер заказа:</strong> ${escapeHtml(order.orderNumber)}<br>
		<strong>Сумма:</strong> ${formatPrice(order.totalAmount)}
	</div>

	<h2 style="color: #1976d2;">👤 Клиент</h2>
	<table style="width: 100%; margin-bottom: 20px;">
		<tr><td style="padding: 4px 0;"><strong>Имя:</strong></td><td>${escapeHtml(order.customerName)}</td></tr>
		<tr><td style="padding: 4px 0;"><strong>Телефон:</strong></td><td><a href="tel:${escapeHtml(order.customerPhone)}">${escapeHtml(order.customerPhone)}</a></td></tr>
		<tr><td style="padding: 4px 0;"><strong>Email:</strong></td><td>${order.customerEmail ? `<a href="mailto:${escapeHtml(order.customerEmail)}">${escapeHtml(order.customerEmail)}</a>` : 'не указан'}</td></tr>
		<tr><td style="padding: 4px 0;"><strong>Адрес:</strong></td><td>${escapeHtml(order.address)}</td></tr>
		${order.comment ? `<tr><td style="padding: 4px 0;"><strong>Комментарий:</strong></td><td>${escapeHtml(order.comment)}</td></tr>` : ''}
	</table>

	<h2 style="color: #1976d2;">📦 Товары</h2>
	<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
		<thead>
			<tr style="background: #f5f5f5;">
				<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Товар</th>
				<th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Кол-во</th>
				<th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Сумма</th>
			</tr>
		</thead>
		<tbody>
			${itemsHtml}
		</tbody>
		<tfoot>
			<tr style="background: #e3f2fd;">
				<td colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>ИТОГО:</strong></td>
				<td style="padding: 8px; border: 1px solid #ddd; text-align: right;"><strong>${formatPrice(order.totalAmount)}</strong></td>
			</tr>
		</tfoot>
	</table>

	<p style="color: #666; font-size: 12px;">
		Заказ создан: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
	</p>
</body>
</html>
`;
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(
	mailOptions: nodemailer.SendMailOptions,
	maxRetries: number = 3
): Promise<boolean> {
	const transport = getTransporter();

	if (!transport) {
		return false;
	}

	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			await transport.sendMail(mailOptions);
			return true;
		} catch (error) {
			console.error(`[Email] Attempt ${attempt}/${maxRetries} failed:`, error);

			if (attempt < maxRetries) {
				// Exponential backoff: 1s, 2s, 4s
				const delay = Math.pow(2, attempt - 1) * 1000;
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	return false;
}

/**
 * Send order confirmation email to customer
 *
 * @returns true if email was sent successfully, false otherwise
 */
export async function sendOrderEmail(order: OrderData): Promise<boolean> {
	// Skip if no customer email
	if (!order.customerEmail) {
		console.log('[Email] No customer email provided, skipping');
		return false;
	}

	const transport = getTransporter();
	const fromEmail = env.SMTP_FROM || env.SMTP_USER;

	// Check if SMTP is configured
	if (transport && fromEmail) {
		const mailOptions: nodemailer.SendMailOptions = {
			from: `"Moditimewatch" <${fromEmail}>`,
			to: order.customerEmail,
			subject: `Заказ ${order.orderNumber} — Moditimewatch`,
			html: generateOrderEmailHtml(order)
		};

		const success = await sendEmailWithRetry(mailOptions);

		if (success) {
			console.log('[Email] Order confirmation sent to:', order.customerEmail);
		} else {
			console.error('[Email] Failed to send order confirmation to:', order.customerEmail);
		}

		return success;
	}

	// Mock implementation - just log
	console.log('='.repeat(60));
	console.log('[Email MOCK] Order confirmation email');
	console.log('='.repeat(60));
	console.log('To:', order.customerEmail);
	console.log('Subject: Заказ', order.orderNumber, '- Moditimewatch');
	console.log('');
	console.log('Order Details:');
	console.log('- Customer:', order.customerName);
	console.log('- Phone:', order.customerPhone);
	console.log('- Address:', order.address);
	console.log('- Items:', order.items.length);
	console.log('- Total:', formatPrice(order.totalAmount));
	console.log('');
	console.log('⚠️  Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD to send real emails');
	console.log('='.repeat(60));

	// In mock mode, return true to not block checkout
	return true;
}

/**
 * Send order notification email to admin/owner
 */
export async function sendAdminOrderEmail(order: OrderData): Promise<boolean> {
	const adminEmail = env.ADMIN_EMAIL;
	const transport = getTransporter();
	const fromEmail = env.SMTP_FROM || env.SMTP_USER;

	// Skip if no admin email configured
	if (!adminEmail) {
		console.log('[Email] No ADMIN_EMAIL configured, skipping admin notification');
		return false;
	}

	// Check if SMTP is configured
	if (transport && fromEmail) {
		const mailOptions: nodemailer.SendMailOptions = {
			from: `"Moditimewatch Orders" <${fromEmail}>`,
			to: adminEmail,
			subject: `🛒 Новый заказ ${order.orderNumber} — ${formatPrice(order.totalAmount)}`,
			html: generateAdminOrderEmailHtml(order)
		};

		const success = await sendEmailWithRetry(mailOptions);

		if (success) {
			console.log('[Email] Admin notification sent to:', adminEmail);
		} else {
			console.error('[Email] Failed to send admin notification to:', adminEmail);
		}

		return success;
	}

	// Mock implementation
	console.log('='.repeat(60));
	console.log('[Email MOCK] Admin notification');
	console.log('='.repeat(60));
	console.log('To:', adminEmail);
	console.log('Subject: Новый заказ', order.orderNumber);
	console.log('');
	console.log('Customer:', order.customerName);
	console.log('Phone:', order.customerPhone);
	console.log('Email:', order.customerEmail || 'не указан');
	console.log('Total:', formatPrice(order.totalAmount));
	console.log('');
	console.log('⚠️  Configure SMTP settings to send real emails');
	console.log('='.repeat(60));

	return true;
}
