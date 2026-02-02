import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import { sendOrderStatusChanged, sendTelegramText, type OrderData } from '$lib/server/notifications';

interface Order {
	id: number;
	order_number: string;
	customer_name: string;
	customer_phone: string;
	customer_email: string | null;
	delivery_address: string;
	delivery_comment: string | null;
	total_amount: number;
	status: string;
	created_at: string;
	updated_at: string;
}

interface OrderItem {
	id: number;
	product_name: string;
	product_brand: string;
	product_sku: string | null;
	price: number;
	quantity: number;
	subtotal: number;
}

interface StatusHistory {
	id: number;
	old_status: string | null;
	new_status: string;
	changed_by: string | null;
	comment: string | null;
	changed_at: string;
}

export const load: PageServerLoad = async ({ params }) => {
	const order = queries.adminGetOrder.get(Number(params.id)) as Order | undefined;

	if (!order) {
		throw error(404, 'Order not found');
	}

	const items = queries.adminGetOrderItems.all(order.id) as OrderItem[];
	const history = queries.adminGetOrderStatusHistory.all(order.id) as StatusHistory[];

	return { order, items, history };
};

export const actions: Actions = {
	updateStatus: async ({ request, params }) => {
		const formData = await request.formData();
		const newStatus = formData.get('status')?.toString();
		const comment = formData.get('comment')?.toString() || '';
		const orderId = Number(params.id);

		const VALID_STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		if (!VALID_STATUSES.includes(newStatus as typeof VALID_STATUSES[number])) {
			return fail(400, { error: 'Invalid status value' });
		}

		const order = queries.adminGetOrder.get(orderId) as Order | undefined;
		if (!order) {
			return fail(404, { error: 'Order not found' });
		}

		const oldStatus = order.status;

		if (oldStatus === newStatus) {
			return fail(400, { error: 'Status is already ' + newStatus });
		}

		try {
			// 1. Update order status
			queries.adminUpdateOrderStatus.run(newStatus, orderId);

			// 2. Insert status history
			queries.adminInsertOrderStatusHistory.run(orderId, oldStatus, newStatus, 'admin', comment || null);

			// 3. Send notifications (non-blocking)
			const items = queries.adminGetOrderItems.all(orderId) as OrderItem[];
			const orderData: OrderData = {
				orderNumber: order.order_number,
				customerName: order.customer_name,
				customerPhone: order.customer_phone,
				customerEmail: order.customer_email,
				address: order.delivery_address,
				comment: order.delivery_comment,
				totalAmount: order.total_amount,
				items: items.map((item) => ({
					name: item.product_name,
					brand: item.product_brand,
					price: item.price,
					quantity: item.quantity
				}))
			};

			try {
				// Email to customer about status change
				await sendOrderStatusChanged(orderData, oldStatus, newStatus);

				// Telegram notification for cancelled orders
				if (newStatus === 'cancelled') {
					const statusLabels: Record<string, string> = {
						pending: 'Ожидает', confirmed: 'Подтверждён', paid: 'Оплачен',
						shipped: 'Отправлен', delivered: 'Доставлен', cancelled: 'Отменён'
					};
					await sendTelegramText(
						`\u{274C} <b>Заказ отменён</b>\n\n` +
						`<b>Номер:</b> <code>${order.order_number}</code>\n` +
						`<b>Клиент:</b> ${order.customer_name}\n` +
						`<b>Был статус:</b> ${statusLabels[oldStatus] || oldStatus}\n` +
						(comment ? `<b>Причина:</b> ${comment}` : '')
					);
				}
			} catch (notificationError) {
				console.error('Status notification error:', notificationError);
			}

			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Failed to update status' });
		}
	}
};
