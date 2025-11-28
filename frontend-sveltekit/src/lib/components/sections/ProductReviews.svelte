<script lang="ts">
	import type { ProductReviewsProps } from '$lib/types/reviews';

	// Props - Svelte 5 syntax
	let {
		reviews,
		title = 'Отзывы',
		subtitle = 'Истории владельцев',
		showLoadMore = false,
		initialVisible = 3
	}: ProductReviewsProps = $props();

	// State - show more reviews functionality
	let visibleCount = $state(initialVisible);

	// Derived - check if there are more reviews to show
	let hasMore = $derived(visibleCount < reviews.length);

	// Function to render stars based on rating
	function renderStars(rating: number): string {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

		return (
			'★'.repeat(fullStars) +
			(hasHalfStar ? '☆' : '') +
			'☆'.repeat(emptyStars)
		);
	}

	// Function to show more reviews
	function showMoreReviews() {
		visibleCount += 3;
	}
</script>

<!-- ============================================================ -->
<!-- COMPONENT: ProductReviews                                    -->
<!-- Purpose: Customer review cards with ratings                  -->
<!-- ============================================================ -->
<section class="product-reviews" id="reviews">
	<div class="container">
		<div class="section-intro">
			<span class="section-eyebrow">{title}</span>
			<h2 class="section-title">{subtitle}</h2>
		</div>
		<div class="reviews-grid">
			{#each reviews.slice(0, visibleCount) as review (review.id)}
				<article class="review-card">
					<header>
						<div class="review-card__author">
							<strong>{review.author.name}</strong>
							{#if review.author.role}
								<span>{review.author.role}</span>
							{/if}
						</div>
						<span
							class="review-card__rating"
							aria-label="Оценка {review.rating} из 5"
						>
							{renderStars(review.rating)}
						</span>
					</header>
					<p>{review.content}</p>
					{#if review.delivery}
						<footer>
							<span>Доставка: {review.delivery}</span>
						</footer>
					{/if}
				</article>
			{/each}
		</div>

		{#if showLoadMore && hasMore}
			<div class="reviews-load-more">
				<button class="btn btn-light" type="button" onclick={showMoreReviews}>
					Показать ещё
				</button>
			</div>
		{/if}
	</div>
</section>

<style>
	/* Reviews Grid */
	.reviews-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: var(--space-lg);
	}

	/* Review Card */
	.review-card {
		padding: var(--space-xl);
		border-radius: var(--radius-xl);
		background-color: var(--color-background);
		box-shadow: var(--shadow-xs);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);
	}

	.review-card header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.review-card__author {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
	}

	.review-card__author span {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	.review-card__rating {
		font-family: var(--font-accent);
		color: var(--color-gold);
	}

	.review-card footer {
		font-size: var(--font-size-body-sm);
		color: var(--color-text-muted);
	}

	/* Load More Button */
	.reviews-load-more {
		display: flex;
		justify-content: center;
		margin-top: var(--space-2xl);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.reviews-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 576px) {
		.review-card {
			padding: var(--space-lg);
		}
	}
</style>
