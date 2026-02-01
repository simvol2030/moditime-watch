<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageHeader from '$lib/components/admin/PageHeader.svelte';
	import ActionButton from '$lib/components/admin/ActionButton.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedTagIds = $state<number[]>(data.articleTags.map((t: any) => t.id));
	let selectedRelatedIds = $state<number[]>(data.related.map((r: any) => r.id));
	let mediaItems = $state(data.media.map((m: any) => ({
		media_type: m.media_type,
		url: m.url,
		alt_text: m.alt_text || '',
		caption: m.caption || ''
	})));
	let isSubmitting = $state(false);

	function toggleTag(id: number) {
		if (selectedTagIds.includes(id)) {
			selectedTagIds = selectedTagIds.filter(t => t !== id);
		} else {
			selectedTagIds = [...selectedTagIds, id];
		}
	}

	function toggleRelated(id: number) {
		if (selectedRelatedIds.includes(id)) {
			selectedRelatedIds = selectedRelatedIds.filter(r => r !== id);
		} else {
			selectedRelatedIds = [...selectedRelatedIds, id];
		}
	}

	function addMedia() {
		mediaItems = [...mediaItems, { media_type: 'image', url: '', alt_text: '', caption: '' }];
	}

	function removeMedia(index: number) {
		mediaItems = mediaItems.filter((_, i) => i !== index);
	}
</script>

<svelte:head><title>Edit: {data.article.title} - pSEO Admin</title></svelte:head>

