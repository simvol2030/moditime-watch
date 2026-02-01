# Session-8: pSEO Frontend & SEO

**Статус:** ⏳ Pending
**Дата:** 2025-02-01
**Источник:** KG008 (KG008-prd-pseo-frontend.md)
**Зависит от:** Session-6 (Schema), Session-7 (Admin — статьи manageable)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] Layout group (city) не ломает основной сайт
- [ ] Sitemap index генерируется корректно

### Проверка в браузере — Desktop
- [ ] /city/moscow — отдельный header (CityHeader), footer (CityFooter)
- [ ] /city/moscow — статьи сгруппированы по категориям
- [ ] /city/moscow — пагинация работает (если >50 статей)
- [ ] /city/moscow — hero секция (hero_title, hero_subtitle, hero_image)
- [ ] /city/moscow/test-article — rich content (изображение + видео embed)
- [ ] /city/moscow/test-article — виджет поиска встроен
- [ ] /city/moscow/test-article — перелинковка (related articles из admin)
- [ ] /city/moscow/test-article — breadcrumbs (Главная → Москва → Категория → Статья)
- [ ] /city/moscow/test-article — теги отображаются
- [ ] moscow.moditime-watch.ru/test-article — reroute работает
- [ ] /catalog — стандартный layout (MegaMenu, полный footer) — не затронут

### Проверка в браузере — Mobile
- [ ] /city/moscow — mobile responsive (header, footer, списки)
- [ ] /city/moscow/article — mobile responsive (rich content, видео)
- [ ] Консоль браузера чистая

### SEO проверка
- [ ] /sitemap.xml — sitemap index
- [ ] /sitemap-cities.xml — 102 города
- [ ] /sitemap-city-articles-1.xml — статьи городов
- [ ] robots.txt содержит `Sitemap: https://moditime-watch.ru/sitemap.xml`
- [ ] /city/moscow — LocalBusiness JSON-LD
- [ ] /city/moscow/article — BreadcrumbList JSON-LD
- [ ] / — WebSite JSON-LD с SearchAction
- [ ] Cache-Control headers на city pages

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | City Layout Group | ⏳ | Medium | (city)/+layout с CityHeader/Footer |
| 2 | CityHeader + CityFooter | ⏳ | Medium | Отдельные header/footer для городов |
| 3 | Главная города (листинги по категориям) | ⏳ | High | Категории + пагинация + hero |
| 4 | Страница статьи (rich content) | ⏳ | High | Медиа + видео + виджет + перелинковка |
| 5 | Reroute article paths на поддоменах | ⏳ | Low | hooks.ts расширение |
| 6 | Sitemap Index | ⏳ | Medium | Sitemap index + sub-sitemaps |
| 7 | robots.txt | ⏳ | Low | Добавить Sitemap: |
| 8 | JSON-LD schemas | ⏳ | Medium | LocalBusiness, BreadcrumbList, WebSite |
| 9 | Cache-Control headers | ⏳ | Low | setHeaders для city pages |

---

## Задача 1: City Layout Group

**DoD:**
- [ ] Создать layout group `(city)`:
  ```
  src/routes/(city)/city/[city]/+page.server.ts
  src/routes/(city)/city/[city]/+page.svelte
  src/routes/(city)/city/[city]/[article]/+page.server.ts
  src/routes/(city)/city/[city]/[article]/+page.svelte
  src/routes/(city)/+layout.server.ts  — загрузка city data + config
  src/routes/(city)/+layout.svelte     — CityHeader + CityFooter
  ```
- [ ] Перенести существующие city роуты в layout group
- [ ] Layout загружает city data (city info) и site_config
- [ ] Основной layout `/routes/+layout.svelte` НЕ затронут

**Файлы:**
- `src/routes/(city)/+layout.server.ts`
- `src/routes/(city)/+layout.svelte`
- Перенос существующих файлов в `(city)/`

---

## Задача 2: CityHeader + CityFooter

**DoD:**
- [ ] CityHeader.svelte:
  - Logo (ссылка на поддомен / главную города)
  - Название города ("Часы в Москве")
  - "← Главный каталог" (ссылка на основной домен moditime-watch.ru)
  - Виджет поиска (WatchSearchWidget)
  - Theme toggle (если есть)
  - Mobile responsive (burger menu)
- [ ] CityFooter.svelte:
  - Delivery info: дни доставки, цена (из cities table)
  - Контакты из site_config
  - Legal links
  - Copyright
  - Mobile responsive

**Файлы:**
- `src/lib/components/layout/CityHeader.svelte`
- `src/lib/components/layout/CityFooter.svelte`

---

## Задача 3: Главная города (листинги по категориям)

**DoD:**
- [ ] Переработка `/city/[city]/+page.server.ts`:
  - Загрузка city info
  - Загрузка статей по категориям (GROUP BY category_id)
  - Пагинация (если >50 статей)
  - Загрузка hero данных (hero_title, hero_subtitle, hero_image)
