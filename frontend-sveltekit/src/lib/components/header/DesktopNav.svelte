<script lang="ts">
	import { tick, onMount } from 'svelte';
	import type { NavigationLink } from '$lib/types/navigation';
	import { getNavigationHref } from '$lib/types/navigation';

	let { items = [] }: { items: NavigationLink[] } = $props();

	let navElement: HTMLElement | null = $state(null);
	let itemElements: (HTMLElement | null)[] = $state([]);
	// ИСПРАВЛЕНИЕ: splitIndex управляет какие элементы показывать
	// -1 означает показывать все (по умолчанию для SSR)
	let splitIndex = $state(-1);
	let activeDropdown = $state<string | null>(null);
	let isOverflowOpen = $state(false);
	let mounted = $state(false);

	const OVERFLOW_BTN_WIDTH = 100;

	// Computed: visible items (все до splitIndex или все если splitIndex == -1)
	let visibleItems = $derived(splitIndex === -1 ? items : items.slice(0, splitIndex));
	// Computed: overflow items (все после splitIndex)
	let overflowItems = $derived(splitIndex === -1 ? [] : items.slice(splitIndex));

	// Update navigation items based on available space
	async function updateNavItems() {
		if (!navElement || !mounted) return;

		// Reset splitIndex to show all
		splitIndex = -1;
		await tick();

		const containerWidth = navElement.clientWidth;
		let currentWidth = 0;
		let newSplitIndex = -1;

		itemElements.forEach((el, index) => {
			if (!el || newSplitIndex !== -1) return;
			currentWidth += el.offsetWidth;

			if (currentWidth > containerWidth - OVERFLOW_BTN_WIDTH) {
				newSplitIndex = index;
			}
		});

		splitIndex = newSplitIndex;
	}

	// Handle dropdown toggle
	function handleDropdownClick(e: MouseEvent, label: string) {
		e.stopPropagation();
		activeDropdown = activeDropdown === label ? null : label;
		isOverflowOpen = false;
	}

	// Handle overflow menu toggle
	function handleOverflowClick(e: MouseEvent) {
		e.stopPropagation();
		isOverflowOpen = !isOverflowOpen;
		activeDropdown = null;
	}

	// Close all dropdowns when clicking outside
	function handleDocumentClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		// Check if click is outside navigation
		if (!navElement?.contains(target)) {
			activeDropdown = null;
			isOverflowOpen = false;
		}
	}

	// Mount handling
	onMount(() => {
		mounted = true;
	});

	// Update on resize (only on client)
	$effect(() => {
		if (typeof window !== 'undefined' && mounted) {
			const resizeObserver = new ResizeObserver(() => {
				updateNavItems();
			});

			if (navElement) {
				resizeObserver.observe(navElement);
			}

			// Close dropdowns on document click
			document.addEventListener('click', handleDocumentClick);

			return () => {
				resizeObserver.disconnect();
				document.removeEventListener('click', handleDocumentClick);
			};
		}
	});

	// Initial update (only on client after mount)
	$effect(() => {
		if (items.length > 0 && mounted) {
			updateNavItems();
		}
	});
</script>

