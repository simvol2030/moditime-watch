import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/database';
import type { CatalogProduct } from '$lib/types/product';

// Constants for search limits
const SEARCH_RESULTS_LIMIT = 24;
const MAX_SEARCH_TERMS = 10;
const MIN_WORD_LENGTH = 2;

/**
 * Comprehensive FTS5 query sanitization
 * Removes all FTS5 special characters and operators to prevent query manipulation
 */
function sanitizeFtsQuery(input: string): string {
	// Remove all FTS5 special characters and operators
	const sanitized = input
		.replace(/[*:"(){}^\\[\]<>]/g, '') // Remove special FTS5 chars
		.replace(/\b(AND|OR|NOT|NEAR)\b/gi, '') // Remove FTS5 operators
		.replace(/-+/g, ' ') // Replace hyphens with spaces
		.trim();

	if (!sanitized) return '';

	// Split and wrap each word safely
	return sanitized
		.split(/\s+/)
		.filter((word) => word.length >= MIN_WORD_LENGTH) // Minimum word length
		.slice(0, MAX_SEARCH_TERMS) // Limit number of search terms
		.map((word) => `"${word.replace(/"/g, '')}"*`) // Escape any remaining quotes
		.join(' OR ');
}

interface DbSearchResult {
	id: number;
	slug: string;
	name: string;
	brand_id: number;
	brand_name: string;
	brand_slug: string;
	price: number;
	availability_status: string;
	availability_text: string | null;
	is_new: number;
	is_limited: number;
	is_featured: number;
	main_image: string | null;
}

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim() || '';

	if (!query) {
		return {
			query: '',
			results: [] as CatalogProduct[],
			totalResults: 0,
			searched: false
		};
	}

	// Use FTS5 for search (with safe query sanitization)
	const searchSql = `
		SELECT
			p.id, p.slug, p.name, p.brand_id,
			b.name as brand_name, b.slug as brand_slug,
			p.price, p.availability_status, p.availability_text,
			p.is_new, p.is_limited, p.is_featured,
			(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image
		FROM products_fts fts
		JOIN products p ON p.id = fts.rowid
		JOIN brands b ON b.id = p.brand_id
		WHERE products_fts MATCH ?
		AND p.is_active = 1
		ORDER BY bm25(products_fts) DESC
		LIMIT ?
	`;

	// Try FTS first, fallback to LIKE if FTS fails
	let searchResults: DbSearchResult[] = [];

	try {
		// Use comprehensive sanitization function
		const ftsQuery = sanitizeFtsQuery(query);

		if (ftsQuery) {
			searchResults = db.prepare(searchSql).all(ftsQuery, SEARCH_RESULTS_LIMIT) as DbSearchResult[];
		}
	} catch (error) {
		// Log FTS error for debugging (only in development)
		if (process.env.NODE_ENV === 'development') {
			console.warn('FTS5 search failed, falling back to LIKE:', error);
		}

		// FTS failed, fallback to LIKE search with sanitized input
		const likeSql = `
			SELECT
				p.id, p.slug, p.name, p.brand_id,
				b.name as brand_name, b.slug as brand_slug,
				p.price, p.availability_status, p.availability_text,
				p.is_new, p.is_limited, p.is_featured,
				(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image
			FROM products p
			JOIN brands b ON b.id = p.brand_id
			WHERE p.is_active = 1
			AND (
				p.name LIKE ? OR
				b.name LIKE ? OR
				p.description LIKE ?
			)
			ORDER BY p.is_featured DESC, p.position
			LIMIT ?
		`;

		// Sanitize LIKE pattern (escape % and _ which are LIKE special chars)
		const sanitizedQuery = query.replace(/[%_]/g, '');
		const likePattern = `%${sanitizedQuery}%`;
		searchResults = db
			.prepare(likeSql)
			.all(likePattern, likePattern, likePattern, SEARCH_RESULTS_LIMIT) as DbSearchResult[];
	}

	// Map to CatalogProduct
	const results: CatalogProduct[] = searchResults.map((p) => ({
		id: p.slug,
		brand: p.brand_name,
		name: p.name,
		price: p.price / 100,
		image: p.main_image || `https://picsum.photos/seed/watch-${p.slug}/360/440`,
		badge: p.is_limited ? 'Limited' : p.is_new ? 'New' : p.is_featured ? 'Top' : undefined,
		badgeType: (p.is_limited ? 'gold' : 'default') as 'default' | 'gold',
		info: [buildAvailabilityText(p)],
		availability: buildAvailabilityText(p)
	}));

	return {
		query,
		results,
		totalResults: results.length,
		searched: true
	};
};

function buildAvailabilityText(p: DbSearchResult): string {
	if (p.availability_text) return p.availability_text;

	switch (p.availability_status) {
		case 'in-stock':
			return 'В наличии';
		case 'pre-order':
			return 'Под заказ 7-21 день';
		case 'waitlist':
			return 'Лист ожидания';
		default:
			return 'Уточняйте наличие';
	}
}
