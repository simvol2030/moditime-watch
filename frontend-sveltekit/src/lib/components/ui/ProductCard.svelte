<script lang="ts">
	import type { Product, CatalogProduct } from '$lib/types/product';

	// Props
	let {
		product,
		variant = 'default',
		onAddToCart,
		onViewDetails
	}: {
		product: Product | CatalogProduct;
		variant?: 'default' | 'catalog';
		onAddToCart?: () => void;
		onViewDetails?: () => void;
	} = $props();

	// Helper to check if product is CatalogProduct
	function isCatalogProduct(p: Product | CatalogProduct): p is CatalogProduct {
		return 'info' in p && Array.isArray((p as CatalogProduct).info);
	}

	// Event handlers
	function handleAddToCart() {
		if (onAddToCart) {
			onAddToCart();
		}
	}

	function handleViewDetails() {
		if (onViewDetails) {
			onViewDetails();
		}
	}
</script>

<article class="product-card {variant === 'catalog' ? 'catalog-card' : ''}">
	<div class="product-card__media">
		<img src={product.image} alt={`${product.brand} ${product.name}`} width="360" height="440" />
		{#if product.badge}
			<span
				class="product-card__badge {product.badgeType === 'gold'
					? 'product-card__badge--gold'
					: ''}"
			>
				{product.badge}
			</span>
		{/if}
	</div>

	<div class="product-card__meta">
		<p class="product-card__brand">{product.brand}</p>
		<h3 class="product-card__name">{product.name}</h3>
		<p class="product-card__price">{product.price.toLocaleString('ru-RU')} ₽</p>
	</div>

	<div class="product-card__cta">
		<button class="btn btn-primary btn-small" type="button" onclick={handleAddToCart}>
			В корзину
		</button>
		<button class="btn btn-ghost btn-small" type="button" onclick={handleViewDetails}>
			Подробнее
		</button>
	</div>

	{#if variant === 'catalog' && isCatalogProduct(product)}
		<ul class="catalog-card__info">
			{#each product.info as infoItem}
				<li>{infoItem}</li>
			{/each}
		</ul>
	{/if}
</article>

<style>
	/* ProductCard base styles */
	.product-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-lg);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
		min-height: 100%;
	}

	.product-card__media {
		position: relative;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: linear-gradient(180deg, rgba(10, 36, 99, 0.06) 0%, rgba(10, 36, 99, 0) 100%);
	}

	.product-card__media img {
		width: 100%;
		height: auto;
	}

	.product-card__badge {
		position: absolute;
		top: var(--space-md);
		left: var(--space-md);
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		background-color: var(--color-secondary);
		color: var(--color-surface);
		font-size: var(--font-size-body-sm);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		opacity: 0.92;
	}

	.product-card__badge--gold {
		background-color: var(--color-primary);
		color: var(--color-ink);
		opacity: 0.95;
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
	}

	.product-card__name {
		font-size: 20px;
	}

	.product-card__price {
		font-weight: 600;
		color: var(--color-primary);
	}

	.product-card__cta {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	/* Catalog variant styles */
	.catalog-card {
		position: relative;
		overflow: hidden;
	}

	.catalog-card__info {
		margin: var(--space-md) 0 0;
		display: grid;
		gap: var(--space-xs);
		color: var(--color-text-muted);
		font-size: var(--font-size-body-sm);
	}

	.catalog-card__info li {
		list-style: none;
	}

	/* List view styles (when parent has .is-list) */
	:global(.catalog-results.is-list) .product-card.catalog-card {
		display: grid;
		grid-template-columns: 220px 1fr;
		grid-template-rows: auto;
		gap: var(--space-lg);
		align-items: start;
	}

	:global(.catalog-results.is-list) .product-card.catalog-card .product-card__media {
		grid-row: 1 / -1;
		height: 100%;
		min-height: 280px;
	}

	:global(.catalog-results.is-list) .product-card.catalog-card .product-card__media img {
		height: 100%;
		object-fit: cover;
	}

	:global(.catalog-results.is-list) .product-card.catalog-card .product-card__meta {
		grid-column: 2;
		grid-row: 1;
	}

	:global(.catalog-results.is-list) .product-card.catalog-card .product-card__cta {
		grid-column: 2;
		grid-row: 2;
		display: flex;
		gap: var(--space-sm);
		justify-content: flex-start;
	}

	:global(.catalog-results.is-list) .product-card.catalog-card .catalog-card__info {
		grid-column: 2;
		grid-row: 3;
		margin-top: 0;
	}

	/* Mobile responsive */
	@media (max-width: 576px) {
		:global(.catalog-results.is-list) .catalog-card {
			grid-template-columns: 1fr;
		}
	}
</style>
