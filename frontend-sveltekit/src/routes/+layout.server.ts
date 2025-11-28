import type { LayoutServerLoad } from './$types';
import { queries } from '$lib/server/db/database';
import type { NavigationLink } from '$lib/types/navigation';

export const load: LayoutServerLoad = async () => {
	// ============================================
	// NAVIGATION (Header Menu) - из БД для Admin.js!
	// ============================================
	const topLevelItems = queries.getNavigationItems.all('header_desktop') as any[];
	console.log('🔍 DEBUG: topLevelItems count =', topLevelItems.length);
	console.log('🔍 DEBUG: topLevelItems =', topLevelItems);

	const navigationItems: NavigationLink[] = topLevelItems.map((item) => {
		// Получаем submenu для каждого top-level элемента
		const submenuItems = queries.getNavigationSubmenu.all(item.id) as any[];

		return {
			label: item.label,
			href: item.href,
			submenu:
				submenuItems.length > 0
					? submenuItems.map((sub) => ({
							label: sub.label,
							href: sub.href
						}))
					: undefined
		};
	});

	// ============================================
	// FOOTER - из БД для Admin.js!
	// ============================================
	const footerSectionsFromDb = queries.getFooterSections.all() as any[];

	const footerSections = footerSectionsFromDb.map((section) => {
		const links = queries.getFooterLinks.all(section.id) as any[];

		return {
			id: section.id,
			title: section.title,
			column: section.column_number,
			links: links.map((link) => ({
				label: link.label,
				href: link.href
			}))
		};
	});

	console.log('🔍 DEBUG: Final navigationItems count =', navigationItems.length);
	console.log('🔍 DEBUG: Final footerSections count =', footerSections.length);

	return {
		navigationItems,
		footerSections
	};
};
