# Session-19: Homepage Admin Part 2 — Roadmap

**Дата:** 2026-02-19
**Спецификация:** `spec-final.md`
**ASCII-спека:** `../../ASCII/templates/homepage.admin.md`
**Зависит от:** Session-18

---

## Задачи

### Task 1: БД — Таблица homepage_editorial_items + queries
**Score: 3** (БД + 1 файл)

Создать таблицу `homepage_editorial_items` для ручного режима журнала.
Добавить prepared statements: CRUD для testimonials (admin), home_services (расширить), home_service_stats (расширить).
Добавить query поиска articles по названию (для select).

**Файлы:** `src/lib/server/db/database.ts`

---

### Task 2: Обновить главную — оставшиеся секции из БД
**Score: 5** (логика + 4-5 файлов)

Обновить `+page.server.ts` (главная): передавать eyebrow/title/description из `homepage_section_config` в оставшиеся секции.
Обновить компоненты: `ExperienceSection`, `TestimonialsSection`, `EditorialSection`, `TelegramCtaSection` — принимать тексты через props.
Поддержать ручной режим journal: если есть записи в homepage_editorial_items — использовать их.

**Файлы:** `src/routes/+page.server.ts`, `ExperienceSection.svelte`, `TestimonialsSection.svelte`, `EditorialSection.svelte`, `TelegramCtaSection.svelte`

---

### Task 3: Admin — Вкладка "Сервисы"
**Score: 8** (CRUD + UI + 3-4 файла)

Вкладка "Сервисы" в `/admin/homepage?tab=experience`:
- Тексты секции (eyebrow, title, description) + CTA (текст + URL) из extra_json
- Статистика: CRUD home_service_stats [{value, label}], добавить/удалить, стрелки порядка
- Карточки сервисов: CRUD home_services (icon_svg textarea, title, description, link)
- Стрелки порядка для карточек
- Server actions

**Файлы:** `+page.svelte`, `+page.server.ts`

**Важно:** Использовать ASCII-спеку → Вкладка Сервисы

---

### Task 4: Admin — Вкладка "Отзывы"
**Score: 7** (CRUD + image upload + UI + 2-3 файла)

Вкладка "Отзывы" в `/admin/homepage?tab=testimonials`:
- Тексты секции (eyebrow, title, description)
- Список отзывов: таблица с avatar thumb, именем, должностью
- CRUD отзыва: avatar upload (128x128 рек.), name, position (должность), text, choice, is_active
- Стрелки порядка (display_order)
- Server actions: createTestimonial, updateTestimonial, deleteTestimonial, reorder

**Файлы:** `+page.svelte`, `+page.server.ts`

**Важно:** Использовать ASCII-спеку → Вкладка Отзывы

---

### Task 5: Admin — Вкладка "Журнал"
**Score: 6** (логика + UI + 2-3 файла)

Вкладка "Журнал" в `/admin/homepage?tab=editorial`:
- Тексты секции (eyebrow, title)
- Переключатель: авто (is_featured, последние 6) / ручной
- Ручной: поиск статей по названию → добавление в homepage_editorial_items → удаление → порядок
- Лимит: макс. 8 статей
- Примечание: "Статьи создаются в разделе Статьи"
- Server actions

**Файлы:** `+page.svelte`, `+page.server.ts`

---

### Task 6: Admin — Вкладка "Telegram"
**Score: 5** (логика + UI + 2 файла)

Вкладка "Telegram" в `/admin/homepage?tab=telegram`:
- Toggle: показывать секцию (telegram_group_enabled в site_config)
- Тексты: eyebrow, title, description из homepage_section_config
- Фичи (буллеты): массив строк в widgets.data_json, добавить/удалить
- CTA текст + URL канала
- Server action: saveTelegramConfig (обновляет site_config + widgets + homepage_section_config)

**Файлы:** `+page.svelte`, `+page.server.ts`

---

## Порядок выполнения

```
Task 1 (БД: таблица + queries)
    ↓
Task 2 (Главная: секции из БД)
    ↓
Task 3 (Сервисы)  →  Task 4 (Отзывы)  →  Task 5 (Журнал)  →  Task 6 (Telegram)
```

---

## Существующий код

| Модуль | Путь | Статус |
|--------|------|--------|
| Homepage admin (из Session-18) | `src/routes/(admin)/admin/homepage/` | Расширить (добавить 4 вкладки) |
| homepage_section_config (из Session-18) | database.ts | Использовать as-is |
| Section components | `src/lib/components/sections/*.svelte` | Расширить (props) |
| Image processing | `src/lib/server/media/` | Использовать as-is |

---

*Roadmap Session-19 | 2026-02-19*
