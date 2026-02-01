# Feedback v2 — Remaining module-level prepared statements

**Дата:** 2025-02-01
**Sessions:** 1-4
**Коммит main:** 14fcc7d (after cherry-pick fix)
**Status:** ❌ Build still fails

---

## Summary

**Feedback v1** (8609eae) исправил ~50 statements в старых admin pages, но **НЕ затронул новые файлы из Sessions 1-4**.

**Осталось:** ~20 module-level prepared statements в 10 файлах → build fails с той же ошибкой SQLITE_ERROR.

---

## Оставшиеся файлы (Sessions 1-4)

### Testimonials (Session-2, Task 4)

| File | Statements |
|------|------------|
| `src/routes/(admin)/admin/testimonials/+page.server.ts` | 2 |
| `src/routes/(admin)/admin/testimonials/[id]/+page.server.ts` | 2 |
| `src/routes/(admin)/admin/testimonials/new/+page.server.ts` | 2 |

**Нужно добавить в `queries`:**
```typescript
// Testimonials
listTestimonials: db.prepare('SELECT * FROM testimonials ORDER BY display_order, name'),
getTestimonialById: db.prepare('SELECT * FROM testimonials WHERE id = ?'),
updateTestimonial: db.prepare(`UPDATE testimonials SET ... WHERE id = @id`),
deleteTestimonial: db.prepare('DELETE FROM testimonials WHERE id = ?'),
getMaxTestimonialOrder: db.prepare('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM testimonials'),
createTestimonial: db.prepare(`INSERT INTO testimonials (...) VALUES (...)`),
```

### City Articles (Session-2, Task 3)

| File | Statements |
|------|------------|
| `src/routes/(admin)/admin/city-articles/+page.server.ts` | 4 |
| `src/routes/(admin)/admin/city-articles/[id]/+page.server.ts` | 3 |
| `src/routes/(admin)/admin/city-articles/new/+page.server.ts` | 2 |

**Нужно добавить в `queries`:**
```typescript
// City Articles
listCityArticles: db.prepare(`SELECT ... FROM city_articles ... ORDER BY published_at DESC`),
listCityArticlesByCity: db.prepare(`SELECT ... WHERE city_id = ? ORDER BY ...`),
getCityArticleById: db.prepare(`SELECT ... FROM city_articles ... WHERE id = ?`),
getAllCitiesForSelect: db.prepare('SELECT id, name FROM cities ORDER BY name'),
updateCityArticle: db.prepare(`UPDATE city_articles SET ... WHERE id = @id`),
createCityArticle: db.prepare(`INSERT INTO city_articles (...) VALUES (...)`),
deleteCityArticle: db.prepare('DELETE FROM city_articles WHERE id = ?'),
```

### Homepage (Session-4, Task 3)

| File | Statements |
|------|------------|
| `src/routes/(admin)/admin/homepage/+page.server.ts` | 4 |

**Нужно добавить в `queries`:**
```typescript
// Homepage
getActiveHomeHero: db.prepare('SELECT * FROM home_hero WHERE is_active = 1 LIMIT 1'),
getHomeServices: db.prepare('SELECT * FROM home_services ORDER BY position'),
getHomeStats: db.prepare('SELECT * FROM home_service_stats ORDER BY position'),
getActiveTelegramWidget: db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' AND is_active = 1 LIMIT 1"),
// ... (еще ~4 для update/create actions в этом же файле)
```

### Footer (Session-4, Task 1)

| File | Statements |
|------|------------|
| `src/routes/(admin)/admin/footer/+page.server.ts` | 6 |

**Нужно добавить в `queries`:**
```typescript
// Footer
getFooterSections: db.prepare('SELECT * FROM footer_sections ORDER BY column_number, position'),
getFooterLinks: db.prepare('SELECT * FROM footer_links WHERE section_id = ? ORDER BY position'),
createFooterSection: db.prepare(`INSERT INTO footer_sections (...) VALUES (...)`),
updateFooterSection: db.prepare(`UPDATE footer_sections SET ... WHERE id = @id`),
deleteFooterSection: db.prepare('DELETE FROM footer_sections WHERE id = ?'),
createFooterLink: db.prepare(`INSERT INTO footer_links (...) VALUES (...)`),
updateFooterLink: db.prepare(`UPDATE footer_links SET ... WHERE id = @id`),
deleteFooterLink: db.prepare('DELETE FROM footer_links WHERE id = ?'),
```

