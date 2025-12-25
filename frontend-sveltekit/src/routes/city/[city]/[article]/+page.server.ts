import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';
import type { SeoProps } from '$lib/types/seo';
import { generateArticleSchema } from '$lib/utils/schema-helpers';

interface CityArticleRow {
	id: number;
	city_id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string | null;
	image_url: string | null;
	meta_title: string | null;
	meta_description: string | null;
	is_published: number;
	published_at: string | null;
	updated_at: string | null;
	created_at: string | null;
	city_name: string;
	city_slug: string;
	name_genitive: string | null;
	name_prepositional: string | null;
}

interface RelatedArticleRow {
	id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	image_url: string | null;
	published_at: string | null;
}

export const load: PageServerLoad = async ({ params }) => {
	const { city: citySlug, article: articleSlug } = params;

	// Get article with city info
	const article = queries.getCityArticleBySlug.get(citySlug, articleSlug) as CityArticleRow | undefined;

	if (!article) {
		throw error(404, {
			message: `Статья не найдена`
		});
	}

	// Get related articles from the same city (excluding current)
	const relatedArticlesRaw = queries.getCityArticles.all(article.city_id, 4, 0) as RelatedArticleRow[];
	const relatedArticles = relatedArticlesRaw
		.filter((a) => a.slug !== articleSlug)
		.slice(0, 3)
		.map((a, index) => ({
			id: String(a.id),
			title: a.title,
			excerpt: a.excerpt || '',
			image: a.image_url || `https://picsum.photos/seed/related-${index}/400/300`,
			slug: a.slug,
			href: `/city/${citySlug}/${a.slug}`,
			date: a.published_at
				? new Date(a.published_at).toLocaleDateString('ru-RU', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})
				: ''
		}));

	// Build breadcrumbs
	const breadcrumbs = [
		{ label: 'Главная', href: '/' },
		{ label: article.city_name, href: `/city/${article.city_slug}` },
		{ label: article.title, href: `/city/${article.city_slug}/${article.slug}` }
	];

	// Build SEO props
	const canonicalUrl = `https://moditime-watch.ru/city/${article.city_slug}/${article.slug}`;
	const seo: SeoProps = {
		title: article.meta_title || `${article.title} | Часы в ${article.name_prepositional || article.city_name} | Moditimewatch`,
		description: article.meta_description || article.excerpt || `${article.title} - полезная информация о премиальных часах для жителей ${article.name_genitive || article.city_name}`,
		canonical: canonicalUrl,
		openGraph: {
			title: article.title,
			description: article.excerpt || undefined,
			image: article.image_url || undefined
		}
	};

	// Generate JSON-LD schema
	const jsonLd = generateArticleSchema({
		headline: article.title,
		description: article.excerpt || '',
		image: article.image_url || 'https://moditime-watch.ru/og-default.jpg',
		datePublished: article.published_at || new Date().toISOString(),
		dateModified: article.updated_at || article.published_at || new Date().toISOString(),
		author: 'Moditimewatch',
		publisherName: 'Moditimewatch',
		url: canonicalUrl
	});

	return {
		article: {
			id: String(article.id),
			slug: article.slug,
			title: article.title,
			excerpt: article.excerpt || '',
			content: article.content || '',
			image: article.image_url || 'https://picsum.photos/seed/article-main/800/400',
			publishedAt: article.published_at
				? new Date(article.published_at).toLocaleDateString('ru-RU', {
						day: '2-digit',
						month: 'long',
						year: 'numeric'
					})
				: ''
		},
		city: {
			slug: article.city_slug,
			name: article.city_name,
			nameGenitive: article.name_genitive || article.city_name,
			namePrepositional: article.name_prepositional || article.city_name
		},
		seo,
		jsonLd,
		breadcrumbs,
		relatedArticles
	};
};
