import type { PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface Order {
	id: number;
	order_number: string;
	customer_name: string;
	customer_phone: string;
	customer_email: string | null;
	delivery_address: string;
	total_amount: number;
	status: string;
	items_count: number;
	created_at: string;
}

export const load: PageServerLoad = async ({ url }) => {
	const statusFilter = url.searchParams.get('status');

	let orders: Order[];
	if (statusFilter) {
		orders = queries.adminListOrdersByStatus.all(statusFilter) as Order[];
	} else {
		orders = queries.adminListOrders.all() as Order[];
	}

	// Get status counts for filters
	const statusCounts = queries.adminGetOrderStatusCounts.all() as { status: string; count: number }[];

	return { orders, statusCounts, currentFilter: statusFilter };
};