<PageHeader title="Edit Article" description="{data.article.city_name} / {data.article.title}">
	{#snippet actions()}
		<ActionButton href="/admin/pseo?city_id={data.article.city_id}" variant="secondary">Back to List</ActionButton>
	{/snippet}
</PageHeader>

{#if form?.error}<div class="alert error">{form.error}</div>{/if}
{#if form?.success}<div class="alert success">Article saved successfully</div>{/if}

<form
	method="POST"
	action="?/update"
	use:enhance={() => {
		isSubmitting = true;
		return async ({ update }) => { isSubmitting = false; await update(); };
	}}
>
	<input type="hidden" name="city_id" value={data.article.city_id} />
	<input type="hidden" name="tag_ids" value={selectedTagIds.join(',')} />
	<input type="hidden" name="related_ids" value={selectedRelatedIds.join(',')} />
	<input type="hidden" name="media_json" value={JSON.stringify(mediaItems)} />

	<!-- Main Fields -->
	<div class="card">
		<h3>Article Details</h3>
		<div class="form-row">
			<label>City <input type="text" value="{data.article.city_name}" disabled /></label>
			<label>Template
				<select name="template_type">
					{#each ['standard', 'unique', 'variant_A', 'variant_B'] as t}
						<option value={t} selected={data.article.template_type === t}>{t}</option>
					{/each}
				</select>
			</label>
		</div>
		<label>Title <input type="text" name="title" value={data.article.title} required /></label>
		<label>Slug <input type="text" name="slug" value={data.article.slug} required /></label>
		<label>Featured Image URL <input type="text" name="image_url" value={data.article.image_url || ''} placeholder="https://..." /></label>
		<label>Excerpt <textarea name="excerpt" rows="3">{data.article.excerpt || ''}</textarea></label>
		<label>Content (HTML) <textarea name="content" rows="12">{data.article.content || ''}</textarea></label>
	</div>

	<!-- SEO -->
	<div class="card">
		<h3>SEO</h3>
		<label>Meta Title <input type="text" name="meta_title" value={data.article.meta_title || ''} placeholder="50-60 chars" /></label>
		<label>Meta Description <textarea name="meta_description" rows="2" placeholder="120-160 chars">{data.article.meta_description || ''}</textarea></label>
		<div class="form-row">
			<label>Category
				<select name="category_id">
					<option value="">No category</option>
					{#each data.categories as cat}
						<option value={cat.id} selected={data.article.category_id === cat.id}>{cat.name}</option>
					{/each}
				</select>
			</label>
			<label>Read Time (min) <input type="number" name="read_time" value={data.article.read_time || ''} min="0" /></label>
		</div>
	</div>

	<!-- Tags -->
	<div class="card">
		<h3>Tags</h3>
		<div class="tags-grid">
			{#each data.allTags as tag}
				<button type="button" class="tag-btn" class:selected={selectedTagIds.includes(tag.id)} onclick={() => toggleTag(tag.id)}>
					{tag.name}
				</button>
			{/each}
			{#if data.allTags.length === 0}
				<p class="muted">No tags. <a href="/admin/pseo/tags">Create tags first</a></p>
			{/if}
		</div>
	</div>

	<!-- Media Editor -->
	<div class="card">
		<h3>Media ({mediaItems.length})</h3>
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

	<!-- Related Articles Editor -->
	<div class="card">
		<h3>Related Articles ({selectedRelatedIds.length})</h3>
		{#if data.otherArticles.length > 0}
			<div class="related-grid">
				{#each data.otherArticles as other}
					<button type="button" class="related-btn" class:selected={selectedRelatedIds.includes(other.id)} onclick={() => toggleRelated(other.id)}>
						{other.title}
					</button>
				{/each}
			</div>
		{:else}
			<p class="muted">No other articles in this city</p>
		{/if}
	</div>

	<!-- Products (read-only list) -->
	{#if data.products.length > 0}
		<div class="card">
			<h3>Linked Products ({data.products.length})</h3>
			<div class="products-list">
				{#each data.products as product}
					<div class="product-item">
						<strong>{product.brand_name}</strong> {product.name}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Settings -->
	<div class="card">
		<h3>Settings</h3>
		<label class="check"><input type="checkbox" name="is_published" value="1" checked={data.article.is_published === 1} /> Published</label>
		<div class="meta">
			<span>Views: {data.article.views_count}</span>
			<span>Created: {data.article.created_at}</span>
			<span>Updated: {data.article.updated_at}</span>
		</div>
	</div>

	<div class="submit-bar">
		<ActionButton type="submit" variant="primary" disabled={isSubmitting}>
			{isSubmitting ? 'Saving...' : 'Save Article'}
		</ActionButton>
	</div>
</form>

<style>
	.card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 1.5rem; }
	.card h3 { margin: 0 0 1rem; font-size: 1rem; font-weight: 600; color: #1f2937; }
	.alert { padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 1rem; }
	.alert.error { background: #fee2e2; color: #dc2626; }
	.alert.success { background: #dcfce7; color: #16a34a; }
	.form-row { display: flex; gap: 1rem; margin-bottom: 0.75rem; align-items: flex-end; }
	.form-row label { flex: 1; }
	.flex-2 { flex: 2 !important; }
	label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8125rem; font-weight: 500; color: #374151; margin-bottom: 0.75rem; }
	input[type="text"], input[type="number"], select, textarea { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.875rem; width: 100%; box-sizing: border-box; }
	input:focus, select:focus, textarea:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
	input:disabled { background: #f3f4f6; color: #6b7280; }
	textarea { resize: vertical; font-family: inherit; }
	.check { flex-direction: row; align-items: center; gap: 0.5rem; }
	.tags-grid, .related-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; }
	.tag-btn, .related-btn { padding: 0.375rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; background: white; cursor: pointer; font-size: 0.8125rem; transition: all 0.15s; text-align: left; }
	.tag-btn:hover, .related-btn:hover { background: #f3f4f6; }
	.tag-btn.selected { background: #1a1a2e; color: white; border-color: #1a1a2e; }
	.related-btn.selected { background: #4338ca; color: white; border-color: #4338ca; }
	.muted { color: #9ca3af; font-size: 0.875rem; }
	.muted a { color: #3b82f6; }
	.media-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; }
	.remove-btn { background: #fee2e2; color: #dc2626; border: none; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; font-weight: bold; flex-shrink: 0; }
	.products-list { display: flex; flex-direction: column; gap: 0.5rem; }
	.product-item { padding: 0.5rem 0.75rem; background: #f9fafb; border-radius: 6px; font-size: 0.875rem; }
	.meta { display: flex; gap: 1.5rem; font-size: 0.75rem; color: #9ca3af; margin-top: 1rem; }
	.submit-bar { padding: 1rem 0; }
</style>
