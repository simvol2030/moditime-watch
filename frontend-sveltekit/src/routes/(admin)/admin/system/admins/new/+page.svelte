<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { form }: { form: ActionData } = $props();
	let loading = $state(false);

	const roleOptions = [
		{ value: 'super-admin', label: 'Super Admin' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'viewer', label: 'Viewer' }
	];
</script>

<svelte:head>
	<title>Add Admin - Moditime Admin</title>
</svelte:head>

<PageHeader title="Add Admin" description="Create a new administrator account">
	{#snippet actions()}
		<ActionButton href="/admin/system/admins" variant="secondary">Cancel</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}
	<div class="error-message">{form.error}</div>
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
				label="Name"
				name="name"
				value={form?.data?.name ?? ''}
				required
				placeholder="Full name"
			/>

			<FormField
				label="Email"
				name="email"
				type="email"
				value={form?.data?.email ?? ''}
				required
				placeholder="admin@example.com"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="Password"
				name="password"
				type="password"
				required
				placeholder="Minimum 8 characters"
				hint="Password will be hashed with bcrypt"
			/>

			<FormSelect
				label="Role"
				name="role"
				options={roleOptions}
				value={form?.data?.role ?? 'viewer'}
				required
			/>
		</div>

		<div class="role-info">
			<h4>Role Permissions:</h4>
			<ul>
				<li><strong>Super Admin:</strong> Full access - can create, edit, delete everything including other admins</li>
				<li><strong>Editor:</strong> Can create and edit content, but cannot delete or manage admins</li>
				<li><strong>Viewer:</strong> Read-only access to view data</li>
			</ul>
		</div>

		<div class="form-actions">
			<ActionButton href="/admin/system/admins" variant="secondary">Cancel</ActionButton>
			<ActionButton type="submit" variant="primary" disabled={loading}>
				{loading ? 'Creating...' : 'Create Admin'}
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

	.role-info {
		margin-top: 1.5rem;
		padding: 1rem;
		background: #f9fafb;
		border-radius: 8px;
	}

	.role-info h4 {
		margin: 0 0 0.5rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.role-info ul {
		margin: 0;
		padding-left: 1.25rem;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.role-info li {
		margin-bottom: 0.25rem;
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
</style>
