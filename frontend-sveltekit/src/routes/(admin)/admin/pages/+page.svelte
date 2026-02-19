<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';

	let { data }: { data: PageData } = $props();

	let searchValue = $state(data.search);
	let filterValue = $state(data.filter);

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (filterValue !== 'all') params.set('type', filterValue);
		const qs = params.toString();
		goto(`/admin/pages${qs ? '?' + qs : ''}`, { invalidateAll: true });
	}

	function goToPage(page: number) {
		const params = new URLSearchParams();
		if (searchValue) params.set('q', searchValue);
		if (filterValue !== 'all') params.set('type', filterValue);
		if (page > 1) params.set('page', String(page));
		const qs = params.toString();
		goto(`/admin/pages${qs ? '?' + qs : ''}`, { invalidateAll: true });
	}

	function handleSearchKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') applyFilters();
	}
</script>

<svelte:head>
	<title>Управление страницами — Moditime Admin</title>
</svelte:head>

<PageHeader title="Управление страницами" description="Все страницы сайта: единичные и контентные" />

<!-- Search & Filter -->
<div class="filters">
	<div class="search-group">
		<input
			type="text"
			placeholder="Поиск по названию..."
			bind:value={searchValue}
			onkeydown={handleSearchKeydown}
			class="search-input"
		/>
		<button type="button" class="btn-search" onclick={applyFilters}>Найти</button>
	</div>
	<div class="filter-group">
		<select bind:value={filterValue} onchange={applyFilters}>
			<option value="all">Все типы</option>
			<option value="articles">Статьи</option>
			<option value="cities">Города (pSEO)</option>
		</select>
	</div>
</div>

<!-- Singleton Pages -->
<div class="section">
	<h2 class="section-title">Единичные страницы <span class="section-hint">(нельзя удалить)</span></h2>
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th>Страница</th>
					<th>Шаблон</th>
					<th>URL</th>
					<th>Статус</th>
					<th>Действия</th>
				</tr>
			</thead>
			<tbody>
				{#each data.singletonPages as p}
					<tr>
						<td class="td-name">{p.title}</td>
						<td><code>{p.template}</code></td>
						<td class="td-url">{p.slug}</td>
						<td>
							<span class="status-badge" class:published={p.isPublished}>
								{p.isPublished ? 'опубл.' : 'черн.'}
							</span>
						</td>
						<td>
							<a href={p.editUrl} class="btn-edit">Редактировать</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Content Pages -->
<div class="section">
	<h2 class="section-title">Контент-страницы <span class="section-count">({data.totalCount})</span></h2>
	{#if data.contentItems.length === 0}
		<div class="empty-state">
			{#if data.search}
				Ничего не найдено по запросу «{data.search}»
			{:else}
				Нет контент-страниц
			{/if}
		</div>
	{:else}
		<div class="table-wrap">
			<table>
				<thead>
					<tr>
						<th>Название</th>
						<th>Тип</th>
						<th>URL</th>
						<th>Статус</th>
						<th>Действия</th>
					</tr>
				</thead>
				<tbody>
					{#each data.contentItems as item}
						<tr>
							<td class="td-name">{item.title}</td>
							<td>
								<span class="type-badge" class:pseo={item.type === 'city_article'}>{item.typeLabel}</span>
							</td>
							<td class="td-url">{item.url}</td>
							<td>
								<span class="status-badge" class:published={item.isPublished}>
									{item.isPublished ? 'опубл.' : 'черн.'}
								</span>
							</td>
							<td>
								<a href={item.editUrl} class="btn-edit">Редактировать</a>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if data.totalPages > 1}
			<div class="pagination">
				<button
					type="button"
					class="page-btn"
					disabled={data.currentPage <= 1}
					onclick={() => goToPage(data.currentPage - 1)}
				>&larr; Назад</button>
				<span class="page-info">Стр. {data.currentPage} из {data.totalPages}</span>
				<button
					type="button"
					class="page-btn"
					disabled={data.currentPage >= data.totalPages}
					onclick={() => goToPage(data.currentPage + 1)}
				>Вперёд &rarr;</button>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Filters */
	.filters {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		flex-wrap: wrap;
	}

	.search-group {
		display: flex;
		gap: 0.5rem;
		flex: 1;
		min-width: 200px;
	}

	.search-input {
		flex: 1;
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9375rem;
	}

	.search-input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
	}

	.btn-search {
		padding: 0.625rem 1.25rem;
		background: #3b82f6;
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s;
	}

	.btn-search:hover {
		background: #2563eb;
	}

	.filter-group select {
		padding: 0.625rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9375rem;
		background: white;
		cursor: pointer;
	}

	/* Sections */
	.section {
		margin-bottom: 2rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #1f2937;
		margin: 0 0 1rem;
	}

	.section-hint {
		font-size: 0.8125rem;
		font-weight: 400;
		color: #9ca3af;
	}

	.section-count {
		font-size: 0.875rem;
		font-weight: 400;
		color: #6b7280;
	}

	/* Table */
	.table-wrap {
		background: white;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th {
		text-align: left;
		padding: 0.875rem 1.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		background: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
	}

	td {
		padding: 0.875rem 1.25rem;
		border-bottom: 1px solid #f3f4f6;
		font-size: 0.9375rem;
	}

	tr:last-child td {
		border-bottom: none;
	}

	tr:hover {
		background: #f9fafb;
	}

	.td-name {
		font-weight: 600;
		color: #1f2937;
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.td-url {
		color: #6b7280;
		font-size: 0.8125rem;
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	code {
		background: #f3f4f6;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	/* Badges */
	.status-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		background: #fee2e2;
		color: #dc2626;
	}

	.status-badge.published {
		background: #dcfce7;
		color: #16a34a;
	}

	.type-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		background: #eff6ff;
		color: #3b82f6;
	}

	.type-badge.pseo {
		background: #fef3c7;
		color: #d97706;
	}

	/* Actions */
	.btn-edit {
		color: #3b82f6;
		text-decoration: none;
		font-size: 0.8125rem;
		font-weight: 500;
	}

	.btn-edit:hover {
		text-decoration: underline;
	}

	/* Pagination */
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.page-btn {
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.page-btn:hover:not(:disabled) {
		background: #f3f4f6;
		border-color: #9ca3af;
	}

	.page-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-info {
		font-size: 0.875rem;
		color: #6b7280;
	}

	/* Empty state */
	.empty-state {
		background: white;
		border-radius: 12px;
		padding: 3rem;
		text-align: center;
		color: #9ca3af;
		font-style: italic;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
</style>
