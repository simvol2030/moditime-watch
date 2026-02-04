<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	const filter = $derived(form?.data ?? data.filter);

	const typeOptions = [
		{ value: 'checkbox', label: 'Checkbox' },
		{ value: 'range', label: 'Range' },
		{ value: 'select', label: 'Select' }
	];

	async function submitMoveValue(id: number, direction: 'up' | 'down') {
		const formData = new FormData();
		formData.append('id', String(id));
		formData.append('direction', direction);

		await fetch('?/moveValue', {
			method: 'POST',
			body: formData
		});

		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Edit Filter: {data.filter.name} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit Filter" description={data.filter.name}>
	{#snippet actions()}
		<ActionButton href="/admin/filters" variant="secondary">Back to Filters</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

{#if form?.success}
	<div class="success-message">Changes saved successfully</div>
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
		<div class="form-grid">
			<FormField
				label="Name"
				name="name"
				value={filter.name}
				required
				placeholder="e.g. Case Material"
			/>

			<FormField
				label="Slug"
				name="slug"
				value={filter.slug}
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
				value={filter.type}
			/>

			<FormField
				label="Position"
				name="position"
				type="number"
				value={filter.position}
			/>
		</div>

		<FormCheckbox
			label="Active"
			name="is_active"
			checked={filter.is_active === 1}
		/>

		<div class="form-actions">
			<ActionButton href="/admin/filters" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Saving...' : 'Save Changes'}
			</ActionButton>
		</div>
	</form>
</div>

<!-- Filter Values -->
<div class="form-card" style="margin-top: 1.5rem">
	<h3 class="section-title" style="margin-top: 0; padding-top: 0; border-top: none;">
		Filter Values ({data.values.length})
	</h3>

	{#if data.values.length > 0}
		<table class="values-table">
			<thead>
				<tr>
					<th style="width: 50px">Order</th>
					<th>Value</th>
					<th>Label</th>
					<th style="width: 80px">Position</th>
					<th style="width: 150px">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.values as val, idx}
					<tr>
						<td>
							<ReorderButtons
								itemId={val.id}
								isFirst={idx === 0}
								isLast={idx === data.values.length - 1}
								onMoveUp={(id) => submitMoveValue(id, 'up')}
								onMoveDown={(id) => submitMoveValue(id, 'down')}
							/>
						</td>
						<td><code>{val.value}</code></td>
						<td>{val.label}</td>
						<td>#{val.position}</td>
						<td>
							<form method="POST" action="?/deleteValue" use:enhance={({ cancel }) => {
								if (!confirm(`Delete value "${val.label}"?`)) {
									cancel();
									return;
								}
								return async ({ update }) => {
									await update();
								};
							}}>
								<input type="hidden" name="value_id" value={val.id} />
								<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="empty-text">No values defined for this filter.</p>
	{/if}

	<form method="POST" action="?/addValue" use:enhance class="add-value-form">
		<h4 class="subsection-title">Add Value</h4>
		<div class="value-grid">
			<FormField label="Value (machine name)" name="value" value="" hint="e.g. steel, gold-18k" required />
			<FormField label="Label (display)" name="label" value="" hint="e.g. Сталь, Золото 18К" required />
			<FormField label="Position" name="position" type="number" value="0" />
		</div>
		<div class="value-actions">
			<ActionButton type="submit" variant="primary" size="sm">Add Value</ActionButton>
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

	.success-message {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.values-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.values-table th,
	.values-table td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.875rem;
	}

	.values-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
	}

	.values-table code {
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

	.add-value-form {
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

	.value-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
	}

	.value-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 0.5rem;
	}
</style>
