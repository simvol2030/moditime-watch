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

export const load: PageServerLoad = async () => {
	const page = queries.getPageBySlug.get('terms') as DbPage | undefined;

	if (!page) {
		throw error(404, 'Страница не найдена');
	}

	const seoMeta = queries.getSeoMetaBySlug.get('static_page', 'terms') as DbSeoMeta | undefined;

	return {
		page: {
			title: page.title,
			content: page.content
		},
		seo: {
			title: seoMeta?.title || page.title,
			description: seoMeta?.description || 'Правила обработки персональных данных',
			openGraph: {
				title: seoMeta?.og_title || seoMeta?.title || page.title,
				description: seoMeta?.og_description || seoMeta?.description,
				image: seoMeta?.og_image ?? undefined
			}
		}
	};
};
