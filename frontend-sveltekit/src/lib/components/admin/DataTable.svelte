<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Column {
		key: string;
		label: string;
		sortable?: boolean;
		width?: string;
	}

	interface Props {
		columns: Column[];
		data: Record<string, unknown>[];
		actions?: Snippet<[item: Record<string, unknown>]>;
		emptyMessage?: string;
	}

	let { columns, data, actions, emptyMessage = 'No data found' }: Props = $props();
</script>

<div class="table-container">
	{#if data.length > 0}
		<table>
			<thead>
				<tr>
					{#each columns as column}
						<th style={column.width ? `width: ${column.width}` : ''}>
							{column.label}
						</th>
					{/each}
					{#if actions}
						<th style="width: 120px">Actions</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#each data as item}
					<tr>
						{#each columns as column}
							<td>{@html item[column.key] ?? '-'}</td>
						{/each}
						{#if actions}
							<td class="actions-cell">
								{@render actions(item)}
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="empty-state">
			<p>{emptyMessage}</p>
		</div>
	{/if}
</div>

<style>
	.table-container {
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.875rem 1rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	th {
		background: #f9fafb;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
	}

	td {
		font-size: 0.875rem;
		color: #374151;
	}

	tbody tr:hover {
		background: #f9fafb;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	.actions-cell {
		white-space: nowrap;
	}

	.empty-state {
		padding: 3rem;
		text-align: center;
		color: #9ca3af;
	}
</style>
