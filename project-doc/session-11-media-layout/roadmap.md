# Session-11: Media & Layout Fixes

> **Приоритет:** 🟡 MEDIUM PRIORITY
> **Фокус:** Медиа, layout, hydration — важные, но не блокирующие баги
> **Задач:** 5
> **Зависит от:** Session-8 (pSEO Frontend), Session-1 (Catalog)
> **Источник:** QA validation reports

---

## Контекст

После деплоя Session-8 субагенты нашли ряд medium-severity багов, связанных с медиа-контентом, layout структурой и рендерингом:

1. **Product images 404** в каталоге → нужен fallback механизм
2. **Favicon отсутствует** → 404 на всех страницах + нужна админка для управления
3. **Duplicate footer** на city pages → плохой UX
4. **Hydration mismatch** на homepage → может сломать интерактивность
5. **Product page 404** → нужно исследовать причину

Эти баги **не блокируют** pSEO функционал, но ухудшают UX и могут привести к проблемам в будущем.

---

## Задачи

### Task 1: Исправить 404 на product images + добавить fallback image компонент
**Priority:** 🟡 MEDIUM
**Source:** Technical QA (MEDIUM-1 / WARN-1)
**Roadmap ref:** Session-1 (Product Catalog fixes)

**Описание:**
Catalog page показывает 404 errors для product images:
```
[ERROR] Failed to load resource: //moditime-watch.ru/images/products/product-1-1.jpg:0
[ERROR] Failed to load resource: //moditime-watch.ru/images/products/product-2-1.jpg:0
[ERROR] Failed to load resource: //moditime-watch.ru/images/products/product-3-1.jpg:0
```

**Комментарий Moderator:**
"Исправить 404 + добавить fallback image заглушку. Если изображения нет физически → красивая заглушка (иконка), не браузерный broken image."

