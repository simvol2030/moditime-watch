import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';
import type { SeoProps } from '$lib/types/seo';
import { generateLocalBusinessSchema } from '$lib/utils/schema-helpers';

interface CityRow {
	id: number;
	slug: string;
	name: string;
	name_genitive: string | null;
	name_prepositional: string | null;
	name_accusative: string | null;
	delivery_days: number;
	delivery_price: string | null;
	hero_image_url: string | null;
	hero_title: string | null;
	hero_subtitle: string | null;
	meta_description: string | null;
	is_active: number;
	priority: number;
}

interface CityArticleRow {
	id: number;
	city_id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	image_url: string | null;
	published_at: string | null;
	category_id: number | null;
	category_name: string | null;
	read_time: number | null;
	is_published: number;
}

interface SeoMetaRow {
	title: string | null;
	description: string | null;
	og_title: string | null;
	og_description: string | null;
	og_image: string | null;
	canonical_url: string | null;
}

interface CategoryRow {
	id: number;
	name: string;
	slug: string;
}

const ARTICLES_PER_PAGE = 50;

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	const citySlug = params.city;
	const pageNum = Math.max(1, parseInt(url.searchParams.get('page') || '1'));

	// Get city from database
	const city = queries.getCityBySlug.get(citySlug) as CityRow | undefined;

	if (!city) {
		throw error(404, {
			message: `Город "${citySlug}" не найден`
		});
	}

	// Cache-Control: 1 hour for city landing pages
	setHeaders({ 'Cache-Control': 'public, max-age=3600' });

	// Get all published articles for this city (with category join)
	const allArticlesRaw = queries.listCityArticlesByCity.all(city.id) as CityArticleRow[];
	const publishedArticles = allArticlesRaw.filter((a) => a.is_published === 1);

	// Pagination
	const totalArticles = publishedArticles.length;
	const totalPages = Math.max(1, Math.ceil(totalArticles / ARTICLES_PER_PAGE));
	const currentPage = Math.min(pageNum, totalPages);
	const offset = (currentPage - 1) * ARTICLES_PER_PAGE;
	const paginatedArticles = publishedArticles.slice(offset, offset + ARTICLES_PER_PAGE);

	// Get categories for ordering
	const categories = queries.listCityArticleCategories.all() as CategoryRow[];

	// Format articles
	const formattedArticles = paginatedArticles.map((article, index) => ({
		id: String(article.id),
		title: article.title,
		excerpt: article.excerpt || '',
		image: article.image_url || `https://picsum.photos/seed/city-art-${index}/400/300`,
		slug: article.slug,
		categoryName: article.category_name || 'Общее',
		categoryId: article.category_id,
		readTime: article.read_time,
		date: article.published_at
			? new Date(article.published_at).toLocaleDateString('ru-RU', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				})
			: ''
	}));

	// Group articles by category
	const categoryMap = new Map<string, typeof formattedArticles>();
	for (const article of formattedArticles) {
		const catName = article.categoryName;
		if (!categoryMap.has(catName)) {
			categoryMap.set(catName, []);
		}
		categoryMap.get(catName)!.push(article);
	}

	// Order categories by DB position, uncategorized at the end
	const categorySections: { name: string; slug: string; articles: typeof formattedArticles }[] = [];
	for (const cat of categories) {
		const articles = categoryMap.get(cat.name);
		if (articles && articles.length > 0) {
			categorySections.push({ name: cat.name, slug: cat.slug, articles });
			categoryMap.delete(cat.name);
		}
	}
	for (const [name, articles] of categoryMap) {
		categorySections.push({ name, slug: '', articles });
	}

	// Get SEO meta (optional)
	const seoMeta = queries.getSeoMetaBySlug.get('city', citySlug) as SeoMetaRow | undefined;

	// Generate LocalBusiness JSON-LD for city page
	const localBusinessJsonLd = generateLocalBusinessSchema({
		name: `Moditimewatch — ${city.name}`,
		description: `Премиальные швейцарские часы с доставкой в ${city.name}. Консьерж-сервис и примерка.`,
		address: {
			streetAddress: '',
			addressLocality: city.name,
			addressCountry: 'RU'
		},
		url: `https://moditime-watch.ru/city/${city.slug}`,
		priceRange: '$$$$'
	});

	// Build SEO props
	const seo: SeoProps = {
		title:
			seoMeta?.title || `Купить швейцарские часы в ${city.name_prepositional || city.name}`,
		description:
			seoMeta?.description ||
			city.meta_description ||
			`Оригинальные швейцарские часы с доставкой в ${city.name}. Консьерж-сервис, примерка перед покупкой, официальная гарантия.`,
		canonical: seoMeta?.canonical_url || `https://moditime-watch.ru/city/${city.slug}`,
		openGraph: {
			title: seoMeta?.og_title || `Премиальные часы в ${city.name_prepositional || city.name}`,
			description:
				seoMeta?.og_description ||
				`Доставка оригинальных брендов с примеркой и проверкой подлинности в ${city.name}`,
			image: seoMeta?.og_image ?? undefined
		},
		jsonLd: localBusinessJsonLd
	};

	return {
		city: {
			slug: city.slug,
			name: city.name,
			nameGenitive: city.name_genitive || city.name,
			namePrepositional: city.name_prepositional || city.name,
			nameAccusative: city.name_accusative || city.name
		},
		seo,
		hero: {
			title: city.hero_title || `Премиальные часы в ${city.name_prepositional || city.name}`,
			subtitle: city.hero_subtitle || 'Доставка оригинальных брендов с примеркой и проверкой подлинности',
			image:
				city.hero_image_url || 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=2000'
		},
		delivery: {
			days: city.delivery_days,
			price: city.delivery_price || 'Бесплатно'
		},
		articles: formattedArticles,
		categorySections,
		pagination: {
			currentPage,
			totalPages,
			totalArticles
		}
	};
};
