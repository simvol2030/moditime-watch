# Session-10: Critical Admin pSEO Fixes

> **Приоритет:** 🔴 HIGH PRIORITY
> **Фокус:** Исправить админку pSEO — без этого невозможно управлять контентом
> **Задач:** 5
> **Зависит от:** Session-7 (pSEO Admin UI), Session-8 (pSEO Frontend)
> **Источник:** QA validation reports + Moderator feedback

---

## Контекст

После деплоя Session-7 (pSEO Admin UI) и Session-8 (pSEO Frontend) обнаружены **критические баги в админке**, которые блокируют управление pSEO контентом:

1. **Admin pSEO dashboard пустой** после выбора города
2. **Категории не отображаются** в карточках статей
3. **Нет селектора городов** в pSEO разделах → непонятно, с каким городом работаешь
4. **В админке только 3 города** вместо ~102
5. **Sitemap показывает только 3 города** вместо 102

Без исправления этих багов **невозможно:**
- Создавать/редактировать статьи для разных городов
- Понимать, с каким городом работаешь
- Организовать статьи по категориям
- Генерировать корректные sitemaps для всех городов

**Эта сессия — HIGH PRIORITY, восстанавливает работоспособность admin pSEO.**

---

## Задачи

### Task 1: Исправить пустой dashboard в /admin/pseo после выбора города
**Priority:** 🔴 CRITICAL
**Source:** Technical QA (CRIT-6 / WARN-4)
**Roadmap ref:** Session-7 Task 1 (pSEO Dashboard)

**Описание:**
После клика на город (например, "Москва") в admin pSEO dashboard:
- Network request: `GET /admin/pseo/__data.json?city_id=1` → 200 OK ✅
- UI snapshot: empty/incomplete rendering ❌

Данные приходят с бэкенда, но UI не рендерит их.

**Что сейчас:**
```
1. Пользователь открывает /admin/pseo
2. Видит список городов: Москва, Санкт-Петербург, Казань
3. Кликает "Москва"
4. URL меняется на /admin/pseo?city_id=1
5. Fetch запрос выполнен успешно (200 OK)
6. UI пустой/не обновляется ❌
```

**Что должно быть:**
```
6. UI показывает:
   - Заголовок: "pSEO: Москва"
   - Список статей для Москвы
   - Фильтры по категориям
   - Статистику (количество статей)
```

**Возможные причины:**
1. **Svelte reactive state не обновляется** после fetch
2. **Hydration mismatch** — SSR/CSR несовпадение
3. **Данные приходят, но не прокидываются в компоненты**
4. **Условный рендеринг блокирует отображение** (например, `{#if loading}` не сбрасывается)

**Реализация:**

**Шаг 1: Исследовать**
```bash
# Открыть файл
frontend-sveltekit/src/routes/(admin)/admin/pseo/+page.svelte

# Проверить:
1. Reactive statements ($:)
2. onMount / afterNavigate hooks
3. Условный рендеринг ({#if data.articles})
4. Loading states
```

**Шаг 2: Проверить data flow**
```typescript
// +page.server.ts
export async function load({ url }) {
  const cityId = url.searchParams.get('city_id');

  if (!cityId) {
    return { city: null, articles: [] };
  }

  const articles = db.prepare(`
    SELECT ... FROM city_articles WHERE city_id = ?
  `).all(cityId);

  return { cityId, articles }; // ← данные возвращаются?
}
```

**Шаг 3: Проверить component**
```svelte
<!-- +page.svelte -->
<script lang="ts">
  export let data; // ← получаем data из load?

  $: articles = data.articles; // ← reactive?
  $: console.log('Articles:', articles); // ← логировать для debug
</script>

{#if data.cityId}
  <h1>pSEO: {data.city.name}</h1>

  {#if articles.length > 0}
    <!-- Рендер статей -->
  {:else}
    <p>Нет статей для этого города</p>
  {/if}
{:else}
  <!-- City selector -->
{/if}
```

**Шаг 4: Проверить browser console**
```javascript
// При клике на город:
// 1. Проверить Network tab: __data.json?city_id=1 → 200 OK, response body
// 2. Проверить Console: есть ли ошибки?
// 3. Проверить React/Svelte DevTools: data prop обновляется?
```

**Возможные решения:**

**A. Если проблема в reactive state:**
```svelte
<script>
  import { invalidate } from '$app/navigation';

  async function selectCity(cityId: number) {
    goto(`/admin/pseo?city_id=${cityId}`);
    await invalidate('app:pseo'); // force re-run load
  }
</script>
```

**B. Если проблема в hydration:**
```svelte
<script>
  import { browser } from '$app/environment';

  {#if browser}
    <!-- Render только на клиенте -->
  {/if}
</script>
```

