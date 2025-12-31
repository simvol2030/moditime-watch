<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data }: { data: PageData } = $props();

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	const roleColors: Record<string, string> = {
		'super-admin': '#dc2626',
		editor: '#3b82f6',
		viewer: '#6b7280'
	};

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'name', label: 'Name' },
		{ key: 'email', label: 'Email' },
		{ key: 'role', label: 'Role', width: '120px' },
		{ key: 'created_at', label: 'Created', width: '120px' }
	];

	const tableData = $derived(
		data.admins.map((admin) => ({
			...admin,
			created_at: formatDate(admin.created_at),
			role: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${roleColors[admin.role] || '#6b7280'}">${admin.role}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Admins - Moditime Admin</title>
</svelte:head>

<PageHeader title="Admin Users" description="Manage administrator accounts">
	{#snippet actions()}
		{#if data.canManage}
			<ActionButton href="/admin/system/admins/new" variant="primary">+ Add Admin</ActionButton>
		{/if}
	{/snippet}
</PageHeader>

{#if !data.canManage}
	<div class="access-denied">
		<p>You don't have permission to manage admin users. Only super-admins can access this page.</p>
	</div>
{:else}
	<DataTable columns={columns} data={tableData} emptyMessage="No admins found">
		{#snippet actions(item)}
			<div class="action-buttons">
				<ActionButton href="/admin/system/admins/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						return async ({ update }) => {
							if (confirm('Are you sure you want to delete this admin?')) {
								await update();
							}
						};
					}}
				>
					<input type="hidden" name="id" value={item.id} />
					<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
				</form>
			</div>
		{/snippet}
	</DataTable>
{/if}

<style>
	.access-denied {
		background: #fef3c7;
		border: 1px solid #f59e0b;
		color: #92400e;
		padding: 1rem;
		border-radius: 8px;
	}

	.action-buttons {
		display: flex;
		gap: 0.5rem;
	}

	.action-buttons form {
		margin: 0;
	}
</style>
