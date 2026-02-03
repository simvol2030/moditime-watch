<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let showCreate = $state(false);
	let newName = $state('');
	let newSlug = $state('');

	function generateSlug(name: string): string {
		const map: Record<string, string> = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
		return name.toLowerCase().split('').map(c => map[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}
</script>

<svelte:head><title>Article Tags - pSEO Admin</title></svelte:head>

<PageHeader title="Article Tags" description="Tags for city pSEO articles">
	{#snippet actions()}
		<ActionButton variant="primary" onclick={() => { showCreate = !showCreate; }}>
			{showCreate ? 'Cancel' : '+ New Tag'}
		</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}<div class="alert error">{form.error}</div>{/if}
{#if form?.success}<div class="alert success">Tag saved successfully</div>{/if}

{#if showCreate}
	<div class="card">
		<h3>New Tag</h3>
		<form method="POST" action="?/create" use:enhance>
			<div class="form-row">
				<label>Name <input type="text" name="name" required bind:value={newName} oninput={() => { newSlug = generateSlug(newName); }} /></label>
				<label>Slug <input type="text" name="slug" required bind:value={newSlug} /></label>
			</div>
			<ActionButton type="submit" variant="primary" size="sm">Create</ActionButton>
		</form>
	</div>
{/if}

<div class="card">
	<table>
		<thead><tr><th>Name</th><th>Slug</th><th>Actions</th></tr></thead>
		<tbody>
			{#each data.tags as tag}
				<tr>
					<td><strong>{tag.name}</strong></td>
					<td><code>{tag.slug}</code></td>
					<td>
						<form method="POST" action="?/delete" use:enhance class="inline">
							<input type="hidden" name="id" value={tag.id} />
							<ActionButton type="submit" variant="danger" size="sm">Delete</ActionButton>
						</form>
					</td>
				</tr>
			{:else}
				<tr><td colspan="3" class="empty">No tags yet</td></tr>
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
	td { padding: 0.75rem; border-bottom: 1px solid #f3f4f6; color: #374151; }
	code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 0.8125rem; }
	.empty { text-align: center; color: #9ca3af; padding: 2rem !important; }
	.form-row { display: flex; gap: 1rem; margin-bottom: 0.75rem; }
	.form-row label { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; }
	label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem; }
	input[type="text"] { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; }
	input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
	.inline { display: inline; }
</style>
