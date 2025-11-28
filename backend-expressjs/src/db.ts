import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { join } from 'path';

// Path to the shared database
const DB_PATH = join(__dirname, '..', '..', 'data', 'db', 'sqlite', 'app.db');

// Create Sequelize instance with SQLite
export const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: DB_PATH,
	logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Enable WAL mode via raw query
sequelize.query('PRAGMA foreign_keys = ON;').then(() => {
	console.log('✅ Foreign keys enabled');
});
sequelize.query('PRAGMA journal_mode = WAL;').then(() => {
	console.log('✅ WAL mode enabled');
});

// ============================================
// БЛОК 1: ГЛОБАЛЬНЫЕ НАСТРОЙКИ
// ============================================

// Site Config
export class SiteConfig extends Model {
	declare id: number;
	declare key: string;
	declare value: string | null;
	declare type: string;
	declare description: string | null;
	declare created_at: Date;
	declare updated_at: Date;
}

SiteConfig.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		key: { type: DataTypes.STRING, allowNull: false, unique: true },
		value: { type: DataTypes.TEXT },
		type: { type: DataTypes.STRING, defaultValue: 'string' },
		description: { type: DataTypes.TEXT },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'site_config', timestamps: false }
);

// Navigation Items
export class NavigationItem extends Model {
	declare id: number;
	declare label: string;
	declare href: string;
	declare parent_id: number | null;
	declare position: number;
	declare menu_type: string;
	declare is_active: number;
	declare created_at: Date;
}

NavigationItem.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		label: { type: DataTypes.STRING, allowNull: false },
		href: { type: DataTypes.STRING, allowNull: false },
		parent_id: { type: DataTypes.INTEGER },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		menu_type: { type: DataTypes.STRING, allowNull: false },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'navigation_items', timestamps: false }
);

// Widgets
export class Widget extends Model {
	declare id: number;
	declare type: string;
	declare title: string | null;
	declare description: string | null;
	declare data_json: string | null;
	declare is_active: number;
	declare position: number;
	declare created_at: Date;
	declare updated_at: Date;
}

Widget.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		type: { type: DataTypes.STRING, allowNull: false },
		title: { type: DataTypes.STRING },
		description: { type: DataTypes.TEXT },
		data_json: { type: DataTypes.TEXT },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'widgets', timestamps: false }
);

// ============================================
// БЛОК 2: LAYOUT - FOOTER
// ============================================

export class FooterSection extends Model {
	declare id: number;
	declare title: string;
	declare position: number;
	declare column_number: number;
	declare is_active: number;
}

FooterSection.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		title: { type: DataTypes.STRING, allowNull: false },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		column_number: { type: DataTypes.INTEGER, defaultValue: 1 },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 }
	},
	{ sequelize, tableName: 'footer_sections', timestamps: false }
);

export class FooterLink extends Model {
	declare id: number;
	declare section_id: number;
	declare label: string;
	declare href: string;
	declare position: number;
}

FooterLink.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		section_id: { type: DataTypes.INTEGER, allowNull: false },
		label: { type: DataTypes.STRING, allowNull: false },
		href: { type: DataTypes.STRING, allowNull: false },
		position: { type: DataTypes.INTEGER, defaultValue: 0 }
	},
	{ sequelize, tableName: 'footer_links', timestamps: false }
);

// ============================================
// БЛОК 3: ГЛАВНАЯ СТРАНИЦА
// ============================================

export class HomeHero extends Model {
	declare id: number;
	declare tagline: string;
	declare title: string;
	declare description: string | null;
	declare primary_cta_text: string | null;
	declare primary_cta_href: string | null;
	declare secondary_cta_text: string | null;
	declare secondary_cta_href: string | null;
	declare image_url: string | null;
	declare image_alt: string | null;
	declare image_badge_label: string | null;
	declare image_badge_title: string | null;
	declare stats_json: string | null;
	declare quick_links_json: string | null;
	declare brands_json: string | null;
	declare is_active: number;
	declare created_at: Date;
	declare updated_at: Date;
}

