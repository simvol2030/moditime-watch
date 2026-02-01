<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'title', label: 'Title' },
		{ key: 'category', label: 'Category' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'product_count', label: 'Products', width: '90px' },
		{ key: 'is_active', label: 'Status', width: '100px' },
		{ key: 'position', label: 'Pos', width: '60px' }
	];

	const tableData = $derived(
		data.collections.map((c) => ({
			...c,
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${c.is_active ? '#22c55e' : '#ef4444'}">${c.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Collections - Moditime Admin</title>
</svelte:head>

<PageHeader title="Collections" description="Manage curated collections">
	{#snippet actions()}
		<ActionButton href="/admin/collections/new" variant="primary">+ Add Collection</ActionButton>
	{/snippet}
</PageHeader>

<DataTable {columns} data={tableData} emptyMessage="No collections found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/collections/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						if (confirm('Are you sure you want to delete this collection?')) {
							await update();
						}
					};
				}}
			>
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
	}

	.action-buttons form {
		margin: 0;
	}
</style>
