# Session-3: Import/Export

**Статус:** ⏳ Pending
**Дата:** 2025-01-30
**Источник:** KG003 (KG003-prd-import-export.md)
**Зависит от:** Session-2 (Cities CRUD, City Articles CRUD должны быть готовы)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] CSV parser обрабатывает edge cases (пустые строки, кавычки, unicode)
- [ ] Upsert логика: повторный импорт обновляет, не дублирует

### Проверка в браузере
- [ ] /admin/import — страница открывается, выбор типа данных
- [ ] Upload CSV с 10+ товарами → отчёт: added X, updated Y, errors Z
- [ ] Upload CSV с невалидными данными → ошибки корректно отображаются
- [ ] Upload CSV с дубликатами SKU → UPDATE, не дубликат
- [ ] Импортированные товары видны в /catalog
- [ ] Импортированные бренды видны в /admin/brands
- [ ] Импортированные города видны в /admin/cities
- [ ] Импортированные city articles видны в /city/[city]
- [ ] Export CSV — файл скачивается, открывается в Excel/Sheets
- [ ] Скачивание шаблона — файл корректный
- [ ] FTS5 поиск находит импортированные товары

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | CSV Parser | ⏳ | Medium | Парсинг CSV с валидацией |
| 2 | Products Importer | ⏳ | High | Upsert + images + filters + FTS |
| 3 | Brands/Categories Importer | ⏳ | Low | Upsert по slug |
| 4 | Cities Importer | ⏳ | Low | Upsert по slug, 250+ записей |
| 5 | City Articles Importer | ⏳ | Medium | Upsert по (city_slug, slug), ~10k записей |
| 6 | Filter Values Importer | ⏳ | Low | Upsert атрибутов фильтров |
| 7 | Import UI page | ⏳ | Medium | Единая страница с выбором типа |
| 8 | Export endpoints | ⏳ | Low | CSV download для Products, Brands, Cities |
| 9 | Template downloads | ⏳ | Low | Шаблоны CSV для поставщика |

---

## Задача 1: CSV Parser

**DoD:**
- [ ] Функция parseCSV(text: string) → Record<string, string>[]
- [ ] Обрабатывает: кавычки, запятые внутри кавычек, unicode, BOM
- [ ] Пропускает пустые строки
- [ ] Возвращает массив объектов с ключами из header row

**Файлы:**
- `src/lib/server/import/csv-parser.ts` — новый файл

---

## Задача 2: Products Importer

**DoD:**
- [ ] Функция importProducts(rows) → ImportResult
- [ ] Маппинг: brand_slug → brand_id, category_slug → category_id
- [ ] Upsert по sku: существует → UPDATE, нет → INSERT
- [ ] price в рублях → конвертация в копейки (× 100)
- [ ] specs_json → парсинг + обновление product_filters
- [ ] images → INSERT в product_images (main + gallery)
- [ ] Обновление FTS5 (products_fts) после импорта
- [ ] Автогенерация slug из name если пустой
- [ ] Возврат: { added: N, updated: N, errors: ImportError[] }

**Файлы:**
- `src/lib/server/import/product-importer.ts` — новый файл
- `src/lib/server/db/database.ts` — новые prepared statements

---

## Задача 3: Brands/Categories Importer

**DoD:**
- [ ] importBrands(rows) — upsert по slug
- [ ] importCategories(rows) — upsert по slug, parent_slug → parent_id
- [ ] Возврат ImportResult

**Файлы:**
- `src/lib/server/import/brand-importer.ts`
- `src/lib/server/import/category-importer.ts`

---

## Задача 4: Cities Importer

**DoD:**
- [ ] importCities(rows) — upsert по slug
- [ ] Все поля: name, падежи, region, population, delivery_days, delivery_price
- [ ] 250+ записей за один импорт

**Файлы:**
- `src/lib/server/import/city-importer.ts`

---

## Задача 5: City Articles Importer

**DoD:**
- [ ] importCityArticles(rows) — upsert по (city_slug → city_id, slug)
- [ ] city_slug → city_id через поиск (ошибка если город не найден)
- [ ] ~10,000 записей за один импорт (batch INSERT)
- [ ] Обновление FTS5 (если есть city_articles_fts)

**Файлы:**
- `src/lib/server/import/city-article-importer.ts`

---

## Задача 6: Filter Values Importer

**DoD:**
- [ ] importFilters(rows) — upsert filter_values по (attribute_slug, value_slug)
- [ ] attribute_slug → filter_attributes.id
- [ ] Связывание с товарами через отдельный CSV или автоматически из specs_json

**Файлы:**
- `src/lib/server/import/filter-importer.ts`

---

## Задача 7: Import UI page

**DoD:**
- [ ] /admin/import — единая страница
- [ ] Select тип данных: Products, Brands, Categories, Cities, City Articles, Filters
- [ ] File upload (CSV, max 10MB)
- [ ] Preview: первые 5 строк таблицей перед импортом
- [ ] Кнопка "Validate" → проверка без записи
- [ ] Кнопка "Import" → выполнение с прогрессом
- [ ] Отчёт: added, updated, errors с деталями
- [ ] Sidebar: ссылка в секции System или E-commerce

**Файлы:**
- `src/routes/(admin)/admin/import/+page.server.ts`
- `src/routes/(admin)/admin/import/+page.svelte`

---

## Задача 8: Export endpoints

**DoD:**
- [ ] GET /admin/export/products → CSV файл со всеми товарами
- [ ] GET /admin/export/brands → CSV файл
- [ ] GET /admin/export/cities → CSV файл
- [ ] Формат совместим с Import (round-trip)
- [ ] Кнопки "Export CSV" на соответствующих страницах списков

**Файлы:**
- `src/routes/(admin)/admin/export/products/+server.ts`
- `src/routes/(admin)/admin/export/brands/+server.ts`
- `src/routes/(admin)/admin/export/cities/+server.ts`

---

## Задача 9: Template downloads

**DoD:**
- [ ] /admin/import — кнопка "Скачать шаблон" для каждого типа
- [ ] Шаблон содержит header + 2-3 примера заполненных строк
- [ ] Формат: UTF-8 CSV с BOM для корректного открытия в Excel

**Файлы:**
- `src/routes/(admin)/admin/import/templates/[type]/+server.ts`

---

*Создано: 2025-01-30*
