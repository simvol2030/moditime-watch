<script lang="ts">
	import ProductCard from '$lib/components/ui/ProductCard.svelte';
	import type { CatalogProduct } from '$lib/types/product';
	import type { ActiveFilter } from '$lib/types/catalog';

	// Props
	let {
		products,
		totalProducts,
		shownProducts,
		currentPage = 1,
		totalPages = 1,
		activeFilters = [],
		onRemoveFilter,
		onLoadMore,
		onAddToCart,
		onViewDetails,
		viewMode = 'grid'
	}: {
		products: CatalogProduct[];
		totalProducts: number;
		shownProducts: number;
		currentPage?: number;
		totalPages?: number;
		activeFilters?: ActiveFilter[];
		onRemoveFilter?: (id: string) => void;
		onLoadMore?: () => void;
		onAddToCart?: (product: CatalogProduct) => void;
		onViewDetails?: (productId: string) => void;
		viewMode?: 'grid' | 'list';
	} = $props();

	// Event handlers
	function handleRemoveFilter(filterId: string) {
		if (onRemoveFilter) {
			onRemoveFilter(filterId);
		}
	}

	function handleLoadMore() {
		if (onLoadMore) {
			onLoadMore();
		}
	}
</script>

<div class="catalog-results {viewMode === 'list' ? 'is-list' : ''}">
	<div class="catalog-results__meta">
		<span>Показано {shownProducts} из {totalProducts}</span>
		{#if activeFilters.length > 0}
			<div class="catalog-active-filters" role="list">
				{#each activeFilters as filter}
					<button
						class="catalog-active-filter"
						type="button"
						onclick={() => handleRemoveFilter(filter.id)}
					>
						{filter.label} ×
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="catalog-results__grid">
		{#each products as product (product.id)}
			<ProductCard
				{product}
				variant="catalog"
				onAddToCart={onAddToCart ? () => onAddToCart(product) : undefined}
				onViewDetails={onViewDetails ? () => onViewDetails(product.id) : undefined}
			/>
		{/each}
	</div>

	{#if currentPage < totalPages}
		<div class="catalog-pagination">
			<button class="btn btn-light" type="button" onclick={handleLoadMore}>
				Показать ещё 12
			</button>
			<span>Страница {currentPage} из {totalPages}</span>
		</div>
	{/if}

	<div class="catalog-insight">
		<h2>Не нашли нужную модель?</h2>
		<p>
			Сообщите нам референс или пожелания — команда Moditimewatch найдёт часы через сеть бутиков
			и частных коллекций и организует доставку с полной страховкой.
		</p>
		<a href="#" class="btn btn-primary">Оставить заявку</a>
	</div>
</div>

<style>
	/* Catalog results container */
	.catalog-results {
		display: grid;
		gap: var(--space-2xl);
	}

	.catalog-results__meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	.catalog-active-filters {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
	}

	.catalog-active-filter {
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		cursor: pointer;
		font-size: var(--font-size-body-sm);
		color: var(--color-text);
		transition: all var(--transition-fast);
	}

	.catalog-active-filter:hover {
		background-color: var(--color-primary);
		color: var(--color-surface);
		border-color: var(--color-primary);
	}

	.catalog-results__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-xl);
	}

	/* List view */
	.catalog-results.is-list .catalog-results__grid {
		grid-template-columns: 1fr;
	}

	/* Pagination */
	.catalog-pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
	}

	.catalog-pagination span {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	/* Insight CTA block */
	.catalog-insight {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
		text-align: center;
		display: grid;
		gap: var(--space-md);
	}

	.catalog-insight h2 {
		font-size: var(--font-size-h3);
	}

	.catalog-insight p {
		color: var(--color-text-muted);
		max-width: 600px;
		margin: 0 auto;
	}

	.catalog-insight .btn {
		justify-self: center;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.catalog-results__meta {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 576px) {
		.catalog-results__grid {
			grid-template-columns: 1fr;
		}

		.catalog-pagination {
			flex-direction: column;
		}
	}
</style>
