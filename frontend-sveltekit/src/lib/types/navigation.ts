export interface NavigationLink {
	label: string;
	href: string;
	isMainDomainOnly?: boolean; // true = абсолютная ссылка на главный домен для pSEO поддоменов
	submenu?: NavigationLink[];
}

export interface FooterLink {
	label: string;
	href: string;
	isMainDomainOnly?: boolean; // true = абсолютная ссылка на главный домен для pSEO поддоменов
}

export interface FooterSection {
	id: number;
	title: string;
	column: number;
	links: FooterLink[];
}

export interface NavigationData {
	desktop: NavigationLink[];
}

// Главный домен для генерации абсолютных URL
export const MAIN_DOMAIN = 'https://moditime-watch.ru';

/**
 * Генерирует URL для навигации с учетом is_main_domain_only
 * Если link.isMainDomainOnly = true, возвращает абсолютный URL на главный домен
 * Иначе возвращает относительный URL (остается на текущем домене)
 */
export function getNavigationHref(link: { href: string; isMainDomainOnly?: boolean }): string {
	// Если ссылка уже абсолютная (начинается с http), возвращаем как есть
	if (link.href.startsWith('http://') || link.href.startsWith('https://')) {
		return link.href;
	}
	// Если ссылка должна вести на главный домен, добавляем домен
	if (link.isMainDomainOnly) {
		return `${MAIN_DOMAIN}${link.href}`;
	}
	// Иначе возвращаем относительный URL
	return link.href;
}
