<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoManager seo={data.seo} />

<main class="page-main article-page">
	<article class="article">
		<!-- Article Header -->
		<header class="article-header container">
			<div class="article-meta">
				<span class="article-date">{data.article.date}</span>
				<div class="article-tags">
					{#each data.article.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</div>

			<h1 class="article-title">{data.article.title}</h1>
			<p class="article-subtitle">{data.article.subtitle}</p>

			<div class="article-author">
				<img src={data.article.author.avatar} alt={data.article.author.name} class="author-avatar" />
				<div class="author-info">
					<span class="author-name">{data.article.author.name}</span>
					<span class="author-role">{data.article.author.role}</span>
				</div>
			</div>
		</header>

		<!-- Featured Image -->
		<div class="article-image container">
			<img src={data.article.image} alt={data.article.title} />
		</div>

		<!-- Article Content -->
		<div class="article-content container">
			{@html data.article.content}
		</div>
	</article>

	<!-- Related Products -->
	{#if data.relatedProducts.length > 0}
		<section class="related-products section">
			<div class="container">
				<div class="section-intro center">
					<span class="section-eyebrow">Выбор редакции</span>
					<h2 class="section-title">Часы из статьи</h2>
				</div>

				<div class="products-grid">
					{#each data.relatedProducts as product}
						<a href="/product/{product.id}" class="product-card">
							<div class="product-card__image">
								<img src={product.image} alt={product.name} />
							</div>
							<div class="product-card__content">
								<span class="product-card__brand">{product.brand}</span>
								<h3 class="product-card__name">{product.name}</h3>
								<span class="product-card__price">{product.price}</span>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</main>

<style>
	.article-page {
		padding-top: var(--space-3xl);
	}

	.article-header {
		max-width: 800px;
		margin-bottom: var(--space-2xl);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.article-meta {
		display: flex;
		align-items: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
		color: var(--color-text-muted);
		font-size: var(--font-size-body-sm);
	}

	.article-tags {
		display: flex;
		gap: var(--space-xs);
	}

	.tag {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
		color: var(--color-primary);
	}

	.article-title {
		font-size: var(--font-size-display);
		line-height: 1.1;
		margin-bottom: var(--space-md);
	}

	.article-subtitle {
		font-size: var(--font-size-h3);
		color: var(--color-text-soft);
		line-height: var(--line-height-relaxed);
		margin-bottom: var(--space-xl);
	}

	.article-author {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		text-align: left;
	}

	.author-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		object-fit: cover;
	}

	.author-info {
		display: flex;
		flex-direction: column;
	}

	.author-name {
		font-weight: 600;
		color: var(--color-text);
	}

	.author-role {
		font-size: var(--font-size-caption);
		color: var(--color-text-muted);
	}

	.article-image {
		margin-bottom: var(--space-3xl);
	}

	.article-image img {
		width: 100%;
		border-radius: var(--radius-xl);
		max-height: 600px;
		object-fit: cover;
	}

	.article-content {
		max-width: 720px;
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
	}

	/* Typography for content */
	.article-content :global(h2),
	.article-content :global(h3) {
		color: var(--color-text);
		margin-top: var(--space-2xl);
		margin-bottom: var(--space-md);
		font-family: var(--font-primary);
	}

	.article-content :global(p) {
		margin-bottom: var(--space-lg);
	}

	/* Related Products */
	.related-products {
		background-color: var(--color-surface);
		margin-top: var(--space-4xl);
		padding: var(--space-3xl) 0;
	}

	.products-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-xl);
		max-width: 800px;
		margin: 0 auto;
	}

	.product-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		overflow: hidden;
		padding: var(--space-md);
		text-align: center;
		transition: transform var(--transition-fast);
	}

	.product-card:hover {
		transform: translateY(-4px);
	}

	.product-card__image {
		margin-bottom: var(--space-md);
	}

	.product-card__brand {
		display: block;
		font-size: var(--font-size-caption);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--space-2xs);
	}

	.product-card__name {
		font-size: var(--font-size-body);
		margin-bottom: var(--space-xs);
		color: var(--color-text);
	}

	.product-card__price {
		font-weight: 600;
		color: var(--color-primary);
	}
</style>
