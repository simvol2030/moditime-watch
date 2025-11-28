# DATABASE DESIGN - MODITIMEWATCH

**Дата создания:** 20 ноября 2024
**Версия:** 1.0
**Проект:** Moditimewatch - премиальный сервис доставки часов

---

## 📊 МАСШТАБ ПРОЕКТА

### Критические метрики:
- **Товары:** 1,000 - 9,000 часов
- **Города:** 250 городов для Programmatic SEO
- **Статьи городов:** 125,000 - 250,000 страниц (500-1000 на город)
- **Бренды:** ~50 швейцарских брендов
- **Изображения:** Файлы на сервере

---

## 🎯 КЛЮЧЕВЫЕ ТРЕБОВАНИЯ

### 1. **Архитектура данных:**
- ✅ Layout управление (header/footer) через БД
- ✅ Виджеты как переиспользуемые блоки
- ✅ Динамические фильтры (не фиксированные)
- ✅ Произвольные характеристики товаров (key-value)
- ✅ Опциональные поля (если нет данных - не выводить)

### 2. **Programmatic SEO:**
- ✅ 250 городов × 500-1000 статей
- ✅ Шаблонный + уникальный контент
- ✅ Импорт из MD файлов через скрипты
- ✅ Правильная перелинковка

### 3. **E-commerce:**
- ✅ Корзина (клиентская + серверная опция)
- ✅ Заказы с сохранением
- ✅ Email уведомления
- ✅ Без личного кабинета (пока)

### 4. **Технические:**
- ✅ Admin.js совместимость
- ✅ Скрипты массового импорта
- ✅ SEO для каждой страницы
- ✅ Файлы изображений на сервере

---

## 📄 ИНВЕНТАРИЗАЦИЯ: СТРАНИЦЫ → ДАННЫЕ → ТАБЛИЦЫ

### **УРОВЕНЬ 1: LAYOUT (ГЛОБАЛЬНЫЙ)**

#### SiteHeader
**Данные:**
- Desktop navigation menu (с submenu)
- Mobile navigation menu
- Logo, branding
- Theme toggle settings

**TypeScript:** `NavigationLink[]`

**Таблицы БД:**
```sql
-- Главные настройки сайта
site_config (
  id, key, value, type, description
)

-- Элементы навигации (header + footer)
navigation_items (
  id, label, href, parent_id, position,
  menu_type, -- 'header_desktop', 'header_mobile', 'footer'
  is_active
)
```

#### SiteFooter
**Данные:**
- Footer columns (3-4 колонки)
- Links в каждой колонке
- Contact info
- Legal links (privacy, terms)

**Таблицы БД:**
```sql
footer_sections (
  id, title, position, column_number
)

footer_links (
  id, section_id, label, href, position
)
```

---

### **УРОВЕНЬ 2: ВИДЖЕТЫ**

**Реестр виджетов:**

| Виджет | Тип | Где используется | Интерфейс |
|--------|-----|------------------|-----------|
| Telegram CTA | `telegram_cta` | Главная, Каталог, Товар, Города | `TelegramCtaSectionProps` |
| Watch Search | `search_widget` | Города (SEO) | Custom |
| Recommendations | `recommendations` | Товар | `RecommendationsProps` (динамически) |

**Таблица БД:**
```sql
widgets (
  id INTEGER PRIMARY KEY,
  type TEXT NOT NULL, -- 'telegram_cta', 'search_widget'
  title TEXT,
  description TEXT,
  data_json TEXT, -- JSON с данными виджета
  is_active INTEGER DEFAULT 1,
  position INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Пример data_json для Telegram CTA:**
```json
{
  "eyebrow": "Подписка",
  "title": "Канал Moditimewatch в Telegram",
  "description": "Анонсы релизов...",
  "features": ["Эксклюзивные предложения", "Подборки часов"],
  "ctaText": "Подписаться",
  "ctaHref": "https://t.me/moditimewatch",
  "channelUrl": "https://t.me/s/moditimewatch"
}
```

---

### **УРОВЕНЬ 3: ГЛАВНАЯ СТРАНИЦА**

**Секции:**

#### 1. Hero Section
**Интерфейс:** `HeroContent`

**Таблица:**
```sql
home_hero (
  id INTEGER PRIMARY KEY,
  tagline TEXT, -- "Коллекция 2025 / Premium Selection"
  title TEXT,
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
  is_active INTEGER DEFAULT 1
)
```

#### 2. Collections Section
**Интерфейс:** `CollectionsSectionProps`

**Таблицы:**
```sql
collections (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE,
  category TEXT, -- "Для переговоров"
  title TEXT, -- "Executive Collection"
  description TEXT,
  image_url TEXT,
  link_text TEXT,
  link_href TEXT,
  position INTEGER,
  is_active INTEGER DEFAULT 1
)

