<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

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

	const statusLabels: Record<string, string> = {
		pending: 'Pending',
		confirmed: 'Confirmed',
		paid: 'Paid',
		shipped: 'Shipped',
		delivered: 'Delivered',
		cancelled: 'Cancelled'
	};

	const columns = [
		{ key: 'order_number', label: 'Order #' },
		{ key: 'customer_name', label: 'Customer' },
		{ key: 'customer_phone', label: 'Phone' },
		{ key: 'items_count', label: 'Items', width: '70px' },
		{ key: 'total_amount', label: 'Total', width: '120px' },
		{ key: 'status', label: 'Status', width: '110px' },
		{ key: 'created_at', label: 'Date', width: '140px' }
	];

	const tableData = $derived(
		data.orders.map((order) => ({
			...order,
			total_amount: formatPrice(order.total_amount),
			created_at: formatDate(order.created_at),
			status: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${statusColors[order.status] || '#6b7280'}">${statusLabels[order.status] || order.status}</span>`
		}))
	);

	const totalOrders = $derived(data.statusCounts.reduce((sum, s) => sum + s.count, 0));
</script>

<svelte:head>
	<title>Orders - Moditime Admin</title>
</svelte:head>

<PageHeader title="Orders" description="Manage customer orders" />

<div class="filters">
	<a href="/admin/orders" class="filter-btn" class:active={!data.currentFilter}>
		All ({totalOrders})
	</a>
	{#each data.statusCounts as { status, count }}
		<a
			href="/admin/orders?status={status}"
			class="filter-btn"
			class:active={data.currentFilter === status}
			style="--status-color: {statusColors[status] || '#6b7280'}"
		>
			{statusLabels[status] || status} ({count})
		</a>
	{/each}
</div>

<DataTable columns={columns} data={tableData} emptyMessage="No orders found">
	{#snippet actions(item)}
		<ActionButton href="/admin/orders/{item.id}" variant="ghost" size="sm">View</ActionButton>
	{/snippet}
</DataTable>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.filter-btn {
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		font-size: 0.875rem;
		text-decoration: none;
		background: white;
		color: #374151;
		border: 1px solid #e5e7eb;
		transition: all 0.2s;
	}

	.filter-btn:hover {
		background: #f9fafb;
	}

	.filter-btn.active {
		background: var(--status-color, #1a1a2e);
		color: white;
		border-color: var(--status-color, #1a1a2e);
	}
</style>
