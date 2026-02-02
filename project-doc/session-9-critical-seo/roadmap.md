# Session-9: Critical SEO & Content Fixes

> **Приоритет:** 🔴 HIGH PRIORITY
> **Фокус:** JSON-LD schemas, грамматика, rich media — критично для pSEO
> **Задач:** 6
> **Зависит от:** Session-8 (pSEO Frontend)
> **Источник:** QA validation reports (session-8-v1/tech-report.md, ux-report.md)

---

## Контекст

После деплоя Session-8 (pSEO Frontend & SEO) субагенты (qa-technical-validation + qa-ux-verification) нашли **критические пропуски** в core deliverables:
- Отсутствуют 3 из 4 JSON-LD schemas (LocalBusiness, Article, BreadcrumbList)
- Грамматическая ошибка в ключевом UI элементе
- Не реализован rich media content в статьях

Эти баги блокируют SEO эффективность всего pSEO функционала. Без исправления:
- Города не попадут в Local Pack в Google
- Статьи не получат rich snippets в SERP
- Контент выглядит пустым и непривлекательным

**Эта сессия — HIGH PRIORITY, исправляет фундаментальные недоработки.**

---

## Задачи

### Task 1: Добавить LocalBusiness JSON-LD на city landing pages
**Priority:** 🔴 CRITICAL
**Source:** Technical QA (CRIT-1)
**Roadmap ref:** Session-8 Task 8

**Описание:**
City landing pages (`/city/moscow`, `/city/saint-petersburg`, etc.) должны иметь LocalBusiness JSON-LD schema для Local SEO.

**Что сейчас:**
- На `/city/moscow` присутствуют: Organization (2x), Article, BreadcrumbList
- LocalBusiness schema ОТСУТСТВУЕТ

**Что должно быть:**
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Moditime Watch - Премиальные часы в Москве",
  "image": "...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "...",
    "addressLocality": "Москва",
    "addressRegion": "Московская область",
    "postalCode": "...",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "...",
    "longitude": "..."
  },
  "telephone": "+7...",
  "openingHoursSpecification": [...],
  "priceRange": "₽₽₽",
  "url": "https://moditime-watch.ru/city/moscow"
}
```

**Реализация:**
1. Открыть `frontend-sveltekit/src/routes/(city)/city/[city]/+page.svelte`
2. Проверить, есть ли уже `createLocalBusinessSchema()` helper в `src/lib/utils/schema-helpers.ts`
   - Если НЕТ → создать helper
   - Если ЕСТЬ → использовать
3. В `+page.svelte` в `<svelte:head>` добавить:
   ```svelte
   {@html createLocalBusinessSchema({
     city: data.city,
     address: data.city.address, // из БД
     phone: data.city.phone,
     coordinates: { lat: data.city.latitude, lng: data.city.longitude },
     openingHours: data.city.opening_hours
   })}
   ```
4. Убедиться, что в `+page.server.ts` загружаются нужные поля из БД (`address`, `phone`, `latitude`, `longitude`, `opening_hours`)

**Критерии успеха:**
- [ ] LocalBusiness schema присутствует на всех city landing pages
- [ ] Schema содержит: name, address, geo, telephone, openingHours, priceRange, url
- [ ] Google Structured Data Testing Tool показывает 0 errors для LocalBusiness
- [ ] Schema НЕ дублируется (только 1 раз на странице)

---

### Task 2: Добавить Article JSON-LD на city article pages
**Priority:** 🔴 CRITICAL
**Source:** Technical QA (CRIT-2)
**Roadmap ref:** Session-8 Task 8

**Описание:**
City article pages (`/city/moscow/trade-in-chasov-v-moskve`, etc.) должны иметь Article JSON-LD schema для rich snippets.

**Что сейчас:**
- На `/city/moscow/trade-in-chasov-v-moskve` присутствует только: Organization (1x)
- Article schema ОТСУТСТВУЕТ

**Что должно быть:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Trade-in часов в Москве: как обменять с выгодой",
  "description": "...",
  "image": "...",
  "datePublished": "2025-01-15T10:00:00+03:00",
  "dateModified": "2025-01-20T14:30:00+03:00",
  "author": {
    "@type": "Organization",
    "name": "Moditime Watch"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Moditime Watch",
    "logo": {...}
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://moditime-watch.ru/city/moscow/trade-in-chasov-v-moskve"
  }
}
```

