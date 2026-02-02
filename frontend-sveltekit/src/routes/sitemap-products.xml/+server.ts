import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';

const SITE_URL = 'https://moditime-watch.ru';

interface ProductRow {
	slug: string;
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
		const products = queries.getAllProductsForSitemap.all() as ProductRow[];
		for (const product of products) {
			urls.push(`  <url>
    <loc>${SITE_URL}/product/${escapeXml(product.slug)}</loc>
    <lastmod>${formatDate(product.updated_at)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
		}
	} catch (err) {
		console.error('Error fetching products for sitemap:', err);
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
