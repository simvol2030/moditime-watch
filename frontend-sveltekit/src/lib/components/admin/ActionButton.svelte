<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href?: string;
		variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
		size?: 'sm' | 'md';
		type?: 'button' | 'submit';
		disabled?: boolean;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		href,
		variant = 'primary',
		size = 'md',
		type = 'button',
		disabled = false,
		children,
		...rest
	}: Props = $props();
</script>

{#if href}
	<a {href} class="btn {variant} {size}" {...rest}>
		{@render children()}
	</a>
{:else}
	<button {type} class="btn {variant} {size}" {disabled} {...rest}>
		{@render children()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-weight: 500;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		border: none;
		font-family: inherit;
	}

	.btn.md {
		padding: 0.625rem 1rem;
		font-size: 0.875rem;
	}

	.btn.sm {
		padding: 0.375rem 0.625rem;
		font-size: 0.8125rem;
	}

	.btn.primary {
		background: #1a1a2e;
		color: white;
	}

	.btn.primary:hover:not(:disabled) {
		background: #2d2d4a;
	}

	.btn.secondary {
		background: #f3f4f6;
		color: #374151;
	}

	.btn.secondary:hover:not(:disabled) {
		background: #e5e7eb;
	}

	.btn.danger {
		background: #fee2e2;
		color: #dc2626;
	}

	.btn.danger:hover:not(:disabled) {
		background: #fecaca;
	}

	.btn.ghost {
		background: transparent;
		color: #6b7280;
	}

	.btn.ghost:hover:not(:disabled) {
		background: #f3f4f6;
		color: #374151;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
