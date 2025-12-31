import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

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

const listOrders = db.prepare(`
	SELECT o.*,
		(SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
	FROM orders o
	ORDER BY o.created_at DESC
`);

export const load: PageServerLoad = async ({ url }) => {
	const statusFilter = url.searchParams.get('status');

	let orders: Order[];
	if (statusFilter) {
		const filteredQuery = db.prepare(`
			SELECT o.*,
				(SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
			FROM orders o
			WHERE o.status = ?
			ORDER BY o.created_at DESC
		`);
		orders = filteredQuery.all(statusFilter) as Order[];
	} else {
		orders = listOrders.all() as Order[];
	}

	// Get status counts for filters
	const statusCounts = db.prepare(`
		SELECT status, COUNT(*) as count
		FROM orders
		GROUP BY status
	`).all() as { status: string; count: number }[];

	return { orders, statusCounts, currentFilter: statusFilter };
};
