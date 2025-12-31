<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	// Use form data if available (validation error), otherwise use brand data
	const brand = $derived(form?.data ?? data.brand);
</script>

<svelte:head>
	<title>Edit {data.brand.name} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit Brand" description="Update brand details">
	{#snippet actions()}
		<ActionButton href="/admin/brands" variant="secondary">Cancel</ActionButton>
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
		<div class="form-grid">
			<FormField
				label="Name"
				name="name"
				value={brand.name}
				required
				placeholder="e.g. Rolex"
			/>

			<FormField
				label="Slug"
				name="slug"
				value={brand.slug}
				required
				placeholder="e.g. rolex"
				hint="URL-friendly identifier"
			/>
		</div>

		<FormTextarea
			label="Description"
			name="description"
			value={brand.description ?? ''}
			placeholder="Brand description..."
			rows={3}
		/>

		<div class="form-grid">
			<FormField
				label="Country"
				name="country"
				value={brand.country}
				placeholder="e.g. Switzerland"
			/>

			<FormField
				label="Founded Year"
				name="founded_year"
				type="number"
				value={brand.founded_year ?? ''}
				placeholder="e.g. 1905"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="Logo URL"
				name="logo_url"
				type="url"
				value={brand.logo_url ?? ''}
				placeholder="https://..."
			/>

			<FormField
				label="Website URL"
				name="website_url"
				type="url"
				value={brand.website_url ?? ''}
				placeholder="https://..."
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="Position"
				name="position"
				type="number"
				value={brand.position}
			/>

			<FormCheckbox
				label="Active"
				name="is_active"
				checked={brand.is_active === 1}
			/>
		</div>

		<div class="form-actions">
			<ActionButton href="/admin/brands" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Saving...' : 'Save Changes'}
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

	.form-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
