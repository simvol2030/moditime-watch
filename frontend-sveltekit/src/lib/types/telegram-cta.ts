// src/lib/types/telegram-cta.ts

/**
 * Props для компонента TelegramCtaSection
 *
 * Секция призыва к действию (CTA) для подписки на Telegram канал.
 * Включает текстовый контент, список преимуществ и встроенный iframe виджет канала.
 */
export interface TelegramCtaSectionProps {
	/**
	 * Маленький текст над заголовком (опционально)
	 * Обычно одно слово, обозначающее категорию секции
	 *
	 * @example "Подписка"
	 */
	eyebrow?: string;

	/**
	 * Основной заголовок секции
	 * Привлекающий внимание заголовок о Telegram канале
	 *
	 * @example "Канал Moditimewatch в Telegram"
	 */
	title: string;

	/**
	 * Описание канала
	 * Краткое объяснение, что пользователь получит при подписке
	 *
	 * @example "Анонсы лимитированных релизов, backstage сервиса..."
	 */
	description: string;

	/**
	 * Список преимуществ подписки (массив строк)
	 * Каждый элемент - отдельное преимущество
	 * Рекомендуется 3-5 элементов
	 *
	 * @example ["Эксклюзивные предложения...", "Подборки часов...", ...]
	 */
	features: string[];

	/**
	 * Текст кнопки CTA
	 * Короткий призыв к действию
	 *
	 * @example "Подписаться"
	 */
	ctaText: string;

	/**
	 * Ссылка на Telegram канал для кнопки
	 * Публичная ссылка на канал, открывается в новой вкладке
	 *
	 * @example "https://t.me/moditimewatch"
	 */
	ctaHref: string;

	/**
	 * URL для встраивания канала в iframe
	 * Специальный URL для отображения канала внутри сайта
	 * Формат: https://t.me/s/CHANNEL_NAME
	 *
	 * @example "https://t.me/s/moditimewatch"
	 */
	channelUrl: string;
}
