<script lang="ts">
	import type { CatalogFiltersProps, CatalogFilter } from '$lib/types/catalog';

	// Props
	let {
		filters,
		brandOptions,
		materialOptions,
		mechanismOptions,
		scenarioOptions,
		availabilityOptions,
		onApply,
		onClose
	}: CatalogFiltersProps = $props();

	// State - working copy of filters
	let availability = $state<string[]>([...filters.availability]);
	let brands = $state<string[]>([...filters.brands]);
	let priceMin = $state(filters.priceRange.min);
	let priceMax = $state(filters.priceRange.max);
	let materials = $state<string[]>([...filters.materials]);
	let mechanisms = $state<string[]>([...filters.mechanisms]);
	let scenarios = $state<string[]>([...filters.scenarios]);

	// State for "Show more" buttons
	let showAllBrands = $state(false);

	// Handle availability checkbox
	function handleAvailabilityChange(value: string, checked: boolean) {
		if (checked) {
			availability = [...availability, value];
		} else {
			availability = availability.filter((v) => v !== value);
		}
	}

	// Handle brand checkbox
	function handleBrandChange(value: string, checked: boolean) {
		if (checked) {
			brands = [...brands, value];
		} else {
			brands = brands.filter((v) => v !== value);
		}
	}

	// Handle material checkbox
	function handleMaterialChange(value: string, checked: boolean) {
		if (checked) {
			materials = [...materials, value];
		} else {
			materials = materials.filter((v) => v !== value);
		}
	}

	// Handle mechanism checkbox
	function handleMechanismChange(value: string, checked: boolean) {
		if (checked) {
			mechanisms = [...mechanisms, value];
		} else {
			mechanisms = mechanisms.filter((v) => v !== value);
		}
	}

	// Handle scenario checkbox
	function handleScenarioChange(value: string, checked: boolean) {
		if (checked) {
			scenarios = [...scenarios, value];
		} else {
			scenarios = scenarios.filter((v) => v !== value);
		}
	}

	// Handle form submit
	function handleSubmit(event: Event) {
		event.preventDefault();

		const updatedFilters: CatalogFilter = {
			availability,
			brands,
			priceRange: { min: priceMin, max: priceMax },
			materials,
			mechanisms,
			scenarios
		};

		if (onApply) {
			onApply(updatedFilters);
		}
	}

	// Handle close
	function handleClose() {
		if (onClose) {
			onClose();
		}
	}

	// Toggle show more brands
	function toggleShowAllBrands() {
		showAllBrands = !showAllBrands;
	}

	// Derived: visible brand options
	let visibleBrandOptions = $derived(
		showAllBrands ? brandOptions : brandOptions.slice(0, 5)
	);
</script>

