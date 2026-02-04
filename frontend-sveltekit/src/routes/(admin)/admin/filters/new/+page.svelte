<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

	const typeOptions = [
		{ value: 'checkbox', label: 'Checkbox' },
		{ value: 'range', label: 'Range' },
		{ value: 'select', label: 'Select' }
	];
</script>

<svelte:head>
	<title>New Filter - Moditime Admin</title>
</svelte:head>

<PageHeader title="New Filter" description="Create a new filter attribute">
	{#snippet actions()}
		<ActionButton href="/admin/filters" variant="secondary">Cancel</ActionButton>
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
				value={form?.data?.name ?? ''}
				required
				placeholder="e.g. Case Material"
			/>

			<FormField
				label="Slug"
				name="slug"
				value={form?.data?.slug ?? ''}
				required
				placeholder="e.g. case-material"
				hint="URL-friendly identifier"
			/>
		</div>

		<div class="form-grid">
			<FormSelect
				label="Type"
				name="type"
				options={typeOptions}
				value={form?.data?.type ?? 'checkbox'}
			/>

			<FormField
				label="Position"
				name="position"
				type="number"
				value={form?.data?.position ?? 0}
			/>
		</div>

		<FormCheckbox
			label="Active"
			name="is_active"
			checked={form?.data?.is_active !== 0}
		/>

		<div class="form-actions">
			<ActionButton href="/admin/filters" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Creating...' : 'Create Filter'}
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
