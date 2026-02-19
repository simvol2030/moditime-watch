# Session-21: Menu Manager Admin — Roadmap

**Дата:** 2026-02-19
**Спецификация:** `spec-final.md`
**ASCII-спека:** `../../ASCII/admin/menu-manager.md`

---

## Задачи

### Task 1: БД — Prepared statements для меню
**Score: 3** (БД + 1 файл)

Добавить/расширить prepared statements:
- CRUD для `navigation_items` (фильтр по `menu`: header_desktop, header_mobile)
- CRUD для `footer_sections` + reorder
- CRUD для `footer_links` (по `section_id`) + reorder
- Проверить/создать `city_nav_items` — CRUD + reorder

**Файлы:** `src/lib/server/db/database.ts`

---

### Task 2: Admin — Страница списка меню
**Score: 4** (UI + server load + 2 файла)

Создать `/admin/menus`:
- Server load: загрузить все меню с подсчётом пунктов
- Таблица: название, идентификатор, количество пунктов, [✏️ Редактировать]
- Клик → `?menu=header_desktop` (или другое)

**Файлы:** Новые: `src/routes/(admin)/admin/menus/+page.svelte`, `+page.server.ts`

---

### Task 3: Редактор Header меню (Desktop + Mobile)
**Score: 7** (CRUD + подменю + UI + 2 файла)

Редактор для `header_desktop` и `header_mobile`:
- Дерево пунктов (с вложенностью через parent_id)
- Inline-редактирование или модальное окно: label, URL, target
- Добавление: пункт верхнего уровня + подпункт
- Удаление с подтверждением
- Стрелки вверх/вниз для порядка
- Server actions: create/update/delete/reorder

**Файлы:** `+page.svelte`, `+page.server.ts`

**Важно:** Следовать ASCII-спеке `ASCII/admin/menu-manager.md` → Редактор Header Menu

---

### Task 4: Редактор Footer меню
**Score: 6** (CRUD двух уровней + UI + 2 файла)

Редактор для `footer` (секции + ссылки):
- Список секций: title, порядок, стрелки, [✏️] [−]
- Внутри секции: список ссылок — label, url, порядок, [✏️] [−]
- Добавление секции + добавление ссылки в секцию
- Server actions: CRUD секций + CRUD ссылок + reorder

Редактор для `footer_legal`:
- Плоский список ссылок (label, url, порядок)
- CRUD + reorder

**Файлы:** `+page.svelte`, `+page.server.ts`

---

### Task 5: Редактор City навигации
**Score: 3** (CRUD + UI + 2 файла)

Редактор для `city_nav`:
- Плоский список: label, url, порядок
- CRUD + стрелки порядка
- Server actions

**Файлы:** `+page.svelte`, `+page.server.ts`

---

### Task 6: Sidebar — ссылка "Меню"
**Score: 2** (UI + 1 файл)

Добавить в admin sidebar ссылку на `/admin/menus`.

**Файлы:** `src/routes/(admin)/admin/+layout.svelte`

---

## Порядок выполнения

```
Task 1 (БД: prepared statements)
    ↓
Task 2 (Страница списка меню)
    ↓
Task 3 (Header menus)  ─┐
Task 4 (Footer menus)   ├── параллельно
Task 5 (City nav)       ─┘
    ↓
Task 6 (Sidebar)
```

---

## Существующий код

| Модуль | Путь | Статус |
|--------|------|--------|
| navigation_items | database.ts | ЕСТЬ (расширить queries) |
| footer_sections + footer_links | database.ts | ЕСТЬ (расширить queries) |
| city_nav_items | database.ts | Проверить наличие |
| Header компоненты | `src/lib/components/layout/` | Использовать as-is (только данные) |
| Footer компоненты | `src/lib/components/layout/` | Использовать as-is (только данные) |

---

*Roadmap Session-21 | 2026-02-19*
