<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'default' | 'primary';
		selected?: boolean;
		removable?: boolean;
		onremove?: (e: MouseEvent) => void;
		children: Snippet;
	}

	let {
		variant = 'default',
		selected = false,
		removable = false,
		onremove,
		class: className,
		children,
		...rest
	}: Props = $props();

	const classes = $derived([
		'chip',
		`chip-${variant}`,
		{ selected },
		className
	]);

	function handleRemove(e: MouseEvent) {
		e.stopPropagation();
		onremove?.(e);
	}
</script>

<button class={classes} aria-pressed={selected} {...rest}>
	<span class="chip-content">
		{@render children?.()}
	</span>
	{#if removable}
		<button
			class="chip-remove"
			onclick={handleRemove}
			aria-label="Удалить"
			type="button"
		>
			<svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
				<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
			</svg>
		</button>
	{/if}
</button>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-family: var(--font-secondary, -apple-system, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		border: 1px solid var(--color-border, #e5e5e5);
		border-radius: 2rem;
		background: var(--color-background, #ffffff);
		color: var(--color-text, #1a1a1a);
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.chip:hover {
		border-color: var(--color-text, #1a1a1a);
		background: var(--color-surface, #f5f5f5);
	}

	.chip-primary {
		border-color: var(--color-primary, #1a1a1a);
		background: var(--color-primary, #1a1a1a);
		color: var(--color-background, #ffffff);
	}

	.chip-primary:hover {
		background: var(--color-primary-hover, #333333);
	}

	.chip.selected {
		border-color: var(--color-primary, #1a1a1a);
		background: var(--color-primary, #1a1a1a);
		color: var(--color-background, #ffffff);
	}

	.chip-content {
		line-height: 1;
	}

	.chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
		padding: 0;
		margin-left: -0.25rem;
		background: transparent;
		border: none;
		border-radius: 50%;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.chip-remove:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	.chip-primary .chip-remove:hover,
	.chip.selected .chip-remove:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.chip-remove .icon {
		width: 0.875rem;
		height: 0.875rem;
		fill: currentColor;
	}

	.chip:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.chip:disabled:hover {
		border-color: var(--color-border, #e5e5e5);
		background: var(--color-background, #ffffff);
	}
</style>
