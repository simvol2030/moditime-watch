<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<number | null>(null);
	let showCreate = $state(false);
</script>

<svelte:head><title>Article Categories - pSEO Admin</title></svelte:head>

<PageHeader title="Article Categories" description="Categories for city pSEO articles">
	{#snippet actions()}
		<ActionButton variant="primary" onclick={() => { showCreate = !showCreate; editingId = null; }}>
			{showCreate ? 'Cancel' : '+ New Category'}
		</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}<div class="alert error">{form.error}</div>{/if}
{#if form?.success}<div class="alert success">Category saved successfully</div>{/if}

{#if showCreate}
	<div class="card">
		<h3>New Category</h3>
		<form method="POST" action="?/create" use:enhance>
			<div class="form-row">
				<label>Name <input type="text" name="name" required /></label>
				<label>Slug <input type="text" name="slug" required /></label>
				<label>Position <input type="number" name="position" value="0" /></label>
			</div>
			<label>Description <textarea name="description" rows="2"></textarea></label>
			<label class="check"><input type="checkbox" name="is_active" value="1" checked /> Active</label>
			<ActionButton type="submit" variant="primary" size="sm">Create</ActionButton>
		</form>
	</div>
{/if}

<div class="card">
	<table>
		<thead>
			<tr><th>Name</th><th>Slug</th><th>Position</th><th>Active</th><th>Actions</th></tr>
		</thead>
		<tbody>
			{#each data.categories as cat}
				{#if editingId === cat.id}
					<tr>
						<td colspan="5">
							<form method="POST" action="?/update" use:enhance class="inline-form">
								<input type="hidden" name="id" value={cat.id} />
								<div class="form-row">
									<label>Name <input type="text" name="name" value={cat.name} required /></label>
									<label>Slug <input type="text" name="slug" value={cat.slug} required /></label>
									<label>Position <input type="number" name="position" value={cat.position} /></label>
								</div>
								<label>Description <textarea name="description" rows="2">{cat.description || ''}</textarea></label>
								<label class="check"><input type="checkbox" name="is_active" value="1" checked={cat.is_active === 1} /> Active</label>
								<div class="btn-group">
									<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
									<ActionButton variant="ghost" size="sm" onclick={() => { editingId = null; }}>Cancel</ActionButton>
								</div>
							</form>
						</td>
					</tr>
				{:else}
					<tr>
						<td><strong>{cat.name}</strong></td>
						<td><code>{cat.slug}</code></td>
						<td>{cat.position}</td>
						<td>{cat.is_active ? 'Yes' : 'No'}</td>
						<td class="actions">
							<ActionButton variant="ghost" size="sm" onclick={() => { editingId = cat.id; showCreate = false; }}>Edit</ActionButton>
							<form method="POST" action="?/delete" use:enhance={() => ({ async update({ update }) { await update(); } })}>
								<input type="hidden" name="id" value={cat.id} />
								<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
							</form>
						</td>
					</tr>
				{/if}
			{:else}
				<tr><td colspan="5" class="empty">No categories yet</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
	.card h3 { margin: 0 0 1rem; font-size: 1rem; }
	.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
	.alert.error { background: #fee2e2; color: #dc2626; }
	.alert.success { background: #dcfce7; color: #16a34a; }
	table { width: 100%; border-collapse: collapse; }
	th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #e5e7eb; font-size: 0.8125rem; color: #6b7280; text-transform: uppercase; }
	td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; }
	code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.8125rem; }
	.actions { display: flex; gap: 0.5rem; align-items: center; }
	.actions form { margin: 0; }
	.empty { text-align: center; color: #9ca3af; padding: 2rem !important; }
	.form-row { display: flex; gap: 1rem; margin-bottom: 0.75rem; }
	.form-row label { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; }
	label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem; }
	input[type="text"], input[type="number"], textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; }
	input:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
	.check { flex-direction: row; align-items: center; gap: 0.5rem; }
	.btn-group { display: flex; gap: 0.5rem; }
	.inline-form { padding: 0.5rem 0; }
</style>
