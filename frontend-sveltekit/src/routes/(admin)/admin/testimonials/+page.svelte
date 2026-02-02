<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import DragDropList from '$lib/components/admin/DragDropList.svelte';

	let { data }: { data: PageData } = $props();
	let reorderMode = $state(false);

	function submitReorder(ids: number[]) {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/reorder';
		form.style.display = 'none';
		const input = document.createElement('input');
		input.type = 'hidden';
		input.name = 'ids';
		input.value = JSON.stringify(ids);
		form.appendChild(input);
		document.body.appendChild(form);
		form.submit();
	}

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'name', label: 'Name' },
		{ key: 'position', label: 'Position' },
		{ key: 'choice', label: 'Watch Choice' },
		{ key: 'display_order', label: 'Order', width: '70px' },
		{ key: 'is_active', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.testimonials.map((t) => ({
			...t,
			position: t.position || '—',
			choice: t.choice || '—',
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${t.is_active ? '#22c55e' : '#ef4444'}">${t.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Testimonials - Moditime Admin</title>
</svelte:head>

<PageHeader title="Testimonials" description="Manage client testimonials">
	{#snippet actions()}
		<ActionButton variant={reorderMode ? 'primary' : 'ghost'} onclick={() => reorderMode = !reorderMode}>
			{reorderMode ? 'Exit Reorder' : 'Reorder'}
		</ActionButton>
		{#if !reorderMode}
			<ActionButton href="/admin/testimonials/new" variant="primary">+ Add Testimonial</ActionButton>
		{/if}
	{/snippet}
</PageHeader>

{#if reorderMode}
	<div class="card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem;">
		<h3 style="font-size: 1rem; font-weight: 600; color: #1f2937; margin: 0 0 1rem;">Drag to reorder testimonials</h3>
		<DragDropList
			items={data.testimonials.map(t => ({ id: t.id, label: t.name }))}
			onreorder={submitReorder}
		/>
	</div>
{:else}
<DataTable {columns} data={tableData} emptyMessage="No testimonials found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/testimonials/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form method="POST" action="?/delete" use:enhance={({ cancel }) => {
				if (!confirm('Are you sure you want to delete this testimonial?')) {
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
{/if}

<style>
	.action-buttons {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
</style>
