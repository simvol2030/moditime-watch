<script lang="ts">
	interface Props {
		label: string;
		name: string;
		type?: 'text' | 'email' | 'password' | 'number' | 'url';
		value?: string | number;
		placeholder?: string;
		required?: boolean;
		error?: string;
		hint?: string;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		label,
		name,
		type = 'text',
		value = '',
		placeholder = '',
		required = false,
		error = '',
		hint = '',
		oninput
	}: Props = $props();
</script>

<div class="form-field" class:has-error={!!error}>
	<label for={name}>
		{label}
		{#if required}<span class="required">*</span>{/if}
	</label>
	<input {type} id={name} {name} {value} {placeholder} {required} {oninput} />
	{#if hint && !error}
		<span class="hint">{hint}</span>
	{/if}
	{#if error}
		<span class="error">{error}</span>
	{/if}
</div>

<style>
	.form-field {
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

	input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		font-size: 0.9375rem;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-sizing: border-box;
	}

	input:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.has-error input {
		border-color: #ef4444;
	}

	.has-error input:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.hint {
		display: block;
		margin-top: 0.375rem;
		font-size: 0.8125rem;
		color: #6b7280;
	}

	.error {
		display: block;
		margin-top: 0.375rem;
		font-size: 0.8125rem;
		color: #ef4444;
	}
</style>
