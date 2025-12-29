<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import WatchSearchWidget from '$lib/components/widgets/WatchSearchWidget.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoManager seo={data.seo} />

<main class="page-main article-page">
	<!-- Breadcrumbs -->
	<nav class="breadcrumbs" aria-label="Навигация">
		<div class="container">
			<ol class="breadcrumbs__list">
				{#each data.breadcrumbs as crumb, index}
					<li class="breadcrumbs__item">
						{#if index < data.breadcrumbs.length - 1}
							<a href={crumb.href} class="breadcrumbs__link">{crumb.label}</a>
							<span class="breadcrumbs__separator">/</span>
						{:else}
							<span class="breadcrumbs__current">{crumb.label}</span>
						{/if}
					</li>
				{/each}
			</ol>
		</div>
	</nav>

	<!-- Article Header -->
	<header class="article-header">
		<div class="container">
			<div class="article-header__meta">
				<a href="/city/{data.city.slug}" class="article-header__city">{data.city.name}</a>
				{#if data.article.publishedAt}
					<span class="article-header__date">{data.article.publishedAt}</span>
				{/if}
			</div>
			<h1 class="article-header__title">{data.article.title}</h1>
			{#if data.article.excerpt}
				<p class="article-header__excerpt">{data.article.excerpt}</p>
			{/if}
		</div>
	</header>

	<!-- Featured Image -->
	<section class="article-image">
		<div class="container">
			<img src={data.article.image} alt={data.article.title} class="article-image__img" />
		</div>
	</section>

	<!-- Watch Search Widget -->
	<section class="article-widget">
		<div class="container">
			<div class="article-widget__inner">
				<WatchSearchWidget />
			</div>
		</div>
	</section>

	<!-- Article Content -->
	<article class="article-content">
		<div class="container">
			<div class="article-content__body">
				{@html data.article.content}
			</div>
		</div>
	</article>

	<!-- CTA: Watch Selection -->
	<section class="article-selection-cta">
		<div class="container">
			<div class="selection-cta-card">
				<div class="selection-cta-card__content">
					<h3 class="selection-cta-card__title">Подберите идеальные часы</h3>
					<p class="selection-cta-card__text">
						Наши эксперты помогут выбрать модель, соответствующую вашему стилю и бюджету.
						Доставка в {data.city.nameAccusative} с примеркой.
					</p>
				</div>
				<div class="selection-cta-card__widget">
					<WatchSearchWidget />
				</div>
			</div>
		</div>
	</section>

	<!-- Back to City -->
	<section class="article-back">
		<div class="container">
			<a href="/city/{data.city.slug}" class="article-back__link">
				<span class="article-back__arrow">←</span>
				Все статьи о часах в {data.city.namePrepositional}
			</a>
		</div>
	</section>

	<!-- Related Articles -->
	{#if data.relatedArticles.length > 0}
		<section class="section related-articles">
			<div class="container">
				<div class="section-intro">
					<span class="section-eyebrow">Читайте также</span>
					<h2 class="section-title">Другие статьи о часах в {data.city.namePrepositional}</h2>
				</div>

				<div class="articles-grid">
					{#each data.relatedArticles as article}
						<article class="article-card">
							<a href={article.href} class="article-card__link">
								<div class="article-card__image">
									<img src={article.image} alt={article.title} />
								</div>
								<div class="article-card__content">
									<span class="article-card__date">{article.date}</span>
									<h3 class="article-card__title">{article.title}</h3>
									<p class="article-card__excerpt">{article.excerpt}</p>
									<span class="article-card__more">Читать далее</span>
								</div>
							</a>
						</article>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</main>

<style>
	/* Breadcrumbs */
	.breadcrumbs {
		padding: var(--space-md) 0;
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.breadcrumbs__list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-xs);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.breadcrumbs__item {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.breadcrumbs__link {
		color: var(--color-text-muted);
		text-decoration: none;
		font-size: var(--font-size-body-sm);
		transition: color var(--transition-fast);
	}

	.breadcrumbs__link:hover {
		color: var(--color-primary);
	}

	.breadcrumbs__separator {
		color: var(--color-border);
	}

	.breadcrumbs__current {
		color: var(--color-text);
		font-size: var(--font-size-body-sm);
	}

	/* Article Header */
	.article-header {
		padding: var(--space-2xl) 0 var(--space-xl);
		text-align: center;
	}

	.article-header__meta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		margin-bottom: var(--space-lg);
	}

	.article-header__city {
		display: inline-block;
		padding: var(--space-2xs) var(--space-sm);
		background: var(--color-primary);
		color: var(--color-white);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-caption);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-decoration: none;
		transition: background-color var(--transition-fast);
	}

	.article-header__city:hover {
		background: var(--color-primary-dark);
	}

	.article-header__date {
		color: var(--color-text-muted);
		font-size: var(--font-size-body-sm);
	}

	.article-header__title {
		font-size: var(--font-size-display);
		line-height: var(--line-height-tight);
		max-width: 900px;
		margin: 0 auto var(--space-lg);
	}

	.article-header__excerpt {
		font-size: var(--font-size-h4);
		color: var(--color-text-soft);
		max-width: 700px;
		margin: 0 auto;
		line-height: var(--line-height-relaxed);
	}

	/* Article Image */
	.article-image {
		padding-bottom: var(--space-2xl);
	}

	.article-image__img {
		width: 100%;
		max-height: 500px;
		object-fit: cover;
		border-radius: var(--radius-xl);
	}

	/* Article Content */
	.article-content {
		padding-bottom: var(--space-2xl);
	}

	.article-content__body {
		max-width: 750px;
		margin: 0 auto;
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
	}

	.article-content__body :global(h2) {
		font-size: var(--font-size-h2);
		margin-top: var(--space-2xl);
		margin-bottom: var(--space-md);
	}

	.article-content__body :global(h3) {
		font-size: var(--font-size-h3);
		margin-top: var(--space-xl);
		margin-bottom: var(--space-sm);
	}

	.article-content__body :global(p) {
		margin-bottom: var(--space-md);
	}

	.article-content__body :global(ul),
	.article-content__body :global(ol) {
		margin-bottom: var(--space-md);
		padding-left: var(--space-lg);
	}

	.article-content__body :global(li) {
		margin-bottom: var(--space-xs);
	}

	.article-content__body :global(blockquote) {
		border-left: 4px solid var(--color-primary);
		padding-left: var(--space-lg);
		margin: var(--space-xl) 0;
		font-style: italic;
		color: var(--color-text-soft);
	}

	.article-content__body :global(img) {
		max-width: 100%;
		border-radius: var(--radius-md);
		margin: var(--space-lg) 0;
	}

	/* Article Widget (after image) */
	.article-widget {
		padding: var(--space-xl) 0;
		background: var(--color-surface);
	}

	.article-widget__inner {
		max-width: 500px;
		margin: 0 auto;
	}

	/* Selection CTA Card */
	.article-selection-cta {
		padding: var(--space-2xl) 0;
		background: linear-gradient(135deg, var(--color-primary) 0%, #1a4a8a 100%);
	}

	.selection-cta-card {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-2xl);
		align-items: center;
		max-width: 1000px;
		margin: 0 auto;
	}

	.selection-cta-card__content {
		color: var(--color-white);
	}

	.selection-cta-card__title {
		font-size: var(--font-size-h2);
		margin-bottom: var(--space-md);
	}

	.selection-cta-card__text {
		font-size: var(--font-size-body);
		opacity: 0.9;
		line-height: var(--line-height-relaxed);
	}

	.selection-cta-card__widget {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		padding: var(--space-lg);
	}

	/* Back to City */
	.article-back {
		padding: var(--space-xl) 0;
		text-align: center;
	}

	.article-back__link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-sm);
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
		transition: gap var(--transition-fast);
	}

	.article-back__link:hover {
		gap: var(--space-md);
	}

	.article-back__arrow {
		font-size: var(--font-size-h3);
	}

	/* Related Articles */
	.section {
		padding: var(--space-3xl) 0;
		background: var(--color-surface);
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-xl);
	}

	.article-card {
		background: var(--color-white);
		border-radius: var(--radius-lg);
		overflow: hidden;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
		border: 1px solid var(--color-border);
	}

	.article-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.article-card__link {
		text-decoration: none;
		color: inherit;
		display: block;
	}

	.article-card__image {
		height: 200px;
		overflow: hidden;
	}

	.article-card__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform var(--transition-normal);
	}

	.article-card:hover .article-card__image img {
		transform: scale(1.05);
	}

	.article-card__content {
		padding: var(--space-lg);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.article-card__date {
		font-size: var(--font-size-caption);
		color: var(--color-text-muted);
	}

	.article-card__title {
		font-size: var(--font-size-h4);
		line-height: var(--line-height-snug);
		color: var(--color-text);
	}

	.article-card__excerpt {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-soft);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.article-card__more {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-primary);
		margin-top: var(--space-xs);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.article-header__title {
			font-size: var(--font-size-h1);
		}

		.article-header__excerpt {
			font-size: var(--font-size-body);
		}

		.selection-cta-card {
			grid-template-columns: 1fr;
			gap: var(--space-lg);
			text-align: center;
		}

		.selection-cta-card__title {
			font-size: var(--font-size-h3);
		}
	}
</style>
