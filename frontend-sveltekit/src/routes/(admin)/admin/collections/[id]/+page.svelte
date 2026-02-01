<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	const c = data.collection;

	const availableProducts = $derived(
		data.allProducts
			.filter((p) => !data.collectionProducts.some((cp) => cp.id === p.id))
			.map((p) => ({ value: String(p.id), label: `${p.brand_name} — ${p.name}` }))
	);
</script>

<svelte:head>
	<title>Edit Collection: {c.title} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit Collection" description={c.title} />

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

<form
	method="POST"
	action="?/update"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
>
	<div class="form-card">
		<h3 class="section-title">Basic Information</h3>
		<div class="form-grid">
			<FormField label="Title" name="title" value={form?.data?.title ?? c.title} required />
			<FormField label="Slug" name="slug" value={form?.data?.slug ?? c.slug} required />
		</div>
		<div class="form-grid">
			<FormField label="Category" name="category" value={form?.data?.category ?? c.category} required />
			<FormField label="Image URL" name="image_url" value={form?.data?.image_url ?? c.image_url ?? ''} type="url" />
		</div>
		<FormTextarea label="Description" name="description" value={form?.data?.description ?? c.description ?? ''} rows={3} />

		<h3 class="section-title">Link</h3>
		<div class="form-grid">
			<FormField label="Link Text" name="link_text" value={form?.data?.link_text ?? c.link_text ?? ''} />
			<FormField label="Link Href" name="link_href" value={form?.data?.link_href ?? c.link_href ?? ''} />
		</div>

		<h3 class="section-title">Settings</h3>
		<FormCheckbox label="Active" name="is_active" checked={form?.data?.is_active ?? c.is_active === 1} />
		<FormField label="Position" name="position" value={String(form?.data?.position ?? c.position)} type="number" />
	</div>

	<div class="form-actions">
		<ActionButton href="/admin/collections" variant="secondary">Cancel</ActionButton>
		<ActionButton type="submit" variant="primary" disabled={loading}>
			{loading ? 'Saving...' : 'Save Changes'}
		</ActionButton>
	</div>
</form>

<!-- Collection Products -->
<div class="form-card" style="margin-top: 1.5rem">
	<h3 class="section-title">Products in Collection ({data.collectionProducts.length})</h3>

	{#if data.collectionProducts.length > 0}
		<table class="products-table">
			<thead>
				<tr>
					<th>Brand</th>
					<th>Product</th>
					<th style="width: 100px">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each data.collectionProducts as product}
					<tr>
						<td>{product.brand_name}</td>
						<td>{product.name}</td>
						<td>
							<form method="POST" action="?/removeProduct" use:enhance>
								<input type="hidden" name="product_id" value={product.id} />
								<ActionButton type="submit" variant="danger" size="sm">Remove</ActionButton>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="empty-text">No products linked to this collection.</p>
	{/if}

	{#if availableProducts.length > 0}
		<form method="POST" action="?/addProduct" use:enhance class="add-product-form">
			<FormSelect label="Add Product" name="product_id" options={availableProducts} required />
			<ActionButton type="submit" variant="primary" size="sm">Add</ActionButton>
		</form>
	{/if}
</div>

<style>
	.form-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 1.5rem 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section-title:first-child {
		margin-top: 0;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.products-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.products-table th,
	.products-table td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.875rem;
	}

	.products-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
	}

	.empty-text {
		color: #9ca3af;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem 0;
	}

	.add-product-form {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.add-product-form :global(.form-group) {
		flex: 1;
	}
</style>
