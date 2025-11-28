<script lang="ts">
	import type { TabItem } from '$lib/types/product';

	let { tabs, defaultTab }: { tabs: TabItem[]; defaultTab?: string } = $props();

	// State for active tab
	let activeTab = $state(defaultTab || tabs[0]?.id || '');

	// Derived: Get active tab content
	let activeTabContent = $derived(tabs.find((tab) => tab.id === activeTab));
</script>

<!-- ============================================================ -->
<!-- COMPONENT: ProductTabs                                       -->
<!-- Purpose: 3 tabs (description, delivery, warranty)            -->
<!-- ============================================================ -->
<section class="product-tabs">
	<div class="container">
		<div class="product-tabs__grid">
			{#each tabs as tab (tab.id)}
				<article class="product-tab">
					<h3>{tab.label}</h3>
					<div class="product-tab__content">
						{@html tab.content}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	/* Tabs */
	.product-tabs {
		padding: var(--space-4xl) 0;
		background-color: var(--color-surface);
	}

	.product-tabs__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-xl);
	}

	.product-tab {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
	}

	.product-tab h3 {
		font-size: var(--font-size-h5);
		color: var(--color-text);
		margin: 0;
	}

	.product-tab__content {
		color: var(--color-text-soft);
		line-height: 1.6;
	}

	.product-tab__content :global(p) {
		margin: 0 0 var(--space-md) 0;
	}

	.product-tab__content :global(p:last-child) {
		margin-bottom: 0;
	}

	.product-tab__content :global(ul) {
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
		color: var(--color-text-soft);
		list-style: none;
	}

	.product-tab__content :global(ul li) {
		padding-left: var(--space-md);
		position: relative;
		font-size: var(--font-size-body-sm);
	}

	.product-tab__content :global(ul li::before) {
		content: '•';
		position: absolute;
		left: 0;
		color: var(--color-primary);
		font-weight: bold;
	}

	.product-tab__content :global(strong) {
		color: var(--color-text);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.product-tabs__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
