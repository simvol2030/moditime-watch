<script lang="ts">
	import type { ProductServicesProps } from '$lib/types/services';

	// Props - Svelte 5 syntax
	let {
		title,
		description,
		features,
		ctaText = 'Получить консультацию',
		ctaHref = '#',
		faqTitle = 'Частые вопросы',
		faqItems
	}: ProductServicesProps = $props();
</script>

<!-- ============================================================ -->
<!-- COMPONENT: ProductServices                                   -->
<!-- Purpose: Service highlights and FAQ section                  -->
<!-- ============================================================ -->
<section class="product-services">
	<div class="container product-services__grid">
		<article class="service-highlight">
			<h2>{title}</h2>
			<p>{description}</p>
			<ul>
				{#each features as feature}
					<li>
						<strong>{feature.title}:</strong>
						{feature.description}
					</li>
				{/each}
			</ul>
			<a href={ctaHref} class="btn btn-primary">{ctaText}</a>
		</article>

		<aside class="service-aside">
			<h3>{faqTitle}</h3>
			{#each faqItems as item}
				<details open={item.defaultOpen ?? false}>
					<summary>{item.question}</summary>
					<p>{item.answer}</p>
				</details>
			{/each}
		</aside>
	</div>
</section>

<style>
	/* Product Services Grid */
	.product-services__grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		gap: var(--space-2xl);
	}

	/* Service Highlight */
	.service-highlight {
		padding: var(--space-2xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.service-highlight ul {
		display: grid;
		gap: var(--space-sm);
		color: var(--color-text-soft);
	}

	/* Service Aside (FAQ) */
	.service-aside {
		padding: var(--space-2xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		display: grid;
		gap: var(--space-md);
	}

	.service-aside details {
		padding: var(--space-md);
		border-radius: var(--radius-lg);
		background-color: var(--color-background);
		border: 1px solid var(--color-border-light);
	}

	.service-aside summary {
		font-weight: 600;
		cursor: pointer;
	}

	.service-aside details p {
		margin-top: var(--space-sm);
		color: var(--color-text-soft);
	}

	/* Responsive */
	@media (max-width: 992px) {
		.product-services__grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 576px) {
		.service-highlight {
			padding: var(--space-xl);
		}
	}
</style>
