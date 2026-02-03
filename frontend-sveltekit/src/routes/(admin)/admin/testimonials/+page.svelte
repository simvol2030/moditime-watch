<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import DataTable from '$lib/components/admin/DataTable.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';
	import ReorderButtons from '$lib/components/admin/ReorderButtons.svelte';

	let { data }: { data: PageData } = $props();

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

	const columns = [
		{ key: 'id', label: 'ID', width: '60px' },
		{ key: 'order', label: 'Order', width: '70px' },
		{ key: 'name', label: 'Name' },
		{ key: 'position', label: 'Position' },
		{ key: 'choice', label: 'Watch Choice' },
		{ key: 'is_active', label: 'Status', width: '100px' }
	];

	const tableData = $derived(
		data.testimonials.map((t, idx) => ({
			...t,
			_idx: idx,
			_total: data.testimonials.length,
			order: `#${t.display_order}`,
			position: t.position || '—',
			choice: t.choice || '—',
			is_active: `<span style="display: inline-block; padding: 0.25rem 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; color: white; background: ${t.is_active ? '#22c55e' : '#ef4444'}">${t.is_active ? 'Active' : 'Inactive'}</span>`
		}))
	);
</script>

<svelte:head>
	<title>Testimonials - Moditime Admin</title>
</svelte:head>

<PageHeader title="Testimonials" description="Manage client testimonials">
	{#snippet actions()}
		<ActionButton href="/admin/testimonials/new" variant="primary">+ Add Testimonial</ActionButton>
	{/snippet}
</PageHeader>

<DataTable {columns} data={tableData} emptyMessage="No testimonials found">
	{#snippet actions(item)}
		<div class="action-buttons">
			<ReorderButtons
				itemId={item.id}
				isFirst={item._idx === 0}
				isLast={item._idx === item._total - 1}
				onMoveUp={(id) => submitMove(id, 'up')}
				onMoveDown={(id) => submitMove(id, 'down')}
			/>
			<ActionButton href="/admin/testimonials/{item.id}" variant="ghost" size="sm">Edit</ActionButton>
			<form method="POST" action="?/delete" use:enhance={({ cancel }) => {
				if (!confirm('Are you sure you want to delete this testimonial?')) {
					cancel();
					return;
				}
				return async ({ update }) => {
					await update();
				};
			}}>
				<input type="hidden" name="id" value={item.id} />
				<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
			</form>
		</div>
	{/snippet}
</DataTable>

<style>
	.action-buttons {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.action-buttons form {
		margin: 0;
	}
</style>
