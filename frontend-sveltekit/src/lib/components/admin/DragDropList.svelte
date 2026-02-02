<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';

	let {
		items = [],
		onreorder
	}: {
		items: { id: number; [key: string]: any }[];
		onreorder: (orderedIds: number[]) => void;
	} = $props();

	let localItems = $state<{ id: number; [key: string]: any }[]>([]);

	// Sync items to localItems
	$effect(() => {
		localItems = [...items];
	});

	function handleDndConsider(e: CustomEvent) {
		localItems = e.detail.items;
	}

	function handleDndFinalize(e: CustomEvent) {
		localItems = e.detail.items;
		// Emit ordered IDs to parent
		onreorder(localItems.map((item) => item.id));
	}
</script>

<div
	class="dnd-list"
	use:dndzone={{ items: localItems, flipDurationMs: 200 }}
	onconsider={handleDndConsider}
	onfinalize={handleDndFinalize}
>
	{#each localItems as item (item.id)}
		<div class="dnd-item" aria-roledescription="sortable">
			<div class="dnd-handle">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<line x1="8" y1="6" x2="16" y2="6" />
					<line x1="8" y1="12" x2="16" y2="12" />
					<line x1="8" y1="18" x2="16" y2="18" />
				</svg>
			</div>
			<div class="dnd-content">
				<span class="dnd-label">{item.label || item.title || item.name || `#${item.id}`}</span>
				{#if item.href}
					<span class="dnd-meta">{item.href}</span>
				{/if}
				{#if item.slug}
					<span class="dnd-meta">{item.slug}</span>
				{/if}
			</div>
			<span class="dnd-position">#{localItems.indexOf(item) + 1}</span>
		</div>
	{/each}
</div>

<style>
	.dnd-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-height: 40px;
	}

	.dnd-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.625rem 0.75rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		cursor: grab;
		transition: box-shadow 0.15s ease, border-color 0.15s ease;
		user-select: none;
	}

	.dnd-item:active {
		cursor: grabbing;
	}

	.dnd-item:hover {
		border-color: #3b82f6;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
	}

	.dnd-handle {
		color: #9ca3af;
		flex-shrink: 0;
		display: flex;
		align-items: center;
	}

	.dnd-content {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 0;
	}

	.dnd-label {
		font-weight: 500;
		font-size: 0.875rem;
		color: #1f2937;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dnd-meta {
		font-size: 0.75rem;
		color: #9ca3af;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dnd-position {
		font-size: 0.6875rem;
		color: #9ca3af;
		font-weight: 500;
		flex-shrink: 0;
	}

	/* DnD library classes */
	:global(.dnd-item[aria-grabbed='true']) {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		border-color: #3b82f6;
		z-index: 10;
	}
</style>
