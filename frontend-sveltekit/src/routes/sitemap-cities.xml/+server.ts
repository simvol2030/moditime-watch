import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';

const SITE_URL = 'https://moditime-watch.ru';

interface CityRow {
	slug: string;
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

	try {
		const cities = queries.getAllCities.all() as CityRow[];
		for (const city of cities) {
			urls.push(`  <url>
    <loc>${SITE_URL}/city/${escapeXml(city.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`);
		}
	} catch (err) {
		console.error('Error fetching cities for sitemap:', err);
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
