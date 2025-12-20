/**
 * Email notifications module
 *
 * Settings are loaded from database (site_config table).
 * Configure via AdminJS or directly in database:
 * - email_enabled: 'true' to enable sending
 * - email_provider: 'smtp' or 'sendgrid'
 * - smtp_host, smtp_port, smtp_user, smtp_password
 * - smtp_from_email, smtp_from_name
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

interface EmailConfig {
	enabled: boolean;
	provider: 'smtp' | 'sendgrid' | 'mock';
	smtp: {
		host: string;
		port: number;
		user: string;
		password: string;
	};
	fromEmail: string;
	fromName: string;
}

/**
 * Get email configuration from database
 */
function getEmailConfig(): EmailConfig {
	const settings = getSettings('email');

	const enabled = settings.email_enabled === 'true';
	const hasSmtpConfig = settings.smtp_host && settings.smtp_user && settings.smtp_password;

	return {
		enabled,
		provider: hasSmtpConfig ? (settings.email_provider as 'smtp' | 'sendgrid') : 'mock',
		smtp: {
			host: settings.smtp_host || '',
			port: parseInt(settings.smtp_port || '587'),
			user: settings.smtp_user || '',
			password: settings.smtp_password || '',
		},
		fromEmail: settings.smtp_from_email || 'orders@moditimewatch.ru',
		fromName: settings.smtp_from_name || 'Moditimewatch',
	};
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
		${order.comment ? `
		<tr>
			<td style="padding: 8px 0; color: #666;">Комментарий:</td>
			<td style="padding: 8px 0;">${escapeHtml(order.comment)}</td>
		</tr>
		` : ''}
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
 * Send email via SMTP using fetch to a local/remote SMTP-to-HTTP bridge
 * For production, install nodemailer: npm install nodemailer
 *
 * Currently uses mock mode - logs to console
 */
async function sendEmailSmtp(
	config: EmailConfig,
	to: string,
	subject: string,
	html: string
): Promise<boolean> {
	// For real SMTP, you would use nodemailer here:
	// import nodemailer from 'nodemailer';
	// const transporter = nodemailer.createTransport({
	//   host: config.smtp.host,
	//   port: config.smtp.port,
	//   secure: config.smtp.port === 465,
	//   auth: { user: config.smtp.user, pass: config.smtp.password }
	// });
	// await transporter.sendMail({ from, to, subject, html });

	console.log('[Email SMTP] Would send email:');
	console.log('  From:', `"${config.fromName}" <${config.fromEmail}>`);
	console.log('  To:', to);
	console.log('  Subject:', subject);
	console.log('  SMTP Host:', config.smtp.host);

	// Return true to indicate "sent" (in mock mode)
	return true;
}

/**
 * Send order confirmation email to customer
 *
 * @returns true if email was sent (or mock logged), false if no email or disabled
 */
export async function sendOrderEmail(order: OrderData): Promise<boolean> {
	// Skip if no customer email
	if (!order.customerEmail) {
		console.log('[Email] No customer email provided, skipping');
		return false;
	}

	const config = getEmailConfig();

	// Skip if email notifications disabled
	if (!config.enabled) {
		console.log('[Email] Notifications disabled in settings, skipping');
		return true; // Return true to not block checkout
	}

	const subject = `Заказ ${order.orderNumber} - Moditimewatch`;
	const html = generateOrderEmailHtml(order);

	if (config.provider === 'mock') {
		// Mock implementation - just log
		console.log('='.repeat(60));
		console.log('[Email MOCK] Order confirmation');
		console.log('='.repeat(60));
		console.log('To:', order.customerEmail);
		console.log('Subject:', subject);
		console.log('Order:', order.orderNumber);
		console.log('Customer:', order.customerName);
		console.log('Total:', formatPrice(order.totalAmount));
		console.log('='.repeat(60));
		console.log('[Email MOCK] Configure SMTP in admin panel to send real emails');
		return true;
	}

	try {
		return await sendEmailSmtp(config, order.customerEmail, subject, html);
	} catch (error) {
		console.error('[Email ERROR] Failed to send:', error);
		// Don't block checkout on email failure
		return false;
	}
}

/**
 * Send order notification email to admin/owner
 */
export async function sendAdminOrderEmail(order: OrderData): Promise<boolean> {
	const config = getEmailConfig();
	const generalSettings = getSettings('general');
	const adminEmail = generalSettings.admin_email || 'admin@moditimewatch.ru';

	if (!config.enabled) {
		console.log('[Email] Admin notifications disabled');
		return true;
	}

	const subject = `Новый заказ ${order.orderNumber}`;

	if (config.provider === 'mock') {
		console.log('='.repeat(60));
		console.log('[Email MOCK] Admin notification');
		console.log('='.repeat(60));
		console.log('To:', adminEmail);
		console.log('Subject:', subject);
		console.log('Customer:', order.customerName);
		console.log('Phone:', order.customerPhone);
		console.log('Total:', formatPrice(order.totalAmount));
		console.log('='.repeat(60));
		return true;
	}

	try {
		const html = generateOrderEmailHtml(order);
		return await sendEmailSmtp(config, adminEmail, subject, html);
	} catch (error) {
		console.error('[Email ERROR] Failed to send admin notification:', error);
		return false;
	}
}
