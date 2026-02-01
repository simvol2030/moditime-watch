<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showSeo = $state(false);
	let citySearch = $state('');

	const filteredCities = $derived(
		citySearch
			? data.cities.filter((c: any) => c.name.toLowerCase().includes(citySearch.toLowerCase()))
			: data.cities
	);

	function selectCity(id: number) {
		goto(`/admin/pseo?city_id=${id}`);
	}
</script>

<svelte:head><title>pSEO Dashboard - Moditime Admin</title></svelte:head>

<PageHeader title="pSEO Dashboard" description="Manage city articles, categories, and SEO settings">
	{#snippet actions()}
		{#if data.cityId}
			<ActionButton href="/admin/pseo/articles/new?city_id={data.cityId}" variant="primary">+ New Article</ActionButton>
		{/if}
	{/snippet}
</PageHeader>

{#if form?.error}<div class="alert error">{form.error}</div>{/if}
{#if form?.success}<div class="alert success">{form.message}</div>{/if}

<!-- City Selector -->
<div class="card">
	<h3>Select City</h3>
	<div class="city-selector">
		<input type="text" placeholder="Search city..." bind:value={citySearch} class="search-input" />
		<div class="city-list">
			{#each filteredCities as city}
				<button
					class="city-item"
					class:active={data.cityId === city.id}
					onclick={() => selectCity(city.id)}
				>
					{city.name}
				</button>
			{/each}
		</div>
	</div>
</div>

{#if data.cityId && data.city}
	<!-- Stats -->
	<div class="stats-row">
		<div class="stat"><span class="stat-value">{data.stats.total}</span><span class="stat-label">Articles</span></div>
		<div class="stat"><span class="stat-value">{data.stats.published}</span><span class="stat-label">Published</span></div>
		<div class="stat"><span class="stat-value">{data.stats.draft}</span><span class="stat-label">Draft</span></div>
	</div>

	<!-- Filters -->
	<div class="card filters">
		<div class="filter-group">
			<label>Category:
				<select onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					const params = new URLSearchParams(window.location.search);
					if (val) params.set('category', val); else params.delete('category');
					goto(`/admin/pseo?${params.toString()}`);
				}}>
					<option value="">All</option>
					{#each data.categories as cat}
						<option value={cat.id} selected={String(cat.id) === data.categoryFilter}>{cat.name}</option>
					{/each}
				</select>
			</label>
			<label>Status:
				<select onchange={(e) => {
					const val = (e.target as HTMLSelectElement).value;
					const params = new URLSearchParams(window.location.search);
					if (val) params.set('status', val); else params.delete('status');
					goto(`/admin/pseo?${params.toString()}`);
				}}>
					<option value="" selected={!data.statusFilter}>All</option>
					<option value="published" selected={data.statusFilter === 'published'}>Published</option>
					<option value="draft" selected={data.statusFilter === 'draft'}>Draft</option>
				</select>
			</label>
		</div>
		<div class="filter-actions">
			<ActionButton variant="ghost" size="sm" onclick={() => { showSeo = !showSeo; }}>
				{showSeo ? 'Hide SEO Settings' : 'City SEO Settings'}
			</ActionButton>
		</div>
	</div>

	<!-- City SEO Settings (Task 5) -->
	{#if showSeo}
		<div class="card">
			<h3>SEO Settings for {data.city.name}</h3>
			<form method="POST" action="?/updateCitySeo" use:enhance>
				<input type="hidden" name="city_id" value={data.cityId} />
				<div class="form-row">
					<label>Hero Title <input type="text" name="hero_title" value={data.city.hero_title || ''} placeholder="Title for city hero section" /></label>
					<label>Hero Subtitle <input type="text" name="hero_subtitle" value={data.city.hero_subtitle || ''} placeholder="Subtitle" /></label>
				</div>
				<label>Hero Image URL <input type="text" name="hero_image_url" value={data.city.hero_image_url || ''} placeholder="https://..." /></label>
				<label>Meta Description <textarea name="meta_description" rows="3" placeholder="SEO description for city landing page">{data.city.meta_description || ''}</textarea></label>
				<ActionButton type="submit" variant="primary" size="sm">Save SEO Settings</ActionButton>
			</form>
		</div>
	{/if}

	<!-- Articles Table -->
	<div class="card">
		<table>
			<thead>
				<tr><th>Title</th><th>Category</th><th>Tags</th><th>Status</th><th>Views</th><th>Actions</th></tr>
			</thead>
			<tbody>
				{#each data.articles as article}
					<tr>
						<td>
							<strong>{article.title}</strong>
							<div class="slug"><code>{article.slug}</code></div>
						</td>
						<td>{article.category_name || '-'}</td>
						<td>
							{#if article.tags?.length}
								<div class="tags">{#each article.tags as tag}<span class="tag">{tag.name}</span>{/each}</div>
							{:else}
								<span class="muted">-</span>
							{/if}
						</td>
						<td>
							<span class="badge" class:published={article.is_published} class:draft={!article.is_published}>
								{article.is_published ? 'Published' : 'Draft'}
							</span>
						</td>
						<td>{article.views_count}</td>
						<td class="actions">
							<ActionButton href="/admin/pseo/articles/{article.id}" variant="ghost" size="sm">Edit</ActionButton>
							<form method="POST" action="?/deleteArticle" use:enhance>
								<input type="hidden" name="id" value={article.id} />
								<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
							</form>
						</td>
					</tr>
				{:else}
					<tr><td colspan="6" class="empty">No articles for this city</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<div class="card empty-state">
		<p>Select a city to view and manage its articles</p>
	</div>
{/if}

<style>
	.card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
	.card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; }
	.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
	.alert.error { background: #fee2e2; color: #dc2626; }
	.alert.success { background: #dcfce7; color: #16a34a; }

	.city-selector { display: flex; flex-direction: column; gap: 0.75rem; }
	.search-input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; }
	.search-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
	.city-list { display: flex; flex-wrap: wrap; gap: 0.5rem; max-height: 200px; overflow-y: auto; }
	.city-item { padding: 0.375rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; background: white; cursor: pointer; font-size: 0.8125rem; transition: all 0.15s; }
	.city-item:hover { background: #f3f4f6; border-color: #d1d5db; }
	.city-item.active { background: #1a1a2e; color: white; border-color: #1a1a2e; }

	.stats-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
	.stat { background: white; border-radius: 12px; padding: 1rem 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; text-align: center; }
	.stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #1a1a2e; }
	.stat-label { font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }

	.filters { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
	.filter-group { display: flex; gap: 1rem; }
	.filter-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #374151; font-weight: 500; }
	.filter-group select { padding: 0.375rem 0.5rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.8125rem; }

	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #e5e7eb; font-size: 0.75rem; color: #6b7280; text-transform: uppercase; }
	td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
	.slug { margin-top: 0.25rem; }
	code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
	.tags { display: flex; flex-wrap: wrap; gap: 0.25rem; }
	.tag { background: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; }
	.badge { padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 500; }
	.badge.published { background: #dcfce7; color: #16a34a; }
	.badge.draft { background: #fef3c7; color: #d97706; }
	.muted { color: #9ca3af; }
	.actions { display: flex; gap: 0.5rem; align-items: center; }
	.actions form { margin: 0; }
	.empty { text-align: center; color: #9ca3af; padding: 2rem !important; }
	.empty-state { text-align: center; color: #6b7280; padding: 3rem; }

	.form-row { display: flex; gap: 1rem; margin-bottom: 0.75rem; }
	.form-row label { flex: 1; }
	label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem; }
	input[type="text"], textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; }
	input:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
</style>
