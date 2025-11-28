export interface SeoProps {
	title: string;
	description: string;
	canonical?: string;
	noindex?: boolean;
	openGraph?: {
		title?: string;
		description?: string;
		type?: 'website' | 'article' | 'product' | 'profile';
		image?: string;
		imageAlt?: string;
		url?: string;
		siteName?: string;
	};
	twitter?: {
		card?: 'summary' | 'summary_large_image';
		site?: string;
		creator?: string;
	};
	jsonLd?: Record<string, any> | Record<string, any>[];
	breadcrumbs?: Array<{ name: string; item: string }>;
}

export interface AnalyticsConfig {
	googleAnalyticsId?: string; // G-XXXXXXXXXX
	yandexMetricaId?: string; // XXXXXXXX
	googleTagManagerId?: string; // GTM-XXXXXXX
}
