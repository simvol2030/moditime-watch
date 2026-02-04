# Спецификация: Import/Export v2 — полноценный round-trip с изображениями

**Версия:** final
**Сессия:** Session-15
**Зависит от:** Session-3 (базовый import/export — архивирована, реализована)

---

## Контекст

Session-3 реализовала базовый CSV import/export. Сейчас работает:
- Импорт: Products, Brands, Categories, Cities, City Articles, Filters
- Экспорт: Products, Brands, Cities (только 3 из 6)
- Шаблоны: для всех 6 сущностей

НЕ работает / отсутствует:
- File upload изображений (нигде в админке)
- Экспорт для Categories, Filters, City Articles
- Конвертация в WebP
- Импорт CSV + ZIP с изображениями
- Каскадный импорт зависимостей
- Страница управления фильтрами

---

## Есть сейчас vs Должно быть

| Аспект | Есть сейчас | Должно быть |
|--------|-------------|-------------|
| **Загрузка изображений (Products)** | Нет поля в форме вообще | File upload с выбором файла + drag-and-drop + URL ввод |
| **Загрузка изображений (Brands)** | Только текстовое поле URL | File upload + URL ввод (два варианта) |
| **Загрузка изображений (Categories)** | Только текстовое поле URL | File upload + URL ввод |
| **Загрузка изображений (Cities)** | Только текстовое поле URL | File upload + URL ввод |
| **Формат хранения** | Внешние URL (picsum.photos) | WebP файлы в `data/media/images/` |
| **Экспорт Categories** | Отсутствует | CSV экспорт |
| **Экспорт Filters** | Отсутствует | CSV экспорт |
| **Экспорт City Articles** | Отсутствует | CSV экспорт |
| **Импорт с изображениями** | Только URL-строки в CSV | CSV + ZIP архив с изображениями |
| **Каскадный импорт** | Ошибка если brand/category не существует | Auto-create отсутствующих brands/categories |
| **Управление фильтрами** | Нет страницы в админке | Полный CRUD для filter_attributes и filter_values |
| **Конвертация изображений** | Нет | Автоматическая конвертация в WebP при загрузке |

---

## Хранилище изображений

**Путь:** `data/media/images/`

Структура:
```
data/media/images/
├── products/          # Изображения товаров
│   ├── {slug}.webp          # Основное изображение
│   ├── {slug}-2.webp        # Галерея
│   ├── {slug}-thumb.webp    # Thumbnail основного
│   └── ...
├── brands/            # Логотипы брендов
│   ├── {slug}.webp
│   └── {slug}-thumb.webp
├── categories/        # Изображения категорий
│   └── {slug}.webp
└── cities/            # Hero изображения городов
    └── {slug}.webp
```

**Важно:** Изображения хранятся рядом с БД (`data/`) для удобства бэкапа — одна директория содержит все данные.

**URL-маппинг:** файл `data/media/images/products/rolex-sub.webp` доступен по URL `/media/images/products/rolex-sub.webp`. SvelteKit обслуживает через server route или static middleware.

---

## Конвертация изображений

**Библиотека:** `sharp`

**При любой загрузке (upload или import):**
1. Принимается: JPG, JPEG, PNG, WEBP, AVIF, TIFF
2. Конвертация → WebP
3. Качество: 85 (хороший баланс размер/качество, без видимой потери)
4. Максимальный размер: 1920px по длинной стороне (пропорционально)
5. Thumbnail: 400px по длинной стороне, качество 80
6. Метаданные EXIF удаляются (приватность + размер)
7. Исходный файл НЕ сохраняется (только WebP)

---

## Блок 1: File Upload API + sharp

### 1.1 Установить sharp
```bash
cd frontend-sveltekit && npm install sharp
cd frontend-sveltekit && npm install -D @types/sharp
```

### 1.2 Image processing utility
**Файл:** `src/lib/server/media/image-processor.ts`

Функции:
- `processImage(buffer, options)` → `{ main: Buffer, thumbnail: Buffer }`
- `saveImage(buffer, entity, slug, index?)` → `{ url: string, thumbnailUrl: string }`
- `deleteImage(url)` → void
- Конвертация в WebP, ресайз, thumbnail генерация

### 1.3 Media serving
**Файл:** `src/routes/media/[...path]/+server.ts`

GET handler — отдаёт файлы из `data/media/` с правильным Content-Type и cache headers.

### 1.4 Upload API endpoint
**Файл:** `src/routes/(admin)/admin/api/upload/+server.ts`

POST — принимает `multipart/form-data`:
- `file` — файл изображения
- `entity` — тип сущности (products, brands, categories, cities)
- `slug` — slug сущности
- `index` — порядковый номер (для галереи)

Возвращает: `{ url, thumbnailUrl }`

---

## Блок 2: ImageUpload компонент + интеграция в формы

