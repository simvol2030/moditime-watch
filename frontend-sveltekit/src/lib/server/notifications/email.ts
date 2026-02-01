/**
 * Email notifications module
 *
 * Settings from site_config:
 * - email_enabled: 'true' / 'false'
 * - smtp_host, smtp_port, smtp_user, smtp_password, email_from
 * - admin_email: recipient for admin notifications
 *
 * Templates from email_templates table with variable substitution.
 */

import nodemailer from 'nodemailer';
import { queries, getConfigValue } from '$lib/server/db/database';

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
		style: 'currency',
		currency: 'RUB',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(rubles);
}

/**
 * Escape HTML special characters
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
 * Build items HTML table for email templates
 */
function buildItemsHtml(items: OrderItem[]): string {
	return items
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
		</tr>`
		)
		.join('');
}

/**
 * Replace template variables: {{var_name}} → value
 */
function renderTemplate(template: string, vars: Record<string, string>): string {
	let result = template;
	for (const [key, value] of Object.entries(vars)) {
		result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
	}
	return result;
}

/**
 * Get SMTP transporter from site_config settings
 */
function getTransporter() {
	const host = getConfigValue('smtp_host');
	const port = getConfigValue('smtp_port');
	const user = getConfigValue('smtp_user');
	const password = getConfigValue('smtp_password');

	if (!host || !user || !password) {
		return null;
	}

	return nodemailer.createTransport({
		host,
		port: Number(port) || 587,
		secure: Number(port) === 465,
		auth: { user, pass: password }
	});
}

/**
 * Log email send attempt to email_log table
 */
function logEmail(templateKey: string | null, recipient: string, subject: string, status: 'sent' | 'failed', error?: string) {
	try {
		queries.insertEmailLog.run(templateKey, recipient, subject, status, error || null);
	} catch (err) {
		console.error('[Email] Failed to log email:', err);
	}
}

/**
 * Send an email via SMTP
 *
 * @returns true if sent, false on error or not configured
 */
export async function sendEmail(to: string, subject: string, html: string, templateKey?: string): Promise<boolean> {
	const transporter = getTransporter();
	const from = getConfigValue('email_from') || getConfigValue('smtp_user') || 'noreply@moditime-watch.ru';

	if (!transporter) {
		console.log('[Email] SMTP not configured, skipping');
		return false;
	}

	try {
		await transporter.sendMail({ from, to, subject, html });
		console.log('[Email] Sent to:', to);
		logEmail(templateKey || null, to, subject, 'sent');
		return true;
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error('[Email] Failed to send:', errorMsg);
		logEmail(templateKey || null, to, subject, 'failed', errorMsg);
		return false;
	}
}

/**
 * Send a test email to verify SMTP configuration
 */
export async function sendTestEmail(to: string, smtpHost?: string, smtpPort?: string, smtpUser?: string, smtpPassword?: string, emailFrom?: string): Promise<boolean> {
	const host = smtpHost ?? getConfigValue('smtp_host');
	const port = smtpPort ?? getConfigValue('smtp_port');
	const user = smtpUser ?? getConfigValue('smtp_user');
	const password = smtpPassword ?? getConfigValue('smtp_password');
	const from = emailFrom ?? getConfigValue('email_from') ?? user ?? 'noreply@moditime-watch.ru';

	if (!host || !user || !password) {
		return false;
	}

	const transporter = nodemailer.createTransport({
		host,
		port: Number(port) || 587,
		secure: Number(port) === 465,
		auth: { user, pass: password }
	});

	try {
		await transporter.sendMail({
			from,
			to,
			subject: 'Test from Moditime Admin',
			html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
				<h2>Moditime Watch — Email Test</h2>
				<p>This is a test email from the Moditime admin panel.</p>
				<p>If you see this message, SMTP configuration is working correctly.</p>
				<p style="color: #666; margin-top: 20px;">Sent at: ${new Date().toLocaleString('ru-RU')}</p>
			</div>`
		});
		logEmail('test', to, 'Test from Moditime Admin', 'sent');
		return true;
	} catch (err) {
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error('[Email] Test failed:', errorMsg);
		logEmail('test', to, 'Test from Moditime Admin', 'failed', errorMsg);
		return false;
	}
}

/**
 * Get template variables for an order
 */
function getOrderVars(order: OrderData): Record<string, string> {
	return {
		order_number: escapeHtml(order.orderNumber),
		customer_name: escapeHtml(order.customerName),
		customer_phone: escapeHtml(order.customerPhone),
		customer_email: order.customerEmail ? escapeHtml(order.customerEmail) : '',
		address: escapeHtml(order.address),
		comment: order.comment ? escapeHtml(order.comment) : '',
		total: formatPrice(order.totalAmount),
		items: buildItemsHtml(order.items),
		year: String(new Date().getFullYear())
	};
}

