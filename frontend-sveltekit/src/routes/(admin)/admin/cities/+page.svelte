<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();
	let searchValue = $state(data.search || '');

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'name', label: 'Name' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'region', label: 'Region' },
		{ key: 'delivery_days', label: 'Delivery', width: '90px' },
		{ key: 'delivery_price', label: 'Price', width: '110px' },
		{ key: 'article_count', label: 'Articles', width: '80px' },
		{ key: 'is_active', label: 'Status', width: '100px' },
		{ key: 'priority', label: 'Prio', width: '60px' }
	];

	const tableData = $derived(
		data.cities.map((c) => ({
			...c,
			region: c.region || '—',
			delivery_days: `${c.delivery_days} д.`,
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${c.is_active ? '#22c55e' : '#ef4444'}">${c.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);

	function handleSearch(e: Event) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (searchValue.trim()) params.set('search', searchValue.trim());
		goto(`/admin/cities${params.toString() ? '?' + params.toString() : ''}`);
	}
</script>

<svelte:head>
	<title>Cities - Moditime Admin</title>
</svelte:head>

<PageHeader title="Cities" description="Manage delivery cities and pSEO pages">
	{#snippet actions()}
		<ActionButton href="/admin/cities/new" variant="primary">+ Add City</ActionButton>
	{/snippet}
</PageHeader>

<div class="search-bar">
	<form onsubmit={handleSearch}>
		<input
			type="text"
			placeholder="Search by name or region..."
			bind:value={searchValue}
			class="search-input"
		/>
		<ActionButton type="submit" variant="secondary" size="sm">Search</ActionButton>
		{#if data.search}
			<ActionButton href="/admin/cities" variant="ghost" size="sm">Clear</ActionButton>
		{/if}
	</form>
</div>

<DataTable {columns} data={tableData} emptyMessage="No cities found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/cities/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form method="POST" action="?/delete" use:enhance={() => {
				return async ({ update }) => {
					if (confirm('Are you sure you want to delete this city?')) {
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
	.search-bar {
		margin-bottom: 1rem;
	}

	.search-bar form {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.search-input {
		flex: 1;
		max-width: 400px;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		outline: none;
		transition: border-color 0.15s;
	}

	.search-input:focus {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.action-buttons {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
</style>
