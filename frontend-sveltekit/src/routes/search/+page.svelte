<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import ProductCard from '$lib/components/ui/ProductCard.svelte';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const seo = {
		title: data.query ? `Поиск: ${data.query}` : 'Поиск часов',
		description:
			'Найдите идеальные часы среди 500+ премиальных моделей от ведущих швейцарских брендов. Поиск по бренду, модели, цене.'
	};

	let searchQuery = $state(data.query || '');
	let isSearching = $state(false);

	async function handleSearch(e: Event) {
		e.preventDefault();

		if (!searchQuery.trim()) return;

		isSearching = true;

		// Navigate to search page with query parameter
		await goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);

		isSearching = false;
	}

	function handlePopularSearch(query: string) {
		searchQuery = query;
		goto(`/search?q=${encodeURIComponent(query)}`);
	}
</script>

<SeoManager {seo} />

<main class="page-main search-page">
	<section class="search-hero">
		<Container>
			<div class="search-hero__content">
				<span class="section-eyebrow">Поиск</span>
				<h1 class="search-hero__title">Найдите идеальные часы</h1>
				<p class="search-hero__description">
					Поиск среди {data.totalResults || '20'}+ премиальных моделей от Rolex, Patek Philippe,
					Audemars Piguet и других легендарных брендов
				</p>
			</div>

			<form class="search-form" onsubmit={handleSearch}>
				<div class="search-input-wrapper">
					<input
						type="search"
						bind:value={searchQuery}
						class="search-input"
						placeholder="Введите бренд или модель часов..."
						aria-label="Поиск часов"
					/>
					<button type="submit" class="search-btn" disabled={isSearching || !searchQuery.trim()}>
						{isSearching ? 'Поиск...' : 'Найти'}
					</button>
				</div>
			</form>
		</Container>
	</section>

	<section class="section search-results">
		<Container>
			{#if isSearching}
				<div class="search-state">
					<div class="loader"></div>
					<p>Ищем часы...</p>
				</div>
			{:else if data.searched && data.results.length === 0}
				<div class="search-state">
					<div class="search-state__icon">🔍</div>
					<h2 class="search-state__title">Ничего не найдено</h2>
					<p class="search-state__description">
						По запросу «{data.query}» ничего не найдено. Попробуйте изменить запрос или просмотрите
						<a href="/catalog">весь каталог</a>
					</p>
				</div>
			{:else if data.searched && data.results.length > 0}
				<div class="results-header">
					<h2 class="results-title">
						Найдено {data.totalResults}
						{data.totalResults === 1 ? 'модель' : 'моделей'} по запросу «{data.query}»
					</h2>
				</div>

				<div class="results-grid">
					{#each data.results as product}
						<ProductCard {product} />
					{/each}
				</div>
			{:else}
				<div class="search-state">
					<div class="search-state__icon">⌚</div>
					<h2 class="search-state__title">Начните поиск</h2>
					<p class="search-state__description">
						Введите название бренда или модели часов в поле поиска выше
					</p>
					<div class="popular-searches">
						<span class="popular-searches__label">Популярные запросы:</span>
						{#each ['Rolex', 'Patek Philippe', 'Omega', 'IWC'] as query}
							<button class="popular-search-tag" onclick={() => handlePopularSearch(query)}>
								{query}
							</button>
						{/each}
					</div>
				</div>
			{/if}
		</Container>
	</section>
</main>

<style>
	.search-hero {
		padding: var(--space-3xl) 0;
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.search-hero__content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
		margin-bottom: var(--space-2xl);
	}

	.search-hero__title {
		font-size: var(--font-size-h1);
	}

	.search-hero__description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
	}

	.search-form {
		max-width: 720px;
		margin: 0 auto;
	}

	.search-input-wrapper {
		display: flex;
		gap: var(--space-sm);
		background-color: var(--color-background);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xs);
		transition: border-color var(--transition-fast);
	}

	.search-input-wrapper:focus-within {
		border-color: var(--color-primary);
	}

	.search-input {
		flex: 1;
		border: none;
		background: none;
		padding: 14px 20px;
		font-size: var(--font-size-body);
		color: var(--color-text);
		outline: none;
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.search-btn {
		padding: 14px 32px;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		border: none;
		border-radius: var(--radius-lg);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.search-btn:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.search-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.search-results {
		padding: var(--space-4xl) 0;
		min-height: 400px;
	}

	.search-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-lg);
		padding: var(--space-4xl) var(--space-xl);
		text-align: center;
		min-height: 400px;
	}

	.search-state__icon {
		font-size: 72px;
		line-height: 1;
		opacity: 0.5;
	}

	.search-state__title {
		font-size: var(--font-size-h3);
		color: var(--color-text);
	}

	.search-state__description {
		font-size: var(--font-size-body);
		max-width: 480px;
		line-height: var(--line-height-relaxed);
	}

	.search-state__description a {
		color: var(--color-primary);
		text-decoration: underline;
	}

	.loader {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-surface);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.popular-searches {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-sm);
		align-items: center;
		justify-content: center;
		margin-top: var(--space-lg);
	}

	.popular-searches__label {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	.popular-search-tag {
		padding: 8px 16px;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-pill);
		font-size: var(--font-size-body-sm);
		color: var(--color-text);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.popular-search-tag:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
		background-color: rgba(10, 36, 99, 0.05);
	}

	.results-header {
		margin-bottom: var(--space-2xl);
	}

	.results-title {
		font-size: var(--font-size-h3);
		text-align: center;
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--space-xl);
	}

	@media (max-width: 768px) {
		.search-input-wrapper {
			flex-direction: column;
		}

		.search-btn {
			width: 100%;
		}
	}
</style>
