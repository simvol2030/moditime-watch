# Task 1: CSV Format Detector + Supplier Row Converter — Research

## Existing Infrastructure

### CSV Parser (`csv-parser.ts`)
- RFC 4180 compliant, handles quoted fields, BOM, CRLF/LF
- `parseCSV(text)` → `{ rows: Record<string, string>[], headers: string[], totalLines }`
- `generateCSV(headers, rows)` → CSV string with BOM
- **NOT modifying** — works correctly

### Product Importer (`product-importer.ts`)
- Expects columns: `slug, brand_slug, category_slug, name, sku, price, specs_json, ...`
- Brand resolution: looks up by `brand_slug` (required, errors if not found)
- Category resolution: looks up by `category_slug` (optional, errors if not found)
- Price: input in rubles → stored in kopecks (`Math.round(priceRub * 100)`)
- Slug: auto-generates from `name` via Cyrillic transliteration if not provided
- Upsert: by SKU (primary) or slug (fallback)
- FTS5 rebuild after import (drops triggers, imports, rebuilds)

### Import Pipeline (`+page.server.ts`)
- `preview` action: extract file → parseCSV → return first 5 rows
- `import` action: extract file → parseCSV → cascade brands/categories → resolve images → call importer
- Cascade mode: auto-creates brands/categories from slugs (product import only)
- Cascade brand naming: `slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())`

### Templates (`templates/[type]/+server.ts`)
- 6 templates defined (products, brands, categories, cities, city_articles, filters)
- Uses `generateCSV(template.headers, template.examples)` → download response

## Test Data Analysis

**File:** `test-data-supplier.csv` (170 rows, 17 columns)

**Headers (exact):**
```
id товара,Имя,Бренд,Артикул (Ref),Цена,Фото,Коллекция,Пол,Размер (мм),"Толщ, (мм)",Мех-м,Калибр,Запас хода,Водозащита,Корпус,Ремешок/Браслет,Циферблат
```

**Key observations:**
1. `"Толщ, (мм)"` — header contains comma, wrapped in quotes in CSV
2. `Бренд` — values have trailing space: `"Tissot "` → needs trim
3. `Имя` — may contain commas, wrapped in quotes
4. `Цена` — already in RUB, whole numbers
5. `Фото` — numeric ID (same as `id товара`)
6. `Размер (мм)` — can be: `44`, `20x20`, `47,5` (decimal with comma)
7. `Толщ, (мм)` — can be: `10`, `10,5` (decimal with comma)
8. `Запас хода` — `-` means none, otherwise `42`, `48 часов`, etc.
9. `Мех-м` — abbreviations: `Кварц`, `Авто`, `Механ`, `Механ.рук`, `Механ.авто`
10. `Пол` — `Мужские`, `Женские`, `Унисекс`
11. Brands: Tissot (~168), ATOWAK (2-3)

## Integration Points

1. New file `csv-format-detector.ts` will be imported into `+page.server.ts`
2. In `preview` action: after `parseCSV()`, call `detectCsvFormat(headers)` then `convertSupplierRows(rows)` if supplier
3. In `import` action: same detect → convert, then pass converted rows to existing `importProducts()`
4. Cascade mode should be auto-enabled for supplier format (brands/categories auto-create)
5. Brand auto-create should use original name from `Бренд` column (not slug-to-name conversion)

## Key Design Decisions

1. **Conversion happens once**, before preview/import — converted rows look like native format
2. **specs_json format** matches existing: `{ "GroupName": [{ "label": "...", "value": "..." }] }`
3. **Price** is already in rubles — no conversion needed (product-importer multiplies by 100)
4. **Slug generation** — reuse existing `generateSlug()` from product-importer? No, it's not exported. Create brand_slug logic in converter (simple: trim → toLowerCase → replace spaces with `-`)
5. **category_slug** mapping is fixed: `Мужские→mens`, `Женские→womens`, `Унисекс→unisex`

---

*Created: 2026-02-19*
