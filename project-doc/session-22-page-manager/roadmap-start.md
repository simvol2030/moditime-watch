# Session-22: Page Manager Admin — Roadmap

**Дата:** 2026-02-19
**Спецификация:** `spec-final.md`
**ASCII-спека:** `../../ASCII/admin/page-manager.md`

---

## Задачи

### Task 1: Server load — агрегация данных страниц
**Score: 4** (логика + queries + 1 файл)

Создать server load для `/admin/pages`:
- Фиксированный список единичных страниц (hardcoded с проверкой status)
- Query articles: id, title, slug, status, created_at (с пагинацией)
- Query city_articles: id, title, city slug, status (с пагинацией)
- Подсчёт общего количества для пагинации
- Поддержка фильтра по типу + поиск по названию

**Файлы:** Новый: `src/routes/(admin)/admin/pages/+page.server.ts`

---

### Task 2: UI — Страница Page Manager
**Score: 5** (UI + фильтры + пагинация + 1 файл)

Создать `/admin/pages/+page.svelte`:
- Секция "Единичные страницы": таблица (название, шаблон, URL, статус, [✏️])
- Секция "Контент-страницы": таблица (название, тип, URL, статус, [✏️])
- Поиск: input → обновление URL params → серверная фильтрация
- Фильтр: select (Все / Статьи / Города)
- Пагинация для контент-секции
- Deeplinks: клик [✏️] → goto() в нужный раздел

**Файлы:** Новый: `src/routes/(admin)/admin/pages/+page.svelte`

**Важно:** Следовать ASCII-спеке `ASCII/admin/page-manager.md`

---

### Task 3: Sidebar — ссылка "Страницы"
**Score: 2** (UI + 1 файл)

Добавить в admin sidebar ссылку на `/admin/pages`.

**Файлы:** `src/routes/(admin)/admin/+layout.svelte`

---

## Порядок выполнения

```
Task 1 (Server load)
    ↓
Task 2 (UI страницы)
    ↓
Task 3 (Sidebar)
```

**Строго последовательно.**

---

## Существующий код

| Модуль | Путь | Статус |
|--------|------|--------|
| articles queries | database.ts | ЕСТЬ (использовать) |
| city_articles queries | database.ts | ЕСТЬ (использовать) |
| pages table | database.ts | ЕСТЬ (проверить наличие) |
| Admin layout | `+layout.svelte` | Расширить sidebar |

---

*Roadmap Session-22 | 2026-02-19*
