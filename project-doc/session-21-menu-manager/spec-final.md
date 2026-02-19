# Session-21: Menu Manager Admin — Спецификация

**Версия:** final
**Дата:** 2026-02-19
**ASCII-спека:** `../../ASCII/admin/menu-manager.md`

---

## Есть сейчас vs Должно быть

| Аспект | Есть | Должно быть |
|--------|------|-------------|
| Header navigation | Данные в БД (`navigation_items`), но нет UI для управления | Полноценный UI: добавление, редактирование, удаление, подменю, порядок |
| Footer sections/links | Данные в БД (`footer_sections` + `footer_links`), нет UI | CRUD секций + ссылок внутри секций |
| Footer legal links | В БД, нет UI | Редактирование ссылок правовой секции |
| City navigation | В БД (`city_nav_items`), нет UI | Управление пунктами навигации города |
| Общий раздел "Меню" | Нет | Страница `/admin/menus` — список всех меню + редактор каждого |

---

## Что на выходе

Страница `/admin/menus` с двумя уровнями:

### Уровень 1: Список меню

Таблица всех меню сайта:
- Навигация Desktop (`header_desktop`) — из `navigation_items`
- Навигация Mobile (`header_mobile`) — из `navigation_items`
- Footer секции (`footer`) — из `footer_sections` + `footer_links`
- Footer правовая (`footer_legal`) — из `footer_sections` (legal type)
- City навигация (`city_nav`) — из `city_nav_items`

Клик → переход в редактор конкретного меню.

### Уровень 2: Редактор меню

#### Header Menu (Desktop / Mobile)

- Список пунктов с вложенностью (подменю через `parent_id`)
- Drag-and-drop или стрелки вверх/вниз для порядка
- Добавление пункта: label, URL, target (_blank), parent (для подменю)
- Редактирование inline или модальное окно
- Удаление пункта (с подтверждением)

#### Footer Menu

- Секции (колонки): CRUD — title, position
- Ссылки в каждой секции: CRUD — label, url, position
- Drag-and-drop или стрелки для порядка секций и ссылок

#### Footer Legal

- Список ссылок правовой строки (Политика конф., Оферта и т.д.)
- CRUD: label, url, position

#### City Nav

- Пункты навигации для city-layout
- CRUD: label, url, position

---

## Что нужно сделать

### 1. Prepared statements в database.ts

Добавить/расширить queries для:
- `navigation_items` — CRUD по меню (фильтр по `menu` column)
- `footer_sections` — CRUD + reorder
- `footer_links` — CRUD + reorder (фильтр по `section_id`)
- `city_nav_items` — CRUD + reorder (если таблица существует, иначе создать)

### 2. Страница `/admin/menus`

**Список меню:** таблица с названием, идентификатором, количеством пунктов, кнопкой редактирования.

**Редактор:** URL-параметр `?menu=header_desktop` для выбора меню.
- Header menus: дерево с parent/child
- Footer: секции + ссылки (два уровня)
- City nav: плоский список

### 3. Server actions

- `createMenuItem` / `updateMenuItem` / `deleteMenuItem` — для navigation_items
- `reorderMenuItems` — обновление position
- `createFooterSection` / `updateFooterSection` / `deleteFooterSection`
- `createFooterLink` / `updateFooterLink` / `deleteFooterLink`
- `reorderFooterSections` / `reorderFooterLinks`
- Аналогичные для city_nav_items

### 4. Sidebar link

Добавить "Меню" в admin sidebar.

---

## Факторы реализации

- **Данные уже в БД:** navigation_items, footer_sections, footer_links существуют и работают. Нужен только UI
- **Подменю:** navigation_items поддерживает `parent_id` — учесть при рендеринге дерева
- **Footer — два типа:** обычные секции и legal (правовая строка). Различать по типу или отдельной таблице
- **Drag-and-drop vs стрелки:** стрелки проще в реализации, drag-and-drop — опционально
- **ASCII-спека:** строго `ASCII/admin/menu-manager.md`

---

## Критерии успеха

- [ ] Список всех меню отображается на `/admin/menus`
- [ ] Header Desktop: CRUD пунктов + подменю работает
- [ ] Header Mobile: CRUD пунктов работает
- [ ] Footer: CRUD секций + ссылок работает
- [ ] Footer Legal: CRUD правовых ссылок работает
- [ ] City Nav: CRUD пунктов работает
- [ ] Порядок меняется стрелками/drag-and-drop
- [ ] На публичном сайте меню отображаются корректно (нет регрессий)
