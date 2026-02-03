<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showAddSection = $state(false);
	let editingSectionId = $state<number | null>(null);
	let addingLinkSectionId = $state<number | null>(null);
	let editingLinkId = $state<number | null>(null);

	function submitMove(action: string, id: number, direction: 'up' | 'down') {
		const formEl = document.createElement('form');
		formEl.method = 'POST';
		formEl.action = `?/${action}`;
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
	<title>Footer Management - Moditime Admin</title>
</svelte:head>

<PageHeader title="Footer Management" description="Manage footer sections and links">
	{#snippet actions()}
		<ActionButton variant="primary" onclick={() => showAddSection = !showAddSection}>
			{showAddSection ? 'Cancel' : '+ Add Section'}
		</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="alert error">{form.error}</div>
{/if}

{#if form?.success}
	<div class="alert success">Changes saved successfully</div>
{/if}

{#if showAddSection}
	<div class="card">
		<h3>Add Footer Section</h3>
		<form method="POST" action="?/createSection" use:enhance>
			<div class="form-row">
				<div class="form-group">
					<label for="new-title">Title</label>
					<input type="text" id="new-title" name="title" required placeholder="Section title" />
				</div>
				<input type="hidden" name="position" value="999" />
				<div class="form-group">
					<label for="new-column">Column</label>
					<input type="number" id="new-column" name="column_number" value="1" min="1" max="4" />
				</div>
				<div class="form-group checkbox">
					<label><input type="checkbox" name="is_active" checked /> Active</label>
				</div>
				<div class="form-group">
					<ActionButton type="submit" variant="primary">Add</ActionButton>
				</div>
			</div>
		</form>
	</div>
{/if}

{#each data.sections as section, sectionIdx}
	<div class="card section-card">
		<!-- Section Header -->
		{#if editingSectionId === section.id}
			<form method="POST" action="?/updateSection" use:enhance class="section-edit-form">
				<input type="hidden" name="id" value={section.id} />
				<input type="text" name="title" value={section.title} class="input-sm" />
				<input type="hidden" name="position" value={section.position} />
				<label class="input-label-inline">Col:</label>
				<input type="number" name="column_number" value={section.column_number} class="input-xs" min="1" max="4" />
				<label class="checkbox-inline">
					<input type="checkbox" name="is_active" checked={section.is_active === 1} /> Active
				</label>
				<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
				<ActionButton variant="ghost" size="sm" onclick={() => editingSectionId = null}>Cancel</ActionButton>
			</form>
		{:else}
			<div class="section-header">
				<div class="section-info">
					<ReorderButtons
						itemId={section.id}
						isFirst={sectionIdx === 0}
						isLast={sectionIdx === data.sections.length - 1}
						onMoveUp={(id) => submitMove('moveSection', id, 'up')}
						onMoveDown={(id) => submitMove('moveSection', id, 'down')}
					/>
					<h3>{section.title}</h3>
					<span class="section-meta">Column {section.column_number} | #{section.position}</span>
					<span class="status-badge" class:active={section.is_active === 1}>
						{section.is_active ? 'Active' : 'Inactive'}
					</span>
				</div>
				<div class="section-actions">
					<button type="button" class="btn-link" onclick={() => editingSectionId = section.id}>Edit</button>
					<button type="button" class="btn-link" onclick={() => addingLinkSectionId = addingLinkSectionId === section.id ? null : section.id}>
						+ Link
					</button>
					<form method="POST" action="?/deleteSection" use:enhance class="inline-form">
						<input type="hidden" name="id" value={section.id} />
						<button
							type="submit"
							class="btn-link danger"
							onclick={(e) => {
								if (!confirm(`Delete section "${section.title}" and all its links?`)) {
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

		<!-- Add Link Form -->
		{#if addingLinkSectionId === section.id}
			<div class="add-link-form">
				<form method="POST" action="?/createLink" use:enhance>
					<input type="hidden" name="section_id" value={section.id} />
					<div class="form-row">
						<div class="form-group">
							<label for="link-label-{section.id}">Label</label>
							<input type="text" id="link-label-{section.id}" name="label" required placeholder="Link text" />
						</div>
						<div class="form-group">
							<label for="link-href-{section.id}">URL</label>
							<input type="text" id="link-href-{section.id}" name="href" required placeholder="/path or https://..." />
						</div>
						<input type="hidden" name="position" value="999" />
						<div class="form-group checkbox">
							<label><input type="checkbox" name="is_main_domain_only" checked /> Main Domain</label>
						</div>
						<div class="form-group">
							<ActionButton type="submit" variant="primary" size="sm">Add Link</ActionButton>
						</div>
					</div>
				</form>
			</div>
		{/if}

		<!-- Links List -->
		{#if section.links.length > 0}
			<div class="links-list">
				{#each section.links as link, linkIdx}
					<div class="link-item">
						{#if editingLinkId === link.id}
							<form method="POST" action="?/updateLink" use:enhance class="link-edit-form">
								<input type="hidden" name="id" value={link.id} />
								<input type="text" name="label" value={link.label} class="input-sm" />
								<input type="text" name="href" value={link.href} class="input-sm" />
								<input type="hidden" name="position" value={link.position} />
								<label class="checkbox-inline">
									<input type="checkbox" name="is_main_domain_only" checked={link.is_main_domain_only === 1} /> Main
								</label>
								<ActionButton type="submit" variant="primary" size="sm">Save</ActionButton>
								<ActionButton variant="ghost" size="sm" onclick={() => editingLinkId = null}>Cancel</ActionButton>
							</form>
						{:else}
							<div class="link-content">
								<ReorderButtons
									itemId={link.id}
									isFirst={linkIdx === 0}
									isLast={linkIdx === section.links.length - 1}
									onMoveUp={(id) => submitMove('moveLink', id, 'up')}
									onMoveDown={(id) => submitMove('moveLink', id, 'down')}
								/>
								<span class="link-label">{link.label}</span>
								<span class="link-href">{link.href}</span>
								<span class="link-position">#{link.position}</span>
								{#if link.is_main_domain_only}
									<span class="link-badge">Main</span>
								{/if}
								<div class="link-actions">
									<button type="button" class="btn-link" onclick={() => editingLinkId = link.id}>Edit</button>
									<form method="POST" action="?/deleteLink" use:enhance class="inline-form">
										<input type="hidden" name="id" value={link.id} />
										<button
											type="submit"
											class="btn-link danger"
											onclick={(e) => {
												if (!confirm(`Delete link "${link.label}"?`)) {
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
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-links">No links in this section</div>
		{/if}
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
		margin: 0;
	}

	.alert {
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
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

	.form-row {
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

	.form-group input[type="text"],
	.form-group input[type="number"] {
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

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.section-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.section-meta {
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.status-badge {
		font-size: 0.75rem;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		background: #fee2e2;
		color: #dc2626;
	}

	.status-badge.active {
		background: #dcfce7;
		color: #16a34a;
	}

	.section-actions {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.section-edit-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.add-link-form {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.links-list {
		margin-top: 1rem;
		border-top: 1px solid #e5e7eb;
	}

	.link-item {
		padding: 0.5rem 0;
		border-bottom: 1px solid #f3f4f6;
	}

	.link-item:last-child {
		border-bottom: none;
	}

	.link-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.25rem 0;
	}

	.link-label {
		font-weight: 500;
		min-width: 140px;
	}

	.link-href {
		color: #6b7280;
		font-size: 0.875rem;
		flex: 1;
	}

	.link-position {
		color: #9ca3af;
		font-size: 0.75rem;
	}

	.link-badge {
		font-size: 0.6875rem;
		padding: 0.125rem 0.375rem;
		border-radius: 4px;
		background: #eff6ff;
		color: #3b82f6;
	}

	.link-actions {
		display: flex;
		gap: 0.5rem;
	}

	.link-edit-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.25rem 0;
		flex-wrap: wrap;
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

	.input-label-inline {
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.checkbox-inline {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.8125rem;
		color: #374151;
	}

	.empty-links {
		margin-top: 1rem;
		padding: 0.75rem 0;
		color: #9ca3af;
		font-size: 0.875rem;
		font-style: italic;
		border-top: 1px solid #e5e7eb;
	}
</style>