<nav class="desktop-nav" bind:this={navElement}>
	<ul class="desktop-nav__list">
		{#each visibleItems as item, index}
			<li
				class="desktop-nav__item"
				class:desktop-nav__item--dropdown={item.submenu}
				bind:this={itemElements[index]}
			>
				{#if item.submenu}
					<button
						class="desktop-nav__link desktop-nav__link--dropdown"
						class:active={activeDropdown === item.label}
						onclick={(e) => handleDropdownClick(e, item.label)}
					>
						{item.label}
						<svg
							class="desktop-nav__dropdown-icon"
							class:rotated={activeDropdown === item.label}
							width="12"
							height="8"
							viewBox="0 0 12 8"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
					{#if activeDropdown === item.label}
						<div class="desktop-nav__dropdown" onclick={(e) => e.stopPropagation()}>
							<div class="desktop-nav__dropdown-content">
								{#each item.submenu as child}
									{@const href = getNavigationHref(child)}
									<a
										{href}
										class="desktop-nav__dropdown-link"
										onclick={() => (activeDropdown = null)}
									>
										{child.label}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				{:else}
					{@const href = getNavigationHref(item)}
					<a {href} class="desktop-nav__link">
						{item.label}
					</a>
				{/if}
			</li>
		{/each}

		{#if overflowItems.length > 0}
			<li class="desktop-nav__item desktop-nav__item--overflow">
				<button
					class="desktop-nav__link desktop-nav__link--dropdown"
					class:active={isOverflowOpen}
					onclick={handleOverflowClick}
				>
					Ещё
					<svg
						class="desktop-nav__dropdown-icon"
						class:rotated={isOverflowOpen}
						width="12"
						height="8"
						viewBox="0 0 12 8"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
				{#if isOverflowOpen}
					<div class="desktop-nav__dropdown desktop-nav__dropdown--overflow" onclick={(e) => e.stopPropagation()}>
						<div class="desktop-nav__dropdown-content">
							{#each overflowItems as item}
								{#if item.submenu}
									<div class="desktop-nav__dropdown-group">
										<div class="desktop-nav__dropdown-group-title">{item.label}</div>
										{#each item.submenu as child}
											{@const href = getNavigationHref(child)}
											<a
												{href}
												class="desktop-nav__dropdown-link desktop-nav__dropdown-link--nested"
												onclick={() => (isOverflowOpen = false)}
											>
												{child.label}
											</a>
										{/each}
									</div>
								{:else}
									{@const href = getNavigationHref(item)}
									<a
										{href}
										class="desktop-nav__dropdown-link"
										onclick={() => (isOverflowOpen = false)}
									>
										{item.label}
									</a>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</li>
		{/if}
	</ul>
</nav>

<style>
	.desktop-nav {
		display: flex;
		justify-content: center;
		max-width: 100%;
		overflow: visible;
	}

	.desktop-nav__list {
		display: flex;
		align-items: center;
		gap: 2rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.desktop-nav__item {
		position: relative;
		flex-shrink: 0;
	}

	.desktop-nav__link {
		font-family: var(--font-accent);
		font-size: var(--font-size-body-md);
		font-weight: 500;
		color: var(--color-text);
		text-decoration: none;
		padding: 0.5rem 0;
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: color 0.2s ease;
		white-space: nowrap;
	}

	.desktop-nav__link:hover {
		color: var(--color-primary);
	}

	.desktop-nav__link.active {
		color: var(--color-primary);
	}

	.desktop-nav__dropdown-icon {
		transition: transform 0.2s ease;
		flex-shrink: 0;
	}

	.desktop-nav__dropdown-icon.rotated {
		transform: rotate(180deg);
	}

	.desktop-nav__dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		min-width: 200px;
		max-height: 400px;
		overflow-y: auto;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		z-index: 10000;
		animation: dropdownFadeIn 0.2s ease;
	}

	.desktop-nav__dropdown--overflow {
		right: 0;
		left: auto;
	}

	.desktop-nav__dropdown-content {
		padding: 0.25rem;
	}

	.desktop-nav__dropdown-link {
		display: block;
		padding: 0.5rem 0.875rem;
		font-family: var(--font-accent);
		font-size: var(--font-size-body-md);
		color: var(--color-text);
		text-decoration: none;
		border-bottom: 1px solid rgba(124, 150, 196, 0.04);
		transition: all 0.2s ease;
	}

	.desktop-nav__dropdown-link:last-child {
		border-bottom: none;
	}

	.desktop-nav__dropdown-link:hover {
		background: var(--color-background);
		color: var(--color-primary);
	}

	.desktop-nav__dropdown-link--nested {
		padding-left: 2rem;
		font-size: var(--font-size-body-sm);
	}

	.desktop-nav__dropdown-group {
		padding: 0.5rem 0;
	}

	.desktop-nav__dropdown-group:not(:last-child) {
		border-bottom: 1px solid var(--color-border);
	}

	.desktop-nav__dropdown-group-title {
		padding: 0.5rem 1rem;
		font-family: var(--font-accent);
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-text-soft);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	@keyframes dropdownFadeIn {
		from {
			opacity: 0;
			transform: translateY(-8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 1280px) {
		.desktop-nav__list {
			gap: 1.5rem;
		}
	}

	@media (max-width: 1024px) {
		.desktop-nav {
			display: none;
		}
	}
</style>
