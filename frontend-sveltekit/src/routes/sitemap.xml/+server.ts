import type { RequestHandler } from './$types';

const SITE_URL = 'https://moditime-watch.ru';

/**
 * Sitemap Index: references sub-sitemaps for each content type.
 * Scales well as content grows — each sub-sitemap handles its own data.
 */
export const GET: RequestHandler = async () => {
	const today = new Date().toISOString().split('T')[0];

	const sitemaps = [
		{ loc: `${SITE_URL}/sitemap-main.xml`, lastmod: today },
		{ loc: `${SITE_URL}/sitemap-products.xml`, lastmod: today },
		{ loc: `${SITE_URL}/sitemap-cities.xml`, lastmod: today },
		{ loc: `${SITE_URL}/sitemap-city-articles-1.xml`, lastmod: today }
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((s) => `  <sitemap>
    <loc>${s.loc}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
