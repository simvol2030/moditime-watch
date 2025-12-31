<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();

	function formatPrice(kopecks: number): string {
		return new Intl.NumberFormat('ru-RU', {
			style: 'currency',
			currency: 'RUB',
			minimumFractionDigits: 0
		}).format(kopecks / 100);
	}

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'name', label: 'Name' },
		{ key: 'brand_name', label: 'Brand' },
		{ key: 'category_name', label: 'Category' },
		{ key: 'price', label: 'Price', width: '120px' },
		{ key: 'is_active', label: 'Status', width: '100px' },
		{ key: 'is_featured', label: 'Featured', width: '100px' }
	];

	const tableData = $derived(
		data.products.map((product) => ({
			...product,
			category_name: product.category_name || '-',
			price: formatPrice(product.price),
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${product.is_active ? '#22c55e' : '#ef4444'}">${product.is_active ? 'Active' : 'Inactive'}</span>`,
			is_featured: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${product.is_featured ? '#3b82f6' : '#9ca3af'}">${product.is_featured ? 'Yes' : 'No'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Products - Moditime Admin</title>
</svelte:head>

<PageHeader title="Products" description="Manage products catalog">
	{#snippet actions()}
		<ActionButton href="/admin/products/new" variant="primary">+ Add Product</ActionButton>
	{/snippet}
</PageHeader>

<DataTable columns={columns} data={tableData} emptyMessage="No products found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/products/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form
				method="POST"
				action="?/delete"
				use:enhance={() => {
					return async ({ update }) => {
						if (confirm('Are you sure you want to delete this product?')) {
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
