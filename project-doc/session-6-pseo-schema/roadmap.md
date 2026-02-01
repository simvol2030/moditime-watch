# Session-6: pSEO Schema & Backend

**Статус:** ⏳ Pending
**Дата:** 2025-02-01
**Источник:** KG006 (KG006-prd-pseo-schema.md)
**Зависит от:** Session-2 (Cities CRUD)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] Все prepared statements работают (CRUD для каждой таблицы)
- [ ] Типы корректны (TypeScript interfaces для новых таблиц)
- [ ] FTS5 триггеры создаются автоматически
- [ ] Миграция SQL для production DB корректна

### Проверка в браузере
- [ ] Seed создаёт 3-4 статьи + категории + теги + связи + медиа
- [ ] FTS5 поиск находит тестовые статьи по title, excerpt, content
- [ ] city_article_related работает (явные связи, не random)
- [ ] city_article_media загружается корректно
- [ ] city_article_products связь работает
- [ ] Консоль браузера чистая

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | ALTER city_articles | ⏳ | Low | Добавить meta_title, meta_description, category_id, read_time |
| 2 | Таблица city_article_categories | ⏳ | Low | CREATE TABLE + prepared statements |
| 3 | Таблицы city_article_tags + relations | ⏳ | Medium | CREATE TABLE + prepared statements |
| 4 | Таблица city_article_related | ⏳ | Low | CREATE TABLE + prepared statements |
| 5 | Таблица city_article_media | ⏳ | Medium | CREATE TABLE + prepared statements |
| 6 | Prepared statements city_article_products | ⏳ | Low | Statements для существующей таблицы |
| 7 | FTS5 для city_articles | ⏳ | Medium | CREATE VIRTUAL TABLE + триггеры |
| 8 | Seed данных (Москва) | ⏳ | Medium | 3-4 статьи + категории + теги + медиа |

---

## Задача 1: ALTER city_articles

**DoD:**
- [ ] Добавлены колонки в schema.sql:
  - `meta_title TEXT`
  - `meta_description TEXT`
  - `category_id INTEGER REFERENCES city_article_categories(id)`
  - `read_time INTEGER`
- [ ] Миграция SQL для production: `ALTER TABLE city_articles ADD COLUMN ...`
- [ ] Обновлены prepared statements для city_articles (включая новые поля)

**Файлы:**
- `schema.sql`
- `src/lib/server/db/database.ts`
- `migrations/006-city-articles-meta.sql` (новый)

---

## Задача 2: Таблица city_article_categories

**DoD:**
- [ ] CREATE TABLE в schema.sql:
  ```sql
  city_article_categories:
    id INTEGER PRIMARY KEY
    name TEXT NOT NULL
    slug TEXT UNIQUE NOT NULL
    description TEXT
    position INTEGER DEFAULT 0
    is_active INTEGER DEFAULT 1
    created_at, updated_at
  ```
- [ ] Prepared statements:
  - listCategories: SELECT * ORDER BY position, name
  - getCategory: SELECT * WHERE id = ?
  - createCategory: INSERT
  - updateCategory: UPDATE
  - deleteCategory: DELETE

**Файлы:**
- `schema.sql`
- `src/lib/server/db/database.ts`

---

## Задача 3: Таблицы city_article_tags + relations

**DoD:**
- [ ] CREATE TABLE city_article_tags в schema.sql:
  ```sql
  city_article_tags:
    id INTEGER PRIMARY KEY
    name TEXT UNIQUE NOT NULL
    slug TEXT UNIQUE NOT NULL
    created_at
  ```
- [ ] CREATE TABLE city_article_tag_relations в schema.sql:
  ```sql
  city_article_tag_relations:
    article_id INTEGER REFERENCES city_articles(id) ON DELETE CASCADE
    tag_id INTEGER REFERENCES city_article_tags(id) ON DELETE CASCADE
    PRIMARY KEY (article_id, tag_id)
  ```
