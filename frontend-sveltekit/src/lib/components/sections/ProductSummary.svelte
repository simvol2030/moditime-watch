<script lang="ts">
	import type { ProductSummaryProps } from '$lib/types/product';
	import Chip from '$lib/components/ui/Chip.svelte';

	// Props
	let {
		brand,
		name,
		rating,
		reviewsCount,
		sku,
		availability,
		availabilityStatus,
		price,
		priceNote,
		installment,
		tradeIn,
		options,
		benefits,
		tags
	}: ProductSummaryProps = $props();

	// State
	let selectedOptions = $state<Record<string, string>>({});

	// Initialize selected options
	$effect(() => {
		const initial: Record<string, string> = {};
		options.forEach((option) => {
			initial[option.id] = option.selected;
		});
		selectedOptions = initial;
	});

	// Functions
	function selectOption(optionId: string, value: string) {
		selectedOptions = { ...selectedOptions, [optionId]: value };
	}

	function formatPrice(priceValue: number): string {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(priceValue);
	}
</script>

<div class="product-summary">
	<div class="product-summary__header">
		<span class="product-summary__brand">{brand}</span>
		<h1>{name}</h1>
		<div class="product-summary__meta">
			<div class="rating" aria-label="Рейтинг {rating} из 5">
				<svg
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="currentColor"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8 12.26L3.272 15l.908-5.292L0 6.508l5.636-.82L8 1l2.364 4.688L16 6.508l-4.18 3.2L12.728 15z"
					/>
				</svg>
				<span>{rating}</span>
				<a href="#reviews">{reviewsCount} отзывов</a>
			</div>
			<span class="product-summary__sku">Артикул: {sku}</span>
			<span
				class="product-summary__availability product-summary__availability--{availabilityStatus}"
			>
				{availability}
			</span>
		</div>
	</div>

	<div class="product-summary__pricing">
		<div class="product-price">
			<span class="product-price__value">{formatPrice(price)}</span>
			{#if priceNote}
				<span class="product-price__note">{priceNote}</span>
			{/if}
		</div>
		{#if installment || tradeIn}
			<div class="product-price__options">
				{#if installment}
					<div>
						<span class="product-price__label">Рассрочка</span>
						<p>{installment}</p>
					</div>
				{/if}
				{#if tradeIn}
					<div>
						<span class="product-price__label">Оценка trade-in</span>
						<p>{tradeIn}</p>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if options.length > 0}
		<div class="product-summary__options">
			{#each options as option}
				<div class="product-option">
					<span class="product-option__label">{option.label}</span>
					<div class="product-option__choices" role="group" aria-label="Выбор {option.label}">
						{#each option.choices as choice}
							<Chip
								selected={selectedOptions[option.id] === choice.value}
								onclick={() => selectOption(option.id, choice.value)}
							>
								{choice.label}
							</Chip>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="product-summary__cta">
		<button class="btn btn-primary btn-large" type="button">Оформить доставку</button>
		<button class="btn btn-ghost btn-large" type="button">Запросить консультацию</button>
	</div>

	{#if benefits.length > 0}
		<div class="product-summary__benefits">
			{#each benefits as benefit}
				<div class="product-benefit">
					<svg
						width="20"
						height="20"
						viewBox="0 0 20 20"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						{@html benefit.icon}
					</svg>
					<div>
						<strong>{benefit.title}</strong>
						<p>{benefit.description}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	{#if tags.length > 0}
		<div class="product-summary__tags">
			{#each tags as tag, index}
				<Chip selected={index === 0}>{tag}</Chip>
			{/each}
		</div>
	{/if}
</div>

<style>
	.product-summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xl);
		position: sticky;
		top: calc(var(--header-height) + var(--space-lg));
	}

	/* Header */
	.product-summary__header {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding-bottom: var(--space-xl);
		border-bottom: 1px solid var(--color-border);
	}

	.product-summary__brand {
		font-family: var(--font-accent);
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--color-text-muted);
	}

	.product-summary__header h1 {
		font-size: var(--font-size-h2);
		line-height: var(--line-height-snug);
		margin: 0;
	}

	.product-summary__meta {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		font-size: var(--font-size-body-sm);
	}

	.rating {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-gold);
	}

	.rating span {
		font-weight: 600;
		color: var(--color-text);
	}

	.rating a {
		color: var(--color-primary);
		text-decoration: underline;
		margin-left: var(--space-xs);
	}

	.product-summary__sku {
		color: var(--color-text-muted);
	}

	.product-summary__availability {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		padding: 6px 12px;
		background-color: var(--color-surface);
		border-radius: var(--radius-pill);
		font-weight: 500;
		color: var(--color-text);
		width: fit-content;
	}

	.product-summary__availability::before {
		content: '';
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: var(--color-success);
	}

	.product-summary__availability--in-stock::before {
		background-color: var(--color-success);
	}

	.product-summary__availability--on-order::before {
		background-color: var(--color-accent);
	}

	.product-summary__availability--waitlist::before {
		background-color: var(--color-gold);
	}

	/* Pricing */
	.product-summary__pricing {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		padding: var(--space-xl);
		background-color: var(--color-surface);
		border-radius: var(--radius-xl);
	}

	.product-price__value {
		font-family: var(--font-primary);
		font-size: clamp(32px, 5vw, 48px);
		font-weight: 600;
		color: var(--color-primary);
		line-height: 1.1;
	}

	.product-price__note {
		display: block;
		font-size: var(--font-size-body-sm);
		color: var(--color-text-soft);
		margin-top: var(--space-xs);
	}

	.product-price__options {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding-top: var(--space-lg);
		border-top: 1px solid var(--color-border);
	}

	.product-price__options > div {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.product-price__label {
		font-size: var(--font-size-caption);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
	}

	.product-price__options p {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	/* Options */
	.product-summary__options {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.product-option {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.product-option__label {
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	.product-option__choices {
		display: flex;
		gap: var(--space-sm);
		flex-wrap: wrap;
	}

	/* CTA */
	.product-summary__cta {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: var(--space-xl) 0;
		border-top: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);
	}

	.product-summary__cta button {
		width: 100%;
	}

	/* Benefits */
	.product-summary__benefits {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.product-benefit {
		display: flex;
		gap: var(--space-md);
		align-items: flex-start;
	}

	.product-benefit svg {
		flex-shrink: 0;
		color: var(--color-primary);
		margin-top: 2px;
	}

	.product-benefit div {
		display: flex;
		flex-direction: column;
		gap: var(--space-2xs);
	}

	.product-benefit strong {
		font-size: var(--font-size-body);
		font-weight: 600;
		color: var(--color-text);
	}

	.product-benefit p {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	/* Tags */
	.product-summary__tags {
		display: flex;
		gap: var(--space-xs);
		flex-wrap: wrap;
	}

	/* Mobile */
	@media (max-width: 991px) {
		.product-summary {
			position: static;
			gap: var(--space-xl);
		}

		.product-summary__cta {
			padding: var(--space-lg) 0;
		}
	}
</style>
