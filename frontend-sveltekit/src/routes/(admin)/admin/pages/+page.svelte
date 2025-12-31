<script lang="ts">
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'title', label: 'Title' },
		{ key: 'slug', label: 'Slug' },
		{ key: 'template', label: 'Template' },
		{ key: 'is_published', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.pages.map((page) => ({
			...page,
			template: page.template || '-',
			is_published: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${page.is_published ? '#22c55e' : '#ef4444'}">${page.is_published ? 'Published' : 'Draft'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Pages - Moditime Admin</title>
</svelte:head>

<PageHeader title="Pages" description="Manage static pages" />

<DataTable columns={columns} data={tableData} emptyMessage="No pages found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ActionButton href="/admin/pages/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<a href="/{item.slug}" target="_blank" class="view-link">View</a>
		</div>
	{/snippet}
</DataTable>

<style>
	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.view-link {
		font-size: 0.8125rem;
		color: #6b7280;
		text-decoration: none;
	}

	.view-link:hover {
		color: #3b82f6;
	}
</style>
