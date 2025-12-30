/**
 * MODITIMEWATCH DATABASE
 * Version: 2.0
 * Date: 2024-11-20
 *
 * Полная схема БД для интернет-магазина премиальных часов
 * Включает: Layout, Widgets, Products, Cities (Programmatic SEO), Orders, SEO Meta
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { readFileSync } from 'fs';

// Путь к БД
const DB_PATH = join(process.cwd(), '..', 'data', 'db', 'sqlite', 'app.db');

// Создаём подключение
const isDevelopment = process.env.NODE_ENV !== 'production';
export const db = new Database(DB_PATH, {
	verbose: isDevelopment ? console.log : undefined
});

// Включаем WAL режим и foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================
// TYPESCRIPT ИНТЕРФЕЙСЫ
// ============================================

// Глобальные
export interface SiteConfig {
	id: number;
	key: string;
	value: string;
	type: string;
	description?: string;
}

export interface NavigationItem {
	id: number;
	label: string;
	href: string;
	parent_id?: number;
	position: number;
	menu_type: 'header_desktop' | 'header_mobile' | 'footer';
	is_active: number;
}

export interface Widget {
	id: number;
	type: string;
	title?: string;
	description?: string;
	data_json: string;
	is_active: number;
	position: number;
}

// Товары
export interface Brand {
	id: number;
	slug: string;
	name: string;
	description?: string;
	logo_url?: string;
	country?: string;
	founded_year?: number;
	is_active: number;
	position: number;
}

export interface Category {
	id: number;
	slug: string;
	name: string;
	description?: string;
	parent_id?: number;
	image_url?: string;
	is_active: number;
	position: number;
}

export interface Product {
	id: number;
	slug: string;
	brand_id: number;
	category_id?: number;
	name: string;
	sku?: string;
	price: number; // в копейках
	price_note?: string;
	installment_text?: string;
	trade_in_text?: string;
	availability_status: 'in-stock' | 'pre-order' | 'waitlist';
	availability_text?: string;
	description?: string;
	description_html?: string;
	rating: number;
	review_count: number;
	meta_json?: string;
	is_active: number;
	is_featured: number;
	is_new: number;
	is_limited: number;
	position: number;
	created_at: string;
	updated_at: string;
}

export interface ProductImage {
	id: number;
	product_id: number;
	url: string;
	alt?: string;
	thumbnail_url?: string;
	position: number;
	is_main: number;
}

export interface ProductSpec {
	id: number;
	product_id: number;
	group_name: string;
	spec_key: string;
	spec_value: string;
	position: number;
}

export interface Review {
	id: number;
	product_id: number;
	author_name: string;
	author_role?: string;
	author_avatar_url?: string;
	rating: number;
	content: string;
	delivery_info?: string;
	is_verified: number;
	helpful_count: number;
	is_active: number;
	created_at: string;
}

// Города (Programmatic SEO)
export interface City {
	id: number;
	slug: string;
	name: string;
	name_genitive?: string;
	name_prepositional?: string;
	region?: string;
	population?: number;
	delivery_days: number;
	delivery_price: string;
	hero_image_url?: string;
	hero_title?: string;
	hero_subtitle?: string;
	is_active: number;
}

export interface CityArticle {
	id: number;
	city_id: number;
	slug: string;
	title: string;
	excerpt?: string;
	content: string;
	image_url?: string;
	template_type: string;
	is_published: number;
	published_at: string;
	views_count: number;
}

// Журнал
export interface Article {
	id: number;
	slug: string;
	title: string;
	subtitle?: string;
	excerpt?: string;
	content: string;
	image_url?: string;
	category_id?: number;
	author_name?: string;
	author_role?: string;
	author_avatar_url?: string;
	read_time?: number;
	views_count: number;
	is_published: number;
	is_featured: number;
	published_at?: string;
	created_at: string;
	updated_at: string;
}

// Заказы
export interface Order {
	id: number;
	order_number: string;
	customer_name: string;
	customer_phone: string;
	customer_email?: string;
	delivery_address: string;
	delivery_comment?: string;
	total_amount: number;
	status: 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
	created_at: string;
	updated_at: string;
}

export interface OrderItem {
	id: number;
	order_id: number;
	product_id?: number;
	product_name: string;
	product_brand: string;
	product_sku?: string;
	price: number;
	quantity: number;
	subtotal: number;
}

// SEO
export interface SeoMeta {
	id: number;
	page_type: string;
	entity_id?: number;
	slug?: string;
	title: string;
	description: string;
	keywords?: string;
	og_title?: string;
	og_description?: string;
	og_type?: string;
	og_image?: string;
	json_ld?: string;
	canonical_url?: string;
	noindex: number;
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ СХЕМЫ
// ============================================

export function initializeDatabase() {
	console.log('🔧 Initializing Moditimewatch database schema...');

	// Читаем SQL схему из файла
	const schemaPath = join(process.cwd(), '..', 'schema.sql');
	const schema = readFileSync(schemaPath, 'utf-8');

	// Выполняем всю схему
	db.exec(schema);

	console.log('✅ Database schema initialized (36 tables)');
}

// ============================================
// SEED ДАННЫЕ
// ============================================

export function seedDatabase() {
	console.log('🌱 Seeding database with initial data...');

	// Проверяем есть ли уже данные
	const brandsCount = db.prepare('SELECT COUNT(*) as count FROM brands').get() as { count: number };

	if (brandsCount.count > 0) {
		console.log('⏭️  Database already seeded, skipping...');
		return;
	}

	// Начинаем транзакцию
	const seed = db.transaction(() => {
		// ============================================
		// 1. SITE CONFIG
		// ============================================
		const insertConfig = db.prepare(`
			INSERT INTO site_config (key, value, type, description)
			VALUES (?, ?, ?, ?)
		`);

		insertConfig.run('site_name', 'Moditimewatch', 'string', 'Название сайта');
		insertConfig.run('site_tagline', 'Fine Time Delivery', 'string', 'Слоган');
		insertConfig.run('contact_phone', '+7 (999) 960-43-22', 'string', 'Телефон');
		insertConfig.run('contact_email', 'concierge@moditimewatch.com', 'string', 'Email');
		insertConfig.run('office_address', 'г. Москва, Кутузовский проспект, д. 12, офис 501', 'string', 'Адрес офиса');

		// ============================================
		// 2. WIDGETS
		// ============================================
		const insertWidget = db.prepare(`
			INSERT INTO widgets (type, title, description, data_json, is_active, position)
			VALUES (?, ?, ?, ?, ?, ?)
		`);

		const telegramCtaData = JSON.stringify({
			eyebrow: 'Подписка',
			title: 'Канал Moditimewatch в Telegram',
			description: 'Анонсы лимитированных релизов, backstage сервиса, приглашения на закрытые презентации и инсайды о Programmatic SEO-поддоменах для партнёров.',
			features: [
				'Эксклюзивные предложения до попадания в витрину',
				'Подборки часов по городам — Programmatic SEO коконы',
				'Короткие обзоры новинок и советы коллекционеров'
			],
			ctaText: 'Подписаться',
			ctaHref: 'https://t.me/moditimewatch',
			channelUrl: 'https://t.me/s/moditimewatch'
		});

		insertWidget.run('telegram_cta', 'Telegram CTA', 'Виджет подписки на Telegram канал', telegramCtaData, 1, 0);

		// ============================================
		// 3. БРЕНДЫ
		// ============================================
		const insertBrand = db.prepare(`
			INSERT INTO brands (slug, name, description, country, is_active, position)
			VALUES (?, ?, ?, ?, ?, ?)
		`);

		const brands = [
			['rolex', 'Rolex', 'Легендарные швейцарские часы с 1905 года', 'Switzerland', 1, 1],
			['patek-philippe', 'Patek Philippe', 'Самая престижная часовая мануфактура', 'Switzerland', 1, 2],
			['audemars-piguet', 'Audemars Piguet', 'Создатели легендарной Royal Oak', 'Switzerland', 1, 3],
			['omega', 'Omega', 'Официальный хронометрист Олимпийских игр', 'Switzerland', 1, 4],
			['vacheron-constantin', 'Vacheron Constantin', 'Старейшая часовая мануфактура (1755)', 'Switzerland', 1, 5],
			['cartier', 'Cartier', 'Французский дом высокого ювелирного искусства', 'France', 1, 6],
			['jaeger-lecoultre', 'Jaeger-LeCoultre', 'Швейцарская мануфактура с 1833 года', 'Switzerland', 1, 7],
			['iwc', 'IWC Schaffhausen', 'Инженерное совершенство с 1868 года', 'Switzerland', 1, 8]
		];

		brands.forEach(brand => insertBrand.run(...brand));

		// ============================================
		// 4. КАТЕГОРИИ
		// ============================================
		const insertCategory = db.prepare(`
			INSERT INTO categories (slug, name, description, parent_id, is_active, position)
			VALUES (?, ?, ?, ?, ?, ?)
		`);

		insertCategory.run('mens', 'Мужские часы', 'Премиальные часы для мужчин', null, 1, 1);
		insertCategory.run('womens', 'Женские часы', 'Элегантные часы для женщин', null, 1, 2);
		insertCategory.run('sport', 'Спортивные', 'Хронографы и дайверские часы', null, 1, 3);
		insertCategory.run('business', 'Деловые', 'Классические часы для делового стиля', null, 1, 4);

		console.log('✅ Seeded: brands, categories, widgets');

		// Продолжение в следующей части...
	});

	seed();

	console.log('✅ Database seeded successfully');
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

initializeDatabase();
seedDatabase();

export default db;
