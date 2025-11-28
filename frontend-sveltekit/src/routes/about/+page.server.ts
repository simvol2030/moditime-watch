import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';

interface DbPage {
	id: number;
	slug: string;
	title: string;
	content: string | null;
	template: string | null;
	meta_json: string | null;
	is_published: number;
}

interface DbSeoMeta {
	title: string;
	description: string;
	og_title: string | null;
	og_description: string | null;
	og_image: string | null;
}

interface AboutPageData {
	stats: Array<{ value: string; label: string }>;
	values: Array<{ icon: string; title: string; description: string }>;
	team: Array<{ name: string; role: string; image: string; description: string }>;
}

export const load: PageServerLoad = async () => {
	const page = queries.getPageBySlug.get('about') as DbPage | undefined;

	if (!page) {
		throw error(404, 'Страница не найдена');
	}

	const seoMeta = queries.getSeoMetaBySlug.get('static_page', 'about') as DbSeoMeta | undefined;

	// Parse meta_json for structured data
	let pageData: AboutPageData = {
		stats: [],
		values: [],
		team: []
	};

	if (page.meta_json) {
		try {
			pageData = JSON.parse(page.meta_json) as AboutPageData;
		} catch (e) {
			console.error('Failed to parse about page meta_json:', e);
		}
	}

	return {
		page: {
			title: page.title,
			content: page.content
		},
		seo: {
			title: seoMeta?.title || page.title,
			description: seoMeta?.description || 'О компании Moditimewatch',
			openGraph: {
				title: seoMeta?.og_title || seoMeta?.title || page.title,
				description: seoMeta?.og_description || seoMeta?.description,
				image: seoMeta?.og_image ?? undefined
			}
		},
		stats: pageData.stats,
		values: pageData.values,
		team: pageData.team
	};
};
