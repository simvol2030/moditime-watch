<script lang="ts">
	import type { ExperienceSectionProps } from '$lib/types/experience';

	// Props using Svelte 5 $props() rune
	let {
		eyebrow = '',
		title,
		description,
		stats,
		services,
		ctaText,
		ctaHref
	}: ExperienceSectionProps = $props();
</script>

<section class="experience" id="services">
	<div class="container experience__grid">
		<!-- Left column: Highlight -->
		<div class="experience__highlight">
			{#if eyebrow}
				<span class="section-eyebrow">{eyebrow}</span>
			{/if}
			<h2>{title}</h2>
			<p>{description}</p>

			<!-- Statistics -->
			<div class="experience__stats stat-grid">
				{#each stats as stat}
					<div class="stat">
						<span class="stat__label">{stat.label}</span>
						<span class="stat__value">{stat.value}</span>
					</div>
				{/each}
			</div>

			<!-- CTA button -->
			<a href={ctaHref} class="btn btn-primary">{ctaText}</a>
		</div>

		<!-- Right column: Services -->
		<div class="experience__services">
			{#each services as service (service.id)}
				<article class="service-card">
					<div class="service-card__icon">
						{@html service.icon}
					</div>
					<h3>{service.title}</h3>
					<p>{service.description}</p>
					<a href={service.linkHref} class="service-card__link">{service.linkText}</a>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Experience section */
	.experience {
		background: linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, rgba(212, 175, 55, 0) 100%);
		padding: var(--space-4xl) 0;
	}

	:global(body[data-theme='dark']) .experience {
		background: linear-gradient(
			135deg,
			rgba(212, 175, 55, 0.12) 0%,
			rgba(15, 18, 27, 0.6) 100%
		);
	}

	/* Grid layout */
	.experience__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-2xl);
	}

	/* Left column: Highlight */
	.experience__highlight {
		display: flex;
		flex-direction: column;
		gap: var(--space-xl);
		padding-right: var(--space-2xl);
	}

	/* Statistics grid */
	.experience__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--space-lg);
	}

	/* Right column: Services */
	.experience__services {
		display: grid;
		gap: var(--space-lg);
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}

	/* Service card */
	.service-card {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.service-card__icon {
		width: 52px;
		height: 52px;
		border-radius: var(--radius-pill);
		background-color: rgba(212, 175, 55, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary);
	}

	:global(body[data-theme='dark']) .service-card__icon {
		background-color: rgba(212, 175, 55, 0.12);
	}

	.service-card__link {
		color: var(--color-primary);
		font-weight: 600;
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
	}

	/* Responsive */
	@media (max-width: 1024px) {
		.experience__grid {
			grid-template-columns: 1fr;
		}

		.experience__highlight {
			padding-right: 0;
		}
	}
</style>
