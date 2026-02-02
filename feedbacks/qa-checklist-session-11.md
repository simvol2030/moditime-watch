# Quick QA Checklist: Session-11 (Media & Layout Fixes)

> **Назначение:** Проверка исправлений Session-11 после deploy
> **Фокус:** Проверяем 5 исправлений (footer, hydration, favicon, images, products)
> **Формат:** Quick QA — целевая проверка

---

## Что проверяем

**Developer исправил:**
1. CRIT-7: Duplicate footer на city pages
2. MEDIUM-3: Hydration mismatch warning на homepage
3. MEDIUM-5: Favicon заменён на фирменный
4. MEDIUM-1: Product images URL исправлены (404 → picsum.photos)
5. MEDIUM-6: Product page verified working

---

## Technical QA Checklist

### 1. CRIT-7: No duplicate footer на city pages

**URLs:**
- `https://moditime-watch.ru/city/moscow`
- `https://moditime-watch.ru/city/saint-petersburg`

**Действие:**
1. Открыть city page
2. Scroll вниз до footer
3. Посчитать количество footer элементов

**Ожидаемый результат:**
- ✅ ТОЛЬКО ОДИН footer (CityFooter)
- ❌ НЕ два footer (CityFooter + MainFooter)

**Проверить на 2 городах:**
- Москва
- Санкт-Петербург

---

### 2. MEDIUM-3: No hydration mismatch warning

**URL:** `https://moditime-watch.ru/`

**Действие:**
1. Открыть homepage
2. Открыть browser console
3. Проверить warnings

**Ожидаемый результат:**
- ✅ No warning `state_referenced_locally`
- ✅ No warning `hydration_mismatch`
- ✅ Console чистая

---

### 3. MEDIUM-5: Favicon присутствует

**URL:** `https://moditime-watch.ru/` (любая страница)

**Действие:**
1. Открыть страницу
2. Проверить browser tab
3. Проверить Network tab → Filter: favicon

**Ожидаемый результат:**
- ✅ Favicon отображается в browser tab (фирменный "M" логотип)
- ✅ No 404 для /favicon.ico или /favicon.svg
- ✅ Favicon visible on all pages (homepage, catalog, city, product)

---

### 4. MEDIUM-1: No 404 для product images

**URL:** `https://moditime-watch.ru/catalog`

**Действие:**
1. Открыть catalog page
2. Открыть Console → Network tab → Filter: Images
3. Проверить product images

**Ожидаемый результат:**
- ✅ No 404 errors для product images
- ✅ Images загружаются (от picsum.photos или с fallback)
- ✅ Если image отсутствует → fallback placeholder (не broken image icon)

**Проверить на 5 продуктах**

---

### 5. MEDIUM-6: Product pages доступны

**URLs:**
- `https://moditime-watch.ru/product/rolex-submariner-126610ln`
- `https://moditime-watch.ru/catalog` → клик на продукт

**Действие:**
1. Открыть product page напрямую
2. Открыть catalog → кликнуть на продукт

**Ожидаемый результат:**
- ✅ Product page открывается (200 OK, не 404)
- ✅ Navigation catalog → product работает
- ✅ Product details отображаются (name, price, images, description)

**Проверить на 3 продуктах**

---

### 6. Main site footer присутствует на основных страницах

**URLs:**
- `https://moditime-watch.ru/`
- `https://moditime-watch.ru/catalog`

**Действие:**
1. Открыть homepage
2. Scroll вниз до footer
3. Проверить что MainFooter присутствует

**Ожидаемый результат:**
- ✅ MainFooter присутствует на homepage
- ✅ MainFooter присутствует на catalog
- ❌ MainFooter НЕ присутствует на city pages

---

## UX QA Checklist

### 1. CRIT-7: Single footer на city pages (visual)

**URL:** `https://moditime-watch.ru/city/moscow`
**Viewports:** Desktop 1920×1080, Mobile 375×812

**Действие:**
1. Открыть city page
2. Scroll вниз до footer
3. Визуально проверить

