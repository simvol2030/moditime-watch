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

	const parentOptions = $derived(
		data.categories.map((c) => ({ value: c.id, label: c.name }))
	);
</script>

<svelte:head>
	<title>Add Category - Moditime Admin</title>
</svelte:head>

<PageHeader title="Add Category" description="Create a new category">
	{#snippet actions()}
		<ActionButton href="/admin/categories" variant="secondary">Cancel</ActionButton>
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
				value={nameValue}
				required
				placeholder="e.g. Mens Watches"
			/>

			<FormField
				label="Slug"
				name="slug"
				value={slugValue || generateSlug(nameValue)}
				required
				placeholder="e.g. mens"
				hint="URL-friendly identifier"
			/>
		</div>

		<FormTextarea
			label="Description"
			name="description"
			value={form?.data?.description ?? ''}
			placeholder="Category description..."
			rows={3}
		/>

		<div class="form-grid">
			<FormSelect
				label="Parent Category"
				name="parent_id"
				options={parentOptions}
				value={form?.data?.parent_id ?? ''}
				placeholder="None (top-level)"
			/>

			<FormField
				label="Image URL"
				name="image_url"
				type="url"
				value={form?.data?.image_url ?? ''}
				placeholder="https://..."
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="Position"
				name="position"
				type="number"
				value={form?.data?.position ?? data.nextPosition}
			/>

			<FormCheckbox
				label="Active"
				name="is_active"
				checked={form?.data?.is_active ?? true}
			/>
		</div>

		<div class="form-actions">
			<ActionButton href="/admin/categories" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Creating...' : 'Create Category'}
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
