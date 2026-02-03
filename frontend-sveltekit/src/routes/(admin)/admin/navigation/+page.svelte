<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<number | null>(null);
	let showAddForm = $state(false);
	let selectedMenuType = $state('header_desktop');

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

	const parentOptionsForAdd = $derived(
		data.allItems.filter(item => item.parent_id === null && item.menu_type === selectedMenuType)
	);

	// Move functions that submit a hidden form
	function submitMove(id: number, direction: 'up' | 'down') {
		const formEl = document.createElement('form');
		formEl.method = 'POST';
		formEl.action = '?/move';
		formEl.style.display = 'none';

		const idInput = document.createElement('input');
		idInput.type = 'hidden';
		idInput.name = 'id';
		idInput.value = String(id);
		formEl.appendChild(idInput);

		const dirInput = document.createElement('input');
		dirInput.type = 'hidden';
		dirInput.name = 'direction';
		dirInput.value = direction;
		formEl.appendChild(dirInput);

		// Add CSRF token
		const csrfInput = document.createElement('input');
		csrfInput.type = 'hidden';
		csrfInput.name = 'csrf_token';
		csrfInput.value = $page.data.csrfToken || '';
		formEl.appendChild(csrfInput);

		document.body.appendChild(formEl);
		formEl.submit();
	}
</script>

<svelte:head>
	<title>Navigation - Moditime Admin</title>
</svelte:head>

<PageHeader title="Navigation" description="Manage site navigation menus">
	{#snippet actions()}
		<ActionButton variant="primary" onclick={() => showAddForm = !showAddForm}>
			{showAddForm ? 'Cancel' : '+ Add Item'}
		</ActionButton>
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
				<input type="hidden" name="position" value="999" />
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

{#each Object.entries(data.grouped) as [menuType, { topLevel, children }]}
	<div class="card">
		<h3>{menuTypeLabels[menuType] || menuType}</h3>

		<div class="nav-list">
			{#each topLevel as item, idx}
				<div class="nav-item">
					{#if editingId === item.id}
						<form method="POST" action="?/update" use:enhance class="edit-form">
							<input type="hidden" name="id" value={item.id} />
							<input type="text" name="label" value={item.label} class="input-sm" />
							<input type="text" name="href" value={item.href} class="input-sm" />
							<input type="hidden" name="position" value={item.position} />
							<label class="checkbox-inline">
								<input type="checkbox" name="is_active" checked={item.is_active === 1} />
								Active
							</label>
							<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
							<ActionButton variant="ghost" size="sm" onclick={cancelEdit}>Cancel</ActionButton>
						</form>
					{:else}
						<div class="nav-item-content">
							<ReorderButtons
								itemId={item.id}
								isFirst={idx === 0}
								isLast={idx === topLevel.length - 1}
								onMoveUp={(id) => submitMove(id, 'up')}
								onMoveDown={(id) => submitMove(id, 'down')}
							/>
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
							{#each children[item.id] as child, childIdx}
								<div class="nav-item child">
									{#if editingId === child.id}
										<form method="POST" action="?/update" use:enhance class="edit-form">
											<input type="hidden" name="id" value={child.id} />
											<input type="text" name="label" value={child.label} class="input-sm" />
											<input type="text" name="href" value={child.href} class="input-sm" />
											<input type="hidden" name="position" value={child.position} />
											<label class="checkbox-inline">
												<input type="checkbox" name="is_active" checked={child.is_active === 1} />
												Active
											</label>
											<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
											<ActionButton variant="ghost" size="sm" onclick={cancelEdit}>Cancel</ActionButton>
										</form>
									{:else}
										<div class="nav-item-content">
											<ReorderButtons
												itemId={child.id}
												isFirst={childIdx === 0}
												isLast={childIdx === children[item.id].length - 1}
												onMoveUp={(id) => submitMove(id, 'up')}
												onMoveDown={(id) => submitMove(id, 'down')}
											/>
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
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
	}

	.nav-item-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		background: #f9fafb;
	}

	.nav-label {
		font-weight: 600;
		color: #1f2937;
		min-width: 150px;
	}

	.nav-href {
		color: #4b5563;
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
		background: #f3f4f6;
		padding-left: 2rem;
	}

	.nav-item.child {
		background: transparent;
		border: none;
		border-radius: 0;
	}

	.nav-item.child .nav-item-content {
		padding: 0.5rem 1rem;
		background: #f3f4f6;
		border-bottom: 1px solid #e5e7eb;
	}

	.nav-item.child:last-child .nav-item-content {
		border-bottom: none;
	}

	.edit-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: #fef3c7;
	}

	.input-sm {
		padding: 0.375rem 0.5rem;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		font-size: 0.875rem;
		width: 150px;
	}

	.checkbox-inline {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: #374151;
	}
</style>
