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

	// Build URL from current filter/sort state and navigate
	function navigateWithParams(overrides: Record<string, string | undefined> = {}) {
		const params = new URLSearchParams();

		const sort = overrides.sort ?? currentSort;
		if (sort && sort !== 'popular') params.set('sort', sort);

		const filters = overrides._filters
			? JSON.parse(overrides._filters) as CatalogFilter
			: activeFilters;

		if (filters.brands.length > 0) params.set('brand', filters.brands.join(','));
		if (filters.availability.length > 0) params.set('availability', filters.availability.join(','));
		if (filters.materials.length > 0) params.set('material', filters.materials.join(','));
		if (filters.mechanisms.length > 0) params.set('mechanism', filters.mechanisms.join(','));
		if (filters.scenarios.length > 0) params.set('scenario', filters.scenarios.join(','));
		if (filters.priceRange.min > 0) params.set('minPrice', String(filters.priceRange.min));
		if (filters.priceRange.max < 10000000) params.set('maxPrice', String(filters.priceRange.max));

		const page = overrides.page ? parseInt(overrides.page) : undefined;
		if (page && page > 1) params.set('page', String(page));

		const qs = params.toString();
		goto(`/catalog${qs ? '?' + qs : ''}`, { invalidateAll: true });
	}

	// Event handlers
	function handleSortChange(value: string) {
		currentSort = value;
		navigateWithParams({ sort: value });
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
		activeFilters = {
			availability: [],
			brands: [],
			priceRange: { min: 0, max: 10000000 },
			materials: [],
			mechanisms: [],
			scenarios: []
		};
		navigateWithParams({ _filters: JSON.stringify(activeFilters) });
	}

	function handleFiltersApply(filters: CatalogFilter) {
		activeFilters = filters;
		filtersOpen = false;
		document.body.style.overflow = '';
		navigateWithParams({ _filters: JSON.stringify(filters) });
	}

	function handleRemoveFilter(filterId: string) {
		const [type, value] = filterId.split(':');
		const updated = { ...activeFilters };

		if (type === 'brand') updated.brands = updated.brands.filter((v) => v !== value);
		else if (type === 'availability') updated.availability = updated.availability.filter((v) => v !== value);
		else if (type === 'material') updated.materials = updated.materials.filter((v) => v !== value);
		else if (type === 'mechanism') updated.mechanisms = updated.mechanisms.filter((v) => v !== value);
		else if (type === 'scenario') updated.scenarios = updated.scenarios.filter((v) => v !== value);
		else if (type === 'price') updated.priceRange = { min: 0, max: 10000000 };

		activeFilters = updated;
		navigateWithParams({ _filters: JSON.stringify(updated) });
	}

	function handleLoadMore() {
		const nextPage = data.currentPage + 1;
		if (nextPage <= data.totalPages) {
			navigateWithParams({ page: String(nextPage) });
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

	{#if data.telegramGroupEnabled}
		<TelegramCtaSection {...data.telegramContent} />
	{/if}
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
