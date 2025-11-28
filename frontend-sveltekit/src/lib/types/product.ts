// Product types for Moditimewatch
// Created: 2025-01-19

export interface Product {
	id: string;
	brand: string;
	name: string;
	price: number;
	image: string;
	badge?: string;
	badgeType?: 'default' | 'gold';
}

export interface CatalogProduct extends Product {
	info: string[]; // ["Розовое золото 18К", "Калибр 4401", "Наличие: 2 шт."]
	availability: string; // "В наличии: 2 шт." или "Доставка: 5 дней"
}

export interface ProductCardProps {
	product: Product | CatalogProduct;
	variant?: 'default' | 'catalog';
	onAddToCart?: () => void;
	onViewDetails?: () => void;
}

// Product Highlights
export interface ProductHighlight {
	icon: string; // SVG или emoji
	title: string;
	description: string;
}

export interface ProductHighlightsProps {
	highlights: ProductHighlight[];
}

// Product Specs
export interface ProductSpec {
	label: string;
	value: string;
}

export interface ProductSpecGroup {
	title: string;
	specs: ProductSpec[];
}

export interface ProductSpecsProps {
	groups: ProductSpecGroup[];
}

// Product Tabs
export interface TabItem {
	id: string;
	label: string;
	content: string; // HTML content
}

export interface ProductTabsProps {
	tabs: TabItem[];
	defaultTab?: string;
}

// ========================================
// Product Page Components (product.html)
// ========================================

// Product Gallery
export interface ProductImage {
	id: string;
	src: string;
	alt: string;
	thumbnail: string;
}

export interface ProductGalleryProps {
	images: ProductImage[];
	badge?: string;
	badgeType?: 'default' | 'limited';
}

// Product Summary
export interface ProductOption {
	id: string;
	label: string;
	choices: { value: string; label: string }[];
	selected: string;
}

export interface ProductBenefit {
	id: string;
	icon: string;
	title: string;
	description: string;
}

export interface ProductSummaryProps {
	brand: string;
	name: string;
	rating: number;
	reviewsCount: number;
	sku: string;
	availability: string;
	availabilityStatus: 'in-stock' | 'pre-order' | 'waitlist';
	price: number;
	priceNote?: string;
	installment?: string;
	tradeIn?: string;
	options: ProductOption[];
	benefits: ProductBenefit[];
	tags: string[];
}

// Product Highlights (detailed version)
export interface HighlightCard {
	id: string;
	title: string;
	content: string[] | string;
	pills?: string[];
}

export interface ProductHighlightsDetailedProps {
	highlights: HighlightCard[];
}

// Product Specs (detailed version)
export interface SpecItem {
	term: string;
	definition: string;
}

export interface SpecCard {
	id: string;
	title: string;
	type: 'dl' | 'ul';
	items: SpecItem[] | string[];
}

export interface ProductSpecsDetailedProps {
	eyebrow?: string;
	title: string;
	specs: SpecCard[];
}

// Product Tabs (detailed version)
export interface ProductTab {
	id: string;
	title: string;
	content: string;
}

export interface ProductTabsDetailedProps {
	tabs: ProductTab[];
}

// Product Reviews
export interface ProductReview {
	id: string;
	author: string;
	role: string;
	rating: number;
	text: string;
	delivery: string;
}

export interface ProductReviewsProps {
	eyebrow?: string;
	title: string;
	reviews: ProductReview[];
}

// Recommendations
export interface RecommendationsProps {
	eyebrow?: string;
	title: string;
	products: Product[];
	actionText?: string;
	actionHref?: string;
}

// Product Services
export interface FaqItem {
	id: string;
	question: string;
	answer: string;
	open?: boolean;
}

export interface ServiceHighlight {
	title: string;
	description: string;
	features: string[];
	ctaText: string;
	ctaHref: string;
}

export interface ProductServicesProps {
	service: ServiceHighlight;
	faq: FaqItem[];
}
