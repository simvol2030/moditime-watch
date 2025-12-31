import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const getOrder = db.prepare('SELECT * FROM orders WHERE id = ?');
const getOrderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
const getStatusHistory = db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at DESC');
const updateOrderStatus = db.prepare(`
	UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?
`);
const insertStatusHistory = db.prepare(`
	INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, comment)
	VALUES (?, ?, ?, ?, ?)
`);

export const load: PageServerLoad = async ({ params }) => {
	const order = getOrder.get(Number(params.id)) as Order | undefined;

	if (!order) {
		throw error(404, 'Order not found');
	}

	const items = getOrderItems.all(order.id) as OrderItem[];
	const history = getStatusHistory.all(order.id) as StatusHistory[];

	return { order, items, history };
};

export const actions: Actions = {
	updateStatus: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const newStatus = formData.get('status')?.toString();
		const comment = formData.get('comment')?.toString() || '';
		const orderId = Number(params.id);

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		const order = getOrder.get(orderId) as Order | undefined;
		if (!order) {
			return fail(404, { error: 'Order not found' });
		}

		const oldStatus = order.status;

		if (oldStatus === newStatus) {
			return fail(400, { error: 'Status is already ' + newStatus });
		}

		try {
			updateOrderStatus.run(newStatus, orderId);
			insertStatusHistory.run(orderId, oldStatus, newStatus, 'admin', comment || null);
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Failed to update status' });
		}
	}
};
