<script lang="ts">
	interface Props {
		itemId: number;
		onMoveUp: (id: number) => void;
		onMoveDown: (id: number) => void;
		isFirst?: boolean;
		isLast?: boolean;
	}

	let { itemId, onMoveUp, onMoveDown, isFirst = false, isLast = false }: Props = $props();
</script>

<div class="reorder-buttons">
	<button
		type="button"
		class="reorder-btn"
		disabled={isFirst}
		onclick={() => onMoveUp(itemId)}
		aria-label="Move up"
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="18 15 12 9 6 15"></polyline>
		</svg>
	</button>
	<button
		type="button"
		class="reorder-btn"
		disabled={isLast}
		onclick={() => onMoveDown(itemId)}
		aria-label="Move down"
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
			<polyline points="6 9 12 15 18 9"></polyline>
		</svg>
	</button>
</div>

<style>
	.reorder-buttons {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.reorder-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 20px;
		padding: 0;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		background: #f9fafb;
		color: #6b7280;
		cursor: pointer;
		transition: all 0.15s;
	}

	.reorder-btn:hover:not(:disabled) {
		background: #e5e7eb;
		color: #374151;
		border-color: #9ca3af;
	}

	.reorder-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
