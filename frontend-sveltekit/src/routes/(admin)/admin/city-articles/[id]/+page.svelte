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

	const a = data.article;

	const cityOptions = $derived(
		data.cities.map((c) => ({ value: String(c.id), label: c.name }))
	);

	const templateOptions = [
		{ value: 'standard', label: 'Standard' },
		{ value: 'unique', label: 'Unique' },
		{ value: 'variant_A', label: 'Variant A' },
		{ value: 'variant_B', label: 'Variant B' }
	];
</script>

<svelte:head>
	<title>Edit Article: {a.title} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit City Article" description="{a.city_name}: {a.title}" />

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
		<h3 class="section-title">Article Details</h3>
		<div class="form-grid">
			<FormSelect
				label="City"
				name="city_id"
				options={cityOptions}
				value={form?.data?.city_id ? String(form.data.city_id) : String(a.city_id)}
				required
			/>
			<FormSelect
				label="Template Type"
				name="template_type"
				options={templateOptions}
				value={form?.data?.template_type ?? a.template_type ?? 'standard'}
			/>
		</div>
		<div class="form-grid">
			<FormField label="Title" name="title" value={form?.data?.title ?? a.title} required />
			<FormField label="Slug" name="slug" value={form?.data?.slug ?? a.slug} required />
		</div>
		<FormField label="Image URL" name="image_url" value={form?.data?.image_url ?? a.image_url ?? ''} type="url" />
		<FormTextarea label="Excerpt" name="excerpt" value={form?.data?.excerpt ?? a.excerpt ?? ''} rows={2} hint="Short summary for listings" />
		<FormTextarea label="Content (HTML)" name="content" value={form?.data?.content ?? a.content ?? ''} rows={12} hint="Full article content in HTML" />

		<h3 class="section-title">Settings</h3>
		<FormCheckbox label="Published" name="is_published" checked={form?.data?.is_published ?? a.is_published === 1} />
	</div>

	<div class="form-actions">
		<ActionButton href="/admin/city-articles" variant="secondary">Cancel</ActionButton>
		<ActionButton type="submit" variant="primary" disabled={loading}>
			{loading ? 'Saving...' : 'Save Changes'}
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