### 2.1 Компонент ImageUpload.svelte
**Файл:** `src/lib/components/admin/ImageUpload.svelte`

Функционал:
- Кнопка "Выбрать файл" (приоритетный вариант)
- Drag-and-drop зона
- Альтернативный ввод URL (переключатель "или вставить URL")
- Preview загруженного изображения
- Кнопка удаления
- Progress indicator при загрузке
- Валидация: формат (jpg/png/webp), размер (max 10MB)

### 2.2 Компонент ImageGalleryUpload.svelte
**Файл:** `src/lib/components/admin/ImageGalleryUpload.svelte`

Для Products — загрузка нескольких изображений:
- Main image (одно, обязательное)
- Gallery images (множество, опциональные)
- Drag-and-drop для переупорядочивания
- Удаление отдельных изображений

### 2.3 Интеграция в формы

**Products** (`/admin/products/new/` и `/admin/products/[id]/`):
- Добавить секцию "Images" с ImageGalleryUpload
- Main image + Gallery
- При создании/обновлении — сохранять в product_images

**Brands** (`/admin/brands/new/` и `/admin/brands/[id]/`):
- Заменить текстовое поле logo_url на ImageUpload
- Оба варианта: file upload ИЛИ URL

**Categories** (`/admin/categories/new/` и `/admin/categories/[id]/`):
- Заменить текстовое поле image_url на ImageUpload
- Оба варианта: file upload ИЛИ URL

**Cities** (`/admin/cities/new/` и `/admin/cities/[id]/`):
- Заменить текстовое поле hero_image_url на ImageUpload
- Оба варианта: file upload ИЛИ URL

---

## Блок 3: Недостающие экспорты

### 3.1 Экспорт Categories
**Файл:** `src/routes/(admin)/admin/export/categories/+server.ts`
- Поля: slug, name, description, parent_slug, image_url, is_active, position
- parent_slug через JOIN на parent category
- ORDER BY position

### 3.2 Экспорт Filters
**Файл:** `src/routes/(admin)/admin/export/filters/+server.ts`
- Поля: attribute_slug, attribute_name, attribute_type, attribute_position, value, label, position
- JOIN filter_values + filter_attributes
- ORDER BY attribute_position, position

### 3.3 Экспорт City Articles
**Файл:** `src/routes/(admin)/admin/export/city-articles/+server.ts`
- Поля: city_slug, slug, title, excerpt, content, image_url, template_type, is_published
- city_slug через JOIN на cities
- ORDER BY city_slug, slug

### 3.4 Кнопки экспорта на страницах списков
Добавить кнопку "Export CSV" на:
- `/admin/categories` → ссылка на `/admin/export/categories`
- `/admin/pseo/tags` → (если применимо)
- Уже есть на products, brands, cities (проверить)

---

## Блок 4: Импорт CSV + ZIP с изображениями

### 4.1 Обновление UI импорта
**Файл:** `src/routes/(admin)/admin/import/+page.svelte`

Добавить:
- Второе поле загрузки: "ZIP архив с изображениями" (опциональное)
- Подсказка: "CSV ссылается на имена файлов (например: rolex-sub.jpg), ZIP содержит эти файлы"
- При preview — показать какие файлы найдены в ZIP и какие ожидаются из CSV

### 4.2 ZIP processing
**Файл:** `src/lib/server/import/zip-processor.ts`

- Распаковка ZIP в временную директорию
- Маппинг имён файлов → Buffer
- Валидация: только изображения (jpg, png, webp)
- Очистка temp после импорта

**Зависимость:** Использовать встроенный Node.js `zlib` + `tar` или установить `adm-zip` / `jszip`.

### 4.3 Обновление импортеров

**Логика обработки изображений в CSV:**
- Если значение поля image начинается с `http://` или `https://` → использовать как URL (внешняя ссылка)
- Если значение поля image начинается с `/media/` → уже локальный файл, оставить как есть
- Иначе → искать файл с таким именем в ZIP архиве → если найден, обработать через sharp → сохранить в `data/media/images/` → подставить локальный URL

**product-importer.ts — обновить:**
- `main_image`: обработка по логике выше
- `gallery_images`: каждый файл (pipe-separated) обработка по логике выше

**brand-importer.ts — обновить:**
- `logo_url`: обработка по логике выше

**category-importer.ts — обновить:**
- `image_url`: обработка по логике выше

**city-importer.ts — обновить:**
- `hero_image_url`: обработка по логике выше

### 4.4 Каскадный импорт зависимостей

**product-importer.ts — обновить:**
- Если `brand_slug` не найден в БД → автоматически создать бренд (name = brand_slug с capitalize, остальное — defaults)
- Если `category_slug` не найден в БД → автоматически создать категорию (name = category_slug с capitalize)
- В ImportResult добавить поле `auto_created: { brands: string[], categories: string[] }`
- В UI показать: "Auto-created 3 brands, 2 categories"

