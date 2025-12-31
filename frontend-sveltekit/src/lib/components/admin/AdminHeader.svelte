<script lang="ts">
	import type { AdminUser } from '$lib/server/auth';

	let { admin }: { admin: AdminUser | null } = $props();
</script>

<header class="admin-header">
	<div class="header-left">
		<h1 class="page-title">Admin Panel</h1>
	</div>

	<div class="header-right">
		{#if admin}
			<div class="user-info">
				<span class="user-name">{admin.name}</span>
				<span class="user-role">{admin.role}</span>
			</div>
			<form action="/admin/logout" method="POST">
				<button type="submit" class="logout-button">Logout</button>
			</form>
		{/if}
	</div>
</header>

<style>
	.admin-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: white;
		border-bottom: 1px solid #e5e7eb;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.page-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.125rem;
	}

	.user-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.user-role {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: capitalize;
	}

	.logout-button {
		padding: 0.5rem 1rem;
		background: transparent;
		color: #6b7280;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.logout-button:hover {
		background: #f3f4f6;
		color: #1f2937;
		border-color: #9ca3af;
	}
</style>
