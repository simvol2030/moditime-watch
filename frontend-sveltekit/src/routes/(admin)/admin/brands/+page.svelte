<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data }: { data: PageData } = $props();

	function submitMove(id: number, direction: 'up' | 'down') {
		const form = document.createElement('form');
		form.method = 'POST';
		form.action = '?/move';
		form.style.display = 'none';

		const idInput = document.createElement('input');
		idInput.type = 'hidden';
		idInput.name = 'id';
		idInput.value = String(id);
		form.appendChild(idInput);

		const dirInput = document.createElement('input');
		dirInput.type = 'hidden';
		dirInput.name = 'direction';
		dirInput.value = direction;
		form.appendChild(dirInput);

		document.body.appendChild(form);
		form.submit();
	}

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'order', label: 'Order', width: '70px' },
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'country', label: 'Country' },
		{ key: 'founded_year', label: 'Founded' },
		{ key: 'is_active', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.brands.map((brand, idx) => ({
			...brand,
			_idx: idx,
			_total: data.brands.length,
			order: `#${brand.position}`,
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
			<ReorderButtons
				itemId={item.id}
				isFirst={item._idx === 0}
				isLast={item._idx === item._total - 1}
				onMoveUp={(id) => submitMove(id, 'up')}
				onMoveDown={(id) => submitMove(id, 'down')}
			/>
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
		align-items: center;
	}

	.action-buttons form {
		margin: 0;
	}
</style>