**C. Если проблема в load function:**
```typescript
// +page.server.ts
export async function load({ url, depends }) {
  depends('app:pseo'); // dependency tracking

  const cityId = url.searchParams.get('city_id');
  // ...
}
```

**Критерии успеха:**
- [ ] После клика на город UI обновляется и показывает статьи
- [ ] Фильтры по категориям работают
- [ ] Статистика обновляется (количество статей)
- [ ] No console errors
- [ ] Работает в Desktop и Mobile

---

### Task 2: Исправить пустое поле "Категория" в article cards
**Priority:** 🔴 CRITICAL
**Source:** UX QA (CRIT-8 / MINOR-2)
**Roadmap ref:** Session-7 Task 3 (Categories CRUD)

**Описание:**
В admin pSEO dashboard в карточках статей поле "Категория" пустое. Это означает:
- Либо статьи не привязаны к категориям в БД
- Либо category_id не загружается в load function
- Либо компонент не рендерит category name

Без категорий невозможно организовать 102 города × N статей = сотни статей в единый каталог.

**Что сейчас:**
```
Article card:
┌─────────────────────────┐
│ Trade-in часов          │
│ Категория: [пусто]      │ ← BUG
│ Город: Москва           │
│ Статус: Опубликовано    │
└─────────────────────────┘
```

**Что должно быть:**
```
Article card:
┌─────────────────────────┐
│ Trade-in часов          │
│ Категория: Общее        │ ← ✅
│ Город: Москва           │
│ Статус: Опубликовано    │
└─────────────────────────┘
```

**Реализация:**

**Шаг 1: Проверить БД — статьи привязаны к категориям?**
```bash
ssh moditime-server
cd /opt/websites/moditime-watch.ru/repo
sqlite3 data/db/sqlite/app.db

SELECT id, title, category_id FROM city_articles LIMIT 5;
```

**Ожидаемый результат:**
- Если `category_id` = NULL → статьи не привязаны (нужен seed/update)
- Если `category_id` = 1, 2, 3 → привязаны, баг в load function или компоненте

**Шаг 2: Если category_id = NULL → создать seed/update**
```sql
-- Проверить категории
SELECT * FROM city_article_categories;

-- Если категорий нет → создать default категорию
INSERT INTO city_article_categories (id, name, slug, description)
VALUES (1, 'Общее', 'common', 'Общие статьи о часах');

-- Привязать существующие статьи к default категории
UPDATE city_articles SET category_id = 1 WHERE category_id IS NULL;
```

**Шаг 3: Проверить load function — загружается ли category?**
```typescript
// frontend-sveltekit/src/routes/(admin)/admin/pseo/+page.server.ts

const articles = db.prepare(`
  SELECT
    a.*,
    c.name as category_name  -- ← JOIN с categories
  FROM city_articles a
  LEFT JOIN city_article_categories c ON a.category_id = c.id
  WHERE a.city_id = ?
`).all(cityId);

return { articles }; // ← каждая статья имеет category_name
```

**Шаг 4: Проверить component рендер**
```svelte
<!-- Article card component -->
<div class="article-card">
  <h3>{article.title}</h3>
  <p>Категория: {article.category_name || 'Без категории'}</p>
  <p>Город: {article.city_name}</p>
</div>
```

**Критерии успеха:**
- [ ] Все статьи имеют category_id в БД (не NULL)
- [ ] Article cards показывают category name
- [ ] Если категории нет → показывается "Без категории"
- [ ] Фильтр по категориям работает (если есть)

---

### Task 3: Добавить селектор городов в admin pSEO разделах
**Priority:** 🔴 CRITICAL
**Source:** Moderator feedback (MEDIUM-9 / NEW-1)
**Roadmap ref:** Session-7 (general UX improvement)

**Описание:**
В разделах админки, относящихся к pSEO, нет выпадающего списка для переключения между городами. Непонятно, с каким городом работаешь.

**Проблема:**
```
Текущий UX:
1. /admin/pseo → видишь список городов (Москва, СПб, Казань)
2. Кликаешь "Москва" → /admin/pseo?city_id=1
3. НО: на странице нет индикатора "Сейчас работаешь с: Москва"
4. НЕТ возможности быстро переключиться на другой город
5. Нужно возвращаться назад → выбирать заново
```

**Что должно быть:**
```
Улучшенный UX:
1. /admin/pseo?city_id=1 → вверху страницы:
   ┌────────────────────────────┐
   │ pSEO для города: [Москва ▼]│ ← Dropdown
   └────────────────────────────┘
2. Клик на dropdown → выпадающий список всех городов
3. Выбираешь другой город → URL меняется на ?city_id=2 → UI обновляется
```

**Реализация:**

