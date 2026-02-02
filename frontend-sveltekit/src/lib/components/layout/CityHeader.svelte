<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { toggleTheme, initializeTheme } from '$lib/stores/ui.svelte';
	import { onMount } from 'svelte';
	import { getNavigationHref } from '$lib/types/navigation';

	let {
		siteConfig = {},
		cityNavItems = []
	}: {
		siteConfig?: Record<string, string>;
		cityNavItems?: { label: string; href: string; isMainDomainOnly?: boolean }[];
	} = $props();

	const cityName = $derived(($page.data as any)?.city?.name || '');
	const citySlug = $derived(($page.data as any)?.city?.slug || '');

	const phone = $derived(siteConfig.contact_phone || '+7 (495) 120-00-00');
	const phoneHref = $derived('tel:' + phone.replace(/[\s()-]/g, ''));

	let searchQuery = $state('');

	onMount(() => {
		initializeTheme();
	});

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	}

	function handleThemeToggle() {
		toggleTheme();
	}
</script>

<header class="city-header">
	<div class="container city-header__row">
		<!-- Logo -->
		<a class="site-logo" href="/">
			<span class="site-logo__wordmark">Moditimewatch</span>
			<span class="site-logo__tagline">Fine Time Delivery</span>
		</a>

		<!-- City name badge -->
		{#if cityName}
			<a href="/city/{citySlug}" class="city-header__city-badge">
				Часы в {cityName}
			</a>
		{/if}

		<!-- Back to main catalog -->
		<a href="/" class="city-header__back">
			<span class="city-header__back-arrow">&larr;</span>
			<span>Главный каталог</span>
		</a>

		<!-- City nav items -->
		{#if cityNavItems.length > 0}
			<nav class="city-header__nav">
				{#each cityNavItems as item}
					{@const href = getNavigationHref(item)}
					<a {href} class="city-header__nav-link">{item.label}</a>
				{/each}
			</nav>
		{/if}

		<!-- Search + Actions -->
		<div class="city-header__actions">
			<form class="city-header__search" onsubmit={handleSearch}>
				<input
					type="text"
					placeholder="Поиск часов..."
					bind:value={searchQuery}
					class="city-header__search-input"
				/>
				<button type="submit" class="city-header__search-btn" aria-label="Поиск">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none">
						<circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" stroke-width="1.6" />
						<path d="M17 17L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				</button>
			</form>

			<a href={phoneHref} class="city-header__phone">{phone}</a>

			<button
				class="icon-button theme-toggle"
				type="button"
				aria-label="Переключить тему"
				onclick={handleThemeToggle}
			>
				<svg class="theme-toggle__icon theme-toggle__icon--sun" width="18" height="18" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
					<path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
				</svg>
				<svg class="theme-toggle__icon theme-toggle__icon--moon" width="18" height="18" viewBox="0 0 24 24" fill="none">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</button>
		</div>
	</div>
</header>

<style>
	.city-header {
		position: sticky;
		top: 0;
		z-index: var(--header-z, 100);
		backdrop-filter: blur(16px);
		background-color: rgba(255, 255, 255, 0.95);
		border-bottom: 1px solid var(--color-border);
		padding: var(--space-sm) 0;
	}

	:global(body[data-theme='dark']) .city-header {
		background-color: rgba(10, 12, 18, 0.95);
		border-color: rgba(124, 150, 196, 0.2);
	}

	.city-header__row {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
	}

	.site-logo {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: var(--color-text);
		flex-shrink: 0;
	}

	.site-logo__wordmark {
		font-family: var(--font-accent);
		font-size: 1.125rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.site-logo__tagline {
		font-size: 0.5625rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		opacity: 0.6;
		margin-top: 2px;
	}

	.city-header__city-badge {
		display: inline-block;
		padding: var(--space-2xs) var(--space-sm);
		background: var(--color-primary);
		color: var(--color-white);
		border-radius: var(--radius-sm);
		font-size: 0.8125rem;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
		transition: background-color var(--transition-fast);
	}

	.city-header__city-badge:hover {
		background: var(--color-primary-dark, #1a4a8a);
	}

	.city-header__back {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-primary);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 500;
		transition: gap var(--transition-fast);
		flex-shrink: 0;
	}

	.city-header__back:hover {
		gap: var(--space-sm);
	}

	.city-header__back-arrow {
		font-size: 1.125rem;
	}

	.city-header__nav {
		display: flex;
		gap: var(--space-md);
	}

	.city-header__nav-link {
		color: var(--color-text-soft);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color var(--transition-fast);
	}

	.city-header__nav-link:hover {
		color: var(--color-primary);
	}

	.city-header__actions {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-left: auto;
	}

	.city-header__search {
		display: flex;
		align-items: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.city-header__search-input {
		padding: 0.375rem 0.625rem;
		border: none;
		outline: none;
		font-size: 0.875rem;
		width: 180px;
		background: transparent;
		color: var(--color-text);
	}

	.city-header__search-btn {
		padding: 0.375rem 0.5rem;
		border: none;
		background: none;
		cursor: pointer;
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
	}

	.city-header__search-btn:hover {
		color: var(--color-primary);
	}

	.city-header__phone {
		color: var(--color-text);
		text-decoration: none;
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.icon-button {
		position: relative;
		width: 36px;
		height: 36px;
		padding: 0;
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.icon-button:hover {
		background-color: var(--color-border);
	}

	:global(body[data-theme='dark']) .icon-button {
		border-color: rgba(124, 150, 196, 0.3);
		background-color: rgba(124, 150, 196, 0.08);
	}

	/* Theme toggle */
	:global([data-theme='light']) .theme-toggle__icon--sun { display: block; }
	:global([data-theme='dark']) .theme-toggle__icon--moon { display: block; }
	:global([data-theme='light']) .theme-toggle__icon--moon { display: none; }
	:global([data-theme='dark']) .theme-toggle__icon--sun { display: none; }

	@media (max-width: 768px) {
		.city-header__row {
			flex-wrap: wrap;
			gap: var(--space-sm);
		}

		.city-header__nav {
			display: none;
		}

		.city-header__search-input {
			width: 120px;
		}

		.city-header__phone {
			display: none;
		}
	}
</style>