HomeHero.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		tagline: { type: DataTypes.STRING, allowNull: false },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		primary_cta_text: { type: DataTypes.STRING },
		primary_cta_href: { type: DataTypes.STRING },
		secondary_cta_text: { type: DataTypes.STRING },
		secondary_cta_href: { type: DataTypes.STRING },
		image_url: { type: DataTypes.STRING },
		image_alt: { type: DataTypes.STRING },
		image_badge_label: { type: DataTypes.STRING },
		image_badge_title: { type: DataTypes.STRING },
		stats_json: { type: DataTypes.TEXT },
		quick_links_json: { type: DataTypes.TEXT },
		brands_json: { type: DataTypes.TEXT },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'home_hero', timestamps: false }
);

export class Collection extends Model {
	declare id: number;
	declare slug: string;
	declare category: string;
	declare title: string;
	declare description: string | null;
	declare image_url: string | null;
	declare link_text: string | null;
	declare link_href: string | null;
	declare position: number;
	declare is_active: number;
	declare created_at: Date;
	declare updated_at: Date;
}

Collection.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		category: { type: DataTypes.STRING, allowNull: false },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		image_url: { type: DataTypes.STRING },
		link_text: { type: DataTypes.STRING },
		link_href: { type: DataTypes.STRING },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'collections', timestamps: false }
);

export class HomeService extends Model {
	declare id: number;
	declare icon_svg: string | null;
	declare title: string;
	declare description: string | null;
	declare link_text: string | null;
	declare link_href: string | null;
	declare position: number;
	declare is_active: number;
}

HomeService.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		icon_svg: { type: DataTypes.TEXT },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		link_text: { type: DataTypes.STRING },
		link_href: { type: DataTypes.STRING },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 }
	},
	{ sequelize, tableName: 'home_services', timestamps: false }
);

export class HomeServiceStat extends Model {
	declare id: number;
	declare label: string;
	declare value: string;
	declare position: number;
}

HomeServiceStat.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		label: { type: DataTypes.STRING, allowNull: false },
		value: { type: DataTypes.STRING, allowNull: false },
		position: { type: DataTypes.INTEGER, defaultValue: 0 }
	},
	{ sequelize, tableName: 'home_service_stats', timestamps: false }
);

export class Testimonial extends Model {
	declare id: number;
	declare name: string;
	declare position: string | null;
	declare avatar_url: string | null;
	declare text: string;
	declare choice: string | null;
	declare is_active: number;
	declare display_order: number;
	declare created_at: Date;
}

Testimonial.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING, allowNull: false },
		position: { type: DataTypes.STRING },
		avatar_url: { type: DataTypes.STRING },
		text: { type: DataTypes.TEXT, allowNull: false },
		choice: { type: DataTypes.STRING },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'testimonials', timestamps: false }
);

// ============================================
// БЛОК 4: ТОВАРЫ (E-COMMERCE CORE)
// ============================================

export class Brand extends Model {
	declare id: number;
	declare slug: string;
	declare name: string;
	declare description: string | null;
	declare logo_url: string | null;
	declare country: string;
	declare founded_year: number | null;
	declare website_url: string | null;
	declare is_active: number;
	declare position: number;
	declare created_at: Date;
	declare updated_at: Date;
}

Brand.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		logo_url: { type: DataTypes.STRING },
		country: { type: DataTypes.STRING, defaultValue: 'Switzerland' },
		founded_year: { type: DataTypes.INTEGER },
		website_url: { type: DataTypes.STRING },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'brands', timestamps: false }
);

export class Category extends Model {
	declare id: number;
	declare slug: string;
	declare name: string;
	declare description: string | null;
	declare parent_id: number | null;
	declare image_url: string | null;
	declare is_active: number;
	declare position: number;
	declare created_at: Date;
	declare updated_at: Date;
}

Category.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		parent_id: { type: DataTypes.INTEGER },
		image_url: { type: DataTypes.STRING },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'categories', timestamps: false }
);

export class Product extends Model {
	declare id: number;
	declare slug: string;
	declare brand_id: number;
	declare category_id: number | null;
	declare name: string;
	declare sku: string | null;
	declare price: number;
	declare price_note: string | null;
	declare installment_text: string | null;
	declare trade_in_text: string | null;
	declare availability_status: string;
	declare availability_text: string | null;
	declare description: string | null;
	declare description_html: string | null;
	declare rating: number;
	declare review_count: number;
	declare meta_json: string | null;
	declare specs_json: string | null;
	declare is_active: number;
	declare is_featured: number;
	declare is_new: number;
	declare is_limited: number;
	declare position: number;
	declare created_at: Date;
	declare updated_at: Date;
}

