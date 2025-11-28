<script lang="ts">
	import type { CatalogControlsProps } from '$lib/types/catalog';

	// Props
	let {
		totalProducts,
		sortOptions,
		currentSort = 'popular',
		viewMode = 'grid',
		onSortChange,
		onViewChange,
		onFiltersToggle,
		onFiltersReset
	}: CatalogControlsProps = $props();

	// State
	let selectedSort = $state(currentSort);
	let selectedView = $state<'grid' | 'list'>(viewMode);

	// Handle sort change
	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		selectedSort = target.value;
		if (onSortChange) {
			onSortChange(selectedSort);
		}
	}

	// Handle view toggle
	function handleViewChange(mode: 'grid' | 'list') {
		selectedView = mode;
		if (onViewChange) {
			onViewChange(mode);
		}
	}

	// Handle filters toggle
	function handleFiltersToggle() {
		if (onFiltersToggle) {
			onFiltersToggle();
		}
	}

	// Handle filters reset
	function handleFiltersReset() {
		if (onFiltersReset) {
			onFiltersReset();
		}
	}
</script>

<section class="catalog-controls">
	<div class="container catalog-controls__row">
		<div class="catalog-controls__left">
			<button
				class="btn btn-light catalog-controls__filters"
				type="button"
				data-filters-open
				onclick={handleFiltersToggle}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 4H16M6 9H12M8 14H10"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
					/>
				</svg>
				Фильтры
			</button>
			<div class="catalog-controls__summary">
				<span class="chip chip-primary">{totalProducts} моделей</span>
				<button
					class="catalog-controls__reset"
					type="button"
					data-filters-reset
					onclick={handleFiltersReset}
				>
					Сбросить
				</button>
			</div>
		</div>
		<div class="catalog-controls__right">
			<label class="catalog-sort">
				<span>Сортировка</span>
				<select name="sort" data-sort value={selectedSort} onchange={handleSortChange}>
					{#each sortOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</label>
			<div class="catalog-view" role="radiogroup" aria-label="Вид списка">
				<button
					class="catalog-view__btn {selectedView === 'grid' ? 'is-active' : ''}"
					type="button"
					data-view="grid"
					aria-pressed={selectedView === 'grid'}
					aria-label="Плитка"
					onclick={() => handleViewChange('grid')}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M2 2H6V6H2V2Z" stroke="currentColor" stroke-width="1.4" />
						<path d="M10 2H14V6H10V2Z" stroke="currentColor" stroke-width="1.4" />
						<path d="M10 10H14V14H10V10Z" stroke="currentColor" stroke-width="1.4" />
						<path d="M2 10H6V14H2V10Z" stroke="currentColor" stroke-width="1.4" />
					</svg>
				</button>
				<button
					class="catalog-view__btn {selectedView === 'list' ? 'is-active' : ''}"
					type="button"
					data-view="list"
					aria-pressed={selectedView === 'list'}
					aria-label="Список"
					onclick={() => handleViewChange('list')}
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M2 4H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
						<path d="M2 8H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
						<path d="M2 12H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	/* Catalog controls */
	.catalog-controls {
		padding: var(--space-lg) 0;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.catalog-controls__row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-lg);
	}

	.catalog-controls__left {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.catalog-controls__summary {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
	}

	.catalog-controls__reset {
		background: none;
		border: none;
		color: var(--color-text-muted);
		font-size: var(--font-size-body-sm);
		text-decoration: underline;
		cursor: pointer;
	}

	.catalog-controls__reset:hover {
		color: var(--color-primary);
	}

	.catalog-controls__right {
		display: flex;
		align-items: center;
		gap: var(--space-lg);
	}

	.catalog-sort {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		font-size: var(--font-size-body-sm);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.catalog-sort select {
		min-width: 220px;
		padding: 10px 14px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		background-color: var(--color-background);
		font-size: var(--font-size-body);
		color: var(--color-text);
	}

	.catalog-view {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.catalog-view__btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		background-color: var(--color-background);
		color: var(--color-text);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			transform var(--transition-fast),
			border-color var(--transition-fast);
	}

	.catalog-view__btn.is-active {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.catalog-view__btn:hover {
		transform: translateY(-1px);
	}

	/* Responsive */
	@media (max-width: 992px) {
		.catalog-controls__row {
			flex-direction: column;
			align-items: stretch;
		}

		.catalog-controls__right,
		.catalog-controls__left {
			justify-content: space-between;
		}

		.catalog-sort select {
			width: 100%;
		}
	}

	@media (max-width: 768px) {
		.catalog-controls__left {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
		}

		.catalog-controls__right {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-sm);
			width: 100%;
		}

		.catalog-view {
			align-self: flex-end;
		}
	}

	@media (max-width: 576px) {
		.catalog-controls__row {
			gap: var(--space-md);
		}
	}
</style>
