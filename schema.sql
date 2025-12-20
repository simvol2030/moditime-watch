-- ============================================
-- MODITIMEWATCH DATABASE SCHEMA
-- Version: 1.0
-- Date: 2024-11-20
-- Database: SQLite
-- Total Tables: 36
-- ============================================

-- Включаем foreign keys
PRAGMA foreign_keys = ON;

-- ============================================
-- БЛОК 1: ГЛОБАЛЬНЫЕ НАСТРОЙКИ
-- ============================================

-- Общие настройки сайта (email, telegram, seo и др.)
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  category TEXT DEFAULT 'general', -- 'general', 'email', 'telegram', 'seo'
  description TEXT,
  is_sensitive INTEGER DEFAULT 0, -- 1 = скрывать значение (пароли, токены)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_config_category ON site_config(category);
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);

-- Навигационное меню (header + footer)
CREATE TABLE IF NOT EXISTS navigation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  parent_id INTEGER, -- NULL для top-level, ID для submenu
  position INTEGER DEFAULT 0,
  menu_type TEXT NOT NULL, -- 'header_desktop', 'header_mobile', 'footer'
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES navigation_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_navigation_menu_type ON navigation_items(menu_type, is_active, position);
CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation_items(parent_id);

-- Переиспользуемые виджеты
CREATE TABLE IF NOT EXISTS widgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL, -- 'telegram_cta', 'search_widget'
  title TEXT,
  description TEXT,
  data_json TEXT, -- JSON с данными виджета
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_widgets_type ON widgets(type, is_active);

-- ============================================
-- БЛОК 2: LAYOUT - FOOTER
-- ============================================

CREATE TABLE IF NOT EXISTS footer_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  column_number INTEGER DEFAULT 1, -- номер колонки (1-4)
  is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS footer_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_id INTEGER NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (section_id) REFERENCES footer_sections(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_footer_links_section ON footer_links(section_id, position);

-- ============================================
-- БЛОК 3: ГЛАВНАЯ СТРАНИЦА
-- ============================================

-- Hero секция
CREATE TABLE IF NOT EXISTS home_hero (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tagline TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  primary_cta_text TEXT,
  primary_cta_href TEXT,
  secondary_cta_text TEXT,
  secondary_cta_href TEXT,
  image_url TEXT,
  image_alt TEXT,
  image_badge_label TEXT,
  image_badge_title TEXT,
  stats_json TEXT, -- [{"value": "560+", "label": "моделей"}]
  quick_links_json TEXT, -- [{"text": "Мужские", "href": "#"}]
  brands_json TEXT, -- ["Rolex", "Patek Philippe"]
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Кураторские коллекции
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- "Для переговоров", "Для путешествий"
  title TEXT NOT NULL, -- "Executive Collection"
  description TEXT,
  image_url TEXT,
  link_text TEXT,
  link_href TEXT,
  position INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_active ON collections(is_active, position);

-- Связь коллекций с товарами (many-to-many)
CREATE TABLE IF NOT EXISTS collection_products (
  collection_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,

  PRIMARY KEY (collection_id, product_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_collection_products_product ON collection_products(product_id);

-- Сервисы на главной (Experience Section)
CREATE TABLE IF NOT EXISTS home_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  icon_svg TEXT, -- полный SVG код
  title TEXT NOT NULL,
  description TEXT,
  link_text TEXT,
  link_href TEXT,
  position INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1
);

-- Статистика для Experience Section
CREATE TABLE IF NOT EXISTS home_service_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  position INTEGER DEFAULT 0
);

-- Отзывы клиентов
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position TEXT, -- "Партнёр инвестиционного фонда"
  avatar_url TEXT,
  text TEXT NOT NULL,
  choice TEXT, -- "Patek Philippe Nautilus 5811/1G"
  is_active INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active, display_order);

-- ============================================
-- БЛОК 4: ТОВАРЫ (E-COMMERCE CORE)
-- ============================================

-- Бренды
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  country TEXT DEFAULT 'Switzerland',
  founded_year INTEGER,
  website_url TEXT,
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active, position);

