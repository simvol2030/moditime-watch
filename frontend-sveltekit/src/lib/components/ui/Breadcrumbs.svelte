<script lang="ts">
	import type { BreadcrumbItem } from '$lib/types/breadcrumbs';

	// Props
	let { items }: { items: BreadcrumbItem[] } = $props();
</script>

<nav class="product-breadcrumbs" aria-label="Хлебные крошки">
	<div class="container">
		<ol class="breadcrumbs-list">
			{#each items as item}
				<li>
					{#if item.href}
						<a href={item.href}>{item.label}</a>
					{:else}
						<span aria-current="page">{item.label}</span>
					{/if}
				</li>
			{/each}
		</ol>
	</div>
</nav>

<style>
	.product-breadcrumbs {
		padding: var(--space-lg) 0;
		border-bottom: 1px solid var(--color-border);
	}

	.breadcrumbs-list {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		flex-wrap: wrap;
		list-style: none;
		padding: 0;
		margin: 0;
		font-size: var(--font-size-body-sm);
	}

	.breadcrumbs-list li {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
	}

	.breadcrumbs-list li:not(:last-child)::after {
		content: '›';
		color: var(--color-text-muted);
		font-size: 16px;
		margin-left: var(--space-xs);
	}

	.breadcrumbs-list a {
		color: var(--color-text-soft);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.breadcrumbs-list a:hover {
		color: var(--color-primary);
	}

	.breadcrumbs-list span[aria-current='page'] {
		color: var(--color-text);
		font-weight: 500;
	}
</style>
