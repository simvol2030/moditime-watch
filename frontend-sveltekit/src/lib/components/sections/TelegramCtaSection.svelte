<script lang="ts">
	import type { TelegramCtaSectionProps } from '$lib/types/telegram-cta';

	// Props destructuring with Svelte 5 $props rune
	let {
		eyebrow,
		title,
		description,
		features,
		ctaText,
		ctaHref,
		channelUrl
	}: TelegramCtaSectionProps = $props();
</script>

<!-- HTML структура - точная копия из site/index.html (строки 790-809) -->
<section class="telegram-cta" id="telegram">
	<div class="container telegram-cta__grid">
		<div class="telegram-cta__content">
			{#if eyebrow}
				<span class="section-eyebrow">{eyebrow}</span>
			{/if}
			<h2>{title}</h2>
			<p>{description}</p>
			<ul class="telegram-cta__list">
				{#each features as feature}
					<li>{feature}</li>
				{/each}
			</ul>
			<a href={ctaHref} class="btn btn-primary" target="_blank" rel="noopener">
				{ctaText}
			</a>
		</div>
		<div class="telegram-cta__widget gradient-border">
			<div class="telegram-cta__widget-inner">
				<iframe title="Moditimewatch Telegram" src={channelUrl} loading="lazy"></iframe>
			</div>
		</div>
	</div>
</section>

<style>
	/* ============================================ */
	/* Telegram CTA Section Styles                */
	/* Источник: site/css/homepage.css (449-556)  */
	/* ============================================ */

	/* Основная секция */
	.telegram-cta {
		padding: var(--space-4xl) 0;
	}

	/* Grid layout (2 колонки на desktop) */
	.telegram-cta__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2xl);
		align-items: stretch;
	}

	/* Контент (левая колонка) */
	.telegram-cta__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		animation: fade-up 0.6s ease both;
	}

	/* Список преимуществ */
	.telegram-cta__list {
		margin: 0;
		padding-left: 20px;
		display: grid;
		gap: var(--space-sm);
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
	}

	.telegram-cta__list li {
		color: var(--color-text-soft);
	}

	/* Widget контейнер (правая колонка) */
	.telegram-cta__widget {
		display: flex;
		align-items: stretch;
		border-radius: var(--radius-xl);
		animation: fade-up 0.6s ease both;
	}

	.telegram-cta__widget-inner {
		border-radius: inherit;
		overflow: hidden;
		background-color: var(--color-background);
		height: 100%;
		display: flex;
	}

	.telegram-cta__widget-inner iframe {
		width: 100%;
		min-height: 420px;
		border: none;
	}

	/* Gradient border вокруг iframe */
	/* Источник: site/css/components.css (363-373) */
	.gradient-border {
		position: relative;
		border-radius: var(--radius-xl);
		padding: 1px;
		/* Золотой градиент - адаптация под проект часов */
		background: linear-gradient(
			135deg,
			rgba(212, 175, 55, 0.6),
			rgba(62, 146, 204, 0.6)
		);
	}

	.gradient-border > * {
		border-radius: inherit;
		background-color: var(--color-background);
	}

	/* Fade-up анимация */
	/* Источник: site/css/main.css (45-54) */
	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(24px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* ============================================ */
	/* Responsive Media Queries                    */
	/* ============================================ */

	/* Tablet и меньше */
	@media (max-width: 768px) {
		.telegram-cta__grid {
			grid-template-columns: 1fr;
		}

		.telegram-cta__widget-inner iframe {
			min-height: 320px;
		}
	}
</style>
