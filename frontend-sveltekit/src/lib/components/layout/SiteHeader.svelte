<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cart.svelte';
	import DesktopNav from '../header/DesktopNav.svelte';
	import MobileNav from '../header/MobileNav.svelte';
	import SearchOverlay from './SearchOverlay.svelte';
	import CallbackModal from '$lib/components/ui/CallbackModal.svelte';
	import type { NavigationLink } from '$lib/types/navigation';
	import { toggleMobileMenu, getMobileMenuState, toggleTheme, initializeTheme } from '$lib/stores/ui.svelte';

	// Props - navigation из БД!
	let { navigationItems, siteConfig = {} }: { navigationItems: NavigationLink[]; siteConfig?: Record<string, string> } = $props();

	const phone = $derived(siteConfig.contact_phone || '+7 (495) 120-00-00');
	const email = $derived(siteConfig.contact_email || 'info@moditime-watch.ru');
	const phoneHref = $derived('tel:' + phone.replace(/[\s()-]/g, ''));
	const phoneMode = $derived(siteConfig.phone_mode || 'direct');

	let scrolled = $state(false);
	let isMobileMenuOpen = $state(false);
	let searchOpen = $state(false);
	let callbackOpen = $state(false);

	onMount(() => {
		// Initialize theme
		initializeTheme();

		// Scroll handler with threshold
		let ticking = false;
		const handleScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(() => {
					scrolled = window.scrollY > 50;
					if (typeof document !== 'undefined') {
						document.body.setAttribute('data-header-scrolled', String(scrolled));
					}
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});

	// Sync mobile menu state
	$effect(() => {
		isMobileMenuOpen = getMobileMenuState();
	});

	function handleToggleMobileMenu() {
		toggleMobileMenu();
	}

	function handleThemeToggle() {
		toggleTheme();
	}

	function openSearch() {
		searchOpen = true;
	}

	function handlePhoneClick(e: MouseEvent) {
		if (phoneMode === 'callback') {
			e.preventDefault();
			callbackOpen = true;
		}
	}
</script>

<header class="site-header" data-sticky>
	<!-- Topbar -->
	<div class="topbar">
		<div class="container topbar__row">
			<div class="topbar__info">
				<span class="topbar__badge">Moditimewatch Delivery</span>
				<span>Доставка премиальных часов по России и СНГ</span>
			</div>
			<div class="topbar__contacts">
				<a href={phoneHref} class="topbar__link" onclick={handlePhoneClick}>{phone}</a>
				<a href="mailto:{email}" class="topbar__link">{email}</a>
			</div>
		</div>
	</div>

	<!-- Navigation Shell -->
	<div class="nav-shell" data-sticky-anchor>
		<div class="container nav-shell__row">
			<!-- Logo -->
			<a class="site-logo" href="/">
				<span class="site-logo__wordmark">Moditimewatch</span>
				<span class="site-logo__tagline">Fine Time Delivery</span>
			</a>

			<!-- Desktop Navigation -->
			<DesktopNav items={navigationItems} />

			<!-- Actions -->
			<div class="nav-shell__actions">
				<!-- Phone (visible on mobile when topbar is hidden) -->
				<button
					class="icon-button nav-action nav-action--phone"
					type="button"
					aria-label="Позвонить"
					onclick={(e) => {
						if (phoneMode === 'callback') { callbackOpen = true; }
						else { window.location.href = phoneHref; }
					}}
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
					</svg>
				</button>

				<!-- Search -->
				<button
					class="icon-button nav-action"
					type="button"
					data-search-toggle
					aria-label="Поиск по каталогу"
					onclick={openSearch}
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="9.5" cy="9.5" r="6.5" stroke="currentColor" stroke-width="1.6" />
						<path d="M17 17L14 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
					</svg>
				</button>

				<!-- Favorites -->
				<button class="icon-button nav-action" type="button" data-badge="3" aria-label="Избранное">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M10 17.5L3.5 11C1 8.5 1 4.5 3.5 2C6 -0.5 10 1 10 4.5C10 1 14 -0.5 16.5 2C19 4.5 19 8.5 16.5 11L10 17.5Z"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<!-- Cart -->
				<button
					class="icon-button nav-action"
					type="button"
					data-badge={cart.count > 0 ? cart.count : undefined}
					aria-label="Корзина"
					onclick={() => goto('/cart')}
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M2 3H4L5.5 13.5C5.5 14.3284 6.17157 15 7 15H14C14.8284 15 15.5 14.3284 15.5 13.5L17 5H5"
							stroke="currentColor"
							stroke-width="1.6"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<circle cx="8" cy="17" r="1" fill="currentColor" />
						<circle cx="14" cy="17" r="1" fill="currentColor" />
					</svg>
				</button>

				<!-- Theme Toggle -->
				<button
					class="icon-button theme-toggle"
					type="button"
					aria-label="Переключить тему"
					onclick={handleThemeToggle}
				>
					<svg
						class="theme-toggle__icon theme-toggle__icon--sun"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
						<path
							d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
					<svg
						class="theme-toggle__icon theme-toggle__icon--moon"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				<!-- Mobile Menu Toggle -->
				<button
					class="nav-toggle"
					type="button"
					aria-controls="mobile-menu"
					aria-expanded={isMobileMenuOpen}
					onclick={handleToggleMobileMenu}
				>
					<span></span>
					<span></span>
					<span></span>
					<span class="visually-hidden">Открыть меню</span>
				</button>
			</div>
		</div>
	</div>
</header>

<!-- Mobile Navigation Drawer -->
<MobileNav items={navigationItems} isOpen={isMobileMenuOpen} />

<!-- Search Overlay -->
<SearchOverlay bind:open={searchOpen} />

<!-- Callback Modal -->
<CallbackModal open={callbackOpen} {phone} onclose={() => callbackOpen = false} />

<style>
	/* Topbar */
	.topbar {
		border-bottom: 1px solid var(--color-border);
		max-height: 200px;
		will-change: max-height, opacity;
		transition:
			border-color 0.3s ease,
			opacity 0.3s ease,
			max-height 0.3s ease,
			padding 0.3s ease;
	}

	.topbar__row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-lg);
		padding: 0.375rem 0;
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	:global(body[data-header-scrolled='true']) .topbar {
		max-height: 0;
		padding: 0;
		opacity: 0;
		border-bottom-color: transparent;
		pointer-events: none;
		overflow: hidden;
	}

	.topbar__info {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-sm);
	}

	.topbar__badge {
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		background-color: rgba(212, 175, 55, 0.12);
		color: var(--color-gold);
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.topbar__contacts {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
	}

	.topbar__link {
		color: inherit;
		transition: color var(--transition-fast);
		text-decoration: none;
	}

	.topbar__link:hover {
		color: var(--color-primary);
	}

	/* Site header */
	.site-header {
		position: sticky;
		top: 0;
		z-index: var(--header-z);
		backdrop-filter: blur(16px);
		background-color: rgba(255, 255, 255, 0.88);
		border-bottom: 1px solid var(--color-border);
		transition:
			transform var(--transition-normal),
			background-color var(--transition-normal),
			border-color var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	:global(body[data-header-scrolled='true']) .site-header {
		box-shadow: var(--shadow-sm);
		background-color: rgba(255, 255, 255, 0.95);
	}

	:global(body[data-theme='dark']) .site-header {
		background-color: rgba(10, 12, 18, 0.95);
		border-color: rgba(124, 150, 196, 0.2);
	}

	:global(body[data-theme='dark'][data-header-scrolled='true']) .site-header {
		background-color: rgba(10, 12, 18, 0.98);
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
	}

	/* Nav shell */
	.nav-shell {
		padding: var(--space-md) 0;
	}

	.nav-shell__row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-lg);
	}

	/* Mobile toggle */
	.nav-toggle {
		display: none;
		flex-direction: column;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		background: none;
		border: none;
		cursor: pointer;
		gap: 6px;
	}

	.nav-toggle span:not(.visually-hidden) {
		display: block;
		width: 24px;
		height: 2px;
		background-color: var(--color-text);
		border-radius: 2px;
		transition:
			transform var(--transition-fast),
			opacity var(--transition-fast);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* Logo */
	.site-logo {
		display: flex;
		flex-direction: column;
		text-decoration: none;
		color: var(--color-text);
	}

	.site-logo__wordmark {
		font-family: var(--font-accent);
		font-size: 1.25rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	.site-logo__tagline {
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		opacity: 0.6;
		margin-top: 2px;
	}

	/* Nav actions */
	.nav-shell__actions {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.icon-button {
		position: relative;
		width: 40px;
		height: 40px;
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

	:global(body[data-theme='dark']) .icon-button:hover {
		background-color: rgba(124, 150, 196, 0.15);
	}

	.icon-button[data-badge]::after {
		content: attr(data-badge);
		position: absolute;
		top: -4px;
		right: -4px;
		min-width: 18px;
		height: 18px;
		padding: 0 4px;
		border-radius: var(--radius-pill);
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		font-size: 0.65rem;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	/* Theme toggle */
	.theme-toggle__icon {
		width: 20px;
		height: 20px;
		stroke: currentColor;
	}

	:global([data-theme='light']) .theme-toggle__icon--sun {
		display: block;
	}

	:global([data-theme='dark']) .theme-toggle__icon--moon {
		display: block;
	}

	:global([data-theme='light']) .theme-toggle__icon--moon {
		display: none;
	}

	:global([data-theme='dark']) .theme-toggle__icon--sun {
		display: none;
	}

	/* Phone icon - hidden on desktop by default, visible when topbar is gone */
	.nav-action--phone {
		display: none;
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.topbar__info span:not(.topbar__badge) {
			display: none;
		}

		.nav-toggle {
			display: flex;
		}
	}

	@media (max-width: 640px) {
		.topbar {
			display: none;
		}

		/* Show phone icon on mobile since topbar is hidden */
		.nav-action--phone {
			display: flex;
		}

		.nav-shell {
			padding: var(--space-sm) 0;
		}

		.nav-shell__row {
			gap: var(--space-md);
		}

		.nav-shell__actions {
			gap: 0.25rem;
		}
	}
</style>
