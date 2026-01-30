# Session-1: Fix Pages

**Статус:** ⏳ Pending
**Дата:** 2025-01-30
**Источник:** KG001 (KG001-prd-fix-pages.md)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] `npx svelte-kit sync && npx svelte-check` — типы корректны
- [ ] Нет console.log для отладки

### Проверка в браузере
- [ ] /catalog — все 5 фильтров показывают значения (Наличие, Бренд, Материал, Механизм, Сценарий)
- [ ] /catalog — выбор фильтра "Материал: Steel" → товары фильтруются
- [ ] /product/rolex-submariner-126610 — нет 404 на изображения, fallback работает
- [ ] /product/* — галерея показывает placeholder при отсутствии реальных изображений
- [ ] /admin/login — нет console error на Google Fonts
- [ ] /city/moscow — секция "Часовая жизнь" показывает 3+ тестовых статьи
- [ ] /city/moscow/[article-slug] — тестовая статья открывается
- [ ] / — Homepage stats корректны или generic (не "560+ моделей" при 3 товарах)
- [ ] Консоль браузера чистая на всех проверенных страницах

---

## Задачи

| # | Задача | Статус | Файлы | DoD |
|---|--------|--------|-------|-----|
| 1 | Заполнить фильтры каталога | ⏳ | database.ts, schema.sql | 5 фильтров с значениями, 3 товара привязаны |
| 2 | Image fallback для 404 | ⏳ | ProductGallery.svelte, ProductCard.svelte | Нет 404 ошибок, стильный placeholder |
| 3 | Исправить CSP для Google Fonts | ⏳ | hooks.server.ts | Нет console error на /admin |
| 4 | Seed тестовых city articles | ⏳ | database.ts | 3-5 статей для Moscow, SPb, Kazan |
| 5 | Корректировка Homepage stats | ⏳ | database.ts | Stats динамические или generic |

---

## Задача 1: Заполнить фильтры каталога

**DoD:**
- [ ] filter_values заполнены для material (5 значений: Steel, Gold 18K, Titanium, Platinum, Ceramic)
- [ ] filter_values заполнены для mechanism (3 значения: Automatic, Manual, Quartz)
- [ ] filter_values заполнены для scenario (5 значений: Investment, Sport, Business, Casual, Gift)
- [ ] product_filters: 3 существующих товара привязаны к filter_values
- [ ] /catalog — все фильтры отображают значения
- [ ] Выбор фильтра → товары корректно фильтруются

**Файлы:**
- `frontend-sveltekit/src/lib/server/db/database.ts` — seedDatabase()
- `schema.sql` — seed INSERT для filter_values, product_filters

---

## Задача 2: Image fallback для 404

**DoD:**
- [ ] При 404 на изображение → показывается стильный gradient/SVG placeholder
- [ ] ProductGallery.svelte: onerror handler на img тегах
- [ ] ProductCard.svelte: аналогичный fallback
- [ ] Нет 404 ошибок в console на /product/* страницах

**Файлы:**
- `frontend-sveltekit/src/lib/components/product/ProductGallery.svelte`
- `frontend-sveltekit/src/lib/components/catalog/ProductCard.svelte`

---

## Задача 3: Исправить CSP для Google Fonts

**DoD:**
- [ ] /admin/login — нет `Refused to load stylesheet` ошибки
- [ ] Шрифт Inter загружается (если из Google Fonts)
- [ ] Или: шрифт заменён на self-hosted

**Файлы:**
- `frontend-sveltekit/src/hooks.server.ts` (CSP headers)
- Или: `frontend-sveltekit/src/app.html`

---

## Задача 4: Seed тестовых city articles

**DoD:**
- [ ] 3-5 тестовых статей для Moscow (city_id=1)
- [ ] 3 тестовых статьи для Saint-Petersburg
- [ ] 3 тестовых статьи для Kazan
- [ ] /city/moscow — секция статей показывает список
- [ ] /city/moscow/[slug] — статья открывается с контентом

**Файлы:**
- `frontend-sveltekit/src/lib/server/db/database.ts` — seedDatabase()

---

## Задача 5: Корректировка Homepage stats

**DoD:**
- [ ] Homepage hero stats отражают реальность или generic формулировки
- [ ] Вариант A: динамические (SELECT COUNT FROM products/brands)
- [ ] Вариант B: generic ("Премиальные бренды", "Эксклюзивный каталог")

**Файлы:**
- `frontend-sveltekit/src/lib/server/db/database.ts` — seedDatabase() → home_hero
- `frontend-sveltekit/src/routes/+page.server.ts` — если динамические

---

*Создано: 2025-01-30*