**Вариант A: Sticky header с city selector**
```svelte
<!-- +page.svelte -->
<script>
  import { goto } from '$app/navigation';
  import { Select } from '$lib/components/ui';

  export let data;

  function onCityChange(cityId: number) {
    goto(`/admin/pseo?city_id=${cityId}`);
  }
</script>

{#if data.cityId}
  <!-- Sticky header -->
  <div class="sticky top-0 bg-background border-b p-4 z-10">
    <div class="flex items-center gap-4">
      <h1>pSEO</h1>
      <Select
        value={data.cityId}
        onValueChange={onCityChange}
      >
        {#each data.cities as city}
          <SelectItem value={city.id}>{city.name}</SelectItem>
        {/each}
      </Select>
    </div>
  </div>

  <!-- Dashboard content -->
  <div class="p-4">
    <!-- Articles list, filters, etc. -->
  </div>
{/if}
```

**Вариант B: Breadcrumbs с city indicator**
```svelte
<nav class="breadcrumbs">
  <a href="/admin">Admin</a> /
  <a href="/admin/pseo">pSEO</a> /
  <Select value={data.cityId} ...>
    <SelectTrigger>{data.city.name}</SelectTrigger>
    <!-- Cities list -->
  </Select>
</nav>
```

**Load function update:**
```typescript
// +page.server.ts
export async function load({ url }) {
  const cityId = url.searchParams.get('city_id');

  // Load ALL cities for selector
  const cities = db.prepare(`
    SELECT id, name, slug FROM cities ORDER BY name ASC
  `).all();

  if (!cityId) {
    return { cities, city: null, articles: [] };
  }

  const city = cities.find(c => c.id === Number(cityId));
  const articles = db.prepare(`...`).all(cityId);

  return { cities, city, cityId, articles };
}
```

**Критерии успеха:**
- [ ] В admin pSEO есть city selector (dropdown)
- [ ] Показывается текущий город ("Москва")
- [ ] Dropdown показывает ВСЕ города (не только 3)
- [ ] Переключение между городами работает без багов
- [ ] URL обновляется (?city_id=X)
- [ ] UI обновляется после переключения

---

### Task 4: Исследовать, почему только 3 города в админке (должно быть ~102)
**Priority:** 🟢 MINOR (но важен для pSEO масштаба)
**Source:** Moderator feedback (MINOR-1 / NEW-2)
**Roadmap ref:** Session-2 Task 2 (Cities CRUD) + Session-3 Task 4 (Cities Importer)

**Описание:**
В админке отображается только 3 города (Москва, Санкт-Петербург, Казань), хотя должно быть ~102.

**Возможные причины:**
1. **В БД только 3 города** → импорт не выполнен или откатился
2. **В БД 102 города, но query фильтрует** (LIMIT 3? WHERE clause?)
3. **Frontend пагинация** показывает только первую страницу (3 города)

**Реализация:**

**Шаг 1: Проверить БД**
```bash
ssh moditime-server
sqlite3 /opt/websites/moditime-watch.ru/repo/data/db/sqlite/app.db

SELECT COUNT(*) FROM cities; -- Ожидаем ~102
SELECT id, name, slug FROM cities LIMIT 10; -- Первые 10
```

**Ожидаемые результаты:**

**A. Если COUNT(*) = 3:**
→ Города не импортированы
→ **Решение:** Запустить import seed

**B. Если COUNT(*) = 102:**
→ Города есть, баг в query
→ **Решение:** Исправить load function (убрать LIMIT 3)

**Шаг 2A: Если города не импортированы — запустить seed**
```bash
# Проверить, есть ли файл импорта
ls backend-expressjs/seeds/cities-import.csv

# Если есть → запустить через admin UI
# /admin/import → выбрать cities-import.csv → Import

# ИЛИ через SQL seed
cd /opt/websites/moditime-watch.ru/repo
sqlite3 data/db/sqlite/app.db < migrations/seed-cities-102.sql
```

**Шаг 2B: Если города есть — исправить query**
```typescript
// frontend-sveltekit/src/routes/(admin)/admin/pseo/+page.server.ts
const cities = db.prepare(`
  SELECT id, name, slug FROM cities
  ORDER BY name ASC
  -- LIMIT 3 ← УДАЛИТЬ эту строку если она есть
`).all();
```

**Шаг 3: Проверить frontend pagination**
```svelte
<!-- Если используется пагинация -->
{#each cities.slice(0, citiesPerPage) as city}
  <!-- Проверить, что citiesPerPage не = 3 -->
{/each}
```

**Критерии успеха:**
- [ ] `SELECT COUNT(*) FROM cities` возвращает ~102
- [ ] Admin pSEO city selector показывает ВСЕ 102 города
- [ ] Admin Cities CRUD (`/admin/content/cities`) показывает 102 города
- [ ] Пагинация работает корректно (если используется)

