<script lang="ts">
	import type { TestimonialsSectionProps } from '$lib/types/testimonials';

	// Props using Svelte 5 runes syntax
	let {
		eyebrow = 'Отзывы клиентов',
		title,
		description,
		testimonials
	}: TestimonialsSectionProps = $props();

	// Reference to scroll container
	let scrollContainer: HTMLDivElement;

	// Scroll navigation functions
	function scrollPrev() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -480, behavior: 'smooth' });
		}
	}

	function scrollNext() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: 480, behavior: 'smooth' });
		}
	}
</script>

<section class="testimonials">
	<div class="container">
		<div class="section-intro center">
			<span class="section-eyebrow">{eyebrow}</span>
			<h2 class="section-title">{title}</h2>
			{#if description}
				<p class="section-description">{description}</p>
			{/if}
		</div>
		<div class="testimonials__carousel scroll-row" data-scroll-scope>
			<button
				class="icon-button scroll-row__control scroll-row__control--prev"
				type="button"
				data-scroll-prev
				aria-label="Скроллить влево"
				onclick={scrollPrev}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M11 4L7 9L11 14"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
			<div
				class="scroll-row__inner scroll-row__inner--wide"
				data-scroll-container
				bind:this={scrollContainer}
			>
				{#each testimonials as testimonial (testimonial.id)}
					<article class="testimonial-card scroll-item">
						<header>
							<div class="testimonial-card__avatar">
								<img
									src={testimonial.avatar}
									alt={testimonial.name}
									width="64"
									height="64"
								/>
							</div>
							<div>
								<h3>{testimonial.name}</h3>
								<p>{testimonial.position}</p>
							</div>
						</header>
						<p class="testimonial-card__text">{testimonial.text}</p>
						<footer>
							<span>Выбор: {testimonial.choice}</span>
						</footer>
					</article>
				{/each}
			</div>
			<button
				class="icon-button scroll-row__control scroll-row__control--next"
				type="button"
				data-scroll-next
				aria-label="Скроллить вправо"
				onclick={scrollNext}
			>
				<svg
					width="18"
					height="18"
					viewBox="0 0 18 18"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M7 4L11 9L7 14"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</div>
</section>

<style>
	/* ===================================
	   TESTIMONIALS SECTION STYLES
	   ================================= */

	/* Section Container */
	.testimonials {
		padding: var(--space-4xl) 0;
		background-color: var(--color-background);
	}

	/* Carousel Container */
	.testimonials__carousel {
		margin-top: var(--space-xl);
	}

	/* ===================================
	   TESTIMONIAL CARD STYLES
	   ================================= */

	.testimonial-card {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
		min-width: 320px;
		transition: all var(--transition-normal);
	}

	.testimonial-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-4px);
	}

	/* Card Header (Avatar + Name) */
	.testimonial-card header {
		display: flex;
		align-items: center;
		gap: var(--space-md);
	}

	.testimonial-card__avatar {
		width: 64px;
		height: 64px;
		border-radius: var(--radius-pill);
		overflow: hidden;
		flex-shrink: 0;
	}

	.testimonial-card__avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.testimonial-card header h3 {
		font-size: var(--font-size-body-lg);
		font-weight: 600;
		color: var(--color-text);
		margin: 0;
	}

	.testimonial-card header p {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
		margin: 4px 0 0 0;
	}

	/* Card Text (Testimonial Quote) */
	.testimonial-card__text {
		font-size: var(--font-size-body-lg);
		line-height: var(--line-height-relaxed);
		color: var(--color-text);
		font-style: italic;
		margin: 0;
	}

	/* Card Footer (Watch Choice) */
	.testimonial-card footer {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
		margin-top: auto;
		padding-top: var(--space-md);
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}

	body[data-theme='dark'] .testimonial-card footer {
		border-top-color: rgba(255, 255, 255, 0.06);
	}

	.testimonial-card footer span {
		font-weight: 500;
	}

	/* ===================================
	   SCROLL ROW SYSTEM STYLES
	   ================================= */

	.scroll-row {
		position: relative;
	}

	.scroll-row__inner {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(240px, 320px);
		gap: var(--space-lg);
		overflow-x: auto;
		padding-bottom: 8px;
		scroll-snap-type: x mandatory;
		cursor: grab;
		touch-action: pan-y;
	}

	.scroll-row__inner--wide {
		grid-auto-columns: minmax(280px, 420px);
	}

	.scroll-row__inner::-webkit-scrollbar {
		display: none;
	}

	.scroll-row__inner.is-dragging {
		cursor: grabbing;
		user-select: none;
	}

	.scroll-item {
		scroll-snap-align: start;
	}

	/* Scroll Control Buttons */
	.scroll-row__control {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		backdrop-filter: blur(12px);
		background-color: rgba(255, 255, 255, 0.85);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-fast);
	}

	.scroll-row__control:hover {
		background-color: rgba(255, 255, 255, 0.95);
		box-shadow: var(--shadow-md);
	}

	body[data-theme='dark'] .scroll-row__control {
		background-color: rgba(15, 18, 27, 0.85);
	}

	body[data-theme='dark'] .scroll-row__control:hover {
		background-color: rgba(15, 18, 27, 0.95);
	}

	.scroll-row__control--prev {
		left: -12px;
	}

	.scroll-row__control--next {
		right: -12px;
	}

	/* ===================================
	   RESPONSIVE STYLES
	   ================================= */

	@media (max-width: 768px) {
		.testimonials {
			padding: var(--space-3xl) 0;
		}

		.testimonial-card {
			min-width: 280px;
		}

		/* Hide scroll controls on mobile for better UX */
		.scroll-row__control {
			display: none;
		}
	}

	@media (min-width: 1024px) {
		.scroll-row__inner--wide {
			grid-auto-columns: minmax(320px, 480px);
		}
	}
</style>
