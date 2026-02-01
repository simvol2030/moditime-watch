import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db/database';

const getAllConfig = db.prepare('SELECT key, value FROM site_config');
const getCityNavItems = db.prepare(`
	SELECT * FROM navigation_items
	WHERE menu_type = 'city_header' AND is_active = 1 AND parent_id IS NULL
	ORDER BY position
`);
const getFooterLegalLinks = db.prepare(`
	SELECT fl.* FROM footer_links fl
	JOIN footer_sections fs ON fs.id = fl.section_id
	WHERE fs.title = 'Правовая информация'
	ORDER BY fl.position
`);

export const load: LayoutServerLoad = async () => {
	// Site config for contacts
	const configRows = getAllConfig.all() as { key: string; value: string }[];
	const siteConfig: Record<string, string> = {};
	for (const row of configRows) {
		siteConfig[row.key] = row.value;
	}

	// City header navigation (simplified)
	const cityNavItems = getCityNavItems.all() as any[];

	// Legal links for simplified footer
	const legalLinks = getFooterLegalLinks.all() as any[];

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