-- Категории
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER, -- для иерархии
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active, position);

-- Товары (ОСНОВНАЯ ТАБЛИЦА)
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  brand_id INTEGER NOT NULL,
  category_id INTEGER,

  -- Основная информация
  name TEXT NOT NULL,
  sku TEXT UNIQUE,

  -- Цены (в копейках!)
  price INTEGER NOT NULL,
  price_note TEXT,
  installment_text TEXT,
  trade_in_text TEXT,

  -- Наличие
  availability_status TEXT CHECK (availability_status IN ('in-stock', 'pre-order', 'waitlist')) DEFAULT 'in-stock',
  availability_text TEXT,

  -- Контент
  description TEXT,
  description_html TEXT,

  -- Рейтинг
  rating REAL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,

  -- Метаданные
  meta_json TEXT, -- произвольные данные
  specs_json TEXT, -- Характеристики в JSON формате (PRODUCTION-READY!)

  -- Флаги
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0, -- бестселлер на главной
  is_new INTEGER DEFAULT 0,
  is_limited INTEGER DEFAULT 0,

  -- Позиционирование
  position INTEGER DEFAULT 0,

  -- Timestamp
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, position);
CREATE INDEX IF NOT EXISTS idx_products_active_price ON products(is_active, price) WHERE is_active = 1;
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name COLLATE NOCASE);

-- Изображения товаров
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  thumbnail_url TEXT,
  position INTEGER DEFAULT 0,
  is_main INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, position);

-- Характеристики товаров (DEPRECATED - используйте products.specs_json!)
-- Оставлено для совместимости, но рекомендуется использовать specs_json
CREATE TABLE IF NOT EXISTS product_specs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  group_name TEXT NOT NULL, -- "Корпус", "Механизм", "Циферблат"
  spec_key TEXT NOT NULL, -- "Материал", "Диаметр"
  spec_value TEXT NOT NULL, -- "Розовое золото 18К", "41 мм"
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specs(product_id);
CREATE INDEX IF NOT EXISTS idx_product_specs_group ON product_specs(product_id, group_name);

-- ПРИМЕЧАНИЕ: Для production используйте products.specs_json:
-- {
--   "Корпус": [
--     {"label": "Материал", "value": "Розовое золото 18К"},
--     {"label": "Диаметр", "value": "41 мм"}
--   ],
--   "Механизм": [...]
-- }

-- Опции товаров (для будущих вариаций)
CREATE TABLE IF NOT EXISTS product_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  option_type TEXT NOT NULL, -- "diameter", "package", "bracelet"
  option_label TEXT NOT NULL, -- "Диаметр корпуса"
  option_value TEXT NOT NULL, -- "41 mm"
  option_value_label TEXT,
  price_modifier INTEGER DEFAULT 0,
  is_default INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);

-- Highlights (ключевые особенности)
CREATE TABLE IF NOT EXISTS product_highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  icon TEXT, -- emoji или SVG
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_highlights_product ON product_highlights(product_id, position);

-- Табы товара
CREATE TABLE IF NOT EXISTS product_tabs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  tab_id TEXT NOT NULL, -- "description", "delivery", "warranty"
  tab_label TEXT NOT NULL,
  content TEXT, -- HTML
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_tabs_product ON product_tabs(product_id, position);

-- Benefits в ProductSummary
CREATE TABLE IF NOT EXISTS product_benefits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  icon_svg TEXT,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_benefits_product ON product_benefits(product_id, position);

-- ============================================
-- БЛОК 5: ДИНАМИЧЕСКИЕ ФИЛЬТРЫ
-- ============================================

-- Атрибуты фильтров
CREATE TABLE IF NOT EXISTS filter_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('checkbox', 'range', 'select')) DEFAULT 'checkbox',
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_filter_attributes_slug ON filter_attributes(slug);