**Реализация:**
1. Открыть `frontend-sveltekit/src/routes/(city)/city/[city]/[article]/+page.svelte`
2. Проверить, есть ли `createArticleSchema()` helper в `src/lib/utils/schema-helpers.ts`
   - Если НЕТ → создать
   - Если ЕСТЬ → использовать
3. В `+page.svelte` в `<svelte:head>` добавить:
   ```svelte
   {@html createArticleSchema({
     headline: data.article.title,
     description: data.article.meta_description || data.article.excerpt,
     image: data.article.hero_image,
     datePublished: data.article.created_at,
     dateModified: data.article.updated_at,
     author: "Moditime Watch",
     url: `https://moditime-watch.ru/city/${data.city.slug}/${data.article.slug}`
   })}
   ```

**Критерии успеха:**
- [ ] Article schema присутствует на всех city article pages
- [ ] Schema содержит: headline, description, image, datePublished, dateModified, author, publisher, mainEntityOfPage
- [ ] Google Structured Data Testing Tool показывает 0 errors для Article
- [ ] datePublished и dateModified в ISO 8601 формате

---

### Task 3: Добавить BreadcrumbList JSON-LD на city article pages
**Priority:** 🔴 CRITICAL
**Source:** Technical QA (CRIT-3)
**Roadmap ref:** Session-8 Task 8

**Описание:**
City article pages должны иметь BreadcrumbList JSON-LD schema для отображения breadcrumbs в SERP.

**Что сейчас:**
- HTML breadcrumbs присутствуют в UI: Главная / Москва / Trade-in часов
- JSON-LD BreadcrumbList schema ОТСУТСТВУЕТ

**Что должно быть:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://moditime-watch.ru/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Москва",
      "item": "https://moditime-watch.ru/city/moscow"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Trade-in часов",
      "item": "https://moditime-watch.ru/city/moscow/trade-in-chasov-v-moskve"
    }
  ]
}
```

**Реализация:**
1. Открыть `frontend-sveltekit/src/routes/(city)/city/[city]/[article]/+page.svelte`
2. Проверить, есть ли `createBreadcrumbSchema()` helper в `src/lib/utils/schema-helpers.ts`
   - Если НЕТ → создать
   - Если ЕСТЬ → использовать