Product.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		brand_id: { type: DataTypes.INTEGER, allowNull: false },
		category_id: { type: DataTypes.INTEGER },
		name: { type: DataTypes.STRING, allowNull: false },
		sku: { type: DataTypes.STRING, unique: true },
		price: { type: DataTypes.INTEGER, allowNull: false },
		price_note: { type: DataTypes.STRING },
		installment_text: { type: DataTypes.STRING },
		trade_in_text: { type: DataTypes.STRING },
		availability_status: { type: DataTypes.STRING, defaultValue: 'in-stock' },
		availability_text: { type: DataTypes.STRING },
		description: { type: DataTypes.TEXT },
		description_html: { type: DataTypes.TEXT },
		rating: { type: DataTypes.FLOAT, defaultValue: 0 },
		review_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		meta_json: { type: DataTypes.TEXT },
		specs_json: { type: DataTypes.TEXT },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		is_featured: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_new: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_limited: { type: DataTypes.INTEGER, defaultValue: 0 },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'products', timestamps: false }
);

export class ProductImage extends Model {
	declare id: number;
	declare product_id: number;
	declare url: string;
	declare alt: string | null;
	declare thumbnail_url: string | null;
	declare position: number;
	declare is_main: number;
	declare created_at: Date;
}

ProductImage.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		product_id: { type: DataTypes.INTEGER, allowNull: false },
		url: { type: DataTypes.STRING, allowNull: false },
		alt: { type: DataTypes.STRING },
		thumbnail_url: { type: DataTypes.STRING },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_main: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'product_images', timestamps: false }
);

export class ProductHighlight extends Model {
	declare id: number;
	declare product_id: number;
	declare icon: string | null;
	declare title: string;
	declare description: string | null;
	declare position: number;
}

ProductHighlight.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		product_id: { type: DataTypes.INTEGER, allowNull: false },
		icon: { type: DataTypes.STRING },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		position: { type: DataTypes.INTEGER, defaultValue: 0 }
	},
	{ sequelize, tableName: 'product_highlights', timestamps: false }
);

export class ProductTab extends Model {
	declare id: number;
	declare product_id: number;
	declare tab_id: string;
	declare tab_label: string;
	declare content: string | null;
	declare position: number;
}

ProductTab.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		product_id: { type: DataTypes.INTEGER, allowNull: false },
		tab_id: { type: DataTypes.STRING, allowNull: false },
		tab_label: { type: DataTypes.STRING, allowNull: false },
		content: { type: DataTypes.TEXT },
		position: { type: DataTypes.INTEGER, defaultValue: 0 }
	},
	{ sequelize, tableName: 'product_tabs', timestamps: false }
);

export class ProductBenefit extends Model {
	declare id: number;
	declare product_id: number;
	declare icon_svg: string | null;
	declare title: string;
	declare description: string | null;
	declare position: number;
}

ProductBenefit.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		product_id: { type: DataTypes.INTEGER, allowNull: false },
		icon_svg: { type: DataTypes.TEXT },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		position: { type: DataTypes.INTEGER, defaultValue: 0 }
	},
	{ sequelize, tableName: 'product_benefits', timestamps: false }
);

// ============================================
// БЛОК 5: ОТЗЫВЫ
// ============================================

export class Review extends Model {
	declare id: number;
	declare product_id: number;
	declare author_name: string;
	declare author_role: string | null;
	declare author_avatar_url: string | null;
	declare rating: number;
	declare content: string;
	declare delivery_info: string | null;
	declare is_verified: number;
	declare helpful_count: number;
	declare is_active: number;
	declare created_at: Date;
}

Review.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		product_id: { type: DataTypes.INTEGER, allowNull: false },
		author_name: { type: DataTypes.STRING, allowNull: false },
		author_role: { type: DataTypes.STRING },
		author_avatar_url: { type: DataTypes.STRING },
		rating: { type: DataTypes.FLOAT, allowNull: false },
		content: { type: DataTypes.TEXT, allowNull: false },
		delivery_info: { type: DataTypes.STRING },
		is_verified: { type: DataTypes.INTEGER, defaultValue: 0 },
		helpful_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'reviews', timestamps: false }
);

// ============================================
// БЛОК 6: ЖУРНАЛ (СТАТЬИ)
// ============================================

export class ArticleCategory extends Model {
	declare id: number;
	declare slug: string;
	declare name: string;
	declare position: number;
	declare created_at: Date;
}

