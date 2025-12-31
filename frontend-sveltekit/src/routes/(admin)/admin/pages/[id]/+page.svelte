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

	const page = $derived(form?.data ?? data.page);
	const meta = $derived(form?.data?.meta ?? data.meta);

	const templateOptions = [
		{ value: 'about', label: 'About' },
		{ value: 'delivery', label: 'Delivery' },
		{ value: 'warranty', label: 'Warranty' },
		{ value: 'contacts', label: 'Contacts' },
		{ value: 'legal', label: 'Legal' }
	];

	// Check if it's a contacts page to show extra fields
	const isContactsPage = $derived(data.page.template === 'contacts' || data.page.slug === 'contacts');
</script>

<svelte:head>
	<title>Edit {data.page.title} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit Page" description={data.page.slug}>
	{#snippet actions()}
		<a href="/{data.page.slug}" target="_blank" class="preview-link">Preview</a>
		<ActionButton href="/admin/pages" variant="secondary">Back to Pages</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

{#if form?.success}
	<div class="success-message">Page updated successfully</div>
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
				label="Title"
				name="title"
				value={page.title}
				required
			/>

			<FormField
				label="Slug"
				name="slug"
				value={page.slug}
				required
				hint="URL path (e.g., about, delivery)"
			/>
		</div>

		<div class="form-grid">
			<FormSelect
				label="Template"
				name="template"
				options={templateOptions}
				value={page.template ?? ''}
				placeholder="Select template"
			/>

			<FormCheckbox
				label="Published"
				name="is_published"
				checked={page.is_published === 1}
			/>
		</div>

		<FormTextarea
			label="Content (HTML)"
			name="content"
			value={page.content ?? ''}
			placeholder="Page content..."
			rows={10}
		/>

		<h3 class="section-title">SEO Settings</h3>

		<FormField
			label="Meta Title"
			name="meta_title"
			value={meta.meta_title ?? ''}
			placeholder="Title for search engines"
		/>

		<FormTextarea
			label="Meta Description"
			name="meta_description"
			value={meta.meta_description ?? ''}
			placeholder="Description for search engines"
			rows={2}
		/>

		{#if isContactsPage}
			<h3 class="section-title">Contact Information</h3>

			<div class="form-grid">
				<FormField
					label="Phone"
					name="phone"
					value={meta.phone ?? ''}
					placeholder="+7 (495) 123-45-67"
				/>

				<FormField
					label="Email"
					name="email"
					type="email"
					value={meta.email ?? ''}
					placeholder="info@example.com"
				/>
			</div>

			<FormField
				label="Address"
				name="address"
				value={meta.address ?? ''}
				placeholder="Moscow, Red Square, 1"
			/>

			<FormField
				label="Working Hours"
				name="working_hours"
				value={meta.working_hours ?? ''}
				placeholder="Mon-Fri: 10:00-19:00"
			/>
		{/if}

		<div class="form-actions">
			<ActionButton href="/admin/pages" variant="secondary">Cancel</ActionButton>
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

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 1.5rem 0 1rem 0;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
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

	.success-message {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.preview-link {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
		color: #6b7280;
		text-decoration: none;
	}

	.preview-link:hover {
		color: #3b82f6;
	}
</style>
