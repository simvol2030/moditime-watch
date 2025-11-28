<script lang="ts">
	import type { CatalogInsightsProps } from '$lib/types/catalog';

	// Props - using Svelte 5 syntax
	let { insights }: CatalogInsightsProps = $props();
</script>

<section class="catalog-insights">
	<div class="container catalog-insights__grid">
		{#each insights as insight (insight.id)}
			<article class="insight-card">
				<h3>{insight.title}</h3>
				<p>{insight.description}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	/* CatalogInsights styles - exact copy from catalog.css */
	.catalog-insights {
		padding: var(--space-3xl) 0;
		background: linear-gradient(180deg, rgba(10, 36, 99, 0.04) 0%, rgba(10, 36, 99, 0) 100%);
	}

	.catalog-insights__grid {
		display: grid;
		gap: var(--space-xl);
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	.insight-card {
		display: grid;
		gap: var(--space-sm);
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
	}
</style>
