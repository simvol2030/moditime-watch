# Session-15: Import/Export v2 — Roadmap

**Статус:** PENDING
**Дата:** 2025-02-04
**Зависит от:** Session-3 (базовый import/export — уже реализован)

---

## Обзор

Доработка системы import/export до полноценного round-trip с поддержкой:
- File upload изображений во всех формах админки
- Автоматическая конвертация в WebP (sharp)
- Экспорт всех 6 сущностей (добавить Categories, Filters, City Articles)
- Импорт CSV + ZIP архив с изображениями
- Каскадный импорт (auto-create brands/categories)
- CRUD для управления фильтрами

---

## Задачи

| # | Задача | Блок | Сложность | DoD |
|---|--------|------|-----------|-----|
| 1 | Image processing: sharp + WebP pipeline | Блок 1 | High | Установить sharp, создать image-processor.ts |
| 2 | Media serving endpoint | Блок 1 | Medium | GET /media/[...path] отдаёт файлы из data/media/ |
| 3 | Upload API endpoint | Блок 1 | Medium | POST /admin/api/upload — multipart, WebP конвертация |
| 4 | ImageUpload компонент | Блок 2 | High | File upload + URL input + preview + drag-drop |
| 5 | ImageGalleryUpload компонент | Блок 2 | High | Multiple images, main + gallery, reorder |
| 6 | Интеграция изображений в Products | Блок 2 | High | create/edit формы + product_images queries |
| 7 | Интеграция изображений в Brands, Categories, Cities | Блок 2 | Medium | Заменить URL-поля на ImageUpload |
| 8 | Экспорт Categories | Блок 3 | Low | /admin/export/categories endpoint |
| 9 | Экспорт Filters | Блок 3 | Low | /admin/export/filters endpoint |
| 10 | Экспорт City Articles | Блок 3 | Low | /admin/export/city-articles endpoint |
| 11 | ZIP processing для импорта | Блок 4 | Medium | Распаковка ZIP, маппинг файлов |
| 12 | Обновить UI импорта (CSV + ZIP) | Блок 4 | Medium | Два поля загрузки, preview |
| 13 | Обновить импортеры: обработка изображений из ZIP | Блок 4 | High | Все 6 импортеров: filename → ZIP → WebP → save |
| 14 | Каскадный импорт: auto-create brands/categories | Блок 4 | Medium | product-importer + category-importer доработка |
| 15 | Filters CRUD: страницы админки | Блок 5 | High | Список, создание, редактирование атрибутов + значений |
| 16 | Filters: sidebar навигация + queries | Блок 5 | Low | Добавить в layout + database.ts |

---

## Порядок выполнения

```
Задача 1 (sharp + image-processor) ← фундамент
    ↓
Задачи 2, 3 (media serving + upload API) ← зависят от 1
    ↓
Задачи 4, 5 (компоненты ImageUpload) ← зависят от 3
    ↓
Задачи 6, 7 (интеграция в формы) ← зависят от 4, 5
    ↓
Задачи 8, 9, 10 (экспорты) ← независимые
    ↓
Задачи 11, 12 (ZIP + UI) ← зависят от 1
    ↓
Задачи 13, 14 (обновление импортеров) ← зависят от 11
    ↓
Задачи 15, 16 (Filters CRUD) ← независимые
```

---

## Задача 1: Image processing — sharp + WebP pipeline

**DoD:**
- [ ] `npm install sharp` в frontend-sveltekit
- [ ] Создать `src/lib/server/media/image-processor.ts`
- [ ] Функция `processImage(buffer: Buffer, options?)` → `{ main: Buffer, thumbnail: Buffer }`
- [ ] WebP конвертация, качество 85
- [ ] Ресайз: max 1920px длинная сторона (main), 400px (thumbnail)
- [ ] Удаление EXIF метаданных
- [ ] Функция `saveImage(buffer, entity, slug, index?)` → `{ url, thumbnailUrl }`
- [ ] Сохранение в `data/media/images/{entity}/{slug}[-{index}].webp`
- [ ] Функция `deleteImage(url)` — удаление файла с диска

**Файлы:**
- `src/lib/server/media/image-processor.ts` — новый

---

## Задача 2: Media serving endpoint

**DoD:**
- [ ] GET `/media/[...path]` — отдаёт файлы из `data/media/`
- [ ] Content-Type определяется по расширению
- [ ] Cache-Control: public, max-age=31536000, immutable
- [ ] 404 если файл не найден
- [ ] Защита от path traversal (../../../etc/passwd)

**Файлы:**
- `src/routes/media/[...path]/+server.ts` — новый

---

## Задача 3: Upload API endpoint

**DoD:**
- [ ] POST `/admin/api/upload` — multipart/form-data
- [ ] Принимает: file (обязательное), entity, slug, index
- [ ] Валидация: формат (jpg/png/webp), размер (max 10MB)
- [ ] Обработка через image-processor (задача 1)
- [ ] Сохранение на диск
- [ ] Возвращает: `{ url, thumbnailUrl, width, height, size }`
- [ ] Требует admin-аутентификации

