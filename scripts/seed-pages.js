/**
 * Seed pages table with static page data
 * Run: node scripts/seed-pages.js
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db', 'sqlite', 'app.db');
const db = new Database(DB_PATH);

console.log('📄 Seeding pages table...');

const pages = [
  {
    slug: 'about',
    title: 'О компании',
    content: '',
    template: 'about',
    meta_json: JSON.stringify({
      title: 'О компании Moditimewatch — Сервис доставки оригинальных часов',
      description: 'Moditimewatch — сервис доставки оригинальных часов из-за рубежа с гарантией подлинности. Персональные консультации, проверка перед отправкой, страхование груза.',
      keywords: 'moditimewatch, оригинальные часы, доставка часов, швейцарские часы'
    }),
    is_published: 1
  },
  {
    slug: 'delivery',
    title: 'Доставка и оплата',
    content: '',
    template: 'delivery',
    meta_json: JSON.stringify({
      title: 'Доставка и оплата — Moditimewatch',
      description: 'Бесплатная доставка по России. Курьерская доставка до двери с возможностью примерки. Оплата при получении или онлайн.',
      keywords: 'доставка часов, оплата часов, курьерская доставка, доставка по России'
    }),
    is_published: 1
  },
  {
    slug: 'warranty',
    title: 'Гарантия и сервис',
    content: '',
    template: 'warranty',
    meta_json: JSON.stringify({
      title: 'Гарантия и сервис — Moditimewatch',
      description: 'Официальная гарантия производителя до 5 лет. Сервисное обслуживание в авторизованных центрах. Проверка подлинности каждых часов.',
      keywords: 'гарантия на часы, сервисное обслуживание, ремонт часов, проверка подлинности'
    }),
    is_published: 1
  },
  {
    slug: 'contacts',
    title: 'Контакты',
    content: '',
    template: 'contacts',
    meta_json: JSON.stringify({
      title: 'Контакты — Moditimewatch',
      description: 'Свяжитесь с нами: +7 (999) 960-43-22, concierge@moditimewatch.com. Москва, Кутузовский проспект, д. 12, офис 501.',
      keywords: 'контакты moditimewatch, телефон, адрес, консультация'
    }),
    is_published: 1
  },
  {
    slug: 'privacy',
    title: 'Политика конфиденциальности',
    content: '',
    template: 'legal',
    meta_json: JSON.stringify({
      title: 'Политика конфиденциальности — Moditimewatch',
      description: 'Политика конфиденциальности и обработки персональных данных на сайте moditimewatch.com. Защита ваших данных — наш приоритет.',
      keywords: 'политика конфиденциальности, персональные данные, защита данных'
    }),
    is_published: 1
  },
  {
    slug: 'terms',
    title: 'Правила обработки персональных данных',
    content: '',
    template: 'legal',
    meta_json: JSON.stringify({
      title: 'Правила обработки персональных данных — Moditimewatch',
      description: 'Правила обработки персональных данных в соответствии с ФЗ-152. Ваши права как субъекта персональных данных.',
      keywords: 'обработка персональных данных, ФЗ-152, права субъекта данных'
    }),
    is_published: 1
  }
];

// Check if pages table exists
const tableExists = db.prepare(`
  SELECT name FROM sqlite_master
  WHERE type='table' AND name='pages'
`).get();

if (!tableExists) {
  console.log('❌ Table "pages" does not exist. Creating...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      template TEXT,
      meta_json TEXT,
      is_published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('✅ Table "pages" created');
}

// Check existing pages
const existingCount = db.prepare('SELECT COUNT(*) as count FROM pages').get();
console.log(`📊 Existing pages: ${existingCount.count}`);

// Insert or replace pages
const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO pages (slug, title, content, template, meta_json, is_published)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((pages) => {
  for (const page of pages) {
    insertStmt.run(
      page.slug,
      page.title,
      page.content,
      page.template,
      page.meta_json,
      page.is_published
    );
    console.log(`  ✅ ${page.slug} → ${page.title}`);
  }
});

insertMany(pages);

// Verify
const finalCount = db.prepare('SELECT COUNT(*) as count FROM pages').get();
console.log(`\n✅ Pages seeded successfully! Total: ${finalCount.count}`);

// List all pages
const allPages = db.prepare('SELECT id, slug, title, template FROM pages').all();
console.log('\n📋 All pages:');
allPages.forEach(p => {
  console.log(`  ${p.id}. ${p.slug} (${p.template}) - ${p.title}`);
});

db.close();
