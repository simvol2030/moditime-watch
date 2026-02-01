import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';
import type { SeoProps } from '$lib/types/seo';

interface CityRow {
	id: number;
	slug: string;
	name: string;
	name_genitive: string | null;
	name_prepositional: string | null;
	delivery_days: number;
	delivery_price: string | null;
	hero_image: string | null;
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
}

interface SeoMetaRow {
	title: string | null;
	description: string | null;
	og_title: string | null;
	og_description: string | null;
	og_image: string | null;
	canonical_url: string | null;
}

export const load: PageServerLoad = async ({ params }) => {
	const citySlug = params.city;

	// Get city from database
	const city = queries.getCityBySlug.get(citySlug) as CityRow | undefined;

	if (!city) {
		throw error(404, {
			message: `Город "${citySlug}" не найден`
		});
	}

	// Get city articles
	const articlesRaw = queries.getCityArticles.all(city.id, 6, 0) as CityArticleRow[];

	// Format articles for frontend
	const articles = articlesRaw.map((article, index) => ({
		id: String(article.id),
		title: article.title,
		excerpt: article.excerpt || '',
		image: article.image_url || `https://picsum.photos/seed/city-art-${index}/400/300`,
		slug: article.slug,
		date: article.published_at
			? new Date(article.published_at).toLocaleDateString('ru-RU', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				})
			: ''
	}));

	// Get SEO meta (optional)
	const seoMeta = queries.getSeoMetaBySlug.get('city', citySlug) as SeoMetaRow | undefined;

	// Build SEO props (title without suffix - SeoManager adds " | Moditimewatch")
	const seo: SeoProps = {
		title:
			seoMeta?.title || `Купить швейцарские часы в ${city.name_prepositional || city.name}`,
		description:
			seoMeta?.description ||
			`Оригинальные швейцарские часы с доставкой в ${city.name}. Консьерж-сервис, примерка перед покупкой, официальная гарантия.`,
		canonical: seoMeta?.canonical_url || `https://moditime-watch.ru/city/${city.slug}`,
		openGraph: {
			title: seoMeta?.og_title || `Премиальные часы в ${city.name_prepositional || city.name}`,
			description:
				seoMeta?.og_description ||
				`Доставка оригинальных брендов с примеркой и проверкой подлинности в ${city.name}`,
			image: seoMeta?.og_image ?? undefined
		}
	};

	return {
		city: {
			slug: city.slug,
			name: city.name,
			nameGenitive: city.name_genitive || city.name,
			namePrepositional: city.name_prepositional || city.name
		},
		seo,
		hero: {
			title: `Премиальные часы в ${city.name_prepositional || city.name}`,
			subtitle: 'Доставка оригинальных брендов с примеркой и проверкой подлинности',
			image:
				city.hero_image || 'https://images.unsplash.com/photo-1514525253440-b393452e3383?q=80&w=2000'
		},
		delivery: {
			days: city.delivery_days,
			price: city.delivery_price || 'Бесплатно'
		},
		articles
	};
};
