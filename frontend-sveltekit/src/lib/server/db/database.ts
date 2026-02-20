// Production-ready Moditimewatch Database
import Database from 'better-sqlite3';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import { isMainThread } from 'worker_threads';

// Skip database initialization in worker threads (Vite SSR build)
const DB_PATH = join(process.cwd(), '..', 'data', 'db', 'sqlite', 'app.db');

let dbInstance: Database.Database | null = null;

function getDb() {
	if (!isMainThread) {
		throw new Error('Database cannot be accessed from worker threads');
	}
	if (!dbInstance) {
		dbInstance = new Database(DB_PATH, {
			verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
		});
		dbInstance.pragma('journal_mode = WAL');
		dbInstance.pragma('foreign_keys = ON');
		dbInstance.pragma('synchronous = NORMAL');
		dbInstance.pragma('cache_size = -64000');
		dbInstance.pragma('temp_store = MEMORY');
		dbInstance.pragma('mmap_size = 30000000000');
	}
	return dbInstance;
}

export const db = new Proxy({} as Database.Database, {
	get(_target, prop) {
		return (getDb() as any)[prop];
	}
});

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
    
    // Product Images (use picsum.photos placeholders — local files don't exist)
    const insertImage = db.prepare('INSERT INTO product_images (product_id, url, alt, position, is_main) VALUES (?, ?, ?, ?, ?)');
    const productSlugs = ['rolex-submariner-126610ln', 'patek-philippe-nautilus-5711', 'omega-speedmaster'];
    for(let i=1; i<=3; i++) {
      for(let j=0; j<4; j++) {
        insertImage.run(i, `https://picsum.photos/seed/${productSlugs[i-1]}-${j}/720/720`, `Product ${i} image ${j+1}`, j, j===0?1:0);
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
    
    // ============================================
    // Session-6: pSEO Seed — Categories, Tags, Articles
    // ============================================

    // City Article Categories (2 categories)
    const insertCityArticleCat = db.prepare('INSERT INTO city_article_categories (name, slug, description, position, is_active) VALUES (?, ?, ?, ?, 1)');
    insertCityArticleCat.run('Покупка часов', 'pokupka-chasov', 'Статьи о покупке, подборе и инвестициях в премиальные часы', 1);
    const catPokupkaId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleCat.run('Ремонт и обслуживание', 'remont-obsluzhivanie', 'Сервисные центры, уход и обслуживание часов', 2);
    const catRemontId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    // City Article Tags (7 tags)
    const insertCityArticleTag = db.prepare('INSERT INTO city_article_tags (name, slug) VALUES (?, ?)');
    insertCityArticleTag.run('швейцарские часы', 'shvejcarskie-chasy');
    const tagSwissId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleTag.run('rolex', 'rolex');
    const tagRolexId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleTag.run('ремонт', 'remont');
    const tagRemontId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleTag.run('инвестиции', 'investicii');
    const tagInvestId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleTag.run('подарок', 'podarok');
    const tagGiftId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleTag.run('trade-in', 'trade-in');
    const tagTradeInId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertCityArticleTag.run('luxury', 'luxury');
    const tagLuxuryId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    // City Articles (5 для Moscow, 4 для SPb, 3 для Kazan)
    // Updated with meta_title, meta_description, category_id, read_time (Session-6)
    const insertCityArticle = db.prepare('INSERT INTO city_articles (city_id, slug, title, excerpt, content, meta_title, meta_description, category_id, read_time, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)');

    // Moscow (city_id=1)
    insertCityArticle.run(1, 'gde-kupit-shvejcarskie-chasy-v-moskve', 'Где купить швейцарские часы в Москве', 'Гид по авторизованным бутикам и проверенным дилерам в столице — от Столешникова до ГУМа.', '<h2>Авторизованные бутики</h2><p>Москва — крупнейший рынок премиальных часов в России. На Столешниковом переулке сосредоточены бутики Rolex, Patek Philippe, Audemars Piguet и Vacheron Constantin.</p><h3>ГУМ и ЦУМ</h3><p>В ГУМе представлены бренды Omega, Cartier, IWC и Jaeger-LeCoultre. ЦУМ предлагает коллекции Hublot, TAG Heuer и Breitling.</p><h2>Moditimewatch: доставка и подбор</h2><p>Мы подберём часы под ваш стиль и бюджет, организуем примерку и доставку по Москве в день заказа. Каждая модель проходит проверку подлинности.</p>', 'Купить швейцарские часы в Москве — бутики, дилеры, доставка | Moditimewatch', 'Где купить оригинальные швейцарские часы в Москве: бутики на Столешниковом, ГУМ, ЦУМ. Доставка и подбор от Moditimewatch.', catPokupkaId, 8, 1);
    const moscowArt1Id = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    insertCityArticle.run(1, 'luchshie-modeli-dlya-biznesmenov-moskvy', 'Лучшие модели часов для бизнесменов Москвы', 'Подборка проверенных референсов для деловых встреч, переговоров и корпоративных мероприятий.', '<h2>Для переговоров</h2><p>Rolex Datejust 41 — универсальная классика для любых встреч. Сочетание стали и белого золота подчёркивает статус без излишней демонстративности.</p><h2>Для корпоративных событий</h2><p>Patek Philippe Calatrava 5227G — эталон дресс-часов. Тонкий корпус из белого золота, гильошированный циферблат, безупречная отделка.</p><h3>Для повседневного ношения</h3><p>Omega Seamaster Aqua Terra 150M — сдержанная спортивная элегантность. Водонепроницаемость 150 м, коаксиальный калибр с антимагнитной защитой.</p>', 'Часы для бизнесменов Москвы — Rolex, Patek Philippe, Omega | Moditimewatch', 'Лучшие модели часов для деловых встреч и переговоров в Москве: Rolex Datejust, Patek Philippe Calatrava, Omega Seamaster.', catPokupkaId, 10, 1);
    const moscowArt2Id = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    insertCityArticle.run(1, 'trade-in-chasov-v-moskve', 'Trade-in часов в Москве: как обменять с выгодой', 'Разбираем процесс оценки, документы и сроки обмена часов через Moditimewatch.', '<h2>Как работает trade-in</h2><p>Вы отправляете фото и описание ваших часов. Наш эксперт проводит предварительную оценку в течение 24 часов.</p><h3>Очная экспертиза</h3><p>После предварительного согласования мы организуем встречу для осмотра часов. Проверяем механизм, состояние корпуса, комплектность документов.</p><h2>Финальная сделка</h2><p>Стоимость trade-in зачисляется в счёт новой покупки. Разницу можно оплатить любым способом — наличными, картой или банковским переводом.</p>', 'Trade-in часов в Москве — обмен с выгодой | Moditimewatch', 'Обмен часов trade-in в Москве: оценка за 24 часа, очная экспертиза, зачисление стоимости в счёт новой покупки.', catPokupkaId, 6, 1);
    const moscowArt3Id = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    insertCityArticle.run(1, 'remont-chasov-v-moskve', 'Сервисные центры и ремонт часов в Москве', 'Обзор авторизованных сервисных центров и рекомендации по обслуживанию часов.', '<h2>Авторизованные сервисные центры</h2><p>Rolex обслуживается в официальных центрах на Кузнецком Мосту. Patek Philippe имеет собственный сервис в Барвихе.</p><h3>Регулярное обслуживание</h3><p>Рекомендуемая периодичность полного обслуживания — каждые 5-7 лет для механических часов. Замена прокладок и проверка герметичности — ежегодно при активном ношении.</p><h2>Moditimewatch сервис</h2><p>Мы предлагаем полный цикл обслуживания: диагностика, полировка, замена ремешков и браслетов, настройка точности хода.</p>', 'Ремонт часов в Москве — сервисные центры | Moditimewatch', 'Авторизованные сервисные центры в Москве: ремонт Rolex, Patek Philippe, Omega. Полный цикл обслуживания от Moditimewatch.', catRemontId, 7, 1);
    const moscowArt4Id = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    insertCityArticle.run(1, 'investicii-v-chasy-moskva', 'Инвестиции в часы: московский рынок 2025', 'Анализ доходности коллекционных часов и перспективные модели для инвестиционного портфеля.', '<h2>Рынок премиальных часов в 2025</h2><p>Московский рынок коллекционных часов демонстрирует стабильный рост. Rolex Daytona и Patek Philippe Nautilus остаются лидерами по приросту стоимости.</p><h3>Перспективные модели</h3><p>Audemars Piguet Royal Oak «Jumbo» 16202 — преемник легендарного 15202, уже торгуется выше ритейла. Vacheron Constantin Overseas — набирает популярность среди инвесторов.</p><h2>Рекомендации</h2><p>Ключевые факторы для инвестиционной покупки: полная комплектация, состояние близкое к новому, актуальные сертификаты и чеки.</p>', 'Инвестиции в часы в Москве — рынок 2025 | Moditimewatch', 'Какие часы покупать для инвестиций в Москве: Rolex Daytona, Patek Philippe Nautilus, Audemars Piguet Royal Oak.', catPokupkaId, 12, 1);
    const moscowArt5Id = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    // Saint-Petersburg (city_id=2)
    insertCityArticle.run(2, 'gde-kupit-chasy-v-peterburge', 'Где купить швейцарские часы в Санкт-Петербурге', 'Путеводитель по часовым бутикам Невского проспекта и ДЛТ.', '<h2>Невский проспект</h2><p>Главная часовая магистраль Петербурга. На Невском расположены бутики Rolex, Omega, Breguet и Blancpain. Исторические интерьеры создают особую атмосферу покупки.</p><h3>ДЛТ (Дом Ленинградской Торговли)</h3><p>Премиальный универмаг с часовым отделом: Cartier, IWC, Panerai и Chopard. Удобное расположение рядом с Гостиным двором.</p><h2>Доставка Moditimewatch</h2><p>Доставка по Петербургу — 1 рабочий день. Примерка на дому или в офисе, проверка подлинности при получении.</p>', 'Купить швейцарские часы в Санкт-Петербурге | Moditimewatch', 'Часовые бутики на Невском проспекте и ДЛТ. Доставка часов по Петербургу за 1 день.', catPokupkaId, 7, 1);
    insertCityArticle.run(2, 'chasy-dlya-belyh-nochej', 'Часы для белых ночей: подборка для петербургского стиля', 'Модели, подчёркивающие петербургский шик — от строгой классики до авангарда.', '<h2>Петербургская классика</h2><p>Breguet Classique 5177 — бренд с историческими корнями в Петербурге. Эмалевый циферблат, знаменитые стрелки Breguet, ультратонкий корпус.</p><h3>Для прогулок по набережным</h3><p>Omega Seamaster Planet Ocean — спортивная элегантность для активного образа жизни. Водонепроницаемость 600 м, керамический безель.</p><h2>Для культурных событий</h2><p>Jaeger-LeCoultre Reverso — часы-перевёртыш с историей. Идеальный выбор для посещения Мариинского театра или Эрмитажа.</p>', 'Часы для петербургского стиля — белые ночи | Moditimewatch', 'Подборка часов для петербургского стиля: Breguet, Omega, Jaeger-LeCoultre.', catPokupkaId, 8, 1);
    insertCityArticle.run(2, 'trade-in-chasov-v-peterburge', 'Trade-in часов в Санкт-Петербурге', 'Обмен часов с доплатой: процесс, сроки и условия в Петербурге.', '<h2>Процесс обмена</h2><p>Отправьте фотографии часов через форму на сайте или в Telegram. Предварительная оценка — в течение 24 часов.</p><h3>Очная оценка</h3><p>Встреча с экспертом в удобном для вас месте в Петербурге. Проверяем механизм, комплектность, состояние.</p><h2>Условия</h2><p>Принимаем часы Rolex, Patek Philippe, Audemars Piguet, Omega и другие премиальные бренды. Стоимость trade-in — до 85% рыночной цены.</p>', 'Trade-in часов в Санкт-Петербурге | Moditimewatch', 'Обмен часов в Петербурге: оценка, экспертиза, зачисление стоимости.', catPokupkaId, 5, 1);
    insertCityArticle.run(2, 'remont-chasov-v-peterburge', 'Ремонт и обслуживание часов в Санкт-Петербурге', 'Авторизованные мастерские и рекомендации по уходу за часами.', '<h2>Сервисные центры</h2><p>В Петербурге работают авторизованные сервисы Rolex, Omega и Swatch Group. Обслуживание других брендов доступно через Moditimewatch.</p><h3>Стоимость обслуживания</h3><p>Полное обслуживание механических часов: от 30 000 до 150 000 ₽ в зависимости от бренда и сложности механизма.</p>', 'Ремонт часов в Санкт-Петербурге | Moditimewatch', 'Сервисные центры Rolex, Omega в Петербурге. Стоимость обслуживания.', catRemontId, 6, 1);

    // Kazan (city_id=3)
    insertCityArticle.run(3, 'gde-kupit-chasy-v-kazani', 'Где купить швейцарские часы в Казани', 'Обзор часовых магазинов Казани и возможности доставки Moditimewatch.', '<h2>Часовые магазины Казани</h2><p>В Казани представлены мультибрендовые салоны на улице Баумана и в ТЦ «Кольцо». Ассортимент включает Rolex, Omega, Longines и Tissot.</p><h3>Доставка Moditimewatch</h3><p>Доставляем по Казани за 2 рабочих дня. Бесплатная доставка при заказе от 500 000 ₽. Примерка и проверка подлинности при получении.</p>', 'Купить швейцарские часы в Казани | Moditimewatch', 'Часовые магазины Казани. Доставка за 2 дня от Moditimewatch.', catPokupkaId, 5, 1);
    insertCityArticle.run(3, 'chasy-dlya-biznesmenov-kazani', 'Лучшие часы для бизнесменов Казани', 'Подборка моделей для деловых встреч и мероприятий в столице Татарстана.', '<h2>Для деловых встреч</h2><p>Rolex Datejust — надёжная классика, узнаваемая во всём мире. Стальной корпус с белым циферблатом — универсальный выбор.</p><h3>Для особых случаев</h3><p>Patek Philippe Calatrava — часы, которые говорят о вкусе и статусе без слов. Тонкий корпус, лаконичный дизайн.</p>', 'Часы для бизнесменов Казани | Moditimewatch', 'Лучшие модели часов для деловых встреч в Казани: Rolex, Patek Philippe.', catPokupkaId, 6, 1);
    insertCityArticle.run(3, 'trade-in-chasov-v-kazani', 'Trade-in часов в Казани', 'Как обменять часы с выгодой через сервис Moditimewatch в Казани.', '<h2>Условия trade-in</h2><p>Принимаем часы любых премиальных брендов. Предварительная оценка по фото — бесплатно. Очная экспертиза в Казани — по договорённости.</p><h3>Сроки</h3><p>Предварительная оценка: 24 часа. Очная экспертиза: 1-2 рабочих дня. Зачисление стоимости: в день сделки.</p>', 'Trade-in часов в Казани | Moditimewatch', 'Обмен часов в Казани: оценка по фото, экспертиза по договорённости.', catPokupkaId, 4, 1);

    // ============================================
    // Session-6: Tag relations (Moscow articles)
    // ============================================
    const insertTagRel = db.prepare('INSERT INTO city_article_tag_relations (article_id, tag_id) VALUES (?, ?)');

    // Article 1 (Где купить): швейцарские часы, rolex, luxury
    insertTagRel.run(moscowArt1Id, tagSwissId);
    insertTagRel.run(moscowArt1Id, tagRolexId);
    insertTagRel.run(moscowArt1Id, tagLuxuryId);

    // Article 2 (Бизнесмены): швейцарские часы, luxury, подарок
    insertTagRel.run(moscowArt2Id, tagSwissId);
    insertTagRel.run(moscowArt2Id, tagLuxuryId);
    insertTagRel.run(moscowArt2Id, tagGiftId);

    // Article 3 (Trade-in): trade-in, швейцарские часы
    insertTagRel.run(moscowArt3Id, tagTradeInId);
    insertTagRel.run(moscowArt3Id, tagSwissId);

    // Article 4 (Ремонт): ремонт, швейцарские часы, rolex
    insertTagRel.run(moscowArt4Id, tagRemontId);
    insertTagRel.run(moscowArt4Id, tagSwissId);
    insertTagRel.run(moscowArt4Id, tagRolexId);

    // Article 5 (Инвестиции): инвестиции, luxury, швейцарские часы
    insertTagRel.run(moscowArt5Id, tagInvestId);
    insertTagRel.run(moscowArt5Id, tagLuxuryId);
    insertTagRel.run(moscowArt5Id, tagSwissId);

    // ============================================
    // Session-6: Related articles (Moscow)
    // ============================================
    const insertRelated = db.prepare('INSERT INTO city_article_related (article_id, related_article_id, position) VALUES (?, ?, ?)');

    // Article 1 → Article 2, Article 5
    insertRelated.run(moscowArt1Id, moscowArt2Id, 0);
    insertRelated.run(moscowArt1Id, moscowArt5Id, 1);
    // Article 2 → Article 1, Article 3
    insertRelated.run(moscowArt2Id, moscowArt1Id, 0);
    insertRelated.run(moscowArt2Id, moscowArt3Id, 1);
    // Article 3 → Article 1, Article 4
    insertRelated.run(moscowArt3Id, moscowArt1Id, 0);
    insertRelated.run(moscowArt3Id, moscowArt4Id, 1);
    // Article 4 → Article 3, Article 1
    insertRelated.run(moscowArt4Id, moscowArt3Id, 0);
    insertRelated.run(moscowArt4Id, moscowArt1Id, 1);
    // Article 5 → Article 2, Article 1
    insertRelated.run(moscowArt5Id, moscowArt2Id, 0);
    insertRelated.run(moscowArt5Id, moscowArt1Id, 1);

    // ============================================
    // Session-6: Media (Moscow articles — images + YouTube)
    // ============================================
    const insertMedia = db.prepare('INSERT INTO city_article_media (article_id, media_type, url, alt_text, caption, position) VALUES (?, ?, ?, ?, ?, ?)');

    // Article 1 — 2 images + 1 video
    insertMedia.run(moscowArt1Id, 'image', 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', 'Бутик швейцарских часов в Москве', 'Бутик на Столешниковом переулке', 0);
    insertMedia.run(moscowArt1Id, 'image', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800', 'Витрина с часами Rolex', 'Витрина ГУМ', 1);
    insertMedia.run(moscowArt1Id, 'video', 'dQw4w9WgXcQ', 'Обзор часовых бутиков Москвы', 'Видео-гид по часовым бутикам', 2);

    // Article 2 — 2 images
    insertMedia.run(moscowArt2Id, 'image', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800', 'Rolex Datejust на руке бизнесмена', 'Rolex Datejust 41 — выбор для переговоров', 0);
    insertMedia.run(moscowArt2Id, 'image', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800', 'Patek Philippe Calatrava', 'Patek Philippe Calatrava 5227G', 1);

    // Article 3 — 1 image + 1 video
    insertMedia.run(moscowArt3Id, 'image', 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800', 'Оценка часов для trade-in', 'Эксперт оценивает часы', 0);
    insertMedia.run(moscowArt3Id, 'video', 'ScMzIvxBSi4', 'Как работает trade-in часов', 'Процесс trade-in в Moditimewatch', 1);

    // Article 4 — 2 images
    insertMedia.run(moscowArt4Id, 'image', 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800', 'Мастер ремонтирует механические часы', 'Сервисный центр Moditimewatch', 0);
    insertMedia.run(moscowArt4Id, 'image', 'https://images.unsplash.com/photo-1495856458515-0637185db551?w=800', 'Инструменты часового мастера', 'Профессиональные инструменты', 1);

    // Article 5 — 1 image + 1 video
    insertMedia.run(moscowArt5Id, 'image', 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800', 'Коллекция инвестиционных часов', 'Rolex Daytona и Patek Philippe Nautilus', 0);
    insertMedia.run(moscowArt5Id, 'video', '2SUwOgmvzK4', 'Инвестиции в часы 2025', 'Обзор инвестиционных моделей', 1);

    // ============================================
    // Session-6: Product links (Moscow articles → products)
    // ============================================
    const insertArtProduct = db.prepare('INSERT INTO city_article_products (article_id, product_id, position) VALUES (?, ?, ?)');
    // Article 1 → Rolex Submariner (1), Patek Nautilus (2), Omega Speedmaster (3)
    insertArtProduct.run(moscowArt1Id, 1, 0);
    insertArtProduct.run(moscowArt1Id, 2, 1);
    insertArtProduct.run(moscowArt1Id, 3, 2);
    // Article 2 → Rolex Submariner (1), Patek Nautilus (2)
    insertArtProduct.run(moscowArt2Id, 1, 0);
    insertArtProduct.run(moscowArt2Id, 2, 1);
    // Article 5 → Patek Nautilus (2), Omega Speedmaster (3)
    insertArtProduct.run(moscowArt5Id, 2, 0);
    insertArtProduct.run(moscowArt5Id, 3, 1);
    
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

    // Filter Attributes
    const insertFilterAttr = db.prepare('INSERT INTO filter_attributes (slug, name, type, is_active, position) VALUES (?, ?, ?, ?, ?)');
    insertFilterAttr.run('material', 'Материал корпуса', 'checkbox', 1, 1);
    const materialAttrId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterAttr.run('mechanism', 'Механизм', 'checkbox', 1, 2);
    const mechanismAttrId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterAttr.run('scenario', 'Сценарий использования', 'checkbox', 1, 3);
    const scenarioAttrId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;

    // Filter Values — Material
    const insertFilterVal = db.prepare('INSERT INTO filter_values (attribute_id, value, label, position) VALUES (?, ?, ?, ?)');
    insertFilterVal.run(materialAttrId, 'steel', 'Steel', 1);
    const fvSteelId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(materialAttrId, 'gold-18k', 'Gold 18K', 2);
    const fvGoldId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(materialAttrId, 'titanium', 'Titanium', 3);
    insertFilterVal.run(materialAttrId, 'platinum', 'Platinum', 4);
    insertFilterVal.run(materialAttrId, 'ceramic', 'Ceramic', 5);

    // Filter Values — Mechanism
    insertFilterVal.run(mechanismAttrId, 'automatic', 'Automatic', 1);
    const fvAutoId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(mechanismAttrId, 'manual', 'Manual', 2);
    insertFilterVal.run(mechanismAttrId, 'quartz', 'Quartz', 3);

    // Filter Values — Scenario
    insertFilterVal.run(scenarioAttrId, 'investment', 'Investment', 1);
    const fvInvestId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(scenarioAttrId, 'sport', 'Sport', 2);
    const fvSportId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(scenarioAttrId, 'business', 'Business', 3);
    const fvBusinessId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(scenarioAttrId, 'casual', 'Casual', 4);
    const fvCasualId = (db.prepare('SELECT last_insert_rowid() as id').get() as { id: number }).id;
    insertFilterVal.run(scenarioAttrId, 'gift', 'Gift', 5);

    // Product Filters — link products to filter values
    const insertPF = db.prepare('INSERT INTO product_filters (product_id, filter_value_id) VALUES (?, ?)');
    // Rolex Submariner (id=1): steel, automatic, sport
    insertPF.run(1, fvSteelId);
    insertPF.run(1, fvAutoId);
    insertPF.run(1, fvSportId);
    // Patek Philippe Nautilus (id=2): steel, automatic, investment, business
    insertPF.run(2, fvSteelId);
    insertPF.run(2, fvAutoId);
    insertPF.run(2, fvInvestId);
    insertPF.run(2, fvBusinessId);
    // Omega Speedmaster (id=3): steel, automatic, sport, casual
    insertPF.run(3, fvSteelId);
    insertPF.run(3, fvAutoId);
    insertPF.run(3, fvSportId);
    insertPF.run(3, fvCasualId);

    // Site Config
    const insertConfig = db.prepare('INSERT INTO site_config (key, value, type, description) VALUES (?, ?, ?, ?)');
    insertConfig.run('site_name', 'Moditimewatch', 'string', 'Название сайта');
    insertConfig.run('contact_phone', '+7 (495) 120-00-00', 'string', 'Контактный телефон');
    insertConfig.run('contact_email', 'info@moditime-watch.ru', 'string', 'Контактный email');
    insertConfig.run('contact_address', 'Москва, Столешников переулок, д. 7/5', 'string', 'Адрес офиса');
    insertConfig.run('working_hours', 'Пн-Пт: 10:00-20:00, Сб: 11:00-18:00', 'string', 'Часы работы');
    insertConfig.run('social_telegram', 'https://t.me/moditimewatch', 'string', 'Ссылка на Telegram');
    insertConfig.run('copyright_text', '© 2025 Moditimewatch. Все права защищены.', 'string', 'Текст копирайта в футере');

    // Session-12: Telegram Group Link Config
    insertConfig.run('telegram_group_enabled', 'true', 'boolean', 'Показывать ссылку на Telegram группу');
    insertConfig.run('telegram_group_url', 'https://t.me/moditime_watch', 'string', 'URL Telegram группы');
    insertConfig.run('telegram_group_label', 'Telegram группа Moditimewatch', 'string', 'Текст ссылки на Telegram группу');

    // Session-12: Phone Mode Config
    insertConfig.run('phone_mode', 'direct', 'string', 'Режим телефона: direct (звонок) или callback (форма обратного звонка)');

    // Notification Config (Session-5)
    insertConfig.run('telegram_enabled', 'false', 'boolean', 'Telegram уведомления включены');
    insertConfig.run('telegram_bot_token', '', 'string', 'Telegram Bot Token от @BotFather');
    insertConfig.run('telegram_chat_id', '', 'string', 'Telegram Chat ID для уведомлений');
    insertConfig.run('email_enabled', 'false', 'boolean', 'Email уведомления включены');
    insertConfig.run('smtp_host', '', 'string', 'SMTP сервер (например: smtp.gmail.com)');
    insertConfig.run('smtp_port', '587', 'string', 'SMTP порт (587 или 465)');
    insertConfig.run('smtp_user', '', 'string', 'SMTP пользователь (email)');
    insertConfig.run('smtp_password', '', 'string', 'SMTP пароль');
    insertConfig.run('email_from', '', 'string', 'Email отправителя (From)');
    insertConfig.run('admin_email', 'admin@moditime-watch.ru', 'string', 'Email администратора для уведомлений');

    // Email Templates (Session-5)
    const insertTemplate = db.prepare('INSERT INTO email_templates (template_key, subject, body_html, body_text, is_active) VALUES (?, ?, ?, ?, 1)');

    insertTemplate.run(
      'order_confirmation',
      'Заказ #{{order_number}} принят — Moditimewatch',
      `<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h2 style="color: #1a1a1a; margin: 0 0 10px;">Спасибо за заказ!</h2>
  <p style="margin: 0; color: #666;">Номер заказа: <strong style="color: #1a1a1a;">{{order_number}}</strong></p>
</div>
<p>Уважаемый(-ая) {{customer_name}},</p>
<p>Ваш заказ принят в обработку. Наш менеджер свяжется с вами в ближайшее время для подтверждения.</p>
<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Детали заказа</h3>
<table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
  <thead><tr style="background: #f8f8f8;"><th style="padding: 12px; text-align: left;">Товар</th><th style="padding: 12px; text-align: center;">Кол-во</th><th style="padding: 12px; text-align: right;">Сумма</th></tr></thead>
  <tbody>{{items}}</tbody>
  <tfoot><tr><td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Итого:</td><td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #1a1a1a;">{{total}}</td></tr></tfoot>
</table>
<div style="background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center;">
  <p style="margin: 0 0 10px; color: #666;">Телефон: <a href="tel:+79999604322" style="color: #1a1a1a;">+7 (999) 960-43-22</a></p>
</div>`,
      'Заказ #{{order_number}} принят. Спасибо за покупку!'
    );

    insertTemplate.run(
      'order_admin_notification',
      'Новый заказ #{{order_number}}',
      `<div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h2 style="color: #92400e; margin: 0 0 10px;">Новый заказ!</h2>
  <p style="margin: 0; color: #92400e;">Номер: <strong>{{order_number}}</strong> | Сумма: <strong>{{total}}</strong></p>
</div>
<table style="width: 100%; margin-bottom: 20px;">
  <tr><td style="padding: 8px 0; color: #666; width: 120px;">Клиент:</td><td>{{customer_name}}</td></tr>
  <tr><td style="padding: 8px 0; color: #666;">Телефон:</td><td>{{customer_phone}}</td></tr>
  <tr><td style="padding: 8px 0; color: #666;">Email:</td><td>{{customer_email}}</td></tr>
  <tr><td style="padding: 8px 0; color: #666;">Адрес:</td><td>{{address}}</td></tr>
</table>
<h3 style="color: #1a1a1a; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">Товары</h3>
<table style="width: 100%; border-collapse: collapse;">
  <thead><tr style="background: #f8f8f8;"><th style="padding: 12px; text-align: left;">Товар</th><th style="padding: 12px; text-align: center;">Кол-во</th><th style="padding: 12px; text-align: right;">Сумма</th></tr></thead>
  <tbody>{{items}}</tbody>
  <tfoot><tr><td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Итого:</td><td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">{{total}}</td></tr></tfoot>
</table>`,
      'Новый заказ #{{order_number}} от {{customer_name}} на сумму {{total}}'
    );

    insertTemplate.run(
      'order_status_confirmed',
      'Заказ #{{order_number}} подтверждён — Moditimewatch',
      `<div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h2 style="color: #16a34a; margin: 0 0 10px;">Заказ подтверждён</h2>
  <p style="margin: 0; color: #166534;">Номер заказа: <strong>{{order_number}}</strong></p>
</div>
<p>Уважаемый(-ая) {{customer_name}},</p>
<p>Ваш заказ <strong>#{{order_number}}</strong> подтверждён и передан в обработку.</p>
<p>Мы сообщим вам, когда заказ будет отправлен.</p>
<p style="color: #666;">Если у вас есть вопросы, звоните: <a href="tel:+79999604322">+7 (999) 960-43-22</a></p>`,
      'Заказ #{{order_number}} подтверждён и передан в обработку.'
    );

    insertTemplate.run(
      'order_status_shipped',
      'Заказ #{{order_number}} отправлен — Moditimewatch',
      `<div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h2 style="color: #4338ca; margin: 0 0 10px;">Заказ отправлен</h2>
  <p style="margin: 0; color: #3730a3;">Номер заказа: <strong>{{order_number}}</strong></p>
</div>
<p>Уважаемый(-ая) {{customer_name}},</p>
<p>Ваш заказ <strong>#{{order_number}}</strong> отправлен!</p>
<p>Адрес доставки: {{address}}</p>
<p>Мы сообщим вам, когда заказ будет доставлен.</p>
<p style="color: #666;">Если у вас есть вопросы, звоните: <a href="tel:+79999604322">+7 (999) 960-43-22</a></p>`,
      'Заказ #{{order_number}} отправлен на адрес {{address}}.'
    );

    insertTemplate.run(
      'order_status_delivered',
      'Заказ #{{order_number}} доставлен — Moditimewatch',
      `<div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
  <h2 style="color: #16a34a; margin: 0 0 10px;">Заказ доставлен</h2>
  <p style="margin: 0; color: #166534;">Номер заказа: <strong>{{order_number}}</strong></p>
</div>
<p>Уважаемый(-ая) {{customer_name}},</p>
<p>Ваш заказ <strong>#{{order_number}}</strong> доставлен!</p>
<p>Спасибо за покупку в Moditimewatch. Мы ценим ваше доверие.</p>
<p style="color: #666;">Если у вас есть вопросы, звоните: <a href="tel:+79999604322">+7 (999) 960-43-22</a></p>`,
      'Заказ #{{order_number}} доставлен. Спасибо за покупку!'
    );

    // Homepage Section Config (Session-18)
    const insertSectionConfig = db.prepare('INSERT INTO homepage_section_config (section_key, eyebrow, title, description) VALUES (?, ?, ?, ?)');
    insertSectionConfig.run('collections', 'Подборки', 'Кураторские коллекции Moditimewatch', 'Авторский отбор от экспертов для тех, кто ценит детали и ищет часы с характером.');
    insertSectionConfig.run('showcase', 'Бестселлеры', 'Топ-модели недели', '');
    insertSectionConfig.run('experience', 'Опыт Moditimewatch', 'Премиальный сервис для ценителей часов', 'Индивидуальный подход к каждому клиенту.');
    insertSectionConfig.run('testimonials', 'Отзывы клиентов', 'Истории владельцев Moditimewatch', 'Что говорят клиенты о сервисе Moditimewatch.');
    insertSectionConfig.run('editorial', 'Журнал', 'Экспертиза и вдохновение', '');
    insertSectionConfig.run('telegram', 'Подписка', 'Канал Moditimewatch в Telegram', 'Анонсы релизов и эксклюзивные предложения');

    console.log('✅ Database seeded successfully (с Hero, Experience, Navigation, Footer, Filters, Config, Email Templates, pSEO Schema)');
  });
  seed();
}

// Seed additional cities (runs on every startup, uses INSERT OR IGNORE for idempotency)
function seedAdditionalCities() {
  const cityCount = (db.prepare('SELECT COUNT(*) as count FROM cities').get() as { count: number }).count;
  if (cityCount >= 100) return; // Already has enough cities

  console.log(`Cities in DB: ${cityCount}. Seeding additional cities...`);

  const insertCity = db.prepare(`
    INSERT OR IGNORE INTO cities (slug, name, name_genitive, name_prepositional, name_accusative, delivery_days, delivery_price, is_active, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const cities: [string, string, string, string, string, number, string, number][] = [
    // [slug, name, name_genitive, name_prepositional, name_accusative, delivery_days, delivery_price, priority]
    ['moscow', 'Москва', 'Москвы', 'Москве', 'Москву', 0, 'Бесплатно', 100],
    ['saint-petersburg', 'Санкт-Петербург', 'Санкт-Петербурга', 'Санкт-Петербурге', 'Санкт-Петербург', 1, 'Бесплатно', 99],
    ['kazan', 'Казань', 'Казани', 'Казани', 'Казань', 2, 'Бесплатно', 98],
    ['novosibirsk', 'Новосибирск', 'Новосибирска', 'Новосибирске', 'Новосибирск', 3, 'Бесплатно', 97],
    ['yekaterinburg', 'Екатеринбург', 'Екатеринбурга', 'Екатеринбурге', 'Екатеринбург', 2, 'Бесплатно', 96],
    ['nizhny-novgorod', 'Нижний Новгород', 'Нижнего Новгорода', 'Нижнем Новгороде', 'Нижний Новгород', 2, 'Бесплатно', 95],
    ['chelyabinsk', 'Челябинск', 'Челябинска', 'Челябинске', 'Челябинск', 3, 'Бесплатно', 94],
    ['samara', 'Самара', 'Самары', 'Самаре', 'Самару', 2, 'Бесплатно', 93],
    ['omsk', 'Омск', 'Омска', 'Омске', 'Омск', 3, 'Бесплатно', 92],
    ['rostov-on-don', 'Ростов-на-Дону', 'Ростова-на-Дону', 'Ростове-на-Дону', 'Ростов-на-Дону', 2, 'Бесплатно', 91],
    ['ufa', 'Уфа', 'Уфы', 'Уфе', 'Уфу', 2, 'Бесплатно', 90],
    ['krasnoyarsk', 'Красноярск', 'Красноярска', 'Красноярске', 'Красноярск', 4, 'Бесплатно', 89],
    ['voronezh', 'Воронеж', 'Воронежа', 'Воронеже', 'Воронеж', 2, 'Бесплатно', 88],
    ['perm', 'Пермь', 'Перми', 'Перми', 'Пермь', 3, 'Бесплатно', 87],
    ['volgograd', 'Волгоград', 'Волгограда', 'Волгограде', 'Волгоград', 2, 'Бесплатно', 86],
    ['krasnodar', 'Краснодар', 'Краснодара', 'Краснодаре', 'Краснодар', 2, 'Бесплатно', 85],
    ['saratov', 'Саратов', 'Саратова', 'Саратове', 'Саратов', 2, 'Бесплатно', 84],
    ['tyumen', 'Тюмень', 'Тюмени', 'Тюмени', 'Тюмень', 3, 'Бесплатно', 83],
    ['tolyatti', 'Тольятти', 'Тольятти', 'Тольятти', 'Тольятти', 2, 'Бесплатно', 82],
    ['izhevsk', 'Ижевск', 'Ижевска', 'Ижевске', 'Ижевск', 3, 'Бесплатно', 81],
    ['barnaul', 'Барнаул', 'Барнаула', 'Барнауле', 'Барнаул', 4, 'Бесплатно', 80],
    ['ulyanovsk', 'Ульяновск', 'Ульяновска', 'Ульяновске', 'Ульяновск', 2, 'Бесплатно', 79],
    ['irkutsk', 'Иркутск', 'Иркутска', 'Иркутске', 'Иркутск', 5, 'Бесплатно', 78],
    ['khabarovsk', 'Хабаровск', 'Хабаровска', 'Хабаровске', 'Хабаровск', 6, 'Бесплатно', 77],
    ['vladivostok', 'Владивосток', 'Владивостока', 'Владивостоке', 'Владивосток', 7, 'Бесплатно', 76],
    ['yaroslavl', 'Ярославль', 'Ярославля', 'Ярославле', 'Ярославль', 1, 'Бесплатно', 75],
    ['makhachkala', 'Махачкала', 'Махачкалы', 'Махачкале', 'Махачкалу', 3, 'Бесплатно', 74],
    ['tomsk', 'Томск', 'Томска', 'Томске', 'Томск', 4, 'Бесплатно', 73],
    ['orenburg', 'Оренбург', 'Оренбурга', 'Оренбурге', 'Оренбург', 3, 'Бесплатно', 72],
    ['kemerovo', 'Кемерово', 'Кемерова', 'Кемерове', 'Кемерово', 4, 'Бесплатно', 71],
    ['novokuznetsk', 'Новокузнецк', 'Новокузнецка', 'Новокузнецке', 'Новокузнецк', 4, 'Бесплатно', 70],
    ['ryazan', 'Рязань', 'Рязани', 'Рязани', 'Рязань', 1, 'Бесплатно', 69],
    ['astrakhan', 'Астрахань', 'Астрахани', 'Астрахани', 'Астрахань', 3, 'Бесплатно', 68],
    ['naberezhnye-chelny', 'Набережные Челны', 'Набережных Челнов', 'Набережных Челнах', 'Набережные Челны', 2, 'Бесплатно', 67],
    ['penza', 'Пенза', 'Пензы', 'Пензе', 'Пензу', 2, 'Бесплатно', 66],
    ['lipetsk', 'Липецк', 'Липецка', 'Липецке', 'Липецк', 2, 'Бесплатно', 65],
    ['kirov', 'Киров', 'Кирова', 'Кирове', 'Киров', 2, 'Бесплатно', 64],
    ['cheboksary', 'Чебоксары', 'Чебоксар', 'Чебоксарах', 'Чебоксары', 2, 'Бесплатно', 63],
    ['tula', 'Тула', 'Тулы', 'Туле', 'Тулу', 1, 'Бесплатно', 62],
    ['kaliningrad', 'Калининград', 'Калининграда', 'Калининграде', 'Калининград', 2, 'Бесплатно', 61],
    ['kursk', 'Курск', 'Курска', 'Курске', 'Курск', 2, 'Бесплатно', 60],
    ['stavropol', 'Ставрополь', 'Ставрополя', 'Ставрополе', 'Ставрополь', 3, 'Бесплатно', 59],
    ['sochi', 'Сочи', 'Сочи', 'Сочи', 'Сочи', 2, 'Бесплатно', 58],
    ['ulan-ude', 'Улан-Удэ', 'Улан-Удэ', 'Улан-Удэ', 'Улан-Удэ', 5, 'Бесплатно', 57],
    ['tver', 'Тверь', 'Твери', 'Твери', 'Тверь', 1, 'Бесплатно', 56],
    ['bryansk', 'Брянск', 'Брянска', 'Брянске', 'Брянск', 2, 'Бесплатно', 55],
    ['ivanovo', 'Иваново', 'Иванова', 'Иванове', 'Иваново', 1, 'Бесплатно', 54],
    ['belgorod', 'Белгород', 'Белгорода', 'Белгороде', 'Белгород', 2, 'Бесплатно', 53],
    ['surgut', 'Сургут', 'Сургута', 'Сургуте', 'Сургут', 3, 'Бесплатно', 52],
    ['vladimir', 'Владимир', 'Владимира', 'Владимире', 'Владимир', 1, 'Бесплатно', 51],
    ['arkhangelsk', 'Архангельск', 'Архангельска', 'Архангельске', 'Архангельск', 3, 'Бесплатно', 50],
    ['chita', 'Чита', 'Читы', 'Чите', 'Читу', 5, 'Бесплатно', 49],
    ['kaluga', 'Калуга', 'Калуги', 'Калуге', 'Калугу', 1, 'Бесплатно', 48],
    ['smolensk', 'Смоленск', 'Смоленска', 'Смоленске', 'Смоленск', 2, 'Бесплатно', 47],
    ['volzhsky', 'Волжский', 'Волжского', 'Волжском', 'Волжский', 2, 'Бесплатно', 46],
    ['saransk', 'Саранск', 'Саранска', 'Саранске', 'Саранск', 2, 'Бесплатно', 45],
    ['tambov', 'Тамбов', 'Тамбова', 'Тамбове', 'Тамбов', 2, 'Бесплатно', 44],
    ['sterlitamak', 'Стерлитамак', 'Стерлитамака', 'Стерлитамаке', 'Стерлитамак', 3, 'Бесплатно', 43],
    ['kostroma', 'Кострома', 'Костромы', 'Костроме', 'Кострому', 1, 'Бесплатно', 42],
    ['vologda', 'Вологда', 'Вологды', 'Вологде', 'Вологду', 2, 'Бесплатно', 41],
    ['petrozavodsk', 'Петрозаводск', 'Петрозаводска', 'Петрозаводске', 'Петрозаводск', 2, 'Бесплатно', 40],
    ['murmansk', 'Мурманск', 'Мурманска', 'Мурманске', 'Мурманск', 3, 'Бесплатно', 39],
    ['yakutsk', 'Якутск', 'Якутска', 'Якутске', 'Якутск', 6, 'Бесплатно', 38],
    ['yoshkar-ola', 'Йошкар-Ола', 'Йошкар-Олы', 'Йошкар-Оле', 'Йошкар-Олу', 2, 'Бесплатно', 37],
    ['syktyvkar', 'Сыктывкар', 'Сыктывкара', 'Сыктывкаре', 'Сыктывкар', 3, 'Бесплатно', 36],
    ['nizhnevartovsk', 'Нижневартовск', 'Нижневартовска', 'Нижневартовске', 'Нижневартовск', 3, 'Бесплатно', 35],
    ['norilsk', 'Норильск', 'Норильска', 'Норильске', 'Норильск', 5, 'Бесплатно', 34],
    ['grozny', 'Грозный', 'Грозного', 'Грозном', 'Грозный', 3, 'Бесплатно', 33],
    ['nizhnekamsk', 'Нижнекамск', 'Нижнекамска', 'Нижнекамске', 'Нижнекамск', 2, 'Бесплатно', 32],
    ['pskov', 'Псков', 'Пскова', 'Пскове', 'Псков', 2, 'Бесплатно', 31],
    ['novorossiysk', 'Новороссийск', 'Новороссийска', 'Новороссийске', 'Новороссийск', 2, 'Бесплатно', 30],
    ['magnitogorsk', 'Магнитогорск', 'Магнитогорска', 'Магнитогорске', 'Магнитогорск', 3, 'Бесплатно', 29],
    ['noyabrsk', 'Ноябрьск', 'Ноябрьска', 'Ноябрьске', 'Ноябрьск', 4, 'Бесплатно', 28],
    ['prokopyevsk', 'Прокопьевск', 'Прокопьевска', 'Прокопьевске', 'Прокопьевск', 4, 'Бесплатно', 27],
    ['biysk', 'Бийск', 'Бийска', 'Бийске', 'Бийск', 4, 'Бесплатно', 26],
    ['balashikha', 'Балашиха', 'Балашихи', 'Балашихе', 'Балашиху', 0, 'Бесплатно', 25],
    ['podolsk', 'Подольск', 'Подольска', 'Подольске', 'Подольск', 0, 'Бесплатно', 24],
    ['khimki', 'Химки', 'Химок', 'Химках', 'Химки', 0, 'Бесплатно', 23],
    ['mytishchi', 'Мытищи', 'Мытищ', 'Мытищах', 'Мытищи', 0, 'Бесплатно', 22],
    ['korolev', 'Королёв', 'Королёва', 'Королёве', 'Королёв', 0, 'Бесплатно', 21],
    ['lyubertsy', 'Люберцы', 'Люберец', 'Люберцах', 'Люберцы', 0, 'Бесплатно', 20],
    ['kolomna', 'Коломна', 'Коломны', 'Коломне', 'Коломну', 1, 'Бесплатно', 19],
    ['elektrostal', 'Электросталь', 'Электростали', 'Электростали', 'Электросталь', 0, 'Бесплатно', 18],
    ['odintsovo', 'Одинцово', 'Одинцова', 'Одинцове', 'Одинцово', 0, 'Бесплатно', 17],
    ['zhukovsky', 'Жуковский', 'Жуковского', 'Жуковском', 'Жуковский', 0, 'Бесплатно', 16],
    ['serpukhov', 'Серпухов', 'Серпухова', 'Серпухове', 'Серпухов', 1, 'Бесплатно', 15],
    ['orsk', 'Орск', 'Орска', 'Орске', 'Орск', 3, 'Бесплатно', 14],
    ['angarsk', 'Ангарск', 'Ангарска', 'Ангарске', 'Ангарск', 5, 'Бесплатно', 13],
    ['engels', 'Энгельс', 'Энгельса', 'Энгельсе', 'Энгельс', 2, 'Бесплатно', 12],
    ['blagoveshchensk', 'Благовещенск', 'Благовещенска', 'Благовещенске', 'Благовещенск', 6, 'Бесплатно', 11],
    ['veliky-novgorod', 'Великий Новгород', 'Великого Новгорода', 'Великом Новгороде', 'Великий Новгород', 2, 'Бесплатно', 10],
    ['yuzhno-sakhalinsk', 'Южно-Сахалинск', 'Южно-Сахалинска', 'Южно-Сахалинске', 'Южно-Сахалинск', 7, 'Бесплатно', 9],
    ['severodvinsk', 'Северодвинск', 'Северодвинска', 'Северодвинске', 'Северодвинск', 3, 'Бесплатно', 8],
    ['nefteyugansk', 'Нефтеюганск', 'Нефтеюганска', 'Нефтеюганске', 'Нефтеюганск', 4, 'Бесплатно', 7],
    ['novocherkassk', 'Новочеркасск', 'Новочеркасска', 'Новочеркасске', 'Новочеркасск', 2, 'Бесплатно', 6],
    ['zlatoust', 'Златоуст', 'Златоуста', 'Златоусте', 'Златоуст', 3, 'Бесплатно', 5],
    ['obninsk', 'Обнинск', 'Обнинска', 'Обнинске', 'Обнинск', 1, 'Бесплатно', 4],
    ['kamensk-uralsky', 'Каменск-Уральский', 'Каменска-Уральского', 'Каменске-Уральском', 'Каменск-Уральский', 3, 'Бесплатно', 3],
    ['petropavlovsk-kamchatsky', 'Петропавловск-Камчатский', 'Петропавловска-Камчатского', 'Петропавловске-Камчатском', 'Петропавловск-Камчатский', 7, 'Бесплатно', 2],
    ['nalchik', 'Нальчик', 'Нальчика', 'Нальчике', 'Нальчик', 3, 'Бесплатно', 1],
  ];

  const transaction = db.transaction(() => {
    for (const [slug, name, genitive, prepositional, accusative, days, price, priority] of cities) {
      insertCity.run(slug, name, genitive, prepositional, accusative, days, price, priority);
    }
  });

  transaction();
  const newCount = (db.prepare('SELECT COUNT(*) as count FROM cities').get() as { count: number }).count;
  console.log(`✅ Cities seeded: ${newCount} total`);
}

// Session-20: Seed additional site_config keys (idempotent — INSERT OR IGNORE)
function seedSiteConfigExtras() {
  const insertOrIgnore = db.prepare('INSERT OR IGNORE INTO site_config (key, value, type, description) VALUES (?, ?, ?, ?)');
  const seed = db.transaction(() => {
    // Logo & branding
    insertOrIgnore.run('logo_wordmark', 'Moditimewatch', 'string', 'Текст логотипа (wordmark)');
    insertOrIgnore.run('logo_tagline', 'Fine Time Delivery', 'string', 'Подзаголовок логотипа');
    insertOrIgnore.run('logo_image_url', '', 'string', 'URL изображения логотипа (SVG/PNG)');
    insertOrIgnore.run('logo_mode', 'text', 'string', 'Режим логотипа: text / image');
    insertOrIgnore.run('company_description', 'Сервис доставки оригинальных часов из-за рубежа с гарантией подлинности и персональными консультациями.', 'string', 'Описание компании для footer');
    insertOrIgnore.run('favicon_url', '', 'string', 'URL favicon');

    // Social links
    insertOrIgnore.run('social_vk', '', 'string', 'Ссылка на VK');
    insertOrIgnore.run('social_youtube', '', 'string', 'Ссылка на YouTube');
    insertOrIgnore.run('social_whatsapp', '', 'string', 'Ссылка на WhatsApp');

    // Topbar
    insertOrIgnore.run('topbar_badge', 'Moditimewatch Delivery', 'string', 'Бейдж в topbar');
    insertOrIgnore.run('topbar_text', 'Доставка премиальных часов по России и СНГ', 'string', 'Текст в topbar');
    insertOrIgnore.run('topbar_visible', 'true', 'boolean', 'Показывать topbar');
  });
  seed();
}

// INITIALIZE DATABASE BEFORE CREATING QUERIES! (only in main thread)
if (isMainThread) {
	initializeDatabase();
	seedDatabase();
	seedAdditionalCities();
	seedSiteConfigExtras();
}

// QUERIES (создаются ПОСЛЕ инициализации таблиц, only in main thread)
// Lazy initialization via function to avoid worker thread errors during Vite SSR build
const createQueries = () => ({
  // Products - Basic
  getProductBySlug: db.prepare('SELECT p.*, b.name as brand_name, b.slug as brand_slug FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.slug = ? AND p.is_active = 1'),
  getAllActiveProducts: db.prepare('SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.is_active = 1 ORDER BY p.position'),
  getFeaturedProducts: db.prepare('SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.is_featured = 1 AND p.is_active = 1 ORDER BY p.position LIMIT ?'),
  getActiveProductsByBrand: db.prepare('SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.brand_id = ? AND p.is_active = 1 ORDER BY p.position LIMIT 4'),
  getActiveProductsByCategory: db.prepare('SELECT p.*, b.name as brand_name FROM products p JOIN brands b ON b.id = p.brand_id WHERE p.category_id = ? AND p.is_active = 1 ORDER BY p.position LIMIT 4'),
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
  getProductOptions: db.prepare('SELECT id, option_type, option_label, option_value, option_value_label, price_modifier, is_default FROM product_options WHERE product_id = ? ORDER BY position'),
  addProductOption: db.prepare('INSERT INTO product_options (product_id, option_type, option_label, option_value, option_value_label, price_modifier, is_default, position) VALUES (@product_id, @option_type, @option_label, @option_value, @option_value_label, @price_modifier, @is_default, @position)'),
  deleteProductOption: db.prepare('DELETE FROM product_options WHERE id = ?'),
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
  getHomepageSectionConfigs: db.prepare('SELECT * FROM homepage_section_config WHERE is_active = 1'),
  getHomeHero: db.prepare('SELECT * FROM home_hero WHERE is_active = 1 LIMIT 1'),
  getAllCollections: db.prepare('SELECT * FROM collections WHERE is_active = 1 ORDER BY position'),
  getAllTestimonials: db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY display_order'),
  getFeaturedArticles: db.prepare('SELECT a.*, ac.name as category_name FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.is_featured = 1 AND a.is_published = 1 ORDER BY a.published_at DESC LIMIT ?'),
  getHomeServices: db.prepare('SELECT * FROM home_services WHERE is_active = 1 ORDER BY position'),
  getHomeServiceStats: db.prepare('SELECT * FROM home_service_stats ORDER BY position'),
  getTelegramWidget: db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' AND is_active = 1 LIMIT 1"),

  // Filters
  getFilterAttributes: db.prepare('SELECT * FROM filter_attributes WHERE is_active = 1 ORDER BY position'),
  getFilterValues: db.prepare('SELECT * FROM filter_values WHERE attribute_id = ? ORDER BY position'),
  getAllFilterValues: db.prepare(`
    SELECT fv.*, fa.slug as attribute_slug, fa.name as attribute_name
    FROM filter_values fv
    JOIN filter_attributes fa ON fa.id = fv.attribute_id
    WHERE fa.is_active = 1
    ORDER BY fa.position, fv.position
  `),

  // Static pages
  getPageBySlug: db.prepare('SELECT * FROM pages WHERE slug = ? AND is_published = 1'),
  getSeoMetaBySlug: db.prepare('SELECT * FROM seo_meta WHERE page_type = ? AND slug = ?'),

  // ============================================
  // AUTH
  // ============================================

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
  adminDeleteNavItemChildren: db.prepare('DELETE FROM navigation_items WHERE parent_id = ?'),
  adminGetNavItemsByMenuType: db.prepare('SELECT * FROM navigation_items WHERE menu_type = ? ORDER BY position, id'),
  adminCountNavItemsByMenuType: db.prepare('SELECT menu_type, COUNT(*) as cnt FROM navigation_items GROUP BY menu_type'),

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

  // ============================================
  // ADMIN - SITE CONFIG
  // ============================================
  adminListConfig: db.prepare('SELECT * FROM site_config ORDER BY key'),
  adminUpdateConfig: db.prepare("UPDATE site_config SET value = @value, updated_at = datetime('now') WHERE key = @key"),
  adminCreateConfig: db.prepare('INSERT INTO site_config (key, value, type, description) VALUES (@key, @value, @type, @description)'),
  adminDeleteConfig: db.prepare('DELETE FROM site_config WHERE key = ?'),

  // ============================================
  // SESSIONS 1-4 QUERIES
  // ============================================

  // Collections (Session-2, Task 1)
  adminListCollections: db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM collection_products WHERE collection_id = c.id) as product_count FROM collections c ORDER BY c.position, c.title`),
  adminGetCollection: db.prepare('SELECT * FROM collections WHERE id = ?'),
  adminCreateCollection: db.prepare(`INSERT INTO collections (slug, category, title, description, image_url, link_text, link_href, is_active, position) VALUES (@slug, @category, @title, @description, @image_url, @link_text, @link_href, @is_active, @position)`),
  adminUpdateCollection: db.prepare(`UPDATE collections SET slug = @slug, category = @category, title = @title, description = @description, image_url = @image_url, link_text = @link_text, link_href = @link_href, is_active = @is_active, position = @position, updated_at = datetime('now') WHERE id = @id`),
  adminDeleteCollection: db.prepare('DELETE FROM collections WHERE id = ?'),
  adminGetMaxCollectionPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM collections'),
  adminGetCollectionProducts: db.prepare(`SELECT p.* FROM products p JOIN collection_products cp ON cp.product_id = p.id WHERE cp.collection_id = ? ORDER BY cp.position`),
  adminGetAllProductsForCollection: db.prepare(`SELECT id, name FROM products WHERE is_active = 1 ORDER BY name`),
  adminAddProductToCollection: db.prepare(`INSERT INTO collection_products (collection_id, product_id, position) VALUES (@collection_id, @product_id, @position)`),
  adminRemoveProductFromCollection: db.prepare('DELETE FROM collection_products WHERE collection_id = ? AND product_id = ?'),

  // Articles/Journal (Session-2, Task 5)
  adminListArticles: db.prepare(`SELECT a.*, ac.name as category_name FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id ORDER BY a.published_at DESC, a.title`),
  adminListArticlesByCategory: db.prepare(`SELECT a.*, ac.name as category_name FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.category_id = ? ORDER BY a.published_at DESC, a.title`),
  adminGetArticle: db.prepare(`SELECT a.*, ac.name as category_name FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.id = ?`),
  adminGetAllArticleCategories: db.prepare('SELECT id, name FROM article_categories ORDER BY position'),
  adminCreateArticle: db.prepare(`INSERT INTO articles (slug, title, subtitle, excerpt, content, image_url, category_id, is_featured, is_published, published_at) VALUES (@slug, @title, @subtitle, @excerpt, @content, @image_url, @category_id, @is_featured, @is_published, CASE WHEN @is_published = 1 THEN datetime('now') ELSE NULL END)`),
  adminUpdateArticle: db.prepare(`UPDATE articles SET slug = @slug, title = @title, subtitle = @subtitle, excerpt = @excerpt, content = @content, image_url = @image_url, category_id = @category_id, is_featured = @is_featured, is_published = @is_published, updated_at = datetime('now') WHERE id = @id`),
  adminDeleteArticle: db.prepare('DELETE FROM articles WHERE id = ?'),

  // Cities (Session-2, Task 2)
  adminListCities: db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM city_articles WHERE city_id = c.id) as article_count FROM cities c ORDER BY c.priority DESC, c.name`),
  adminSearchCities: db.prepare(`SELECT c.*, (SELECT COUNT(*) FROM city_articles WHERE city_id = c.id) as article_count FROM cities c WHERE c.name LIKE ? ORDER BY c.priority DESC, c.name`),
  adminGetCity: db.prepare('SELECT * FROM cities WHERE id = ?'),
  adminCreateCity: db.prepare(`INSERT INTO cities (slug, name, name_genitive, name_prepositional, name_dative, name_accusative, region, population, timezone, delivery_days, delivery_price, hero_image_url, hero_title, hero_subtitle, meta_description, is_active, priority) VALUES (@slug, @name, @name_genitive, @name_prepositional, @name_dative, @name_accusative, @region, @population, @timezone, @delivery_days, @delivery_price, @hero_image_url, @hero_title, @hero_subtitle, @meta_description, @is_active, @priority)`),
  adminUpdateCity: db.prepare(`UPDATE cities SET slug = @slug, name = @name, name_genitive = @name_genitive, name_prepositional = @name_prepositional, name_dative = @name_dative, name_accusative = @name_accusative, region = @region, population = @population, timezone = @timezone, delivery_days = @delivery_days, delivery_price = @delivery_price, hero_image_url = @hero_image_url, hero_title = @hero_title, hero_subtitle = @hero_subtitle, meta_description = @meta_description, is_active = @is_active, priority = @priority, updated_at = datetime('now') WHERE id = @id`),
  adminDeleteCity: db.prepare('DELETE FROM cities WHERE id = ?'),
  adminGetMaxCityPriority: db.prepare('SELECT COALESCE(MAX(priority), 0) + 1 as next_priority FROM cities'),
  adminGetCityArticles: db.prepare(`SELECT * FROM city_articles WHERE city_id = ? ORDER BY published_at DESC, title`),

  // Testimonials (Session-2, Task 4)
  listTestimonials: db.prepare('SELECT * FROM testimonials ORDER BY display_order, name'),
  getTestimonialById: db.prepare('SELECT * FROM testimonials WHERE id = ?'),
  updateTestimonial: db.prepare(`UPDATE testimonials SET name = @name, position = @position, text = @text, avatar_url = @avatar_url, choice = @choice, is_active = @is_active, display_order = @display_order WHERE id = @id`),
  deleteTestimonial: db.prepare('DELETE FROM testimonials WHERE id = ?'),
  getMaxTestimonialOrder: db.prepare('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM testimonials'),
  createTestimonial: db.prepare(`INSERT INTO testimonials (name, position, text, avatar_url, choice, is_active, display_order) VALUES (@name, @position, @text, @avatar_url, @choice, @is_active, @display_order)`),

  // City Articles (Session-2, Task 3 + Session-6 updates)
  listCityArticles: db.prepare(`SELECT ca.*, c.name as city_name, cac.name as category_name FROM city_articles ca LEFT JOIN cities c ON c.id = ca.city_id LEFT JOIN city_article_categories cac ON cac.id = ca.category_id ORDER BY ca.published_at DESC, ca.title`),
  listCityArticlesByCity: db.prepare(`SELECT ca.*, c.name as city_name, cac.name as category_name FROM city_articles ca LEFT JOIN cities c ON c.id = ca.city_id LEFT JOIN city_article_categories cac ON cac.id = ca.category_id WHERE ca.city_id = ? ORDER BY ca.published_at DESC, ca.title`),
  getCityArticleById: db.prepare(`SELECT ca.*, c.name as city_name, cac.name as category_name FROM city_articles ca LEFT JOIN cities c ON c.id = ca.city_id LEFT JOIN city_article_categories cac ON cac.id = ca.category_id WHERE ca.id = ?`),
  getAllCitiesForSelect: db.prepare('SELECT id, name FROM cities ORDER BY name'),
  updateCityArticle: db.prepare(`UPDATE city_articles SET city_id = @city_id, slug = @slug, title = @title, excerpt = @excerpt, content = @content, image_url = @image_url, template_type = @template_type, meta_title = @meta_title, meta_description = @meta_description, category_id = @category_id, read_time = @read_time, is_published = @is_published, updated_at = datetime('now') WHERE id = @id`),
  createCityArticle: db.prepare(`INSERT INTO city_articles (city_id, slug, title, excerpt, content, image_url, template_type, meta_title, meta_description, category_id, read_time, is_published, published_at) VALUES (@city_id, @slug, @title, @excerpt, @content, @image_url, @template_type, @meta_title, @meta_description, @category_id, @read_time, @is_published, CASE WHEN @is_published = 1 THEN datetime('now') ELSE NULL END)`),
  deleteCityArticle: db.prepare('DELETE FROM city_articles WHERE id = ?'),

  // ============================================
  // SESSION-6: pSEO SCHEMA
  // ============================================

  // City Article Categories
  listCityArticleCategories: db.prepare('SELECT * FROM city_article_categories ORDER BY position, name'),
  getCityArticleCategory: db.prepare('SELECT * FROM city_article_categories WHERE id = ?'),
  createCityArticleCategory: db.prepare('INSERT INTO city_article_categories (name, slug, description, position, is_active) VALUES (@name, @slug, @description, @position, @is_active)'),
  updateCityArticleCategory: db.prepare(`UPDATE city_article_categories SET name = @name, slug = @slug, description = @description, position = @position, is_active = @is_active, updated_at = datetime('now') WHERE id = @id`),
  deleteCityArticleCategory: db.prepare('DELETE FROM city_article_categories WHERE id = ?'),
  getAllCityArticleCategoriesForSelect: db.prepare('SELECT id, name FROM city_article_categories WHERE is_active = 1 ORDER BY position, name'),

  // City Article Tags
  listCityArticleTags: db.prepare('SELECT * FROM city_article_tags ORDER BY name'),
  getCityArticleTag: db.prepare('SELECT * FROM city_article_tags WHERE id = ?'),
  createCityArticleTag: db.prepare('INSERT INTO city_article_tags (name, slug) VALUES (@name, @slug)'),
  deleteCityArticleTag: db.prepare('DELETE FROM city_article_tags WHERE id = ?'),

  // City Article Tag Relations
  addTagToCityArticle: db.prepare('INSERT OR IGNORE INTO city_article_tag_relations (article_id, tag_id) VALUES (?, ?)'),
  removeTagFromCityArticle: db.prepare('DELETE FROM city_article_tag_relations WHERE article_id = ? AND tag_id = ?'),
  getCityArticleTags: db.prepare(`SELECT t.* FROM city_article_tags t JOIN city_article_tag_relations r ON r.tag_id = t.id WHERE r.article_id = ? ORDER BY t.name`),
  getCityArticlesByTag: db.prepare(`SELECT ca.*, c.name as city_name FROM city_articles ca JOIN city_article_tag_relations r ON r.article_id = ca.id JOIN cities c ON c.id = ca.city_id WHERE r.tag_id = ? AND ca.is_published = 1 ORDER BY ca.published_at DESC`),

  // City Article Related
  addRelatedCityArticle: db.prepare('INSERT OR IGNORE INTO city_article_related (article_id, related_article_id, position) VALUES (?, ?, ?)'),
  removeRelatedCityArticle: db.prepare('DELETE FROM city_article_related WHERE article_id = ? AND related_article_id = ?'),
  getRelatedCityArticles: db.prepare(`SELECT ca.*, c.name as city_name FROM city_articles ca JOIN city_article_related r ON r.related_article_id = ca.id JOIN cities c ON c.id = ca.city_id WHERE r.article_id = ? ORDER BY r.position`),

  // City Article Media
  listCityArticleMedia: db.prepare('SELECT * FROM city_article_media WHERE article_id = ? ORDER BY position'),
  addCityArticleMedia: db.prepare('INSERT INTO city_article_media (article_id, media_type, url, alt_text, caption, position) VALUES (@article_id, @media_type, @url, @alt_text, @caption, @position)'),
  updateCityArticleMedia: db.prepare(`UPDATE city_article_media SET media_type = @media_type, url = @url, alt_text = @alt_text, caption = @caption, position = @position WHERE id = @id`),
  deleteCityArticleMedia: db.prepare('DELETE FROM city_article_media WHERE id = ?'),

  // City Article Products (existing table, new queries — Session-6 Task 6)
  addProductToCityArticle: db.prepare('INSERT OR IGNORE INTO city_article_products (article_id, product_id, position) VALUES (?, ?, ?)'),
  removeProductFromCityArticle: db.prepare('DELETE FROM city_article_products WHERE article_id = ? AND product_id = ?'),
  getCityArticleProducts: db.prepare(`SELECT p.*, b.name as brand_name, (SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image FROM products p JOIN city_article_products cap ON cap.product_id = p.id JOIN brands b ON b.id = p.brand_id WHERE cap.article_id = ? ORDER BY cap.position`),

  // FTS5 Search (Session-6 Task 7)
  searchCityArticles: db.prepare(`SELECT ca.*, c.name as city_name, c.slug as city_slug FROM city_articles ca JOIN cities c ON c.id = ca.city_id WHERE ca.id IN (SELECT rowid FROM city_articles_fts WHERE city_articles_fts MATCH ?) AND ca.is_published = 1 ORDER BY ca.published_at DESC LIMIT ?`),

  // Homepage (Session-4, Task 3) - Admin queries
  adminGetHomeHero: db.prepare('SELECT * FROM home_hero WHERE is_active = 1 LIMIT 1'),
  adminGetHomeServices: db.prepare('SELECT * FROM home_services ORDER BY position'),
  adminGetHomeStats: db.prepare('SELECT * FROM home_service_stats ORDER BY position'),
  adminGetTelegramWidget: db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' AND is_active = 1 LIMIT 1"),
  adminUpdateHomeHero: db.prepare(`UPDATE home_hero SET tagline = @tagline, title = @title, description = @description, primary_cta_text = @primary_cta_text, primary_cta_href = @primary_cta_href, secondary_cta_text = @secondary_cta_text, secondary_cta_href = @secondary_cta_href, image_url = @image_url, image_alt = @image_alt, image_badge_label = @image_badge_label, image_badge_title = @image_badge_title, stats_json = @stats_json, quick_links_json = @quick_links_json, brands_json = @brands_json, updated_at = datetime('now') WHERE id = @id`),
  adminUpdateHomeService: db.prepare(`UPDATE home_services SET icon_svg = @icon_svg, title = @title, description = @description, link_text = @link_text, link_href = @link_href, position = @position, is_active = @is_active WHERE id = @id`),
  adminCreateHomeService: db.prepare(`INSERT INTO home_services (icon_svg, title, description, link_text, link_href, position, is_active) VALUES (@icon_svg, @title, @description, @link_text, @link_href, @position, @is_active)`),
  adminDeleteHomeService: db.prepare('DELETE FROM home_services WHERE id = ?'),
  adminUpdateHomeStat: db.prepare('UPDATE home_service_stats SET label = @label, value = @value, position = @position WHERE id = @id'),
  adminCreateHomeStat: db.prepare('INSERT INTO home_service_stats (label, value, position) VALUES (@label, @value, @position)'),
  adminDeleteHomeStat: db.prepare('DELETE FROM home_service_stats WHERE id = ?'),
  adminUpdateWidget: db.prepare('UPDATE widgets SET data_json = @data_json, is_active = @is_active WHERE id = @id'),

  // Homepage Section Config (Session-18)
  getAllSectionConfigs: db.prepare('SELECT * FROM homepage_section_config'),
  getSectionConfig: db.prepare('SELECT * FROM homepage_section_config WHERE section_key = ?'),
  updateSectionConfig: db.prepare(`UPDATE homepage_section_config SET eyebrow = @eyebrow, title = @title, description = @description, extra_json = @extra_json, is_active = @is_active WHERE section_key = @section_key`),

  // Homepage Showcase Items (Session-18) — manual bestsellers
  getShowcaseItems: db.prepare(`SELECT hsi.*, p.name, p.slug, p.price, p.sku, b.name as brand_name FROM homepage_showcase_items hsi JOIN products p ON p.id = hsi.product_id LEFT JOIN brands b ON b.id = p.brand_id ORDER BY hsi.position`),
  addShowcaseItem: db.prepare('INSERT INTO homepage_showcase_items (product_id, position) VALUES (@product_id, @position)'),
  removeShowcaseItem: db.prepare('DELETE FROM homepage_showcase_items WHERE id = ?'),
  clearShowcaseItems: db.prepare('DELETE FROM homepage_showcase_items'),
  getMaxShowcasePosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM homepage_showcase_items'),
  reorderShowcaseItem: db.prepare('UPDATE homepage_showcase_items SET position = @position WHERE id = @id'),

  // Footer (Session-4, Task 1)
  adminGetFooterSections: db.prepare('SELECT * FROM footer_sections ORDER BY position'),
  adminGetFooterLinks: db.prepare('SELECT * FROM footer_links WHERE section_id = ? ORDER BY position'),
  createFooterSection: db.prepare(`INSERT INTO footer_sections (title, position, column_number, is_active) VALUES (@title, @position, @column_number, @is_active)`),
  updateFooterSection: db.prepare(`UPDATE footer_sections SET title = @title, position = @position, column_number = @column_number, is_active = @is_active WHERE id = @id`),
  deleteFooterSection: db.prepare('DELETE FROM footer_sections WHERE id = ?'),
  deleteFooterSectionLinks: db.prepare('DELETE FROM footer_links WHERE section_id = ?'),
  createFooterLink: db.prepare(`INSERT INTO footer_links (section_id, label, href, position, is_main_domain_only) VALUES (@section_id, @label, @href, @position, @is_main_domain_only)`),
  updateFooterLink: db.prepare(`UPDATE footer_links SET label = @label, href = @href, position = @position, is_main_domain_only = @is_main_domain_only WHERE id = @id`),
  deleteFooterLink: db.prepare('DELETE FROM footer_links WHERE id = ?'),

  // Site Config (Session-4, Task 2)
  getAllSiteConfig: db.prepare('SELECT key, value FROM site_config'),

  // City Layout (Session-4, Task 4)
  getCityNavItems: db.prepare(`SELECT * FROM navigation_items WHERE menu_type = 'city_header' AND is_active = 1 AND parent_id IS NULL ORDER BY position`),
  getFooterLegalLinks: db.prepare(`SELECT fl.* FROM footer_links fl JOIN footer_sections fs ON fs.id = fl.section_id WHERE fs.title = 'Правовая информация' ORDER BY fl.position`),

  // ============================================
  // SESSION-5: NOTIFICATIONS
  // ============================================

  // Site Config — get single value by key
  getConfigByKey: db.prepare('SELECT value FROM site_config WHERE key = ?'),

  // Email Templates
  getEmailTemplate: db.prepare('SELECT * FROM email_templates WHERE template_key = ? AND is_active = 1'),
  adminListEmailTemplates: db.prepare('SELECT * FROM email_templates ORDER BY template_key'),

  // Email Log
  insertEmailLog: db.prepare('INSERT INTO email_log (template_key, recipient_email, subject, status, error_message) VALUES (?, ?, ?, ?, ?)'),
  adminListEmailLogs: db.prepare('SELECT * FROM email_log ORDER BY sent_at DESC LIMIT 50'),

  // ============================================
  // SESSION-12: CALLBACK REQUESTS
  // ============================================
  insertCallbackRequest: db.prepare('INSERT INTO callback_requests (name, phone) VALUES (@name, @phone)'),
  adminListCallbackRequests: db.prepare('SELECT * FROM callback_requests ORDER BY created_at DESC'),
  adminUpdateCallbackStatus: db.prepare("UPDATE callback_requests SET status = ? WHERE id = ?"),

  // ============================================
  // SESSION-12: REORDER (Drag-and-drop)
  // ============================================
  reorderNavItem: db.prepare('UPDATE navigation_items SET position = @position WHERE id = @id'),
  reorderFooterSection: db.prepare('UPDATE footer_sections SET position = @position WHERE id = @id'),
  reorderFooterLink: db.prepare('UPDATE footer_links SET position = @position WHERE id = @id'),
  reorderCollection: db.prepare('UPDATE collections SET position = @position WHERE id = @id'),
  reorderCategory: db.prepare('UPDATE categories SET position = @position WHERE id = @id'),
  reorderBrand: db.prepare('UPDATE brands SET position = @position WHERE id = @id'),
  reorderTestimonial: db.prepare('UPDATE testimonials SET display_order = @display_order WHERE id = @id'),
  reorderCityArticleCategory: db.prepare('UPDATE city_article_categories SET position = @position WHERE id = @id'),

  // ============================================
  // SESSION-19: Homepage Admin Part 2
  // ============================================

  // Homepage Editorial Items — manual journal mode
  getEditorialItems: db.prepare(`SELECT hei.*, a.title, a.slug, a.excerpt, a.image_url, ac.name as category_name FROM homepage_editorial_items hei JOIN articles a ON a.id = hei.article_id LEFT JOIN article_categories ac ON ac.id = a.category_id ORDER BY hei.position`),
  addEditorialItem: db.prepare('INSERT INTO homepage_editorial_items (article_id, position) VALUES (@article_id, @position)'),
  removeEditorialItem: db.prepare('DELETE FROM homepage_editorial_items WHERE id = ?'),
  clearEditorialItems: db.prepare('DELETE FROM homepage_editorial_items'),
  getMaxEditorialPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM homepage_editorial_items'),
  reorderEditorialItem: db.prepare('UPDATE homepage_editorial_items SET position = @position WHERE id = @id'),

  // Article search for editorial manual mode
  searchArticles: db.prepare(`SELECT a.id, a.title, a.slug, a.excerpt, a.image_url, ac.name as category_name FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.is_published = 1 AND (a.title LIKE @q OR a.slug LIKE @q) ORDER BY a.published_at DESC LIMIT 10`),

  // Service reorder
  reorderService: db.prepare('UPDATE home_services SET position = @position WHERE id = @id'),
  adminGetMaxServicePosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM home_services'),

  // Stat reorder
  reorderStat: db.prepare('UPDATE home_service_stats SET position = @position WHERE id = @id'),
  adminGetMaxStatPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM home_service_stats'),

  // Site Config — update by key
  updateConfigByKey: db.prepare('UPDATE site_config SET value = ? WHERE key = ?'),

  // Telegram widget — upsert
  upsertTelegramWidget: db.prepare(`INSERT INTO widgets (type, title, data_json, is_active) VALUES ('telegram_cta', 'Telegram CTA', @data_json, @is_active) ON CONFLICT(id) DO UPDATE SET data_json = @data_json, is_active = @is_active`),
  getTelegramWidgetForAdmin: db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' LIMIT 1"),

  // ============================================
  // SESSION-23: CHATBOT
  // ============================================

  // Chat Sessions
  createChatSession: db.prepare(`INSERT INTO chat_sessions (session_id, ip_address, user_agent, page_url) VALUES (@session_id, @ip_address, @user_agent, @page_url)`),
  getChatSession: db.prepare('SELECT * FROM chat_sessions WHERE session_id = ?'),
  updateChatSessionMessage: db.prepare(`UPDATE chat_sessions SET message_count = message_count + 1, last_message_at = datetime('now'), updated_at = datetime('now') WHERE session_id = ?`),
  updateChatSessionContact: db.prepare(`UPDATE chat_sessions SET visitor_name = @visitor_name, visitor_email = @visitor_email, visitor_phone = @visitor_phone, status = 'waiting_human', updated_at = datetime('now') WHERE session_id = @session_id`),
  updateChatSessionStatus: db.prepare(`UPDATE chat_sessions SET status = ?, updated_at = datetime('now') WHERE session_id = ?`),
  adminListChatSessions: db.prepare(`SELECT * FROM chat_sessions ORDER BY last_message_at DESC, created_at DESC LIMIT ? OFFSET ?`),
  adminListChatSessionsByStatus: db.prepare(`SELECT * FROM chat_sessions WHERE status = ? ORDER BY last_message_at DESC, created_at DESC LIMIT ? OFFSET ?`),
  adminCountChatSessions: db.prepare('SELECT COUNT(*) as total FROM chat_sessions'),
  adminCountChatSessionsToday: db.prepare(`SELECT COUNT(*) as total FROM chat_sessions WHERE date(created_at) = date('now')`),
  adminCountChatSessionsWaiting: db.prepare(`SELECT COUNT(*) as total FROM chat_sessions WHERE status = 'waiting_human'`),
  adminCountChatSessionsByStatus: db.prepare('SELECT COUNT(*) as total FROM chat_sessions WHERE status = ?'),

  // Chat Messages
  insertChatMessage: db.prepare(`INSERT INTO chat_messages (session_id, role, content, metadata_json) VALUES (@session_id, @role, @content, @metadata_json)`),
  getChatMessagesBySession: db.prepare('SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC'),
  markChatMessagesRead: db.prepare(`UPDATE chat_messages SET is_read = 1 WHERE session_id = ? AND role = 'bot' AND is_read = 0`),

  // Chat FAQ
  getChatFaqActive: db.prepare('SELECT * FROM chat_faq WHERE is_active = 1 ORDER BY position'),
  adminListChatFaq: db.prepare('SELECT * FROM chat_faq ORDER BY position, id'),
  adminListChatFaqByCategory: db.prepare('SELECT * FROM chat_faq WHERE category = ? ORDER BY position, id'),
  adminCreateChatFaq: db.prepare(`INSERT INTO chat_faq (question, answer, keywords, category, is_active, position) VALUES (@question, @answer, @keywords, @category, @is_active, @position)`),
  adminUpdateChatFaq: db.prepare(`UPDATE chat_faq SET question = @question, answer = @answer, keywords = @keywords, category = @category, is_active = @is_active, position = @position, updated_at = datetime('now') WHERE id = @id`),
  adminDeleteChatFaq: db.prepare('DELETE FROM chat_faq WHERE id = ?'),
  adminToggleChatFaq: db.prepare(`UPDATE chat_faq SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END, updated_at = datetime('now') WHERE id = ?`),
  incrementFaqMatchCount: db.prepare('UPDATE chat_faq SET match_count = match_count + 1 WHERE id = ?'),
  adminGetMaxFaqPosition: db.prepare('SELECT COALESCE(MAX(position), 0) + 1 as next_position FROM chat_faq'),

  // Chat Config
  getChatConfig: db.prepare('SELECT value FROM chat_config WHERE key = ?'),
  setChatConfig: db.prepare(`INSERT INTO chat_config (key, value, description) VALUES (@key, @value, @description) ON CONFLICT(key) DO UPDATE SET value = @value, updated_at = datetime('now')`),
  getAllChatConfig: db.prepare('SELECT key, value, description FROM chat_config ORDER BY key'),

  // ============================================
  // SESSION-24: AI CHATBOT EXTENSION
  // ============================================

  // Chat Messages — AI-aware insert
  insertChatMessageWithAI: db.prepare(`INSERT INTO chat_messages (session_id, role, content, metadata_json, response_mode, model, tokens_prompt, tokens_completion, cost) VALUES (@session_id, @role, @content, @metadata_json, @response_mode, @model, @tokens_prompt, @tokens_completion, @cost)`),

  // Chat Sessions — token/cost tracking
  updateChatSessionTokens: db.prepare(`UPDATE chat_sessions SET total_tokens = total_tokens + @tokens, total_cost = total_cost + @cost, updated_at = datetime('now') WHERE session_id = @session_id`),

  // Chat Messages — last N for AI context (reversed to chronological)
  getChatMessagesForContext: db.prepare(`SELECT role, content FROM chat_messages WHERE session_id = ? AND role IN ('user', 'bot') ORDER BY created_at DESC LIMIT ?`),

  // Monthly AI spend for budget check
  getMonthlyAISpend: db.prepare(`SELECT COALESCE(SUM(cost), 0) as total_cost FROM chat_messages WHERE cost > 0 AND created_at >= date('now', 'start of month')`)
});

// Lazy queries cache
let queriesCache: any = null;

// Proxy for lazy initialization - queries are created on first access, not during module load
export const queries = new Proxy({} as any, {
  get(_target, prop) {
    if (!queriesCache) {
      console.log('🔧 Creating queries for the first time...');
      try {
        queriesCache = createQueries();
        console.log(`✅ Queries created, testing access to ${String(prop)}...`);
        console.log(`   queriesCache type: ${typeof queriesCache}`);
        console.log(`   queriesCache[${String(prop)}]: ${typeof queriesCache[prop]}`);
      } catch (err) {
        console.error('❌ Error creating queries:', err);
        throw err;
      }
    }
    return queriesCache[prop];
  }
});

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

// Config helper — read a single site_config value by key
export function getConfigValue(key: string): string | null {
  const row = queries.getConfigByKey.get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

// Session-24: Migrate chatbot tables (idempotent ALTER TABLE)
export function migrateChatbotAI() {
  const alters = [
    'ALTER TABLE chat_messages ADD COLUMN response_mode TEXT DEFAULT NULL',
    'ALTER TABLE chat_messages ADD COLUMN model TEXT DEFAULT NULL',
    'ALTER TABLE chat_messages ADD COLUMN tokens_prompt INTEGER DEFAULT 0',
    'ALTER TABLE chat_messages ADD COLUMN tokens_completion INTEGER DEFAULT 0',
    'ALTER TABLE chat_messages ADD COLUMN cost REAL DEFAULT 0',
    'ALTER TABLE chat_sessions ADD COLUMN total_tokens INTEGER DEFAULT 0',
    'ALTER TABLE chat_sessions ADD COLUMN total_cost REAL DEFAULT 0'
  ];
  for (const sql of alters) {
    try { db.exec(sql); } catch { /* column already exists */ }
  }
}

// Seed chatbot data (FAQ + config)
export function seedChatbot() {
  // Run migration first (idempotent)
  migrateChatbotAI();

  const faqCount = db.prepare('SELECT COUNT(*) as count FROM chat_faq').get() as { count: number };
  if (faqCount && faqCount.count > 0) {
    // Even if FAQ exists, ensure AI config keys are present
    seedAIConfig();
    return;
  }

  console.log('Seeding chatbot data...');
  const seed = db.transaction(() => {
    const insertFaq = db.prepare('INSERT INTO chat_faq (question, answer, keywords, category, is_active, position) VALUES (?, ?, ?, ?, 1, ?)');
    insertFaq.run('Как оформить заказ?', 'Выберите часы в каталоге, добавьте в корзину и оформите заказ. Наш менеджер свяжется с вами для подтверждения.', 'заказ,оформить,купить,покупка,оформление', 'general', 1);
    insertFaq.run('Какие способы доставки?', 'Мы доставляем по всей России. Сроки: Москва 1-2 дня, Санкт-Петербург 2-3 дня, регионы 3-7 дней. Доставка курьером или в пункт выдачи.', 'доставка,доставить,курьер,сроки,пункт выдачи', 'delivery', 2);
    insertFaq.run('Какие способы оплаты?', 'Принимаем оплату банковской картой, переводом на расчётный счёт, наличными при получении. Также доступна рассрочка.', 'оплата,оплатить,карта,наличные,рассрочка,перевод', 'payment', 3);
    insertFaq.run('Какая гарантия на часы?', 'Все часы поставляются с официальной международной гарантией от производителя. Срок гарантии зависит от бренда (обычно 2-5 лет).', 'гарантия,гарантийный,ремонт,сервис', 'warranty', 4);
    insertFaq.run('Часы оригинальные?', 'Мы работаем только с оригинальными часами. Каждые часы проходят проверку подлинности и поставляются с полным комплектом документов.', 'оригинал,подделка,подлинность,сертификат,документы,оригинальные', 'general', 5);
    insertFaq.run('Как вернуть часы?', 'Возврат возможен в течение 14 дней при сохранении товарного вида и полного комплекта. Свяжитесь с нами для оформления возврата.', 'возврат,вернуть,обмен,обменять', 'returns', 6);
    insertFaq.run('Как с вами связаться?', 'Телефон: +7 (495) 120-00-00, Email: info@moditime-watch.ru. Также вы можете оставить заявку на обратный звонок.', 'контакты,телефон,email,позвонить,связаться,адрес', 'general', 7);
    insertFaq.run('Какие часы работы?', 'Мы работаем Пн-Пт: 10:00-20:00, Сб: 11:00-18:00. В выходные обработка заказов может занять больше времени.', 'часы работы,график,расписание,выходные,режим', 'general', 8);

    const insertConfig = db.prepare('INSERT OR IGNORE INTO chat_config (key, value, description) VALUES (?, ?, ?)');
    insertConfig.run('bot_name', 'Modi', 'Имя бота');
    insertConfig.run('bot_avatar_emoji', '\u231A', 'Эмодзи-аватар бота');
    insertConfig.run('welcome_message', 'Здравствуйте! Я Modi — ваш консультант по часам. Чем могу помочь?', 'Приветственное сообщение');
    insertConfig.run('offline_message', 'К сожалению, я не смог найти ответ на ваш вопрос. Оставьте контакт, и наш менеджер свяжется с вами.', 'Сообщение при отсутствии ответа');
    insertConfig.run('is_enabled', 'true', 'Включён ли чатбот');
    insertConfig.run('auto_open_delay', '0', 'Задержка автооткрытия (0 = не открывать)');
    insertConfig.run('working_hours', '{"start":"10:00","end":"20:00"}', 'Часы работы');
    insertConfig.run('quick_replies_json', '["Каталог часов","Доставка и оплата","Гарантия","Связаться с консультантом"]', 'Быстрые ответы');
  });
  seed();
  seedAIConfig();
  console.log('Chatbot data seeded');
}

// Seed AI-specific config keys (idempotent via INSERT OR IGNORE)
function seedAIConfig() {
  const insertConfig = db.prepare('INSERT OR IGNORE INTO chat_config (key, value, description) VALUES (?, ?, ?)');
  insertConfig.run('chat_mode', 'auto', 'Режим бота: ai / rules / auto');
  insertConfig.run('openrouter_api_key', '', 'API ключ OpenRouter');
  insertConfig.run('ai_model', 'google/gemini-2.0-flash-001', 'Основная AI модель');
  insertConfig.run('ai_fallback_models', '["meta-llama/llama-3.3-70b-instruct"]', 'Fallback модели JSON');
  insertConfig.run('ai_temperature', '0.7', 'Температура (0.0-2.0)');
  insertConfig.run('ai_max_tokens', '500', 'Макс. токенов в ответе');
  insertConfig.run('ai_system_prompt', 'Ты Modi — профессиональный консультант интернет-магазина премиальных часов Moditime Watch.\nОтвечай кратко, по-русски, в дружелюбном тоне.\nПомогай с выбором часов, доставкой, гарантией и оплатой.\nНе выходи за рамки тематики магазина часов.\nЕсли не знаешь ответа — предложи связаться с менеджером.', 'Системный промпт AI');
  insertConfig.run('ai_history_depth', '10', 'Кол-во сообщений в контексте AI');
  insertConfig.run('ai_monthly_budget', '10', 'Бюджет USD/месяц (0 = без лимита)');
}

console.log('✅ Moditimewatch database ready');

export default db;
