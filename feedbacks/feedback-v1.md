# Feedback v1 - Programmatic SEO: Города с поддоменами

**Дата:** 2025-12-25
**Branch to create:** `claude/pseo-cities-v1`

---

## Контекст

Нужно реализовать Programmatic SEO для 102 городов. Каждый город будет доступен:
- Как поддомен: `moscow.moditime-watch.ru`
- И как путь: `moditime-watch.ru/city/moscow`

**Уже готово:**
- Таблица `cities` в БД (schema.sql:540)
- Таблица `city_articles` в БД (schema.sql:580)
- Роут `/city/[city]/+page.svelte` — страница города
- Prepared statements: `getCityBySlug`, `getCityArticles`, `getAllCities`
- SEO компонент: `SeoManager.svelte`
- JSON-LD генераторы в `schema-helpers.ts`

---

## Задачи (3 файла/роута)

### 1. Роут для статей города

Создать `/src/routes/city/[city]/[article]/+page.server.ts` и `+page.svelte`

```typescript
// +page.server.ts
// Получить статью: queries.getCityArticleBySlug(citySlug, articleSlug)
// Вернуть: article, city, seo, breadcrumbs, relatedArticles

// SEO:
// title: `${article.title} | Часы в ${city.name} | Moditimewatch`
// canonical: `https://moditime-watch.ru/city/${city.slug}/${article.slug}`
// JSON-LD: generateArticleSchema()
```

Добавить prepared statement в `database.ts`:
```typescript
getCityArticleBySlug: db.prepare(`
  SELECT ca.*, c.name as city_name, c.slug as city_slug
  FROM city_articles ca
  JOIN cities c ON ca.city_id = c.id
  WHERE c.slug = ? AND ca.slug = ? AND ca.is_published = 1
`)
```

### 2. Динамический sitemap.xml

Создать `/src/routes/sitemap.xml/+server.ts`

```typescript
// GET handler возвращает XML
// Включить:
// - Статические страницы: /, /catalog, /about, /contacts
// - Все товары: /product/[slug]
// - Все города: /city/[slug]
// - Все статьи городов: /city/[city]/[article]

// Использовать queries:
// - getAllProducts (добавить если нет)
// - getAllCities
// - getAllCityArticles (добавить)
```

Добавить prepared statements:
```typescript
getAllCityArticles: db.prepare(`
  SELECT ca.slug as article_slug, c.slug as city_slug, ca.updated_at
  FROM city_articles ca
  JOIN cities c ON ca.city_id = c.id
  WHERE ca.is_published = 1
`),
getAllProductsForSitemap: db.prepare(`
  SELECT slug, updated_at FROM products WHERE is_active = 1
`)
```

### 3. Middleware для поддоменов

Обновить `/src/hooks.server.ts` — добавить hook для определения города:

```typescript
const subdomainHandler: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host') || '';

  // Паттерн: {city}.moditime-watch.ru
  const match = host.match(/^([a-z0-9-]+)\.moditime-watch\.ru$/);

  if (match && match[1] !== 'www' && match[1] !== 'quiz') {
    const citySlug = match[1];
    // Сохраняем в locals для использования в layout
    event.locals.citySlug = citySlug;

    // Опционально: rewrite URL на /city/[slug]
    // или просто передать citySlug в layout для персонализации
  }

  return resolve(event);
};

// Добавить в sequence:
export const handle = sequence(
  subdomainHandler,  // ПЕРВЫМ!
  requestLogger,
  securityHeaders,
  csrfProtection
);
```

Обновить `app.d.ts`:
```typescript
declare global {
  namespace App {
    interface Locals {
      csrfToken?: string;
      citySlug?: string;  // ДОБАВИТЬ
    }
  }
}
```

---

## Структура файлов

```
frontend-sveltekit/src/
├── routes/
│   ├── city/
│   │   └── [city]/
│   │       ├── +page.svelte        ← уже есть
│   │       ├── +page.server.ts     ← уже есть
│   │       └── [article]/          ← СОЗДАТЬ
│   │           ├── +page.svelte
│   │           └── +page.server.ts
│   └── sitemap.xml/
│       └── +server.ts              ← СОЗДАТЬ
├── hooks.server.ts                 ← ОБНОВИТЬ
├── app.d.ts                        ← ОБНОВИТЬ
└── lib/server/db/
    └── database.ts                 ← ДОБАВИТЬ queries
```

---

## Требования

1. **TypeScript** — строгая типизация
2. **Svelte 5** — использовать runes ($props, $state)
3. **SEO** — SeoManager + JSON-LD для каждой страницы
4. **Error handling** — 404 если город/статья не найдены
5. **Безопасность** — prepared statements только (никаких string concat)

---

## Тестирование

После коммита проверить:
```bash
# Локально
curl http://localhost:5173/sitemap.xml
curl http://localhost:5173/city/moscow
curl http://localhost:5173/city/moscow/some-article
```

---

## Commit

**Message:** `feat(seo): add city articles route, sitemap.xml, subdomain middleware`

---

## После выполнения Developer

CLI Integrator выполнит:
1. Merge ветки в main
2. Deploy на сервер
3. QA проверка
4. Заливка 102 городов в БД
5. Настройка Nginx wildcard + SSL
