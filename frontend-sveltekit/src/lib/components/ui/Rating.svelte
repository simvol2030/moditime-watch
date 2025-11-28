<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: number; // 0-5
		count?: number; // количество отзывов
		showValue?: boolean;
	}

	let {
		value,
		count,
		showValue = true,
		class: className,
		...rest
	}: Props = $props();

	const classes = $derived(['rating', className]);
	const stars = $derived(Array.from({ length: 5 }, (_, i) => i + 1));
	const filled = $derived(Math.floor(value));
	const hasHalf = $derived(value % 1 >= 0.5);
</script>

<div class={classes} {...rest}>
	<div class="rating-stars" aria-label="Оценка {value} из 5">
		{#each stars as star}
			<svg
				class="star"
				class:filled={star <= filled}
				class:half={star === filled + 1 && hasHalf}
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				{#if star <= filled}
					<!-- Filled star -->
					<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
				{:else if star === filled + 1 && hasHalf}
					<!-- Half star -->
					<defs>
						<linearGradient id="half-{star}">
							<stop offset="50%" stop-color="currentColor"/>
							<stop offset="50%" stop-color="transparent"/>
						</linearGradient>
					</defs>
					<path fill="url(#half-{star})" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
					<path fill="none" stroke="currentColor" stroke-width="1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
				{:else}
					<!-- Empty star -->
					<path fill="none" stroke="currentColor" stroke-width="1" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
				{/if}
			</svg>
		{/each}
	</div>

	{#if showValue && value !== undefined}
		<span class="rating-value">{value.toFixed(1)}</span>
	{/if}

	{#if count !== undefined}
		<span class="rating-count">({count} {count === 1 ? 'отзыв' : 'отзывов'})</span>
	{/if}
</div>

<style>
	.rating {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.rating-stars {
		display: flex;
		gap: 0.125rem;
	}

	.star {
		width: 1.25rem;
		height: 1.25rem;
		color: var(--color-border, #e5e5e5);
		transition: color 0.2s ease;
	}

	.star.filled {
		color: var(--color-star, #fbbf24);
		fill: currentColor;
	}

	.star.half {
		color: var(--color-star, #fbbf24);
	}

	.rating-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text, #1a1a1a);
	}

	.rating-count {
		font-size: 0.875rem;
		color: var(--color-text-soft, #666);
	}
</style>
