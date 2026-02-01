<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();
	let selectedCity = $state(data.cityFilter || '');

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'city_name', label: 'City' },
		{ key: 'title', label: 'Title' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'template_type', label: 'Template', width: '100px' },
		{ key: 'views_count', label: 'Views', width: '70px' },
		{ key: 'is_published', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.articles.map((a) => ({
			...a,
			is_published: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${a.is_published ? '#22c55e' : '#ef4444'}">${a.is_published ? 'Published' : 'Draft'}</span>`
		}))
	);

	function handleCityFilter() {
		const params = new URLSearchParams();
		if (selectedCity) params.set('city', selectedCity);
		goto(`/admin/city-articles${params.toString() ? '?' + params.toString() : ''}`);
	}
</script>

<svelte:head>
	<title>City Articles - Moditime Admin</title>
</svelte:head>

<PageHeader title="City Articles" description="Manage pSEO articles for cities">
	{#snippet actions()}
		<ActionButton href="/admin/city-articles/new" variant="primary">+ Add Article</ActionButton>
	{/snippet}
</PageHeader>

<div class="filter-bar">
	<select bind:value={selectedCity} onchange={handleCityFilter} class="city-select">
		<option value="">All Cities</option>
		{#each data.cities as city}
			<option value={String(city.id)}>{city.name}</option>
		{/each}
	</select>
</div>

<DataTable {columns} data={tableData} emptyMessage="No city articles found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/city-articles/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form method="POST" action="?/delete" use:enhance={({ cancel }) => {
				if (!confirm('Are you sure you want to delete this article?')) {
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
	.filter-bar {
		margin-bottom: 1rem;
	}

	.city-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		outline: none;
		background: white;
		min-width: 200px;
		transition: border-color 0.15s;
	}

	.city-select:focus {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.action-buttons {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
</style>
