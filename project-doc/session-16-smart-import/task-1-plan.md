# Task 1: CSV Format Detector + Supplier Row Converter — Plan

## Steps

### 1.1 Create `csv-format-detector.ts`
- Define types: `CsvFormat`, `ConversionResult`
- Implement `detectCsvFormat(headers)` — detect by checking header presence
- Implement constants: `GENDER_MAP`, `CATEGORY_NAMES`, `SUPPLIER_HEADERS`
- Implement `makeBrandSlug(brand)` — trim, lowercase, hyphenate
- Implement `buildSpecsJson(row)` — 3 groups, skip `-`/empty, append units
- Implement `convertSupplierRows(rows)` — main conversion function
- Export all public functions and types

### DoD
- [ ] `detectCsvFormat(['slug', 'brand_slug'])` → `'native'`
- [ ] `detectCsvFormat(['Имя', 'Бренд', 'Пол'])` → `'supplier'`
- [ ] `detectCsvFormat(['foo', 'bar'])` → `'unknown'`
- [ ] `makeBrandSlug('Tissot ')` → `'tissot'`
- [ ] `makeBrandSlug('ATOWAK')` → `'atowak'`
- [ ] `convertSupplierRows` produces all required columns (name, brand_slug, sku, price, category_slug, specs_json, main_image, description)
- [ ] specs_json has 3 groups (Корпус, Механизм, Внешний вид)
- [ ] `-` values are skipped in specs
- [ ] Size `"44"` → `"44 мм"`, `"20x20"` → `"20x20 мм"`, `"100м"` → `"100м"` (already has unit)
- [ ] `Фото` value `"17156"` → main_image `"17156.jpg"`
- [ ] `Коллекция` → description: `"Коллекция: Supersport Gent"`
- [ ] brandNames map: `'tissot' → 'Tissot'`
- [ ] categoryNames map: `'mens' → 'Мужские часы'`
- [ ] TypeScript compiles without errors

## Audit Checklist
1. **Completeness:** All 17 supplier columns handled (8 → specs, 5 → direct mapping, 2 → derived, 1 → ignored, 1 → description)
2. **Realism:** Pure functions, no side effects, no DB — straightforward implementation
3. **Dependencies:** None — standalone module

---

*Created: 2026-02-19*
