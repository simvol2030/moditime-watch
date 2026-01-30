# Session-4: Layout Management

**Статус:** ⏳ Pending
**Дата:** 2025-01-30
**Источник:** KG004 (KG004-prd-layout-management.md)
**Зависит от:** Session-2 (Config, Navigation)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] Нет hardcoded контактных данных в компонентах (все из site_config)
- [ ] City layout group корректно изолирован

### Проверка в браузере
- [ ] /admin/footer — секции footer редактируются
- [ ] Изменение footer link в админке → отражается на сайте
- [ ] /admin/homepage — hero/services/stats редактируются
- [ ] Изменение hero title → отражается на главной
- [ ] / — footer показывает данные из БД (не hardcoded)
- [ ] / — header показывает телефон из site_config
- [ ] /city/moscow — отдельный упрощённый header (logo + search + "← Каталог")
- [ ] /city/moscow — отдельный footer (city delivery info + contacts)
- [ ] /city/moscow — нет MegaMenu, нет полного footer
- [ ] /catalog — стандартный main layout (MegaMenu, полный footer)
- [ ] Mobile: /city/moscow — корректно отображается
- [ ] Navigation: admin поддерживает header_desktop + city_header меню

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | Footer Management UI | ⏳ | Medium | Админка для footer секций и ссылок |
| 2 | Config → Layout интеграция | ⏳ | Low | Контакты из site_config в header/footer |
| 3 | Homepage Management UI | ⏳ | Medium | Редактирование hero, services, stats, telegram |
| 4 | City Layout (layout group) | ⏳ | High | Отдельный header/footer для /city/* |
| 5 | Navigation extend | ⏳ | Low | Поддержка нескольких menu_type |

---

## Задача 1: Footer Management UI

**DoD:**
- [ ] /admin/footer — список секций (4 колонки) с вложенными ссылками
- [ ] Редактирование секции: title, position, is_active
- [ ] Добавление/редактирование/удаление ссылок внутри секции
- [ ] Изменения отражаются на сайте (SiteFooter.svelte)

**Файлы:**
- `src/routes/(admin)/admin/footer/+page.server.ts` + `+page.svelte`
- `src/lib/server/db/database.ts` — statements для footer CRUD

---

## Задача 2: Config → Layout интеграция

**DoD:**
- [ ] SiteHeader.svelte берёт телефон из site_config (не hardcode)
- [ ] SiteFooter.svelte берёт контакты, адрес, часы работы из site_config
- [ ] Footer copyright: год + текст из site_config
- [ ] Layout server: загрузка config и передача в layout data

**Файлы:**
- `src/routes/+layout.server.ts` — загрузка config
- `src/lib/components/layout/SiteHeader.svelte`
- `src/lib/components/layout/SiteFooter.svelte`

---

## Задача 3: Homepage Management UI

**DoD:**
- [ ] /admin/homepage — единая страница с секциями:
  - Hero: tagline, title, description, CTA text + href, stats JSON, brands JSON
  - Services: список сервисов (icon, title, description)
  - Service Stats: метрики (label, value)
  - Telegram Widget: enabled, text
- [ ] Сохранение → отражается на главной странице

**Файлы:**
- `src/routes/(admin)/admin/homepage/+page.server.ts` + `+page.svelte`
- `src/lib/server/db/database.ts` — UPDATE statements для home_hero, home_services

---

## Задача 4: City Layout (layout group)

**DoD:**
- [ ] Создана layout group `(city)` для city routes
- [ ] City routes перенесены: `src/routes/(city)/city/[city]/`
- [ ] `(city)/+layout.svelte` — CityHeader + CityFooter
- [ ] `(city)/+layout.server.ts` — загрузка city data + site_config
- [ ] CityHeader.svelte: logo, "← Главный каталог" (ссылка на /), city name, search widget, theme toggle
- [ ] CityFooter.svelte: city delivery info (дни, цена), контакты из config, legal links
- [ ] Основной layout (main) не затронут

**Файлы:**
- `src/routes/(city)/+layout.svelte` — новый
- `src/routes/(city)/+layout.server.ts` — новый
- `src/lib/components/layout/CityHeader.svelte` — новый
- `src/lib/components/layout/CityFooter.svelte` — новый
- `src/routes/(city)/city/[city]/+page.server.ts` — перенос из текущего
- `src/routes/(city)/city/[city]/[article]/+page.server.ts` — перенос

---

## Задача 5: Navigation extend

**DoD:**
- [ ] navigation_items поддерживает menu_type: header_desktop, header_mobile, city_header
- [ ] /admin/navigation — показывает секции по menu_type
- [ ] При добавлении item — выбор menu_type
- [ ] CityHeader использует city_header navigation

**Файлы:**
- `src/routes/(admin)/admin/navigation/+page.server.ts` — доработка
- `src/routes/(admin)/admin/navigation/+page.svelte` — доработка

---

*Создано: 2025-01-30*
