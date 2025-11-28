<script lang="ts">
	import type { ProductSpecGroup } from '$lib/types/product';

	let { groups }: { groups: ProductSpecGroup[] } = $props();
</script>

<!-- ============================================================ -->
<!-- COMPONENT: ProductSpecs                                      -->
<!-- Purpose: 4 spec cards (case, movement, package, service)     -->
<!-- ============================================================ -->
<section class="product-specs" id="specs">
	<div class="container">
		<div class="section-intro">
			<span class="section-eyebrow">Характеристики</span>
			<h2 class="section-title">Технические параметры</h2>
		</div>
		<div class="product-specs__grid">
			{#each groups as group (group.title)}
				<div class="spec-card">
					<h3>{group.title}</h3>
					{#if group.specs.length > 0 && typeof group.specs[0] === 'object' && 'label' in group.specs[0]}
						<dl>
							{#each group.specs as spec}
								<div>
									<dt>{spec.label}</dt>
									<dd>{spec.value}</dd>
								</div>
							{/each}
						</dl>
					{:else}
						<ul>
							{#each group.specs as item}
								<li>{typeof item === 'string' ? item : item.value}</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Specs */
	.product-specs {
		padding: var(--space-4xl) 0;
	}

	.product-specs__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-lg);
		margin-top: var(--space-2xl);
	}

	.spec-card {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
	}

	.spec-card h3 {
		font-size: var(--font-size-h5);
		color: var(--color-text);
		margin-bottom: var(--space-lg);
	}

	.spec-card dl {
		margin: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.spec-card div {
		display: flex;
		justify-content: space-between;
		gap: var(--space-md);
		font-size: var(--font-size-body-sm);
		padding: var(--space-xs) 0;
	}

	.spec-card dt {
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.spec-card dd {
		color: var(--color-text);
		font-weight: 600;
		text-align: right;
		margin: 0;
	}

	.spec-card ul {
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
		color: var(--color-text-soft);
		list-style: none;
	}

	.spec-card ul li {
		padding-left: var(--space-md);
		position: relative;
		font-size: var(--font-size-body-sm);
		line-height: 1.5;
	}

	.spec-card ul li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: bold;
	}

	@media (max-width: 768px) {
		.product-specs__grid {
			grid-template-columns: 1fr;
		}

		.spec-card div {
			flex-direction: column;
			gap: var(--space-xs);
		}

		.spec-card dd {
			text-align: left;
		}
	}
</style>
