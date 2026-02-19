import type { PageServerLoad } from './$types';
import { queries, db } from '$lib/server/db/database';

interface DbPage {
	id: number;
	slug: string;
	title: string;
	template: string | null;
	is_published: number;
}

interface DbArticle {
	id: number;
	slug: string;
	title: string;
	is_published: number;
	published_at: string | null;
}

interface DbCityArticle {
	id: number;
	slug: string;
	title: string;
	city_id: number;
	city_name: string;
	city_slug: string;
	is_published: number;
	published_at: string | null;
}

// Singleton pages — fixed list with deeplinks
const SINGLETON_PAGES = [
	{ slug: '/', title: 'Главная', template: 'homepage', editUrl: '/admin/homepage' },
	{ slug: '/about', title: 'О сервисе', template: 'about', editUrl: '/admin/pages/about' },
	{ slug: '/contacts', title: 'Контакты', template: 'contacts', editUrl: '/admin/pages/contacts' },
	{ slug: '/delivery', title: 'Доставка', template: 'info', editUrl: '/admin/pages/delivery' },
	{ slug: '/privacy', title: 'Политика конфиденциальности', template: 'legal', editUrl: '/admin/pages/privacy' },
	{ slug: '/offer', title: 'Оферта', template: 'legal', editUrl: '/admin/pages/offer' }
];

const PER_PAGE = 20;

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('q') || '';
	const filter = url.searchParams.get('type') || 'all';
	const page = Math.max(1, Number(url.searchParams.get('page') || 1));

	// Singleton pages — check status from pages table
	const dbPages = queries.adminListPages.all() as DbPage[];
	const dbPageMap = new Map(dbPages.map(p => [p.slug, p]));

	const singletonPages = SINGLETON_PAGES.map(sp => {
		const dbp = dbPageMap.get(sp.slug === '/' ? 'index' : sp.slug.slice(1));
		return {
			...sp,
			isPublished: dbp ? dbp.is_published === 1 : true,
			dbId: dbp?.id || null
		};
	});

	// Content pages — articles + city_articles with search and filter
	let contentItems: Array<{
		id: number;
		title: string;
		type: string;
		typeLabel: string;
		url: string;
		editUrl: string;
		isPublished: boolean;
		publishedAt: string | null;
	}> = [];
	let totalCount = 0;

	if (filter === 'all' || filter === 'articles') {
		const searchClause = search ? `WHERE a.title LIKE '%' || @search || '%'` : '';
		const countQuery = db.prepare(`SELECT COUNT(*) as cnt FROM articles a ${searchClause}`);
		const articlesCount = (search ? countQuery.get({ search }) : countQuery.get()) as { cnt: number };

		const listQuery = db.prepare(`
			SELECT a.id, a.slug, a.title, a.is_published, a.published_at
			FROM articles a ${searchClause}
			ORDER BY a.published_at DESC, a.title
		`);
		const articles = (search ? listQuery.all({ search }) : listQuery.all()) as DbArticle[];

		for (const a of articles) {
			contentItems.push({
				id: a.id,
				title: a.title,
				type: 'article',
				typeLabel: 'Статья',
				url: `/journal/${a.slug}`,
				editUrl: `/admin/articles/${a.id}`,
				isPublished: a.is_published === 1,
				publishedAt: a.published_at
			});
		}
		if (filter === 'articles') totalCount = articlesCount.cnt;
	}

	if (filter === 'all' || filter === 'cities') {
		const searchClause = search ? `WHERE ca.title LIKE '%' || @search || '%'` : '';
		const countQuery = db.prepare(`SELECT COUNT(*) as cnt FROM city_articles ca ${searchClause}`);
		const cityCount = (search ? countQuery.get({ search }) : countQuery.get()) as { cnt: number };

		const listQuery = db.prepare(`
			SELECT ca.id, ca.slug, ca.title, ca.city_id, ca.is_published, ca.published_at,
				c.name as city_name, c.slug as city_slug
			FROM city_articles ca
			JOIN cities c ON c.id = ca.city_id
			${searchClause}
			ORDER BY ca.published_at DESC, ca.title
		`);
		const cityArticles = (search ? listQuery.all({ search }) : listQuery.all()) as DbCityArticle[];

		for (const ca of cityArticles) {
			contentItems.push({
				id: ca.id,
				title: ca.title,
				type: 'city_article',
				typeLabel: 'pSEO',
				url: `/${ca.city_slug}`,
				editUrl: `/admin/city-articles?city=${ca.city_id}`,
				isPublished: ca.is_published === 1,
				publishedAt: ca.published_at
			});
		}
		if (filter === 'cities') totalCount = cityCount.cnt;
	}

	if (filter === 'all') {
		totalCount = contentItems.length;
	}

	// Sort combined by date
	contentItems.sort((a, b) => {
		const da = a.publishedAt || '';
		const db2 = b.publishedAt || '';
		return db2.localeCompare(da);
	});

	// Paginate
	const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
	const offset = (page - 1) * PER_PAGE;
	const paginatedItems = contentItems.slice(offset, offset + PER_PAGE);

	return {
		singletonPages,
		contentItems: paginatedItems,
		totalCount,
		totalPages,
		currentPage: page,
		search,
		filter
	};
};
