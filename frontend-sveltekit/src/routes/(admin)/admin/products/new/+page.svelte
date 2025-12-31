<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}

	let nameValue = $state(form?.data?.name ?? '');
	let slugValue = $state(form?.data?.slug ?? '');

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
</script>

<svelte:head>
	<title>Add Product - Moditime Admin</title>
</svelte:head>

<PageHeader title="Add Product" description="Create a new product">
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
				value={nameValue}
				required
				placeholder="e.g. Rolex Submariner Date"
			/>

			<FormField
				label="Slug"
				name="slug"
				value={slugValue || generateSlug(nameValue)}
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
				value={form?.data?.brand_id ?? ''}
				placeholder="Select brand"
				required
			/>

			<FormSelect
				label="Category"
				name="category_id"
				options={categoryOptions}
				value={form?.data?.category_id ?? ''}
				placeholder="Select category"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="SKU"
				name="sku"
				value={form?.data?.sku ?? ''}
				placeholder="e.g. RLX-126610LN"
			/>

			<FormField
				label="Price (RUB)"
				name="price"
				type="number"
				value={form?.data?.price ?? ''}
				placeholder="e.g. 1320000"
				hint="Price in rubles (not kopecks)"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="Price Note"
				name="price_note"
				value={form?.data?.price_note ?? ''}
				placeholder="e.g. Price includes VAT"
			/>

			<FormSelect
				label="Availability"
				name="availability_status"
				options={availabilityOptions}
				value={form?.data?.availability_status ?? 'in-stock'}
			/>
		</div>

		<FormTextarea
			label="Description"
			name="description"
			value={form?.data?.description ?? ''}
			placeholder="Product description..."
			rows={4}
		/>

		<h3 class="section-title">Settings</h3>

		<div class="form-grid">
			<FormField
				label="Position"
				name="position"
				type="number"
				value={form?.data?.position ?? data.nextPosition}
			/>
		</div>

		<div class="checkbox-grid">
			<FormCheckbox
				label="Active"
				name="is_active"
				checked={form?.data?.is_active ?? true}
			/>

			<FormCheckbox
				label="Featured"
				name="is_featured"
				checked={form?.data?.is_featured ?? false}
			/>

			<FormCheckbox
				label="New"
				name="is_new"
				checked={form?.data?.is_new ?? false}
			/>

			<FormCheckbox
				label="Limited Edition"
				name="is_limited"
				checked={form?.data?.is_limited ?? false}
			/>
		</div>

		<div class="form-actions">
			<ActionButton href="/admin/products" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Creating...' : 'Create Product'}
			</ActionButton>
		</div>
	</form>
</div>

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
</style>
