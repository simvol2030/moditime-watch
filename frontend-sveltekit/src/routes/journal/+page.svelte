<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';

	const seo = {
		title: 'Журнал о часах',
		description:
			'Экспертные статьи о премиальных часах: обзоры моделей, история брендов, инвестиции в часы, уход за механизмами. Журнал Moditimewatch.'
	};

	// Mock data - в будущем будет из БД
	const articles = [
		{
			id: 'rolex-submariner-history',
			title: 'Наследие Rolex Submariner: от дайверов до коллекционеров',
			excerpt:
				'Разбираем ключевые референсы, которые формируют коллекционную ценность модели, и рассказываем, на что смотреть при покупке.',
			category: 'История брендов',
			image: 'https://picsum.photos/seed/journal-1/800/500',
			date: '15 ноября 2024',
			readTime: '8 мин'
		},
		{
			id: 'watch-investment-2024',
			title: 'Инвестиции в часы: что покупать в 2024 году',
			excerpt:
				'Гид по моделям с ростом 15–35% в год, редким кооперациям брендов и предстоящим релизам с потенциалом.',
			category: 'Инвестиции',
			image: 'https://picsum.photos/seed/journal-2/800/500',
			date: '10 ноября 2024',
			readTime: '12 мин'
		},
		{
			id: 'watch-care-guide',
			title: 'Как продлить ресурс механизма: чек-лист ухода от мастера',
			excerpt:
				'Советы по ежедневному уходу, хранению в сейфе и подготовке часов к длительным перелётам.',
			category: 'Гид эксперта',
			image: 'https://picsum.photos/seed/journal-3/800/500',
			date: '5 ноября 2024',
			readTime: '6 мин'
		},
		{
			id: 'womens-watches-heirloom',
			title: 'Женские часы, которые станут семейной реликвией',
			excerpt:
				'Подборка моделей, которые передаются по наследству и растут в цене благодаря дизайну и материалам.',
			category: 'Стиль',
			image: 'https://picsum.photos/seed/journal-4/800/500',
			date: '1 ноября 2024',
			readTime: '10 мин'
		},
		{
			id: 'programmatic-seo-watches',
			title: 'Как Programmatic SEO помогает доставке часов',
			excerpt:
				'Разбираем, как локальные поддомены и персональные виджеты приводят клиентов из городов-миллионников.',
			category: 'Programmatic',
			image: 'https://picsum.photos/seed/journal-5/800/500',
			date: '28 октября 2024',
			readTime: '7 мин'
		},
		{
			id: 'gift-sets',
			title: 'Подарочные наборы: часы + аксессуары в одной доставке',
			excerpt:
				'Подборка решений для корпоративных и личных подарков: ремешки, коробки и сертификаты сервиса.',
			category: 'Подарки',
			image: 'https://picsum.photos/seed/journal-6/800/500',
			date: '25 октября 2024',
			readTime: '5 мин'
		}
	];

	const categories = [
		'Все статьи',
		'История брендов',
		'Инвестиции',
		'Гид эксперта',
		'Стиль',
		'Programmatic',
		'Подарки'
	];

	let activeCategory = $state('Все статьи');

	const filteredArticles = $derived(
		activeCategory === 'Все статьи'
			? articles
			: articles.filter((a) => a.category === activeCategory)
	);
</script>

<SeoManager {seo} />

<main class="page-main journal-page">
	<section class="journal-hero">
		<Container>
			<div class="journal-hero__content">
				<span class="section-eyebrow">Журнал</span>
				<h1 class="journal-hero__title">Экспертиза и вдохновение</h1>
				<p class="journal-hero__description">
					Гиды по выбору часов, истории легендарных моделей, советы по инвестициям и уходу за
					механизмами от экспертов Moditimewatch
				</p>
			</div>
		</Container>
	</section>

	<section class="section journal-content">
		<Container>
			<!-- Categories Filter -->
			<div class="categories-filter">
				{#each categories as category}
					<button
						class="category-btn"
						class:active={activeCategory === category}
						onclick={() => (activeCategory = category)}
					>
						{category}
					</button>
				{/each}
			</div>

			<!-- Articles Grid -->
			<div class="articles-grid">
				{#each filteredArticles as article}
					<a href="/journal/{article.id}" class="article-card">
						<div class="article-card__image">
							<img src={article.image} alt={article.title} />
							<span class="article-card__category">{article.category}</span>
						</div>
						<div class="article-card__content">
							<div class="article-card__meta">
								<span class="article-card__date">{article.date}</span>
								<span class="article-card__read-time">{article.readTime}</span>
							</div>
							<h2 class="article-card__title">{article.title}</h2>
							<p class="article-card__excerpt">{article.excerpt}</p>
							<span class="article-card__link-text">Читать далее →</span>
						</div>
					</a>
				{/each}
			</div>
		</Container>
	</section>
</main>

<style>
	.journal-hero {
		padding: var(--space-3xl) 0 var(--space-2xl);
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.journal-hero__content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
	}

	.journal-hero__title {
		font-size: var(--font-size-h1);
	}

	.journal-hero__description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
	}

	.journal-content {
		padding: var(--space-4xl) 0;
	}

	.categories-filter {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
		justify-content: center;
		margin-bottom: var(--space-3xl);
	}

	.category-btn {
		padding: 10px 20px;
		font-size: var(--font-size-body-sm);
		font-weight: 500;
		border-radius: var(--radius-pill);
		border: 1px solid var(--color-border);
		background-color: var(--color-background);
		color: var(--color-text-soft);
		transition: all var(--transition-fast);
		cursor: pointer;
	}

	.category-btn:hover {
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.category-btn.active {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		border-color: transparent;
	}

	.articles-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		gap: var(--space-2xl);
	}

	.article-card {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		overflow: hidden;
		transition: all var(--transition-fast);
		text-decoration: none;
		color: inherit;
		display: flex;
		flex-direction: column;
	}

	.article-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.article-card__image {
		position: relative;
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

	.article-card__category {
		position: absolute;
		top: var(--space-md);
		left: var(--space-md);
		padding: 6px 12px;
		background-color: var(--color-gold);
		color: var(--color-primary);
		font-size: var(--font-size-caption);
		font-weight: 600;
		border-radius: var(--radius-pill);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.article-card__content {
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		flex: 1;
	}

	.article-card__meta {
		display: flex;
		gap: var(--space-md);
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
		line-height: var(--line-height-relaxed);
		flex: 1;
	}

	.article-card__link-text {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-primary);
		margin-top: var(--space-sm);
	}

	@media (max-width: 768px) {
		.articles-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
