<script lang="ts">
	import type { EditorialSectionProps } from '$lib/types/editorial';

	// Props
	let { eyebrow, title, articles }: EditorialSectionProps = $props();

	// State для scroll контейнера
	let scrollContainer: HTMLDivElement;

	// Функция для скролла влево
	function scrollPrev() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: -480, behavior: 'smooth' });
		}
	}

	// Функция для скролла вправо
	function scrollNext() {
		if (scrollContainer) {
			scrollContainer.scrollBy({ left: 480, behavior: 'smooth' });
		}
	}
</script>

<section class="editorial" id="editorial">
	<div class="container">
		<div class="section-intro">
			<span class="section-eyebrow">{eyebrow || 'Журнал'}</span>
			<h2 class="section-title">{title}</h2>
		</div>
		<div class="scroll-row" data-scroll-scope>
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
				{#each articles as article (article.id)}
					<article class="editorial-card scroll-item">
						<div class="editorial-card__media">
							<img src={article.image} alt={article.title} width="420" height="280" />
							<span class="editorial-card__tag">{article.tag}</span>
						</div>
						<div class="editorial-card__body">
							<h3>{article.title}</h3>
							<p>{article.description}</p>
							<a href={article.link} class="editorial-card__link">{article.linkText}</a>
						</div>
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
	/* Editorial Card */
	.editorial-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		background-color: var(--color-background);
		border-radius: var(--radius-xl);
		overflow: hidden;
		box-shadow: var(--shadow-xs);
		min-height: 100%;
	}

	.editorial-card__media {
		position: relative;
	}

	.editorial-card__media img {
		width: 100%;
		height: auto;
		display: block;
	}

	.editorial-card__tag {
		position: absolute;
		bottom: var(--space-md);
		left: var(--space-md);
		padding: 6px 12px;
		border-radius: var(--radius-pill);
		/* Адаптация под проект Moditimewatch - золотой бейдж */
		background-color: rgba(212, 175, 55, 0.95); /* Gold #D4AF37 */
		color: #0a0c12; /* Тёмный текст для контраста */
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.18em;
	}

	.editorial-card__body {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
		padding: 0 var(--space-xl) var(--space-xl);
	}

	.editorial-card__body h3 {
		font-size: var(--font-size-h5);
		line-height: var(--line-height-tight);
		color: var(--color-text);
	}

	.editorial-card__body p {
		font-size: var(--font-size-body);
		line-height: var(--line-height-relaxed);
		color: var(--color-text-soft);
	}

	.editorial-card__link {
		color: var(--color-primary);
		font-weight: 600;
		text-decoration: none;
		transition: opacity var(--transition-fast);
	}

	.editorial-card__link:hover {
		opacity: 0.8;
	}

	/* Scroll Row */
	.scroll-row {
		position: relative;
	}

	.scroll-row__inner {
		display: grid;
		grid-auto-flow: column;
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

	.scroll-row__control {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		backdrop-filter: blur(12px);
		background-color: rgba(255, 255, 255, 0.85);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-sm);
	}

	body[data-theme='dark'] .scroll-row__control {
		background-color: rgba(15, 18, 27, 0.85);
	}

	.scroll-row__control--prev {
		left: -12px;
	}

	.scroll-row__control--next {
		right: -12px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.scroll-row__control {
			display: none;
		}

		.scroll-row__inner--wide {
			grid-auto-columns: minmax(260px, 340px);
		}
	}
</style>
