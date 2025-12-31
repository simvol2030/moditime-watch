<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddForm = $state(false);
	let editingKey = $state<string | null>(null);

	function startEdit(key: string) {
		editingKey = key;
	}

	function cancelEdit() {
		editingKey = null;
	}

	const typeLabels: Record<string, string> = {
		string: 'String',
		number: 'Number',
		boolean: 'Boolean',
		json: 'JSON'
	};
</script>

<svelte:head>
	<title>Site Config - Moditime Admin</title>
</svelte:head>

<PageHeader title="Site Configuration" description="Manage site settings">
	{#snippet actions()}
		{#if data.canManage}
			<ActionButton variant="primary" onclick={() => showAddForm = !showAddForm}>
				{showAddForm ? 'Cancel' : '+ Add Setting'}
			</ActionButton>
		{/if}
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert success">Changes saved successfully</div>
{/if}

{#if !data.canManage}
	<div class="access-denied">
		<p>You don't have permission to manage site configuration. Only super-admins can access this page.</p>
	</div>
{:else}
	{#if showAddForm}
		<div class="card add-form">
			<h3>Add New Setting</h3>
			<form method="POST" action="?/create" use:enhance>
				<div class="form-row">
					<div class="form-group">
						<label for="new-key">Key</label>
						<input type="text" id="new-key" name="key" required placeholder="setting_key" />
					</div>
					<div class="form-group">
						<label for="new-value">Value</label>
						<input type="text" id="new-value" name="value" placeholder="Value" />
					</div>
					<div class="form-group">
						<label for="new-type">Type</label>
						<select id="new-type" name="type">
							<option value="string">String</option>
							<option value="number">Number</option>
							<option value="boolean">Boolean</option>
							<option value="json">JSON</option>
						</select>
					</div>
					<div class="form-group wide">
						<label for="new-description">Description</label>
						<input type="text" id="new-description" name="description" placeholder="What this setting does" />
					</div>
					<div class="form-group">
						<ActionButton type="submit" variant="primary">Add</ActionButton>
					</div>
				</div>
			</form>
		</div>
	{/if}

	<div class="card">
		<table class="config-table">
			<thead>
				<tr>
					<th>Key</th>
					<th>Value</th>
					<th>Type</th>
					<th>Description</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.config as item}
					<tr>
						{#if editingKey === item.key}
							<td colspan="5">
								<form method="POST" action="?/update" use:enhance class="edit-form">
									<input type="hidden" name="key" value={item.key} />
									<span class="edit-key">{item.key}</span>
									{#if item.type === 'boolean'}
										<select name="value" class="edit-input">
											<option value="true" selected={item.value === 'true'}>True</option>
											<option value="false" selected={item.value !== 'true'}>False</option>
										</select>
									{:else if item.type === 'json'}
										<textarea name="value" class="edit-textarea" rows="3">{item.value ?? ''}</textarea>
									{:else}
										<input
											type={item.type === 'number' ? 'number' : 'text'}
											name="value"
											value={item.value ?? ''}
											class="edit-input wide"
										/>
									{/if}
									<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
									<ActionButton variant="ghost" size="sm" onclick={cancelEdit}>Cancel</ActionButton>
								</form>
							</td>
						{:else}
							<td class="key-cell">
								<code>{item.key}</code>
							</td>
							<td class="value-cell">
								{#if item.type === 'boolean'}
									<span class="bool-badge" class:true={item.value === 'true'}>
										{item.value === 'true' ? 'True' : 'False'}
									</span>
								{:else if item.type === 'json'}
									<code class="json-preview">{item.value?.substring(0, 50)}{(item.value?.length ?? 0) > 50 ? '...' : ''}</code>
								{:else}
									{#if item.value}{item.value}{:else}<span class="empty">-</span>{/if}
								{/if}
							</td>
							<td class="type-cell">
								<span class="type-badge">{typeLabels[item.type] || item.type}</span>
							</td>
							<td class="desc-cell">{item.description || '-'}</td>
							<td class="actions-cell">
								<button type="button" class="btn-link" onclick={() => startEdit(item.key)}>Edit</button>
								<form method="POST" action="?/delete" use:enhance class="inline-form">
									<input type="hidden" name="key" value={item.key} />
									<button
										type="submit"
										class="btn-link danger"
										onclick={(e) => {
											if (!confirm('Delete this setting?')) {
												e.preventDefault();
											}
										}}
									>
										Delete
									</button>
								</form>
							</td>
						{/if}
					</tr>
				{/each}
				{#if data.config.length === 0}
					<tr>
						<td colspan="5" class="empty-row">No configuration settings found</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
{/if}

<style>
	.card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.card h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0 0 1rem 0;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
	}

	.alert.error {
		background: #fee2e2;
		border: 1px solid #ef4444;
		color: #dc2626;
	}

	.alert.success {
		background: #dcfce7;
		border: 1px solid #22c55e;
		color: #16a34a;
	}

	.access-denied {
		background: #fef3c7;
		border: 1px solid #f59e0b;
		color: #92400e;
		padding: 1rem;
		border-radius: 8px;
	}

	.add-form .form-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
		align-items: flex-end;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.form-group.wide {
		flex: 1;
		min-width: 200px;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
	}

	.form-group input,
	.form-group select {
		padding: 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.config-table {
		width: 100%;
		border-collapse: collapse;
	}

	.config-table th,
	.config-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
	}

	.config-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 500;
	}

	.key-cell code {
		background: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.value-cell {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bool-badge {
		display: inline-block;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		background: #fee2e2;
		color: #dc2626;
	}

	.bool-badge.true {
		background: #dcfce7;
		color: #16a34a;
	}

	.json-preview {
		font-size: 0.75rem;
		background: #f3f4f6;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
	}

	.type-badge {
		font-size: 0.75rem;
		color: #6b7280;
		background: #f3f4f6;
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
	}

	.desc-cell {
		color: #6b7280;
		font-size: 0.875rem;
	}

	.actions-cell {
		white-space: nowrap;
	}

	.btn-link {
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0;
		margin-right: 0.75rem;
	}

	.btn-link:hover {
		text-decoration: underline;
	}

	.btn-link.danger {
		color: #ef4444;
	}

	.inline-form {
		display: inline;
	}

	.empty {
		color: #9ca3af;
	}

	.empty-row {
		text-align: center;
		color: #9ca3af;
		padding: 2rem !important;
	}

	.edit-form {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: #f9fafb;
	}

	.edit-key {
		font-family: monospace;
		font-weight: 500;
		min-width: 150px;
	}

	.edit-input {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.edit-input.wide {
		flex: 1;
		min-width: 200px;
	}

	.edit-textarea {
		flex: 1;
		min-width: 300px;
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		font-family: monospace;
	}
</style>
