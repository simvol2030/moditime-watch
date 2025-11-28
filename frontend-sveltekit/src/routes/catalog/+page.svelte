<script lang="ts">
	import { goto } from '$app/navigation';
	import { cart } from '$lib/stores/cart.svelte';
	import CatalogHero from '$lib/components/sections/CatalogHero.svelte';
	import CatalogControls from '$lib/components/sections/CatalogControls.svelte';
	import CatalogFilters from '$lib/components/sections/CatalogFilters.svelte';
	import CatalogResults from '$lib/components/sections/CatalogResults.svelte';
	import TelegramCtaSection from '$lib/components/sections/TelegramCtaSection.svelte';

	import type { PageData } from './$types';
	import type { CatalogFilter } from '$lib/types/catalog';
	import type { CatalogProduct } from '$lib/types/product';

	let { data }: { data: PageData } = $props();

	// State for interactive catalog features
	let viewMode = $state<'grid' | 'list'>('grid');
	let currentSort = $state('popular');
	let activeFilters = $state<CatalogFilter>(data.filtersContent.filters);
	let filtersOpen = $state(false);

	// Event handlers
	function handleSortChange(value: string) {
		currentSort = value;
		console.log('Sort changed to:', value);
		// TODO: Trigger data reload with new sort
	}

	function handleViewChange(mode: 'grid' | 'list') {
		viewMode = mode;
		console.log('View mode changed to:', mode);
	}

	function handleFiltersToggle() {
		filtersOpen = !filtersOpen;
		document.body.style.overflow = filtersOpen ? 'hidden' : ''; // Prevent scroll on mobile
	}

	function handleFiltersClose() {
		filtersOpen = false;
		document.body.style.overflow = '';
	}

	function handleFiltersReset() {
		activeFilters = {
			availability: [],
			brands: [],
			priceRange: { min: 0, max: 10000000 },
			materials: [],
			mechanisms: [],
			scenarios: []
		};
		console.log('Filters reset');
		// TODO: Trigger data reload with empty filters
	}

	function handleFiltersApply(filters: CatalogFilter) {
		activeFilters = filters;
		filtersOpen = false;
		document.body.style.overflow = '';
		console.log('Filters applied:', filters);
		// TODO: Trigger data reload with new filters
	}

	function handleRemoveFilter(filterId: string) {
		console.log('Remove filter:', filterId);
		// TODO: Remove filter from activeFilters
	}

	function handleLoadMore() {
		console.log('Load more products');
		// TODO: Load next page of products
	}

	function handleAddToCart(product: CatalogProduct) {
		cart.addItem({
			id: product.id,
			name: product.name,
			brand: product.brand,
			price: product.price,
			image: product.image
		});
		console.log('Added to cart:', product.name);
	}

	function handleViewDetails(productId: string) {
		goto(`/product/${productId}`);
	}
</script>

<svelte:head>
	<title>Каталог премиальных часов — Moditimewatch Delivery</title>
	<meta
		name="description"
		content="Каталог премиальных часов Moditimewatch: мужские, женские, спортивные модели. Фильтры по брендам, материалам, бюджету и доступности доставки."
	/>
</svelte:head>

<main class="page-main catalog-page">
	<CatalogControls
		totalProducts={data.totalProducts}
		sortOptions={data.controlsContent.sortOptions || []}
		{currentSort}
		{viewMode}
		onSortChange={handleSortChange}
		onViewChange={handleViewChange}
		onFiltersToggle={handleFiltersToggle}
		onFiltersReset={handleFiltersReset}
	/>

	<section class="catalog-layout">
		<div class="container catalog-layout__grid">
			<CatalogFilters
				filters={activeFilters}
				brandOptions={data.filtersContent.brandOptions}
				materialOptions={data.filtersContent.materialOptions}
				mechanismOptions={data.filtersContent.mechanismOptions}
				scenarioOptions={data.filtersContent.scenarioOptions}
				availabilityOptions={data.filtersContent.availabilityOptions}
				onApply={handleFiltersApply}
				onClose={handleFiltersClose}
			/>

			<CatalogResults
				products={data.products}
				totalProducts={data.totalProducts}
				shownProducts={data.shownProducts}
				currentPage={data.currentPage}
				totalPages={data.totalPages}
				activeFilters={data.activeFilters}
				onRemoveFilter={handleRemoveFilter}
				onLoadMore={handleLoadMore}
				onAddToCart={handleAddToCart}
				onViewDetails={handleViewDetails}
				{viewMode}
			/>
		</div>
	</section>

	<CatalogHero {...data.heroContent} />

	<TelegramCtaSection {...data.telegramContent} />
</main>

<style>
	/* Catalog Layout - Two Column Grid */
	.catalog-layout {
		padding: var(--space-3xl) 0;
	}

	.catalog-layout__grid {
		display: grid;
		grid-template-columns: 280px 1fr;
		gap: var(--space-2xl);
		align-items: start;
	}

	/* Mobile: Stack vertically */
	@media (max-width: 991px) {
		.catalog-layout__grid {
			grid-template-columns: 1fr;
		}
	}

	/* Ensure sticky filters on desktop */
	@media (min-width: 992px) {
		.catalog-layout__grid > :first-child {
			position: sticky;
			top: calc(var(--header-height, 120px) + var(--space-md));
			max-height: calc(100vh - var(--header-height, 120px) - var(--space-2xl));
			overflow-y: auto;
		}
	}
</style>
