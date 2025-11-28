// Editorial Section Types
// Типы для компонента EditorialSection.svelte

/**
 * Интерфейс для одной статьи в журнале
 */
export interface Article {
	/** Уникальный идентификатор статьи */
	id: string;

	/** Категория статьи (отображается как бейдж) */
	tag: string; // "История брендов", "Инвестиции", "Гид эксперта", "Стиль", "Programmatic", "Подарки"

	/** Заголовок статьи */
	title: string;

	/** Краткое описание статьи */
	description: string;

	/** URL изображения статьи */
	image: string;

	/** Ссылка на полную статью */
	link: string;

	/** Текст ссылки (CTA) */
	linkText: string; // "Читать", "Аналитика", "Открыть", "Изучить", "Читать кейс", "Смотреть идеи"
}

/**
 * Интерфейс для пропсов компонента EditorialSection
 */
export interface EditorialSectionProps {
	/** Надпись над заголовком (опционально) */
	eyebrow?: string; // По умолчанию: "Журнал"

	/** Основной заголовок секции */
	title: string; // "Экспертиза и вдохновение"

	/** Массив статей для отображения */
	articles: Article[];
}
