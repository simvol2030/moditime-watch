/**
 * TypeScript types for ExperienceSection component
 *
 * @module experience
 * @description Type definitions for the premium service/experience section
 */

/**
 * Single statistic item
 * @example
 * {
 *   label: 'Поиск лимитированных серий',
 *   value: '72 часа'
 * }
 */
export interface Stat {
	/** Label text (e.g., "Поиск лимитированных серий") */
	label: string;
	/** Value text (e.g., "72 часа") */
	value: string;
}

/**
 * Service card data
 * @example
 * {
 *   id: 'concierge',
 *   icon: '<svg>...</svg>',
 *   title: 'Консьерж-подбор',
 *   description: 'Персональный стилист подберёт часы...',
 *   linkText: 'Узнать детали',
 *   linkHref: '#'
 * }
 */
export interface Service {
	/** Unique identifier for the service */
	id: string;
	/** SVG icon as HTML string (rendered with {@html}) */
	icon: string;
	/** Service title (e.g., "Консьерж-подбор") */
	title: string;
	/** Service description */
	description: string;
	/** Link text (e.g., "Узнать детали") */
	linkText: string;
	/** Link href */
	linkHref: string;
}

/**
 * Props for ExperienceSection component
 *
 * This component displays premium service information with:
 * - Highlight section (eyebrow, title, description, stats, CTA)
 * - Service cards grid (3 services with icons, titles, descriptions)
 */
export interface ExperienceSectionProps {
	/** Optional eyebrow text (e.g., "Опыт Moditimewatch") */
	eyebrow?: string;
	/** Main section title (e.g., "Премиальный сервис для ценителей часов") */
	title: string;
	/** Section description */
	description: string;
	/** Array of statistics (3 items recommended) */
	stats: Stat[];
	/** Array of service cards (3 items recommended) */
	services: Service[];
	/** CTA button text (e.g., "Запланировать консультацию") */
	ctaText: string;
	/** CTA button href */
	ctaHref: string;
}
