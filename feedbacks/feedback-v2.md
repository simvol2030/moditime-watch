# Feedback v2 - Исправление багов pSEO городов

**Дата:** 2025-12-25
**Branch to create:** `claude/pseo-cities-fixes-v2`
**Предыдущая ветка:** `claude/pseo-cities-subdomains-2A6mZ` (смержена в main)

---

## Что работает

- sitemap.xml генерируется (24 URL)
- /city/[city] — страницы городов открываются
- /city/[city]/[article] — страницы статей открываются
- Склонения городов работают
- Доставка по городам отображается
- Breadcrumbs правильные
- Related articles на странице статьи — правильные ссылки
- 404 для несуществующих городов
- Мобильная версия адаптивная
- Subdomain middleware добавлен

---

## Баги (для исправления)

### Bug 1: Title дублируется
- **Score:** 5
- **Где:** Все страницы /city/*
- **Текущее:** `Купить швейцарские часы в Москве | Moditimewatch | Moditimewatch`
- **Ожидаемое:** `Купить швейцарские часы в Москве | Moditimewatch`
- **Файлы:**
  - `frontend-sveltekit/src/routes/city/[city]/+page.server.ts`
  - `frontend-sveltekit/src/routes/city/[city]/[article]/+page.server.ts`
  - Возможно `+layout.svelte` добавляет лишний suffix

### Bug 2: Ссылки на статьи со страницы города ведут на /journal/
- **Score:** 5
- **Где:** `/city/[city]/+page.svelte` — секция "Часовая жизнь города"
- **Текущее:** `<a href="/journal/{article.slug}">`
- **Ожидаемое:** `<a href="/city/{city.slug}/{article.slug}">`
- **Файл:** `frontend-sveltekit/src/routes/city/[city]/+page.svelte`

### Bug 3: JSON-LD для статей — нет Article schema
- **Score:** 11
- **Где:** `/city/[city]/[article]/+page.server.ts`
- **Текущее:** Только Organization schema
- **Ожидаемое:** Article schema с:
  - @type: "Article"
  - headline: article.title
  - description: article.excerpt
  - image: article.image_url
  - datePublished: article.published_at
  - author: Organization
  - publisher: Organization
- **Файл:** `frontend-sveltekit/src/routes/city/[city]/[article]/+page.server.ts`
- **Хелпер:** Использовать `generateArticleSchema()` из `$lib/utils/schema-helpers.ts`

### Bug 4: og:image относительный путь
- **Score:** 5
- **Где:** Страницы статей
- **Текущее:** `og:image="/og-image.jpg"`
- **Ожидаемое:** `og:image="https://moditime-watch.ru/og-image.jpg"` (абсолютный URL)
- **Файлы:**
  - `frontend-sveltekit/src/lib/components/seo/SeoManager.svelte`
  - или в `+page.server.ts` где формируется seo объект

---

## Не баги (данные, не код)

Эти проблемы решаются заливкой данных, НЕ кодом:

- **Контент статей пустой** — в БД `city_articles.content` только "Контент"
- **Description короткий** — в БД `city_articles.excerpt` только "Гид по часам"

CLI Integrator залёт данные после фикса кода.

---

## Файлы для изменения

```
frontend-sveltekit/src/
├── routes/city/[city]/
│   ├── +page.svelte           ← Bug 2: исправить href на статьи
│   ├── +page.server.ts        ← Bug 1: проверить title
│   └── [article]/
│       └── +page.server.ts    ← Bug 1, 3: title + JSON-LD Article
└── lib/
    ├── components/seo/
    │   └── SeoManager.svelte  ← Bug 4: og:image absolute URL
    └── utils/
        └── schema-helpers.ts  ← использовать generateArticleSchema()
```

---

## Тестирование после фикса

```bash
# Проверить title (не должно дублироваться)
curl -s https://moditime-watch.ru/city/moscow | grep "<title>"

# Проверить ссылки на статьи (должны быть /city/moscow/...)
curl -s https://moditime-watch.ru/city/moscow | grep "href=\"/city/moscow/"

# Проверить JSON-LD (должен быть Article)
curl -s https://moditime-watch.ru/city/moscow/где-купить-швейцарские-часы | grep "application/ld+json" -A 20

# Проверить og:image (должен быть абсолютный URL)
curl -s https://moditime-watch.ru/city/moscow | grep "og:image"
```

---

## Commit

**Message:** `fix(seo): fix title duplication, article links, JSON-LD schema, og:image`

---

## После выполнения Developer

CLI Integrator выполнит:
1. Merge ветки в main
2. Deploy на сервер
3. QA проверка всех 4 багов
4. Заливка 102 городов в БД
5. Заливка контента статей
6. Настройка Nginx wildcard + SSL
