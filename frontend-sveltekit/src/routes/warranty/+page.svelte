<script lang="ts">
	import SeoManager from '$lib/components/seo/SeoManager.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Data from database via +page.server.ts
	const { seo, guarantees, warrantyDetails, returnProcess } = data;
</script>

<SeoManager {seo} />

<main class="page-main warranty-page">
	<section class="warranty-hero">
		<Container>
			<div class="warranty-hero__content">
				<span class="section-eyebrow">Гарантии</span>
				<h1 class="warranty-hero__title">Защита ваших инвестиций</h1>
				<p class="warranty-hero__description">
					Швейцарская гарантия 5 лет, возврат без объяснений 14 дней, пожизненная гарантия
					подлинности. Ваша уверенность — наша ответственность
				</p>
			</div>
		</Container>
	</section>

	<section class="section guarantees-section">
		<Container>
			<div class="guarantees-grid">
				{#each guarantees as guarantee}
					<div class="guarantee-card">
						<div class="guarantee-card__icon">{guarantee.icon}</div>
						<h3 class="guarantee-card__title">{guarantee.title}</h3>
						<span class="guarantee-card__period">{guarantee.period}</span>
						<p class="guarantee-card__description">{guarantee.description}</p>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<section class="section warranty-details">
		<Container>
			<div class="section-intro center">
				<h2 class="section-title">Условия гарантии</h2>
			</div>

			<div class="details-grid">
				{#each warrantyDetails as detail}
					<div class="detail-card">
						<h3 class="detail-card__title">{detail.title}</h3>
						<ul class="detail-card__list">
							{#each detail.items as item}
								<li>{item}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</Container>
	</section>

	<section class="section return-process">
		<Container>
			<div class="section-intro center">
				<span class="section-eyebrow">Возврат</span>
				<h2 class="section-title">Как вернуть часы</h2>
			</div>

			<div class="process-grid">
				{#each returnProcess as item}
					<div class="process-step">
						<div class="process-step__number">{item.step}</div>
						<h3 class="process-step__title">{item.title}</h3>
						<p class="process-step__description">{item.description}</p>
					</div>
				{/each}
			</div>
		</Container>
	</section>
</main>

<style>
	.warranty-hero {
		padding: var(--space-3xl) 0 var(--space-2xl);
		background: linear-gradient(
			160deg,
			var(--color-surface) 0%,
			var(--color-background) 100%
		);
	}

	.warranty-hero__content {
		max-width: 720px;
		margin: 0 auto;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		align-items: center;
	}

	.warranty-hero__title {
		font-size: var(--font-size-h1);
	}

	.warranty-hero__description {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
	}

	.guarantees-section {
		padding: var(--space-4xl) 0;
	}

	.guarantees-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-xl);
	}

	.guarantee-card {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-sm);
		transition: all var(--transition-fast);
	}

	.guarantee-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.guarantee-card__icon {
		font-size: 48px;
		line-height: 1;
	}

	.guarantee-card__title {
		font-size: var(--font-size-h4);
	}

	.guarantee-card__period {
		font-family: var(--font-accent);
		font-size: var(--font-size-body);
		font-weight: 600;
		color: var(--color-primary);
	}

	.guarantee-card__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
	}

	.warranty-details {
		padding: var(--space-4xl) 0;
		background-color: var(--color-surface);
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-2xl);
		max-width: 1000px;
		margin: 0 auto;
	}

	.detail-card {
		background-color: var(--color-background);
		border-radius: var(--radius-xl);
		padding: var(--space-xl);
	}

	.detail-card__title {
		font-size: var(--font-size-h4);
		margin-bottom: var(--space-lg);
		color: var(--color-primary);
	}

	.detail-card__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.detail-card__list li {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
		padding-left: var(--space-lg);
		position: relative;
	}

	.detail-card__list li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: bold;
	}

	.return-process {
		padding: var(--space-4xl) 0;
	}

	.process-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-2xl);
	}

	.process-step {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
	}

	.process-step__number {
		width: 64px;
		height: 64px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-h2);
		font-weight: 600;
	}

	.process-step__title {
		font-size: var(--font-size-h4);
	}

	.process-step__description {
		font-size: var(--font-size-body-sm);
		line-height: var(--line-height-relaxed);
		max-width: 280px;
	}

	@media (max-width: 768px) {
		.details-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
