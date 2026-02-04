<script lang="ts">
	interface GalleryImage {
		id?: number;
		url: string;
		thumbUrl?: string;
		alt?: string;
		isMain: boolean;
	}

	interface Props {
		label: string;
		name: string;
		images?: GalleryImage[];
		entity: string;
		slug?: string;
		hint?: string;
	}

	let {
		label,
		name,
		images: initialImages = [],
		entity,
		slug = 'image',
		hint = ''
	}: Props = $props();

	let items = $state<GalleryImage[]>(initialImages.map(img => ({ ...img })));
	let uploading = $state(false);
	let error = $state('');

	// Serialize for hidden input: JSON array of { url, alt, isMain }
	const serialized = $derived(JSON.stringify(items.map(img => ({
		id: img.id,
		url: img.url,
		alt: img.alt || '',
		isMain: img.isMain
	}))));

	async function handleFileSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		uploading = true;
		error = '';

		for (const file of Array.from(files)) {
			try {
				const formData = new FormData();
				formData.append('file', file);
				formData.append('entity', entity);
				formData.append('slug', slug);

				const res = await fetch('/admin/api/upload', {
					method: 'POST',
					body: formData
				});

				const data = await res.json();

				if (!res.ok) {
					error = data.error || 'Upload failed';
					continue;
				}

				items.push({
					url: data.url,
					thumbUrl: data.thumbUrl,
					alt: '',
					isMain: items.length === 0
				});
				// Force reactivity
				items = [...items];
			} catch {
				error = 'Upload failed for one or more files';
			}
		}

		uploading = false;
		input.value = '';
	}

	function removeImage(index: number) {
		const wasMain = items[index].isMain;
		items.splice(index, 1);
		// If removed image was main, make first remaining image the main
		if (wasMain && items.length > 0) {
			items[0].isMain = true;
		}
		items = [...items];
	}

	function setMain(index: number) {
		for (let i = 0; i < items.length; i++) {
			items[i].isMain = i === index;
		}
		items = [...items];
	}

	function moveUp(index: number) {
		if (index <= 0) return;
		[items[index - 1], items[index]] = [items[index], items[index - 1]];
		items = [...items];
	}

	function moveDown(index: number) {
		if (index >= items.length - 1) return;
		[items[index], items[index + 1]] = [items[index + 1], items[index]];
		items = [...items];
	}
</script>

<div class="gallery-upload">
	<label>{label}</label>

	<!-- Hidden input with serialized gallery data -->
	<input type="hidden" {name} value={serialized} />

	{#if items.length > 0}
		<div class="gallery-grid">
			{#each items as img, i}
				<div class="gallery-item" class:is-main={img.isMain}>
					<img src={img.thumbUrl || img.url} alt={img.alt || `Image ${i + 1}`} />
					<div class="item-controls">
						<div class="item-badges">
							{#if img.isMain}
								<span class="badge main">Main</span>
							{:else}
								<button type="button" class="badge-btn" onclick={() => setMain(i)}>Set main</button>
							{/if}
						</div>
						<div class="item-actions">
							<button type="button" class="btn-sm" disabled={i === 0} onclick={() => moveUp(i)} aria-label="Move left">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
							</button>
							<button type="button" class="btn-sm" disabled={i === items.length - 1} onclick={() => moveDown(i)} aria-label="Move right">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
							</button>
							<button type="button" class="btn-sm btn-danger" onclick={() => removeImage(i)} aria-label="Remove">
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<div class="upload-area">
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
			multiple
			onchange={handleFileSelect}
			disabled={uploading}
		/>
		{#if uploading}
			<span class="status uploading">Uploading...</span>
		{/if}
	</div>

	{#if hint && !error}
		<span class="hint">{hint}</span>
	{/if}
	{#if error}
		<span class="error-msg">{error}</span>
	{/if}
</div>

<style>
	.gallery-upload {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.gallery-item {
		border: 2px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		background: #f9fafb;
	}

	.gallery-item.is-main {
		border-color: #3b82f6;
	}

	.gallery-item img {
		display: block;
		width: 100%;
		height: 120px;
		object-fit: cover;
	}

	.item-controls {
		padding: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-badges {
		text-align: center;
	}

	.badge {
		display: inline-block;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		font-weight: 600;
	}

	.badge.main {
		background: #dbeafe;
		color: #1d4ed8;
	}

	.badge-btn {
		background: none;
		border: 1px solid #d1d5db;
		color: #6b7280;
		font-size: 0.625rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		cursor: pointer;
	}

	.badge-btn:hover {
		background: #f3f4f6;
		color: #374151;
	}

	.item-actions {
		display: flex;
		justify-content: center;
		gap: 0.25rem;
	}

	.btn-sm {
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 4px;
		padding: 0.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #6b7280;
	}

	.btn-sm:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}

	.btn-sm:disabled {
		opacity: 0.3;
		cursor: default;
	}

	.btn-sm.btn-danger {
		color: #ef4444;
		border-color: #fecaca;
	}

	.btn-sm.btn-danger:hover {
		background: #fee2e2;
	}

	.upload-area {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	input[type='file'] {
		font-size: 0.875rem;
		color: #374151;
	}

	input[type='file']::file-selector-button {
		padding: 0.5rem 1rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		background: white;
		color: #374151;
		font-size: 0.8125rem;
		cursor: pointer;
		margin-right: 0.75rem;
	}

	input[type='file']::file-selector-button:hover {
		background: #f3f4f6;
	}

	.status {
		font-size: 0.8125rem;
	}

	.uploading {
		color: #3b82f6;
	}

	.hint {
		display: block;
		margin-top: 0.375rem;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.error-msg {
		display: block;
		margin-top: 0.375rem;
		font-size: 0.8125rem;
		color: #ef4444;
	}
</style>