### Root Layout (Session-4, Task 2)

| File | Statements |
|------|------------|
| `src/routes/+layout.server.ts` | 1 |

**Нужно добавить в `queries`:**
```typescript
// Site Config
getAllSiteConfig: db.prepare('SELECT key, value FROM site_config'),
```

### City Layout (Session-4, Task 4)

| File | Statements |
|------|------------|
| `src/routes/(city)/+layout.server.ts` | 3 |

**Нужно добавить в `queries`:**
```typescript
// City Layout
getCityNavItems: db.prepare(`SELECT * FROM navigation_items WHERE menu_type = 'city_header' AND is_active = 1 AND parent_id IS NULL ORDER BY position`),
getFooterLegalLinks: db.prepare(`SELECT fl.* FROM footer_links fl JOIN footer_sections fs ON fs.id = fl.section_id WHERE fs.title = 'Правовая информация' ORDER BY fl.position`),
```

---

## Как исправить

### Шаг 1: Добавить все в database.ts

```typescript
// frontend-sveltekit/src/lib/server/db/database.ts

export const queries = {
  // ... существующие queries

  // ========== SESSIONS 1-4 QUERIES ==========

  // Testimonials (Session-2, Task 4)
  listTestimonials: db.prepare('SELECT * FROM testimonials ORDER BY display_order, name'),
  getTestimonialById: db.prepare('SELECT * FROM testimonials WHERE id = ?'),
  updateTestimonial: db.prepare(`UPDATE testimonials SET name = @name, role = @role, text = @text, avatar_url = @avatar_url, display_order = @display_order, updated_at = datetime('now') WHERE id = @id`),
  deleteTestimonial: db.prepare('DELETE FROM testimonials WHERE id = ?'),
  getMaxTestimonialOrder: db.prepare('SELECT COALESCE(MAX(display_order), 0) + 1 as next_order FROM testimonials'),
  createTestimonial: db.prepare(`INSERT INTO testimonials (name, role, text, avatar_url, display_order) VALUES (@name, @role, @text, @avatar_url, @display_order)`),

  // City Articles (Session-2, Task 3)
  listCityArticles: db.prepare(`SELECT ca.*, c.name as city_name FROM city_articles ca LEFT JOIN cities c ON c.id = ca.city_id ORDER BY ca.published_at DESC, ca.title`),
  listCityArticlesByCity: db.prepare(`SELECT ca.*, c.name as city_name FROM city_articles ca LEFT JOIN cities c ON c.id = ca.city_id WHERE ca.city_id = ? ORDER BY ca.published_at DESC, ca.title`),
  getCityArticleById: db.prepare(`SELECT ca.*, c.name as city_name FROM city_articles ca LEFT JOIN cities c ON c.id = ca.city_id WHERE ca.id = ?`),
  getAllCitiesForSelect: db.prepare('SELECT id, name FROM cities ORDER BY name'),
  updateCityArticle: db.prepare(`UPDATE city_articles SET city_id = @city_id, slug = @slug, title = @title, excerpt = @excerpt, content = @content, image_url = @image_url, is_published = @is_published, published_at = CASE WHEN @is_published = 1 AND is_published = 0 THEN datetime('now') ELSE published_at END, updated_at = datetime('now') WHERE id = @id`),
  createCityArticle: db.prepare(`INSERT INTO city_articles (city_id, slug, title, excerpt, content, image_url, is_published, published_at) VALUES (@city_id, @slug, @title, @excerpt, @content, @image_url, @is_published, CASE WHEN @is_published = 1 THEN datetime('now') ELSE NULL END)`),
  deleteCityArticle: db.prepare('DELETE FROM city_articles WHERE id = ?'),

  // Homepage (Session-4, Task 3)
  getActiveHomeHero: db.prepare('SELECT * FROM home_hero WHERE is_active = 1 LIMIT 1'),
  getHomeServices: db.prepare('SELECT * FROM home_services ORDER BY position'),
  getHomeStats: db.prepare('SELECT * FROM home_service_stats ORDER BY position'),
  getActiveTelegramWidget: db.prepare("SELECT * FROM widgets WHERE type = 'telegram_cta' AND is_active = 1 LIMIT 1"),
  updateHomeHero: db.prepare(`UPDATE home_hero SET eyebrow = @eyebrow, title = @title, description = @description, image_url = @image_url, cta_text = @cta_text, cta_link = @cta_link, is_active = @is_active, updated_at = datetime('now') WHERE id = @id`),
  updateHomeService: db.prepare(`UPDATE home_services SET title = @title, description = @description, icon = @icon, position = @position, updated_at = datetime('now') WHERE id = @id`),
  updateHomeStat: db.prepare(`UPDATE home_service_stats SET label = @label, value = @value, position = @position, updated_at = datetime('now') WHERE id = @id`),
  updateTelegramWidget: db.prepare(`UPDATE widgets SET content_json = @content_json, updated_at = datetime('now') WHERE type = 'telegram_cta'`),

  // Footer (Session-4, Task 1)
  getFooterSections: db.prepare('SELECT * FROM footer_sections ORDER BY column_number, position'),
  getFooterLinks: db.prepare('SELECT * FROM footer_links WHERE section_id = ? ORDER BY position'),
  createFooterSection: db.prepare(`INSERT INTO footer_sections (title, column_number, position) VALUES (@title, @column_number, @position)`),
  updateFooterSection: db.prepare(`UPDATE footer_sections SET title = @title, column_number = @column_number, position = @position, updated_at = datetime('now') WHERE id = @id`),
  deleteFooterSection: db.prepare('DELETE FROM footer_sections WHERE id = ?'),
  createFooterLink: db.prepare(`INSERT INTO footer_links (section_id, label, href, is_main_domain_only, position) VALUES (@section_id, @label, @href, @is_main_domain_only, @position)`),
  updateFooterLink: db.prepare(`UPDATE footer_links SET label = @label, href = @href, is_main_domain_only = @is_main_domain_only, position = @position, updated_at = datetime('now') WHERE id = @id`),
  deleteFooterLink: db.prepare('DELETE FROM footer_links WHERE id = ?'),

  // Site Config (Session-4, Task 2)
  getAllSiteConfig: db.prepare('SELECT key, value FROM site_config'),

  // City Layout (Session-4, Task 4)
  getCityNavItems: db.prepare(`SELECT * FROM navigation_items WHERE menu_type = 'city_header' AND is_active = 1 AND parent_id IS NULL ORDER BY position`),
  getFooterLegalLinks: db.prepare(`SELECT fl.* FROM footer_links fl JOIN footer_sections fs ON fs.id = fl.section_id WHERE fs.title = 'Правовая информация' ORDER BY fl.position`),
};
```

### Шаг 2: Обновить все 10 файлов

Заменить `const X = db.prepare(...)` на использование `queries.X`.

**Пример (testimonials/+page.server.ts):**

```diff
- const listTestimonials = db.prepare('SELECT * FROM testimonials ...');
- const deleteTestimonial = db.prepare('DELETE FROM testimonials WHERE id = ?');

export const load: PageServerLoad = async () => {
-   const testimonials = listTestimonials.all();
+   const testimonials = queries.listTestimonials.all();
    // ...
};

export const actions: Actions = {
    delete: async ({ request }) => {
-       deleteTestimonial.run(id);
+       queries.deleteTestimonial.run(id);
    }
};
```

Аналогично для остальных 9 файлов.

---

## Test Plan

После фикса:
- [ ] `npm run build` — успешно без SQLITE_ERROR
- [ ] Grep check: `grep -r "^const.*db\.prepare" src/routes/` → пусто (или только внутри функций)
- [ ] Admin CRUD работает (testimonials, city-articles, homepage, footer)
- [ ] Deploy на production

---

**Priority:** CRITICAL
**Action required:** Add remaining 20 queries to database.ts + update 10 files
**ETA:** ~1 hour
