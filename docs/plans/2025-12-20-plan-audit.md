# АУДИТ ПЛАНА: Найденные проблемы и исправления

**Дата аудита:** 2025-12-20
**План:** 2025-12-20-full-mvp-implementation.md

---

## КРИТИЧЕСКИЕ ПРОБЛЕМЫ

### 1. Таблица site_config УЖЕ СУЩЕСТВУЕТ

**Проблема:** План предлагает создать `site_settings`, но в schema.sql уже есть `site_config` (строка 17).

**Текущая схема (schema.sql:17-25):**
```sql
CREATE TABLE IF NOT EXISTS site_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Исправление:** Используем существующую таблицу `site_config`. Добавляем только недостающие колонки:
- `category` - для группировки (email, telegram, general)
- `is_sensitive` - для скрытия паролей

**SQL миграция:**
```sql
ALTER TABLE site_config ADD COLUMN category TEXT DEFAULT 'general';
ALTER TABLE site_config ADD COLUMN is_sensitive INTEGER DEFAULT 0;
```

---

### 2. Неправильные названия колонок в filter_attributes

**Проблема:** План использует колонки, которых нет в schema.sql.

**План (НЕПРАВИЛЬНО):**
```sql
INSERT INTO filter_attributes (name, display_name, type, sort_order, is_active) VALUES...
```

**Schema.sql (ПРАВИЛЬНО, строка 383-391):**
```sql
CREATE TABLE IF NOT EXISTS filter_attributes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('checkbox', 'range', 'select')) DEFAULT 'checkbox',
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Исправление:** Использовать правильную схему:
- `slug` - machine name (material, movement)
- `name` - display name (Материал корпуса)
- `position` вместо `sort_order`

---

### 3. Неправильное название таблицы filter_options

**Проблема:** План использует `filter_options`, но в schema.sql таблица называется `filter_values`.

**Schema.sql (строка 396-407):**
```sql
CREATE TABLE IF NOT EXISTS filter_values (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attribute_id INTEGER NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  FOREIGN KEY (attribute_id) REFERENCES filter_attributes(id) ON DELETE CASCADE,
  UNIQUE(attribute_id, value)
);
```

**Исправление:** Заменить `filter_options` на `filter_values` везде в плане.

---

### 4. Seed для фильтров должен использовать правильную схему

**Исправленный seed_filters.sql:**
```sql
-- Атрибуты фильтров (используем ПРАВИЛЬНУЮ схему)
INSERT INTO filter_attributes (slug, name, type, is_active, position) VALUES
('material', 'Материал корпуса', 'checkbox', 1, 1),
('movement', 'Механизм', 'checkbox', 1, 2),
('style', 'Стиль', 'checkbox', 1, 3),
('water_resistance', 'Водозащита', 'checkbox', 1, 4);

-- Значения фильтров (filter_values, НЕ filter_options!)
INSERT INTO filter_values (attribute_id, value, label, position) VALUES
((SELECT id FROM filter_attributes WHERE slug = 'material'), 'steel', 'Сталь', 1),
((SELECT id FROM filter_attributes WHERE slug = 'material'), 'gold', 'Золото', 2),
((SELECT id FROM filter_attributes WHERE slug = 'material'), 'titanium', 'Титан', 3),
((SELECT id FROM filter_attributes WHERE slug = 'material'), 'ceramic', 'Керамика', 4);

INSERT INTO filter_values (attribute_id, value, label, position) VALUES
((SELECT id FROM filter_attributes WHERE slug = 'movement'), 'automatic', 'Автоматический', 1),
((SELECT id FROM filter_attributes WHERE slug = 'movement'), 'manual', 'Ручной завод', 2),
((SELECT id FROM filter_attributes WHERE slug = 'movement'), 'quartz', 'Кварцевый', 3);

INSERT INTO filter_values (attribute_id, value, label, position) VALUES
((SELECT id FROM filter_attributes WHERE slug = 'style'), 'classic', 'Классика', 1),
((SELECT id FROM filter_attributes WHERE slug = 'style'), 'sport', 'Спорт', 2),
((SELECT id FROM filter_attributes WHERE slug = 'style'), 'luxury', 'Люкс', 3),
((SELECT id FROM filter_attributes WHERE slug = 'style'), 'casual', 'Повседневные', 4);
```

---

### 5. База данных уже инициализируется автоматически

**Проблема:** План предполагает ручную инициализацию БД, но database.ts уже делает это автоматически.

**database.ts (строки 237-239):**
```typescript
// INITIALIZE DATABASE BEFORE CREATING QUERIES!
initializeDatabase();
seedDatabase();
```

**Исправление:** Фаза 0.1 сокращается - нужно только:
1. Добавить миграцию для site_config (category, is_sensitive)
2. Добавить seed для настроек email/telegram
3. Добавить seed для filter_values

---

### 6. Sequelize модель SiteConfig уже существует

**Проблема:** План предлагает создать новую модель, но она уже есть в backend-expressjs/src/db.ts.

