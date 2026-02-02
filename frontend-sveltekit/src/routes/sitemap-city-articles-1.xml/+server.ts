import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';

const SITE_URL = 'https://moditime-watch.ru';

interface CityArticleRow {
	article_slug: string;
	city_slug: string;
	updated_at: string | null;
}

function formatDate(dateStr: string | null): string {
	if (!dateStr) return new Date().toISOString().split('T')[0];
	try {
		return new Date(dateStr).toISOString().split('T')[0];
	} catch {
		return new Date().toISOString().split('T')[0];
	}
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async () => {
	const urls: string[] = [];

	try {
		const articles = queries.getAllCityArticles.all() as CityArticleRow[];
		for (const article of articles) {
			urls.push(`  <url>
    <loc>${SITE_URL}/city/${escapeXml(article.city_slug)}/${escapeXml(article.article_slug)}</loc>
    <lastmod>${formatDate(article.updated_at)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
		}
	} catch (err) {
		console.error('Error fetching city articles for sitemap:', err);
	}

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
