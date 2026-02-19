<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);
	let selectedType = $state('products');
	let fileInput = $state<HTMLInputElement | null>(null);

	const dataTypes = [
		{ value: 'products', label: 'Products', icon: '⌚' },
		{ value: 'brands', label: 'Brands', icon: '🏷️' },
		{ value: 'categories', label: 'Categories', icon: '📁' },
		{ value: 'cities', label: 'Cities', icon: '🏙️' },
		{ value: 'city_articles', label: 'City Articles', icon: '📰' },
		{ value: 'filters', label: 'Filter Values', icon: '🔍' }
	];

	const templateUrls: Record<string, string> = {
		products: '/admin/import/templates/products',
		brands: '/admin/import/templates/brands',
		categories: '/admin/import/templates/categories',
		cities: '/admin/import/templates/cities',
		city_articles: '/admin/import/templates/city_articles',
		filters: '/admin/import/templates/filters'
	};

	const exportUrls: { label: string; url: string }[] = [
		{ label: 'Products', url: '/admin/export/products' },
		{ label: 'Brands', url: '/admin/export/brands' },
		{ label: 'Categories', url: '/admin/export/categories' },
		{ label: 'Cities', url: '/admin/export/cities' },
		{ label: 'Filters', url: '/admin/export/filters' },
		{ label: 'City Articles', url: '/admin/export/city_articles' }
	];
</script>

<svelte:head>
	<title>Import Data - Moditime Admin</title>
</svelte:head>

