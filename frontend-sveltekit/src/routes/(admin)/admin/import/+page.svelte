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

	const exportUrls: { label: string; url: string; icon: string }[] = [
		{ label: 'Products', url: '/admin/export/products', icon: '⌚' },
		{ label: 'Brands', url: '/admin/export/brands', icon: '🏷️' },
		{ label: 'Categories', url: '/admin/export/categories', icon: '📁' },
		{ label: 'Cities', url: '/admin/export/cities', icon: '🏙️' },
		{ label: 'Filters', url: '/admin/export/filters', icon: '🔍' },
		{ label: 'City Articles', url: '/admin/export/city_articles', icon: '📰' }
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
		{#if selectedType === 'products'}
			<a href="/admin/import/templates/supplier" download class="template-btn template-btn-supplier">
				Supplier Template
			</a>
		{/if}
	{/snippet}
</PageHeader>

<!-- Export Data — prominent block at top -->
<div class="card export-card">
	<h3>Export Data</h3>
	<p class="export-desc">Download current data as CSV files</p>
	<div class="export-grid">
		{#each exportUrls as exp}
			<a href={exp.url} download class="export-btn">
				<span class="export-btn-icon">{exp.icon}</span>
				<span class="export-btn-label">{exp.label}</span>
			</a>
		{/each}
	</div>
</div>

<!-- Instructions — collapsed by default -->
<details class="card guide-card">
	<summary class="guide-summary">Как пользоваться импортом</summary>
	<div class="guide-content">
		<div class="guide-steps">
			<div class="guide-step">
				<span class="step-num">1</span>
				<div>
					<strong>Подготовьте CSV-файл</strong>
					<p>Два способа:</p>
					<ul>
						<li><b>Экспорт + редактирование</b> — скачайте текущие данные (кнопки Export выше), отредактируйте в Excel/Google Sheets, добавьте новые строки</li>
						<li><b>Шаблон</b> — скачайте пустой шаблон (кнопка "Download Template" вверху), заполните по образцу</li>
						<li><b>CSV от поставщика</b> — загрузите файл как есть, система автоматически определит формат и сконвертирует данные</li>
					</ul>
				</div>
			</div>
			<div class="guide-step">
				<span class="step-num">2</span>
				<div>
					<strong>Загрузите и проверьте</strong>
					<p>Выберите тип данных, загрузите файл, нажмите Preview. Проверьте таблицу — всё ли на месте.</p>
				</div>
			</div>
			<div class="guide-step">
				<span class="step-num">3</span>
				<div>
					<strong>Импортируйте</strong>
					<p>Выберите файл повторно и нажмите Import. Существующие записи обновятся (по SKU или slug), новые — добавятся.</p>
				</div>
			</div>
		</div>
		<details class="guide-details">
			<summary>Подробнее о форматах и правилах</summary>
			<div class="guide-details-content">
				<p><b>Products:</b> цена в рублях (без копеек). Изображения — URL через | (пайп). Характеристики — JSON в поле specs_json. Пустые поля изображений = не трогать существующие.</p>
				<p><b>Brands/Categories:</b> обязательны slug и name. При импорте товаров бренд и категория должны уже существовать (или включите "Cascade import").</p>
				<p><b>CSV поставщика:</b> если CSV содержит колонки "Имя", "Бренд", "Пол" — система автоматически сконвертирует данные в наш формат, создаст бренды и категории.</p>
				<p><b>ZIP с изображениями:</b> загрузите отдельный ZIP с фото (для Products). Имена файлов = числовой ID или артикул из CSV. Суффиксы _2, _3 для дополнительных фото. Изображения конвертируются в WebP автоматически.</p>
				<p><b>Кодировка:</b> UTF-8. При сохранении из Excel выбирайте "CSV UTF-8".</p>
			</div>
		</details>
	</div>
</details>

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success && form?.result}
	<div class="alert success">
		<strong>Import Complete!</strong>
		Added: {form.result.added} | Updated: {form.result.updated}
		{#if form.imagesProcessed}
			| Images: {form.imagesProcessed} processed{#if form.imagesMatched}, {form.imagesMatched} matched{/if}
		{/if}
		{#if form.result.errors.length > 0}
			| Errors: {form.result.errors.length}
		{/if}
		{#if form.detectedFormat === 'supplier'}
			<span class="format-badge format-supplier">Supplier format (auto-converted)</span>
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
	<h3>2. Upload Files</h3>
	<form method="POST" action="?/preview" enctype="multipart/form-data" use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}>
		<input type="hidden" name="data_type" value={selectedType} />
		<div class="upload-fields">
			<div class="upload-field">
				<label class="upload-label">CSV File <span class="required-mark">*</span></label>
				<input
					type="file"
					name="csv_file"
					accept=".csv"
					required
					bind:this={fileInput}
					class="file-input"
				/>
				<p class="upload-hint">CSV файл (наш формат или от поставщика). UTF-8.</p>
			</div>
			{#if selectedType === 'products'}
				<div class="upload-field">
					<label class="upload-label">ZIP with Images <span class="optional-mark">(optional)</span></label>
					<input
						type="file"
						name="images_zip"
						accept=".zip"
						class="file-input"
					/>
					<p class="upload-hint">Архив с фото товаров. Связь по ID/артикулу из CSV.</p>
				</div>
			{/if}
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
		<div class="preview-header">
			<h3>3. Preview ({form.totalRows} rows in {form.fileName})</h3>
			{#if form.detectedFormat === 'supplier'}
				<span class="format-badge format-supplier">Supplier format (auto-converted)</span>
			{:else if form.detectedFormat === 'native'}
				<span class="format-badge format-native">Standard format</span>
			{:else if form.detectedFormat === 'unknown'}
				<span class="format-badge format-unknown">Unknown format</span>
			{/if}
			{#if form.zipImageCount}
				<span class="format-badge format-images">{form.zipImageCount} images in ZIP</span>
			{/if}
		</div>

		{#if form.conversionInfo}
			<div class="conversion-info">
				<p class="conversion-title">Auto-conversion applied:</p>
				<ul class="conversion-list">
					{#if form.conversionInfo.newBrands.length > 0}
						<li>Brands: {form.conversionInfo.newBrands.join(', ')}</li>
					{/if}
					{#if form.conversionInfo.newCategories.length > 0}
						<li>Categories: {form.conversionInfo.newCategories.join(', ')}</li>
					{/if}
					{#if form.conversionInfo.specsCollected}
						<li>Specs collected from individual columns into specs_json</li>
					{/if}
				</ul>
			</div>
		{/if}

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
			<div class="upload-fields">
				<div class="upload-field">
					<label class="upload-label">CSV File <span class="required-mark">*</span></label>
					<input
						type="file"
						name="csv_file"
						accept=".csv"
						required
						class="file-input"
					/>
				</div>
				{#if form.dataType === 'products'}
					<div class="upload-field">
						<label class="upload-label">ZIP with Images <span class="optional-mark">(optional)</span></label>
						<input
							type="file"
							name="images_zip"
							accept=".zip"
							class="file-input"
						/>
					</div>
				{/if}
			</div>
			<p class="import-note">Re-select the same files to proceed with import.</p>
			{#if form.dataType === 'products' && form.detectedFormat !== 'supplier'}
				<label class="cascade-option">
					<input type="checkbox" name="cascade" value="1" />
					<span>Cascade import: auto-create missing brands and categories</span>
				</label>
			{/if}
			{#if form.detectedFormat === 'supplier'}
				<p class="cascade-auto-note">Cascade import enabled automatically for supplier format.</p>
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

	/* Export card — prominent */
	.export-card {
		background: #f0fdf4;
		border: 1px solid #86efac;
	}

	.export-card h3 {
		color: #15803d;
	}

	.export-desc {
		font-size: 0.8125rem;
		color: #6b7280;
		margin: 0 0 0.75rem;
	}

	.export-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.export-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: white;
		border: 1px solid #86efac;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #15803d;
		text-decoration: none;
		transition: all 0.2s;
		font-weight: 500;
	}

	.export-btn:hover {
		background: #dcfce7;
		border-color: #22c55e;
	}

	.export-btn-icon {
		font-size: 1.125rem;
	}

	.export-btn-label {
		flex: 1;
	}

	/* Guide card — collapsed by default */
	.guide-card {
		background: #f0f9ff;
		border: 1px solid #bae6fd;
		cursor: default;
	}

	.guide-summary {
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		color: #0369a1;
		padding: 0;
		list-style: none;
	}

	.guide-summary::-webkit-details-marker {
		display: none;
	}

	.guide-summary::before {
		content: '▶ ';
		font-size: 0.75rem;
	}

	.guide-card[open] > .guide-summary::before {
		content: '▼ ';
	}

	.guide-summary:hover {
		color: #0284c7;
	}

	.guide-content {
		margin-top: 1rem;
	}

	.guide-steps {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.guide-step {
		display: flex;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.step-num {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		min-width: 1.75rem;
		background: #0284c7;
		color: white;
		border-radius: 50%;
		font-size: 0.8125rem;
		font-weight: 700;
		margin-top: 0.125rem;
	}

	.guide-step p {
		margin: 0.25rem 0;
		font-size: 0.8125rem;
		color: #4b5563;
	}

	.guide-step ul {
		margin: 0.25rem 0 0;
		padding-left: 1.25rem;
		font-size: 0.8125rem;
		color: #4b5563;
	}

	.guide-step li {
		margin-bottom: 0.25rem;
	}

	.guide-step strong {
		color: #1f2937;
		font-size: 0.875rem;
	}

	.guide-details {
		margin-top: 1rem;
		border-top: 1px solid #bae6fd;
		padding-top: 0.75rem;
	}

	.guide-details summary {
		cursor: pointer;
		font-size: 0.8125rem;
		font-weight: 600;
		color: #0369a1;
	}

	.guide-details summary:hover {
		color: #0284c7;
	}

	.guide-details-content {
		margin-top: 0.75rem;
	}

	.guide-details-content p {
		font-size: 0.8125rem;
		color: #4b5563;
		margin: 0.5rem 0;
		line-height: 1.5;
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

	.upload-fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	@media (max-width: 640px) {
		.upload-fields {
			grid-template-columns: 1fr;
		}
	}

	.upload-field {
		display: flex;
		flex-direction: column;
	}

	.upload-label {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.375rem;
	}

	.required-mark {
		color: #ef4444;
	}

	.optional-mark {
		font-weight: 400;
		color: #9ca3af;
	}

	.format-images {
		background: #faf5ff;
		color: #7c3aed;
		border: 1px solid #c4b5fd;
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

	/* Preview header with format badge */
	.preview-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.preview-header h3 {
		margin: 0;
	}

	.format-badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.format-native {
		background: #dcfce7;
		color: #15803d;
		border: 1px solid #86efac;
	}

	.format-supplier {
		background: #dbeafe;
		color: #1d4ed8;
		border: 1px solid #93c5fd;
	}

	.format-unknown {
		background: #fef3c7;
		color: #92400e;
		border: 1px solid #fcd34d;
	}

	/* Conversion info block */
	.conversion-info {
		background: #eff6ff;
		border: 1px solid #bfdbfe;
		border-radius: 8px;
		padding: 0.75rem 1rem;
		margin-bottom: 1rem;
	}

	.conversion-title {
		font-size: 0.8125rem;
		font-weight: 600;
		color: #1d4ed8;
		margin: 0 0 0.375rem;
	}

	.conversion-list {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.8125rem;
		color: #374151;
	}

	.conversion-list li {
		margin-bottom: 0.25rem;
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

	.cascade-auto-note {
		font-size: 0.8125rem;
		color: #1d4ed8;
		margin: 0.5rem 0;
		font-style: italic;
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

	.template-btn-supplier {
		background: #eff6ff;
		border-color: #93c5fd;
		color: #1d4ed8;
	}

	.template-btn-supplier:hover {
		background: #dbeafe;
		border-color: #3b82f6;
	}
</style>
