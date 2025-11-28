// Types for Recommendations component
// Created: 2025-01-19
// Purpose: Recommended products section (reuses ProductCard)

import type { CatalogProduct } from './product';

export interface RecommendationsProps {
	title?: string;
	subtitle?: string;
	products: CatalogProduct[];
	showCatalogButton?: boolean;
	catalogButtonText?: string;
	catalogButtonHref?: string;
}
