import type { LayoutServerLoad } from './$types';
import { queries } from '$lib/server/db/database';


export const load: LayoutServerLoad = async () => {
	// Site config for contacts
	const configRows = queries.getAllSiteConfig.all() as { key: string; value: string }[];
	const siteConfig: Record<string, string> = {};
	for (const row of configRows) {
		siteConfig[row.key] = row.value;
	}

	// City header navigation (simplified)
	const cityNavItems = queries.getCityNavItems.all() as any[];

	// Legal links for simplified footer
	const legalLinks = queries.getFooterLegalLinks.all() as any[];

	return {
		siteConfig,
		cityNavItems: cityNavItems.map((item) => ({
			label: item.label,
			href: item.href,
			isMainDomainOnly: item.is_main_domain_only === 1
		})),
		legalLinks: legalLinks.map((link) => ({
			label: link.label,
			href: link.href,
			isMainDomainOnly: link.is_main_domain_only === 1
		}))
	};
};
