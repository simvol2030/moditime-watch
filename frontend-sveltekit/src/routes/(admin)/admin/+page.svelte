<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
			month: 'short',
			year: 'numeric'
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
</script>

<svelte:head>
	<title>Dashboard - Moditime Admin</title>
</svelte:head>

<div class="dashboard">
	<div class="page-header">
		<h1>Dashboard</h1>
		<p class="subtitle">Welcome to Moditime Admin Panel</p>
	</div>

	<div class="stats-grid">
		<a href="/admin/products" class="stat-card">
			<div class="stat-icon">⌚</div>
			<div class="stat-content">
				<div class="stat-value">{data.stats.products}</div>
				<div class="stat-label">Products</div>
			</div>
		</a>

		<a href="/admin/brands" class="stat-card">
			<div class="stat-icon">🏷️</div>
			<div class="stat-content">
				<div class="stat-value">{data.stats.brands}</div>
				<div class="stat-label">Brands</div>
			</div>
		</a>

		<a href="/admin/categories" class="stat-card">
			<div class="stat-icon">📁</div>
			<div class="stat-content">
				<div class="stat-value">{data.stats.categories}</div>
				<div class="stat-label">Categories</div>
			</div>
		</a>

		<a href="/admin/orders" class="stat-card">
			<div class="stat-icon">📦</div>
			<div class="stat-content">
				<div class="stat-value">{data.stats.orders}</div>
				<div class="stat-label">Total Orders</div>
			</div>
		</a>

		<a href="/admin/orders?status=pending" class="stat-card highlight">
			<div class="stat-icon">⏳</div>
			<div class="stat-content">
				<div class="stat-value">{data.stats.pendingOrders}</div>
				<div class="stat-label">Pending Orders</div>
			</div>
		</a>
	</div>

	<div class="recent-orders">
		<div class="section-header">
			<h2>Recent Orders</h2>
			<a href="/admin/orders" class="view-all">View All</a>
		</div>

		{#if data.recentOrders.length > 0}
			<div class="orders-table">
				<table>
					<thead>
						<tr>
							<th>Order</th>
							<th>Customer</th>
							<th>Amount</th>
							<th>Status</th>
							<th>Date</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentOrders as order}
							<tr>
								<td>
									<a href="/admin/orders/{order.id}" class="order-link">
										{order.order_number}
									</a>
								</td>
								<td>{order.customer_name}</td>
								<td class="amount">{formatPrice(order.total_amount)}</td>
								<td>
									<span
										class="status-badge"
										style="background: {statusColors[order.status] || '#6b7280'}"
									>
										{order.status}
									</span>
								</td>
								<td class="date">{formatDate(order.created_at)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="empty-state">
				<p>No orders yet</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.dashboard {
		max-width: 1200px;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
	}

	.subtitle {
		color: #6b7280;
		margin: 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.25rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		display: flex;
		align-items: center;
		gap: 1rem;
		text-decoration: none;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.stat-card.highlight {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
	}

	.stat-icon {
		font-size: 2rem;
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.recent-orders {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.section-header h2 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.view-all {
		font-size: 0.875rem;
		color: #3b82f6;
		text-decoration: none;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.orders-table {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.75rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 500;
	}

	td {
		font-size: 0.875rem;
		color: #374151;
	}

	.order-link {
		color: #3b82f6;
		text-decoration: none;
		font-weight: 500;
	}

	.order-link:hover {
		text-decoration: underline;
	}

	.amount {
		font-family: 'SF Mono', 'Menlo', monospace;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
		text-transform: capitalize;
	}

	.date {
		color: #6b7280;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #9ca3af;
	}
</style>