- [ ] Переработка `/city/[city]/+page.svelte`:
  - Hero секция города (hero_title, hero_subtitle, hero_image)
  - Статьи сгруппированы по категориям (каждая категория — секция)
  - Каждая статья: title, excerpt, image, read_time, category
  - Delivery card (уже есть, сохранить)
  - Пагинация (если нужно)
- [ ] Mobile responsive

**Файлы:**
- `src/routes/(city)/city/[city]/+page.server.ts`
- `src/routes/(city)/city/[city]/+page.svelte`

---

## Задача 4: Страница статьи (rich content)

**DoD:**
- [ ] Переработка `/city/[city]/[article]/+page.server.ts`:
  - Загрузка статьи с meta_title, meta_description
  - Загрузка медиа (city_article_media)
  - Загрузка related articles (city_article_related, не random)
  - Загрузка тегов (city_article_tags)
- [ ] Переработка `/city/[city]/[article]/+page.svelte`:
  - Rich content рендеринг:
    - Изображения в теле статьи (из city_article_media)
    - YouTube видео embed (iframe, если media_type=video)
    - Фотографии с подписями (caption)
  - Виджет поиска встроен в статью (WatchSearchWidget)
  - Перелинковка: related articles из city_article_related
  - Breadcrumbs: Главная → Город → Категория → Статья
  - Теги: отображение тегов статьи (кликабельные)
  - meta_title / meta_description из БД
  - read_time отображение
- [ ] Mobile responsive

**Файлы:**
- `src/routes/(city)/city/[city]/[article]/+page.server.ts`
- `src/routes/(city)/city/[city]/[article]/+page.svelte`

---

## Задача 5: Reroute article paths на поддоменах

**DoD:**
- [ ] Обновить `hooks.ts` (reroute hook):
  - Если request на поддомене и path не `/` → reroute на `/city/{citySlug}/{path}`
  - Исключения: /catalog, /product/, /cart и т.д. (уже редиректятся)
- [ ] Тест: `moscow.moditime-watch.ru/article-slug` → внутренний reroute на `/city/moscow/article-slug`

**Файлы:**
- `src/hooks.ts`

---

## Задача 6: Sitemap Index

**DoD:**
- [ ] Переработка `/sitemap.xml/+server.ts`:
  - Sitemap index:
    - `/sitemap-main.xml` — основные страницы (каталог, продукты, журнал)
    - `/sitemap-cities.xml` — 102 города (лендинги)
    - `/sitemap-city-articles-1.xml` ... `-N.xml` — статьи городов (по 1000 URL на файл)
- [ ] Создание роутов:
  - `/sitemap-main.xml/+server.ts`
  - `/sitemap-cities.xml/+server.ts`
  - `/sitemap-city-articles-[page].xml/+server.ts`
- [ ] При 5200+ URL — sitemap index

**Файлы:**
- `src/routes/sitemap.xml/+server.ts` — переработка
- `src/routes/sitemap-main.xml/+server.ts` — новый
- `src/routes/sitemap-cities.xml/+server.ts` — новый
- `src/routes/sitemap-city-articles-[page].xml/+server.ts` — новый

---

## Задача 7: robots.txt

**DoD:**
- [ ] Добавить в `static/robots.txt`:
  ```
  Sitemap: https://moditime-watch.ru/sitemap.xml
  ```

**Файлы:**
- `static/robots.txt`

---

## Задача 8: JSON-LD schemas

**DoD:**
- [ ] City landing (`/city/[city]/+page.svelte`):
  - LocalBusiness JSON-LD (хелпер уже есть в schema-helpers)
  - Вызвать createLocalBusinessSchema(city data)
- [ ] City article (`/city/[city]/[article]/+page.svelte`):
  - BreadcrumbList JSON-LD
  - Вызвать createBreadcrumbSchema(breadcrumbs)
- [ ] Корень сайта (`/routes/+page.svelte`):
  - WebSite schema с SearchAction (хелпер есть)
  - Вызвать createWebSiteSchema()

**Файлы:**
- `src/routes/(city)/city/[city]/+page.svelte`
- `src/routes/(city)/city/[city]/[article]/+page.svelte`
- `src/routes/+page.svelte`
- `src/lib/utils/schema-helpers.ts` — использование существующих хелперов

---

## Задача 9: Cache-Control headers

**DoD:**
- [ ] City landing pages: Cache-Control header (1 час)
  - В `/city/[city]/+page.server.ts` добавить `setHeaders({ 'Cache-Control': 'public, max-age=3600' })`
- [ ] City articles: Cache-Control (24 часа)
  - В `/city/[city]/[article]/+page.server.ts` добавить `setHeaders({ 'Cache-Control': 'public, max-age=86400' })`

**Файлы:**
- `src/routes/(city)/city/[city]/+page.server.ts`
- `src/routes/(city)/city/[city]/[article]/+page.server.ts`

---

*Создано: 2025-02-01*
