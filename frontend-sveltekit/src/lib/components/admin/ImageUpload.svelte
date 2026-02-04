<script lang="ts">
	interface Props {
		label: string;
		name: string;
		value?: string;
		entity: string;
		slug?: string;
		hint?: string;
		required?: boolean;
	}

	let {
		label,
		name,
		value = '',
		entity,
		slug = 'image',
		hint = '',
		required = false
	}: Props = $props();

	let currentUrl = $state(value);
	let uploading = $state(false);
	let error = $state('');
	let fileInput: HTMLInputElement;

	async function handleFileSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;
		error = '';

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
				return;
			}

			currentUrl = data.url;
		} catch {
			error = 'Upload failed. Please try again.';
		} finally {
			uploading = false;
		}
	}

	function clearImage() {
		currentUrl = '';
		if (fileInput) fileInput.value = '';
	}
</script>

<div class="image-upload">
	<label for="{name}-file">
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>

	<!-- Hidden input that holds the URL value for form submission -->
	<input type="hidden" {name} value={currentUrl} />

	{#if currentUrl}
		<div class="preview">
			<img src={currentUrl} alt="Preview" />
			<div class="preview-actions">
				<span class="preview-url">{currentUrl}</span>
				<button type="button" class="btn-remove" onclick={clearImage}>Remove</button>
			</div>
		</div>
	{/if}

	<div class="upload-area">
		<input
			type="file"
			id="{name}-file"
			accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
			onchange={handleFileSelect}
			bind:this={fileInput}
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
	.image-upload {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-weight: 500;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.required {
		color: #ef4444;
	}

	.preview {
		margin-bottom: 0.75rem;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		background: #f9fafb;
	}

	.preview img {
		display: block;
		max-width: 100%;
		max-height: 200px;
		object-fit: contain;
		margin: 0 auto;
		padding: 0.5rem;
	}

	.preview-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid #e5e7eb;
		background: white;
	}

	.preview-url {
		font-size: 0.75rem;
		color: #6b7280;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 70%;
	}

	.btn-remove {
		background: none;
		border: 1px solid #ef4444;
		color: #ef4444;
		font-size: 0.75rem;
		padding: 0.25rem 0.625rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.btn-remove:hover {
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
