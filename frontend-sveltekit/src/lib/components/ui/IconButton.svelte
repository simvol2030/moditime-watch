<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		icon: string;
		label: string; // for aria-label
		badge?: number;
	}

	let {
		icon,
		label,
		badge,
		class: className,
		...rest
	}: Props = $props();

	const classes = $derived(['icon-button', className]);
	const hasBadge = $derived(badge !== undefined && badge > 0);
</script>

<button
	class={classes}
	aria-label={label}
	data-badge={hasBadge ? badge : undefined}
	{...rest}
>
	<svg class="icon" aria-hidden="true">
		<use href={`#icon-${icon}`}></use>
	</svg>
	{#if hasBadge && badge !== undefined}
		<span class="badge">{badge > 99 ? '99+' : badge}</span>
	{/if}
</button>

<style>
	.icon-button {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--border-radius-md, 0.5rem);
		cursor: pointer;
		transition: background 0.2s ease;
		color: var(--color-text, #1a1a1a);
	}

	.icon-button:hover {
		background: var(--color-surface, #f5f5f5);
	}

	.icon {
		width: 1.5rem;
		height: 1.5rem;
		fill: currentColor;
	}

	.badge {
		position: absolute;
		top: -0.25rem;
		right: -0.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		height: 1.25rem;
		padding: 0 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-background, #ffffff);
		background: var(--color-accent, #dc2626);
		border-radius: 0.625rem;
		line-height: 1;
	}

	.icon-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.icon-button:disabled:hover {
		background: transparent;
	}
</style>