3. В `+page.svelte` в `<svelte:head>` добавить:
   ```svelte
   {@html createBreadcrumbSchema([
     { name: "Главная", url: "https://moditime-watch.ru/" },
     { name: data.city.name, url: `https://moditime-watch.ru/city/${data.city.slug}` },
     { name: data.article.title, url: `https://moditime-watch.ru/city/${data.city.slug}/${data.article.slug}` }
   ])}
   ```

**Критерии успеха:**
- [ ] BreadcrumbList schema присутствует на всех city article pages
- [ ] Schema содержит 3 уровня: Главная → Город → Статья
- [ ] Каждый ListItem имеет position, name, item
- [ ] Google Structured Data Testing Tool показывает 0 errors для BreadcrumbList

---

### Task 4: Исправить грамматику "Москва" → "Москве" в CityHeader badge
**Priority:** 🔴 CRITICAL
**Source:** UX QA (CRIT-4)
**Roadmap ref:** Session-8 Task 2

**Описание:**
Badge в CityHeader показывает "Часы в Москва" — грамматическая ошибка (должен быть prepositional case "Москве").

**Что сейчас:**
```svelte
<Badge>Часы в {city.name}</Badge>
<!-- Для Москвы: "Часы в Москва" ❌ -->
```

**Что должно быть:**
```
"Часы в Москве" ✅
"Часы в Санкт-Петербурге" ✅
"Часы в Казани" ✅
```

**Реализация:**
1. Открыть `frontend-sveltekit/src/lib/components/layout/CityHeader.svelte`
2. Найти строку с badge: `Часы в {city.name}`
3. Создать helper function `getCityPrepositionalCase(cityName: string)`
   - Либо в `src/lib/utils/i18n-helpers.ts`
   - Либо inline в компоненте
4. Заменить:
   ```svelte
   <Badge>Часы в {getCityPrepositionalCase(city.name)}</Badge>
   ```

**Helper function пример:**
```typescript
function getCityPrepositionalCase(cityName: string): string {
  const exceptions: Record<string, string> = {
    'Москва': 'Москве',
    'Санкт-Петербург': 'Санкт-Петербурге',
    'Казань': 'Казани',
    'Ростов-на-Дону': 'Ростове-на-Дону',
    // ... добавить для всех 102 городов
  };

  return exceptions[cityName] || cityName; // fallback к nominative если не нашли
}
```

**Альтернативный подход:**
Добавить поле `name_prepositional` в таблицу `cities` в БД, чтобы не хардкодить в коде.

**Критерии успеха:**
- [ ] Badge показывает правильный prepositional case для всех городов
- [ ] Нет грамматических ошибок на всех city pages
- [ ] Если используется БД подход → миграция применена, все города заполнены

---

### Task 5: Добавить rich media (изображения + видео embeds) в city articles
**Priority:** 🔴 CRITICAL
**Source:** UX QA (CRIT-5)
**Roadmap ref:** Session-8 Task 4

**Описание:**
City article pages должны рендерить изображения и видео embeds из контента. Сейчас статьи выглядят пустыми (только текст), хотя Task 4 Session-8 предполагал "rich content (изображения + видео embed)".

**Что сейчас:**
- Article page показывает только hero image и текстовый контент
- Inline изображения из `city_article_media` НЕ отображаются
- Video embeds НЕ рендерятся

**Что должно быть:**
- Статья содержит inline изображения (из `city_article_media` где `media_type = 'image'`)
- Статья может содержать video embeds (из `city_article_media` где `media_type = 'video'`)
- Media рендерится в правильных позициях (по `position` field)

**Реализация:**

**1. Загрузка media в +page.server.ts:**
```typescript
// frontend-sveltekit/src/routes/(city)/city/[city]/[article]/+page.server.ts
const media = db.prepare(`
  SELECT media_type, media_url, caption, position
  FROM city_article_media
  WHERE article_id = ?
  ORDER BY position ASC
`).all(article.id);

return {
  article,
  city,
  relatedArticles,
  media // добавить
};
```

**2. Рендеринг media в +page.svelte:**
```svelte
<!-- frontend-sveltekit/src/routes/(city)/city/[city]/[article]/+page.svelte -->

