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

interface ContactMethod {
	icon: string;
	title: string;
	value: string;
	description: string;
	href: string;
	primary?: boolean;
}

interface OfficeInfo {
	address: string;
	hours: string;
	metro: string;
}

interface ContactsPageData {
	contactMethods: ContactMethod[];
	officeInfo: OfficeInfo;
}

export const load: PageServerLoad = async () => {
	const page = queries.getPageBySlug.get('contacts') as DbPage | undefined;

	if (!page) {
		throw error(404, 'Страница не найдена');
	}

	const seoMeta = queries.getSeoMetaBySlug.get('static_page', 'contacts') as DbSeoMeta | undefined;

	// Parse meta_json for structured data
	let pageData: ContactsPageData = {
		contactMethods: [],
		officeInfo: {
			address: '',
			hours: '',
			metro: ''
		}
	};

	if (page.meta_json) {
		try {
			pageData = JSON.parse(page.meta_json) as ContactsPageData;
		} catch (e) {
			console.error('Failed to parse contacts page meta_json:', e);
		}
	}

	return {
		page: {
			title: page.title,
			content: page.content
		},
		seo: {
			title: seoMeta?.title || page.title,
			description: seoMeta?.description || 'Контакты Moditimewatch',
			openGraph: {
				title: seoMeta?.og_title || seoMeta?.title || page.title,
				description: seoMeta?.og_description || seoMeta?.description,
				image: seoMeta?.og_image ?? undefined
			}
		},
		contactMethods: pageData.contactMethods,
		officeInfo: pageData.officeInfo
	};
};
