<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'ghost' | 'light';
		size?: 'small' | 'medium' | 'large';
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		children: Snippet;
		class?: string;
		disabled?: boolean;
		onclick?: (e: MouseEvent) => void;
	}

	let {
		variant = 'primary',
		size = 'medium',
		href,
		type = 'button',
		class: className,
		children,
		disabled = false,
		onclick,
		...rest
	}: Props = $props();

	const classes = $derived(
		['btn', `btn-${variant}`, `btn-${size}`, className].filter(Boolean).join(' ')
	);
</script>

{#if href}
	<a {href} class={classes} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button {type} class={classes} {disabled} {onclick} {...rest}>
		{@render children?.()}
	</button>
{/if}

<style>
	/* Base button styles */
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		font-family: var(--font-secondary, -apple-system, sans-serif);
		font-weight: 500;
		border-radius: var(--border-radius-md, 0.5rem);
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
		white-space: nowrap;
	}

	/* Variants */
	.btn-primary {
		background: var(--color-primary, #1a1a1a);
		color: var(--color-background, #ffffff);
		border-color: var(--color-primary, #1a1a1a);
	}

	.btn-primary:hover {
		background: var(--color-primary-hover, #333333);
		border-color: var(--color-primary-hover, #333333);
	}

	.btn-ghost {
		background: transparent;
		color: var(--color-text, #1a1a1a);
		border-color: var(--color-border, #e5e5e5);
	}

	.btn-ghost:hover {
		background: var(--color-surface, #f5f5f5);
		border-color: var(--color-text, #1a1a1a);
	}

	.btn-light {
		background: var(--color-surface, #f5f5f5);
		color: var(--color-text, #1a1a1a);
		border-color: transparent;
	}

	.btn-light:hover {
		background: var(--color-border, #e5e5e5);
	}

	/* Sizes */
	.btn-small {
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
	}

	.btn-medium {
		padding: 0.75rem 1.5rem;
		font-size: 1rem;
	}

	.btn-large {
		padding: 1rem 2rem;
		font-size: 1.125rem;
	}

	/* Disabled state */
	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
