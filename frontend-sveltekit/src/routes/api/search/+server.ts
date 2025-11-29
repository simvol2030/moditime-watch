/**
 * Search API endpoint using FTS5 full-text search
 *
 * GET /api/search?q=rolex
 *
 * Returns products and articles matching the search query
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/database';

interface SearchProduct {
	id: number;
	slug: string;
	name: string;
	brand_name: string;
	brand_slug: string;
	price: number;
	image: string | null;
	availability_status: string;
}

interface SearchArticle {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	image_url: string | null;
}

interface SearchResult {
	products: SearchProduct[];
	articles: SearchArticle[];
	query: string;
	totalProducts: number;
	totalArticles: number;
}

// Sanitize search query for FTS5
function sanitizeFtsQuery(query: string): string {
	// Remove special FTS5 operators and dangerous characters
	return query
		.replace(/[*"():^~<>{}[\]\\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, 100); // Limit query length
}

// Build FTS5 match expression
function buildFtsMatchExpr(query: string): string {
	const words = sanitizeFtsQuery(query).split(' ').filter(Boolean);
	if (words.length === 0) return '';

	// Use prefix matching for partial words (e.g., "rol" matches "rolex")
	return words.map((w) => `"${w}"*`).join(' OR ');
}

export const GET: RequestHandler = async ({ url }) => {
	const rawQuery = url.searchParams.get('q')?.trim() || '';
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

	// Validate query
	if (!rawQuery || rawQuery.length < 2) {
		return json({
			products: [],
			articles: [],
			query: rawQuery,
			totalProducts: 0,
			totalArticles: 0
		} satisfies SearchResult);
	}

	const sanitizedQuery = sanitizeFtsQuery(rawQuery);
	const ftsExpr = buildFtsMatchExpr(rawQuery);

	let products: SearchProduct[] = [];
	let articles: SearchArticle[] = [];

	try {
		// Check if FTS table exists and has data
		const ftsCheck = db
			.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products_fts'")
			.get();

		if (ftsCheck && ftsExpr) {
			// FTS5 full-text search on products
			const ftsQuery = `
				SELECT
					p.id, p.slug, p.name,
					b.name as brand_name, b.slug as brand_slug,
					p.price, p.availability_status,
					(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as image
				FROM products_fts fts
				JOIN products p ON p.id = fts.rowid
				JOIN brands b ON b.id = p.brand_id
				WHERE products_fts MATCH ?
				AND p.is_active = 1
				ORDER BY rank
				LIMIT ?
			`;

			try {
				products = db.prepare(ftsQuery).all(ftsExpr, limit) as SearchProduct[];
			} catch {
				// FTS match failed, fall back to LIKE search
				console.log('[Search] FTS match failed, falling back to LIKE');
			}
		}

		// Fallback to LIKE search if FTS didn't work or returned no results
		if (products.length === 0) {
			const likePattern = `%${sanitizedQuery}%`;
			const likeQuery = `
				SELECT
					p.id, p.slug, p.name,
					b.name as brand_name, b.slug as brand_slug,
					p.price, p.availability_status,
					(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as image
				FROM products p
				JOIN brands b ON b.id = p.brand_id
				WHERE p.is_active = 1
				AND (
					p.name LIKE ?
					OR b.name LIKE ?
					OR p.description LIKE ?
				)
				ORDER BY
					CASE WHEN b.name LIKE ? THEN 0 ELSE 1 END,
					CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END,
					p.is_featured DESC
				LIMIT ?
			`;
			products = db
				.prepare(likeQuery)
				.all(likePattern, likePattern, likePattern, likePattern, likePattern, limit) as SearchProduct[];
		}

		// Search articles
		const likePattern = `%${sanitizedQuery}%`;
		const articlesQuery = `
			SELECT id, slug, title, excerpt, image_url
			FROM articles
			WHERE is_published = 1
			AND (title LIKE ? OR excerpt LIKE ?)
			ORDER BY is_featured DESC, published_at DESC
			LIMIT ?
		`;
		articles = db.prepare(articlesQuery).all(likePattern, likePattern, Math.min(limit, 5)) as SearchArticle[];
	} catch (error) {
		console.error('[Search] Error:', error);
		// Return empty results on error
	}

	return json({
		products,
		articles,
		query: sanitizedQuery,
		totalProducts: products.length,
		totalArticles: articles.length
	} satisfies SearchResult);
};
