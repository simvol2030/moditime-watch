<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Data from database via +page.server.ts
	const { seo, deliveryOptions, paymentMethods, geography, faqItems } = data;

	let openFaq = $state<string | null>(null);

	function toggleFaq(id: string) {
		openFaq = openFaq === id ? null : id;
	}
</script>

<SeoManager {seo} />

<main class="page-main delivery-page">
	<!-- Hero -->
	<section class="delivery-hero">
		<Container>
			<div class="delivery-hero__content">
				<span class="section-eyebrow">Доставка и оплата</span>
				<h1 class="delivery-hero__title">Безопасная доставка премиальных часов</h1>
				<p class="delivery-hero__description">
					Экспресс-доставка из Женевы за 24-72 часа. Полное страхование, персональное
					сопровождение, возможность примерки перед оплатой
				</p>
			</div>
		</Container>
	</section>

	<!-- Delivery Options -->
	<section class="section delivery-options">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">Варианты</span>
				<h2 class="section-title">Способы доставки</h2>
			</div>

			<div class="options-grid">
				{#each deliveryOptions as option}
					<div class="option-card">
						<div class="option-card__icon">{option.icon}</div>
						<h3 class="option-card__type">{option.type}</h3>
						<div class="option-card__meta">
							<span class="option-card__time">{option.time}</span>
							<span class="option-card__price">{option.price}</span>
						</div>
						<p class="option-card__description">{option.description}</p>
						<ul class="option-card__features">
							{#each option.features as feature}
								<li>✓ {feature}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- Geography -->
	<section class="section delivery-geography">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">География</span>
				<h2 class="section-title">Доставка по всему миру</h2>
			</div>

			<div class="geography-table">
				{#each geography as geo}
					<div class="geography-row">
						<span class="geography-row__region">{geo.region}</span>
						<span class="geography-row__time">{geo.time}</span>
						<span class="geography-row__price">{geo.price}</span>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<!-- Payment Methods -->
	<section class="section payment-methods">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">Оплата</span>
				<h2 class="section-title">Способы оплаты</h2>
			</div>

			<div class="payment-grid">
				{#each paymentMethods as method}
					<div class="payment-card">
						<div class="payment-card__icon">{method.icon}</div>
						<h3 class="payment-card__title">{method.title}</h3>
						<p class="payment-card__description">{method.description}</p>
					</div>
				{/each}
			</div>

			<div class="payment-note">
				<p>
					💡 <strong>Безопасность платежей:</strong> Все транзакции защищены SSL-шифрованием.
					Мы не храним данные ваших карт и не передаём их третьим лицам.
				</p>
			</div>
		</Container>
	</section>

	<!-- FAQ -->
	<section class="section delivery-faq">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">FAQ</span>
				<h2 class="section-title">Частые вопросы</h2>
			</div>

			<div class="faq-list">
				{#each faqItems as item, i}
					<div class="faq-item">
						<button
							class="faq-item__question"
							class:active={openFaq === `faq-${i}`}
							onclick={() => toggleFaq(`faq-${i}`)}
						>
							<span>{item.question}</span>
							<span class="faq-item__icon">{openFaq === `faq-${i}` ? '−' : '+'}</span>
						</button>
						{#if openFaq === `faq-${i}`}
							<div class="faq-item__answer">
								<p>{item.answer}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</Container>
	</section>
</main>

<style>
	/* Hero */
	.delivery-hero {
		padding: var(--space-3xl) 0 var(--space-2xl);
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.delivery-hero__content {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
	}

	.delivery-hero__title {
		font-size: var(--font-size-h1);
	}

	.delivery-hero__description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
	}

	/* Delivery Options */
	.delivery-options {
		padding: var(--space-4xl) 0;
	}

	.options-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-xl);
	}

	.option-card {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		transition: all var(--transition-fast);
	}

	.option-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.option-card__icon {
		font-size: 48px;
		line-height: 1;
	}

	.option-card__type {
		font-size: var(--font-size-h4);
	}

	.option-card__meta {
		display: flex;
		gap: var(--space-md);
		flex-wrap: wrap;
	}

	.option-card__time,
	.option-card__price {
		font-size: var(--font-size-body-sm);
		padding: 4px 12px;
		background-color: var(--color-surface);
		border-radius: var(--radius-pill);
		font-weight: 500;
	}

	.option-card__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	.option-card__features {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		font-size: var(--font-size-body-sm);
		color: var(--color-text-soft);
	}

	/* Geography */
	.delivery-geography {
		padding: var(--space-4xl) 0;
		background-color: var(--color-surface);
	}

	.geography-table {
		max-width: 900px;
		margin: 0 auto;
		background-color: var(--color-background);
		border-radius: var(--radius-xl);
		overflow: hidden;
		border: 1px solid var(--color-border);
	}

	.geography-row {
		display: grid;
		grid-template-columns: 2fr 1fr 1fr;
		gap: var(--space-md);
		padding: var(--space-lg) var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.geography-row:last-child {
		border-bottom: none;
	}

	.geography-row__region {
		font-weight: 600;
		color: var(--color-text);
	}

	.geography-row__time,
	.geography-row__price {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-soft);
	}

	/* Payment Methods */
	.payment-methods {
		padding: var(--space-4xl) 0;
	}

	.payment-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-xl);
		margin-bottom: var(--space-2xl);
	}

	.payment-card {
		background-color: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
	}

	.payment-card__icon {
		font-size: 48px;
		line-height: 1;
	}

	.payment-card__title {
		font-size: var(--font-size-h4);
	}

	.payment-card__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	.payment-note {
		max-width: 800px;
		margin: 0 auto;
		padding: var(--space-lg);
		background-color: rgba(10, 36, 99, 0.06);
		border-radius: var(--radius-lg);
		text-align: center;
	}

	body[data-theme='dark'] .payment-note {
		background-color: rgba(62, 146, 204, 0.12);
	}

	/* FAQ */
	.delivery-faq {
		padding: var(--space-4xl) 0;
	}

	.faq-list {
		max-width: 900px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.faq-item {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
	}

	.faq-item__question {
		width: 100%;
		padding: var(--space-lg) var(--space-xl);
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-body);
		font-weight: 600;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.faq-item__question:hover {
		background-color: var(--color-surface);
	}

	.faq-item__question.active {
		background-color: var(--color-surface);
	}

	.faq-item__icon {
		font-size: 24px;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.faq-item__answer {
		padding: 0 var(--space-xl) var(--space-lg);
		animation: fade-up 0.3s ease;
	}

	.faq-item__answer p {
		line-height: var(--line-height-relaxed);
		font-size: var(--font-size-body);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.geography-row {
			grid-template-columns: 1fr;
			gap: var(--space-xs);
			padding: var(--space-md);
		}

		.geography-row__region {
			font-size: var(--font-size-body);
		}
	}
</style>