<!-- После hero section, перед основным контентом -->
{#if data.media && data.media.length > 0}
  <div class="article-media space-y-6">
    {#each data.media as mediaItem}
      {#if mediaItem.media_type === 'image'}
        <figure>
          <img
            src={mediaItem.media_url}
            alt={mediaItem.caption || data.article.title}
            class="w-full rounded-lg"
          />
          {#if mediaItem.caption}
            <figcaption class="text-sm text-muted-foreground mt-2">
              {mediaItem.caption}
            </figcaption>
          {/if}
        </figure>
      {:else if mediaItem.media_type === 'video'}
        <div class="video-embed aspect-video">
          {@html parseVideoEmbed(mediaItem.media_url)}
        </div>
      {/if}
    {/each}
  </div>
{/if}

<div class="article-content prose">
  {@html data.article.content}
</div>
```

**3. Helper для video embeds:**
```typescript
function parseVideoEmbed(url: string): string {
  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = extractYouTubeId(url);
    return `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const videoId = url.split('/').pop();
    return `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen></iframe>`;
  }

  // Fallback
  return `<video src="${url}" controls class="w-full"></video>`;
}
```

**Критерии успеха:**
- [ ] Inline изображения отображаются в статьях (если есть в `city_article_media`)
- [ ] Video embeds корректно рендерятся (YouTube, Vimeo)
- [ ] Captions отображаются под изображениями
- [ ] Media позиционируется корректно (по `position` field)
- [ ] Статьи выглядят богато и привлекательно (не пустыми)

**Примечание:** Нужно проверить, заполнена ли таблица `city_article_media` тестовыми данными. Если НЕТ → добавить seed в Session-9 или использовать существующий seed из Session-1.

---

### Task 6: Убрать дублирование WebSite JSON-LD на homepage
**Priority:** 🟡 MEDIUM (но входит в Session-9 как часть SEO cleanup)
**Source:** Technical QA (WARN-5 → MEDIUM-4)
**Roadmap ref:** Session-8 Task 8

**Описание:**
Homepage содержит ДВА идентичных WebSite JSON-LD schema с SearchAction. Достаточно одного.

**Что сейчас:**
```
Homepage (/) schemas:
- Organization (1x)
- WebSite (2x) ← дублирование
```

**Что должно быть:**
```
Homepage (/) schemas:
- Organization (1x)
- WebSite (1x) ← только один
```

**Реализация:**
1. Открыть `frontend-sveltekit/src/routes/+page.svelte`
2. Найти `<svelte:head>` section
3. Найти два вызова `createWebSiteSchema()` или два `<script type="application/ld+json">` блока с WebSite
4. Удалить дубликат (оставить только один WebSite schema)

**Критерии успеха:**
- [ ] Homepage содержит только ОДИН WebSite JSON-LD schema
- [ ] WebSite schema содержит SearchAction
- [ ] Google Structured Data Testing Tool показывает 1 WebSite schema (не 2)

---

## Проверки (для CLI перед созданием PR)

**Код:**
- [ ] `npm run build` — frontend без ошибок
- [ ] TypeScript типы корректны
- [ ] Нет console.error/warning при рендере pages

**SEO (Desktop):**
- [ ] `/city/moscow` — LocalBusiness JSON-LD присутствует
- [ ] `/city/moscow/trade-in-chasov-v-moskve` — Article JSON-LD присутствует
- [ ] `/city/moscow/trade-in-chasov-v-moskve` — BreadcrumbList JSON-LD присутствует
- [ ] `/` — только ОДИН WebSite JSON-LD (не два)
- [ ] Google Structured Data Testing Tool: 0 errors для всех schemas

**UI/UX (Desktop + Mobile):**
- [ ] CityHeader badge показывает правильный prepositional case ("Часы в Москве")
- [ ] City articles показывают rich media (изображения + видео если есть)
- [ ] Статьи НЕ выглядят пустыми

**Браузер:**
- [ ] Console чистая (no errors, no warnings)
- [ ] No hydration mismatch на city pages

---

## Чек-лист для субагентов (на проверку Session-9)

После деплоя Session-9 запустить субагентов с этим чеклистом:

**Technical QA:**
- [ ] Verify LocalBusiness JSON-LD present on `/city/moscow`
- [ ] Verify Article JSON-LD present on `/city/moscow/trade-in-chasov-v-moskve`
- [ ] Verify BreadcrumbList JSON-LD present on city article pages
- [ ] Verify only ONE WebSite JSON-LD on homepage (not two)
- [ ] Run Google Structured Data Testing Tool: 0 errors
- [ ] Check console: no errors related to JSON-LD

**UX QA:**
- [ ] CityHeader badge shows "Часы в Москве" (not "Часы в Москва")
- [ ] CityHeader badge correct for all cities (spot check 5 cities)
- [ ] City articles display inline images (if present in DB)
- [ ] City articles display video embeds (if present in DB)
- [ ] Articles look rich and engaging (not empty)

---

## Оценка

**Сложность:** Средняя
**Файлов:** ~6 файлов
- `src/routes/(city)/city/[city]/+page.svelte`
- `src/routes/(city)/city/[city]/[article]/+page.svelte`
- `src/routes/(city)/city/[city]/[article]/+page.server.ts`
- `src/lib/components/layout/CityHeader.svelte`
- `src/lib/utils/schema-helpers.ts`
- `src/routes/+page.svelte`

**Время:** ~2-3 часа (Developer)

**Риски:**
- LOW: JSON-LD schemas — стандартная задача
- MEDIUM: Prepositional case для 102 городов — нужен либо словарь, либо БД поле

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Developer (Claude Code Web)
**Приоритет:** 🔴 HIGH — исправить СРАЗУ после Session-8