/**
 * Generate a default HTML email wrapper
 */
function wrapHtml(body: string): string {
	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="text-align: center; margin-bottom: 30px;">
		<h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">MODITIMEWATCH</h1>
		<p style="color: #666; margin: 5px 0;">Премиальные часы</p>
	</div>
	${body}
	<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
		<p>&copy; ${new Date().getFullYear()} Moditimewatch. Все права защищены.</p>
	</div>
</body>
</html>`;
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(order: OrderData): Promise<boolean> {
	if (!order.customerEmail) {
		console.log('[Email] No customer email, skipping order confirmation');
		return false;
	}

	const enabled = getConfigValue('email_enabled');
	if (enabled !== 'true') {
		console.log('[Email] Notifications disabled, skipping');
		return false;
	}

	const vars = getOrderVars(order);
	const templateRow = queries.getEmailTemplate.get('order_confirmation') as { subject: string; body_html: string } | undefined;

	let subject: string;
	let html: string;

	if (templateRow) {
		subject = renderTemplate(templateRow.subject, vars);
		html = wrapHtml(renderTemplate(templateRow.body_html, vars));
	} else {
		subject = `Заказ ${order.orderNumber} принят — Moditimewatch`;
		html = wrapHtml(buildFallbackOrderHtml(order));
	}

	return sendEmail(order.customerEmail, subject, html, 'order_confirmation');
}

/**
 * Send order notification email to admin
 */
export async function sendOrderAdminNotification(order: OrderData): Promise<boolean> {
	const enabled = getConfigValue('email_enabled');
	if (enabled !== 'true') {
		console.log('[Email] Notifications disabled, skipping admin notification');
		return false;
	}

	const adminEmail = getConfigValue('admin_email') || 'admin@moditime-watch.ru';
	const vars = getOrderVars(order);
	const templateRow = queries.getEmailTemplate.get('order_admin_notification') as { subject: string; body_html: string } | undefined;

	let subject: string;
	let html: string;

	if (templateRow) {
		subject = renderTemplate(templateRow.subject, vars);
		html = wrapHtml(renderTemplate(templateRow.body_html, vars));
	} else {
		subject = `Новый заказ ${order.orderNumber}`;
		html = wrapHtml(buildFallbackAdminHtml(order));
	}

	return sendEmail(adminEmail, subject, html, 'order_admin_notification');
}

/**
 * Send order status change email to customer
 */
export async function sendOrderStatusChanged(
	order: OrderData & { orderId?: number },
	oldStatus: string,
	newStatus: string
): Promise<boolean> {
	if (!order.customerEmail) {
		console.log('[Email] No customer email, skipping status notification');
		return false;
	}

	const enabled = getConfigValue('email_enabled');
	if (enabled !== 'true') {
		console.log('[Email] Notifications disabled, skipping');
		return false;
	}

	const statusLabels: Record<string, string> = {
		pending: 'Ожидает обработки',
		confirmed: 'Подтверждён',
		paid: 'Оплачен',
		shipped: 'Отправлен',
		delivered: 'Доставлен',
		cancelled: 'Отменён'
	};

	const templateKeyMap: Record<string, string> = {
		confirmed: 'order_status_confirmed',
		shipped: 'order_status_shipped',
		delivered: 'order_status_delivered'
	};

	const vars = {
		...getOrderVars(order),
		old_status: statusLabels[oldStatus] || oldStatus,
		new_status: statusLabels[newStatus] || newStatus
	};

	const templateKey = templateKeyMap[newStatus];
	const templateRow = templateKey
		? (queries.getEmailTemplate.get(templateKey) as { subject: string; body_html: string } | undefined)
		: undefined;

	let subject: string;
	let html: string;

	if (templateRow) {
		subject = renderTemplate(templateRow.subject, vars);
		html = wrapHtml(renderTemplate(templateRow.body_html, vars));
	} else {
		subject = `Заказ ${order.orderNumber} — ${statusLabels[newStatus] || newStatus}`;
		html = wrapHtml(`
			<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
				<h2 style="color: #1a1a1a; margin: 0 0 10px;">Статус заказа обновлён</h2>
				<p style="margin: 0;">Заказ <strong>${escapeHtml(order.orderNumber)}</strong></p>
				<p style="margin: 5px 0 0;">Новый статус: <strong>${escapeHtml(statusLabels[newStatus] || newStatus)}</strong></p>
			</div>
			<p>Уважаемый(-ая) ${escapeHtml(order.customerName)},</p>
			<p>Статус вашего заказа был изменён на <strong>"${escapeHtml(statusLabels[newStatus] || newStatus)}"</strong>.</p>
			<p style="color: #666;">Если у вас есть вопросы, свяжитесь с нами по телефону <a href="tel:+79999604322">+7 (999) 960-43-22</a>.</p>
		`);
	}

	return sendEmail(order.customerEmail, subject, html, templateKey || 'order_status_change');
}

/**
 * Fallback HTML for order confirmation (when no template in DB)
 */
function buildFallbackOrderHtml(order: OrderData): string {
	return `
	<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
		<h2 style="color: #1a1a1a; margin: 0 0 10px;">Спасибо за заказ!</h2>
		<p style="margin: 0; color: #666;">
			Номер заказа: <strong style="color: #1a1a1a;">${escapeHtml(order.orderNumber)}</strong>
		</p>
	</div>
	<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Детали заказа</h3>
	<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
		<thead><tr style="background: #f8f8f8;">
			<th style="padding: 12px; text-align: left;">Товар</th>
			<th style="padding: 12px; text-align: center;">Кол-во</th>
			<th style="padding: 12px; text-align: right;">Сумма</th>
		</tr></thead>
		<tbody>${buildItemsHtml(order.items)}</tbody>
		<tfoot><tr>
			<td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Итого:</td>
			<td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #1a1a1a;">${formatPrice(order.totalAmount)}</td>
		</tr></tfoot>
	</table>
	<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Доставка</h3>
	<table style="width: 100%; margin-bottom: 20px;">
		<tr><td style="padding: 8px 0; color: #666; width: 120px;">Получатель:</td><td style="padding: 8px 0;">${escapeHtml(order.customerName)}</td></tr>
		<tr><td style="padding: 8px 0; color: #666;">Телефон:</td><td style="padding: 8px 0;">${escapeHtml(order.customerPhone)}</td></tr>
		<tr><td style="padding: 8px 0; color: #666;">Адрес:</td><td style="padding: 8px 0;">${escapeHtml(order.address)}</td></tr>
		${order.comment ? `<tr><td style="padding: 8px 0; color: #666;">Комментарий:</td><td style="padding: 8px 0;">${escapeHtml(order.comment)}</td></tr>` : ''}
	</table>
	<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center;">
		<p style="margin: 0 0 10px; color: #666;">Наш менеджер свяжется с вами в ближайшее время для подтверждения заказа.</p>
		<p style="margin: 0; color: #666;">Телефон: <a href="tel:+79999604322" style="color: #1a1a1a;">+7 (999) 960-43-22</a></p>
	</div>`;
}

/**
 * Fallback HTML for admin order notification (when no template in DB)
 */
function buildFallbackAdminHtml(order: OrderData): string {
	return `
	<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
		<h2 style="color: #92400e; margin: 0 0 10px;">Новый заказ!</h2>
		<p style="margin: 0; color: #92400e;">
			Номер: <strong>${escapeHtml(order.orderNumber)}</strong> | Сумма: <strong>${formatPrice(order.totalAmount)}</strong>
		</p>
	</div>
	<table style="width: 100%; margin-bottom: 20px;">
		<tr><td style="padding: 8px 0; color: #666; width: 120px;">Клиент:</td><td style="padding: 8px 0;">${escapeHtml(order.customerName)}</td></tr>
		<tr><td style="padding: 8px 0; color: #666;">Телефон:</td><td style="padding: 8px 0;">${escapeHtml(order.customerPhone)}</td></tr>
		<tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;">${order.customerEmail ? escapeHtml(order.customerEmail) : 'не указан'}</td></tr>
		<tr><td style="padding: 8px 0; color: #666;">Адрес:</td><td style="padding: 8px 0;">${escapeHtml(order.address)}</td></tr>
		${order.comment ? `<tr><td style="padding: 8px 0; color: #666;">Комментарий:</td><td style="padding: 8px 0;">${escapeHtml(order.comment)}</td></tr>` : ''}
	</table>
	<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Товары</h3>
	<table style="width: 100%; border-collapse: collapse;">
		<thead><tr style="background: #f8f8f8;">
			<th style="padding: 12px; text-align: left;">Товар</th>
			<th style="padding: 12px; text-align: center;">Кол-во</th>
			<th style="padding: 12px; text-align: right;">Сумма</th>
		</tr></thead>
		<tbody>${buildItemsHtml(order.items)}</tbody>
		<tfoot><tr>
			<td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Итого:</td>
			<td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">${formatPrice(order.totalAmount)}</td>
		</tr></tfoot>
	</table>`;
}
