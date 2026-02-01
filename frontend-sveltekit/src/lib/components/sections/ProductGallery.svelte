<script lang="ts">
	import type { ProductGalleryProps } from '$lib/types/product';

	// Props
	let { images, badge, badgeType = 'default' }: ProductGalleryProps = $props();

	// State
	let activeImageIndex = $state(0);
	let isDragging = $state(false);
	let startX = $state(0);
	let currentX = $state(0);

	// Derived
	let activeImage = $derived(images[activeImageIndex]);
	let canGoPrev = $derived(activeImageIndex > 0);
	let canGoNext = $derived(activeImageIndex < images.length - 1);

	// Functions
	function selectImage(index: number) {
		activeImageIndex = index;
	}

	function goToPrev() {
		if (canGoPrev) {
			activeImageIndex--;
		}
	}

	function goToNext() {
		if (canGoNext) {
			activeImageIndex++;
		}
	}

	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		startX = e.touches[0].clientX;
		currentX = startX;
	}

	function handleTouchMove(e: TouchEvent) {
		if (!isDragging) return;
		currentX = e.touches[0].clientX;
	}

	function handleTouchEnd() {
		if (!isDragging) return;
		isDragging = false;

		const diff = currentX - startX;
		const threshold = 50;

		if (diff > threshold && canGoPrev) {
			goToPrev();
		} else if (diff < -threshold && canGoNext) {
			goToNext();
		}

		startX = 0;
		currentX = 0;
	}

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		startX = e.clientX;
		currentX = startX;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		currentX = e.clientX;
	}

	const FALLBACK_IMAGE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="720" viewBox="0 0 720 720"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#0a2463" stop-opacity="0.08"/><stop offset="100%" stop-color="#0a2463" stop-opacity="0.03"/></linearGradient></defs><rect width="720" height="720" fill="url(#bg)"/><circle cx="360" cy="330" r="90" stroke="#0a2463" stroke-opacity="0.15" stroke-width="4" fill="none"/><line x1="360" y1="330" x2="360" y2="280" stroke="#0a2463" stroke-opacity="0.2" stroke-width="3" stroke-linecap="round"/><line x1="360" y1="330" x2="395" y2="345" stroke="#0a2463" stroke-opacity="0.15" stroke-width="2" stroke-linecap="round"/><text x="360" y="460" text-anchor="middle" font-family="system-ui" font-size="16" fill="#0a2463" opacity="0.25">Изображение недоступно</text></svg>')}`;

	function handleImageError(e: Event) {
		const img = e.currentTarget as HTMLImageElement;
		if (!img.src.startsWith('data:')) {
			img.src = FALLBACK_IMAGE;
		}
	}

	function handleMouseUp() {
		if (!isDragging) return;
		isDragging = false;

		const diff = currentX - startX;
		const threshold = 50;

		if (diff > threshold && canGoPrev) {
			goToPrev();
		} else if (diff < -threshold && canGoNext) {
			goToNext();
		}

		startX = 0;
		currentX = 0;
	}
</script>

