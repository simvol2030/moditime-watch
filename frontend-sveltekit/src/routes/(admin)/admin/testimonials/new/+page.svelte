<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>New Testimonial - Moditime Admin</title>
</svelte:head>

<PageHeader title="New Testimonial" description="Add a client testimonial" />

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

<form
	method="POST"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
>
	<div class="form-card">
		<h3 class="section-title">Client Information</h3>
		<div class="form-grid">
			<FormField label="Name" name="name" value={form?.data?.name ?? ''} required />
			<FormField label="Position / Role" name="position" value={form?.data?.position ?? ''} hint="e.g. Партнёр инвестиционного фонда" />
		</div>
		<FormField label="Avatar URL" name="avatar_url" value={form?.data?.avatar_url ?? ''} type="url" />

		<h3 class="section-title">Testimonial</h3>
		<FormTextarea label="Text" name="text" value={form?.data?.text ?? ''} rows={4} required />
		<FormField label="Watch Choice" name="choice" value={form?.data?.choice ?? ''} hint="e.g. Patek Philippe Nautilus 5811/1G" />

		<h3 class="section-title">Settings</h3>
		<FormCheckbox label="Active" name="is_active" checked={form?.data?.is_active ?? true} />
		<FormField label="Display Order" name="display_order" value={String(form?.data?.display_order ?? data.nextOrder)} type="number" />
	</div>

	<div class="form-actions">
		<ActionButton href="/admin/testimonials" variant="secondary">Cancel</ActionButton>
		<ActionButton type="submit" variant="primary" disabled={loading}>
			{loading ? 'Creating...' : 'Create Testimonial'}
		</ActionButton>
	</div>
</form>

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
</style>
