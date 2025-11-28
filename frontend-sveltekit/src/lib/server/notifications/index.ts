/**
 * Notifications module - exports all notification functions
 */

export { sendOrderEmail, sendAdminOrderEmail } from './email';
export type { OrderData, OrderItem } from './email';
export { sendTelegramNotification } from './telegram';
