<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();
	let selectedCategory = $state(data.categoryFilter || '');

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'title', label: 'Title' },
		{ key: 'category_name', label: 'Category', width: '130px' },
		{ key: 'author_name', label: 'Author', width: '150px' },
		{ key: 'read_time', label: 'Read', width: '60px' },
		{ key: 'views_count', label: 'Views', width: '70px' },
		{ key: 'is_featured', label: 'Featured', width: '90px' },
		{ key: 'is_published', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.articles.map((a) => ({
			...a,
			category_name: a.category_name || '—',
			author_name: a.author_name || '—',
			read_time: a.read_time ? `${a.read_time} min` : '—',
			is_featured: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${a.is_featured ? '#f59e0b' : '#d1d5db'}">${a.is_featured ? 'Yes' : 'No'}</span>`,
			is_published: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${a.is_published ? '#22c55e' : '#ef4444'}">${a.is_published ? 'Published' : 'Draft'}</span>`
		}))
	);

	function handleCategoryFilter() {
		const params = new URLSearchParams();
		if (selectedCategory) params.set('category', selectedCategory);
		goto(`/admin/articles${params.toString() ? '?' + params.toString() : ''}`);
	}
</script>

<svelte:head>
	<title>Journal Articles - Moditime Admin</title>
</svelte:head>

<PageHeader title="Journal Articles" description="Manage blog and editorial content">
	{#snippet actions()}
		<ActionButton href="/admin/articles/new" variant="primary">+ Add Article</ActionButton>
	{/snippet}
</PageHeader>

<div class="filter-bar">
	<select bind:value={selectedCategory} onchange={handleCategoryFilter} class="category-select">
		<option value="">All Categories</option>
		{#each data.categories as cat}
			<option value={String(cat.id)}>{cat.name}</option>
		{/each}
	</select>
</div>

<DataTable {columns} data={tableData} emptyMessage="No articles found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/articles/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
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

	.category-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		outline: none;
		background: white;
		min-width: 200px;
		transition: border-color 0.15s;
	}

	.category-select:focus {
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.action-buttons {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
</style>
