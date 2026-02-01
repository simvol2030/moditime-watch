# Plan: Change-1 — Заполнить фильтры каталога

## Задачи

### Task 1: Seed filter_attributes и filter_values
**Файл:** `database.ts` → `seedDatabase()`
**Действие:** Добавить INSERT для 3 атрибутов + 13 значений
**DoD:** Таблицы заполнены после seed

### Task 2: Seed product_filters
**Файл:** `database.ts` → `seedDatabase()`
**Действие:** Привязать 3 товара к filter_values
**DoD:** Каждый товар имеет min 2 фильтра

### Task 3: Добавить queries для фильтров
**Файл:** `database.ts` → `queries`
**Действие:** Добавить getFilterAttributes, getFilterValues, getAllFilterValues
**DoD:** Queries возвращают данные

### Task 4: Загрузка фильтров из БД в каталоге
**Файл:** `+page.server.ts`
**Действие:** Заменить хардкод materials/mechanisms/scenarios на данные из БД
**DoD:** filtersContent содержит реальные данные из БД

### Task 5: SQL фильтрация по динамическим фильтрам
**Файл:** `+page.server.ts`
**Действие:** Добавить JOIN/subquery для фильтрации по product_filters
**DoD:** Выбор фильтра "Material: Steel" → показывает только подходящие товары

## Порядок: 1 → 2 → 3 → 4 → 5

## Аудит плана

### Полнота
- [x] Все 5 типов фильтров покрыты (material, mechanism, scenario + brand, availability)
- [x] 3 товара привязаны к фильтрам
- [x] SQL фильтрация реализована
- [x] UI не требует изменений (формат данных совместим)

### Реалистичность
- [x] DoD каждой задачи достижимы
- [x] Изменения минимальны — 2 файла

### Зависимости
- [x] Task 3 зависит от Task 1 (нужны данные для query)
- [x] Task 4 зависит от Task 3 (нужны queries)
- [x] Task 5 зависит от Task 4 (нужна загрузка)
