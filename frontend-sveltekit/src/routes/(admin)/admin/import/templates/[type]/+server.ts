import { generateCSV } from '$lib/server/import/csv-parser';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface TemplateConfig {
	headers: string[];
	examples: Record<string, string>[];
	filename: string;
}

const TEMPLATES: Record<string, TemplateConfig> = {
	products: {
		headers: [
			'slug', 'brand_slug', 'category_slug', 'name', 'sku', 'price', 'price_note',
			'availability_status', 'description', 'specs_json',
			'is_active', 'is_featured', 'is_new', 'is_limited', 'position',
			'main_image', 'gallery_images'
		],
		examples: [
			{
				slug: 'rolex-datejust-41', brand_slug: 'rolex', category_slug: 'mens',
				name: 'Rolex Datejust 41', sku: 'RLX-DJ41', price: '950000',
				price_note: '', availability_status: 'in-stock',
				description: 'Классические часы Rolex Datejust',
				specs_json: '{"Корпус":[{"label":"Диаметр","value":"41 мм"}]}',
				is_active: '1', is_featured: '1', is_new: '0', is_limited: '0', position: '1',
				main_image: '/images/products/datejust-1.jpg',
				gallery_images: '/images/products/datejust-2.jpg|/images/products/datejust-3.jpg'
			},
			{
				slug: 'omega-seamaster-300', brand_slug: 'omega', category_slug: 'sport',
				name: 'Omega Seamaster 300', sku: 'OMG-SM300', price: '580000',
				price_note: 'Включая НДС', availability_status: 'in-stock',
				description: 'Дайверские часы Omega',
				specs_json: '{"Корпус":[{"label":"Водонепроницаемость","value":"300 м"}]}',
				is_active: '1', is_featured: '0', is_new: '1', is_limited: '0', position: '2',
				main_image: '/images/products/seamaster-1.jpg',
				gallery_images: ''
			}
		],
		filename: 'products-template.csv'
	},
	brands: {
		headers: ['slug', 'name', 'description', 'logo_url', 'country', 'founded_year', 'website_url', 'is_active', 'position'],
		examples: [
			{ slug: 'rolex', name: 'Rolex', description: 'Швейцарский часовой бренд', logo_url: '', country: 'Switzerland', founded_year: '1905', website_url: 'https://rolex.com', is_active: '1', position: '1' },
			{ slug: 'omega', name: 'Omega', description: 'Часы для космонавтов', logo_url: '', country: 'Switzerland', founded_year: '1848', website_url: 'https://omegawatches.com', is_active: '1', position: '2' }
		],
		filename: 'brands-template.csv'
	},
	categories: {
		headers: ['slug', 'name', 'description', 'parent_slug', 'image_url', 'is_active', 'position'],
		examples: [
			{ slug: 'mens', name: 'Мужские часы', description: 'Коллекция мужских часов', parent_slug: '', image_url: '', is_active: '1', position: '1' },
			{ slug: 'sport', name: 'Спортивные', description: 'Спортивные модели', parent_slug: '', image_url: '', is_active: '1', position: '2' }
		],
		filename: 'categories-template.csv'
	},
	cities: {
		headers: [
			'slug', 'name', 'name_genitive', 'name_prepositional', 'name_dative', 'name_accusative',
			'region', 'population', 'timezone', 'delivery_days', 'delivery_price',
			'hero_image_url', 'hero_title', 'hero_subtitle', 'meta_description', 'is_active', 'priority'
		],
		examples: [
			{
				slug: 'moscow', name: 'Москва', name_genitive: 'Москвы', name_prepositional: 'Москве',
				name_dative: 'Москве', name_accusative: 'Москву',
				region: 'Московская область', population: '12600000', timezone: 'Europe/Moscow',
				delivery_days: '0', delivery_price: 'Бесплатно',
				hero_image_url: '', hero_title: 'Часы в Москве', hero_subtitle: 'Доставка в день заказа',
				meta_description: 'Купить часы в Москве с доставкой',
				is_active: '1', priority: '1'
			},
			{
				slug: 'saint-petersburg', name: 'Санкт-Петербург', name_genitive: 'Санкт-Петербурга',
				name_prepositional: 'Санкт-Петербурге', name_dative: 'Санкт-Петербургу',
				name_accusative: 'Санкт-Петербург',
				region: 'Ленинградская область', population: '5400000', timezone: 'Europe/Moscow',
				delivery_days: '1', delivery_price: 'Бесплатно',
				hero_image_url: '', hero_title: 'Часы в Петербурге', hero_subtitle: '',
				meta_description: 'Купить часы в Санкт-Петербурге',
				is_active: '1', priority: '2'
			}
		],
		filename: 'cities-template.csv'
	},
	city_articles: {
		headers: ['city_slug', 'slug', 'title', 'excerpt', 'content', 'image_url', 'template_type', 'is_published', 'source_file'],
		examples: [
			{
				city_slug: 'moscow', slug: 'gde-kupit-chasy',
				title: 'Где купить часы в Москве',
				excerpt: 'Обзор часовых бутиков столицы',
				content: '<h2>Лучшие места</h2><p>Столешников переулок...</p>',
				image_url: '', template_type: 'standard', is_published: '1', source_file: ''
			},
			{
				city_slug: 'saint-petersburg', slug: 'chasy-v-peterburge',
				title: 'Часы в Санкт-Петербурге',
				excerpt: 'Часовые салоны Невского проспекта',
				content: '<h2>Невский проспект</h2><p>Бутики на Невском...</p>',
				image_url: '', template_type: 'standard', is_published: '1', source_file: ''
			}
		],
		filename: 'city-articles-template.csv'
	},
	filters: {
		headers: ['attribute_slug', 'attribute_name', 'attribute_type', 'attribute_position', 'value', 'label', 'position'],
		examples: [
			{ attribute_slug: 'material', attribute_name: 'Материал корпуса', attribute_type: 'checkbox', attribute_position: '1', value: 'steel', label: 'Сталь', position: '1' },
			{ attribute_slug: 'material', attribute_name: 'Материал корпуса', attribute_type: 'checkbox', attribute_position: '1', value: 'gold-18k', label: 'Золото 18К', position: '2' },
			{ attribute_slug: 'mechanism', attribute_name: 'Механизм', attribute_type: 'checkbox', attribute_position: '2', value: 'automatic', label: 'Автоматический', position: '1' }
		],
		filename: 'filters-template.csv'
	}
};

export const GET: RequestHandler = async ({ params }) => {
	const template = TEMPLATES[params.type];
	if (!template) {
		throw error(404, 'Template not found');
	}

	const csv = generateCSV(template.headers, template.examples);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="${template.filename}"`
		}
	});
};
