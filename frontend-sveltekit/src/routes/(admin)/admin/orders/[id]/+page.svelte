<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	function formatPrice(kopecks: number): string {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0
		}).format(kopecks / 100);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const statusColors: Record<string, string> = {
		pending: '#f59e0b',
		confirmed: '#3b82f6',
		paid: '#10b981',
		shipped: '#6366f1',
		delivered: '#22c55e',
		cancelled: '#ef4444'
	};

	const statusOptions = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'confirmed', label: 'Confirmed' },
		{ value: 'paid', label: 'Paid' },
		{ value: 'shipped', label: 'Shipped' },
		{ value: 'delivered', label: 'Delivered' },
		{ value: 'cancelled', label: 'Cancelled' }
	];
</script>

<svelte:head>
	<title>Order {data.order.order_number} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Order {data.order.order_number}">
	{#snippet actions()}
		<ActionButton href="/admin/orders" variant="secondary">Back to Orders</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

{#if form?.success}
	<div class="success-message">Status updated successfully</div>
{/if}

<div class="order-layout">
	<div class="main-content">
		<!-- Order Items -->
		<div class="card">
			<h3>Order Items</h3>
			<table class="items-table">
				<thead>
					<tr>
						<th>Product</th>
						<th>SKU</th>
						<th>Price</th>
						<th>Qty</th>
						<th>Subtotal</th>
					</tr>
				</thead>
				<tbody>
					{#each data.items as item}
						<tr>
							<td>
								<div class="product-name">{item.product_name}</div>
								<div class="product-brand">{item.product_brand}</div>
							</td>
							<td class="sku">{item.product_sku || '-'}</td>
							<td class="price">{formatPrice(item.price)}</td>
							<td class="qty">{item.quantity}</td>
							<td class="subtotal">{formatPrice(item.subtotal)}</td>
						</tr>
					{/each}
				</tbody>
				<tfoot>
					<tr>
						<td colspan="4" class="total-label">Total:</td>
						<td class="total-value">{formatPrice(data.order.total_amount)}</td>
					</tr>
				</tfoot>
			</table>
		</div>

		<!-- Customer Info -->
		<div class="card">
			<h3>Customer Information</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name</span>
					<span class="info-value">{data.order.customer_name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Phone</span>
					<span class="info-value">{data.order.customer_phone}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Email</span>
					<span class="info-value">{data.order.customer_email || '-'}</span>
				</div>
				<div class="info-item full-width">
					<span class="info-label">Delivery Address</span>
					<span class="info-value">{data.order.delivery_address}</span>
				</div>
				{#if data.order.delivery_comment}
					<div class="info-item full-width">
						<span class="info-label">Delivery Comment</span>
						<span class="info-value">{data.order.delivery_comment}</span>
					</div>
				{/if}
			</div>
		</div>

		<!-- Status History -->
		<div class="card">
			<h3>Status History</h3>
			{#if data.history.length > 0}
				<div class="history-list">
					{#each data.history as entry}
						<div class="history-item">
							<div class="history-status">
								{#if entry.old_status}
									<span class="old-status">{entry.old_status}</span>
									<span class="arrow">→</span>
								{/if}
								<span
									class="new-status"
									style="background: {statusColors[entry.new_status] || '#6b7280'}"
								>
									{entry.new_status}
								</span>
							</div>
							<div class="history-meta">
								<span class="history-by">{entry.changed_by || 'System'}</span>
								<span class="history-date">{formatDate(entry.changed_at)}</span>
							</div>
							{#if entry.comment}
								<div class="history-comment">{entry.comment}</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="empty">No status history</p>
			{/if}
		</div>
	</div>

	<div class="sidebar">
		<!-- Current Status -->
		<div class="card">
			<h3>Order Status</h3>
			<div class="current-status">
				<span
					class="status-badge"
					style="background: {statusColors[data.order.status] || '#6b7280'}"
				>
					{data.order.status}
				</span>
			</div>
			<div class="order-dates">
				<div class="date-item">
					<span class="date-label">Created</span>
					<span class="date-value">{formatDate(data.order.created_at)}</span>
				</div>
				<div class="date-item">
					<span class="date-label">Updated</span>
					<span class="date-value">{formatDate(data.order.updated_at)}</span>
				</div>
			</div>
		</div>

		<!-- Update Status -->
		<div class="card">
			<h3>Update Status</h3>
			<form
				method="POST"
				action="?/updateStatus"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						await update();
						loading = false;
					};
				}}
			>
				<FormSelect
					label="New Status"
					name="status"
					options={statusOptions}
					value={data.order.status}
					required
				/>

				<FormTextarea
					label="Comment (optional)"
					name="comment"
					placeholder="Add a note about this status change..."
					rows={3}
				/>

				<ActionButton type="submit" variant="primary" disabled={loading}>
					{loading ? 'Updating...' : 'Update Status'}
				</ActionButton>
			</form>
		</div>
	</div>
</div>

<style>
	.order-layout {
		display: grid;
		grid-template-columns: 1fr 320px;
		gap: 1.5rem;
	}

	@media (max-width: 1024px) {
		.order-layout {
			grid-template-columns: 1fr;
		}
	}

	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.items-table {
		width: 100%;
		border-collapse: collapse;
	}

	.items-table th,
	.items-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	.items-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 500;
	}

	.product-name {
		font-weight: 500;
		color: #1f2937;
	}

	.product-brand {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.sku {
		font-family: monospace;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.price,
	.subtotal {
		font-family: monospace;
	}

	.qty {
		text-align: center;
	}

	.total-label {
		text-align: right;
		font-weight: 600;
	}

	.total-value {
		font-weight: 600;
		font-family: monospace;
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-item.full-width {
		grid-column: span 2;
	}

	.info-label {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
	}

	.info-value {
		color: #1f2937;
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.history-item {
		padding-bottom: 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.history-item:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.history-status {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.old-status {
		color: #6b7280;
		text-transform: capitalize;
	}

	.arrow {
		color: #9ca3af;
	}

	.new-status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
		text-transform: capitalize;
	}

	.history-meta {
		display: flex;
		gap: 1rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.history-comment {
		margin-top: 0.5rem;
		font-size: 0.875rem;
		color: #374151;
		font-style: italic;
	}

	.current-status {
		margin-bottom: 1rem;
	}

	.status-badge {
		display: inline-block;
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
		color: white;
		text-transform: capitalize;
	}

	.order-dates {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.date-item {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
	}

	.date-label {
		color: #6b7280;
	}

	.date-value {
		color: #374151;
	}

	.empty {
		color: #9ca3af;
		text-align: center;
		padding: 1rem;
	}

	.error-message {
		background: #fee2e2;
		border: 1px solid #ef4444;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.success-message {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.sidebar form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
