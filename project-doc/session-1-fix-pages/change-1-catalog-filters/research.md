# Research: Change-1 — Заполнить фильтры каталога

## Текущее состояние

### Schema (schema.sql)
Таблицы уже существуют:
- `filter_attributes` — типы фильтров (slug, name, type: checkbox/range/select)
- `filter_values` — значения фильтров (attribute_id, value, label)
- `product_filters` — M2M связь товаров с filter_values

### Seed (database.ts)
- **НЕ заполняются:** filter_attributes, filter_values, product_filters
- Существуют 3 товара: Rolex Submariner (id=1), Patek Nautilus (id=2), Omega Speedmaster (id=3)
- Существуют 3 бренда: Rolex, Patek Philippe, Omega

### Каталог (+page.server.ts)
- Фильтры materials, mechanisms, scenarios — **ЗАХАРДКОЖЕНЫ**
- Фильтры brands и availability — подключены к БД
- Фильтрация по materials/mechanisms/scenarios **не работает** (нет SQL для них)

### CatalogFilters.svelte
- Принимает `filters` prop с 6 категориями
- Каждая категория: массив `{value, label, checked}` options
- Materials, mechanisms, scenarios отображаются но не функционируют

## Ключевые файлы для изменения
1. `frontend-sveltekit/src/lib/server/db/database.ts` — seed + queries
2. `frontend-sveltekit/src/routes/catalog/+page.server.ts` — загрузка фильтров из БД

## Паттерны кода
- Именование: camelCase для переменных, snake_case для БД полей
- Queries: `db.prepare('SQL')` — prepared statements
- Seed: внутри `db.transaction(() => { ... })`
- Фильтры: `{value: string, label: string, checked: boolean}[]`

## Требования из DoD
- filter_values для material: Steel, Gold 18K, Titanium, Platinum, Ceramic
- filter_values для mechanism: Automatic, Manual, Quartz
- filter_values для scenario: Investment, Sport, Business, Casual, Gift
- product_filters: 3 товара привязаны
- /catalog — все 5 фильтров показывают значения
- Выбор фильтра → товары фильтруются
