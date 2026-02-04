<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ImageGalleryUpload from '$lib/components/admin/ImageGalleryUpload.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const galleryImages = $derived(
		data.images.map(img => ({
			id: img.id,
			url: img.url,
			alt: img.alt || '',
			isMain: img.is_main === 1
		}))
	);
	let loading = $state(false);

	const product = $derived(form?.data ?? {
		...data.product,
		price: data.product.price / 100 // Convert from kopecks to rubles for display
	});

	const brandOptions = $derived(
		data.brands.map((b) => ({ value: b.id, label: b.name }))
	);

	const categoryOptions = $derived(
		data.categories.map((c) => ({ value: c.id, label: c.name }))
	);

	const availabilityOptions = [
		{ value: 'in-stock', label: 'In Stock' },
		{ value: 'pre-order', label: 'Pre-order' },
		{ value: 'waitlist', label: 'Waitlist' },
		{ value: 'out-of-stock', label: 'Out of Stock' }
	];

	// Filter assignment state
	let selectedFilterIds = $state<Set<number>>(new Set(data.assignedFilterIds));
	let filterSaving = $state(false);
	let filterMessage = $state('');

	// Group filter values by attribute
	const filterGroups = $derived(
		data.filterAttributes.map(attr => ({
			...attr,
			values: data.filterValues.filter(v => v.attribute_id === attr.id)
		})).filter(g => g.values.length > 0)
	);

	function toggleFilter(valueId: number) {
		const next = new Set(selectedFilterIds);
		if (next.has(valueId)) {
			next.delete(valueId);
		} else {
			next.add(valueId);
		}
		selectedFilterIds = next;
	}

	async function saveFilters() {
		filterSaving = true;
		filterMessage = '';
		try {
			const body = new FormData();
			body.append('filter_value_ids', JSON.stringify([...selectedFilterIds]));
			const res = await fetch('?/updateFilters', { method: 'POST', body });
			if (res.ok) {
				await invalidateAll();
				filterMessage = 'Filters saved';
				setTimeout(() => { filterMessage = ''; }, 2000);
			} else {
				filterMessage = 'Failed to save filters';
			}
		} catch {
			filterMessage = 'Failed to save filters';
		}
		filterSaving = false;
	}
</script>

<svelte:head>
	<title>Edit {data.product.name} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit Product" description="Update product details">
	{#snippet actions()}
		<ActionButton href="/admin/products" variant="secondary">Cancel</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

<div class="form-card">
	<form
		method="POST"
		action="?/update"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}
	>
		<h3 class="section-title">Basic Information</h3>

		<div class="form-grid">
			<FormField
				label="Name"
				name="name"
				value={product.name}
				required
				placeholder="e.g. Rolex Submariner Date"
			/>

			<FormField
				label="Slug"
				name="slug"
				value={product.slug}
				required
				placeholder="e.g. rolex-submariner-date"
				hint="URL-friendly identifier"
			/>
		</div>

		<div class="form-grid">
			<FormSelect
				label="Brand"
				name="brand_id"
				options={brandOptions}
				value={product.brand_id}
				placeholder="Select brand"
				required
			/>

			<FormSelect
				label="Category"
				name="category_id"
				options={categoryOptions}
				value={product.category_id ?? ''}
				placeholder="Select category"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="SKU"
				name="sku"
				value={product.sku ?? ''}
				placeholder="e.g. RLX-126610LN"
			/>

			<FormField
				label="Price (RUB)"
				name="price"
				type="number"
				value={product.price}
				placeholder="e.g. 1320000"
				hint="Price in rubles (not kopecks)"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="Price Note"
				name="price_note"
				value={product.price_note ?? ''}
				placeholder="e.g. Price includes VAT"
			/>

			<FormSelect
				label="Availability"
				name="availability_status"
				options={availabilityOptions}
				value={product.availability_status}
			/>
		</div>

		<FormTextarea
			label="Description"
			name="description"
			value={product.description ?? ''}
			placeholder="Product description..."
			rows={4}
		/>

		<h3 class="section-title">Images</h3>

		<ImageGalleryUpload
			label="Product Images"
			name="images"
			images={galleryImages}
			entity="products"
			slug={product.slug || 'product'}
			hint="Upload product images. First image marked as main is used as thumbnail."
		/>

		<h3 class="section-title">Settings</h3>

		<div class="form-grid">
			<FormField
				label="Position"
				name="position"
				type="number"
				value={product.position}
			/>
		</div>

		<div class="checkbox-grid">
			<FormCheckbox
				label="Active"
				name="is_active"
				checked={product.is_active === 1}
			/>

			<FormCheckbox
				label="Featured"
				name="is_featured"
				checked={product.is_featured === 1}
			/>

			<FormCheckbox
				label="New"
				name="is_new"
				checked={product.is_new === 1}
			/>

			<FormCheckbox
				label="Limited Edition"
				name="is_limited"
				checked={product.is_limited === 1}
			/>
		</div>

		<div class="form-actions">
			<ActionButton href="/admin/products" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Saving...' : 'Save Changes'}
			</ActionButton>
		</div>
	</form>
