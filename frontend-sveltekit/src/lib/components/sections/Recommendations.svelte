<script lang="ts">
	import ProductCard from '$lib/components/ui/ProductCard.svelte';
	import type { RecommendationsProps } from '$lib/types/recommendations';

	// Props - Svelte 5 syntax
	let {
		title = 'Похожие модели',
		subtitle = 'Рекомендуем посмотреть',
		products,
		showCatalogButton = true,
		catalogButtonText = 'Смотреть каталог',
		catalogButtonHref = '/catalog'
	}: RecommendationsProps = $props();

	// State for scroll controls
	let scrollContainer: HTMLElement | null = $state(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);

	// Update scroll buttons visibility
	function updateScrollButtons() {
		if (!scrollContainer) return;
		canScrollLeft = scrollContainer.scrollLeft > 0;
		canScrollRight =
			scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth;
	}

	// Scroll left
	function scrollLeft() {
		if (!scrollContainer) return;
		scrollContainer.scrollBy({ left: -320, behavior: 'smooth' });
	}

	// Scroll right
	function scrollRight() {
		if (!scrollContainer) return;
		scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
	}

	// Handle scroll event
	function handleScroll() {
		updateScrollButtons();
	}
</script>

<!-- ============================================================ -->
<!-- COMPONENT: Recommendations                                   -->
<!-- Purpose: Recommended products with horizontal scroll         -->
<!-- ============================================================ -->
<section class="recommendations">
	<div class="container">
		<div class="showcase__top">
			<div class="section-intro">
				<span class="section-eyebrow">{title}</span>
				<h2 class="section-title">{subtitle}</h2>
			</div>
			{#if showCatalogButton}
				<div class="showcase__actions">
					<a href={catalogButtonHref} class="btn btn-light btn-small">
						{catalogButtonText}
					</a>
				</div>
			{/if}
		</div>

		<div class="scroll-row" data-scroll-scope>
			<button
				class="icon-button scroll-row__control scroll-row__control--prev"
				type="button"
				aria-label="Скроллить влево"
				disabled={!canScrollLeft}
				onclick={scrollLeft}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M11 4L7 9L11 14"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			<div
				class="scroll-row__inner"
				data-scroll-container
				bind:this={scrollContainer}
				onscroll={handleScroll}
			>
				{#each products as product (product.id)}
					<div class="scroll-item">
						<ProductCard {product} variant="catalog" />
					</div>
				{/each}
			</div>

			<button
				class="icon-button scroll-row__control scroll-row__control--next"
				type="button"
				aria-label="Скроллить вправо"
				disabled={!canScrollRight}
				onclick={scrollRight}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M7 4L11 9L7 14"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	/* Recommendations Section */
	.recommendations {
		background: linear-gradient(
			180deg,
			rgba(10, 36, 99, 0.04) 0%,
			rgba(10, 36, 99, 0) 100%
		);
		padding: var(--space-4xl) 0;
	}

	/* Showcase Top Bar */
	.showcase__top {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: var(--space-2xl);
	}

	.showcase__actions {
		flex-shrink: 0;
	}

	/* Scrollable Row */
	.scroll-row {
		position: relative;
	}

	.scroll-row__inner {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(240px, 320px);
		gap: var(--space-lg);
		overflow-x: auto;
		scroll-behavior: smooth;
		scroll-snap-type: x mandatory;
		cursor: grab;
		touch-action: pan-y;
	}

	.scroll-row__inner::-webkit-scrollbar {
		display: none;
	}

	.scroll-row__inner.is-dragging {
		cursor: grabbing;
		user-select: none;
	}

	.scroll-item {
		scroll-snap-align: start;
	}

	/* Scroll Controls */
	.scroll-row__control {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		backdrop-filter: blur(12px);
		background-color: rgba(255, 255, 255, 0.85);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-sm);
		transition: opacity 0.2s ease;
	}

	.scroll-row__control:disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	.scroll-row__control--prev {
		left: -12px;
	}

	.scroll-row__control--next {
		right: -12px;
	}

	/* Dark theme */
	:global(body[data-theme='dark']) .scroll-row__control {
		background-color: rgba(15, 18, 27, 0.85);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.showcase__top {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-lg);
		}

		.scroll-row__control {
			display: none;
		}

		.scroll-row__inner {
			grid-auto-columns: minmax(220px, 280px);
		}
	}
</style>
