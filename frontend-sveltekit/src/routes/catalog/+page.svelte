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
	let currentSort = $state(data.currentSort || 'popular');
	let activeFilters = $state<CatalogFilter>(data.filtersContent.filters);
	let filtersOpen = $state(false);

	// Helper: Build URL with filters
	function buildFilterUrl(filters: CatalogFilter, sort: string, pageNum: number = 1): string {
		const params = new URLSearchParams();

		if (filters.brands.length > 0) {
			params.set('brand', filters.brands.join(','));
		}
		if (filters.availability.length > 0) {
			params.set('availability', filters.availability.join(','));
		}
		if (filters.priceRange.min > 0) {
			params.set('minPrice', String(filters.priceRange.min));
		}
		if (filters.priceRange.max > 0 && filters.priceRange.max < 10000000) {
			params.set('maxPrice', String(filters.priceRange.max));
		}
		if (sort && sort !== 'popular') {
			params.set('sort', sort);
		}
		if (pageNum > 1) {
			params.set('page', String(pageNum));
		}

		const queryString = params.toString();
		return queryString ? `/catalog?${queryString}` : '/catalog';
	}

	// Event handlers
	function handleSortChange(value: string) {
		currentSort = value;
		const url = buildFilterUrl(activeFilters, value, 1);
		goto(url, { invalidateAll: true, noScroll: true });
	}

	function handleViewChange(mode: 'grid' | 'list') {
		viewMode = mode;
	}

	function handleFiltersToggle() {
		filtersOpen = !filtersOpen;
		document.body.style.overflow = filtersOpen ? 'hidden' : '';
	}

	function handleFiltersClose() {
		filtersOpen = false;
		document.body.style.overflow = '';
	}

	function handleFiltersReset() {
		const emptyFilters: CatalogFilter = {
			availability: [],
			brands: [],
			priceRange: { min: 0, max: 10000000 },
			materials: [],
			mechanisms: [],
			scenarios: []
		};
		activeFilters = emptyFilters;
		goto('/catalog', { invalidateAll: true });
	}

	function handleFiltersApply(filters: CatalogFilter) {
		activeFilters = filters;
		filtersOpen = false;
		document.body.style.overflow = '';
		const url = buildFilterUrl(filters, currentSort, 1);
		goto(url, { invalidateAll: true });
	}

	function handleRemoveFilter(filterId: string) {
		const [type, value] = filterId.split(':');
		const newFilters = { ...activeFilters };

		if (type === 'brand') {
			newFilters.brands = newFilters.brands.filter((b) => b !== value);
		} else if (type === 'availability') {
			newFilters.availability = newFilters.availability.filter((a) => a !== value);
		} else if (type === 'price') {
			newFilters.priceRange = { min: 0, max: 10000000 };
		}

		activeFilters = newFilters;
		const url = buildFilterUrl(newFilters, currentSort, 1);
		goto(url, { invalidateAll: true });
	}

	function handleLoadMore() {
		const nextPage = data.currentPage + 1;
		if (nextPage <= data.totalPages) {
			const url = buildFilterUrl(activeFilters, currentSort, nextPage);
			goto(url, { invalidateAll: true, noScroll: true });
		}
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
