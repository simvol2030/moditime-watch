// Catalog page types for Moditimewatch
// Created: 2025-01-19

import type { CatalogProduct } from './product';

// Stats for CatalogHero
export interface CatalogStat {
	label: string;
	value: string;
}

// CatalogHero component props
export interface CatalogHeroProps {
	eyebrow?: string;
	title: string;
	description: string;
	stats: CatalogStat[];
}

// CatalogInsights component
export interface CatalogInsight {
	id: string;
	title: string;
	description: string;
}

export interface CatalogInsightsProps {
	insights: CatalogInsight[];
}

// Sort options for catalog controls
export interface SortOption {
	value: string;
	label: string;
}

// Catalog controls component props
export interface CatalogControlsProps {
	totalProducts: number;
	sortOptions: SortOption[];
	currentSort?: string;
	viewMode?: 'grid' | 'list';
	onSortChange?: (value: string) => void;
	onViewChange?: (mode: 'grid' | 'list') => void;
	onFiltersToggle?: () => void;
	onFiltersReset?: () => void;
}

// Filter structure
export interface CatalogFilter {
	availability: string[];
	brands: string[];
	priceRange: { min: number; max: number };
	materials: string[];
	mechanisms: string[];
	scenarios: string[];
}

// Filter option for checkboxes
export interface FilterOption {
	value: string;
	label: string;
	checked?: boolean;
}

export interface CatalogFiltersProps {
	filters: CatalogFilter;
	brandOptions: FilterOption[];
	materialOptions: FilterOption[];
	mechanismOptions: FilterOption[];
	scenarioOptions: FilterOption[];
	availabilityOptions: FilterOption[];
	onApply?: (filters: CatalogFilter) => void;
	onClose?: () => void;
}

// Active filter chip
export interface ActiveFilter {
	id: string;
	label: string;
}

// Results component (with product grid, pagination, active filters)
export interface CatalogResultsProps {
	products: CatalogProduct[];
	totalProducts: number;
	currentPage: number;
	totalPages: number;
	shownProducts: number; // "Показано X из Y" - X value
	activeFilters: ActiveFilter[];
	onRemoveFilter?: (id: string) => void;
	onLoadMore?: () => void;
}
