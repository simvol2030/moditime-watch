<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import FormField from '$lib/components/admin/FormField.svelte';
	import FormTextarea from '$lib/components/admin/FormTextarea.svelte';
	import FormCheckbox from '$lib/components/admin/FormCheckbox.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let loading = $state(false);

	const c = data.city;
</script>

<svelte:head>
	<title>Edit City: {c.name} - Moditime Admin</title>
</svelte:head>

<PageHeader title="Edit City" description={c.name} />

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

<form
	method="POST"
	action="?/update"
	use:enhance={() => {
		loading = true;
		return async ({ update }) => {
			loading = false;
			await update();
		};
	}}
>
	<div class="form-card">
		<h3 class="section-title">Basic Information</h3>
		<div class="form-grid">
			<FormField label="Name" name="name" value={form?.data?.name ?? c.name} required />
			<FormField label="Slug" name="slug" value={form?.data?.slug ?? c.slug} required />
		</div>
		<FormField label="Region" name="region" value={form?.data?.region ?? c.region ?? ''} />

		<h3 class="section-title">Name Declensions</h3>
		<div class="form-grid">
			<FormField label="Genitive (кого/чего)" name="name_genitive" value={form?.data?.name_genitive ?? c.name_genitive ?? ''} hint="e.g. Москвы" />
			<FormField label="Prepositional (о ком/чём)" name="name_prepositional" value={form?.data?.name_prepositional ?? c.name_prepositional ?? ''} hint="e.g. Москве" />
		</div>
		<div class="form-grid">
			<FormField label="Dative (кому/чему)" name="name_dative" value={form?.data?.name_dative ?? c.name_dative ?? ''} hint="e.g. Москве" />
			<FormField label="Accusative (кого/что)" name="name_accusative" value={form?.data?.name_accusative ?? c.name_accusative ?? ''} hint="e.g. Москву" />
		</div>

		<h3 class="section-title">Geography</h3>
		<div class="form-grid">
			<FormField label="Population" name="population" value={c.population ? String(form?.data?.population ?? c.population) : ''} type="number" />
			<FormField label="Timezone" name="timezone" value={form?.data?.timezone ?? c.timezone ?? ''} hint="e.g. Europe/Moscow" />
		</div>

		<h3 class="section-title">Delivery</h3>
		<div class="form-grid">
			<FormField label="Delivery Days" name="delivery_days" value={String(form?.data?.delivery_days ?? c.delivery_days)} type="number" />
			<FormField label="Delivery Price" name="delivery_price" value={form?.data?.delivery_price ?? c.delivery_price ?? 'Бесплатно'} />
		</div>

		<h3 class="section-title">Hero Section</h3>
		<FormField label="Hero Image URL" name="hero_image_url" value={form?.data?.hero_image_url ?? c.hero_image_url ?? ''} type="url" />
		<div class="form-grid">
			<FormField label="Hero Title" name="hero_title" value={form?.data?.hero_title ?? c.hero_title ?? ''} />
			<FormField label="Hero Subtitle" name="hero_subtitle" value={form?.data?.hero_subtitle ?? c.hero_subtitle ?? ''} />
		</div>

		<h3 class="section-title">SEO</h3>
		<FormTextarea label="Meta Description" name="meta_description" value={form?.data?.meta_description ?? c.meta_description ?? ''} rows={2} />

		<h3 class="section-title">Settings</h3>
		<FormCheckbox label="Active" name="is_active" checked={form?.data?.is_active ?? c.is_active === 1} />
		<FormField label="Priority" name="priority" value={String(form?.data?.priority ?? c.priority)} type="number" />
	</div>

	<div class="form-actions">
		<ActionButton href="/admin/cities" variant="secondary">Cancel</ActionButton>
		<ActionButton type="submit" variant="primary" disabled={loading}>
			{loading ? 'Saving...' : 'Save Changes'}
		</ActionButton>
	</div>
</form>

<!-- City Articles -->
<div class="form-card" style="margin-top: 1.5rem">
	<h3 class="section-title">City Articles ({data.articles.length})</h3>

	{#if data.articles.length > 0}
		<table class="articles-table">
			<thead>
				<tr>
					<th>Title</th>
					<th style="width: 100px">Status</th>
					<th style="width: 140px">Published</th>
				</tr>
			</thead>
			<tbody>
				{#each data.articles as article}
					<tr>
						<td>{article.title}</td>
						<td>
							<span class="status-badge" class:active={article.is_published} class:inactive={!article.is_published}>
								{article.is_published ? 'Published' : 'Draft'}
							</span>
						</td>
						<td class="date-cell">{article.published_at ? new Date(article.published_at).toLocaleDateString('ru-RU') : '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="empty-text">No articles for this city.</p>
	{/if}
</div>

<style>
	.form-card {
		background: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		margin: 1.5rem 0 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.section-title:first-child {
		margin-top: 0;
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
	}

	.error-message {
		background: #fef2f2;
		border: 1px solid #fecaca;
		color: #dc2626;
		padding: 0.75rem 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		font-size: 0.875rem;
	}

	.articles-table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1rem;
	}

	.articles-table th,
	.articles-table td {
		padding: 0.625rem 0.75rem;
		text-align: left;
		border-bottom: 1px solid #e5e7eb;
		font-size: 0.875rem;
	}

	.articles-table th {
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		font-weight: 600;
	}

	.status-badge {
		display: inline-block;
		padding: 0.25rem 0.625rem;
		border-radius: 9999px;
		font-size: 0.75rem;
		font-weight: 500;
		color: white;
	}

	.status-badge.active {
		background: #22c55e;
	}

	.status-badge.inactive {
		background: #ef4444;
	}

	.date-cell {
		color: #6b7280;
		font-size: 0.8125rem;
	}

	.empty-text {
		color: #9ca3af;
		font-size: 0.875rem;
		text-align: center;
		padding: 1rem 0;
	}
</style>
