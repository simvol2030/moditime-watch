<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import WatchSearchWidget from '$lib/components/widgets/WatchSearchWidget.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<SeoManager seo={data.seo} />

<main class="page-main city-page">
	<!-- Hero Section -->
	<section class="city-hero">
		<div class="city-hero__bg">
			<img src={data.hero.image} alt={data.hero.title} />
			<div class="city-hero__overlay"></div>
		</div>
		<div class="container city-hero__content">
			<h1 class="city-hero__title">{data.hero.title}</h1>
			<p class="city-hero__subtitle">{data.hero.subtitle}</p>
			
			<div class="city-hero__widget">
				<WatchSearchWidget />
			</div>
		</div>
	</section>

	<!-- Delivery Info -->
	<section class="section delivery-info">
		<div class="container">
			<div class="delivery-card">
				<div class="delivery-card__item">
					<span class="delivery-card__label">Доставка в г. {data.city.name}</span>
					<span class="delivery-card__value">{data.delivery.days} дн.</span>
				</div>
				<div class="delivery-card__divider"></div>
				<div class="delivery-card__item">
					<span class="delivery-card__label">Стоимость</span>
					<span class="delivery-card__value">{data.delivery.price}</span>
				</div>
				<div class="delivery-card__divider"></div>
				<div class="delivery-card__item">
					<span class="delivery-card__label">Примерка</span>
					<span class="delivery-card__value">Доступна</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Articles Grid -->
	<section class="section city-articles">
		<div class="container">
			<div class="section-intro">
				<span class="section-eyebrow">Журнал</span>
				<h2 class="section-title">Часовая жизнь {data.city.nameGenitive}</h2>
			</div>

			<div class="articles-grid">
				{#each data.articles as article}
					<article class="article-card">
						<a href="/journal/{article.slug}" class="article-card__link">
							<div class="article-card__image">
								<img src={article.image} alt={article.title} />
							</div>
							<div class="article-card__content">
								<span class="article-card__date">{article.date}</span>
								<h3 class="article-card__title">{article.title}</h3>
								<p class="article-card__excerpt">{article.excerpt}</p>
								<span class="article-card__more">Читать далее →</span>
							</div>
						</a>
					</article>
				{/each}
			</div>
		</div>
	</section>
</main>

<style>
	.city-hero {
		position: relative;
		min-height: 600px;
		display: flex;
		align-items: center;
		color: var(--color-white);
		padding: var(--space-3xl) 0;
	}

	.city-hero__bg {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.city-hero__bg img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.city-hero__overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(rgba(10, 36, 99, 0.7), rgba(10, 36, 99, 0.5));
	}

	.city-hero__content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		width: 100%;
	}

	.city-hero__title {
		font-size: var(--font-size-display);
		margin-bottom: var(--space-md);
		max-width: 900px;
	}

	.city-hero__subtitle {
		font-size: var(--font-size-h3);
		opacity: 0.9;
		margin-bottom: var(--space-2xl);
		max-width: 600px;
	}

	.city-hero__widget {
		width: 100%;
		max-width: 480px;
		text-align: left;
	}

	/* Delivery Card */
	.delivery-info {
		margin-top: -60px;
		position: relative;
		z-index: 10;
	}

	.delivery-card {
		background: var(--color-white);
		border-radius: var(--radius-xl);
		padding: var(--space-lg) var(--space-2xl);
		box-shadow: var(--shadow-lg);
		display: flex;
		align-items: center;
		justify-content: space-between;
		max-width: 900px;
		margin: 0 auto;
	}

	.delivery-card__item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.delivery-card__label {
		font-size: var(--font-size-caption);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.delivery-card__value {
		font-family: var(--font-primary);
		font-size: var(--font-size-h3);
		color: var(--color-primary);
	}

	.delivery-card__divider {
		width: 1px;
		height: 40px;
		background-color: var(--color-border);
	}

	/* Articles Grid */
	.section {
		padding: var(--space-3xl) 0;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

	.article-card__image {
		height: 240px;
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
		gap: var(--space-sm);
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
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.article-card__more {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-primary);
		margin-top: var(--space-xs);
	}

	@media (max-width: 768px) {
		.delivery-card {
			flex-direction: column;
			gap: var(--space-md);
			align-items: flex-start;
		}

		.delivery-card__divider {
			display: none;
		}
	}
</style>
