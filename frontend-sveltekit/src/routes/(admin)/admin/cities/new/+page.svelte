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

	let nameValue = $state(form?.data?.name ?? '');

	function generateSlug(name: string): string {
		const map: Record<string, string> = {
			'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
			'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm',
			'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
			'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
			'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
		};
		return name
			.toLowerCase()
			.split('')
			.map((c) => map[c] ?? c)
			.join('')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	}
</script>

<svelte:head>
	<title>New City - Moditime Admin</title>
</svelte:head>

<PageHeader title="New City" description="Add a new delivery city" />

{#if form?.error}
	<div class="error-message">{form.error}</div>
{/if}

<form
	method="POST"
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
			<FormField
				label="Name"
				name="name"
				value={nameValue}
				required
				oninput={(e) => (nameValue = e.currentTarget.value)}
			/>
			<FormField
				label="Slug"
				name="slug"
				value={form?.data?.slug ?? generateSlug(nameValue)}
				hint="URL-friendly identifier"
				required
			/>
		</div>
		<FormField label="Region" name="region" value={form?.data?.region ?? ''} />

		<h3 class="section-title">Name Declensions</h3>
		<div class="form-grid">
			<FormField label="Genitive (кого/чего)" name="name_genitive" value={form?.data?.name_genitive ?? ''} hint="e.g. Москвы" />
			<FormField label="Prepositional (о ком/чём)" name="name_prepositional" value={form?.data?.name_prepositional ?? ''} hint="e.g. Москве" />
		</div>
		<div class="form-grid">
			<FormField label="Dative (кому/чему)" name="name_dative" value={form?.data?.name_dative ?? ''} hint="e.g. Москве" />
			<FormField label="Accusative (кого/что)" name="name_accusative" value={form?.data?.name_accusative ?? ''} hint="e.g. Москву" />
		</div>

		<h3 class="section-title">Geography</h3>
		<div class="form-grid">
			<FormField label="Population" name="population" value={form?.data?.population ? String(form.data.population) : ''} type="number" />
			<FormField label="Timezone" name="timezone" value={form?.data?.timezone ?? ''} hint="e.g. Europe/Moscow" />
		</div>

		<h3 class="section-title">Delivery</h3>
		<div class="form-grid">
			<FormField label="Delivery Days" name="delivery_days" value={String(form?.data?.delivery_days ?? 3)} type="number" />
			<FormField label="Delivery Price" name="delivery_price" value={form?.data?.delivery_price ?? 'Бесплатно'} />
		</div>

		<h3 class="section-title">Hero Section</h3>
		<FormField label="Hero Image URL" name="hero_image_url" value={form?.data?.hero_image_url ?? ''} type="url" />
		<div class="form-grid">
			<FormField label="Hero Title" name="hero_title" value={form?.data?.hero_title ?? ''} />
			<FormField label="Hero Subtitle" name="hero_subtitle" value={form?.data?.hero_subtitle ?? ''} />
		</div>

		<h3 class="section-title">SEO</h3>
		<FormTextarea label="Meta Description" name="meta_description" value={form?.data?.meta_description ?? ''} rows={2} />

		<h3 class="section-title">Settings</h3>
		<FormCheckbox label="Active" name="is_active" checked={form?.data?.is_active ?? true} />
		<FormField label="Priority" name="priority" value={String(form?.data?.priority ?? data.nextPriority)} type="number" />
	</div>

	<div class="form-actions">
		<ActionButton href="/admin/cities" variant="secondary">Cancel</ActionButton>
		<ActionButton type="submit" variant="primary" disabled={loading}>
			{loading ? 'Creating...' : 'Create City'}
		</ActionButton>
	</div>
</form>

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
</style>
