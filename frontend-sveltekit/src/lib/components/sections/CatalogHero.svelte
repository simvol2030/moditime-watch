<script lang="ts">
	import type { CatalogHeroProps } from '$lib/types/catalog';

	// Props - using Svelte 5 syntax
	let { eyebrow, title, description, stats }: CatalogHeroProps = $props();

	// State for concierge form
	let brand = $state('');
	let budget = $state('');

	// Form submission handler
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		console.log('Concierge request:', { brand, budget });
		// TODO: Implement actual API call
		alert(`Запрос отправлен! Бренд: ${brand}, Бюджет: ${budget}`);
		// Reset form
		brand = '';
		budget = '';
	}
</script>

<section class="catalog-hero">
	<div class="container catalog-hero__grid">
		<div class="catalog-hero__content">
			{#if eyebrow}
				<span class="section-eyebrow">{eyebrow}</span>
			{/if}
			<h1>{title}</h1>
			<p>{description}</p>
			<div class="catalog-hero__stats">
				{#each stats as stat}
					<div class="stat">
						<span class="stat__label">{stat.label}</span>
						<span class="stat__value">{stat.value}</span>
					</div>
				{/each}
			</div>
		</div>
		<aside class="catalog-hero__aside">
			<h2>Консьерж-подбор</h2>
			<p>
				Нужна редкая модель? Оставьте заявку — подберём часы в течение 24 часов и доставим в любую
				точку России и СНГ.
			</p>
			<form class="catalog-hero__form" onsubmit={handleSubmit}>
				<label>
					<span>Предпочитаемый бренд</span>
					<input
						class="input-field"
						type="text"
						name="brand"
						placeholder="Например, Audemars Piguet"
						bind:value={brand}
					/>
				</label>
				<label>
					<span>Диапазон бюджета</span>
					<input
						class="input-field"
						type="text"
						name="budget"
						placeholder="Например, 3–5 млн ₽"
						bind:value={budget}
					/>
				</label>
				<button class="btn btn-primary" type="submit">Отправить запрос</button>
			</form>
		</aside>
	</div>
</section>

<style>
	/* CatalogHero styles - exact copy from catalog.css */
	.catalog-hero {
		padding: var(--space-3xl) 0 var(--space-2xl);
	}

	.catalog-hero__grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
		gap: var(--space-2xl);
		align-items: stretch;
	}

	.catalog-hero__content {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
	}

	.catalog-hero__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: var(--space-lg);
	}

	.catalog-hero__aside {
		padding: var(--space-2xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.catalog-hero__aside h2 {
		font-size: var(--font-size-h3);
	}

	.catalog-hero__form {
		display: grid;
		gap: var(--space-md);
	}

	.catalog-hero__form label {
		display: grid;
		gap: var(--space-xs);
		font-size: var(--font-size-body-sm);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	/* Responsive */
	@media (max-width: 1200px) {
		.catalog-hero__grid {
			grid-template-columns: 1fr;
		}

		.catalog-hero__aside {
			order: -1;
		}
	}
</style>