-- Связь товаров с коллекциями (опционально)
collection_products (
  collection_id INTEGER,
  product_id INTEGER,
  position INTEGER,
  PRIMARY KEY (collection_id, product_id)
)
```

#### 3. Showcase (Бестселлеры)
**Интерфейс:** `ShowcaseSectionProps`

**Источник:** `products` с фильтром `featured=1` или отдельная таблица:
```sql
home_showcase (
  id INTEGER PRIMARY KEY,
  product_id INTEGER FOREIGN KEY,
  position INTEGER
)
```

#### 4. Experience (Сервисы)
**Интерфейс:** `ExperienceSectionProps`

**Таблица:**
```sql
home_services (
  id INTEGER PRIMARY KEY,
  icon_svg TEXT, -- SVG код
  title TEXT, -- "Консьерж-подбор"
  description TEXT,
  link_text TEXT,
  link_href TEXT,
  position INTEGER,
  is_active INTEGER DEFAULT 1
)

home_service_stats (
  id INTEGER PRIMARY KEY,
  label TEXT, -- "Поиск лимитированных серий"
  value TEXT, -- "72 часа"
  position INTEGER
)
```

#### 5. Testimonials
**Интерфейс:** `TestimonialsSectionProps`

**Таблица:**
```sql
testimonials (
  id INTEGER PRIMARY KEY,
  name TEXT,
  position TEXT, -- "Партнёр инвестиционного фонда"
  avatar_url TEXT,
  text TEXT,
  choice TEXT, -- "Patek Philippe Nautilus 5811/1G"
  is_active INTEGER DEFAULT 1,
  display_order INTEGER
)
```

#### 6. Editorial (Журнал на главной)
**Источник:** `articles` с фильтром `featured=1`

---

### **УРОВЕНЬ 4: КАТАЛОГ**

**Компоненты:**

#### CatalogHero
**Интерфейс:** `CatalogHeroProps`

**Таблица:**
```sql
catalog_config (
  id INTEGER PRIMARY KEY,
  eyebrow TEXT,
  title TEXT,
  description TEXT,
  stats_json TEXT -- [{"label": "Всего моделей", "value": "284"}]
)
```

#### CatalogFilters (ДИНАМИЧЕСКИЕ!)
**Интерфейс:** `CatalogFiltersProps`

**Таблицы:**
```sql
-- Атрибуты фильтров
filter_attributes (
  id INTEGER PRIMARY KEY,
  slug TEXT UNIQUE, -- "brand", "material", "mechanism"
  name TEXT, -- "Бренд", "Материал корпуса"
  type TEXT CHECK, -- 'checkbox', 'range', 'select'
  is_active INTEGER DEFAULT 1,
  position INTEGER
)

-- Значения фильтров
filter_values (
  id INTEGER PRIMARY KEY,
  attribute_id INTEGER FOREIGN KEY,
  value TEXT, -- "rolex", "gold-18k"
  label TEXT, -- "Rolex", "Золото 18К"
  position INTEGER
)

-- Связь товаров с фильтрами (many-to-many)
product_filters (
  product_id INTEGER,
  filter_value_id INTEGER,
  PRIMARY KEY (product_id, filter_value_id)
)
```

**Примеры атрибутов:**
- brand (Бренд)
- material (Материал корпуса)
- mechanism (Тип механизма)
- scenario (Сценарий использования)
- availability (Доступность)
- gender (Пол)
- case_size (Размер корпуса) - range
- water_resistance (Водонепроницаемость) - range

---

### **УРОВЕНЬ 5: ТОВАРЫ (CORE)**

#### Основная таблица
```sql
products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  brand_id INTEGER NOT NULL,
  category_id INTEGER,

  -- Основная информация
  name TEXT NOT NULL, -- "Royal Oak Selfwinding Chronograph 41 mm"
  sku TEXT UNIQUE, -- "AP-26240OR"

  -- Цены
  price INTEGER NOT NULL, -- в копейках: 4890000
  price_formatted TEXT, -- "4 890 000 ₽" (можно генерировать)
  price_note TEXT, -- "Включая страховку и доставку"
  installment_text TEXT, -- "от 390 000 ₽ / мес"
  trade_in_text TEXT, -- "Бесплатный аудит за 24 часа"

  -- Наличие
  availability_status TEXT CHECK IN ('in-stock', 'pre-order', 'waitlist'),
  availability_text TEXT, -- "В наличии на складе в Женеве"

  -- Контент
  description TEXT, -- краткое описание
  description_html TEXT, -- полное описание (HTML)

  -- Рейтинг и отзывы
  rating REAL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER DEFAULT 0,

  -- Метаданные
  meta_json TEXT, -- произвольные данные для будущих расширений

  -- Флаги
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0, -- для бестселлеров на главной
  is_new INTEGER DEFAULT 0,
  is_limited INTEGER DEFAULT 0,

  -- Позиционирование
  position INTEGER DEFAULT 0,

  -- Timestamp
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
)

CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_featured ON products(is_featured, is_active);
CREATE INDEX idx_products_price ON products(price);
```

#### Бренды
```sql
brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- "Rolex", "Patek Philippe"
  description TEXT,
  logo_url TEXT,
  country TEXT DEFAULT 'Switzerland',
  founded_year INTEGER,
  website_url TEXT,
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE INDEX idx_brands_slug ON brands(slug);
```

#### Категории
```sql
categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- "Мужские", "Женские", "Спортивные"
  description TEXT,
  parent_id INTEGER, -- для иерархии (подкатегории)
  image_url TEXT,
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
)

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
```

#### Изображения товаров
```sql
product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  url TEXT NOT NULL, -- "/media/products/royal-oak-1.jpg"
  alt TEXT,
  thumbnail_url TEXT, -- автогенерация или явно
  position INTEGER DEFAULT 0,
  is_main INTEGER DEFAULT 0, -- главное изображение
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)

CREATE INDEX idx_product_images_product ON product_images(product_id);
```

#### Характеристики товаров (KEY-VALUE для произвольности!)
```sql
product_specs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  group_name TEXT NOT NULL, -- "Корпус", "Механизм", "Циферблат", "Браслет"
  spec_key TEXT NOT NULL, -- "Материал", "Диаметр", "Калибр"
  spec_value TEXT NOT NULL, -- "Розовое золото 18К", "41 мм"
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)

CREATE INDEX idx_product_specs_product ON product_specs(product_id);
CREATE INDEX idx_product_specs_group ON product_specs(group_name);
```

#### Опции товаров (для будущих вариаций)
```sql
product_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  option_type TEXT NOT NULL, -- "diameter", "package", "bracelet"
  option_label TEXT NOT NULL, -- "Диаметр корпуса"
  option_value TEXT NOT NULL, -- "41 mm"
  option_value_label TEXT, -- "41 мм"
  price_modifier INTEGER DEFAULT 0, -- изменение цены (+/-)
  is_default INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)

CREATE INDEX idx_product_options_product ON product_options(product_id);
```

#### Highlights (ключевые особенности)
```sql
product_highlights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  icon TEXT, -- emoji или SVG path
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

#### Табы товара
```sql
product_tabs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  tab_id TEXT NOT NULL, -- "description", "delivery", "warranty"
  tab_label TEXT NOT NULL, -- "Описание", "Доставка и оплата"
  content TEXT, -- HTML контент
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

#### Benefits (преимущества в summary)
```sql
product_benefits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  icon_svg TEXT, -- SVG код иконки
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

---

### **УРОВЕНЬ 6: ФИЛЬТРЫ (ДИНАМИЧЕСКИЕ)**

**Концепция:** Фильтры не фиксированные, а создаются из характеристик товаров

**Таблицы:**
```sql
-- Атрибуты фильтров
filter_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, -- "brand", "material", "mechanism"
  name TEXT NOT NULL, -- "Бренд", "Материал корпуса"
  type TEXT CHECK IN ('checkbox', 'range', 'select'),
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0
)

-- Значения фильтров
filter_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attribute_id INTEGER NOT NULL,
  value TEXT NOT NULL, -- "rolex", "gold-18k", "automatic"
  label TEXT NOT NULL, -- "Rolex", "Золото 18К", "Автоматический"
  position INTEGER DEFAULT 0,

  FOREIGN KEY (attribute_id) REFERENCES filter_attributes(id) ON DELETE CASCADE,
  UNIQUE(attribute_id, value)
)

-- Связь товаров с фильтрами (many-to-many)
product_filters (
  product_id INTEGER NOT NULL,
  filter_value_id INTEGER NOT NULL,

  PRIMARY KEY (product_id, filter_value_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (filter_value_id) REFERENCES filter_values(id) ON DELETE CASCADE
)

CREATE INDEX idx_product_filters_product ON product_filters(product_id);
CREATE INDEX idx_product_filters_value ON product_filters(filter_value_id);
```

