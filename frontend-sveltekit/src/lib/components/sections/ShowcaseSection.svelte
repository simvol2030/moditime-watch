<script lang="ts">
	import type { ShowcaseSectionProps, Product } from '$lib/types/showcase';

	// Props
	let {
		eyebrow = 'Бестселлеры',
		title,
		products,
		showAllButton = false,
		showAllHref = '#',
		showAllText = 'Вся витрина'
	}: ShowcaseSectionProps = $props();

	// Fallback image for missing product images
	const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="360" height="440" viewBox="0 0 360 440"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a2463" stop-opacity="0.08"/><stop offset="100%" stop-color="#0a2463" stop-opacity="0.03"/></linearGradient></defs><rect width="360" height="440" fill="url(#bg)"/><circle cx="180" cy="190" r="60" stroke="#0a2463" stroke-opacity="0.15" stroke-width="3" fill="none"/><line x1="180" y1="190" x2="180" y2="155" stroke="#0a2463" stroke-opacity="0.2" stroke-width="2.5" stroke-linecap="round"/><line x1="180" y1="190" x2="205" y2="200" stroke="#0a2463" stroke-opacity="0.15" stroke-width="2" stroke-linecap="round"/><text x="180" y="290" text-anchor="middle" font-family="system-ui" font-size="13" fill="#0a2463" opacity="0.25">Изображение недоступно</text></svg>')}`;

	function handleImageError(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		if (!img.src.startsWith('data:')) {
			img.src = FALLBACK_IMAGE;
		}
	}

	// State - reference to scroll container
	let scrollContainer: HTMLDivElement;

	// Functions for scroll controls
	function scrollPrev() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -320, behavior: 'smooth' });
		}
	}

	function scrollNext() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
		}
	}
</script>

<section class="showcase" id="bestsellers">
	<div class="container">
		<div class="showcase__top">
			<div class="section-intro">
				<span class="section-eyebrow">{eyebrow}</span>
				<h2 class="section-title">{title}</h2>
			</div>
			{#if showAllButton}
				<div class="showcase__actions">
					<a href={showAllHref} class="btn btn-light btn-small">{showAllText}</a>
				</div>
			{/if}
		</div>
		<div class="scroll-row" data-scroll-scope>
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
			<div class="scroll-row__inner" data-scroll-container bind:this={scrollContainer}>
				{#each products as product (product.id)}
					<article class="product-card scroll-item">
						<div class="product-card__media">
							<img
								src={product.image}
								alt={product.imageAlt}
								width="360"
								height="440"
								loading="lazy"
								onerror={handleImageError}
							/>
							{#if product.badge}
								<span
									class="product-card__badge"
									class:product-card__badge--gold={product.badgeVariant === 'gold'}
								>
									{product.badge}
								</span>
							{/if}
						</div>
						<div class="product-card__meta">
							<p class="product-card__brand">{product.brand}</p>
							<h3 class="product-card__name">{product.name}</h3>
							<p class="product-card__price">{product.price}</p>
						</div>
						<div class="product-card__cta">
							<button class="btn btn-primary btn-small" type="button">В корзину</button>
							<button class="btn btn-ghost btn-small" type="button">В сравнение</button>
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
	/* Showcase */
	.showcase {
		padding: var(--space-4xl) 0;
	}

	.showcase__top {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--space-lg);
		margin-bottom: var(--space-xl);
	}

	.showcase__actions {
		flex-shrink: 0;
	}

	/* Product card */
	.product-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
		min-height: 100%;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.product-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.product-card__media {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: linear-gradient(180deg, rgba(10, 36, 99, 0.06) 0%, rgba(10, 36, 99, 0) 100%);
	}

	body[data-theme='dark'] .product-card__media {
		background: linear-gradient(180deg, rgba(62, 146, 204, 0.08) 0%, rgba(15, 18, 27, 0) 100%);
	}

	.product-card__media img {
		width: 100%;
		height: auto;
		display: block;
	}

	.product-card__badge {
		position: absolute;
		top: var(--space-md);
		left: var(--space-md);
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		background-color: rgba(10, 36, 99, 0.85);
		color: #fff;
		font-size: var(--font-size-body-sm);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		font-weight: 600;
	}

	.product-card__badge--gold {
		background-color: rgba(212, 175, 55, 0.92);
		color: var(--color-secondary);
	}

	body[data-theme='dark'] .product-card__badge {
		background-color: rgba(15, 18, 27, 0.92);
		color: #fff;
	}

	body[data-theme='dark'] .product-card__badge--gold {
		background-color: rgba(212, 175, 55, 0.95);
		color: var(--color-secondary);
	}

	.product-card__meta {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.product-card__brand {
		font-size: var(--font-size-body-sm);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin: 0;
	}

	.product-card__name {
		font-size: 20px;
		line-height: 1.3;
		margin: 0;
		color: var(--color-text);
	}

	.product-card__price {
		font-weight: 600;
		color: var(--color-primary);
		margin: 0;
		font-size: var(--font-size-body-lg);
	}

	.product-card__cta {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		margin-top: auto;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.showcase {
			padding: var(--space-3xl) 0;
		}

		.showcase__top {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 576px) {
		.product-card {
			padding: var(--space-md);
		}
	}
</style>
