<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import StatusBadge from '$lib/components/admin/StatusBadge.svelte';

	let { data }: { data: PageData } = $props();

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'country', label: 'Country' },
		{ key: 'founded_year', label: 'Founded' },
		{ key: 'is_active', label: 'Status', width: '100px' },
		{ key: 'position', label: 'Position', width: '80px' }
	];

	// Transform data for table display
	const tableData = $derived(
		data.brands.map((brand) => ({
			...brand,
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${brand.is_active ? '#22c55e' : '#ef4444'}">${brand.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Brands - Moditime Admin</title>
</svelte:head>

<PageHeader title="Brands" description="Manage watch brands">
	{#snippet actions()}
		<ActionButton href="/admin/brands/new" variant="primary">+ Add Brand</ActionButton>
	{/snippet}
</PageHeader>

<DataTable columns={columns} data={tableData} emptyMessage="No brands found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/brands/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						if (confirm('Are you sure you want to delete this brand?')) {
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
