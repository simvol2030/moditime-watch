<script lang="ts">
	import type { NavigationLink } from '$lib/types/navigation';
	import { closeMobileMenu } from '$lib/stores/ui.svelte';

	let { items = [], isOpen = false }: { items: NavigationLink[]; isOpen: boolean } = $props();

	let activeDropdown = $state<string | null>(null);

	function toggleDropdown(label: string) {
		activeDropdown = activeDropdown === label ? null : label;
	}

	function handleClose() {
		activeDropdown = null;
		closeMobileMenu();
	}

	function handleOverlayClick() {
		handleClose();
	}

	function handleLinkClick() {
		handleClose();
	}

	// Handle ESC key
	$effect(() => {
		if (typeof window !== 'undefined' && isOpen) {
			function handleKeydown(e: KeyboardEvent) {
				if (e.key === 'Escape') {
					handleClose();
				}
			}

			document.addEventListener('keydown', handleKeydown);

			return () => {
				document.removeEventListener('keydown', handleKeydown);
			};
		}
	});
</script>

{#if isOpen}
	<div class="mobile-nav" class:open={isOpen}>
		<!-- Overlay/Backdrop -->
		<div class="mobile-nav__overlay" onclick={handleOverlayClick}></div>

		<!-- Drawer Content -->
		<nav class="mobile-nav__drawer">
			<!-- Header -->
			<div class="mobile-nav__header">
				<a href="/" class="mobile-nav__logo" onclick={handleLinkClick}>
					<span class="mobile-nav__logo-text">Moditimewatch</span>
				</a>
				<button class="mobile-nav__close" onclick={handleClose} aria-label="Закрыть меню">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>

			<!-- Navigation List -->
			<ul class="mobile-nav__list">
				{#each items as item}
					<li class="mobile-nav__item">
						{#if item.submenu}
							<button
								class="mobile-nav__link mobile-nav__link--dropdown"
								class:active={activeDropdown === item.label}
								onclick={() => toggleDropdown(item.label)}
							>
								<span>{item.label}</span>
								<svg
									class="mobile-nav__arrow"
									class:rotated={activeDropdown === item.label}
									width="16"
									height="16"
									viewBox="0 0 16 16"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
								</svg>
							</button>
							{#if activeDropdown === item.label}
								<ul class="mobile-nav__submenu">
									{#each item.submenu as child}
										<li class="mobile-nav__submenu-item">
											<a href={child.href} class="mobile-nav__submenu-link" onclick={handleLinkClick}>
												{child.label}
											</a>
										</li>
									{/each}
								</ul>
							{/if}
						{:else}
							<a href={item.href} class="mobile-nav__link" onclick={handleLinkClick}>
								{item.label}
							</a>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>
	</div>
{/if}

<style>
	.mobile-nav {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 9999;
		pointer-events: none;
	}

	.mobile-nav.open {
		pointer-events: auto;
	}

	.mobile-nav__overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		animation: overlayFadeIn 0.3s ease;
		cursor: pointer;
	}

	.mobile-nav__drawer {
		position: absolute;
		top: 0;
		right: 0;
		width: 90%;
		max-width: 400px;
		height: 100%;
		background: var(--color-surface);
		box-shadow: var(--shadow-xl);
		display: flex;
		flex-direction: column;
		animation: drawerSlideIn 0.3s ease;
		overflow-y: auto;
	}

	.mobile-nav__header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.5rem;
		border-bottom: 1px solid var(--color-border);
		flex-shrink: 0;
	}

	.mobile-nav__logo {
		text-decoration: none;
	}

	.mobile-nav__logo-text {
		font-family: var(--font-primary);
		font-size: var(--font-size-h3);
		font-weight: 700;
		color: var(--color-primary);
	}

	.mobile-nav__close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-text);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mobile-nav__close:hover {
		background: var(--color-background);
		color: var(--color-primary);
	}

	.mobile-nav__list {
		flex: 1;
		list-style: none;
		margin: 0;
		padding: 1rem;
		overflow-y: auto;
	}

	.mobile-nav__item {
		border-bottom: 1px solid var(--color-border);
	}

	.mobile-nav__item:last-child {
		border-bottom: none;
	}

	.mobile-nav__link {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 1rem;
		font-family: var(--font-accent);
		font-size: var(--font-size-body-lg);
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}

	.mobile-nav__link:hover {
		background: var(--color-background);
		color: var(--color-primary);
	}

	.mobile-nav__link.active {
		color: var(--color-primary);
	}

	.mobile-nav__arrow {
		flex-shrink: 0;
		transition: transform 0.2s ease;
	}

	.mobile-nav__arrow.rotated {
		transform: rotate(180deg);
	}

	.mobile-nav__submenu {
		list-style: none;
		margin: 0;
		padding: 0;
		animation: submenuExpand 0.2s ease;
		border-top: 1px solid var(--color-border);
	}

	.mobile-nav__submenu-item {
		border-bottom: 1px solid rgba(124, 150, 196, 0.1);
	}

	.mobile-nav__submenu-item:last-child {
		border-bottom: none;
	}

	.mobile-nav__submenu-link {
		display: block;
		position: relative;
		padding: 0.5rem 1rem 0.5rem 2.5rem;
		font-family: var(--font-accent);
		font-size: var(--font-size-body-md);
		color: var(--color-text-soft);
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.mobile-nav__submenu-link::before {
		content: '→';
		position: absolute;
		left: 1.25rem;
		color: var(--color-primary);
		opacity: 0.6;
		font-size: 1rem;
	}

	.mobile-nav__submenu-link:hover {
		background: var(--color-background);
		color: var(--color-primary);
	}

	.mobile-nav__submenu-link:hover::before {
		opacity: 1;
	}

	@keyframes overlayFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes drawerSlideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	@keyframes submenuExpand {
		from {
			opacity: 0;
			max-height: 0;
		}
		to {
			opacity: 1;
			max-height: 500px;
		}
	}
</style>