**Проблема:**
1. Images физически отсутствуют на сервере ИЛИ
2. Пути к images неверные в БД ИЛИ
3. Images есть, но URL неправильный (//moditime... вместо https://...)

**Решение:**

**A. Исправить 404 (два варианта):**

**Вариант 1: Загрузить недостающие изображения**
```bash
# На сервере
cd /opt/websites/moditime-watch.ru/repo
mkdir -p static/images/products

# Скопировать placeholder images
cp placeholder-watch.jpg static/images/products/product-1-1.jpg
cp placeholder-watch.jpg static/images/products/product-2-1.jpg
cp placeholder-watch.jpg static/images/products/product-3-1.jpg
```

**Вариант 2: Исправить пути в БД**
```sql
-- Проверить текущие пути
SELECT id, name, images FROM products WHERE id IN (1,2,3);

-- Если пути неверные → обновить
UPDATE products SET images = '/images/products/product-1-1.jpg' WHERE id = 1;
```

**B. Создать Image компонент с fallback:**

```svelte
<!-- src/lib/components/ui/ProductImage.svelte -->
<script lang="ts">
  export let src: string;
  export let alt: string;
  export let className: string = '';

  let imageError = false;
  const fallbackSrc = '/images/fallback/placeholder-watch.png';

  function handleError() {
    imageError = true;
  }
</script>

<img
  src={imageError ? fallbackSrc : src}
  {alt}
  class={className}
  on:error={handleError}
/>
```

**C. Использовать компонент в каталоге:**
```svelte
<!-- src/routes/(main)/catalog/+page.svelte -->
<script>
  import ProductImage from '$lib/components/ui/ProductImage.svelte';
</script>

{#each products as product}
  <div class="product-card">
    <ProductImage
      src={product.images[0]}
      alt={product.name}
      className="w-full h-64 object-cover"
    />
    <h3>{product.name}</h3>
  </div>
{/each}
```

**D. Создать красивую placeholder image:**
```
/static/images/fallback/placeholder-watch.png
- Размер: 600x600px
- Содержание: иконка часов + текст "Изображение скоро появится"
- Цвет: нейтральный серый, соответствует дизайну сайта
```

**Критерии успеха:**
- [ ] No 404 errors для product images в console
- [ ] Если изображение отсутствует → показывается красивая заглушка (не broken image)
- [ ] Заглушка соответствует дизайну сайта
- [ ] Компонент переиспользуемый (можно использовать везде)
- [ ] Работает на catalog, product pages, admin

---

### Task 2: Добавить favicon + админка для управления
**Priority:** 🟡 MEDIUM
**Source:** UX QA (MEDIUM-5 / WARN-7)
**Roadmap ref:** New functionality

**Описание:**
Favicon отсутствует на всех страницах → 404 error. Нужно:
1. Исправить 404 (добавить default favicon)
2. Создать функционал в админке для загрузки/изменения favicon

**Комментарий Moderator:**
"Важный баг + добавить функционал в админке (Системные настройки): загружать изображение, конвертировать в favicon, менять."

**Реализация:**

**Часть A: Исправить 404 — добавить default favicon**

```bash
# Создать favicon (16x16, 32x32, 48x48)
# Можно использовать генератор: https://realfavicongenerator.net/

# Добавить в static/
cp favicon.ico static/favicon.ico
cp favicon-16x16.png static/favicon-16x16.png
cp favicon-32x32.png static/favicon-32x32.png
```

```html
<!-- src/app.html -->
<head>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
</head>
```

**Часть B: Админка для управления favicon**

**1. Добавить в System Settings:**
```typescript
// backend-expressjs/src/routes/config.ts
router.post('/config/favicon', upload.single('favicon'), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Convert to .ico format (или использовать library: sharp, favicon)
  const faviconPath = '/uploads/favicon/favicon.ico';
  await convertToFavicon(file.path, faviconPath);

  // Save path to config
  db.prepare(`
    UPDATE config SET value = ? WHERE key = 'site_favicon'
  `).run(faviconPath);

  res.json({ success: true, path: faviconPath });
});
```

**2. Frontend admin UI:**
```svelte
<!-- src/routes/(admin)/admin/system/settings/+page.svelte -->
<script>
  import { Button } from '$lib/components/ui';
  import { Input } from '$lib/components/ui';

  let faviconFile: File | null = null;

  async function uploadFavicon() {
    const formData = new FormData();
    formData.append('favicon', faviconFile);

    const res = await fetch('/api/config/favicon', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      alert('Favicon обновлён');
      window.location.reload();
    }
  }
</script>

<section>
  <h2>Favicon сайта</h2>

  <div class="preview">
    <img src={data.config.site_favicon || '/favicon.ico'} alt="Current favicon" width="32" />
  </div>

  <Input
    type="file"
    accept="image/png,image/jpeg,image/x-icon"
    on:change={(e) => faviconFile = e.target.files[0]}
  />

  <Button on:click={uploadFavicon}>Загрузить новый favicon</Button>

  <p class="text-sm text-muted-foreground">
    Рекомендуется: PNG или ICO, размер 32x32px или 64x64px
  </p>
</section>
```

**3. Динамическая подстановка favicon:**
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  export let data;
</script>

<svelte:head>
  <link rel="icon" type="image/x-icon" href={data.config.site_favicon || '/favicon.ico'}>
</svelte:head>
```

**Критерии успеха:**
- [ ] No 404 errors для favicon
- [ ] Default favicon отображается на всех страницах
- [ ] Админка `/admin/system/settings` имеет раздел "Favicon"
- [ ] Можно загрузить новый favicon через админку
- [ ] После загрузки новый favicon отображается на сайте
- [ ] Поддержка разных форматов (PNG, ICO)

---

### Task 3: Исправить duplicate footer на city pages
**Priority:** 🔴 CRITICAL (upgrade from WARN-6)
**Source:** UX QA (CRIT-7 / WARN-6)
**Roadmap ref:** Session-8 Task 2 (CityFooter)

**Описание:**
На city pages отображаются ДВА footer:
1. CityFooter (специфичный для города)
2. Main site footer (общий)

**Комментарий Moderator:**
"Даже критичный баг, разобраться в чем причина."

**Что сейчас:**
```
/city/moscow page structure:
├── CityHeader
├── Hero section
├── Articles list
├── CityFooter ← footer #1
└── MainFooter ← footer #2 (дубликат)
```

**Что должно быть:**
```
/city/moscow page structure:
├── CityHeader
├── Hero section
├── Articles list
└── CityFooter ← только один footer
```

**Возможные причины:**

**A. Layout nesting issue:**
```svelte
<!-- src/routes/(city)/+layout.svelte -->
<CityHeader />
<slot />
<CityFooter />

<!-- НО: +layout.svelte наследует от root +layout.svelte, который имеет MainFooter -->
```

**B. Slot structure issue:**
Проверить `src/routes/+layout.svelte`:
```svelte
<Header />
<slot />
<Footer /> ← это Footer попадает внутрь (city) layout
```

**Решение:**

**Вариант 1: Conditional footer в root layout**
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/stores';

  $: isCityPage = $page.url.pathname.startsWith('/city');
</script>

<Header />

<slot />

{#if !isCityPage}
  <Footer />
{/if}
```

**Вариант 2: Layout группы с отдельным root**
```
src/routes/
├── (main)/
│   ├── +layout.svelte ← Header + Footer
│   ├── catalog/
│   └── product/
└── (city)/
    ├── +layout.svelte ← CityHeader + CityFooter
    └── city/
```

Переместить pages в layout groups.

**Вариант 3: Явно отключить наследование**
```svelte
<!-- src/routes/(city)/+layout.svelte -->
<script>
  import { setContext } from 'svelte';
  setContext('hideMainFooter', true);
</script>

<CityHeader />
<slot />
<CityFooter />
```

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { getContext } from 'svelte';
  const hideMainFooter = getContext('hideMainFooter');
</script>

{#if !hideMainFooter}
  <Footer />
{/if}
```

**Критерии успеха:**
- [ ] На city pages отображается ТОЛЬКО CityFooter (не два footer)
- [ ] Main site pages (catalog, product) отображают MainFooter
- [ ] No layout bugs на других страницах

---

### Task 4: Исправить Svelte hydration mismatch warning
**Priority:** 🟡 MEDIUM
**Source:** Technical QA (MEDIUM-3 / WARN-3)
**Roadmap ref:** Session-8 (general SSR/CSR fix)

**Описание:**
Homepage показывает Svelte hydration mismatch warning:
```
[WARNING] https://svelte.dev/e/hydration_mismatch
```

**Комментарий Moderator:**
"Исправить, может привести к большим проблемам, станет критичным."

**Что такое hydration mismatch:**
SSR (server-side render) генерирует HTML, затем клиент "гидратирует" (подключает интерактивность). Если HTML на сервере ≠ HTML на клиенте → warning.

**Возможные причины:**

**A. Даты/время (разные timezone на сервере и клиенте)**
```svelte
<p>Current time: {new Date().toLocaleString()}</p>
<!-- SSR: "02.02.2025, 10:00"
     CSR: "02.02.2025, 13:00" → mismatch -->
```

**B. Случайные данные**
```svelte
<p>Random: {Math.random()}</p>
<!-- SSR: 0.123
     CSR: 0.456 → mismatch -->
```

**C. Browser-only API в SSR**
```svelte
<script>
  const width = window.innerWidth; // ❌ window не существует в SSR
</script>
```

**D. Условный рендеринг на основе browser API**
```svelte
{#if typeof window !== 'undefined'}
  <Component />
{/if}
```

**Реализация:**

**Шаг 1: Найти источник warning**
```bash
# Открыть browser console на homepage
# Посмотреть stack trace warning
# Определить компонент, вызывающий mismatch
```

**Шаг 2: Проверить компоненты homepage**
```svelte
<!-- src/routes/+page.svelte -->
<!-- Проверить:
  - Hero.svelte
  - FeaturedProducts.svelte
  - Testimonials.svelte
  - JournalPreview.svelte
-->
```

**Шаг 3: Исправить mismatch (примеры решений)**

**A. Для дат/времени:**
```svelte
<script>
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let currentTime = '';

  onMount(() => {
    currentTime = new Date().toLocaleString();
  });
</script>

{#if browser && currentTime}
  <p>{currentTime}</p>
{/if}
```

**B. Для browser API:**
```svelte
<script>
  import { browser } from '$app/environment';

  let isMobile = false;

  if (browser) {
    isMobile = window.innerWidth < 768;
  }
</script>
```

**C. Для условного рендеринга:**
```svelte
<script>
  import { onMount } from 'svelte';

  let mounted = false;

  onMount(() => {
    mounted = true;
  });
</script>

{#if mounted}
  <!-- Компоненты, зависящие от browser API -->
{/if}
```

**Критерии успеха:**
- [ ] No hydration mismatch warning на homepage
- [ ] SSR HTML идентичен CSR HTML (проверить через View Source vs Inspect)
- [ ] Интерактивность работает корректно
- [ ] No регрессий на других страницах

---

### Task 5: Исследовать product page 404, исправить
**Priority:** 🟡 MEDIUM
**Source:** UX QA (MEDIUM-6 / WARN-8)
**Roadmap ref:** Session-1 (Product pages)

**Описание:**
Product page `/product/rolex-submariner-date-126610ln` возвращает 404.

**Комментарий Moderator:**
"Очень важный баг, качественно проработать."

**Возможные причины:**

**A. Продукты не published в БД**
```sql
SELECT id, name, slug, status FROM products WHERE slug = 'rolex-submariner-date-126610ln';
-- Если status = 'draft' → страница не доступна
```

**B. URL structure изменилась**
Возможно, URL должен быть `/catalog/product/...` вместо `/product/...`?

**C. Product route не существует**
Проверить, есть ли файл `src/routes/(main)/product/[slug]/+page.svelte`?

**D. Load function возвращает null**
```typescript
// +page.server.ts
export async function load({ params }) {
  const product = db.prepare(`...`).get(params.slug);

  if (!product) {
    throw error(404, 'Product not found'); // ← возможно, срабатывает
  }

  return { product };
}
```

**Реализация:**

**Шаг 1: Проверить БД**
```sql
SELECT COUNT(*) FROM products WHERE status = 'published';
-- Если 0 → продукты не published

SELECT id, name, slug, status FROM products LIMIT 5;
-- Проверить статусы
```

**Шаг 2: Если продукты draft → publish**
```sql
UPDATE products SET status = 'published' WHERE status = 'draft';
```

**Шаг 3: Проверить route structure**
```bash
ls -la src/routes/(main)/product/[slug]/
# Должны быть: +page.svelte, +page.server.ts
```

**Шаг 4: Проверить load function**
```typescript
// src/routes/(main)/product/[slug]/+page.server.ts
export async function load({ params }) {
  console.log('Loading product:', params.slug); // debug

  const product = db.prepare(`
    SELECT * FROM products WHERE slug = ?
  `).get(params.slug);

  if (!product || product.status !== 'published') {
    throw error(404, 'Product not found');
  }

  return { product };
}
```

**Шаг 5: Проверить navigation links**
```svelte
<!-- Catalog page -->
<a href="/product/{product.slug}">
  <!-- Проверить, что href правильный -->
</a>
```

**Критерии успеха:**
- [ ] Product pages доступны (no 404)
- [ ] `/product/rolex-submariner-date-126610ln` открывается
- [ ] Published products отображаются в каталоге
- [ ] Draft products не доступны (404 ожидаемый)
- [ ] Навигация catalog → product работает

---

## Проверки (для CLI перед созданием PR)

**Код:**
- [ ] `npm run build` — frontend без ошибок
- [ ] TypeScript типы корректны
- [ ] No console errors

**Media (Desktop + Mobile):**
- [ ] Product images загружаются (no 404)
- [ ] Если изображения нет → показывается fallback
- [ ] Favicon отображается на всех страницах
- [ ] Админка favicon management работает

**Layout (Desktop + Mobile):**
- [ ] City pages имеют ТОЛЬКО CityFooter (не два footer)
- [ ] Main site pages имеют MainFooter
- [ ] No hydration mismatch warning на homepage

**Products:**
- [ ] Product pages доступны (no 404)
- [ ] Navigation catalog → product работает

---

## Чек-лист для субагентов (на проверку Session-11)

**Technical QA:**
- [ ] Verify no 404 errors for product images
- [ ] Verify favicon loads on all pages (no 404)
- [ ] Verify no duplicate footer on city pages
- [ ] Verify no hydration mismatch warning on homepage
- [ ] Verify product pages accessible (no 404)
- [ ] Check console: no errors

**UX QA:**
- [ ] Product images fallback displays correctly (if image missing)
- [ ] Favicon visible in browser tab
- [ ] City pages have single footer (CityFooter)
- [ ] Product pages display correctly

---

## Оценка

**Сложность:** Средняя
**Файлов:** ~8 файлов
- Product image component
- Favicon admin UI + backend
- Layout files (root + city)
- Homepage components (для hydration fix)
- Product page route

**Время:** ~3-4 часа (Developer)

**Риски:**
- MEDIUM: Task 4 (hydration) — требует debugging, причина может быть неочевидна
- LOW: Task 3 (duplicate footer) — layout nesting, стандартная задача

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Developer (Claude Code Web)
**Приоритет:** 🟡 MEDIUM — важные баги, но не блокируют основной функционал
