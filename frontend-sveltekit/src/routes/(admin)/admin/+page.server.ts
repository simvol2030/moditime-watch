import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';

interface CountResult {
	count: number;
}

const countProducts = db.prepare('SELECT COUNT(*) as count FROM products');
const countBrands = db.prepare('SELECT COUNT(*) as count FROM brands');
const countCategories = db.prepare('SELECT COUNT(*) as count FROM categories');
const countOrders = db.prepare('SELECT COUNT(*) as count FROM orders');
const countPendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'");
const getRecentOrders = db.prepare(`
	SELECT id, order_number, customer_name, total_amount, status, created_at
	FROM orders
	ORDER BY created_at DESC
	LIMIT 5
`);

export const load: PageServerLoad = async () => {
	const stats = {
		products: (countProducts.get() as CountResult).count,
		brands: (countBrands.get() as CountResult).count,
		categories: (countCategories.get() as CountResult).count,
		orders: (countOrders.get() as CountResult).count,
		pendingOrders: (countPendingOrders.get() as CountResult).count
	};

	const recentOrders = getRecentOrders.all() as Array<{
		id: number;
		order_number: string;
		customer_name: string;
		total_amount: number;
		status: string;
		created_at: string;
	}>;

	return { stats, recentOrders };
};
