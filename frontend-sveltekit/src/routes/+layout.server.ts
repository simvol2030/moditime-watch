import type { LayoutServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import type { NavigationLink, FooterSection } from '$lib/types/navigation';

// Disable prerendering to avoid better-sqlite3 worker thread issues during build
export const prerender = false;

export const load: LayoutServerLoad = async () => {
	// ============================================
	// NAVIGATION (Header Menu) - из БД для Admin.js!
	// ============================================
	const topLevelItems = queries.getNavigationItems.all('header_desktop') as any[];

	const navigationItems: NavigationLink[] = topLevelItems.map((item) => {
		// Получаем submenu для каждого top-level элемента
		const submenuItems = queries.getNavigationSubmenu.all(item.id) as any[];

		return {
			label: item.label,
			href: item.href,
			isMainDomainOnly: item.is_main_domain_only === 1,
			submenu:
				submenuItems.length > 0
					? submenuItems.map((sub) => ({
							label: sub.label,
							href: sub.href,
							isMainDomainOnly: sub.is_main_domain_only === 1
						}))
					: undefined
		};
	});

	// ============================================
	// FOOTER - из БД для Admin.js!
	// ============================================
	const footerSectionsFromDb = queries.getFooterSections.all() as any[];

	const footerSections: FooterSection[] = footerSectionsFromDb.map((section) => {
		const links = queries.getFooterLinks.all(section.id) as any[];

		return {
			id: section.id,
			title: section.title,
			column: section.column_number,
			links: links.map((link) => ({
				label: link.label,
				href: link.href,
				isMainDomainOnly: link.is_main_domain_only === 1
			}))
		};
	});

	// ============================================
	// SITE CONFIG - из БД для Header/Footer!
	// ============================================
	const configRows = queries.getAllSiteConfig.all() as { key: string; value: string }[];
	const siteConfig: Record<string, string> = {};
	for (const row of configRows) {
		siteConfig[row.key] = row.value;
	}

	return {
		navigationItems,
		footerSections,
		siteConfig
	};
};
