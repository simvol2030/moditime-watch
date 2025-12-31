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
		{ key: 'slug', label: 'Slug' },
		{ key: 'parent_name', label: 'Parent' },
		{ key: 'is_active', label: 'Status', width: '100px' },
		{ key: 'position', label: 'Position', width: '80px' }
	];

	const tableData = $derived(
		data.categories.map((cat) => ({
			...cat,
			parent_name: cat.parent_name || '-',
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${cat.is_active ? '#22c55e' : '#ef4444'}">${cat.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Categories - Moditime Admin</title>
</svelte:head>

<PageHeader title="Categories" description="Manage product categories">
	{#snippet actions()}
		<ActionButton href="/admin/categories/new" variant="primary">+ Add Category</ActionButton>
	{/snippet}
</PageHeader>

<DataTable columns={columns} data={tableData} emptyMessage="No categories found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/categories/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						if (confirm('Are you sure you want to delete this category?')) {
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
