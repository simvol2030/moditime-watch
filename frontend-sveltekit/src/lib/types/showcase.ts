/**
 * Showcase (Bestsellers) Section Types
 *
 * Types for the product showcase section component
 * Used for displaying bestseller products with horizontal scroll
 */

/**
 * Product data for display in product cards
 */
export interface Product {
	/** Unique identifier for the product */
	id: string;

	/** Brand name (e.g., "Rolex", "Patek Philippe") */
	brand: string;

	/** Product name/model */
	name: string;

	/** Formatted price with currency (e.g., "1 320 000 ₽") */
	price: string;

	/** Product image URL */
	image: string;

	/** Alt text for product image */
	imageAlt: string;

	/** Optional badge text (e.g., "New 2024", "Limited") */
	badge?: string;

	/** Badge color variant */
	badgeVariant?: 'default' | 'gold';
}

/**
 * Props for the ShowcaseSection component
 */
export interface ShowcaseSectionProps {
	/** Eyebrow text above title (e.g., "Бестселлеры") */
	eyebrow?: string;

	/** Section title (e.g., "Топ-модели недели") */
	title: string;

	/** Array of products to display */
	products: Product[];

	/** Whether to show "View All" button */
	showAllButton?: boolean;

	/** Link for "View All" button */
	showAllHref?: string;

	/** Text for "View All" button */
	showAllText?: string;
}
