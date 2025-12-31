<script lang="ts">
	import { page } from '$app/stores';
	import type { AdminUser } from '$lib/server/auth';

	interface NavItem {
		label: string;
		href: string;
		icon: string;
		group?: string;
	}

	let { admin }: { admin: AdminUser | null } = $props();

	const navItems: NavItem[] = [
		{ label: 'Dashboard', href: '/admin', icon: '📊', group: 'Main' },
		{ label: 'Products', href: '/admin/products', icon: '⌚', group: 'E-commerce' },
		{ label: 'Brands', href: '/admin/brands', icon: '🏷️', group: 'E-commerce' },
		{ label: 'Categories', href: '/admin/categories', icon: '📁', group: 'E-commerce' },
		{ label: 'Orders', href: '/admin/orders', icon: '📦', group: 'Operations' },
		{ label: 'Pages', href: '/admin/pages', icon: '📄', group: 'Content' },
		{ label: 'Admins', href: '/admin/system/admins', icon: '👤', group: 'System' },
		{ label: 'Config', href: '/admin/system/config', icon: '⚙️', group: 'System' }
	];

	// Group items
	const groupedItems = $derived.by(() => {
		const groups: Record<string, NavItem[]> = {};
		for (const item of navItems) {
			const group = item.group || 'Other';
			if (!groups[group]) groups[group] = [];
			groups[group].push(item);
		}
		return groups;
	});

	function isActive(href: string): boolean {
		if (href === '/admin') {
			return $page.url.pathname === '/admin';
		}
		return $page.url.pathname.startsWith(href);
	}
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<a href="/admin" class="logo">
			<span class="logo-icon">⌚</span>
			<span class="logo-text">Moditime</span>
		</a>
	</div>

	<nav class="sidebar-nav">
		{#each Object.entries(groupedItems) as [group, items]}
			<div class="nav-group">
				<div class="nav-group-label">{group}</div>
				{#each items as item}
					<a href={item.href} class="nav-item" class:active={isActive(item.href)}>
						<span class="nav-icon">{item.icon}</span>
						<span class="nav-label">{item.label}</span>
					</a>
				{/each}
			</div>
		{/each}
	</nav>

	<div class="sidebar-footer">
		{#if admin}
			<div class="user-info">
				<div class="user-avatar">{admin.name.charAt(0).toUpperCase()}</div>
				<div class="user-details">
					<div class="user-name">{admin.name}</div>
					<div class="user-role">{admin.role}</div>
				</div>
			</div>
		{/if}
		<form action="/admin/logout" method="POST" class="logout-form">
			<button type="submit" class="logout-btn">Sign Out</button>
		</form>
	</div>
</aside>

<style>
	.sidebar {
		width: 260px;
		background: #1a1a2e;
		color: white;
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
		left: 0;
		top: 0;
	}

	.sidebar-header {
		padding: 1.25rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		text-decoration: none;
		color: white;
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.logo-text {
		font-size: 1.25rem;
		font-weight: 700;
	}

	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		padding: 1rem 0;
	}

	.nav-group {
		margin-bottom: 1.5rem;
	}

	.nav-group-label {
		padding: 0 1.25rem;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.4);
		margin-bottom: 0.5rem;
	}

	.nav-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1.25rem;
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		transition: all 0.2s;
	}

	.nav-item:hover {
		background: rgba(255, 255, 255, 0.05);
		color: white;
	}

	.nav-item.active {
		background: rgba(255, 255, 255, 0.1);
		color: white;
		border-right: 3px solid #3b82f6;
	}

	.nav-icon {
		font-size: 1.125rem;
		width: 1.5rem;
		text-align: center;
	}

	.nav-label {
		font-size: 0.9375rem;
	}

	.sidebar-footer {
		padding: 1rem 1.25rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		background: #3b82f6;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
	}

	.user-details {
		flex: 1;
		min-width: 0;
	}

	.user-name {
		font-weight: 500;
		font-size: 0.875rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.user-role {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		text-transform: capitalize;
	}

	.logout-form {
		margin: 0;
	}

	.logout-btn {
		width: 100%;
		padding: 0.625rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.7);
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.logout-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.3);
		color: white;
	}
</style>
