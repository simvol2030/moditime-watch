# Session-2: Admin Panel E-commerce

**Статус:** ⏳ Pending
**Дата:** 2025-01-30
**Источник:** KG002 (KG002-prd-admin-panel.md)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] `npx svelte-kit sync && npx svelte-check` — типы корректны
- [ ] Нет console.log для отладки
- [ ] Все новые routes защищены auth (hooks.server.ts)

### Проверка в браузере
- [ ] /admin — Sidebar показывает все новые разделы
- [ ] /admin/collections — список 6 коллекций, CRUD работает
- [ ] /admin/cities — список 102 городов с поиском
- [ ] /admin/cities/1 — редактирование города
- [ ] /admin/city-articles — список, фильтр по городу
- [ ] /admin/city-articles/new — создание статьи с выбором города
- [ ] /admin/testimonials — список 6 отзывов, CRUD работает
- [ ] /admin/articles — список 6 статей журнала, CRUD работает
- [ ] /admin/products/1 — секция "Варианты" (options) видна
- [ ] /admin/system/config — настройки заполнены, редактируются
- [ ] /admin/orders — фильтр по статусу работает
- [ ] Консоль браузера чистая на всех admin страницах
- [ ] CSRF protection работает на всех POST/PUT/DELETE

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | Collections CRUD | ⏳ | Medium | 3 routes, CRUD, связь с products |
| 2 | Cities CRUD | ⏳ | Medium | 3 routes, список с поиском |
| 3 | City Articles CRUD | ⏳ | Medium | 3 routes, фильтр по городу, CitySelector |
| 4 | Testimonials CRUD | ⏳ | Low | 3 routes, CRUD |
| 5 | Journal Articles CRUD | ⏳ | Medium | 3 routes, категории, теги |
| 6 | Product Options UI | ⏳ | Medium | Секция в форме товара |
| 7 | Config seed + UI | ⏳ | Low | Базовые настройки заполнены |
| 8 | Orders improve | ⏳ | Low | Фильтр по статусу, детальная страница |
| 9 | Sidebar update | ⏳ | Low | Все новые разделы в меню |

---

## Задача 1: Collections CRUD

**DoD:**
- [ ] /admin/collections — таблица: ID, Name, Slug, Products Count, Status, Position, Actions
- [ ] /admin/collections/new — форма: name, slug, description, image_url, is_active, position
- [ ] /admin/collections/[id] — редактирование + управление связями collection ↔ products
- [ ] Delete работает (с подтверждением)
- [ ] Данные отображаются на Homepage (CollectionsSection)

**Файлы:**
- `src/routes/(admin)/admin/collections/+page.server.ts` + `+page.svelte`
- `src/routes/(admin)/admin/collections/new/+page.server.ts` + `+page.svelte`
- `src/routes/(admin)/admin/collections/[id]/+page.server.ts` + `+page.svelte`
- `src/lib/server/db/database.ts` — prepared statements

---

## Задача 2: Cities CRUD

**DoD:**
- [ ] /admin/cities — таблица: ID, Name, Slug, Region, Delivery Days, Delivery Price, Status, Actions
- [ ] Поиск по name/region
- [ ] /admin/cities/new — форма со всеми полями (name, падежи, region, delivery_days, delivery_price)
- [ ] /admin/cities/[id] — редактирование
- [ ] Delete работает

**Файлы:**
- `src/routes/(admin)/admin/cities/+page.server.ts` + `+page.svelte`
- `src/routes/(admin)/admin/cities/new/+page.server.ts` + `+page.svelte`
- `src/routes/(admin)/admin/cities/[id]/+page.server.ts` + `+page.svelte`

---

## Задача 3: City Articles CRUD

**DoD:**
- [ ] /admin/city-articles — таблица с фильтром по городу (dropdown)
- [ ] /admin/city-articles/new — форма: city selector, slug, title, excerpt, content (textarea), template_type, is_published
- [ ] /admin/city-articles/[id] — редактирование
- [ ] Статья видна на /city/[city] и /city/[city]/[article]

**Файлы:**
- `src/routes/(admin)/admin/city-articles/` — 3 routes
- `src/lib/components/admin/CitySelector.svelte` — новый компонент

---

## Задача 4: Testimonials CRUD

**DoD:**
- [ ] /admin/testimonials — таблица: ID, Name, Position, Rating, Choice, Status, Actions
- [ ] /admin/testimonials/new — форма: name, position, avatar_url, text, rating, choice, is_active
- [ ] /admin/testimonials/[id] — редактирование
- [ ] Отзывы на Homepage из БД

**Файлы:**
- `src/routes/(admin)/admin/testimonials/` — 3 routes

---

## Задача 5: Journal Articles CRUD

**DoD:**
- [ ] /admin/articles — таблица с фильтром по категории
- [ ] /admin/articles/new — форма: title, slug, content (textarea/HTML), category, author, read_time, image
- [ ] /admin/articles/[id] — редактирование
- [ ] Статьи на /journal из БД

**Файлы:**
- `src/routes/(admin)/admin/articles/` — 3 routes

---

## Задача 6: Product Options UI

**DoD:**
- [ ] /admin/products/[id] — секция "Варианты" под основной формой
- [ ] Добавить option: type (size/color/strap), label, value, price_modifier
- [ ] Удалить option
- [ ] Options сохраняются в product_options

**Файлы:**
- `src/routes/(admin)/admin/products/[id]/+page.svelte` — доработка
- `src/lib/components/admin/OptionsEditor.svelte` — новый компонент

---

## Задача 7: Config seed + UI

**DoD:**
- [ ] Seed: site_name, contact_phone, contact_email, contact_address, working_hours, social_telegram, copyright_text
- [ ] /admin/system/config — отображает все настройки, редактирование сохраняет
- [ ] Кнопка "+ Add Setting" работает

**Файлы:**
- `src/lib/server/db/database.ts` — seed
- `src/routes/(admin)/admin/system/config/+page.server.ts` — доработка

---

## Задача 8: Orders improve

**DoD:**
- [ ] /admin/orders — фильтр по статусу (tabs: All, Pending, Confirmed, Paid, Shipped, Delivered, Cancelled)
- [ ] /admin/orders/[id] — детальная страница: данные заказа + order_items + history
- [ ] Кнопки смены статуса (с подтверждением)

**Файлы:**
- `src/routes/(admin)/admin/orders/+page.server.ts` — доработка
- `src/routes/(admin)/admin/orders/[id]/+page.server.ts` — доработка

---

## Задача 9: Sidebar update

**DoD:**
- [ ] AdminSidebar.svelte содержит все разделы:
  - E-commerce: Products, Brands, Categories, Collections, Orders
  - pSEO: Cities, City Articles
  - Content: Pages, Articles, Testimonials, Navigation
  - System: Config, Admins

**Файлы:**
- `src/lib/components/admin/AdminSidebar.svelte`

---

*Создано: 2025-01-30*
