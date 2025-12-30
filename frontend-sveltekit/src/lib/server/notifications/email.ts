/**
 * Email notifications module
 *
 * TODO: Configure with real SMTP/SendGrid credentials in .env:
 * - SMTP_HOST
 * - SMTP_PORT
 * - SMTP_USER
 * - SMTP_PASSWORD
 * - SMTP_FROM
 *
 * Or for SendGrid:
 * - SENDGRID_API_KEY
 * - SENDGRID_FROM
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
			Телефон: <a href="tel:+79999604322" style="color: #1a1a1a;">+7 (999) 960-43-22</a>
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
 * Send order confirmation email to customer
 *
 * @returns true if email was sent (or mock logged), false if no email provided
 */
export async function sendOrderEmail(order: OrderData): Promise<boolean> {
	// Skip if no customer email
	if (!order.customerEmail) {
		console.log('[Email] No customer email provided, skipping');
		return false;
	}

	const smtpHost = env.SMTP_HOST;
	const sendgridKey = env.SENDGRID_API_KEY;

	// Check if real credentials configured
	if (smtpHost || sendgridKey) {
		// TODO: Implement real email sending with nodemailer or SendGrid
		// For now, log that we would send
		console.log('[Email] Real email would be sent to:', order.customerEmail);
		console.log('[Email] Subject: Заказ', order.orderNumber, '- Moditimewatch');
		return true;
	}

	// Mock implementation - just log
	console.log('='.repeat(60));
	console.log('[Email MOCK] Sending order confirmation email');
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
	console.log('='.repeat(60));

	// In mock mode, always return true
	return true;
}

/**
 * Send order notification email to admin/owner
 */
export async function sendAdminOrderEmail(order: OrderData): Promise<boolean> {
	const adminEmail = env.ADMIN_EMAIL || 'admin@moditimewatch.ru';
	const smtpHost = env.SMTP_HOST;
	const sendgridKey = env.SENDGRID_API_KEY;

	if (smtpHost || sendgridKey) {
		// TODO: Implement real email sending
		console.log('[Email] Admin notification would be sent to:', adminEmail);
		return true;
	}

	// Mock implementation
	console.log('='.repeat(60));
	console.log('[Email MOCK] Sending admin notification');
	console.log('='.repeat(60));
	console.log('To:', adminEmail);
	console.log('Subject: Новый заказ', order.orderNumber);
	console.log('');
	console.log('Customer:', order.customerName);
	console.log('Phone:', order.customerPhone);
	console.log('Email:', order.customerEmail || 'не указан');
	console.log('Total:', formatPrice(order.totalAmount));
	console.log('='.repeat(60));

	return true;
}
