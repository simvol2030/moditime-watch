<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data }: { data: PageData } = $props();

	async function submitMove(id: number, direction: 'up' | 'down') {
		const formData = new FormData();
		formData.append('id', String(id));
		formData.append('direction', direction);

		await fetch('?/move', {
			method: 'POST',
			body: formData
		});

		await invalidateAll();
	}

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'order', label: 'Order', width: '70px' },
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'type', label: 'Type', width: '100px' },
		{ key: 'values_count', label: 'Values', width: '80px' },
		{ key: 'is_active', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.filters.map((f, idx) => ({
			...f,
			_idx: idx,
			_total: data.filters.length,
			order: `#${f.position}`,
			type: `<code style="background: #f3f4f6; padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.8125rem">${f.type}</code>`,
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${f.is_active ? '#22c55e' : '#ef4444'}">${f.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Filters - Moditime Admin</title>
</svelte:head>

<PageHeader title="Filters" description="Manage product filter attributes and values">
	{#snippet actions()}
		<ActionButton href="/admin/filters/new" variant="primary">+ Add Filter</ActionButton>
	{/snippet}
</PageHeader>

<DataTable {columns} data={tableData} emptyMessage="No filters found. Create one or import via CSV.">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ReorderButtons
				itemId={item.id}
				isFirst={item._idx === 0}
				isLast={item._idx === item._total - 1}
				onMoveUp={(id) => submitMove(id, 'up')}
				onMoveDown={(id) => submitMove(id, 'down')}
			/>
			<ActionButton href="/admin/filters/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form method="POST" action="?/delete" use:enhance={({ cancel }) => {
				if (!confirm('Delete this filter and all its values?')) {
					cancel();
					return;
				}
				return async ({ update }) => {
					await update();
				};
			}}>
				<input type="hidden" name="id" value={item.id} />
				<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
			</form>
		</div>
	{/snippet}
</DataTable>

<style>
	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.action-buttons form {
		margin: 0;
	}
</style>
