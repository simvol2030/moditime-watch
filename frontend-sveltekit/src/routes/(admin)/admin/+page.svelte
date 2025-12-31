<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Dashboard | Moditimewatch Admin</title>
</svelte:head>

<div class="dashboard">
	<h1>Welcome, {data.admin?.name}!</h1>
	<p class="subtitle">Moditimewatch Admin Dashboard</p>

	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-icon">⌚</div>
			<div class="stat-content">
				<div class="stat-label">Products</div>
				<div class="stat-value">-</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">📦</div>
			<div class="stat-content">
				<div class="stat-label">Orders</div>
				<div class="stat-value">-</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🏷️</div>
			<div class="stat-content">
				<div class="stat-label">Brands</div>
				<div class="stat-value">-</div>
			</div>
		</div>

		<div class="stat-card">
			<div class="stat-icon">🌍</div>
			<div class="stat-content">
				<div class="stat-label">Cities (SEO)</div>
				<div class="stat-value">-</div>
			</div>
		</div>
	</div>

	<div class="quick-actions">
		<h2>Quick Actions</h2>
		<div class="actions-grid">
			<a href="/admin/products" class="action-card">
				<span class="action-icon">➕</span>
				<span class="action-label">Manage Products</span>
			</a>
			<a href="/admin/orders" class="action-card">
				<span class="action-icon">📋</span>
				<span class="action-label">View Orders</span>
			</a>
			<a href="/admin/pages" class="action-card">
				<span class="action-icon">✏️</span>
				<span class="action-label">Edit Pages</span>
			</a>
			<a href="/admin/settings" class="action-card">
				<span class="action-icon">⚙️</span>
				<span class="action-label">Settings</span>
			</a>
		</div>
	</div>
</div>

<style>
	.dashboard {
		max-width: 1200px;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.5rem;
	}

	.subtitle {
		color: #6b7280;
		margin: 0 0 2rem;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.stat-icon {
		font-size: 2rem;
		width: 3rem;
		height: 3rem;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f3f4f6;
		border-radius: 10px;
	}

	.stat-content {
		flex: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #6b7280;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
	}

	.quick-actions {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.quick-actions h2 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem;
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1.25rem;
		background: #f9fafb;
		border-radius: 10px;
		text-decoration: none;
		transition: all 0.2s;
	}

	.action-card:hover {
		background: #f3f4f6;
		transform: translateY(-2px);
	}

	.action-icon {
		font-size: 1.5rem;
	}

	.action-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}
</style>