**db.ts (строки 27-48):**
```typescript
export class SiteConfig extends Model {
  declare id: number;
  declare key: string;
  declare value: string | null;
  declare type: string;
  declare description: string | null;
  // ...
}
```

**Исправление:** Обновить существующую модель, добавив поля category и is_sensitive.

---

### 7. Неправильный JOIN в queries для фильтров

**Проблема в плане:**
```sql
LEFT JOIN filter_options fo ON fo.id = pf.option_id
LEFT JOIN filter_attributes fa ON fa.id = fo.attribute_id
```

**Правильно (по schema.sql):**
```sql
LEFT JOIN filter_values fv ON fv.id = pf.filter_value_id
LEFT JOIN filter_attributes fa ON fa.id = fv.attribute_id
```

---

## СРЕДНИЕ ПРОБЛЕМЫ

### 8. FTS5 триггер не обновляет brand_name

**Проблема:** Триггер UPDATE в schema.sql не обновляет brand_name:
```sql
CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
  UPDATE products_fts SET
    name = NEW.name,
    description = NEW.description
    -- brand_name НЕ обновляется!
  WHERE rowid = NEW.id;
END;
```

**Исправление:** Добавить пересборку FTS при обновлении brand:
```sql
-- Или просто rebuild FTS после импорта:
INSERT INTO products_fts(products_fts) VALUES('rebuild');
```

---

### 9. Отсутствует валидация email формата

**Проблема:** В скрипте импорта нет проверки email формата для уведомлений.

**Исправление:** Добавить валидацию:
```typescript
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

### 10. Импорт статей не проверяет существование города

**Проблема:** Скрипт import-articles.ts вставляет статью даже если city не существует (получит NULL city_id).

**Исправление:** Проверять город перед вставкой:
```typescript
const city = db.prepare('SELECT id FROM cities WHERE slug = ?').get(data.city);
if (!city) {
  console.error(`City not found: ${data.city}`);
  continue;
}
```

---

## НИЗКИЕ ПРОБЛЕМЫ

### 11. Отсутствует index для city_articles.source_file

**Рекомендация:** Добавить индекс для быстрого поиска импортированных файлов:
```sql
CREATE INDEX IF NOT EXISTS idx_city_articles_source ON city_articles(source_file);
```

---

### 12. Нет rollback для частичного импорта товаров

**Проблема:** Если импорт падает на 500-м товаре из 1000, первые 500 уже в БД.

**Исправление:** Использовать транзакцию с try/catch (уже есть в плане, но нужно убедиться что работает).

---

## ИСПРАВЛЕННЫЙ ПОРЯДОК ФАЗ

### Фаза 0: Подготовка (2 часа вместо 3)
- [ ] 0.1 Добавить миграцию site_config (category, is_sensitive) - 30 мин
- [ ] 0.2 Seed настроек email/telegram в site_config - 30 мин
- [ ] 0.3 Seed filter_values для фильтров - 30 мин
- [ ] 0.4 Обновить Sequelize модель SiteConfig - 30 мин

### Фаза 1: Email/Telegram (6 часов) - без изменений
- Использовать site_config вместо site_settings

### Фаза 2: Фильтры (5 часов)
- Использовать filter_values вместо filter_options
- Исправить SQL queries

### Фаза 3-8: Без критических изменений

---

## ЧЕКЛИСТ ПЕРЕД РЕАЛИЗАЦИЕЙ

- [ ] Заменить `site_settings` → `site_config` везде
- [ ] Заменить `filter_options` → `filter_values` везде
- [ ] Исправить колонки: `display_name` → `name`, `sort_order` → `position`
- [ ] Добавить миграцию для site_config
- [ ] Проверить все SQL queries на соответствие schema.sql
- [ ] Добавить валидацию города при импорте статей

---

## ОБНОВЛЁННАЯ ОЦЕНКА ВРЕМЕНИ

| Фаза | Оригинал | После аудита | Примечание |
|------|----------|--------------|------------|
| 0 | 3 ч | 2 ч | БД уже инициализируется |
| 1 | 6 ч | 6 ч | Без изменений |
| 2 | 5 ч | 4 ч | Меньше работы (schema готова) |
| 3 | 2 ч | 2 ч | Без изменений |
| 4 | 8 ч | 8 ч | Без изменений |
| 5 | 3 ч | 3 ч | Без изменений |
| 6 | 12 ч | 12 ч | Без изменений |
| 7 | 6 ч | 6 ч | Без изменений |
| 8 | 3 ч | 3 ч | Без изменений |
| **ИТОГО** | **48 ч** | **46 ч** | Небольшое улучшение |

---

## ВЫВОД

Основные ошибки в плане связаны с несоответствием именования таблиц и колонок между планом и существующей schema.sql. После исправлений план готов к реализации.

**Рекомендация:** Начать с Фазы 0 (миграции) чтобы убедиться что все таблицы соответствуют ожиданиям.