**category-importer.ts — обновить:**
- Двухпроходный импорт: сначала все без parent_slug, потом с parent_slug
- Или: сортировка строк так, чтобы parent шёл перед child

### 4.5 Server action обновление
**Файл:** `src/routes/(admin)/admin/import/+page.server.ts`

- Принимать два файла: CSV + ZIP (опциональный)
- Увеличить лимит: 50MB (для ZIP с изображениями)
- Передавать ZIP-данные в импортеры

---

## Блок 5: Управление фильтрами (CRUD)

### 5.1 Список фильтров
**Файл:** `src/routes/(admin)/admin/filters/+page.svelte` + `+page.server.ts`

Страница:
- Таблица атрибутов фильтров (filter_attributes)
- Для каждого атрибута — раскрывающийся список значений (filter_values)
- Кнопки: Edit, Delete для атрибутов
- Кнопки: Edit, Delete для значений

### 5.2 Создание/редактирование атрибута
**Файлы:**
- `src/routes/(admin)/admin/filters/new/+page.svelte` + `+page.server.ts`
- `src/routes/(admin)/admin/filters/[id]/+page.svelte` + `+page.server.ts`

Поля атрибута:
- Name (обязательное)
- Slug (auto-generate)
- Type: checkbox, radio, range, color (select)
- Position

### 5.3 Управление значениями
На странице редактирования атрибута (`/admin/filters/[id]/`):
- Таблица значений
- Inline добавление: value, label, position
- Удаление значений
- Переупорядочивание

### 5.4 Добавить в sidebar навигацию
В layout админки добавить в секцию "E-commerce":
- "Filters" с иконкой (между Categories и Collections)

### 5.5 Database queries
В `database.ts` добавить:
- `adminListFilterAttributes` — все атрибуты ORDER BY position
- `adminGetFilterAttribute` — один атрибут по id
- `adminCreateFilterAttribute` — INSERT
- `adminUpdateFilterAttribute` — UPDATE
- `adminDeleteFilterAttribute` — DELETE + CASCADE values
- `adminListFilterValues` — значения по attribute_id
- `adminCreateFilterValue` — INSERT
- `adminUpdateFilterValue` — UPDATE
- `adminDeleteFilterValue` — DELETE

---

## Технические ограничения

- **sharp** на production: проверить совместимость с сервером (Linux x64 — должно работать)
- **Размер ZIP:** максимум 50MB на один импорт
- **Форматы:** только JPG, JPEG, PNG, WEBP (на входе)
- **Выход:** только WebP
- **Транзакционность:** если импорт упал на 50-й строке из 100 — откатить ВСЁ (уже работает)

---

## Критерии успеха

### Round-trip тест
- [ ] Зайти в /admin/products → создать товар вручную с изображениями (file upload)
- [ ] Изображение сохранилось в `data/media/images/products/` в формате WebP
- [ ] Товар отображается на фронте с изображениями
- [ ] Экспортировать Products в CSV → файл содержит URL изображений
- [ ] По аналогии с экспортированным CSV подготовить новый CSV с 5+ товарами
- [ ] Подготовить ZIP с изображениями для этих товаров
- [ ] Импортировать CSV + ZIP → все товары созданы, изображения конвертированы в WebP
- [ ] Новые бренды/категории из CSV автоматически созданы

### Чек-лист функционала
- [ ] Products: create/edit с загрузкой изображений (file + URL)
- [ ] Brands: create/edit с загрузкой логотипа (file + URL)
- [ ] Categories: create/edit с загрузкой изображения (file + URL)
- [ ] Cities: create/edit с загрузкой hero image (file + URL)
- [ ] Экспорт: все 6 сущностей (Products, Brands, Categories, Cities, City Articles, Filters)
- [ ] Импорт: CSV + ZIP с изображениями
- [ ] Каскадный импорт: auto-create brands/categories
- [ ] Filters: полный CRUD в админке
- [ ] WebP конвертация при любой загрузке
- [ ] Media serving: `/media/images/...` отдаёт файлы

### Чек-лист браузера
- [ ] /admin/products/new — можно загрузить изображения
- [ ] /admin/products/[id] — можно изменить/удалить изображения
- [ ] /admin/brands/new — file upload для логотипа
- [ ] /admin/categories/new — file upload для изображения
- [ ] /admin/cities/new — file upload для hero image
- [ ] /admin/filters — страница списка работает
- [ ] /admin/filters/new — создание атрибута
- [ ] /admin/filters/[id] — редактирование + управление значениями
- [ ] /admin/import — два поля: CSV + ZIP
- [ ] /admin/export/categories — скачивается CSV
- [ ] /admin/export/filters — скачивается CSV
- [ ] /admin/export/city-articles — скачивается CSV
- [ ] Загруженные изображения отображаются на фронте
- [ ] `npm run build` — без ошибок

---

*Создано: 2025-02-04*
