<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Data from database via +page.server.ts
	const { seo, stats, values, team } = data;
</script>

<SeoManager {seo} />

<main class="page-main about-page">
	<!-- Hero Section -->
	<section class="about-hero">
		<Container>
			<div class="about-hero__content">
				<span class="section-eyebrow">О нас</span>
				<h1 class="about-hero__title">Moditimewatch — сервис доставки премиальных часов</h1>
				<p class="about-hero__description">
					Мы создали Moditimewatch, чтобы сделать доступ к швейцарским часам максимально простым и
					безопасным. Наша команда находит редкие модели, проверяет их подлинность и доставляет с
					полным сервисным сопровождением.
				</p>

				<div class="stat-grid">
					{#each stats as stat}
						<div class="stat">
							<span class="stat__value">{stat.value}</span>
							<span class="stat__label">{stat.label}</span>
						</div>
					{/each}
				</div>
			</div>
		</Container>
	</section>

	<!-- Story Section -->
	<section class="section about-story">
		<Container>
			<div class="about-story__grid">
				<div class="about-story__image">
					<img
						src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080"
						alt="Швейцарские часы"
					/>
				</div>
				<div class="about-story__content">
					<span class="section-eyebrow">История</span>
					<h2 class="section-title">Как мы начали</h2>
					<div class="about-story__text">
						<p>
							В 2018 году мы столкнулись с проблемой: купить оригинальные швейцарские часы в России
							было сложно и дорого. Официальные бутики предлагали ограниченный выбор, а сделки с
							частными продавцами были небезопасны.
						</p>
						<p>
							Мы решили создать сервис, который объединяет доступ к мировым часовым домам,
							профессиональную экспертизу и надёжную логистику. Сегодня Moditimewatch работает
							напрямую с авторизованными дилерами в Женеве, Цюрихе и Лондоне.
						</p>
						<p>
							За 6 лет мы помогли более 2400 клиентам найти идеальные часы — от классических Rolex
							до лимитированных Patek Philippe и уникальных винтажных моделей.
						</p>
					</div>
				</div>
			</div>
		</Container>
	</section>

	<!-- Values Section -->
	<section class="section about-values">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">Ценности</span>
				<h2 class="section-title">Что нами движет</h2>
			</div>

			<div class="values-grid">
				{#each values as value}
					<div class="value-card">
						<div class="value-card__icon">{value.icon}</div>
						<h3 class="value-card__title">{value.title}</h3>
						<p class="value-card__description">{value.description}</p>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- Team Section -->
	<section class="section about-team">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">Команда</span>
				<h2 class="section-title">Эксперты Moditimewatch</h2>
			</div>

			<div class="team-grid">
				{#each team as member}
					<div class="team-card">
						<div class="team-card__image">
							<img src={member.image} alt={member.name} />
						</div>
						<h3 class="team-card__name">{member.name}</h3>
						<span class="team-card__role">{member.role}</span>
						<p class="team-card__description">{member.description}</p>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- CTA Section -->
	<section class="section about-cta">
		<Container>
			<div class="about-cta__content">
				<h2 class="about-cta__title">Готовы найти идеальные часы?</h2>
				<p class="about-cta__description">
					Свяжитесь с нашим консьержем, и мы подберём модель под ваш стиль, бюджет и сценарии
					использования
				</p>
				<div class="about-cta__buttons">
					<a href="/catalog" class="btn btn-primary">Смотреть каталог</a>
					<a href="/contacts" class="btn btn-ghost">Связаться с нами</a>
				</div>
			</div>
		</Container>
	</section>
</main>

<style>
	.about-page {
		padding-bottom: var(--space-4xl);
	}

	/* Hero */
	.about-hero {
		padding: var(--space-4xl) 0;
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.about-hero__content {
		max-width: 900px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		align-items: center;
	}

	.about-hero__title {
		font-size: var(--font-size-display);
		line-height: var(--line-height-tight);
	}

	.about-hero__description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
		max-width: 720px;
	}

	/* Story */
	.about-story {
		padding: var(--space-4xl) 0;
	}

	.about-story__grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3xl);
		align-items: center;
	}

	.about-story__image {
		border-radius: var(--radius-xl);
		overflow: hidden;
	}

	.about-story__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.about-story__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.about-story__text {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.about-story__text p {
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
	}

	/* Values */
	.about-values {
		padding: var(--space-4xl) 0;
		background-color: var(--color-surface);
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-xl);
	}

	.value-card {
		background-color: var(--color-background);
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		text-align: center;
		transition: transform var(--transition-fast), box-shadow var(--transition-fast);
	}

	.value-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.value-card__icon {
		font-size: 48px;
		line-height: 1;
	}

	.value-card__title {
		font-size: var(--font-size-h4);
	}

	.value-card__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	/* Team */
	.about-team {
		padding: var(--space-4xl) 0;
	}

	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-2xl);
	}

	.team-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: var(--space-md);
	}

	.team-card__image {
		width: 160px;
		height: 160px;
		border-radius: 50%;
		overflow: hidden;
		border: 4px solid var(--color-border);
	}

	.team-card__image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.team-card__name {
		font-size: var(--font-size-h4);
		margin-top: var(--space-sm);
	}

	.team-card__role {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.team-card__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
		max-width: 280px;
	}

	/* CTA */
	.about-cta {
		padding: var(--space-4xl) 0;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
	}

	.about-cta__content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
	}

	.about-cta__title {
		font-size: var(--font-size-h1);
		color: #fff;
	}

	.about-cta__description {
		font-size: var(--font-size-body-lg);
		opacity: 0.95;
		color: #fff;
	}

	.about-cta__buttons {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
		justify-content: center;
		margin-top: var(--space-lg);
	}

	.about-cta__buttons .btn-primary {
		background: #fff;
		color: var(--color-primary);
	}

	.about-cta__buttons .btn-ghost {
		color: #fff;
		border-color: rgba(255, 255, 255, 0.4);
	}

	.about-cta__buttons .btn-ghost:hover {
		background-color: rgba(255, 255, 255, 0.1);
		border-color: #fff;
	}

	/* Responsive */
	@media (max-width: 991px) {
		.about-story__grid {
			grid-template-columns: 1fr;
			gap: var(--space-2xl);
		}

		.about-story__image {
			order: -1;
		}
	}

	@media (max-width: 768px) {
		.stat-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.about-cta__buttons {
			flex-direction: column;
			width: 100%;
		}

		.about-cta__buttons .btn {
			width: 100%;
		}
	}
</style>
