import type { PageServerLoad } from './$types';
import { queries } from '$lib/server/db/database';

interface CountResult {
	count: number;
}

export const load: PageServerLoad = async () => {
	const stats = {
		products: (queries.adminCountAllProducts.get() as CountResult).count,
		brands: (queries.adminCountAllBrands.get() as CountResult).count,
		categories: (queries.adminCountAllCategories.get() as CountResult).count,
		orders: (queries.adminCountAllOrders.get() as CountResult).count,
		pendingOrders: (queries.adminCountPendingOrders.get() as CountResult).count
	};

	const recentOrders = queries.adminGetRecentOrders.all() as Array<{
		id: number;
		order_number: string;
		customer_name: string;
		total_amount: number;
		status: string;
		created_at: string;
	}>;

	return { stats, recentOrders };
};
