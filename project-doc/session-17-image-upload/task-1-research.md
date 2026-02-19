# Task 1: UI — Раздельные поля CSV и ZIP — Research

## Текущее состояние

### +page.svelte
- Один file input `name="file"` accept=`.csv,.zip`
- Подсказка: "CSV or ZIP file (with CSV + images), max 50MB"
- В preview-форме такой же input `name="file"` (повторный выбор файла)
- При submit отправляется одно поле `file` в FormData

### +page.server.ts
- `formData.get('file')` — получает один файл
- `extractFileContents(file, dataType)` — определяет CSV/ZIP по расширению
- ZIP: извлекает CSV + images вместе через `extractZipImport`
- CSV: просто .text()

## Что нужно изменить

### UI (Svelte)
1. Заменить один input на два:
   - `csv_file` (.csv) — обязательное
   - `images_zip` (.zip) — опциональное, видно только для products
2. Обновить подсказки
3. В import-форме тоже два поля (повторный выбор обоих файлов)
4. Обновить инструкцию в guide

### Server (минимум для Task 1)
- Изменить `formData.get('file')` → `formData.get('csv_file')`
- Добавить `formData.get('images_zip')` (пока игнорировать, обработка в Task 2)
- Обратная совместимость: если `csv_file` не найден, пробовать `file` (fallback)

## Стиль проекта
- Svelte 5 runes ($state, $props)
- Tabs для отступов
- CSS scoped стили
- Компоненты: PageHeader, ActionButton
- Подсказки на русском в guide, labels на английском
