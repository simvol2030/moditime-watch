// Hero Section component types
// Based on site/index.html Hero block structure

/**
 * Статистический блок с числовым значением и подписью
 */
export interface HeroStat {
	/** Числовое значение (например: "560+", "48", "24ч") */
	value: string;
	/** Подпись под значением (например: "моделей в наличии") */
	label: string;
}

/**
 * Изображение Hero блока с опциональным бейджем
 */
export interface HeroImage {
	/** URL изображения */
	src: string;
	/** Alt текст для accessibility */
	alt: string;
	/** Ширина изображения в пикселях */
	width?: number;
	/** Высота изображения в пикселях */
	height?: number;
	/** Опциональный бейдж поверх изображения */
	badge?: {
		/** Верхняя строка бейджа (например: "Лимитированная серия") */
		label: string;
		/** Нижняя строка бейджа (например: "Royal Oak Flying Tourbillon") */
		title: string;
	};
}

/**
 * Быстрая ссылка (chip) под изображением
 */
export interface HeroQuickLink {
	/** Текст ссылки */
	text: string;
	/** URL ссылки */
	href: string;
	/** Вариант отображения */
	variant?: 'primary' | 'default';
}

/**
 * Основной контент Hero секции
 */
export interface HeroContent {
	/** Тэглайн над заголовком (например: "Коллекция 2024 / Arrival") */
	tagline: string;
	/** Главный заголовок (h1) */
	title: string;
	/** Описание под заголовком */
	description: string;
	/** Первая CTA кнопка (primary) */
	primaryCta: {
		text: string;
		href: string;
	};
	/** Вторая CTA кнопка (ghost) */
	secondaryCta: {
		text: string;
		href: string;
	};
	/** Массив статистических блоков (обычно 3 элемента) */
	stats: HeroStat[];
	/** Изображение справа с опциональным бейджем */
	image: HeroImage;
	/** Быстрые ссылки (chips) под изображением */
	quickLinks: HeroQuickLink[];
	/** Список брендов в нижней части Hero блока */
	brands: string[];
}