<aside class="catalog-filters" data-catalog-filters>
	<div class="catalog-filters__header">
		<h2>Фильтры</h2>
		<button
			class="catalog-filters__close"
			type="button"
			data-filters-close
			aria-label="Закрыть фильтры"
			onclick={handleClose}
		>
			<svg
				width="18"
				height="18"
				viewBox="0 0 18 18"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M14 4L4 14M4 4L14 14"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
		</button>
	</div>
	<form class="catalog-filters__form" onsubmit={handleSubmit}>
		<fieldset>
			<legend>Наличие</legend>
			{#each availabilityOptions as option}
				<label class="catalog-checkbox">
					<input
						type="checkbox"
						checked={availability.includes(option.value)}
						onchange={(e) =>
							handleAvailabilityChange(option.value, (e.target as HTMLInputElement).checked)}
					/>
					<span>{option.label}</span>
				</label>
			{/each}
		</fieldset>

		<details open>
			<summary>Бренд</summary>
			<div class="catalog-filter-group">
				{#each visibleBrandOptions as option}
					<label class="catalog-checkbox">
						<input
							type="checkbox"
							checked={brands.includes(option.value)}
							onchange={(e) =>
								handleBrandChange(option.value, (e.target as HTMLInputElement).checked)}
						/>
						<span>{option.label}</span>
					</label>
				{/each}
				{#if brandOptions.length > 5}
					<button class="catalog-filter__more" type="button" onclick={toggleShowAllBrands}>
						{showAllBrands ? 'Скрыть' : 'Показать ещё'}
					</button>
				{/if}
			</div>
		</details>

		<details open>
			<summary>Бюджет</summary>
			<div class="catalog-filter-range">
				<div class="catalog-filter-range__inputs">
					<label>
						<span>от</span>
						<input type="number" min="0" bind:value={priceMin} />
					</label>
					<label>
						<span>до</span>
						<input type="number" min="0" bind:value={priceMax} />
					</label>
				</div>
				<input
					type="range"
					min="0"
					max="10000000"
					step="100000"
					bind:value={priceMin}
					aria-label="Минимальный бюджет"
				/>
				<input
					type="range"
					min="0"
					max="10000000"
					step="100000"
					bind:value={priceMax}
					aria-label="Максимальный бюджет"
				/>
			</div>
		</details>

		<details>
			<summary>Материал корпуса</summary>
			<div class="catalog-filter-group">
				{#each materialOptions as option}
					<label class="catalog-checkbox">
						<input
							type="checkbox"
							checked={materials.includes(option.value)}
							onchange={(e) =>
								handleMaterialChange(option.value, (e.target as HTMLInputElement).checked)}
						/>
						<span>{option.label}</span>
					</label>
				{/each}
			</div>
		</details>

		<details>
			<summary>Механизм</summary>
			<div class="catalog-filter-group">
				{#each mechanismOptions as option}
					<label class="catalog-checkbox">
						<input
							type="checkbox"
							checked={mechanisms.includes(option.value)}
							onchange={(e) =>
								handleMechanismChange(option.value, (e.target as HTMLInputElement).checked)}
						/>
						<span>{option.label}</span>
					</label>
				{/each}
			</div>
		</details>

		<details>
			<summary>Сценарий использования</summary>
			<div class="catalog-filter-tags">
				{#each scenarioOptions as option}
					<label class="catalog-tag">
						<input
							type="checkbox"
							checked={scenarios.includes(option.value)}
							onchange={(e) =>
								handleScenarioChange(option.value, (e.target as HTMLInputElement).checked)}
						/>
						<span>{option.label}</span>
					</label>
				{/each}
			</div>
		</details>

		<button class="btn btn-primary catalog-filters__apply" type="submit">Применить фильтры</button>
	</form>
</aside>

<style>
	/* Catalog filters */
	.catalog-filters {
		position: sticky;
		top: calc(var(--header-height) + var(--space-lg));
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		max-height: calc(100vh - 140px);
		overflow-y: auto;
		transition: transform var(--transition-normal);
	}

	.catalog-filters__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.catalog-filters__header h2 {
		font-size: var(--font-size-h4);
	}

	.catalog-filters__close {
		display: none;
		width: 36px;
		height: 36px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text);
	}

	.catalog-filters__form {
		display: grid;
		gap: var(--space-xl);
	}

	.catalog-filters fieldset {
		border: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.catalog-filters legend,
	.catalog-filters summary {
		font-size: var(--font-size-body-sm);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--color-text-muted);
		margin-bottom: var(--space-xs);
	}

	.catalog-filters details {
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-md);
	}

	.catalog-filters summary {
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.catalog-filters summary::-webkit-details-marker {
		display: none;
	}

	.catalog-filters details:first-of-type {
		border-top: none;
		padding-top: 0;
	}

	.catalog-filter-group {
		display: grid;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.catalog-checkbox {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		font-size: var(--font-size-body);
		color: var(--color-text);
	}

	.catalog-checkbox input {
		width: 16px;
		height: 16px;
	}

	.catalog-filter__more {
		background: none;
		border: none;
		color: var(--color-primary);
		font-size: var(--font-size-body-sm);
		text-decoration: underline;
		justify-self: flex-start;
		cursor: pointer;
	}

	.catalog-filter-range {
		display: grid;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.catalog-filter-range__inputs {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-sm);
	}

	.catalog-filter-range__inputs label {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	.catalog-filter-range__inputs input {
		flex: 1;
		padding: 8px 12px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
	}

	.catalog-filter-range input[type='range'] {
		width: 100%;
		cursor: pointer;
	}

	.catalog-filter-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		margin-top: var(--space-sm);
	}

	.catalog-tag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 8px 14px;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		cursor: pointer;
	}

	.catalog-tag input {
		width: 14px;
		height: 14px;
	}

	.catalog-filters__apply {
		width: 100%;
	}

	/* Mobile styles */
	@media (max-width: 992px) {
		.catalog-filters {
			position: fixed;
			top: 0;
			right: 0;
			bottom: 0;
			width: min(90vw, 360px);
			max-height: none;
			transform: translateX(100%);
			border-radius: 0;
			border-left: 1px solid var(--color-border);
			z-index: calc(var(--overlay-z) + 1);
			box-shadow: none;
			padding: var(--space-xl) var(--space-lg);
		}

		.catalog-filters__close {
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}
	}
</style>