ArticleCategory.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		name: { type: DataTypes.STRING, allowNull: false },
		position: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'article_categories', timestamps: false }
);

export class Article extends Model {
	declare id: number;
	declare slug: string;
	declare title: string;
	declare subtitle: string | null;
	declare excerpt: string | null;
	declare content: string | null;
	declare image_url: string | null;
	declare category_id: number | null;
	declare author_name: string | null;
	declare author_role: string | null;
	declare author_avatar_url: string | null;
	declare read_time: number | null;
	declare views_count: number;
	declare is_published: number;
	declare is_featured: number;
	declare published_at: Date | null;
	declare created_at: Date;
	declare updated_at: Date;
}

Article.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		title: { type: DataTypes.STRING, allowNull: false },
		subtitle: { type: DataTypes.STRING },
		excerpt: { type: DataTypes.TEXT },
		content: { type: DataTypes.TEXT },
		image_url: { type: DataTypes.STRING },
		category_id: { type: DataTypes.INTEGER },
		author_name: { type: DataTypes.STRING },
		author_role: { type: DataTypes.STRING },
		author_avatar_url: { type: DataTypes.STRING },
		read_time: { type: DataTypes.INTEGER },
		views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_published: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_featured: { type: DataTypes.INTEGER, defaultValue: 0 },
		published_at: { type: DataTypes.DATE },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'articles', timestamps: false }
);

// ============================================
// БЛОК 7: ГОРОДА (PROGRAMMATIC SEO)
// ============================================

export class City extends Model {
	declare id: number;
	declare slug: string;
	declare name: string;
	declare name_genitive: string | null;
	declare name_prepositional: string | null;
	declare name_dative: string | null;
	declare name_accusative: string | null;
	declare region: string | null;
	declare population: number | null;
	declare timezone: string | null;
	declare delivery_days: number;
	declare delivery_price: string;
	declare hero_image_url: string | null;
	declare hero_title: string | null;
	declare hero_subtitle: string | null;
	declare meta_description: string | null;
	declare is_active: number;
	declare priority: number;
	declare created_at: Date;
	declare updated_at: Date;
}

City.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		name: { type: DataTypes.STRING, allowNull: false },
		name_genitive: { type: DataTypes.STRING },
		name_prepositional: { type: DataTypes.STRING },
		name_dative: { type: DataTypes.STRING },
		name_accusative: { type: DataTypes.STRING },
		region: { type: DataTypes.STRING },
		population: { type: DataTypes.INTEGER },
		timezone: { type: DataTypes.STRING },
		delivery_days: { type: DataTypes.INTEGER, defaultValue: 3 },
		delivery_price: { type: DataTypes.STRING, defaultValue: 'Бесплатно' },
		hero_image_url: { type: DataTypes.STRING },
		hero_title: { type: DataTypes.STRING },
		hero_subtitle: { type: DataTypes.STRING },
		meta_description: { type: DataTypes.TEXT },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		priority: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'cities', timestamps: false }
);

export class CityArticle extends Model {
	declare id: number;
	declare city_id: number;
	declare slug: string;
	declare title: string;
	declare excerpt: string | null;
	declare content: string | null;
	declare image_url: string | null;
	declare template_type: string;
	declare views_count: number;
	declare is_published: number;
	declare published_at: Date;
	declare source_file: string | null;
	declare imported_at: Date | null;
	declare created_at: Date;
	declare updated_at: Date;
}

CityArticle.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		city_id: { type: DataTypes.INTEGER, allowNull: false },
		slug: { type: DataTypes.STRING, allowNull: false },
		title: { type: DataTypes.STRING, allowNull: false },
		excerpt: { type: DataTypes.TEXT },
		content: { type: DataTypes.TEXT },
		image_url: { type: DataTypes.STRING },
		template_type: { type: DataTypes.STRING, defaultValue: 'standard' },
		views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
		is_published: { type: DataTypes.INTEGER, defaultValue: 1 },
		published_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		source_file: { type: DataTypes.STRING },
		imported_at: { type: DataTypes.DATE },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'city_articles', timestamps: false }
);

// ============================================
// БЛОК 8: ЗАКАЗЫ
// ============================================

export class Order extends Model {
	declare id: number;
	declare order_number: string;
	declare customer_name: string;
	declare customer_phone: string;
	declare customer_email: string | null;
	declare delivery_address: string;
	declare delivery_comment: string | null;
	declare total_amount: number;
	declare status: string;
	declare created_at: Date;
	declare updated_at: Date;
}

