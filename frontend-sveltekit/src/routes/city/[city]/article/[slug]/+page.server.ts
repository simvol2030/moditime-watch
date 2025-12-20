import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';
import type { SeoProps } from '$lib/types/seo';

interface CityArticleRow {
	id: number;
	city_id: number;
	slug: string;
	title: string;
	excerpt: string | null;
	content: string | null;
	image_url: string | null;
	template_type: string;
	views_count: number;
	published_at: string | null;
	city_slug: string;
	city_name: string;
	name_prepositional: string | null;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const { city: citySlug, slug: articleSlug } = params;

	// Get city article by both slugs
	const article = queries.getCityArticleBySlugs.get(citySlug, articleSlug) as CityArticleRow | undefined;

	if (!article) {
		throw error(404, {
			message: 'Статья не найдена'
		});
	}

	// Build SEO props
	const articleUrl = `https://moditimewatch.ru/city/${citySlug}/article/${articleSlug}`;
	const subdomainUrl = `https://${citySlug}.moditimewatch.ru/article/${articleSlug}`;

	const seo: SeoProps = {
		title: `${article.title} | ${article.city_name} | Moditimewatch`,
		description: article.excerpt || `${article.title} — статья о швейцарских часах в ${article.name_prepositional || article.city_name}`,
		canonical: locals.isSubdomain ? subdomainUrl : articleUrl,
		openGraph: {
			title: article.title,
			description: article.excerpt || undefined,
			image: article.image_url || undefined
		}
	};

	// Get related articles from the same city
	const relatedArticles = queries.getCityArticles.all(article.city_id, 4, 0) as {
		id: number;
		slug: string;
		title: string;
		excerpt: string | null;
		image_url: string | null;
		published_at: string | null;
	}[];

	// Filter out current article and format
	const related = relatedArticles
		.filter(a => a.slug !== articleSlug)
		.slice(0, 3)
		.map((a, idx) => ({
			id: String(a.id),
			slug: a.slug,
			title: a.title,
			excerpt: a.excerpt || '',
			image: a.image_url || `https://picsum.photos/seed/city-related-${idx}/400/300`,
			url: `/city/${citySlug}/article/${a.slug}`,
			date: a.published_at
				? new Date(a.published_at).toLocaleDateString('ru-RU', {
						day: '2-digit',
						month: '2-digit',
						year: 'numeric'
					})
				: ''
		}));

	return {
		seo,
		article: {
			id: article.id,
			slug: article.slug,
			title: article.title,
			excerpt: article.excerpt || '',
			content: article.content || '<p>Контент статьи скоро появится.</p>',
			image: article.image_url || `https://picsum.photos/seed/article-${article.slug}/800/400`,
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
			namePrepositional: article.name_prepositional || article.city_name
		},
		relatedArticles: related,
		isSubdomain: locals.isSubdomain || false
	};
};