**Файлы:**
- `src/routes/(admin)/admin/api/upload/+server.ts` — новый

---

## Задача 4: ImageUpload компонент

**DoD:**
- [ ] Компонент `ImageUpload.svelte`
- [ ] Props: `value` (текущий URL), `entity`, `slug`, `onchange`
- [ ] Режимы: file upload (приоритетный) / URL ввод (переключатель)
- [ ] File: кнопка + drag-and-drop зона
- [ ] Preview загруженного изображения
- [ ] Progress bar при загрузке
- [ ] Кнопка удаления
- [ ] Валидация: формат, размер на клиенте

**Файлы:**
- `src/lib/components/admin/ImageUpload.svelte` — новый

---

## Задача 5: ImageGalleryUpload компонент

**DoD:**
- [ ] Компонент `ImageGalleryUpload.svelte`
- [ ] Props: `mainImage`, `galleryImages[]`, `entity`, `slug`
- [ ] Отдельная зона для main image
- [ ] Множественная загрузка для gallery
- [ ] Переупорядочивание галереи (drag или кнопки up/down)
- [ ] Удаление отдельных изображений

**Файлы:**
- `src/lib/components/admin/ImageGalleryUpload.svelte` — новый

---

## Задача 6: Интеграция изображений в Products

**DoD:**
- [ ] `/admin/products/new/` — секция Images с ImageGalleryUpload
- [ ] `/admin/products/[id]/` — секция Images с текущими изображениями + управление
- [ ] +page.server.ts: обработка image URLs при create/update
- [ ] INSERT/UPDATE/DELETE в product_images при сохранении
- [ ] Queries в database.ts: `adminInsertProductImage`, `adminDeleteProductImage`, `adminDeleteAllProductImages`

**Файлы:**
- `src/routes/(admin)/admin/products/new/+page.svelte` — обновить
- `src/routes/(admin)/admin/products/new/+page.server.ts` — обновить
- `src/routes/(admin)/admin/products/[id]/+page.svelte` — обновить
- `src/routes/(admin)/admin/products/[id]/+page.server.ts` — обновить
- `src/lib/server/db/database.ts` — добавить queries

---

## Задача 7: Интеграция изображений в Brands, Categories, Cities

**DoD:**
- [ ] Brands: заменить `<FormField type="url" name="logo_url">` на `<ImageUpload>`
- [ ] Categories: заменить `<FormField type="url" name="image_url">` на `<ImageUpload>`
- [ ] Cities: заменить `<FormField type="url" name="hero_image_url">` на `<ImageUpload>`
- [ ] +page.server.ts каждой сущности: обработка URL из ImageUpload
- [ ] При file upload — URL уже готов (задача 3), просто сохранить в БД
- [ ] При URL вводе — сохранить как есть (обратная совместимость)

**Файлы:**
- `src/routes/(admin)/admin/brands/new/+page.svelte` — обновить
- `src/routes/(admin)/admin/brands/[id]/+page.svelte` — обновить
- `src/routes/(admin)/admin/categories/new/+page.svelte` — обновить
- `src/routes/(admin)/admin/categories/[id]/+page.svelte` — обновить
- `src/routes/(admin)/admin/cities/new/+page.svelte` — обновить
- `src/routes/(admin)/admin/cities/[id]/+page.svelte` — обновить

---

## Задача 8: Экспорт Categories

**DoD:**
- [ ] GET `/admin/export/categories` → CSV файл
- [ ] Поля: slug, name, description, parent_slug, image_url, is_active, position
- [ ] parent_slug через LEFT JOIN на categories AS parent
- [ ] ORDER BY position
- [ ] UTF-8 с BOM для Excel

**Файлы:**
- `src/routes/(admin)/admin/export/categories/+server.ts` — новый

---

## Задача 9: Экспорт Filters

**DoD:**
- [ ] GET `/admin/export/filters` → CSV файл
- [ ] Поля: attribute_slug, attribute_name, attribute_type, attribute_position, value, label, position
- [ ] JOIN filter_values + filter_attributes
- [ ] ORDER BY attribute_position, position

**Файлы:**
- `src/routes/(admin)/admin/export/filters/+server.ts` — новый

---

## Задача 10: Экспорт City Articles

**DoD:**
- [ ] GET `/admin/export/city-articles` → CSV файл
- [ ] Поля: city_slug, slug, title, excerpt, content, image_url, template_type, is_published
- [ ] city_slug через JOIN на cities
- [ ] ORDER BY city_slug, slug

**Файлы:**
- `src/routes/(admin)/admin/export/city-articles/+server.ts` — новый

---

## Задача 11: ZIP processing для импорта

**DoD:**
- [ ] Установить зависимость для ZIP (jszip или adm-zip)
- [ ] Создать `src/lib/server/import/zip-processor.ts`
- [ ] Функция `extractImages(zipBuffer)` → `Map<filename, Buffer>`
- [ ] Валидация: только изображения (jpg/png/webp), max 50MB архив
- [ ] Очистка temp-данных после обработки