<PageHeader title="Import Data" description="Upload CSV files to import or update records">
	{#snippet actions()}
		<a href={templateUrls[selectedType]} download class="template-btn">
			Download {dataTypes.find(d => d.value === selectedType)?.label} Template
		</a>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success && form?.result}
	<div class="alert success">
		<strong>Import Complete!</strong>
		Added: {form.result.added} | Updated: {form.result.updated}
		{#if form.imagesProcessed}
			| Images: {form.imagesProcessed}
		{/if}
		{#if form.result.errors.length > 0}
			| Errors: {form.result.errors.length}
		{/if}
	</div>

	{#if form.imageErrors?.length}
		<div class="card errors-card">
			<h3>Image Processing Warnings ({form.imageErrors.length})</h3>
			<ul class="image-errors">
				{#each form.imageErrors as imgErr}
					<li>{imgErr}</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if form.result.errors.length > 0}
		<div class="card errors-card">
			<h3>Import Errors ({form.result.errors.length})</h3>
			<table class="errors-table">
				<thead>
					<tr>
						<th>Row</th>
						<th>Field</th>
						<th>Message</th>
					</tr>
				</thead>
				<tbody>
					{#each form.result.errors as err}
						<tr>
							<td>{err.row}</td>
							<td><code>{err.field}</code></td>
							<td>{err.message}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/if}

<div class="card">
	<h3>Export Data</h3>
	<p class="export-desc">Download current data as CSV files</p>
	<div class="export-grid">
		{#each exportUrls as exp}
			<a href={exp.url} download class="export-btn">{exp.label}</a>
		{/each}
	</div>
</div>

<div class="card">
	<h3>1. Select Data Type</h3>
	<div class="type-grid">
		{#each dataTypes as dt}
			<button
				type="button"
				class="type-card"
				class:active={selectedType === dt.value}
				onclick={() => selectedType = dt.value}
			>
				<span class="type-icon">{dt.icon}</span>
				<span class="type-label">{dt.label}</span>
			</button>
		{/each}
	</div>
</div>

<div class="card">
	<h3>2. Upload CSV File</h3>
	<form method="POST" action="?/preview" enctype="multipart/form-data" use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}>
		<input type="hidden" name="data_type" value={selectedType} />
		<div class="upload-area">
			<input
				type="file"
				name="file"
				accept=".csv,.zip"
				required
				bind:this={fileInput}
				class="file-input"
			/>
			<p class="upload-hint">CSV or ZIP file (with CSV + images), max 50MB. UTF-8 encoding.</p>
		</div>
		<div class="upload-actions">
			<ActionButton type="submit" variant="secondary" disabled={loading}>
				{loading ? 'Validating...' : 'Preview'}
			</ActionButton>
		</div>
	</form>
</div>

{#if form?.preview}
	<div class="card">
		<h3>3. Preview ({form.totalRows} rows in {form.fileName})</h3>
		<div class="preview-scroll">
			<table class="preview-table">
				<thead>
					<tr>
						{#each form.headers as header}
							<th>{header}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each form.rows as row}
						<tr>
							{#each form.headers as header}
								<td>{row[header] || ''}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if form.totalRows > 5}
			<p class="preview-note">Showing first 5 of {form.totalRows} rows</p>
		{/if}

		<form method="POST" action="?/import" enctype="multipart/form-data" use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}>
			<input type="hidden" name="data_type" value={form.dataType} />
			<input
				type="file"
				name="file"
				accept=".csv,.zip"
				required
				class="file-input"
			/>
			<p class="import-note">Please re-select the same file to proceed with import.</p>
			{#if form.dataType === 'products'}
				<label class="cascade-option">
					<input type="checkbox" name="cascade" value="1" />
					<span>Cascade import: auto-create missing brands and categories</span>
				</label>
			{/if}
			<div class="import-actions">
				<ActionButton type="submit" variant="primary" disabled={loading}>
					{loading ? 'Importing...' : `Import ${form.totalRows} rows`}
				</ActionButton>
			</div>
		</form>
	</div>
{/if}

<style>
	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.alert.error {
		background: #fee2e2;
		border: 1px solid #ef4444;
		color: #dc2626;
	}

	.alert.success {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
	}

	.type-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.type-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 10px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
	}

	.type-card:hover {
		border-color: #93c5fd;
		background: #f0f9ff;
	}

	.type-card.active {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.type-icon {
		font-size: 1.5rem;
	}

	.type-label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #374151;
	}

	.upload-area {
		margin-bottom: 1rem;
	}

	.file-input {
		display: block;
		width: 100%;
		padding: 0.75rem;
		border: 2px dashed #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.file-input:hover {
		border-color: #93c5fd;
	}

	.upload-hint {
		margin: 0.5rem 0 0;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.upload-actions {
		display: flex;
		justify-content: flex-end;
	}

	.preview-scroll {
		overflow-x: auto;
		margin-bottom: 1rem;
	}

	.preview-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.preview-table th,
	.preview-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
		white-space: nowrap;
		max-width: 250px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.preview-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
		background: #f9fafb;
	}

	.preview-note {
		font-size: 0.8125rem;
		color: #6b7280;
		text-align: center;
		margin: 0 0 1rem;
	}

	.import-note {
		font-size: 0.8125rem;
		color: #f59e0b;
		margin: 0.5rem 0;
	}

	.cascade-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0.75rem 0;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
	}

	.cascade-option input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
	}

	.import-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.errors-card h3 {
		color: #dc2626;
	}

	.image-errors {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.image-errors li {
		padding: 0.375rem 0;
		font-size: 0.8125rem;
		color: #b45309;
		border-bottom: 1px solid #fef3c7;
	}

	.image-errors li:last-child {
		border-bottom: none;
	}

	.errors-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.8125rem;
	}

	.errors-table th,
	.errors-table td {
		padding: 0.5rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	.errors-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		color: #6b7280;
		font-weight: 600;
	}

	.errors-table code {
		background: #fee2e2;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.75rem;
	}

	.export-desc {
		font-size: 0.8125rem;
		color: #6b7280;
		margin: 0 0 0.75rem;
	}

	.export-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.export-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.375rem 0.875rem;
		background: #f0fdf4;
		border: 1px solid #86efac;
		border-radius: 6px;
		font-size: 0.8125rem;
		color: #15803d;
		text-decoration: none;
		transition: all 0.2s;
	}

	.export-btn:hover {
		background: #dcfce7;
		border-color: #22c55e;
	}

	.template-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #374151;
		text-decoration: none;
		transition: all 0.2s;
	}

	.template-btn:hover {
		background: #f9fafb;
		border-color: #9ca3af;
	}
</style>