Order.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		order_number: { type: DataTypes.STRING, allowNull: false, unique: true },
		customer_name: { type: DataTypes.STRING, allowNull: false },
		customer_phone: { type: DataTypes.STRING, allowNull: false },
		customer_email: { type: DataTypes.STRING },
		delivery_address: { type: DataTypes.TEXT, allowNull: false },
		delivery_comment: { type: DataTypes.TEXT },
		total_amount: { type: DataTypes.INTEGER, allowNull: false },
		status: { type: DataTypes.STRING, defaultValue: 'pending' },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'orders', timestamps: false }
);

export class OrderItem extends Model {
	declare id: number;
	declare order_id: number;
	declare product_id: number | null;
	declare product_name: string;
	declare product_brand: string;
	declare product_sku: string | null;
	declare price: number;
	declare quantity: number;
	declare subtotal: number;
}

OrderItem.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		order_id: { type: DataTypes.INTEGER, allowNull: false },
		product_id: { type: DataTypes.INTEGER },
		product_name: { type: DataTypes.STRING, allowNull: false },
		product_brand: { type: DataTypes.STRING, allowNull: false },
		product_sku: { type: DataTypes.STRING },
		price: { type: DataTypes.INTEGER, allowNull: false },
		quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
		subtotal: { type: DataTypes.INTEGER, allowNull: false }
	},
	{ sequelize, tableName: 'order_items', timestamps: false }
);

export class OrderStatusHistory extends Model {
	declare id: number;
	declare order_id: number;
	declare old_status: string | null;
	declare new_status: string;
	declare changed_by: string | null;
	declare comment: string | null;
	declare changed_at: Date;
}

OrderStatusHistory.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		order_id: { type: DataTypes.INTEGER, allowNull: false },
		old_status: { type: DataTypes.STRING },
		new_status: { type: DataTypes.STRING, allowNull: false },
		changed_by: { type: DataTypes.STRING },
		comment: { type: DataTypes.TEXT },
		changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'order_status_history', timestamps: false }
);

// ============================================
// БЛОК 9: SEO И СТРАНИЦЫ
// ============================================

export class SeoMeta extends Model {
	declare id: number;
	declare page_type: string;
	declare entity_id: number | null;
	declare slug: string | null;
	declare title: string;
	declare description: string;
	declare keywords: string | null;
	declare og_title: string | null;
	declare og_description: string | null;
	declare og_type: string;
	declare og_image: string | null;
	declare twitter_card: string;
	declare json_ld: string | null;
	declare canonical_url: string | null;
	declare noindex: number;
	declare created_at: Date;
	declare updated_at: Date;
}

SeoMeta.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		page_type: { type: DataTypes.STRING, allowNull: false },
		entity_id: { type: DataTypes.INTEGER },
		slug: { type: DataTypes.STRING },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT, allowNull: false },
		keywords: { type: DataTypes.STRING },
		og_title: { type: DataTypes.STRING },
		og_description: { type: DataTypes.TEXT },
		og_type: { type: DataTypes.STRING, defaultValue: 'website' },
		og_image: { type: DataTypes.STRING },
		twitter_card: { type: DataTypes.STRING, defaultValue: 'summary_large_image' },
		json_ld: { type: DataTypes.TEXT },
		canonical_url: { type: DataTypes.STRING },
		noindex: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'seo_meta', timestamps: false }
);

export class Page extends Model {
	declare id: number;
	declare slug: string;
	declare title: string;
	declare content: string | null;
	declare template: string | null;
	declare meta_json: string | null;
	declare is_published: number;
	declare created_at: Date;
	declare updated_at: Date;
}

Page.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		slug: { type: DataTypes.STRING, allowNull: false, unique: true },
		title: { type: DataTypes.STRING, allowNull: false },
		content: { type: DataTypes.TEXT },
		template: { type: DataTypes.STRING },
		meta_json: { type: DataTypes.TEXT },
		is_published: { type: DataTypes.INTEGER, defaultValue: 1 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'pages', timestamps: false }
);

// ============================================
// БЛОК 10: EMAIL
// ============================================

export class EmailTemplate extends Model {
	declare id: number;
	declare template_key: string;
	declare subject: string;
	declare body_html: string;
	declare body_text: string | null;
	declare is_active: number;
	declare created_at: Date;
	declare updated_at: Date;
}

