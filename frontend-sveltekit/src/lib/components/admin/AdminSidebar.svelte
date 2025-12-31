<script lang="ts">
	import { page } from '$app/stores';

	interface NavItem {
		label: string;
		href: string;
		icon: string;
	}

	interface NavGroup {
		title: string;
		items: NavItem[];
	}

	const navigation: NavGroup[] = [
		{
			title: 'Dashboard',
			items: [{ label: 'Overview', href: '/admin', icon: '📊' }]
		},
		{
			title: 'E-commerce',
			items: [
				{ label: 'Products', href: '/admin/products', icon: '⌚' },
				{ label: 'Brands', href: '/admin/brands', icon: '🏷️' },
				{ label: 'Categories', href: '/admin/categories', icon: '📁' },
				{ label: 'Orders', href: '/admin/orders', icon: '📦' }
			]
		},
		{
			title: 'Content',
			items: [
				{ label: 'Pages', href: '/admin/pages', icon: '📄' },
				{ label: 'Articles', href: '/admin/articles', icon: '📝' },
				{ label: 'Cities (SEO)', href: '/admin/cities', icon: '🌍' }
			]
		},
		{
			title: 'System',
			items: [
				{ label: 'Admins', href: '/admin/admins', icon: '👥' },
				{ label: 'Settings', href: '/admin/settings', icon: '⚙️' }
			]
		}
	];

	function isActive(href: string, currentPath: string): boolean {
		if (href === '/admin') {
			return currentPath === '/admin';
		}
		return currentPath.startsWith(href);
	}
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<a href="/admin" class="sidebar-logo">
			<span class="logo-icon">⌚</span>
			<span class="logo-text">Moditimewatch</span>
		</a>
	</div>

	<nav class="sidebar-nav">
		{#each navigation as group}
			<div class="nav-group">
				<h3 class="nav-group-title">{group.title}</h3>
				<ul class="nav-list">
					{#each group.items as item}
						<li>
							<a
								href={item.href}
								class="nav-link"
								class:active={isActive(item.href, $page.url.pathname)}
							>
								<span class="nav-icon">{item.icon}</span>
								<span class="nav-label">{item.label}</span>
							</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<a href="/" class="back-to-site" target="_blank">
			← Back to Site
		</a>
	</div>
</aside>

<style>
	.sidebar {
		width: 260px;
		background: #1a1a2e;
		color: white;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}

	.sidebar-header {
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar-logo {
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
		font-size: 1.125rem;
		font-weight: 600;
	}

	.sidebar-nav {
		flex: 1;
		padding: 1rem 0;
		overflow-y: auto;
	}

	.nav-group {
		margin-bottom: 1.5rem;
	}

	.nav-group-title {
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.4);
		padding: 0 1.5rem;
		margin: 0 0 0.5rem;
	}

	.nav-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 1.5rem;
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.nav-link:hover {
		color: white;
		background: rgba(255, 255, 255, 0.05);
	}

	.nav-link.active {
		color: white;
		background: rgba(59, 130, 246, 0.2);
		border-right: 3px solid #3b82f6;
	}

	.nav-icon {
		font-size: 1rem;
		width: 1.25rem;
		text-align: center;
	}

	.sidebar-footer {
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.back-to-site {
		display: block;
		color: rgba(255, 255, 255, 0.5);
		text-decoration: none;
		font-size: 0.8125rem;
		transition: color 0.2s;
	}

	.back-to-site:hover {
		color: rgba(255, 255, 255, 0.8);
	}
</style>
