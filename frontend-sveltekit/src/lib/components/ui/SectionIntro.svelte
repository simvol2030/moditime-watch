<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		eyebrow?: string; // надзаголовок
		title: string;
		description?: string;
		align?: 'left' | 'center' | 'right';
	}

	let {
		eyebrow,
		title,
		description,
		align = 'left',
		class: className,
		...rest
	}: Props = $props();

	const classes = $derived([
		'section-intro',
		`section-intro--${align}`,
		className
	]);
</script>

<div class={classes} {...rest}>
	{#if eyebrow}
		<p class="section-eyebrow">{eyebrow}</p>
	{/if}

	<h2 class="section-title">{title}</h2>

	{#if description}
		<p class="section-description">{description}</p>
	{/if}
</div>

<style>
	.section-intro {
		margin-bottom: 2rem;
	}

	.section-intro--left {
		text-align: left;
	}

	.section-intro--center {
		text-align: center;
	}

	.section-intro--right {
		text-align: right;
	}

	.section-eyebrow {
		margin: 0 0 0.5rem;
		font-family: var(--font-accent, -apple-system, sans-serif);
		font-size: 0.875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-primary, #1a1a1a);
	}

	.section-title {
		margin: 0 0 1rem;
		font-family: var(--font-primary, Georgia, serif);
		font-size: 2.5rem;
		font-weight: 600;
		line-height: 1.2;
		color: var(--color-text, #1a1a1a);
	}

	.section-description {
		margin: 0;
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--color-text-soft, #666);
		max-width: 48rem;
	}

	.section-intro--center .section-description {
		margin-left: auto;
		margin-right: auto;
	}

	.section-intro--right .section-description {
		margin-left: auto;
	}

	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}

		.section-description {
			font-size: 1rem;
		}
	}
</style>
