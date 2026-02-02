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

<!-- Session-12: replaced iframe with link to avoid CSP violation -->
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
				<div class="telegram-cta__link-card">
					<svg class="telegram-cta__icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="24" cy="24" r="24" fill="#229ED9"/>
						<path d="M33.95 15.56L30.16 33.04C30.16 33.04 29.64 34.36 28.16 33.7L20.62 27.86L20.58 27.84C21.82 26.72 29.72 19.52 30.06 19.2C30.58 18.72 30.24 18.44 29.64 18.8L17.7 26.44L12.82 24.86C12.82 24.86 12.04 24.58 11.96 23.92C11.88 23.26 12.84 22.9 12.84 22.9L32.34 15.28C32.34 15.28 33.95 14.56 33.95 15.56Z" fill="white"/>
					</svg>
					<div class="telegram-cta__link-info">
						<span class="telegram-cta__link-title">Moditimewatch</span>
						<span class="telegram-cta__link-desc">Telegram канал</span>
					</div>
					<a href={channelUrl || ctaHref} class="telegram-cta__link-btn" target="_blank" rel="noopener noreferrer">
						Открыть в Telegram
					</a>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	/* ============================================ */
	/* Telegram CTA Section Styles                */
	/* ============================================ */

	.telegram-cta {
		padding: var(--space-4xl) 0;
	}

	.telegram-cta__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2xl);
		align-items: stretch;
	}

	.telegram-cta__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		animation: fade-up 0.6s ease both;
	}

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
		align-items: center;
		justify-content: center;
		padding: var(--space-2xl);
	}

	/* Link card replacing iframe */
	.telegram-cta__link-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-lg);
		text-align: center;
		padding: var(--space-xl);
	}

	.telegram-cta__icon {
		width: 80px;
		height: 80px;
	}

	.telegram-cta__link-info {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.telegram-cta__link-title {
		font-family: var(--font-accent);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--color-text);
	}

	.telegram-cta__link-desc {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	.telegram-cta__link-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-sm) var(--space-lg);
		background: #229ED9;
		color: white;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 600;
		font-size: var(--font-size-body-sm);
		transition: background-color var(--transition-fast);
	}

	.telegram-cta__link-btn:hover {
		background: #1a8bc2;
	}

	/* Gradient border */
	.gradient-border {
		position: relative;
		border-radius: var(--radius-xl);
		padding: 1px;
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

	/* Fade-up animation */
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

	/* Responsive */
	@media (max-width: 768px) {
		.telegram-cta__grid {
			grid-template-columns: 1fr;
		}

		.telegram-cta__icon {
			width: 64px;
			height: 64px;
		}
	}
</style>
