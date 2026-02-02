<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import DragDropList from '$lib/components/admin/DragDropList.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<number | null>(null);
	let showAddForm = $state(false);
	let selectedMenuType = $state('header_desktop');
	let reorderMode = $state(false);
	let reorderFormEl = $state<HTMLFormElement | null>(null);
	let reorderIdsInput = $state('');

	const menuTypeLabels: Record<string, string> = {
		header_desktop: 'Header (Desktop)',
		header_mobile: 'Header (Mobile)',
		city_header: 'City Header',
		footer: 'Footer'
	};

	function startEdit(id: number) {
		editingId = id;
	}

	function cancelEdit() {
		editingId = null;
	}

	function getItem(id: number) {
		return data.allItems.find(item => item.id === id);
	}

	const topLevelItems = $derived(
		data.allItems.filter(item => item.parent_id === null)
	);

	const parentOptionsForAdd = $derived(
		data.allItems.filter(item => item.parent_id === null && item.menu_type === selectedMenuType)
	);
</script>

<svelte:head>
	<title>Navigation - Moditime Admin</title>
</svelte:head>

<PageHeader title="Navigation" description="Manage site navigation menus">
	{#snippet actions()}
		<ActionButton variant={reorderMode ? 'primary' : 'ghost'} onclick={() => { reorderMode = !reorderMode; if (reorderMode) showAddForm = false; }}>
			{reorderMode ? 'Exit Reorder' : 'Reorder'}
		</ActionButton>
		{#if !reorderMode}
			<ActionButton variant="primary" onclick={() => showAddForm = !showAddForm}>
				{showAddForm ? 'Cancel' : '+ Add Item'}
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

{#if showAddForm}
	<div class="card add-form">
		<h3>Add Navigation Item</h3>
		<form method="POST" action="?/create" use:enhance>
			<div class="form-row">
				<div class="form-group">
					<label for="new-label">Label</label>
					<input type="text" id="new-label" name="label" required placeholder="Menu label" />
				</div>
				<div class="form-group">
					<label for="new-href">URL</label>
					<input type="text" id="new-href" name="href" required placeholder="/path" />
				</div>
				<div class="form-group">
					<label for="new-menu-type">Menu Type</label>
					<select id="new-menu-type" name="menu_type" bind:value={selectedMenuType}>
						<option value="header_desktop">Header (Desktop)</option>
						<option value="header_mobile">Header (Mobile)</option>
						<option value="city_header">City Header</option>
						<option value="footer">Footer</option>
					</select>
				</div>
				<div class="form-group">
					<label for="new-parent">Parent</label>
					<select id="new-parent" name="parent_id">
						<option value="">None (top-level)</option>
						{#each parentOptionsForAdd as item}
							<option value={item.id}>{item.label}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="new-position">Position</label>
					<input type="number" id="new-position" name="position" value="0" />
				</div>
				<div class="form-group checkbox">
					<label>
						<input type="checkbox" name="is_active" checked />
						Active
					</label>
				</div>
				<div class="form-group">
					<ActionButton type="submit" variant="primary">Add</ActionButton>
				</div>
			</div>
		</form>
	</div>
{/if}

{#if reorderMode}
	<!-- Drag-and-Drop Reorder Mode -->
	{#each Object.entries(data.grouped) as [menuType, { topLevel }]}
		<div class="card">
			<h3>{menuTypeLabels[menuType] || menuType} — Drag to reorder</h3>
			<DragDropList
				items={topLevel.map(item => ({ id: item.id, label: item.label, href: item.href }))}
				onreorder={(ids) => {
					reorderIdsInput = JSON.stringify(ids);
					// Auto-submit
					if (reorderFormEl) {
						const input = reorderFormEl.querySelector('input[name="ids"]') as HTMLInputElement;
						if (input) input.value = JSON.stringify(ids);
						reorderFormEl.requestSubmit();
					}
				}}
			/>
			<form method="POST" action="?/reorder" use:enhance bind:this={reorderFormEl} class="reorder-form">
				<input type="hidden" name="ids" value={reorderIdsInput} />
			</form>
		</div>
	{/each}
{:else}

{#each Object.entries(data.grouped) as [menuType, { topLevel, children }]}
	<div class="card">
		<h3>{menuTypeLabels[menuType] || menuType}</h3>

		<div class="nav-list">
			{#each topLevel as item}
				<div class="nav-item">
					{#if editingId === item.id}
						<form method="POST" action="?/update" use:enhance class="edit-form">
							<input type="hidden" name="id" value={item.id} />
							<input type="text" name="label" value={item.label} class="input-sm" />
							<input type="text" name="href" value={item.href} class="input-sm" />
							<input type="number" name="position" value={item.position} class="input-xs" />
							<label class="checkbox-inline">
								<input type="checkbox" name="is_active" checked={item.is_active === 1} />
								Active
							</label>
							<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
							<ActionButton variant="ghost" size="sm" onclick={cancelEdit}>Cancel</ActionButton>
						</form>
					{:else}
						<div class="nav-item-content">
							<span class="nav-label">{item.label}</span>
							<span class="nav-href">{item.href}</span>
							<span class="nav-position">#{item.position}</span>
							<span class="nav-status" class:active={item.is_active === 1}>
								{item.is_active ? 'Active' : 'Inactive'}
							</span>
							<div class="nav-actions">
								<button type="button" class="btn-link" onclick={() => startEdit(item.id)}>Edit</button>
								<form method="POST" action="?/delete" use:enhance class="inline-form">
									<input type="hidden" name="id" value={item.id} />
									<button
										type="submit"
										class="btn-link danger"
										onclick={(e) => {
											if (!confirm('Delete this item and its children?')) {
												e.preventDefault();
											}
										}}
									>
										Delete
									</button>
								</form>
							</div>
						</div>
					{/if}

					<!-- Children / Submenu -->
					{#if children[item.id]?.length}
						<div class="nav-children">
							{#each children[item.id] as child}
								<div class="nav-item child">
									{#if editingId === child.id}
										<form method="POST" action="?/update" use:enhance class="edit-form">
											<input type="hidden" name="id" value={child.id} />
											<input type="text" name="label" value={child.label} class="input-sm" />
											<input type="text" name="href" value={child.href} class="input-sm" />
											<input type="number" name="position" value={child.position} class="input-xs" />
											<label class="checkbox-inline">
												<input type="checkbox" name="is_active" checked={child.is_active === 1} />
												Active
											</label>
											<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
											<ActionButton variant="ghost" size="sm" onclick={cancelEdit}>Cancel</ActionButton>
										</form>
									{:else}
										<div class="nav-item-content">
											<span class="nav-label">{child.label}</span>
											<span class="nav-href">{child.href}</span>
											<span class="nav-position">#{child.position}</span>
											<span class="nav-status" class:active={child.is_active === 1}>
												{child.is_active ? 'Active' : 'Inactive'}
											</span>
											<div class="nav-actions">
												<button type="button" class="btn-link" onclick={() => startEdit(child.id)}>Edit</button>
												<form method="POST" action="?/delete" use:enhance class="inline-form">
													<input type="hidden" name="id" value={child.id} />
													<button type="submit" class="btn-link danger">Delete</button>
												</form>
											</div>
										</div>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{/each}
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

	.form-group.checkbox {
		flex-direction: row;
		align-items: center;
	}

	.form-group.checkbox label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
	}

	.nav-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.nav-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.nav-item-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
	}

	.nav-label {
		font-weight: 500;
		min-width: 150px;
	}

	.nav-href {
		color: #6b7280;
		font-size: 0.875rem;
		flex: 1;
	}

	.nav-position {
		color: #9ca3af;
		font-size: 0.75rem;
	}

	.nav-status {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: #fee2e2;
		color: #dc2626;
	}

	.nav-status.active {
		background: #dcfce7;
		color: #16a34a;
	}

	.nav-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-link {
		background: none;
		border: none;
		color: #3b82f6;
		font-size: 0.8125rem;
		cursor: pointer;
		padding: 0;
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

	.nav-children {
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
		padding-left: 2rem;
	}

	.nav-item.child .nav-item-content {
		padding: 0.5rem 1rem;
	}

	.edit-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #f9fafb;
	}

	.input-sm {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 150px;
	}

	.input-xs {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 60px;
	}

	.checkbox-inline {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: #374151;
	}

	.reorder-form {
		display: none;
	}
</style>
