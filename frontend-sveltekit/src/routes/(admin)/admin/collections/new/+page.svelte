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

	let nameValue = $state(form?.data?.title ?? '');

	function generateSlug(name: string): string {
		return name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
</script>

<svelte:head>
	<title>New Collection - Moditime Admin</title>
</svelte:head>

<PageHeader title="New Collection" description="Create a curated collection" />

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
		<h3 class="section-title">Basic Information</h3>
		<div class="form-grid">
			<FormField label="Title" name="title" value={nameValue} required oninput={(e) => (nameValue = e.currentTarget.value)} />
			<FormField label="Slug" name="slug" value={form?.data?.slug ?? generateSlug(nameValue)} hint="URL-friendly identifier" required />
		</div>
		<div class="form-grid">
			<FormField label="Category" name="category" value={form?.data?.category ?? ''} required hint="e.g. Для переговоров, Инвестиции" />
			<FormField label="Image URL" name="image_url" value={form?.data?.image_url ?? ''} type="url" />
		</div>
		<FormTextarea label="Description" name="description" value={form?.data?.description ?? ''} rows={3} />

		<h3 class="section-title">Link</h3>
		<div class="form-grid">
			<FormField label="Link Text" name="link_text" value={form?.data?.link_text ?? 'Открыть подборку'} />
			<FormField label="Link Href" name="link_href" value={form?.data?.link_href ?? ''} hint="e.g. /catalog?collection=slug" />
		</div>

		<h3 class="section-title">Settings</h3>
		<FormCheckbox label="Active" name="is_active" checked={form?.data?.is_active ?? true} />
		<FormField label="Position" name="position" value={String(form?.data?.position ?? data.nextPosition)} type="number" />
	</div>

	<div class="form-actions">
		<ActionButton href="/admin/collections" variant="secondary">Cancel</ActionButton>
		<ActionButton type="submit" variant="primary" disabled={loading}>
			{loading ? 'Creating...' : 'Create Collection'}
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
