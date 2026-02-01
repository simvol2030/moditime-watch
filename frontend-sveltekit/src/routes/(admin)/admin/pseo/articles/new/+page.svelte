<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let title = $state('');
	let slug = $state('');
	let selectedTagIds = $state<number[]>([]);
	let mediaItems = $state<{ media_type: string; url: string; alt_text: string; caption: string }[]>([]);
	let isSubmitting = $state(false);

	// Cyrillic → Latin slug generator
	function generateSlug(text: string): string {
		const map: Record<string, string> = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'c','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
		return text.toLowerCase().split('').map(c => map[c] ?? c).join('').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
	}

	function toggleTag(id: number) {
		if (selectedTagIds.includes(id)) {
			selectedTagIds = selectedTagIds.filter(t => t !== id);
		} else {
			selectedTagIds = [...selectedTagIds, id];
		}
	}

	function addMedia() {
		mediaItems = [...mediaItems, { media_type: 'image', url: '', alt_text: '', caption: '' }];
	}

	function removeMedia(index: number) {
		mediaItems = mediaItems.filter((_, i) => i !== index);
	}
</script>

<svelte:head><title>New Article - pSEO Admin</title></svelte:head>

<PageHeader title="New Article" description={data.city ? `City: ${data.city.name}` : 'Select a city'}>
	{#snippet actions()}
		<ActionButton href="/admin/pseo{data.cityId ? `?city_id=${data.cityId}` : ''}" variant="secondary">Back</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}<div class="alert error">{form.error}</div>{/if}

<form
	method="POST"
	use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => { isSubmitting = false; await update(); };
	}}
>
	<input type="hidden" name="tag_ids" value={selectedTagIds.join(',')} />
	<input type="hidden" name="media_json" value={JSON.stringify(mediaItems)} />

	<!-- Main Fields -->
	<div class="card">
		<h3>Article Details</h3>
		<div class="form-row">
			<label>City
				<select name="city_id" required>
					<option value="">Select city...</option>
					{#each data.cities as city}
						<option value={city.id} selected={data.cityId === city.id}>{city.name}</option>
					{/each}
				</select>
			</label>
			<label>Template
				<select name="template_type">
					<option value="standard">Standard</option>
					<option value="unique">Unique</option>
					<option value="variant_A">Variant A</option>
					<option value="variant_B">Variant B</option>
				</select>
			</label>
		</div>
		<label>Title <input type="text" name="title" required bind:value={title} oninput={() => { slug = generateSlug(title); }} /></label>
		<label>Slug <input type="text" name="slug" required bind:value={slug} /></label>
		<label>Featured Image URL <input type="text" name="image_url" placeholder="https://..." /></label>
		<label>Excerpt <textarea name="excerpt" rows="3" placeholder="Short description..."></textarea></label>
		<label>Content (HTML) <textarea name="content" rows="12" placeholder="<h2>...</h2><p>...</p>"></textarea></label>
	</div>

	<!-- SEO -->
	<div class="card">
		<h3>SEO</h3>
		<label>Meta Title <input type="text" name="meta_title" placeholder="SEO title (50-60 chars)" /></label>
		<label>Meta Description <textarea name="meta_description" rows="2" placeholder="SEO description (120-160 chars)"></textarea></label>
		<div class="form-row">
			<label>Category
				<select name="category_id">
					<option value="">No category</option>
					{#each data.categories as cat}
						<option value={cat.id}>{cat.name}</option>
					{/each}
				</select>
			</label>
			<label>Read Time (min) <input type="number" name="read_time" min="0" placeholder="5" /></label>
		</div>
	</div>

	<!-- Tags -->
	<div class="card">
		<h3>Tags</h3>
		<div class="tags-grid">
			{#each data.tags as tag}
				<button type="button" class="tag-btn" class:selected={selectedTagIds.includes(tag.id)} onclick={() => toggleTag(tag.id)}>
					{tag.name}
				</button>
			{/each}
			{#if data.tags.length === 0}
				<p class="muted">No tags. <a href="/admin/pseo/tags">Create tags first</a></p>
			{/if}
		</div>
	</div>

	<!-- Media -->
	<div class="card">
		<h3>Media</h3>
		{#each mediaItems as item, i}
			<div class="media-item">
				<div class="form-row">
					<label>Type
						<select bind:value={item.media_type}>
							<option value="image">Image</option>
							<option value="video">Video</option>
						</select>
					</label>
					<label class="flex-2">URL <input type="text" bind:value={item.url} placeholder={item.media_type === 'video' ? 'YouTube Video ID' : 'https://...'} /></label>
					<button type="button" class="remove-btn" onclick={() => removeMedia(i)}>x</button>
				</div>
				<div class="form-row">
					<label>Alt Text <input type="text" bind:value={item.alt_text} /></label>
					<label>Caption <input type="text" bind:value={item.caption} /></label>
				</div>
			</div>
		{/each}
		<ActionButton type="button" variant="secondary" size="sm" onclick={addMedia}>+ Add Media</ActionButton>
	</div>

	<!-- Settings -->
	<div class="card">
		<h3>Settings</h3>
		<label class="check"><input type="checkbox" name="is_published" value="1" checked /> Published</label>
	</div>

	<div class="submit-bar">
		<ActionButton type="submit" variant="primary" disabled={isSubmitting}>
			{isSubmitting ? 'Creating...' : 'Create Article'}
		</ActionButton>
	</div>
</form>

<style>
	.card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
	.card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #1f2937; }
	.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
	.alert.error { background: #fee2e2; color: #dc2626; }
	.form-row { display: flex; gap: 1rem; margin-bottom: 0.75rem; align-items: flex-end; }
	.form-row label { flex: 1; }
	.flex-2 { flex: 2 !important; }
	label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem; }
	input[type="text"], input[type="number"], select, textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; width: 100%; box-sizing: border-box; }
	input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
	textarea { resize: vertical; font-family: inherit; }
	.check { flex-direction: row; align-items: center; gap: 0.5rem; }
	.tags-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tag-btn { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 0.8125rem; transition: all 0.15s; }
	.tag-btn:hover { background: #f3f4f6; }
	.tag-btn.selected { background: #1a1a2e; color: white; border-color: #1a1a2e; }
	.muted { color: #9ca3af; font-size: 0.875rem; }
	.muted a { color: #3b82f6; }
	.media-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
	.remove-btn { background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; font-weight: bold; flex-shrink: 0; }
	.submit-bar { padding: 1rem 0; }
</style>