-- Значения фильтров
CREATE TABLE IF NOT EXISTS filter_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attribute_id INTEGER NOT NULL,
  value TEXT NOT NULL, -- machine name: "rolex", "gold-18k"
  label TEXT NOT NULL, -- display name: "Rolex", "Золото 18К"
  position INTEGER DEFAULT 0,

  FOREIGN KEY (attribute_id) REFERENCES filter_attributes(id) ON DELETE CASCADE,
  UNIQUE(attribute_id, value)
);

CREATE INDEX IF NOT EXISTS idx_filter_values_attribute ON filter_values(attribute_id, position);

-- Связь товаров с фильтрами (many-to-many)
CREATE TABLE IF NOT EXISTS product_filters (
  product_id INTEGER NOT NULL,
  filter_value_id INTEGER NOT NULL,

  PRIMARY KEY (product_id, filter_value_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (filter_value_id) REFERENCES filter_values(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_filters_product ON product_filters(product_id);
CREATE INDEX IF NOT EXISTS idx_product_filters_value ON product_filters(filter_value_id);

-- ============================================
-- БЛОК 6: ОТЗЫВЫ
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,

  -- Автор
  author_name TEXT NOT NULL,
  author_role TEXT,
  author_avatar_url TEXT,

  -- Отзыв
  rating REAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  delivery_info TEXT,

  -- Метаданные
  is_verified INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(product_id, rating);

-- ============================================
-- БЛОК 7: ЖУРНАЛ
-- ============================================

-- Категории статей
CREATE TABLE IF NOT EXISTS article_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON article_categories(slug);

-- Статьи
CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT,
  content TEXT, -- HTML

  -- Изображения
  image_url TEXT,

  -- Категория
  category_id INTEGER,

  -- Автор
  author_name TEXT,
  author_role TEXT,
  author_avatar_url TEXT,

  -- Метаданные
  read_time INTEGER, -- в минутах
  views_count INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0, -- для главной

  -- Timestamp
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id, is_published);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured, is_published);

-- Теги статей (опционально)
CREATE TABLE IF NOT EXISTS article_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS article_tag_relations (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,

  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES article_tags(id) ON DELETE CASCADE
);

-- Связанные товары в статьях
CREATE TABLE IF NOT EXISTS article_related_products (
  article_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,

  PRIMARY KEY (article_id, product_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_article_related_products_product ON article_related_products(product_id);

-- ============================================
-- БЛОК 8: PROGRAMMATIC SEO (ГОРОДА) 🔥
-- ============================================

-- Города (250 штук)
CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,

  -- Названия (склонения)
  name TEXT NOT NULL, -- "Москва"
  name_genitive TEXT, -- "Москвы"
  name_prepositional TEXT, -- "Москве"
  name_dative TEXT, -- "Москве"
  name_accusative TEXT, -- "Москву"

  -- География
  region TEXT,
  population INTEGER,
  timezone TEXT,

  -- Доставка
  delivery_days INTEGER DEFAULT 3,
  delivery_price TEXT DEFAULT 'Бесплатно',

  -- Hero
  hero_image_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,

  -- SEO
  meta_description TEXT,

  -- Флаги
  is_active INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_active ON cities(is_active, priority);

-- Статьи для городов (125,000 - 250,000 записей!) 🔥
CREATE TABLE IF NOT EXISTS city_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER NOT NULL,
  slug TEXT NOT NULL, -- уникален в пределах города

  -- Контент
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT, -- HTML
  image_url TEXT,

  -- Тип шаблона (для вариативности)
  template_type TEXT DEFAULT 'standard', -- 'unique', 'variant_A', 'variant_B', 'standard'

  -- Метаданные
  views_count INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Для импорта из MD
  source_file TEXT,
  imported_at DATETIME,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE(city_id, slug)
);

-- КРИТИЧНЫЕ ИНДЕКСЫ для производительности!
CREATE INDEX IF NOT EXISTS idx_city_articles_city ON city_articles(city_id, is_published);
CREATE INDEX IF NOT EXISTS idx_city_articles_slug ON city_articles(city_id, slug);
CREATE INDEX IF NOT EXISTS idx_city_articles_published ON city_articles(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_city_articles_template ON city_articles(template_type);
-- Оптимизированный составной индекс для списка статей города (250k записей!)
CREATE INDEX IF NOT EXISTS idx_city_articles_list_optimized ON city_articles(city_id, is_published, published_at DESC) WHERE is_published = 1;

-- Перелинковка статей городов с товарами
CREATE TABLE IF NOT EXISTS city_article_products (
  article_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,

  PRIMARY KEY (article_id, product_id),
  FOREIGN KEY (article_id) REFERENCES city_articles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_city_article_products_product ON city_article_products(product_id);

-- ============================================
-- БЛОК 9: ЗАКАЗЫ
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL,

  -- Клиент
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- Доставка
  delivery_address TEXT NOT NULL,
  delivery_comment TEXT,

  -- Финансы
  total_amount INTEGER NOT NULL, -- в копейках

  -- Статус
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled')),

  -- Timestamp
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Позиции заказа
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER, -- может быть NULL если товар удален

  -- Snapshots на момент заказа
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  product_sku TEXT,
  price INTEGER NOT NULL,

  -- Количество
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  subtotal INTEGER NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- История изменения статусов заказов (PRODUCTION-READY!)
CREATE TABLE IF NOT EXISTS order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by TEXT, -- admin email or "system"
  comment TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_order_status_history ON order_status_history(order_id, changed_at DESC);

-- ============================================
-- БЛОК 10: ПОЛНОТЕКСТОВЫЙ ПОИСК (FTS5)
-- ============================================

-- FTS5 виртуальная таблица для быстрого поиска товаров
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  name,
  description,
  brand_name,
  content='products',
  content_rowid='id',
  tokenize='porter unicode61 remove_diacritics 1'
);

-- Триггеры для автоматического обновления FTS индекса
CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, description, brand_name)
  SELECT NEW.id, NEW.name, NEW.description, b.name
  FROM brands b WHERE b.id = NEW.brand_id;
END;

CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
  UPDATE products_fts SET
    name = NEW.name,
    description = NEW.description
  WHERE rowid = NEW.id;
END;

-- ============================================
-- БЛОК 11: SEO (УНИВЕРСАЛЬНАЯ ТАБЛИЦА)
-- ============================================

CREATE TABLE IF NOT EXISTS seo_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Идентификация страницы
  page_type TEXT NOT NULL, -- 'home', 'catalog', 'product', 'article', 'city_page', 'city_article', 'static_page'
  entity_id INTEGER, -- ID сущности (NULL для статических)
  slug TEXT,

  -- Basic SEO
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT,

  -- Open Graph
  og_title TEXT,
  og_description TEXT,
  og_type TEXT DEFAULT 'website',
  og_image TEXT,

  -- Twitter
  twitter_card TEXT DEFAULT 'summary_large_image',

  -- Микроразметка
  json_ld TEXT, -- JSON-LD Schema.org

  -- Управление
  canonical_url TEXT,
  noindex INTEGER DEFAULT 0,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(page_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_seo_page_type ON seo_meta(page_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_seo_slug ON seo_meta(slug);

-- ============================================
-- БЛОК 11: СТАТИЧЕСКИЕ СТРАНИЦЫ
-- ============================================

CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- HTML
  template TEXT, -- 'about', 'contacts', 'legal'
  meta_json TEXT, -- дополнительные данные
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);

-- ============================================
-- БЛОК 12: КАТАЛОГ
-- ============================================

CREATE TABLE IF NOT EXISTS catalog_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  eyebrow TEXT,
  title TEXT NOT NULL,
  description TEXT,
  stats_json TEXT, -- [{"label": "Всего моделей", "value": "284"}]
  is_active INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- БЛОК 13: EMAIL УВЕДОМЛЕНИЯ
-- ============================================

CREATE TABLE IF NOT EXISTS email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT UNIQUE NOT NULL, -- 'order_confirmation', 'order_shipped'
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);

-- Лог отправленных email (опционально)
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending', -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_recipient ON email_log(recipient_email);

-- ============================================
-- КОНЕЦ СХЕМЫ
-- ============================================
