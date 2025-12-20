<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
	{#if data.seo.canonical}
		<link rel="canonical" href={data.seo.canonical} />
	{/if}
	{#if data.seo.openGraph?.title}
		<meta property="og:title" content={data.seo.openGraph.title} />
	{/if}
	{#if data.seo.openGraph?.description}
		<meta property="og:description" content={data.seo.openGraph.description} />
	{/if}
	{#if data.seo.openGraph?.image}
		<meta property="og:image" content={data.seo.openGraph.image} />
	{/if}
</svelte:head>

<main class="article-page">
	<div class="container">
		<!-- Breadcrumbs -->
		<nav class="breadcrumbs" aria-label="Breadcrumb">
			<ol>
				<li><a href="/">Главная</a></li>
				<li><a href="/city/{data.city.slug}">Часы в {data.city.namePrepositional}</a></li>
				<li aria-current="page">{data.article.title}</li>
			</ol>
		</nav>

		<!-- Article Header -->
		<header class="article-header">
			<div class="article-meta">
				<span class="article-city">{data.city.name}</span>
				{#if data.article.publishedAt}
					<time class="article-date">{data.article.publishedAt}</time>
				{/if}
			</div>
			<h1 class="article-title">{data.article.title}</h1>
			{#if data.article.excerpt}
				<p class="article-excerpt">{data.article.excerpt}</p>
			{/if}
		</header>

		<!-- Featured Image -->
		<figure class="article-hero">
			<img
				src={data.article.image}
				alt={data.article.title}
				loading="eager"
				width="800"
				height="400"
			/>
		</figure>

		<!-- Article Content -->
		<article class="article-content">
			{@html data.article.content}
		</article>

		<!-- Related Articles -->
		{#if data.relatedArticles.length > 0}
			<section class="related-articles">
				<h2>Другие статьи о часах в {data.city.namePrepositional}</h2>
				<div class="related-grid">
					{#each data.relatedArticles as article}
						<a href={article.url} class="related-card">
							<img src={article.image} alt={article.title} loading="lazy" />
							<div class="related-card__content">
								<h3>{article.title}</h3>
								{#if article.date}
									<time>{article.date}</time>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Back to City -->
		<div class="article-nav">
			<a href="/city/{data.city.slug}" class="btn btn-light">
				Все статьи о часах в {data.city.namePrepositional}
			</a>
		</div>
	</div>
</main>

<style>
	.article-page {
		padding: var(--space-2xl) 0;
	}

	/* Breadcrumbs */
	.breadcrumbs {
		margin-bottom: var(--space-xl);
	}

	.breadcrumbs ol {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	.breadcrumbs li:not(:last-child)::after {
		content: '/';
		margin-left: var(--space-xs);
		color: var(--color-border);
	}

	.breadcrumbs a {
		color: var(--color-text-muted);
		text-decoration: none;
	}

	.breadcrumbs a:hover {
		color: var(--color-primary);
	}

	/* Header */
	.article-header {
		max-width: 720px;
		margin-bottom: var(--space-xl);
	}

	.article-meta {
		display: flex;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
		margin-bottom: var(--space-md);
	}

	.article-city {
		color: var(--color-primary);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.article-title {
		font-size: var(--font-size-h1);
		line-height: 1.2;
		margin-bottom: var(--space-md);
	}

	.article-excerpt {
		font-size: var(--font-size-body-lg);
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	/* Hero Image */
	.article-hero {
		margin: 0 0 var(--space-2xl);
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	.article-hero img {
		width: 100%;
		height: auto;
		display: block;
	}

	/* Content */
	.article-content {
		max-width: 720px;
		font-size: var(--font-size-body);
		line-height: 1.8;
	}

	.article-content :global(h2) {
		margin-top: var(--space-2xl);
		margin-bottom: var(--space-md);
		font-size: var(--font-size-h3);
	}

	.article-content :global(p) {
		margin-bottom: var(--space-md);
	}

	.article-content :global(ul),
	.article-content :global(ol) {
		margin-bottom: var(--space-md);
		padding-left: var(--space-xl);
	}

	.article-content :global(li) {
		margin-bottom: var(--space-sm);
	}

	/* Related Articles */
	.related-articles {
		margin-top: var(--space-3xl);
		padding-top: var(--space-2xl);
		border-top: 1px solid var(--color-border);
	}

	.related-articles h2 {
		font-size: var(--font-size-h3);
		margin-bottom: var(--space-xl);
	}

	.related-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-xl);
	}

	.related-card {
		display: block;
		text-decoration: none;
		color: inherit;
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--color-background);
		box-shadow: var(--shadow-xs);
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.related-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.related-card img {
		width: 100%;
		height: 180px;
		object-fit: cover;
	}

	.related-card__content {
		padding: var(--space-md);
	}

	.related-card h3 {
		font-size: var(--font-size-body);
		margin-bottom: var(--space-xs);
		line-height: 1.4;
	}

	.related-card time {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	/* Navigation */
	.article-nav {
		margin-top: var(--space-2xl);
		text-align: center;
	}

	/* Mobile */
	@media (max-width: 768px) {
		.article-title {
			font-size: var(--font-size-h2);
		}

		.article-content {
			font-size: var(--font-size-body-sm);
		}
	}
</style>