EmailTemplate.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		template_key: { type: DataTypes.STRING, allowNull: false, unique: true },
		subject: { type: DataTypes.STRING, allowNull: false },
		body_html: { type: DataTypes.TEXT, allowNull: false },
		body_text: { type: DataTypes.TEXT },
		is_active: { type: DataTypes.INTEGER, defaultValue: 1 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
		updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'email_templates', timestamps: false }
);

export class EmailLog extends Model {
	declare id: number;
	declare template_key: string | null;
	declare recipient_email: string;
	declare subject: string | null;
	declare status: string;
	declare error_message: string | null;
	declare sent_at: Date;
}

EmailLog.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		template_key: { type: DataTypes.STRING },
		recipient_email: { type: DataTypes.STRING, allowNull: false },
		subject: { type: DataTypes.STRING },
		status: { type: DataTypes.STRING, defaultValue: 'pending' },
		error_message: { type: DataTypes.TEXT },
		sent_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'email_log', timestamps: false }
);

// ============================================
// БЛОК 11: SYSTEM (ADMINS, USERS, POSTS)
// ============================================

export class User extends Model {
	declare id: number;
	declare name: string;
	declare email: string;
	declare created_at: Date;
}

User.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		name: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'users', timestamps: false }
);

export class Post extends Model {
	declare id: number;
	declare user_id: number;
	declare title: string;
	declare content: string | null;
	declare published: number;
	declare created_at: Date;
}

Post.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		user_id: { type: DataTypes.INTEGER, allowNull: false },
		title: { type: DataTypes.STRING, allowNull: false },
		content: { type: DataTypes.TEXT },
		published: { type: DataTypes.INTEGER, defaultValue: 0 },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'posts', timestamps: false }
);

export class Admin extends Model {
	declare id: number;
	declare email: string;
	declare password: string;
	declare role: 'super-admin' | 'editor' | 'viewer';
	declare name: string;
	declare created_at: Date;
}

Admin.init(
	{
		id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		password: { type: DataTypes.STRING, allowNull: false },
		role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'viewer' },
		name: { type: DataTypes.STRING, allowNull: false },
		created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
	},
	{ sequelize, tableName: 'admins', timestamps: false }
);

// ============================================
// ASSOCIATIONS (для связей между моделями)
// ============================================

// Footer
FooterSection.hasMany(FooterLink, { foreignKey: 'section_id', as: 'links' });
FooterLink.belongsTo(FooterSection, { foreignKey: 'section_id' });

// Products
Brand.hasMany(Product, { foreignKey: 'brand_id', as: 'products' });
Product.belongsTo(Brand, { foreignKey: 'brand_id', as: 'brand' });

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
ProductImage.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductHighlight, { foreignKey: 'product_id', as: 'highlights' });
ProductHighlight.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductTab, { foreignKey: 'product_id', as: 'tabs' });
ProductTab.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(ProductBenefit, { foreignKey: 'product_id', as: 'benefits' });
ProductBenefit.belongsTo(Product, { foreignKey: 'product_id' });

Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'product_id' });

// Articles
ArticleCategory.hasMany(Article, { foreignKey: 'category_id', as: 'articles' });
Article.belongsTo(ArticleCategory, { foreignKey: 'category_id', as: 'category' });

// Cities
City.hasMany(CityArticle, { foreignKey: 'city_id', as: 'articles' });
CityArticle.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

// Orders
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });

// Users/Posts
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Navigation self-reference
NavigationItem.hasMany(NavigationItem, { foreignKey: 'parent_id', as: 'children' });
NavigationItem.belongsTo(NavigationItem, { foreignKey: 'parent_id', as: 'parent' });

// Category self-reference
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parentCategory' });

// ============================================
// INITIALIZATION
// ============================================

export async function initializeAdmins() {
	try {
		await Admin.sync();

		const adminCount = await Admin.count();
		if (adminCount === 0) {
			await Admin.create({
				email: process.env.ADMIN_EMAIL || 'admin@example.com',
				password: process.env.ADMIN_PASSWORD || 'admin123',
				role: 'super-admin',
				name: 'Super Admin'
			});
			console.log('✅ Default super-admin created');
		}
	} catch (error) {
		console.error('Error initializing admins:', error);
	}
}

console.log('✅ Sequelize models defined for Moditimewatch database (36 tables)');

export default sequelize;
