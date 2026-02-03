<script lang="ts">
	import type { CollectionsSectionProps } from '$lib/types/collections';

	// Props
	let {
		eyebrow = 'Подборки',
		title,
		description,
		collections
	}: CollectionsSectionProps = $props();

	// Fallback image for missing collection images
	const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="520" height="360" viewBox="0 0 520 360"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a2463" stop-opacity="0.08"/><stop offset="100%" stop-color="#0a2463" stop-opacity="0.03"/></linearGradient></defs><rect width="520" height="360" fill="url(#bg)"/><circle cx="260" cy="150" r="50" stroke="#0a2463" stroke-opacity="0.15" stroke-width="3" fill="none"/><line x1="260" y1="150" x2="260" y2="120" stroke="#0a2463" stroke-opacity="0.2" stroke-width="2.5" stroke-linecap="round"/><line x1="260" y1="150" x2="280" y2="158" stroke="#0a2463" stroke-opacity="0.15" stroke-width="2" stroke-linecap="round"/><text x="260" y="240" text-anchor="middle" font-family="system-ui" font-size="13" fill="#0a2463" opacity="0.25">Изображение недоступно</text></svg>')}`;

	function handleImageError(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		if (!img.src.startsWith('data:')) {
			img.src = FALLBACK_IMAGE;
		}
	}

	// State for scroll container reference
	let scrollContainer = $state<HTMLDivElement | undefined>();

	// Scroll functions
	function scrollPrev() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -400, behavior: 'smooth' });
		}
	}

	function scrollNext() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: 400, behavior: 'smooth' });
		}
	}
</script>

<section class="collections" id="collections">
	<div class="container">
		<div class="section-intro">
			<span class="section-eyebrow">{eyebrow}</span>
			<h2 class="section-title">{title}</h2>
			{#if description}
				<p class="section-description">{description}</p>
			{/if}
		</div>
		<div class="collections__carousel scroll-row" data-scroll-scope>
			<button
				class="icon-button scroll-row__control scroll-row__control--prev"
				type="button"
				data-scroll-prev
				aria-label="Скроллить влево"
				onclick={scrollPrev}
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
				class="scroll-row__inner scroll-row__inner--wide"
				data-scroll-container
				bind:this={scrollContainer}
			>
				{#each collections as collection (collection.id)}
					<article class="collection-card scroll-item">
						<img src={collection.image} alt={collection.title} width="520" height="360" onerror={handleImageError} />
						<div class="collection-card__content">
							<div class="collection-card__head">
								<span class="chip chip-primary">{collection.category}</span>
								<h3>{collection.title}</h3>
							</div>
							<p>{collection.description}</p>
							<a href={collection.linkHref} class="collection-card__link"
								>{collection.linkText}</a
							>
						</div>
					</article>
				{/each}
			</div>
			<button
				class="icon-button scroll-row__control scroll-row__control--next"
				type="button"
				data-scroll-next
				aria-label="Скроллить вправо"
				onclick={scrollNext}
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
	/* Collections */
	.collections__carousel {
		margin-top: var(--space-xl);
	}

	.collection-card {
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		background-color: var(--color-background);
		min-width: 300px;
	}

	.collection-card img {
		width: 100%;
		height: auto;
	}

	.collection-card__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-xl);
		height: 100%;
	}

	.collection-card__head {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.collection-card__link {
		font-family: var(--font-accent);
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-primary);
		margin-top: auto;
	}

	.collection-card__link::after {
		content: '';
		width: 20px;
		height: 2px;
		background-color: currentColor;
		border-radius: 2px;
		transform: scaleX(0.4);
		transform-origin: left;
		transition: transform var(--transition-fast);
	}

	.collection-card__link:hover::after {
		transform: scaleX(1);
	}

	/* Scroll row */
	.scroll-row {
		position: relative;
	}

	.scroll-row__inner {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(240px, 320px);
		gap: var(--space-lg);
		overflow-x: auto;
		padding-bottom: 8px;
		scroll-snap-type: x mandatory;
		cursor: grab;
		touch-action: pan-y;
	}

	.scroll-row__inner--wide {
		grid-auto-columns: minmax(280px, 420px);
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

	.scroll-row__control {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		backdrop-filter: blur(12px);
		background-color: rgba(255, 255, 255, 0.85);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-sm);
	}

	body[data-theme='dark'] .scroll-row__control {
		background-color: rgba(15, 18, 27, 0.85);
	}

	.scroll-row__control--prev {
		left: -12px;
	}

	.scroll-row__control--next {
		right: -12px;
	}

	/* Responsive */
	@media (max-width: 576px) {
		.collection-card__content {
			padding: var(--space-lg);
		}

		.collection-card {
			min-width: 260px;
		}
	}
</style>
