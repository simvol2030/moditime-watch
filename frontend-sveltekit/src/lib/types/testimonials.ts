/**
 * TypeScript типы для компонента TestimonialsSection
 *
 * Секция отзывов клиентов премиального магазина часов Moditimewatch
 *
 * @created 2025-01-19
 * @source /mnt/c/dev/watch/site/index.html (строки 587-699)
 */

/**
 * Интерфейс одного отзыва клиента
 */
export interface Testimonial {
	/** Уникальный идентификатор отзыва */
	id: string;

	/** Имя клиента */
	name: string;

	/** Должность или род деятельности клиента */
	position: string;

	/** URL аватара клиента (64x64px) */
	avatar: string;

	/** Текст отзыва клиента (в кавычках) */
	text: string;

	/** Выбранная модель часов (например, "Patek Philippe Nautilus 5811/1G") */
	choice: string;
}

/**
 * Props для компонента TestimonialsSection
 */
export interface TestimonialsSectionProps {
	/** Надзаголовок секции (опционально, по умолчанию "Отзывы клиентов") */
	eyebrow?: string;

	/** Основной заголовок секции */
	title: string;

	/** Описание секции (опционально) */
	description?: string;

	/** Массив отзывов клиентов (рекомендуется 6 штук для хорошего UX) */
	testimonials: Testimonial[];
}
