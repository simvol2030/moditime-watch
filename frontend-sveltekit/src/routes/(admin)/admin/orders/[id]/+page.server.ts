import { fail, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

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
	updateStatus: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const newStatus = formData.get('status')?.toString();
		const comment = formData.get('comment')?.toString() || '';
		const orderId = Number(params.id);

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
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
			queries.adminUpdateOrderStatus.run(newStatus, orderId);
			queries.adminInsertOrderStatusHistory.run(orderId, oldStatus, newStatus, 'admin', comment || null);
			return { success: true };
		} catch (err) {
			return fail(500, { error: 'Failed to update status' });
		}
	}
};