- [ ] Prepared statements:
  - listTags: SELECT * ORDER BY name
  - getTag: SELECT * WHERE id = ?
  - createTag: INSERT
  - deleteTag: DELETE
  - addTagToArticle: INSERT INTO relations
  - removeTagFromArticle: DELETE FROM relations
  - getArticleTags: SELECT tags JOIN relations WHERE article_id = ?
  - getTagArticles: SELECT articles JOIN relations WHERE tag_id = ?

**Файлы:**
- `schema.sql`
- `src/lib/server/db/database.ts`

---

## Задача 4: Таблица city_article_related

**DoD:**
- [ ] CREATE TABLE в schema.sql:
  ```sql
  city_article_related:
    article_id INTEGER REFERENCES city_articles(id) ON DELETE CASCADE
    related_article_id INTEGER REFERENCES city_articles(id) ON DELETE CASCADE
    position INTEGER DEFAULT 0
    PRIMARY KEY (article_id, related_article_id)
  ```
- [ ] Prepared statements:
  - addRelatedArticle: INSERT
  - removeRelatedArticle: DELETE
  - getRelatedArticles: SELECT articles JOIN relations WHERE article_id = ? ORDER BY position

**Файлы:**
- `schema.sql`
- `src/lib/server/db/database.ts`

---

## Задача 5: Таблица city_article_media

**DoD:**
- [ ] CREATE TABLE в schema.sql:
  ```sql
  city_article_media:
    id INTEGER PRIMARY KEY
    article_id INTEGER REFERENCES city_articles(id) ON DELETE CASCADE
    media_type TEXT NOT NULL  -- 'image', 'video'
    url TEXT NOT NULL         -- URL изображения или YouTube video ID
    alt_text TEXT
    caption TEXT
    position INTEGER DEFAULT 0
    created_at
  ```
- [ ] Prepared statements:
  - listArticleMedia: SELECT * WHERE article_id = ? ORDER BY position
  - addMedia: INSERT
  - updateMedia: UPDATE
  - deleteMedia: DELETE

**Файлы:**
- `schema.sql`
- `src/lib/server/db/database.ts`

---

## Задача 6: Prepared statements city_article_products

**DoD:**
- [ ] Таблица city_article_products уже существует в schema.sql
- [ ] Добавить prepared statements:
  - addProductToArticle: INSERT INTO city_article_products
  - removeProductFromArticle: DELETE FROM city_article_products
  - getArticleProducts: SELECT products JOIN city_article_products WHERE article_id = ?

**Файлы:**
- `src/lib/server/db/database.ts`

---

## Задача 7: FTS5 для city_articles

**DoD:**
- [ ] CREATE VIRTUAL TABLE в schema.sql:
  ```sql
  CREATE VIRTUAL TABLE city_articles_fts USING fts5(
    title, excerpt, content,
    content=city_articles, content_rowid=id
  );
  ```
- [ ] Триггеры для автоматического обновления:
  - INSERT trigger → INSERT INTO fts
  - UPDATE trigger → UPDATE fts
  - DELETE trigger → DELETE FROM fts
- [ ] Prepared statement searchArticles: SELECT * FROM city_articles_fts WHERE city_articles_fts MATCH ?

**Файлы:**
- `schema.sql`
- `src/lib/server/db/database.ts`

---

## Задача 8: Seed данных (Москва)

**DoD:**
- [ ] 2 категории:
  - "Покупка часов" (slug: pokupka-chasov)
  - "Ремонт и обслуживание" (slug: remont-obsluzhivanie)
- [ ] 5-7 тегов: "швейцарские часы", "rolex", "ремонт", "инвестиции", "подарок", "trade-in", "luxury"
- [ ] 3-4 статьи для Москвы (city_id для slug=moscow):
  - Разные категории (2 категории по 1-2 статьи)
  - По 2-3 тега на статью
  - Заполненные meta_title, meta_description, read_time
  - Rich HTML content (заголовки, параграфы)
- [ ] Перелинковка: каждая статья связана с 2 другими (city_article_related)
- [ ] Медиа: 1-2 изображения + 1 YouTube видео на статью (city_article_media)

**Файлы:**
- `src/lib/server/db/database.ts` — seedDatabase()

---

*Создано: 2025-02-01*
