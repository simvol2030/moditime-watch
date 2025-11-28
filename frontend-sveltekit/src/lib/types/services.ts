// Types for ProductServices component
// Created: 2025-01-19
// Purpose: Service highlights and FAQ section

export interface ServiceFeature {
	title: string;
	description: string;
}

export interface FaqItem {
	question: string;
	answer: string;
	defaultOpen?: boolean;
}

export interface ProductServicesProps {
	title: string;
	description: string;
	features: ServiceFeature[];
	ctaText?: string;
	ctaHref?: string;
	faqTitle?: string;
	faqItems: FaqItem[];
}
