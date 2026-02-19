# Session-17: Image Upload при импорте — Roadmap

**Дата:** 2026-02-19
**Спецификация:** `spec-final.md`

---

## Задачи

### Task 1: UI — Раздельные поля CSV и ZIP
**Score: 5** (CSS/UI + 2-3 файла + компоненты)

Обновить `+page.svelte`:
- Разделить один file input на два: CSV (`.csv`) и ZIP (`.zip`)
- ZIP поле опциональное, появляется рядом с CSV
- При выборе ZIP показать кол-во файлов (если возможно)
- Обновить подсказки и инструкцию
- Preview: показать иконку фото рядом с товарами, для которых нашлось изображение в ZIP

**Файлы:** `+page.svelte`

---

### Task 2: Серверная обработка двух файлов
**Score: 8** (бизнес-логика + 3-4 файла + API)

Обновить `+page.server.ts`:
- `preview` action: принять два FormData поля (`csv_file` + `images_zip`)
- Если ZIP есть — извлечь через `extractZipImport` (только images, без CSV)
- Нужна новая функция `extractZipImages(buffer)` в `zip-handler.ts` — как `extractZipImport` но без CSV
- Связать imageMap с preview строками — добавить пометку "has image" для каждой строки
- `import` action: то же самое + применить `resolveImageReferences`
- Вернуть статистику `imagesProcessed`, `imagesMatched`

**Файлы:** `+page.server.ts`, `zip-handler.ts`

---

### Task 3: Множественные фото через `;` разделитель
**Score: 6** (бизнес-логика + 2-3 файла)

Обновить `csv-format-detector.ts`:
- Колонка `Фото`: если содержит `;`, разделить — первый → `main_image`, остальные → `gallery_images` (через `|`)
- Пример: `17503;17504;17505` → main=`17503.jpg`, gallery=`17504.jpg|17505.jpg`

Обновить `zip-handler.ts`:
- В `fuzzyImageMatch`: поддержка суффиксов `_2`, `_3`, `_02`, `_03`
- При наличии `17503.jpg` + `17503_2.jpg` + `17503_3.jpg` → автоматически собрать gallery
- Новая функция `resolveGalleryFromZip(sku, imageMap)` → найти все `sku_N.*` файлы

**Файлы:** `csv-format-detector.ts`, `zip-handler.ts`

---

### Task 4: Режим "Только ZIP" — обновление фото существующих товаров
**Score: 8** (бизнес-логика + БД + 3-4 файла + риск)

Новый режим когда загружен только ZIP без CSV:
- Извлечь все изображения из ZIP
- Для каждого файла найти товар по имени файла:
  - `T035.617.11.051.00.jpg` → поиск по SKU
  - `chasy-tissot-xyz.jpg` → поиск по slug
  - `17503.jpg` → поиск по текущему main_image
- Показать preview: какие товары получат фото, какие не сопоставились
- При импорте: обновить `main_image` и `gallery_images` в product_images
- Обработать суффиксы для gallery (`_2`, `_3`)

**Файлы:** `+page.server.ts`, `zip-handler.ts`, новый `image-updater.ts`

---

### Task 5: Serving изображений (media endpoint)
**Score: 4** (конфиг + endpoint + 2 файла)

Проверить/добавить:
- SvelteKit endpoint `GET /media/images/[...path]` для отдачи WebP файлов из `data/media/images/`
- Правильные заголовки `Content-Type: image/webp`, `Cache-Control`
- На production: nginx location `/media/images/` → `/opt/websites/moditime-watch.ru/repo/data/media/images/`
- Fallback: placeholder image если файл не найден

**Файлы:** `src/routes/media/[...path]/+server.ts` (новый), nginx config

---

### Task 6: Интеграция с product_images таблицей
**Score: 6** (БД + бизнес-логика + 2-3 файла)

Сейчас `main_image` хранится как текст в products. Нужно:
- При импорте с изображениями: сохранять обработанное фото через `saveMedia()`
- Записать URL в `product_images` таблицу (не только в `products.main_image`)
- Gallery images → несколько записей в `product_images` с правильным position
- Обновить `product-importer.ts` для обработки media URLs

**Файлы:** `product-importer.ts`, `zip-handler.ts`

---

## Порядок выполнения

```
Task 5 (media endpoint)  ─────────────────────┐
Task 1 (UI разделение полей)  ─────────┐      │
Task 3 (множественные фото в `;`)  ────┤      │
                                       ▼      ▼
Task 2 (серверная обработка двух файлов) ◄─────┘
Task 6 (интеграция product_images)  ────┘
                                       ▼
Task 4 (режим "только ZIP")
```

**Рекомендуемый порядок:** 5 → 1 → 3 → 2 → 6 → 4

---

## Существующий код (переиспользовать)

| Модуль | Путь | Статус |
|--------|------|--------|
| image-processor.ts | `src/lib/server/media/image-processor.ts` | Готов (sharp → WebP) |
| storage.ts | `src/lib/server/media/storage.ts` | Готов (saveMedia, readMedia) |
| zip-handler.ts | `src/lib/server/import/zip-handler.ts` | Расширить (extractZipImages, gallery) |
| csv-format-detector.ts | `src/lib/server/import/csv-format-detector.ts` | Расширить (`;` разделитель фото) |
| product-importer.ts | `src/lib/server/import/product-importer.ts` | Расширить (media URLs) |

---

*Roadmap Session-17 | 2026-02-19*
