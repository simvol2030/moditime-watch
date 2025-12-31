<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		actions?: Snippet;
	}

	let { title, description = '', actions }: Props = $props();
</script>

<div class="page-header">
	<div class="header-content">
		<h1>{title}</h1>
		{#if description}
			<p class="description">{description}</p>
		{/if}
	</div>
	{#if actions}
		<div class="header-actions">
			{@render actions()}
		</div>
	{/if}
</div>

<style>
	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.header-content h1 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
	}

	.description {
		color: #6b7280;
		margin: 0;
		font-size: 0.9375rem;
	}

	.header-actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
</style>
