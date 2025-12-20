/**
 * FTS5 Search API Endpoint
 *
 * Usage: GET /api/search?q=rolex
 *
 * Returns:
 * {
 *   query: "rolex",
 *   results: [
 *     { id: 1, slug: "rolex-submariner", name: "Rolex Submariner", brand_name: "Rolex", price: 1320000, image_url: "..." }
 *   ],
 *   total: 5
 * }
 */

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db/database';

interface SearchResult {
	id: number;
	slug: string;
	name: string;
	brand_name: string;
	price: number;
	image_url: string | null;
	availability_status: string;
}

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q')?.trim();
	const limitParam = url.searchParams.get('limit');
	const limit = Math.min(Math.max(parseInt(limitParam || '20'), 1), 50);

	// Validate query
	if (!query || query.length < 2) {
		return json({
			query: query || '',
			results: [],
			total: 0,
			error: query ? 'Query must be at least 2 characters' : null
		});
	}

	// Sanitize query for FTS5
	// Remove special FTS5 characters that could cause syntax errors
	const sanitizedQuery = query
		.replace(/['"*(){}[\]^~\\]/g, ' ')  // Remove special chars
		.replace(/\s+/g, ' ')                // Normalize whitespace
		.trim();

	if (!sanitizedQuery) {
		return json({
			query,
			results: [],
			total: 0,
			error: 'Invalid query'
		});
	}

	try {
		// Build FTS5 query with prefix matching
		// "rolex sub" -> "rolex* sub*"
		const ftsQuery = sanitizedQuery
			.split(/\s+/)
			.map(word => `${word}*`)
			.join(' ');

		// First, try FTS5 search
		const results = db.prepare(`
			SELECT
				p.id,
				p.slug,
				p.name,
				b.name as brand_name,
				p.price,
				p.availability_status,
				(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as image_url,
				highlight(products_fts, 0, '<mark>', '</mark>') as name_highlighted
			FROM products_fts fts
			JOIN products p ON p.id = fts.rowid
			JOIN brands b ON b.id = p.brand_id
			WHERE products_fts MATCH ?
			AND p.is_active = 1
			ORDER BY rank
			LIMIT ?
		`).all(ftsQuery, limit) as (SearchResult & { name_highlighted: string })[];

		return json({
			query,
			results: results.map(r => ({
				id: r.id,
				slug: r.slug,
				name: r.name,
				name_highlighted: r.name_highlighted,
				brand_name: r.brand_name,
				price: r.price,
				image_url: r.image_url || `https://picsum.photos/seed/watch-${r.slug}/200/240`,
				availability_status: r.availability_status,
				url: `/product/${r.slug}`
			})),
			total: results.length
		});

	} catch (error) {
		console.error('[Search] FTS5 error:', error);

		// Fallback to LIKE search if FTS5 fails
		try {
			const likeQuery = `%${sanitizedQuery}%`;
			const results = db.prepare(`
				SELECT
					p.id,
					p.slug,
					p.name,
					b.name as brand_name,
					p.price,
					p.availability_status,
					(SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as image_url
				FROM products p
				JOIN brands b ON b.id = p.brand_id
				WHERE p.is_active = 1
				AND (p.name LIKE ? OR b.name LIKE ? OR p.description LIKE ?)
				ORDER BY
					CASE WHEN p.name LIKE ? THEN 0 ELSE 1 END,
					CASE WHEN b.name LIKE ? THEN 0 ELSE 1 END,
					p.is_featured DESC
				LIMIT ?
			`).all(likeQuery, likeQuery, likeQuery, likeQuery, likeQuery, limit) as SearchResult[];

			return json({
				query,
				results: results.map(r => ({
					id: r.id,
					slug: r.slug,
					name: r.name,
					brand_name: r.brand_name,
					price: r.price,
					image_url: r.image_url || `https://picsum.photos/seed/watch-${r.slug}/200/240`,
					availability_status: r.availability_status,
					url: `/product/${r.slug}`
				})),
				total: results.length,
				fallback: true // Indicate LIKE search was used
			});

		} catch (fallbackError) {
			console.error('[Search] Fallback error:', fallbackError);
			return json({
				query,
				results: [],
				total: 0,
				error: 'Search failed'
			}, { status: 500 });
		}
	}
};
