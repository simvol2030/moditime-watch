# Tech-spec: Change-1 — Заполнить фильтры каталога

## Архитектура

### 1. Seed данных (database.ts → seedDatabase)

Добавить в транзакцию seed:

```sql
-- filter_attributes (3 записи)
INSERT INTO filter_attributes (slug, name, type, is_active, position)
VALUES
  ('material', 'Материал корпуса', 'checkbox', 1, 1),
  ('mechanism', 'Механизм', 'checkbox', 1, 2),
  ('scenario', 'Сценарий использования', 'checkbox', 1, 3);

-- filter_values для material (attr_id=1)
INSERT INTO filter_values (attribute_id, value, label, position)
VALUES
  (material_id, 'steel', 'Steel', 1),
  (material_id, 'gold-18k', 'Gold 18K', 2),
  (material_id, 'titanium', 'Titanium', 3),
  (material_id, 'platinum', 'Platinum', 4),
  (material_id, 'ceramic', 'Ceramic', 5);

-- filter_values для mechanism (attr_id=2)
  ('automatic', 'Automatic', 1),
  ('manual', 'Manual', 2),
  ('quartz', 'Quartz', 3);

-- filter_values для scenario (attr_id=3)
  ('investment', 'Investment', 1),
  ('sport', 'Sport', 2),
  ('business', 'Business', 3),
  ('casual', 'Casual', 4),
  ('gift', 'Gift', 5);
```

### 2. Привязка товаров (product_filters)

| Товар | Material | Mechanism | Scenario |
|-------|----------|-----------|----------|
| Rolex Submariner | steel | automatic | sport |
| Patek Nautilus | steel | automatic | investment, business |
| Omega Speedmaster | steel | automatic | sport, casual |

### 3. Queries (database.ts → queries)

Добавить:
```typescript
getFilterAttributes: db.prepare('SELECT * FROM filter_attributes WHERE is_active = 1 ORDER BY position'),
getFilterValues: db.prepare('SELECT * FROM filter_values WHERE attribute_id = ? ORDER BY position'),
getAllFilterValues: db.prepare(`
  SELECT fv.*, fa.slug as attribute_slug, fa.name as attribute_name
  FROM filter_values fv
  JOIN filter_attributes fa ON fa.id = fv.attribute_id
  WHERE fa.is_active = 1
  ORDER BY fa.position, fv.position
`),
```

### 4. Server-side (+page.server.ts)

Заменить хардкод фильтров на загрузку из БД:
- Загрузить filter_attributes + filter_values
- Группировать по attribute_slug
- Передать в filtersContent
- Добавить SQL JOIN для фильтрации по product_filters

### 5. Фильтрация SQL

При выборе фильтра material/mechanism/scenario:
```sql
-- Добавить к WHERE:
AND p.id IN (
  SELECT pf.product_id FROM product_filters pf
  JOIN filter_values fv ON fv.id = pf.filter_value_id
  JOIN filter_attributes fa ON fa.id = fv.attribute_id
  WHERE fa.slug = ? AND fv.value IN (?, ?, ...)
)
```

## Не менять
- Структуру CatalogFilters.svelte (props формат совместим)
- Фильтры brands и availability (уже работают)
- Логику CSP, CSRF, security headers
