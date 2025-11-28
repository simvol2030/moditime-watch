<script lang="ts">
	import type { HeroContent } from '$lib/types/hero';

	// Props с TypeScript типизацией
	let { content }: { content: HeroContent } = $props();
</script>

<!-- Hero Section - точная копия из site/index.html -->
<section class="hero" id="top">
	<div class="container hero__grid">
		<!-- Левая колонка: контент -->
		<div class="hero__content">
			<span class="tagline">{content.tagline}</span>
			<h1>{content.title}</h1>
			<p>{content.description}</p>

			<!-- CTA кнопки -->
			<div class="hero__actions">
				<a href={content.primaryCta.href} class="btn btn-primary">
					{content.primaryCta.text}
				</a>
				<a href={content.secondaryCta.href} class="btn btn-ghost">
					{content.secondaryCta.text}
				</a>
			</div>

			<!-- Статистика -->
			<div class="hero__stats">
				{#each content.stats as stat}
					<div class="hero__stat">
						<span class="hero__stat-value">{stat.value}</span>
						<span class="hero__stat-label">{stat.label}</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Правая колонка: изображение и quick links -->
		<div class="hero__media">
			<!-- Hero карточка с изображением -->
			<div class="hero-card gradient-border">
				<div class="hero-card__inner">
					<img
						src={content.image.src}
						alt={content.image.alt}
						width={content.image.width ?? 520}
						height={content.image.height ?? 640}
					/>
					{#if content.image.badge}
						<div class="hero-card__badge">
							<span>{content.image.badge.label}</span>
							<strong>{content.image.badge.title}</strong>
						</div>
					{/if}
				</div>
			</div>

			<!-- Quick links (chips) -->
			<div class="hero__quick-links">
				{#each content.quickLinks as link}
					<a href={link.href} class="chip {link.variant === 'primary' ? 'chip-primary' : ''}">
						{link.text}
					</a>
				{/each}
			</div>
		</div>
	</div>

	<!-- Бренды внизу -->
	<div class="hero__brands">
		<div class="container hero__brands-row">
			<span class="hero__brands-label">Бренды сервиса</span>
			<ul class="hero__brands-list">
				{#each content.brands as brand}
					<li>{brand}</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	/* Hero Section - адаптировано под тематику часов */
	.hero {
		position: relative;
		padding: var(--space-4xl, 96px) 0 var(--space-3xl, 64px);
		/* Адаптация фона: золотой вместо синего */
		background: radial-gradient(
					140% 140% at 100% 0%,
					rgba(212, 175, 55, 0.08) 0%,
					transparent 55%
				),
				linear-gradient(180deg, rgba(245, 242, 235, 0.9) 0%, rgba(255, 255, 255, 1) 40%);
		overflow: hidden;
	}

	/* Тёмная тема */
	:global(body[data-theme='dark']) .hero {
		background: radial-gradient(
					140% 140% at 100% 0%,
					rgba(212, 175, 55, 0.18) 0%,
					rgba(15, 18, 27, 0.95) 55%
				),
				linear-gradient(180deg, #10131a 0%, #0b0e16 60%);
	}

	/* Золотой overlay */
	.hero::after {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(60% 80% at 0% 0%, rgba(212, 175, 55, 0.15), transparent 70%);
		pointer-events: none;
	}

	.hero__grid {
		position: relative;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3xl, 64px);
		z-index: 1;
	}

	.hero__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl, 32px);
	}

	.hero__content h1 {
		font-size: var(--font-size-display, clamp(40px, 6vw, 64px));
		line-height: var(--line-height-tight, 1.15);
	}

	.hero__content p {
		font-size: var(--font-size-body-xl, 20px);
		line-height: var(--line-height-relaxed, 1.7);
	}

	.hero__actions {
		display: flex;
		gap: var(--space-md, 16px);
		flex-wrap: wrap;
	}

	.hero__stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(120px, 1fr));
		gap: var(--space-lg, 24px);
	}

	.hero__stat {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs, 8px);
	}

	.hero__stat-value {
		font-family: var(--font-primary, serif);
		font-size: clamp(32px, 5vw, 42px);
		/* Золотой цвет для статистики */
		color: var(--color-gold, #d4af37);
	}

	.hero__stat-label {
		font-size: var(--font-size-body-sm, 14px);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.18em;
	}

	.hero__media {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg, 24px);
	}

	.hero-card {
		border-radius: var(--radius-xl, 24px);
	}

	.hero-card__inner {
		position: relative;
		overflow: hidden;
		border-radius: inherit;
	}

	.hero-card__inner img {
		width: 100%;
		height: auto;
		display: block;
	}

	.hero-card__badge {
		position: absolute;
		bottom: var(--space-lg, 24px);
		left: var(--space-lg, 24px);
		padding: var(--space-md, 16px);
		backdrop-filter: blur(18px);
		background: rgba(10, 36, 99, 0.85);
		color: #fff;
		border-radius: var(--radius-lg, 18px);
		display: flex;
		flex-direction: column;
		gap: var(--space-xs, 8px);
	}

	.hero-card__badge span {
		font-size: var(--font-size-body-sm, 14px);
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.75);
	}

	.hero-card__badge strong {
		font-family: var(--font-primary, serif);
		font-size: var(--font-size-h3, clamp(22px, 2vw, 28px));
	}

	.hero__quick-links {
		display: flex;
		gap: var(--space-sm, 12px);
		flex-wrap: wrap;
	}

	.hero__brands {
		margin-top: var(--space-3xl, 64px);
	}

	.hero__brands-row {
		display: flex;
		gap: var(--space-xl, 32px);
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		border-top: 1px solid var(--color-border);
		padding-top: var(--space-lg, 24px);
	}

	.hero__brands-label {
		font-family: var(--font-accent, sans-serif);
		font-size: var(--font-size-body-sm, 14px);
		letter-spacing: 0.25em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	.hero__brands-list {
		display: flex;
		gap: var(--space-lg, 24px);
		flex-wrap: wrap;
		font-family: var(--font-accent, sans-serif);
		color: var(--color-text-soft);
		list-style: none;
		padding: 0;
		margin: 0;
	}

	/* Responsive: Tablet */
	@media (max-width: 1024px) {
		.hero__grid {
			grid-template-columns: 1fr;
		}

		.hero__media {
			max-width: 520px;
		}

		.hero__stats {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		}
	}

	/* Responsive: Mobile */
	@media (max-width: 768px) {
		.hero {
			padding: var(--space-3xl, 64px) 0 var(--space-2xl, 48px);
		}

		.hero__content {
			text-align: center;
		}

		.hero__actions {
			justify-content: center;
		}

		.hero__quick-links {
			justify-content: center;
		}

		.hero__brands-row {
			justify-content: center;
			text-align: center;
		}
	}

	@media (max-width: 480px) {
		.hero__stats {
			grid-template-columns: 1fr;
		}
	}
</style>
