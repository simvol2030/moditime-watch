import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';

interface ProductRow {
	slug: string;
	updated_at: string | null;
}

interface CityRow {
	slug: string;
}

interface CityArticleRow {
	article_slug: string;
	city_slug: string;
	updated_at: string | null;
}

const SITE_URL = 'https://moditime-watch.ru';

// Static pages with their priority and change frequency
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

function formatDate(dateStr: string | null): string {
	if (!dateStr) {
		return new Date().toISOString().split('T')[0];
	}
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
	const today = new Date().toISOString().split('T')[0];

	// Add static pages
	for (const page of STATIC_PAGES) {
		urls.push(`
    <url>
      <loc>${SITE_URL}${page.path}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${page.changefreq}</changefreq>
      <priority>${page.priority}</priority>
    </url>`);
	}

	// Add products
	try {
		const products = queries.getAllProductsForSitemap.all() as ProductRow[];
		for (const product of products) {
			urls.push(`
    <url>
      <loc>${SITE_URL}/product/${escapeXml(product.slug)}</loc>
      <lastmod>${formatDate(product.updated_at)}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`);
		}
	} catch (err) {
		console.error('Error fetching products for sitemap:', err);
	}

	// Add cities
	try {
		const cities = queries.getAllCities.all() as CityRow[];
		for (const city of cities) {
			urls.push(`
    <url>
      <loc>${SITE_URL}/city/${escapeXml(city.slug)}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
		}
	} catch (err) {
		console.error('Error fetching cities for sitemap:', err);
	}

	// Add city articles
	try {
		const cityArticles = queries.getAllCityArticles.all() as CityArticleRow[];
		for (const article of cityArticles) {
			urls.push(`
    <url>
      <loc>${SITE_URL}/city/${escapeXml(article.city_slug)}/${escapeXml(article.article_slug)}</loc>
      <lastmod>${formatDate(article.updated_at)}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`);
		}
	} catch (err) {
		console.error('Error fetching city articles for sitemap:', err);
	}

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}
</urlset>`;

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'max-age=3600' // Cache for 1 hour
		}
	});
};
