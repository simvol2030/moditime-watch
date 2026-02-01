import type { RequestHandler } from './$types';

const SITE_URL = 'https://moditime-watch.ru';

const STATIC_PAGES = [
	{ path: '/', priority: '1.0', changefreq: 'daily' },
	{ path: '/catalog', priority: '0.9', changefreq: 'daily' },
	{ path: '/about', priority: '0.7', changefreq: 'monthly' },
	{ path: '/contacts', priority: '0.7', changefreq: 'monthly' },
	{ path: '/delivery', priority: '0.6', changefreq: 'monthly' },
	{ path: '/warranty', priority: '0.6', changefreq: 'monthly' },
	{ path: '/privacy', priority: '0.3', changefreq: 'yearly' },
	{ path: '/terms', priority: '0.3', changefreq: 'yearly' },
	{ path: '/search', priority: '0.5', changefreq: 'weekly' }
];

export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split('T')[0];

	const urls = STATIC_PAGES.map(
		(page) => `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