**Файлы:**
- `src/lib/server/import/zip-processor.ts` — новый

---

## Задача 12: Обновить UI импорта (CSV + ZIP)

**DoD:**
- [ ] Второе поле загрузки файла: "ZIP архив с изображениями (опционально)"
- [ ] Подсказка для пользователя: как подготовить файлы
- [ ] При preview — показать статистику: "Найдено N изображений в ZIP"
- [ ] Увеличить лимит размера файлов: CSV 10MB, ZIP 50MB
- [ ] form enctype="multipart/form-data"

**Файлы:**
- `src/routes/(admin)/admin/import/+page.svelte` — обновить
- `src/routes/(admin)/admin/import/+page.server.ts` — обновить

---

## Задача 13: Обновить импортеры — обработка изображений из ZIP

**DoD:**
- [ ] Все импортеры получают опциональный `imageMap: Map<filename, Buffer>`
- [ ] Логика определения источника изображения:
  - Если значение начинается с `http://` или `https://` → внешний URL, оставить как есть
  - Если начинается с `/media/` → уже локальный, оставить как есть
  - Иначе → имя файла, искать в imageMap → если найден: sharp → WebP → сохранить → подставить URL
- [ ] product-importer: main_image + gallery_images (pipe-separated)
- [ ] brand-importer: logo_url
- [ ] category-importer: image_url
- [ ] city-importer: hero_image_url
- [ ] city-article-importer: image_url

**Файлы:**
- `src/lib/server/import/product-importer.ts` — обновить
- `src/lib/server/import/brand-importer.ts` — обновить
- `src/lib/server/import/category-importer.ts` — обновить
- `src/lib/server/import/city-importer.ts` — обновить
- `src/lib/server/import/city-article-importer.ts` — обновить

---

## Задача 14: Каскадный импорт — auto-create brands/categories

**DoD:**
- [ ] product-importer: если brand_slug не найден → создать бренд (slug, name = capitalize slug)
- [ ] product-importer: если category_slug не найден → создать категорию (slug, name = capitalize slug)
- [ ] category-importer: двухпроходный импорт (root → children) или сортировка строк
- [ ] ImportResult добавить поле: `autoCreated: { brands: string[], categories: string[] }`
- [ ] В UI показать информацию об автосозданных записях

**Файлы:**
- `src/lib/server/import/product-importer.ts` — обновить
- `src/lib/server/import/category-importer.ts` — обновить

---

## Задача 15: Filters CRUD — страницы админки

**DoD:**
- [ ] `/admin/filters` — список атрибутов с раскрывающимися значениями
- [ ] `/admin/filters/new` — создание атрибута (name, slug, type, position)
- [ ] `/admin/filters/[id]` — редактирование атрибута + таблица значений
- [ ] Inline добавление значений (value, label, position)
- [ ] Удаление атрибутов (с CASCADE на values)
- [ ] Удаление отдельных значений
- [ ] Переупорядочивание атрибутов и значений

**Файлы:**
- `src/routes/(admin)/admin/filters/+page.svelte` — новый
- `src/routes/(admin)/admin/filters/+page.server.ts` — новый
- `src/routes/(admin)/admin/filters/new/+page.svelte` — новый
- `src/routes/(admin)/admin/filters/new/+page.server.ts` — новый
- `src/routes/(admin)/admin/filters/[id]/+page.svelte` — новый
- `src/routes/(admin)/admin/filters/[id]/+page.server.ts` — новый

---

## Задача 16: Filters — sidebar навигация + queries

**DoD:**
- [ ] Добавить "Filters" в sidebar между Categories и Collections
- [ ] Иконка: подходящая emoji
- [ ] Queries в database.ts:
  - `adminListFilterAttributes`
  - `adminGetFilterAttribute`
  - `adminCreateFilterAttribute`
  - `adminUpdateFilterAttribute`
  - `adminDeleteFilterAttribute` (+ CASCADE filter_values)
  - `adminListFilterValues` (по attribute_id)
  - `adminCreateFilterValue`
  - `adminUpdateFilterValue`
  - `adminDeleteFilterValue`

**Файлы:**
- `src/lib/server/db/database.ts` — обновить
- `src/routes/(admin)/admin/+layout.svelte` — обновить sidebar

---

## Проверки после реализации

### Build
- [ ] `npm run build` — frontend без ошибок
- [ ] `npm run check` — типы корректны

### Функциональность
- [ ] Создать товар с изображениями через админку
- [ ] Изображения конвертированы в WebP, хранятся в `data/media/images/products/`
- [ ] Экспортировать все 6 типов — CSV корректные
- [ ] Импортировать CSV + ZIP — данные и изображения загружены
- [ ] Auto-create brands/categories при импорте товаров
- [ ] Filters CRUD полностью работает
- [ ] Все существующие функции не сломаны

---

*Создано: 2025-02-04*
