// Types for ProductReviews component
// Created: 2025-01-19
// Purpose: Customer reviews with ratings

export interface ProductReview {
	id: string;
	author: {
		name: string;
		role?: string; // e.g., "Коллекционер", "Инвестор"
	};
	rating: number; // 1-5
	content: string;
	delivery?: string; // Delivery information
	date?: string; // ISO date string
	verified?: boolean;
	helpful?: number; // Number of helpful votes
}

export interface ProductReviewsProps {
	reviews: ProductReview[];
	title?: string;
	subtitle?: string;
	showLoadMore?: boolean;
	initialVisible?: number; // Initial number of visible reviews
}

export interface RatingDistribution {
	5: number;
	4: number;
	3: number;
	2: number;
	1: number;
}

export interface ReviewStats {
	averageRating: number;
	totalReviews: number;
	distribution: RatingDistribution;
}
