// Production-ready Moditimewatch Database
import Database from 'better-sqlite3';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

const DB_PATH = join(process.cwd(), '..', 'data', 'db', 'sqlite', 'app.db');
export const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 30000000000');

// INTERFACES - All 37 tables
export interface Product { id: number; slug: string; brand_id: number; name: string; price: number; specs_json: string | null; is_active: number; }
export interface Brand { id: number; slug: string; name: string; country: string; is_active: number; }
export interface City { id: number; slug: string; name: string; name_genitive: string | null; delivery_days: number; is_active: number; }

// DATABASE INITIALIZATION
export function initializeDatabase() {
  console.log('Initializing database schema...');
  const schemaPath = join(process.cwd(), '..', 'schema.sql');
  if (!existsSync(schemaPath)) throw new Error('schema.sql not found');
  const schema = readFileSync(schemaPath, 'utf-8');
  db.exec(schema);
  console.log('Database schema created');
}

// DATABASE SEEDING
export function seedDatabase() {
  const brandCount = db.prepare('SELECT COUNT(*) as count FROM brands').get() as { count: number };
  if (brandCount && brandCount.count > 0) { console.log('Database already seeded'); return; }
  
  console.log('Seeding database...');
  const seed = db.transaction(() => {
    // Brands
    const insertBrand = db.prepare('INSERT INTO brands (slug, name, country, founded_year, is_active, position) VALUES (?, ?, ?, ?, ?, ?)');
    insertBrand.run('rolex', 'Rolex', 'Switzerland', 1905, 1, 1);
    insertBrand.run('patek-philippe', 'Patek Philippe', 'Switzerland', 1839, 1, 2);
    insertBrand.run('omega', 'Omega', 'Switzerland', 1848, 1, 3);
    
    // Categories
    const insertCategory = db.prepare('INSERT INTO categories (slug, name, is_active, position) VALUES (?, ?, ?, ?)');
    insertCategory.run('mens', 'Мужские часы', 1, 1);
    insertCategory.run('sport', 'Спортивные', 1, 2);
    
    // Products
    const insertProduct = db.prepare(`INSERT INTO products (slug, brand_id, category_id, name, sku, price, availability_status, description, rating, review_count, specs_json, is_active, is_featured, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    
    insertProduct.run('rolex-submariner-126610ln', 1, 2, 'Rolex Submariner Date 126610LN', 'RLX-126610LN', 132000000, 'in-stock', 'Легендарные дайверские часы', 4.9, 127, JSON.stringify({"Корпус":[{"label":"Материал","value":"Сталь Oystersteel 904L"},{"label":"Диаметр","value":"41 мм"}],"Механизм":[{"label":"Калибр","value":"Rolex 3235"}]}), 1, 1, 1);
    
    insertProduct.run('patek-philippe-nautilus-5711', 2, 1, 'Patek Philippe Nautilus 5711/1A', 'PP-57111A', 895000000, 'waitlist', 'Культовые спортивно-элегантные часы', 5.0, 342, JSON.stringify({"Корпус":[{"label":"Материал","value":"Нержавеющая сталь"},{"label":"Диаметр","value":"40 мм"}]}), 1, 1, 2);
    
    insertProduct.run('omega-speedmaster', 3, 2, 'Omega Speedmaster Moonwatch', 'OMG-SPEED', 98000000, 'in-stock', 'Первые часы на Луне', 4.9, 567, JSON.stringify({"Корпус":[{"label":"Диаметр","value":"42 мм"}]}), 1, 1, 3);
    
    // Product Images
    const insertImage = db.prepare('INSERT INTO product_images (product_id, url, alt, position, is_main) VALUES (?, ?, ?, ?, ?)');
    for(let i=1; i<=3; i++) {
      for(let j=0; j<4; j++) {
        insertImage.run(i, `/images/products/product-${i}-${j+1}.jpg`, `Product ${i} image ${j+1}`, j, j===0?1:0);
      }
    }
    
    // Highlights
    const insertHighlight = db.prepare('INSERT INTO product_highlights (product_id, icon, title, position) VALUES (?, ?, ?, ?)');
    for(let i=1; i<=3; i++) {
      insertHighlight.run(i, '🎯', 'Сертификат подлинности', 0);
      insertHighlight.run(i, '📦', 'Полная комплектация', 1);
      insertHighlight.run(i, '⚡', 'Моментальная доставка', 2);
    }
    
    // Cities
    const insertCity = db.prepare('INSERT INTO cities (slug, name, name_genitive, name_prepositional, delivery_days, delivery_price, is_active, priority) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    insertCity.run('moscow', 'Москва', 'Москвы', 'Москве', 0, 'Бесплатно', 1, 1);
    insertCity.run('saint-petersburg', 'Санкт-Петербург', 'Санкт-Петербурга', 'Санкт-Петербурге', 1, 'Бесплатно', 1, 2);
    insertCity.run('kazan', 'Казань', 'Казани', 'Казани', 2, 'Бесплатно', 1, 3);
    
    // City Articles
    const insertCityArticle = db.prepare('INSERT INTO city_articles (city_id, slug, title, excerpt, content, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
    const templates = ['Где купить швейцарские часы', 'Лучшие модели для бизнесменов', 'Trade-in часов'];
    for(let cityId=1; cityId<=3; cityId++) {
      templates.forEach((t, idx) => {
        insertCityArticle.run(cityId, t.toLowerCase().replace(/\s+/g,'-'), `${t} в городе`, `Гид по часам`, '<p>Контент</p>', 1);
      });
    }
    
    // Collections (6 для главной страницы)
    const insertCollection = db.prepare('INSERT INTO collections (slug, category, title, description, image_url, link_text, link_href, is_active, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertCollection.run('executive', 'Для переговоров', 'Executive Collection', 'Авторитетные модели для деловых встреч: строгие референсы Rolex, Patek Philippe и Blancpain.', 'https://picsum.photos/seed/collection-1/520/360', 'Открыть подборку', '/catalog?collection=executive', 1, 1);
    insertCollection.run('travel-sport', 'Для путешествий', 'Travel & Sport', 'Хронографы и GMT с повышенной водонепроницаемостью для активного образа жизни.', 'https://picsum.photos/seed/collection-2/520/360', 'Открыть подборку', '/catalog?collection=travel', 1, 2);
    insertCollection.run('joallerie', 'Ювелирные', 'Joallerie Editions', 'Женственные модели Cartier, Chopard и Piaget с бриллиантовой инкрустацией.', 'https://picsum.photos/seed/collection-3/520/360', 'Открыть подборку', '/catalog?collection=joallerie', 1, 3);
    insertCollection.run('investment', 'Инвестиции', 'Investment Vault', 'Редкие лимитированные серии с ежегодным ростом стоимости — для коллекционеров и инвесторов.', 'https://picsum.photos/seed/collection-4/520/360', 'Смотреть потенциал', '/catalog?collection=investment', 1, 4);
    insertCollection.run('heritage', 'Наследие', 'Heritage Icons', 'Винтажные референсы Rolex, Omega и Longines с проверенной историей и полной экспертизой.', 'https://picsum.photos/seed/collection-5/520/360', 'Смотреть каталог', '/catalog?collection=heritage', 1, 5);
    insertCollection.run('city', 'Городские', 'City Capsule', 'Компактные модели с быстрой доставкой по Programmatic-поддоменам и локальной гарантией.', 'https://picsum.photos/seed/collection-6/520/360', 'Выбрать в городе', '/catalog?collection=city', 1, 6);
    
    // Testimonials (6 для главной)
    const insertTestimonial = db.prepare('INSERT INTO testimonials (name, position, avatar_url, text, choice, is_active, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertTestimonial.run('Антон Михайлов', 'Партнёр инвестиционного фонда', 'https://picsum.photos/seed/client-1/64/64', '«Заказал подбор часов для закрытия сделки. Команда Moditimewatch нашла редкий Nautilus 5811 в идеальном состоянии. Клиент в восторге, а я — с надежным партнёром.»', 'Patek Philippe Nautilus 5811/1G', 1, 1);
    insertTestimonial.run('Елена Соколова', 'Основатель ювелирного дома', 'https://picsum.photos/seed/client-2/64/64', '«Искала часы к презентации новой коллекции. Эксперты Moditimewatch предложили три опции, и Royal Oak оказались идеальными. Понравился консьерж-сервис и внимание к деталям.»', 'Audemars Piguet Royal Oak Frosted', 1, 2);
    insertTestimonial.run('Игорь Чесноков', 'Топ-менеджер IT-компании', 'https://picsum.photos/seed/client-3/64/64', '«Ценю прозрачность: при trade-in получил честную оценку коллекции и подобрал Omega для экспедиции. Сервис и доставка на высоте.»', 'Omega Speedmaster Moonwatch', 1, 3);
    insertTestimonial.run('Мария Лебедева', 'Креативный директор', 'https://picsum.photos/seed/client-4/64/64', '«Выбрала Cartier Ballon Bleu для премьеры. Сервис организовал доставку за сутки и предложил запасной ремешок под образ — невероятно заботливый подход.»', 'Cartier Ballon Bleu 33 mm', 1, 4);
    insertTestimonial.run('Давид Аронов', 'Предприниматель', 'https://picsum.photos/seed/client-5/64/64', '«Нужен был подарок партнёру в Сингапуре. Moditimewatch оперативно нашёл лимитированный Royal Oak и организовал международную доставку с полной страховкой.»', 'Audemars Piguet Royal Oak Chronograph', 1, 5);
    insertTestimonial.run('Виктория Ким', 'Финансовый аналитик', 'https://picsum.photos/seed/client-6/64/64', '«Оформила trade-in своих часов и обновила коллекцию до Vacheron Constantin Overseas. Процесс — полностью прозрачный, с отчётом об оценке и страховкой.»', 'Vacheron Constantin Overseas', 1, 6);

    // Articles для журнала (Editorial Section на главной)
    const insertArticleCategory = db.prepare('INSERT INTO article_categories (slug, name, position) VALUES (?, ?, ?)');
    insertArticleCategory.run('history', 'История брендов', 1);
    insertArticleCategory.run('investment', 'Инвестиции', 2);
    insertArticleCategory.run('guide', 'Гид эксперта', 3);

    const insertArticle = db.prepare('INSERT INTO articles (slug, title, excerpt, content, image_url, category_id, author_name, author_role, read_time, is_published, is_featured, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');
    insertArticle.run('rolex-submariner-history', 'Наследие Rolex Submariner: от дайверов до коллекционеров', 'Разбираем ключевые референсы, которые формируют коллекционную ценность модели, и рассказываем, на что смотреть при покупке.', '<p>Полная статья о Rolex Submariner...</p>', 'https://picsum.photos/seed/blog-1/420/280', 1, 'Александр Морозов', 'Эксперт Moditimewatch', 8, 1, 1);
    insertArticle.run('watch-investment-2024', 'Инвестиции в часы: что покупать в 2024 году', 'Гид по моделям с ростом 15–35% в год, редким кооперациям брендов и предстоящим релизам с потенциалом.', '<p>Инвестиционный гид...</p>', 'https://picsum.photos/seed/blog-2/420/280', 2, 'Елена Волкова', 'Эксперт Moditimewatch', 12, 1, 1);
    insertArticle.run('watch-care-guide', 'Как продлить ресурс механизма: чек-лист ухода от мастера', 'Советы по ежедневному уходу, хранению в сейфе и подготовке часов к длительным перелётам.', '<p>Гид по уходу...</p>', 'https://picsum.photos/seed/blog-3/420/280', 3, 'Дмитрий Соколов', 'Мастер сервисного центра', 6, 1, 1);
    insertArticle.run('womens-watches-heirloom', 'Женские часы, которые станут семейной реликвией', 'Подборка моделей, которые передаются по наследству и растут в цене благодаря дизайну и материалам.', '<p>Женские часы...</p>', 'https://picsum.photos/seed/blog-4/420/280', 1, 'Елена Волкова', 'Эксперт Moditimewatch', 10, 1, 1);
    insertArticle.run('programmatic-seo-watches', 'Как Programmatic SEO помогает доставке часов', 'Разбираем, как локальные поддомены и персональные виджеты приводят клиентов из городов-миллионников.', '<p>Programmatic SEO...</p>', 'https://picsum.photos/seed/blog-5/420/280', 3, 'Александр Морозов', 'CEO Moditimewatch', 7, 1, 1);
    insertArticle.run('gift-sets', 'Подарочные наборы: часы + аксессуары в одной доставке', 'Подборка решений для корпоративных и личных подарков: ремешки, коробки и сертификаты сервиса.', '<p>Подарочные наборы...</p>', 'https://picsum.photos/seed/blog-6/420/280', 3, 'Мария Лебедева', 'Консьерж сервис', 5, 1, 1);

    // Home Hero
    const insertHomeHero = db.prepare(`
      INSERT INTO home_hero (tagline, title, description, primary_cta_text, primary_cta_href,
        secondary_cta_text, secondary_cta_href, image_url, image_alt, image_badge_label,
        image_badge_title, stats_json, quick_links_json, brands_json, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertHomeHero.run(
      'Коллекция 2025 / Premium Selection',
      'Часы, подчеркивающие статус и индивидуальность',
      'Moditimewatch — сервис доставки люксовых часов. Привезём оригинальные модели от легендарных брендов, а эксперты подготовят подборку под ваш стиль, образ жизни и желаемый бюджет.',
      'Смотреть каталог',
      '/catalog',
      'Запросить подбор',
      '/contacts',
      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080',
      'Премиальные часы',
      'Лимитированная серия',
      'Royal Oak Flying Tourbillon',
      JSON.stringify([
        { value: '560+', label: 'моделей в наличии' },
        { value: '48', label: 'мировых брендов' },
        { value: '24ч', label: 'консьерж-подбор' }
      ]),
      JSON.stringify([
        { text: 'Мужские коллекции', href: '/catalog?category=mens', variant: 'primary' },
        { text: 'Женские коллекции', href: '/catalog?category=womens' },
        { text: 'Сервис и уход', href: '/warranty' }
      ]),
      JSON.stringify(['Rolex', 'Patek Philippe', 'Audemars Piguet', 'Omega', 'Jaeger-LeCoultre', 'Cartier']),
      1
    );

    // Home Services
    const insertHomeService = db.prepare('INSERT INTO home_services (icon_svg, title, description, link_text, link_href, position, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)');
    insertHomeService.run('<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 3L3 9.5L14 16L25 9.5L14 3Z" stroke="currentColor" stroke-width="1.8"/></svg>', 'Консьерж-подбор', 'Персональный стилист подберёт часы под ваш гардероб, мероприятия и инвестиционные цели.', 'Узнать детали', '/contacts', 0, 1);
    insertHomeService.run('<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M22 7H6C4.34315 7 3 8.34315 3 10V20C3 21.6569 4.34315 23 6 23H22C23.6569 23 25 21.6569 25 20V10C25 8.34315 23.6569 7 22 7Z" stroke="currentColor" stroke-width="1.8"/></svg>', 'Сервис и уход', 'Сертифицированный сервисный центр: полировка, настройка механизмов, реставрация винтажных моделей.', 'Записаться', '/warranty', 1, 1);
    insertHomeService.run('<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 14L11 21L24 7" stroke="currentColor" stroke-width="1.8"/></svg>', 'Гарантия подлинности', 'Все часы проходят экспертизу: проверка серийных номеров, сертификатов и происхождения.', 'Подробнее', '/warranty', 2, 1);

    // Home Service Stats
    const insertServiceStat = db.prepare('INSERT INTO home_service_stats (label, value, position) VALUES (?, ?, ?)');
    insertServiceStat.run('Поиск лимитированных серий', '72 часа', 0);
    insertServiceStat.run('Гарантийный сервис', '5 лет', 1);
    insertServiceStat.run('Trade-in аудит', '24 часа', 2);

    // Navigation Items (Header Menu) - ВАЖНО для Admin.js!
    // is_main_domain_only: 1 = абсолютная ссылка на главный домен для pSEO поддоменов
    const insertNavItem = db.prepare('INSERT INTO navigation_items (label, href, parent_id, position, menu_type, is_active, is_main_domain_only) VALUES (?, ?, ?, ?, ?, ?, ?)');

    // Top-level items (parent_id = NULL) — все ведут на главный домен
    insertNavItem.run('Каталог', '/catalog', null, 1, 'header_desktop', 1, 1);
    const catalogId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertNavItem.run('Коллекции', '/catalog?view=collections', null, 2, 'header_desktop', 1, 1);
    const collectionsMenuId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertNavItem.run('Бестселлеры', '/catalog?featured=1', null, 3, 'header_desktop', 1, 1);
    const bestsellersId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertNavItem.run('Сервис', '/warranty', null, 4, 'header_desktop', 1, 1);
    const serviceId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertNavItem.run('Журнал', '/journal', null, 5, 'header_desktop', 1, 1);

    // Submenu для Каталог — все ведут на главный домен
    insertNavItem.run('Мужские часы', '/catalog?category=mens', catalogId.id, 1, 'header_desktop', 1, 1);
    insertNavItem.run('Женские часы', '/catalog?category=womens', catalogId.id, 2, 'header_desktop', 1, 1);
    insertNavItem.run('Спортивные', '/catalog?category=sport', catalogId.id, 3, 'header_desktop', 1, 1);
    insertNavItem.run('Деловые', '/catalog?category=business', catalogId.id, 4, 'header_desktop', 1, 1);
    insertNavItem.run('Rolex', '/catalog?brand=rolex', catalogId.id, 5, 'header_desktop', 1, 1);
    insertNavItem.run('Patek Philippe', '/catalog?brand=patek-philippe', catalogId.id, 6, 'header_desktop', 1, 1);
    insertNavItem.run('Omega', '/catalog?brand=omega', catalogId.id, 7, 'header_desktop', 1, 1);

    // Submenu для Коллекции — все ведут на главный домен
    insertNavItem.run('Executive Collection', '/catalog?collection=executive', collectionsMenuId.id, 1, 'header_desktop', 1, 1);
    insertNavItem.run('Travel & Sport', '/catalog?collection=travel-sport', collectionsMenuId.id, 2, 'header_desktop', 1, 1);
    insertNavItem.run('Investment Vault', '/catalog?collection=investment', collectionsMenuId.id, 3, 'header_desktop', 1, 1);

    // Submenu для Сервис — все ведут на главный домен
    insertNavItem.run('Консьерж-сервис', '/contacts', serviceId.id, 1, 'header_desktop', 1, 1);
    insertNavItem.run('Доставка и оплата', '/delivery', serviceId.id, 2, 'header_desktop', 1, 1);
    insertNavItem.run('Гарантии', '/warranty', serviceId.id, 3, 'header_desktop', 1, 1);

    // Footer Sections
    const insertFooterSection = db.prepare('INSERT INTO footer_sections (title, position, column_number, is_active) VALUES (?, ?, ?, ?)');
    insertFooterSection.run('Магазин', 1, 1, 1);
    const footerShopId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertFooterSection.run('Сервис', 2, 2, 1);
    const footerServiceId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertFooterSection.run('Офис', 3, 3, 1);
    const footerOfficeId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    insertFooterSection.run('Правовая информация', 4, 4, 1);
    const footerLegalId = db.prepare('SELECT last_insert_rowid() as id').get() as { id: number };

    // Footer Links
    // is_main_domain_only: 1 = абсолютная ссылка на главный домен для pSEO поддоменов
    const insertFooterLink = db.prepare('INSERT INTO footer_links (section_id, label, href, position, is_main_domain_only) VALUES (?, ?, ?, ?, ?)');

    // Магазин — все ведут на главный домен
    insertFooterLink.run(footerShopId.id, 'Каталог часов', '/catalog', 1, 1);
    insertFooterLink.run(footerShopId.id, 'Журнал', '/journal', 2, 1);
    insertFooterLink.run(footerShopId.id, 'Поиск', '/search', 3, 1);
    insertFooterLink.run(footerShopId.id, 'О компании', '/about', 4, 1);

    // Сервис — все ведут на главный домен
    insertFooterLink.run(footerServiceId.id, 'Доставка и оплата', '/delivery', 1, 1);
    insertFooterLink.run(footerServiceId.id, 'Гарантии и возврат', '/warranty', 2, 1);
    insertFooterLink.run(footerServiceId.id, 'Контакты', '/contacts', 3, 1);
    insertFooterLink.run(footerServiceId.id, 'Telegram', 'https://t.me/moditimewatch', 4, 0);

    // Правовая информация — все ведут на главный домен
    insertFooterLink.run(footerLegalId.id, 'Политика конфиденциальности', '/privacy', 1, 1);
    insertFooterLink.run(footerLegalId.id, 'Правила обработки данных', '/terms', 2, 1);

    console.log('✅ Database seeded successfully (с Hero, Experience, Navigation, Footer)');
  });
  seed();
}

// INITIALIZE DATABASE BEFORE CREATING QUERIES!
initializeDatabase();
seedDatabase();

// QUERIES (создаются ПОСЛЕ инициализации таблиц)
export const queries = {
  // Products - Basic
  getProductBySlug: db.prepare('SELECT p.*, b.name as brand_name, b.slug as brand_slug FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.slug = ? AND p.is_active = 1'),
  getAllActiveProducts: db.prepare('SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.is_active = 1 ORDER BY p.position'),
  getFeaturedProducts: db.prepare('SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.is_featured = 1 AND p.is_active = 1 ORDER BY p.position LIMIT ?'),
  getProductImages: db.prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY position'),

  // Products - Catalog (pagination, filters)
  getProductsPage: db.prepare(`
    SELECT p.*, b.name as brand_name, b.slug as brand_slug,
           c.name as category_name, c.slug as category_slug,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.is_active = 1
    ORDER BY p.position
    LIMIT ? OFFSET ?
  `),
  countProducts: db.prepare('SELECT COUNT(*) as total FROM products WHERE is_active = 1'),

  // Brands & Categories for Filters
  getAllBrands: db.prepare('SELECT id, slug, name FROM brands WHERE is_active = 1 ORDER BY position'),
  getAllCategories: db.prepare('SELECT id, slug, name, parent_id FROM categories WHERE is_active = 1 ORDER BY position'),

  // Product Details
  getProductHighlights: db.prepare('SELECT icon, title, description FROM product_highlights WHERE product_id = ? ORDER BY position'),
  getProductTabs: db.prepare('SELECT tab_id as id, tab_label as label, content FROM product_tabs WHERE product_id = ? ORDER BY position'),
  getProductBenefits: db.prepare('SELECT id, icon_svg as icon, title, description FROM product_benefits WHERE product_id = ? ORDER BY position'),
  getProductOptions: db.prepare('SELECT option_type, option_label, option_value, option_value_label, price_modifier, is_default FROM product_options WHERE product_id = ? ORDER BY position'),
  getProductReviews: db.prepare('SELECT id, author_name, author_role, author_avatar_url, rating, content, delivery_info, is_verified, created_at FROM reviews WHERE product_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT ?'),
  getRelatedProducts: db.prepare(`
    SELECT p.*, b.name as brand_name,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    WHERE p.is_active = 1 AND p.id != ?
      AND (p.brand_id = ? OR p.category_id = ?)
    ORDER BY RANDOM() LIMIT ?
  `),

  // Orders
  insertOrder: db.prepare(`
    INSERT INTO orders (order_number, customer_name, customer_phone, customer_email, delivery_address, delivery_comment, total_amount, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `),
  insertOrderItem: db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_brand, product_sku, price, quantity, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),
  insertOrderStatusHistory: db.prepare(`
    INSERT INTO order_status_history (order_id, old_status, new_status, changed_by) VALUES (?, NULL, 'pending', 'system')
  `),
  getOrderByNumber: db.prepare('SELECT * FROM orders WHERE order_number = ?'),
  getOrderItems: db.prepare('SELECT * FROM order_items WHERE order_id = ?'),

  // Cities
  getCityBySlug: db.prepare('SELECT * FROM cities WHERE slug = ? AND is_active = 1'),
  getAllCities: db.prepare('SELECT * FROM cities WHERE is_active = 1 ORDER BY priority DESC, name'),
  getCityArticles: db.prepare('SELECT * FROM city_articles WHERE city_id = ? AND is_published = 1 ORDER BY published_at DESC LIMIT ? OFFSET ?'),
  getCityArticleBySlug: db.prepare(`
    SELECT ca.*, c.name as city_name, c.slug as city_slug, c.name_genitive, c.name_prepositional, c.name_accusative
    FROM city_articles ca
    JOIN cities c ON ca.city_id = c.id
    WHERE c.slug = ? AND ca.slug = ? AND ca.is_published = 1
  `),
  getAllCityArticles: db.prepare(`
    SELECT ca.slug as article_slug, c.slug as city_slug, ca.updated_at
    FROM city_articles ca
    JOIN cities c ON ca.city_id = c.id
    WHERE ca.is_published = 1
  `),

  // Sitemap
  getAllProductsForSitemap: db.prepare('SELECT slug, updated_at FROM products WHERE is_active = 1'),

  // Layout data (для всех страниц!)
  getNavigationItems: db.prepare(`
    SELECT * FROM navigation_items
    WHERE menu_type = ? AND is_active = 1 AND parent_id IS NULL
    ORDER BY position
  `),
  getNavigationSubmenu: db.prepare(`
    SELECT * FROM navigation_items
    WHERE parent_id = ? AND is_active = 1
    ORDER BY position
  `),
  getFooterSections: db.prepare('SELECT * FROM footer_sections WHERE is_active = 1 ORDER BY position'),
  getFooterLinks: db.prepare('SELECT * FROM footer_links WHERE section_id = ? ORDER BY position'),

  // Homepage data
  getHomeHero: db.prepare('SELECT * FROM home_hero WHERE is_active = 1 LIMIT 1'),
  getAllCollections: db.prepare('SELECT * FROM collections WHERE is_active = 1 ORDER BY position'),
  getAllTestimonials: db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order'),
  getFeaturedArticles: db.prepare('SELECT a.*, ac.name as category_name FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.is_featured = 1 AND a.is_published = 1 ORDER BY a.published_at DESC LIMIT ?'),
  getHomeServices: db.prepare('SELECT * FROM home_services WHERE is_active = 1 ORDER BY position'),
  getHomeServiceStats: db.prepare('SELECT * FROM home_service_stats ORDER BY position'),
  getTelegramWidget: db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' AND is_active = 1 LIMIT 1"),

  // Static pages
  getPageBySlug: db.prepare('SELECT * FROM pages WHERE slug = ? AND is_published = 1'),
  getSeoMetaBySlug: db.prepare('SELECT * FROM seo_meta WHERE page_type = ? AND slug = ?'),

  // ============================================
  // AUTH
  // ============================================
  getAdminByEmail: db.prepare('SELECT * FROM admins WHERE email = ?'),

  // ============================================
  // ADMIN DASHBOARD
  // ============================================
  adminCountAllProducts: db.prepare('SELECT COUNT(*) as count FROM products'),
  adminCountAllBrands: db.prepare('SELECT COUNT(*) as count FROM brands'),
  adminCountAllCategories: db.prepare('SELECT COUNT(*) as count FROM categories'),
  adminCountAllOrders: db.prepare('SELECT COUNT(*) as count FROM orders'),
  adminCountPendingOrders: db.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"),
  adminGetRecentOrders: db.prepare('SELECT id, order_number, customer_name, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5'),

  // ============================================
  // ADMIN - BRANDS
  // ============================================
  adminListBrands: db.prepare('SELECT * FROM brands ORDER BY position, name'),
  adminGetBrand: db.prepare('SELECT * FROM brands WHERE id = ?'),
  adminCreateBrand: db.prepare(`
    INSERT INTO brands (slug, name, description, logo_url, country, founded_year, website_url, is_active, position)
    VALUES (@slug, @name, @description, @logo_url, @country, @founded_year, @website_url, @is_active, @position)
  `),
  adminUpdateBrand: db.prepare(`
    UPDATE brands SET
      slug = @slug, name = @name, description = @description, logo_url = @logo_url,
      country = @country, founded_year = @founded_year, website_url = @website_url,
      is_active = @is_active, position = @position, updated_at = datetime('now')
    WHERE id = @id
  `),
  adminDeleteBrand: db.prepare('DELETE FROM brands WHERE id = ?'),
  adminGetMaxBrandPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM brands'),

  // ============================================
  // ADMIN - CATEGORIES
  // ============================================
  adminListCategories: db.prepare(`
    SELECT c.*, p.name as parent_name
    FROM categories c
    LEFT JOIN categories p ON c.parent_id = p.id
    ORDER BY c.position, c.name
  `),
  adminGetCategory: db.prepare('SELECT * FROM categories WHERE id = ?'),
  adminSelectCategoriesAll: db.prepare('SELECT id, name FROM categories ORDER BY name'),
  adminCreateCategory: db.prepare(`
    INSERT INTO categories (slug, name, description, parent_id, image_url, is_active, position)
    VALUES (@slug, @name, @description, @parent_id, @image_url, @is_active, @position)
  `),
  adminUpdateCategory: db.prepare(`
    UPDATE categories SET
      slug = @slug, name = @name, description = @description, parent_id = @parent_id,
      image_url = @image_url, is_active = @is_active, position = @position,
      updated_at = datetime('now')
    WHERE id = @id
  `),
  adminDeleteCategory: db.prepare('DELETE FROM categories WHERE id = ?'),
  adminGetMaxCategoryPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM categories'),

  // ============================================
  // ADMIN - PRODUCTS
  // ============================================
  adminListProducts: db.prepare(`
    SELECT p.*, b.name as brand_name, c.name as category_name
    FROM products p
    JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.position, p.name
  `),
  adminGetProduct: db.prepare('SELECT * FROM products WHERE id = ?'),
  adminSelectActiveBrands: db.prepare('SELECT id, name FROM brands WHERE is_active = 1 ORDER BY name'),
  adminSelectActiveCategories: db.prepare('SELECT id, name FROM categories WHERE is_active = 1 ORDER BY name'),
  adminCreateProduct: db.prepare(`
    INSERT INTO products (
      slug, name, brand_id, category_id, sku, price, price_note,
      availability_status, description, is_active, is_featured, is_new, is_limited, position
    ) VALUES (
      @slug, @name, @brand_id, @category_id, @sku, @price, @price_note,
      @availability_status, @description, @is_active, @is_featured, @is_new, @is_limited, @position
    )
  `),
  adminUpdateProduct: db.prepare(`
    UPDATE products SET
      slug = @slug, name = @name, brand_id = @brand_id, category_id = @category_id,
      sku = @sku, price = @price, price_note = @price_note,
      availability_status = @availability_status, description = @description,
      is_active = @is_active, is_featured = @is_featured, is_new = @is_new,
      is_limited = @is_limited, position = @position, updated_at = datetime('now')
    WHERE id = @id
  `),
  adminDeleteProduct: db.prepare('DELETE FROM products WHERE id = ?'),
  adminGetMaxProductPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM products'),

  // ============================================
  // ADMIN - ORDERS
  // ============================================
  adminListOrders: db.prepare(`
    SELECT o.*,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
    FROM orders o
    ORDER BY o.created_at DESC
  `),
  adminListOrdersByStatus: db.prepare(`
    SELECT o.*,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
    FROM orders o
    WHERE o.status = ?
    ORDER BY o.created_at DESC
  `),
  adminGetOrderStatusCounts: db.prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status'),
  adminGetOrder: db.prepare('SELECT * FROM orders WHERE id = ?'),
  adminGetOrderItems: db.prepare('SELECT * FROM order_items WHERE order_id = ?'),
  adminGetOrderStatusHistory: db.prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at DESC'),
  adminUpdateOrderStatus: db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"),
  adminInsertOrderStatusHistory: db.prepare('INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, comment) VALUES (?, ?, ?, ?, ?)'),

  // ============================================
  // ADMIN - NAVIGATION
  // ============================================
  adminListNavItems: db.prepare('SELECT * FROM navigation_items ORDER BY menu_type, position, id'),
  adminUpdateNavItem: db.prepare(`
    UPDATE navigation_items SET
      label = @label, href = @href, position = @position, is_active = @is_active
    WHERE id = @id
  `),
  adminCreateNavItem: db.prepare(`
    INSERT INTO navigation_items (label, href, parent_id, position, menu_type, is_active, is_main_domain_only)
    VALUES (@label, @href, @parent_id, @position, @menu_type, @is_active, 1)
  `),
  adminDeleteNavItem: db.prepare('DELETE FROM navigation_items WHERE id = ?'),

  // ============================================
  // ADMIN - PAGES
  // ============================================
  adminListPages: db.prepare('SELECT * FROM pages ORDER BY id'),
  adminGetPage: db.prepare('SELECT * FROM pages WHERE id = ?'),
  adminUpdatePage: db.prepare(`
    UPDATE pages SET
      slug = @slug, title = @title, content = @content, template = @template,
      meta_json = @meta_json, is_published = @is_published, updated_at = datetime('now')
    WHERE id = @id
  `),

  // ============================================
  // ADMIN - SYSTEM (ADMINS)
  // ============================================
  adminListAdmins: db.prepare('SELECT id, email, name, role, created_at FROM admins ORDER BY id'),
  adminGetAdmin: db.prepare('SELECT id, email, name, role FROM admins WHERE id = ?'),
  adminCreateAdmin: db.prepare('INSERT INTO admins (email, password, name, role) VALUES (@email, @password, @name, @role)'),
  adminUpdateAdmin: db.prepare('UPDATE admins SET email = @email, name = @name, role = @role WHERE id = @id'),
  adminUpdateAdminWithPassword: db.prepare('UPDATE admins SET email = @email, name = @name, role = @role, password = @password WHERE id = @id'),
  adminDeleteAdmin: db.prepare('DELETE FROM admins WHERE id = ?'),

  // ============================================
  // ADMIN - SITE CONFIG
  // ============================================
  adminListConfig: db.prepare('SELECT * FROM site_config ORDER BY key'),
  adminUpdateConfig: db.prepare("UPDATE site_config SET value = @value, updated_at = datetime('now') WHERE key = @key"),
  adminCreateConfig: db.prepare('INSERT INTO site_config (key, value, type, description) VALUES (@key, @value, @type, @description)'),
  adminDeleteConfig: db.prepare('DELETE FROM site_config WHERE key = ?')
};

// Utility
export function formatPrice(kopecks: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(kopecks / 100);
}

export function getProductComplete(slug: string): (Product & { brand_name: string; images: any[]; specs: any }) | null {
  const product = queries.getProductBySlug.get(slug) as (Product & { brand_name: string }) | undefined;
  if (!product) return null;
  const images = queries.getProductImages.all(product.id);
  const specs = product.specs_json ? JSON.parse(product.specs_json) : null;
  return { ...product, images, specs };
}

console.log('✅ Moditimewatch database ready');

export default db;