---

### Task 5: Исправить sitemap-cities.xml (только 3 города вместо 102)
**Priority:** 🟡 MEDIUM
**Source:** Technical QA (MEDIUM-7 / WARN-9)
**Roadmap ref:** Session-8 Task 6 (Sitemap Index)

**Описание:**
`/sitemap-cities.xml` показывает только 3 города (kazan, saint-petersburg, moscow), должно быть 102.

**Связь с Task 4:** Если в Task 4 обнаружим, что в БД только 3 города → сначала исправить БД → потом sitemap автоматически покажет 102.

**Что сейчас:**
```xml
<urlset>
  <url><loc>https://moditime-watch.ru/city/kazan</loc></url>
  <url><loc>https://moditime-watch.ru/city/saint-petersburg</loc></url>
  <url><loc>https://moditime-watch.ru/city/moscow</loc></url>
  <!-- Только 3 города -->
</urlset>
```

**Что должно быть:**
```xml
<urlset>
  <url><loc>https://moditime-watch.ru/city/kazan</loc></url>
  <!-- ... ещё 99 городов ... -->
  <url><loc>https://moditime-watch.ru/city/moscow</loc></url>
  <!-- Всего 102 города -->
</urlset>
```

**Реализация:**

**Шаг 1: Проверить sitemap endpoint**
```typescript
// frontend-sveltekit/src/routes/sitemap-cities.xml/+server.ts
import { db } from '$lib/server/db';

export async function GET() {
  const cities = db.prepare(`
    SELECT slug, updated_at FROM cities
    ORDER BY name ASC
    -- LIMIT 3 ← УДАЛИТЬ если есть
  `).all();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${cities.map(city => `
  <url>
    <loc>https://moditime-watch.ru/city/${city.slug}</loc>
    <lastmod>${city.updated_at}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
```

**Шаг 2: Проверить, что БД возвращает 102 города**
```bash
# В production server
curl https://moditime-watch.ru/sitemap-cities.xml | grep -c '<url>'
# Ожидаем: 102
```

**Критерии успеха:**
- [ ] `/sitemap-cities.xml` содержит 102 города (не 3)
- [ ] Каждый город имеет: loc, lastmod, changefreq, priority
- [ ] Google Search Console принимает sitemap без ошибок
- [ ] `/sitemap.xml` (index) корректно ссылается на `/sitemap-cities.xml`

---

## Проверки (для CLI перед созданием PR)

**Код:**
- [ ] `npm run build` — frontend без ошибок
- [ ] TypeScript типы корректны
- [ ] No console errors в browser

**Admin pSEO (Desktop):**
- [ ] `/admin/pseo` — city selector работает
- [ ] Клик на город → dashboard загружается и показывает статьи
- [ ] Article cards показывают category name (не пусто)
- [ ] Переключение между городами работает без багов
- [ ] City selector показывает ВСЕ 102 города (не только 3)

**Database:**
- [ ] `SELECT COUNT(*) FROM cities` = ~102
- [ ] `SELECT COUNT(*) FROM city_articles WHERE category_id IS NOT NULL` > 0
- [ ] Все статьи привязаны к категориям

**Sitemaps:**
- [ ] `/sitemap-cities.xml` содержит 102 города
- [ ] `/sitemap.xml` (index) корректен

---

## Чек-лист для субагентов (на проверку Session-10)

**Technical QA:**
- [ ] Verify admin pSEO dashboard loads articles after city selection
- [ ] Verify network request `__data.json?city_id=1` returns articles
- [ ] Verify UI renders articles (not empty)
- [ ] Verify city selector present in admin pSEO
- [ ] Verify city selector shows 102 cities (not 3)
- [ ] Verify `/sitemap-cities.xml` contains 102 cities
- [ ] Check console: no errors in admin pSEO

**UX QA:**
- [ ] Article cards show category name (not empty)
- [ ] City selector functional (can switch between cities)
- [ ] Dashboard updates when switching cities
- [ ] No visual bugs in admin pSEO UI

---

## Оценка

**Сложность:** Средняя (requires debugging + data investigation)
**Файлов:** ~5 файлов
- `src/routes/(admin)/admin/pseo/+page.svelte`
- `src/routes/(admin)/admin/pseo/+page.server.ts`
- `src/routes/sitemap-cities.xml/+server.ts`
- Возможно seed/migration для cities

**Время:** ~2-3 часа (Developer)

**Риски:**
- MEDIUM: Task 1 (empty dashboard) — требует debugging, причина неясна
- LOW: Task 4 (3 города) — скорее всего просто не импортированы

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Developer (Claude Code Web)
**Приоритет:** 🔴 HIGH — админка pSEO не работает без этих исправлений
