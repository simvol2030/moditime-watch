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

interface DeliveryOption {
	type: string;
	time: string;
	price: string;
	icon: string;
	description: string;
	features: string[];
}

interface PaymentMethod {
	title: string;
	description: string;
	icon: string;
}

interface GeographyItem {
	region: string;
	time: string;
	price: string;
}

interface FaqItem {
	question: string;
	answer: string;
}

interface DeliveryPageData {
	deliveryOptions: DeliveryOption[];
	paymentMethods: PaymentMethod[];
	geography: GeographyItem[];
	faqItems: FaqItem[];
}

export const load: PageServerLoad = async () => {
	const page = queries.getPageBySlug.get('delivery') as DbPage | undefined;

	if (!page) {
		throw error(404, 'Страница не найдена');
	}

	const seoMeta = queries.getSeoMetaBySlug.get('static_page', 'delivery') as DbSeoMeta | undefined;

	// Parse meta_json for structured data
	let pageData: DeliveryPageData = {
		deliveryOptions: [],
		paymentMethods: [],
		geography: [],
		faqItems: []
	};

	if (page.meta_json) {
		try {
			pageData = JSON.parse(page.meta_json) as DeliveryPageData;
		} catch (e) {
			console.error('Failed to parse delivery page meta_json:', e);
		}
	}

	return {
		page: {
			title: page.title,
			content: page.content
		},
		seo: {
			title: seoMeta?.title || page.title,
			description: seoMeta?.description || 'Доставка и оплата премиальных часов',
			openGraph: {
				title: seoMeta?.og_title || seoMeta?.title || page.title,
				description: seoMeta?.og_description || seoMeta?.description,
				image: seoMeta?.og_image ?? undefined
			}
		},
		deliveryOptions: pageData.deliveryOptions,
		paymentMethods: pageData.paymentMethods,
		geography: pageData.geography,
		faqItems: pageData.faqItems
	};
};