**Ожидаемый результат:**
- ✅ Только CityFooter виден (с "Перейти на главный каталог →" ссылкой)
- ❌ MainFooter не виден
- ✅ No duplicate content
- ✅ Footer выглядит корректно (не обрезан, не наслаивается)

**Проверить оба viewports:**
- Desktop
- Mobile

---

### 2. MEDIUM-5: Favicon visible

**URL:** `https://moditime-watch.ru/`
**Viewports:** Desktop 1920×1080

**Действие:**
1. Открыть homepage
2. Проверить browser tab

**Ожидаемый результат:**
- ✅ Favicon отображается (фирменная буква "M")
- ✅ Favicon не Svelte default logo
- ✅ Favicon виден на всех страницах

**Проверить на 3 страницах:**
- Homepage
- Catalog
- City page

---

### 3. MEDIUM-1: Product images загружаются

**URL:** `https://moditime-watch.ru/catalog`
**Viewports:** Desktop 1920×1080, Mobile 375×812

**Действие:**
1. Открыть catalog
2. Проверить product cards

**Ожидаемый результат:**
- ✅ Product images загружаются
- ✅ No broken image icons
- ✅ Если изображение не загрузилось → fallback placeholder (красивая заглушка)

**Проверить на 5 продуктах**

---

### 4. MEDIUM-6: Product pages доступны (visual)

**URL:** `https://moditime-watch.ru/catalog` → клик на продукт
**Viewports:** Desktop 1920×1080

**Действие:**
1. Открыть catalog
2. Кликнуть на product card
3. Проверить product page

**Ожидаемый результат:**
- ✅ Product page открывается
- ✅ Product details отображаются
- ✅ Images gallery работает
- ✅ Add to cart button присутствует

---

## Формат отчёта для субагентов

```markdown
# Quick QA Report: Session-11 (Media & Layout)

## Summary
- ✅ FIXED / ❌ NOT FIXED / ⚠️ PARTIALLY FIXED

## Technical Validation

### CRIT-7: Duplicate footer
- Moscow: [✅ single footer / ❌ duplicate]
- Saint-Petersburg: [✅ single footer / ❌ duplicate]

### MEDIUM-3: Hydration mismatch
- Homepage console: [✅ clean / ❌ warnings present]
- Warning details: [if any]

### MEDIUM-5: Favicon
- Favicon loads: [✅/❌]
- 404 errors: [YES/NO]

### MEDIUM-1: Product images
- 404 errors: [count]
- Fallback works: [✅/❌]

### MEDIUM-6: Product pages
- Pages accessible: [✅/❌]
- Tested products: [list]

### Main site footer
- Homepage: [✅ present / ❌ missing]
- Catalog: [✅ present / ❌ missing]

## UX Validation

### Single footer визуально корректен
- Desktop: [✅/❌]
- Mobile: [✅/❌]

### Favicon visible
- Homepage: [✅/❌]
- Catalog: [✅/❌]
- City page: [✅/❌]

### Product images load correctly
- Desktop: [✅/❌]
- Mobile: [✅/❌]
- Fallback: [✅/❌]

## Screenshots
[Attach if issues found]

## Conclusion
✅ Session-11 FIXED / ❌ NOT FIXED / ⚠️ PARTIALLY FIXED
```

**Сохранить отчёты в:**
- Technical QA: `feedbacks/qa-reports/session-11-v1/tech-check.md`
- UX QA: `feedbacks/qa-reports/session-11-v1/ux-check.md`

---

## Критерии успеха

**Session-11 считается FIXED если:**
- ✅ City pages имеют ОДИН footer (не два)
- ✅ No hydration mismatch warning на homepage
- ✅ Favicon присутствует на всех страницах
- ✅ Product images загружаются (no 404)
- ✅ Product pages доступны (no 404)
- ✅ Main site pages имеют MainFooter

**Если НЕ FIXED → создать feedback файл**

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** QA subagents
**Тип:** Quick QA — целевая проверка Session-11
