<script lang="ts">
	import type { ProductHighlight } from '$lib/types/product';

	let { highlights }: { highlights: ProductHighlight[] } = $props();
</script>

<!-- ============================================================ -->
<!-- COMPONENT: ProductHighlights                                 -->
<!-- Purpose: Key features/highlights of the product              -->
<!-- ============================================================ -->
<section class="product-highlights">
	<div class="container product-highlights__grid">
		{#each highlights as highlight (highlight.title)}
			<article class="highlight-card">
				<div class="highlight-card__icon">{highlight.icon}</div>
				<h3>{highlight.title}</h3>
				<p>{highlight.description}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	/* Highlights */
	.product-highlights {
		padding: var(--space-4xl) 0;
	}

	.product-highlights__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-xl);
	}

	.highlight-card {
		padding: var(--space-2xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		text-align: center;
		align-items: center;
	}

	.highlight-card__icon {
		font-size: 48px;
		line-height: 1;
		margin-bottom: var(--space-sm);
	}

	.highlight-card h3 {
		font-size: var(--font-size-h5);
		color: var(--color-text);
		margin: 0;
	}

	.highlight-card p {
		color: var(--color-text-soft);
		line-height: 1.6;
		margin: 0;
	}

	@media (max-width: 768px) {
		.product-highlights__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
