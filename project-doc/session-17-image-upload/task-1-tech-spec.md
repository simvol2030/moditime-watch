# Task 1: UI — Раздельные поля CSV и ZIP — Tech Spec

## Изменения

### +page.svelte

**Preview form (step 2):**
```
Upload section:
  ┌──────────────────────────────────────┐
  │ CSV File (.csv)        [required]    │
  │ ┌──────────────────────────────────┐ │
  │ │ file input: csv_file             │ │
  │ └──────────────────────────────────┘ │
  │ hint: "CSV файл (наш формат или от  │
  │ поставщика). UTF-8."                 │
  ├──────────────────────────────────────┤
  │ ZIP with Images (.zip) [optional]    │  ← только если selectedType === 'products'
  │ ┌──────────────────────────────────┐ │
  │ │ file input: images_zip           │ │
  │ └──────────────────────────────────┘ │
  │ hint: "Архив с фото товаров.         │
  │ Связь по ID/артикулу из CSV."        │
  └──────────────────────────────────────┘
```

**Import form (step 3):**
Тоже два поля — повторный выбор обоих файлов.

**Preview info:**
Если есть imagesInfo от сервера — показать "N images found in ZIP".

### +page.server.ts (минимальные изменения)

```typescript
// Preview:
const csvFile = formData.get('csv_file') as File | null || formData.get('file') as File | null;
const imagesZip = formData.get('images_zip') as File | null;

// Import:
const csvFile = formData.get('csv_file') as File | null || formData.get('file') as File | null;
const imagesZip = formData.get('images_zip') as File | null;
```

Основная обработка ZIP будет в Task 2. В Task 1 — только принять поля.