<div class="product-gallery" data-gallery>
	<div
		class="product-gallery__stage"
		class:is-dragging={isDragging}
		ontouchstart={handleTouchStart}
		ontouchmove={handleTouchMove}
		ontouchend={handleTouchEnd}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		role="img"
		aria-label={activeImage.alt}
	>
		<img
			src={activeImage.src}
			alt={activeImage.alt}
			width="720"
			height="720"
			data-gallery-main
			draggable="false"
			onerror={handleImageError}
		/>
		{#if badge}
			<span class="product-gallery__badge product-gallery__badge--{badgeType}">{badge}</span>
		{/if}

		<!-- Стрелки навигации -->
		{#if canGoPrev}
			<button
				class="product-gallery__arrow product-gallery__arrow--prev"
				type="button"
				aria-label="Предыдущее изображение"
				onclick={goToPrev}
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<path
						d="M15 18L9 12L15 6"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		{/if}

		{#if canGoNext}
			<button
				class="product-gallery__arrow product-gallery__arrow--next"
				type="button"
				aria-label="Следующее изображение"
				onclick={goToNext}
			>
				<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
					<path
						d="M9 18L15 12L9 6"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		{/if}

		<!-- Индикаторы -->
		<div class="product-gallery__indicators">
			{#each images as _, index}
				<button
					class="product-gallery__indicator"
					class:is-active={index === activeImageIndex}
					type="button"
					aria-label="Изображение {index + 1}"
					onclick={() => selectImage(index)}
				></button>
			{/each}
		</div>
	</div>

	<div class="product-gallery__thumbs" role="list">
		{#each images as image, index}
			<button
				class="product-gallery__thumb"
				class:is-active={index === activeImageIndex}
				type="button"
				aria-label="Изображение {index + 1}"
				onclick={() => selectImage(index)}
			>
				<img src={image.thumbnail} alt={image.alt} width="120" height="120" draggable="false" onerror={handleImageError} />
			</button>
		{/each}
	</div>
</div>

<style>
	.product-gallery {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.product-gallery__stage {
		position: relative;
		background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-background) 100%);
		border-radius: var(--radius-xl);
		overflow: hidden;
		aspect-ratio: 1;
		cursor: grab;
		user-select: none;
	}

	.product-gallery__stage.is-dragging {
		cursor: grabbing;
	}

	.product-gallery__stage img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
	}

	.product-gallery__badge {
		position: absolute;
		top: var(--space-lg);
		left: var(--space-lg);
		padding: 8px 16px;
		background-color: var(--color-primary);
		color: #fff;
		font-size: var(--font-size-body-sm);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-radius: var(--radius-pill);
		z-index: 2;
	}

	.product-gallery__badge--gold {
		background-color: var(--color-gold);
		color: var(--color-primary);
	}

	.product-gallery__badge--limited {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
	}

	/* Стрелки навигации */
	.product-gallery__arrow {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(255, 255, 255, 0.95);
		border: 1px solid var(--color-border);
		border-radius: 50%;
		cursor: pointer;
		transition: all var(--transition-fast);
		z-index: 3;
		color: var(--color-text);
	}

	body[data-theme='dark'] .product-gallery__arrow {
		background-color: rgba(22, 27, 38, 0.95);
	}

	.product-gallery__arrow:hover {
		background-color: var(--color-primary);
		color: #fff;
		border-color: var(--color-primary);
		transform: translateY(-50%) scale(1.1);
	}

	.product-gallery__arrow--prev {
		left: var(--space-md);
	}

	.product-gallery__arrow--next {
		right: var(--space-md);
	}

	/* Индикаторы */
	.product-gallery__indicators {
		position: absolute;
		bottom: var(--space-lg);
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: var(--space-xs);
		z-index: 2;
	}

	.product-gallery__indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.5);
		border: none;
		cursor: pointer;
		transition: all var(--transition-fast);
		padding: 0;
	}

	.product-gallery__indicator.is-active {
		background-color: #fff;
		width: 24px;
		border-radius: var(--radius-pill);
	}

	/* Thumbnails */
	.product-gallery__thumbs {
		display: flex;
		gap: var(--space-sm);
		overflow-x: auto;
		padding-bottom: var(--space-xs);
	}

	.product-gallery__thumbs::-webkit-scrollbar {
		height: 4px;
	}

	.product-gallery__thumbs::-webkit-scrollbar-thumb {
		background-color: var(--color-border);
		border-radius: var(--radius-pill);
	}

	.product-gallery__thumb {
		flex-shrink: 0;
		width: 80px;
		height: 80px;
		border-radius: var(--radius-md);
		overflow: hidden;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all var(--transition-fast);
		padding: 0;
		background: none;
	}

	.product-gallery__thumb img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.product-gallery__thumb:hover {
		border-color: var(--color-primary);
		opacity: 1;
	}

	.product-gallery__thumb.is-active {
		border-color: var(--color-primary);
		opacity: 1;
	}

	.product-gallery__thumb:not(.is-active) {
		opacity: 0.6;
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.product-gallery__arrow {
			width: 40px;
			height: 40px;
		}

		.product-gallery__arrow--prev {
			left: var(--space-sm);
		}

		.product-gallery__arrow--next {
			right: var(--space-sm);
		}

		.product-gallery__thumb {
			width: 60px;
			height: 60px;
		}
	}
</style>
