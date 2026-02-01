<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();

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
		<ActionButton href="/admin/testimonials/new" variant="primary">+ Add Testimonial</ActionButton>
	{/snippet}
</PageHeader>

<DataTable {columns} data={tableData} emptyMessage="No testimonials found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/testimonials/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form method="POST" action="?/delete" use:enhance={() => {
				return async ({ update }) => {
					if (confirm('Are you sure you want to delete this testimonial?')) {
						await update();
					}
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
		gap: 0.25rem;
		align-items: center;
	}
</style>
