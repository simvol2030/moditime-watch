<script lang="ts">
	interface Props {
		label: string;
		name: string;
		checked?: boolean;
		hint?: string;
	}

	let { label, name, checked = false, hint = '' }: Props = $props();
</script>

<div class="form-field">
	<label class="checkbox-label">
		<input type="checkbox" {name} {checked} value="1" />
		<span class="checkbox-text">{label}</span>
	</label>
	{#if hint}
		<span class="hint">{hint}</span>
	{/if}
</div>

<style>
	.form-field {
		margin-bottom: 1.25rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
	}

	input[type='checkbox'] {
		width: 1.125rem;
		height: 1.125rem;
		cursor: pointer;
		accent-color: #3b82f6;
	}

	.checkbox-text {
		font-size: 0.9375rem;
		color: #374151;
	}

	.hint {
		display: block;
		margin-top: 0.375rem;
		margin-left: 1.625rem;
		font-size: 0.8125rem;
		color: #6b7280;
	}
</style>
