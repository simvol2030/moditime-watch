<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let {
		class: className,
		children,
		...rest
	}: Props = $props();

	const classes = $derived(['container', className]);
</script>

<div class={classes} {...rest}>
	{@render children?.()}
</div>

<style>
	.container {
		width: 100%;
		max-width: var(--container-max, 1280px);
		margin-left: auto;
		margin-right: auto;
		padding-left: var(--container-padding, 1.5rem);
		padding-right: var(--container-padding, 1.5rem);
	}

	@media (min-width: 640px) {
		.container {
			padding-left: var(--container-padding-sm, 2rem);
			padding-right: var(--container-padding-sm, 2rem);
		}
	}

	@media (min-width: 1024px) {
		.container {
			padding-left: var(--container-padding-lg, 3rem);
			padding-right: var(--container-padding-lg, 3rem);
		}
	}
</style>
