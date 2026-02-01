<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isImporting = $state(false);
	let isExporting = $state(false);
	let csvData = $state('');

	$effect(() => {
		if (form?.csv) {
			csvData = form.csv;
		}
	});

	function downloadCsv() {
		if (!csvData) return;
		const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'articles-export.csv';
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head><title>Import / Export - pSEO Admin</title></svelte:head>

<PageHeader title="Import / Export" description="Import articles from Markdown or export to CSV">
	{#snippet actions()}
		<ActionButton href="/admin/pseo" variant="secondary">Back to Dashboard</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}<div class="alert error">{form.error}</div>{/if}
{#if form?.success}<div class="alert success">{form.message}</div>{/if}

<!-- Import Markdown -->
<div class="card">
	<div class="card-header">
		<h3>Import Markdown</h3>
		<p class="card-description">Upload a Markdown file with YAML frontmatter to create a new article</p>
	</div>

	<form
		method="POST"
		action="?/importMarkdown"
		enctype="multipart/form-data"
		use:enhance={() => {
			isImporting = true;
			return async ({ update }) => { isImporting = false; await update(); };
		}}
	>
		<div class="form-grid">
			<div class="form-group">
				<label for="import-city">City</label>
				<select id="import-city" name="city_id" required>
					<option value="">Select city...</option>
					{#each data.cities as city}
						<option value={city.id}>{city.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="import-file">Markdown File</label>
				<input type="file" id="import-file" name="file" accept=".md,.markdown,.txt" required />
			</div>
		</div>

		<div class="form-actions">
			<ActionButton type="submit" variant="primary" disabled={isImporting}>
				{isImporting ? 'Importing...' : 'Import Article'}
			</ActionButton>
		</div>
	</form>

	<div class="format-help">
		<h4>Markdown Format</h4>
		<pre><code>---
title: Article Title
slug: article-slug
category: pokupka-chasov
tags: rolex, luxury, swiss
meta_title: SEO Title
meta_description: SEO description
excerpt: Short description
image: https://example.com/image.jpg
template: standard
read_time: 5
published: true
---
## Article content here

Paragraph text with **bold** and *italic*.

### Subheading

More content...</code></pre>
	</div>
</div>

<!-- Export CSV -->
<div class="card">
	<div class="card-header">
		<h3>Export CSV</h3>
		<p class="card-description">Export all articles for a city as CSV</p>
	</div>

	<form
		method="POST"
		action="?/exportCsv"
		use:enhance={() => {
			isExporting = true;
			return async ({ update }) => { isExporting = false; await update(); };
		}}
	>
		<div class="form-grid">
			<div class="form-group">
				<label for="export-city">City</label>
				<select id="export-city" name="city_id" required>
					<option value="">Select city...</option>
					{#each data.cities as city}
						<option value={city.id}>{city.name}</option>
					{/each}
				</select>
			</div>
		</div>

		<div class="form-actions">
			<ActionButton type="submit" variant="primary" disabled={isExporting}>
				{isExporting ? 'Exporting...' : 'Export CSV'}
			</ActionButton>
			{#if csvData}
				<ActionButton type="button" variant="secondary" onclick={downloadCsv}>
					Download CSV
				</ActionButton>
			{/if}
		</div>
	</form>
</div>

<style>
	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card-header {
		margin-bottom: 1.5rem;
	}

	.card-header h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 0.25rem 0;
	}

	.card-description {
		color: #6b7280;
		font-size: 0.875rem;
		margin: 0;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
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

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group label {
		font-size: 0.8125rem;
		font-weight: 500;
		color: #374151;
	}

	.form-group select,
	.form-group input[type='file'] {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form-group select:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.form-actions {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.format-help {
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.format-help h4 {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		margin: 0 0 0.75rem 0;
	}

	.format-help pre {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		font-size: 0.8125rem;
		line-height: 1.5;
	}

	.format-help code {
		color: #374151;
	}
</style>
