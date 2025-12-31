<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormSelect from '$lib/components/admin/FormSelect.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	const admin = $derived(form?.data ?? data.adminUser);

	const roleOptions = [
		{ value: 'super-admin', label: 'Super Admin' },
		{ value: 'editor', label: 'Editor' },
		{ value: 'viewer', label: 'Viewer' }
	];
</script>

<svelte:head>
	<title>Edit {data.adminUser.name} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit Admin" description={data.adminUser.email}>
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
				value={admin.name}
				required
				placeholder="Full name"
			/>

			<FormField
				label="Email"
				name="email"
				type="email"
				value={admin.email}
				required
				placeholder="admin@example.com"
			/>
		</div>

		<div class="form-grid">
			<FormField
				label="New Password"
				name="password"
				type="password"
				placeholder="Leave empty to keep current"
				hint="Minimum 8 characters. Leave empty to keep current password."
			/>

			<FormSelect
				label="Role"
				name="role"
				options={roleOptions}
				value={admin.role}
				required
			/>
		</div>

		<div class="form-actions">
			<ActionButton href="/admin/system/admins" variant="secondary">Cancel</ActionButton>
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
