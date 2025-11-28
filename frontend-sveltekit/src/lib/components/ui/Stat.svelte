<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		value: string;
	}

	let {
		label,
		value,
		class: className,
		...rest
	}: Props = $props();

	const classes = $derived(['stat', className]);
</script>

<div class={classes} {...rest}>
	<div class="stat-value">{value}</div>
	<div class="stat-label">{label}</div>
</div>

<style>
	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.stat-value {
		font-family: var(--font-primary, Georgia, serif);
		font-size: 2.5rem;
		font-weight: 600;
		line-height: 1;
		color: var(--color-text, #1a1a1a);
	}

	.stat-label {
		font-family: var(--font-secondary, -apple-system, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-soft, #666);
	}

	@media (max-width: 768px) {
		.stat-value {
			font-size: 2rem;
		}

		.stat-label {
			font-size: 0.75rem;
		}
	}
</style>
