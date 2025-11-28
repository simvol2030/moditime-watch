// Collections types for Moditimewatch

/**
 * Single collection item representing a curated watch collection
 */
export interface CollectionItem {
	/** Unique identifier for the collection */
	id: string;

	/** Image URL for the collection preview */
	image: string;

	/** Category/tag for the collection (e.g., "Для переговоров", "Для путешествий") */
	category: string;

	/** Collection title (e.g., "Executive Collection") */
	title: string;

	/** Detailed description of the collection */
	description: string;

	/** Text for the link button */
	linkText: string;

	/** URL/href for the collection link */
	linkHref: string;
}

/**
 * Props for the CollectionsSection component
 */
export interface CollectionsSectionProps {
	/** Optional eyebrow text above the title */
	eyebrow?: string;

	/** Main section title */
	title: string;

	/** Optional section description */
	description?: string;

	/** Array of collection items to display */
	collections: CollectionItem[];
}
