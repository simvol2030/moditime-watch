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

interface Guarantee {
	icon: string;
	title: string;
	period: string;
	description: string;
}

interface WarrantyDetail {
	title: string;
	items: string[];
}

interface ReturnStep {
	step: string;
	title: string;
	description: string;
}

interface WarrantyPageData {
	guarantees: Guarantee[];
	warrantyDetails: WarrantyDetail[];
	returnProcess: ReturnStep[];
}

export const load: PageServerLoad = async () => {
	const page = queries.getPageBySlug.get('warranty') as DbPage | undefined;

	if (!page) {
		throw error(404, 'Страница не найдена');
	}

	const seoMeta = queries.getSeoMetaBySlug.get('static_page', 'warranty') as DbSeoMeta | undefined;

	// Parse meta_json for structured data
	let pageData: WarrantyPageData = {
		guarantees: [],
		warrantyDetails: [],
		returnProcess: []
	};

	if (page.meta_json) {
		try {
			pageData = JSON.parse(page.meta_json) as WarrantyPageData;
		} catch (e) {
			console.error('Failed to parse warranty page meta_json:', e);
		}
	}

	return {
		page: {
			title: page.title,
			content: page.content
		},
		seo: {
			title: seoMeta?.title || page.title,
			description: seoMeta?.description || 'Гарантии и возврат премиальных часов',
			openGraph: {
				title: seoMeta?.og_title || seoMeta?.title || page.title,
				description: seoMeta?.og_description || seoMeta?.description,
				image: seoMeta?.og_image ?? undefined
			}
		},
		guarantees: pageData.guarantees,
		warrantyDetails: pageData.warrantyDetails,
		returnProcess: pageData.returnProcess
	};
};
