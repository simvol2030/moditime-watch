import type { Reroute } from '@sveltejs/kit';

// Reserved subdomains that should not be treated as city slugs
const RESERVED_SUBDOMAINS = new Set(['www', 'quiz', 'admin', 'api', 'cdn', 'static', 'mail', 'twa']);

/**
 * Reroute Hook
 * Rewrites subdomain URLs to city pages without visible redirect
 * Example: vladivostok.moditime-watch.ru/ → renders /city/vladivostok content
 */
export const reroute: Reroute = ({ url }) => {
	const host = url.host;

	// Debug: log what host we're receiving
	console.log('[reroute] host:', host, 'pathname:', url.pathname);

	// Pattern: {city}.moditime-watch.ru
	const match = host.match(/^([a-z0-9-]+)\.moditime-watch\.ru$/);

	if (match && match[1] && !RESERVED_SUBDOMAINS.has(match[1])) {
		const citySlug = match[1];

		// Reroute homepage to city page (internal, no visible redirect)
		if (url.pathname === '/') {
			return `/city/${citySlug}`;
		}

		// For other paths on subdomains, could also reroute if needed
		// e.g., /article-slug → /city/{citySlug}/article-slug
	}
};