</div>

<!-- Product Options -->
<div class="form-card" style="margin-top: 1.5rem">
	<h3 class="section-title" style="margin-top: 0; padding-top: 0; border-top: none;">Product Options ({data.options.length})</h3>

	{#if data.options.length > 0}
		<table class="options-table">
			<thead>
				<tr>
					<th>Type</th>
					<th>Label</th>
					<th>Value</th>
					<th style="width: 90px">Price +/-</th>
					<th style="width: 70px">Default</th>
					<th style="width: 80px">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.options as option}
					<tr>
						<td><code>{option.option_type}</code></td>
						<td>{option.option_label}</td>
						<td>{option.option_value}{option.option_value_label ? ` (${option.option_value_label})` : ''}</td>
						<td>{option.price_modifier ? `${option.price_modifier > 0 ? '+' : ''}${option.price_modifier}` : '—'}</td>
						<td>{option.is_default ? 'Yes' : 'No'}</td>
						<td>
							<form method="POST" action="?/removeOption" use:enhance>
								<input type="hidden" name="option_id" value={option.id} />
								<ActionButton type="submit" variant="danger" size="sm">Remove</ActionButton>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="empty-text">No options configured for this product.</p>
	{/if}

	<form method="POST" action="?/addOption" use:enhance class="add-option-form">
		<h4 class="subsection-title">Add Option</h4>
		<div class="option-grid">
			<FormField label="Type" name="option_type" value="" hint="e.g. diameter, package, bracelet" required />
			<FormField label="Label" name="option_label" value="" hint="e.g. Диаметр корпуса" required />
		</div>
		<div class="option-grid">
			<FormField label="Value" name="option_value" value="" hint="e.g. 41 mm" required />
			<FormField label="Value Label" name="option_value_label" value="" hint="Display label (optional)" />
		</div>
		<div class="option-grid">
			<FormField label="Price Modifier (kopecks)" name="price_modifier" value="0" type="number" hint="e.g. 5000000 for +50K RUB" />
			<FormCheckbox label="Default Option" name="is_default" />
		</div>
		<div class="option-actions">
			<ActionButton type="submit" variant="primary" size="sm">Add Option</ActionButton>
		</div>
	</form>
</div>

<!-- Filter Assignment -->
{#if filterGroups.length > 0}
	<div class="form-card" style="margin-top: 1.5rem">
		<h3 class="section-title" style="margin-top: 0; padding-top: 0; border-top: none;">
			Filter Assignment ({selectedFilterIds.size} selected)
		</h3>

		<div class="filter-groups">
			{#each filterGroups as group}
				<div class="filter-group">
					<div class="filter-group-label">{group.name}</div>
					<div class="filter-values">
						{#each group.values as val}
							<label class="filter-value-checkbox">
								<input
									type="checkbox"
									checked={selectedFilterIds.has(val.id)}
									onchange={() => toggleFilter(val.id)}
								/>
								<span>{val.label || val.value}</span>
							</label>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div class="filter-actions">
			{#if filterMessage}
				<span class="filter-msg" class:success={filterMessage === 'Filters saved'}>{filterMessage}</span>
			{/if}
			<ActionButton variant="primary" size="sm" disabled={filterSaving} onclick={saveFilters}>
				{filterSaving ? 'Saving...' : 'Save Filters'}
			</ActionButton>
		</div>
	</div>
{/if}

<style>
	.form-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 1.5rem 0 1rem 0;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.section-title:first-child {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.checkbox-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid #e5e7eb;
	}

	.error-message {
		background: #fee2e2;
		border: 1px solid #ef4444;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.options-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.options-table th,
	.options-table td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.875rem;
	}

	.options-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
	}

	.options-table code {
		background: #f3f4f6;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		font-size: 0.8125rem;
	}

	.empty-text {
		color: #9ca3af;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem 0;
	}

	.add-option-form {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.subsection-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #6b7280;
		margin: 0 0 0.75rem;
	}

	.option-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.option-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}

	.filter-groups {
		display: grid;
		gap: 1rem;
	}

	.filter-group {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 0.75rem 1rem;
	}

	.filter-group-label {
		font-weight: 600;
		font-size: 0.8125rem;
		color: #374151;
		margin-bottom: 0.5rem;
	}

	.filter-values {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
	}

	.filter-value-checkbox {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.875rem;
		color: #4b5563;
		cursor: pointer;
	}

	.filter-value-checkbox input[type='checkbox'] {
		width: 16px;
		height: 16px;
		accent-color: #3b82f6;
		cursor: pointer;
	}

	.filter-actions {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.75rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.filter-msg {
		font-size: 0.8125rem;
		color: #ef4444;
	}

	.filter-msg.success {
		color: #16a34a;
	}
</style>
