import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { queries, db } from '$lib/server/db/database';
import {
	sendOrderConfirmation,
	sendOrderAdminNotification,
	sendTelegramNotification,
	type OrderData
} from '$lib/server/notifications';

// Generate unique order number
function generateOrderNumber(): string {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 6).toUpperCase();
	return `MW-${timestamp}-${random}`;
}

interface CartItem {
	id: string;
	name: string;
	brand: string;
	price: number;
	quantity: number;
	sku?: string;
}

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Extract form fields
		const name = formData.get('name')?.toString().trim();
		const phone = formData.get('phone')?.toString().trim();
		const email = formData.get('email')?.toString().trim() || null;
		const address = formData.get('address')?.toString().trim();
		const comment = formData.get('comment')?.toString().trim() || null;
		const cartJson = formData.get('cart')?.toString();

		// Validation
		if (!name || name.length < 2) {
			return fail(400, { error: 'Укажите имя (минимум 2 символа)', field: 'name' as const });
		}

		if (!phone || phone.length < 10) {
			return fail(400, { error: 'Укажите корректный телефон', field: 'phone' as const });
		}

		if (!address || address.length < 5) {
			return fail(400, { error: 'Укажите адрес доставки', field: 'address' as const });
		}

		if (!cartJson) {
			return fail(400, { error: 'Корзина пуста', field: null });
		}

		let cartItems: CartItem[];
		try {
			cartItems = JSON.parse(cartJson);
			if (!Array.isArray(cartItems) || cartItems.length === 0) {
				return fail(400, { error: 'Корзина пуста', field: null });
			}
		} catch {
			return fail(400, { error: 'Ошибка данных корзины', field: null });
		}

		// Calculate total
		const totalAmount = cartItems.reduce(
			(sum, item) => sum + item.price * 100 * item.quantity,
			0
		); // Convert rubles to kopecks

		// Generate order number
		const orderNumber = generateOrderNumber();

		try {
			// Use transaction to ensure data consistency
			const createOrder = db.transaction(() => {
				// Insert order
				const orderResult = queries.insertOrder.run(
					orderNumber,
					name,
					phone,
					email,
					address,
					comment,
					totalAmount
				);

				const orderId = orderResult.lastInsertRowid;

				// Insert order items
				for (const item of cartItems) {
					// Find product in DB to get real product_id
					const productResult = queries.getProductBySlug.get(item.id) as
						| { id: number }
						| undefined;
					const productId = productResult?.id || null;

					queries.insertOrderItem.run(
						orderId,
						productId,
						item.name,
						item.brand,
						item.sku || `SKU-${item.id}`,
						item.price * 100, // kopecks
						item.quantity,
						item.price * 100 * item.quantity
					);
				}

				// Insert status history
				queries.insertOrderStatusHistory.run(orderId);

				return { orderId, orderNumber };
			});

			const { orderNumber: confirmedOrder } = createOrder();

			// Prepare order data for notifications
			const orderData: OrderData = {
				orderNumber: confirmedOrder,
				customerName: name,
				customerPhone: phone,
				customerEmail: email,
				address,
				comment,
				totalAmount,
				items: cartItems.map((item) => ({
					name: item.name,
					brand: item.brand,
					price: item.price * 100, // kopecks
					quantity: item.quantity
				}))
			};

			// Send notifications (don't block order creation on failure)
			try {
				await Promise.all([
					sendOrderConfirmation(orderData),
					sendOrderAdminNotification(orderData),
					sendTelegramNotification(orderData)
				]);
			} catch (notificationError) {
				// Log but don't fail - order is already saved
				console.error('Notification error (order saved successfully):', notificationError);
			}

			// Redirect to success page with order number
			throw redirect(303, `/order/success?order=${confirmedOrder}`);
		} catch (e) {
			// Re-throw redirects
			if (e && typeof e === 'object' && 'status' in e && e.status === 303) {
				throw e;
			}

			console.error('Order creation error:', e);
			return fail(500, { error: 'Ошибка при создании заказа. Попробуйте позже.', field: null });
		}
	}
};
