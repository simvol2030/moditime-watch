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

	// Pattern: {city}.moditime-watch.ru
	const match = host.match(/^([a-z0-9-]+)\.moditime-watch\.ru$/);

	if (match && match[1] && !RESERVED_SUBDOMAINS.has(match[1])) {
		const citySlug = match[1];

		// Reroute homepage to city page (internal, no visible redirect)
		if (url.pathname === '/') {
			return `/city/${citySlug}`;
		}

		// Reroute article paths: /article-slug → /city/{citySlug}/article-slug
		// Only reroute paths that look like article slugs (not system paths)
		const systemPaths = ['/admin', '/api', '/catalog', '/product', '/checkout', '/cart',
			'/about', '/contacts', '/delivery', '/warranty', '/privacy', '/terms',
			'/search', '/sitemap', '/city', '/quiz', '/brands', '/orders', '/auth'];
		const isSystemPath = systemPaths.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'));

		if (!isSystemPath && url.pathname !== '/') {
			// Treat as article slug: /my-article → /city/{citySlug}/my-article
			return `/city/${citySlug}${url.pathname}`;
		}
	}
};
