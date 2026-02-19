# Session-18: Homepage Admin Part 1 — Roadmap

**Дата:** 2026-02-19
**Спецификация:** `spec-final.md`
**ASCII-спека:** `../../ASCII/templates/homepage.admin.md`

---

## Задачи

### Task 1: БД — Таблица homepage_section_config + prepared statements
**Score: 4** (БД + конфиги + 1-2 файла)

Создать таблицу `homepage_section_config` для eyebrow/title/description всех секций главной.
Создать таблицу `homepage_showcase_items` для ручного режима бестселлеров.
Добавить prepared statements в `database.ts`.
Seed-данные из текущих хардкодов.

**Файлы:** `src/lib/server/db/database.ts`

---

### Task 2: Обновить главную — секции читают тексты из БД
**Score: 5** (логика + 4-5 файлов + риск регрессии)

Обновить `+page.server.ts` (главная): загружать `homepage_section_config`.
Обновить компоненты секций: `CollectionsSection`, `ShowcaseSection` — принимать eyebrow/title/description через props.
Убрать хардкод текстов из компонентов.
Проверить что на главной всё отображается как раньше.

**Файлы:** `src/routes/+page.server.ts`, `src/lib/components/sections/CollectionsSection.svelte`, `ShowcaseSection.svelte`

---

### Task 3: Admin — Страница с вкладками + Hero tab
**Score: 8** (бизнес-логика + UI + 3-4 файла + БД)

Переделать `/admin/homepage`:
- Tab bar с навигацией: Hero | Коллекции | Бестселлеры | Сервисы* | Отзывы* | Журнал* | Telegram*
- `*` = неактивные (показать "Coming soon" или disabled)
- URL-параметр `?tab=hero` для переключения
- Hero tab: полная форма с отдельными полями (не JSON):
  - Тексты: tagline, title, description (input/textarea)
  - CTA: primary text+href, secondary text+href+toggle
  - Image: upload с preview + alt + badge (label, title, toggle)
  - Stats: динамический массив [{value, label}] — добавить/удалить
  - Quick Links: массив [{text, href}] — добавить/удалить
  - Brands: чекбоксы из списка brands ИЛИ авто-режим
- Server action `saveHero`: обновление home_hero

**Файлы:** `src/routes/(admin)/admin/homepage/+page.svelte`, `+page.server.ts`

**Важно:** Использовать ASCII-спеку из `ASCII/templates/homepage.admin.md` → Вкладка Hero

---

### Task 4: Admin — Вкладка "Коллекции"
**Score: 9** (CRUD + привязка товаров + UI + 3-4 файла + БД)

Вкладка "Коллекции" в `/admin/homepage`:
- Текстовые настройки секции (eyebrow, title, description) из homepage_section_config
- Список коллекций: таблица с thumbnails, названием, категорией, is_active
- CRUD коллекции: форма slug/category/title/description/image/link_text/link_href/is_active
- Привязка товаров: поиск по имени/SKU → добавление в collection_products → удаление → порядок
- Порядок коллекций: стрелки вверх/вниз (position)
- Server actions: `saveCollectionConfig`, `createCollection`, `updateCollection`, `deleteCollection`, `addProductToCollection`, `removeProductFromCollection`, `reorderCollections`

**Файлы:** `+page.svelte`, `+page.server.ts`

**Важно:** Использовать ASCII-спеку → Вкладка Коллекции

---

### Task 5: Admin — Вкладка "Бестселлеры"
**Score: 7** (логика + UI + 2-3 файла + БД)

Вкладка "Бестселлеры" в `/admin/homepage`:
- Текстовые настройки секции (eyebrow, title) из homepage_section_config
- Настройки ссылки: текст "Вся витрина" + URL (extra_json)
- Переключатель режима: Авто (is_featured) / Ручной (homepage_showcase_items)
- Ручной режим: поиск товаров → добавление → удаление → порядок
- Лимит: макс. 12 товаров
- Server actions: `saveShowcaseConfig`, `addShowcaseItem`, `removeShowcaseItem`, `reorderShowcaseItems`
- Обновить `+page.server.ts` (главная): если ручной режим — читать из homepage_showcase_items

**Файлы:** `+page.svelte`, `+page.server.ts`, `src/routes/+page.server.ts`

**Важно:** Использовать ASCII-спеку → Вкладка Бестселлеры

---

## Порядок выполнения

```
Task 1 (БД: таблицы + queries)
    ↓
Task 2 (Главная: секции из БД)
    ↓
Task 3 (Admin: вкладки + Hero)
    ↓
Task 4 (Admin: Коллекции)
    ↓
Task 5 (Admin: Бестселлеры)
```

**Строго последовательно** — каждая задача зависит от предыдущей.

---

## Существующий код (переиспользовать)

| Модуль | Путь | Статус |
|--------|------|--------|
| Текущая homepage admin | `src/routes/(admin)/admin/homepage/` | Переделать (расширить) |
| Homepage data loading | `src/routes/+page.server.ts` | Расширить |
| Section components | `src/lib/components/sections/*.svelte` | Расширить (props) |
| Image processing | `src/lib/server/media/image-processor.ts` | Использовать as-is |
| Media storage | `src/lib/server/media/storage.ts` | Использовать as-is |
| Database | `src/lib/server/db/database.ts` | Расширить (tables + queries) |

---

*Roadmap Session-18 | 2026-02-19*