**Примеры атрибутов:**
- `brand` (тип: checkbox) → автозаполнение из `brands`
- `material` (тип: checkbox) → "Сталь", "Золото 18К", "Платина"
- `mechanism` (тип: checkbox) → "Автоматический", "Механический", "Кварц"
- `scenario` (тип: checkbox) → "Инвестиция", "Подарок", "Спорт"
- `price` (тип: range) → min-max
- `case_diameter` (тип: range) → в мм

---

### **УРОВЕНЬ 7: ОТЗЫВЫ**

**Интерфейс:** `ProductReview`

**Таблица:**
```sql
reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,

  -- Автор
  author_name TEXT NOT NULL,
  author_role TEXT, -- "Коллекционер", "Инвестор"
  author_avatar_url TEXT,

  -- Отзыв
  rating REAL NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  delivery_info TEXT, -- "Москва, экспресс 48 ч"

  -- Метаданные
  is_verified INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)

CREATE INDEX idx_reviews_product ON reviews(product_id, is_active);
CREATE INDEX idx_reviews_rating ON reviews(rating);
```

---

### **УРОВЕНЬ 8: ЖУРНАЛ**

**Интерфейс:** `ArticlePageData`

**Таблицы:**
```sql
article_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL, -- "История брендов", "Инвестиции"
  position INTEGER DEFAULT 0
)

articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  excerpt TEXT, -- для карточек
  content TEXT, -- HTML контент

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
  is_featured INTEGER DEFAULT 0, -- для главной страницы

  -- Timestamp
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (category_id) REFERENCES article_categories(id) ON DELETE SET NULL
)

CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_published ON articles(is_published, published_at);
CREATE INDEX idx_articles_featured ON articles(is_featured, is_published);
```

#### Теги статей (опционально)
```sql
article_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
)

article_tag_relations (
  article_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (article_id, tag_id)
)
```

#### Связанные товары в статьях
```sql
article_related_products (
  article_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,

  PRIMARY KEY (article_id, product_id),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

---

### **УРОВЕНЬ 9: PROGRAMMATIC SEO (ГОРОДА)** 🔥

**Масштаб:** 250 городов × 500-1000 статей = **125,000 - 250,000 страниц**

**Интерфейс:** `CityPageData`

**Таблицы:**
```sql
cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, -- "moscow", "spb", "kazan"

  -- Названия (склонения для текстов)
  name TEXT NOT NULL, -- "Москва"
  name_genitive TEXT, -- "Москвы"
  name_prepositional TEXT, -- "Москве"
  name_dative TEXT, -- "Москве" (кому?)
  name_accusative TEXT, -- "Москву" (что?)

  -- География
  region TEXT, -- "Центральный федеральный округ"
  population INTEGER,
  timezone TEXT, -- "Europe/Moscow"

  -- Доставка
  delivery_days INTEGER DEFAULT 3,
  delivery_price TEXT DEFAULT 'Бесплатно',

  -- Hero секция
  hero_image_url TEXT,
  hero_title TEXT, -- "Доставка премиальных часов в Москву"
  hero_subtitle TEXT,

  -- SEO
  meta_description TEXT,

  -- Флаги
  is_active INTEGER DEFAULT 1,
  priority INTEGER DEFAULT 0, -- приоритет города

  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE INDEX idx_cities_slug ON cities(slug);
CREATE INDEX idx_cities_active ON cities(is_active, priority);
```

**`city_articles`** (огромная таблица! 125k-250k записей)
```sql
city_articles (
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
  source_file TEXT, -- путь к исходному MD файлу
  imported_at DATETIME,

  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE(city_id, slug)
)

-- КРИТИЧНЫЕ ИНДЕКСЫ для производительности!
CREATE INDEX idx_city_articles_city ON city_articles(city_id, is_published);
CREATE INDEX idx_city_articles_slug ON city_articles(city_id, slug);
CREATE INDEX idx_city_articles_published ON city_articles(is_published, published_at);
CREATE INDEX idx_city_articles_template ON city_articles(template_type);
```

**Связь статей городов с товарами (перелинковка):**
```sql
city_article_products (
  article_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,

  PRIMARY KEY (article_id, product_id),
  FOREIGN KEY (article_id) REFERENCES city_articles(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
)
```

---

### **УРОВЕНЬ 10: ЗАКАЗЫ**

**Таблицы:**
```sql
orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT UNIQUE NOT NULL, -- "MTW-2024-00001"

  -- Клиент
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,

  -- Доставка
  delivery_address TEXT NOT NULL,
  delivery_comment TEXT,

  -- Финансы
  total_amount INTEGER NOT NULL, -- в копейках

  -- Статус (пока простой, без истории)
  status TEXT DEFAULT 'pending' CHECK IN ('pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled'),

  -- Timestamp
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)

CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

**`order_items`**
```sql
order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER, -- может быть NULL если товар удален

  -- Snapshots на момент заказа (важно!)
  product_name TEXT NOT NULL,
  product_brand TEXT NOT NULL,
  product_sku TEXT,
  price INTEGER NOT NULL, -- цена на момент заказа

  -- Количество
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  subtotal INTEGER NOT NULL, -- price × quantity

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
)

CREATE INDEX idx_order_items_order ON order_items(order_id);
```

---

### **УРОВЕНЬ 11: SEO (УНИВЕРСАЛЬНАЯ ТАБЛИЦА)**

**Интерфейс:** `SeoProps`

**Таблица для SEO КАЖДОЙ страницы:**
```sql
seo_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Идентификация страницы
  page_type TEXT NOT NULL, -- 'home', 'catalog', 'product', 'article', 'city_page', 'city_article', 'static_page'
  entity_id INTEGER, -- ID товара/статьи/города (NULL для статических)
  slug TEXT, -- для построения canonical URL

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
)

CREATE INDEX idx_seo_page_type ON seo_meta(page_type, entity_id);
```

---

### **УРОВЕНЬ 12: СТАТИЧЕСКИЕ СТРАНИЦЫ**

**Для:** /about, /contacts, /delivery, /warranty, /privacy, /terms

```sql
pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL, -- "about", "contacts", "delivery"
  title TEXT NOT NULL,
  content TEXT, -- HTML
  template TEXT, -- 'about', 'contacts', 'legal', etc.
  meta_json TEXT, -- дополнительные данные (forms, contact info)
  is_published INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

### **УРОВЕНЬ 13: EMAIL УВЕДОМЛЕНИЯ**

**Таблица:**
```sql
email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT UNIQUE NOT NULL, -- "order_confirmation", "order_shipped"
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL, -- HTML шаблон с плейсхолдерами
  body_text TEXT, -- plain text версия
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Лог отправленных email:**
```sql
email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_key TEXT,
  recipient_email TEXT,
  subject TEXT,
  status TEXT, -- 'sent', 'failed', 'pending'
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

---

## 📊 ИТОГОВЫЙ СПИСОК ТАБЛИЦ (30+ ТАБЛИЦ)

### **Глобальные (3):**
1. `site_config`
2. `navigation_items`
3. `widgets`

### **Layout (2):**
4. `footer_sections`
5. `footer_links`

### **Главная страница (4):**
6. `home_hero`
7. `collections`
8. `collection_products` (many-to-many)
9. `home_services`
10. `testimonials`

### **Товары (Core) (10):**
11. `brands`
12. `categories`
13. `products` ⭐
14. `product_images`
15. `product_specs` (key-value) ⭐
16. `product_options`
17. `product_highlights`
18. `product_tabs`
19. `product_benefits`
20. `reviews`

### **Фильтры (3):**
21. `filter_attributes`
22. `filter_values`
23. `product_filters` (many-to-many)

### **Журнал (4):**
24. `article_categories`
25. `articles`
26. `article_tags` (опционально)
27. `article_related_products`

### **Programmatic SEO (3):** 🔥
28. `cities` (250 записей)
29. `city_articles` (125k-250k записей!) ⭐
30. `city_article_products`

### **E-commerce (2):**
31. `orders`
32. `order_items`

### **SEO & Разное (4):**
33. `seo_meta` ⭐
34. `pages`
35. `email_templates`
36. `email_log` (опционально)

---

## 🔥 КРИТИЧНЫЕ ТАБЛИЦЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ

**Большие таблицы:**
1. `city_articles` - **125,000-250,000 записей** → нужны индексы!
2. `products` - **9,000 записей** → индексы на slug, brand_id, category_id
3. `product_filters` - **до 90,000 записей** (9k товаров × 10 фильтров средне)
4. `seo_meta` - **~260,000 записей** (все страницы)

**Обязательные индексы:**
- `idx_city_articles_city` - для быстрой выборки статей города
- `idx_products_slug` - для страниц товаров
- `idx_product_filters_value` - для фильтрации каталога
- `idx_seo_page_type` - для SEO lookup

---

## ✅ ГОТОВО К РЕАЛИЗАЦИИ

Документ зафиксирован. Теперь создам:
1. ER-диаграмму
2. SQL файл со схемой
3. Seed функцию
4. Запущу агента для аудита

**Подтверждаете переход к реализации?**
