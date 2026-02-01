# Session-7: pSEO Admin UI

**Статус:** ⏳ Pending
**Дата:** 2025-02-01
**Источник:** KG007 (KG007-prd-pseo-admin.md)
**Зависит от:** Session-6 (pSEO Schema — таблицы и statements готовы)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] Все CRUD операции сохраняют данные в БД
- [ ] Формы валидируются (required поля)

### Проверка в браузере
- [ ] /admin/pseo — страница открывается, выпадающий список 102 городов работает
- [ ] Выбор Москвы → видны тестовые статьи (из seed Session-6)
- [ ] Создание новой статьи: все поля сохраняются
- [ ] Редактирование статьи: категория, теги, медиа, перелинковка работают
- [ ] Категории CRUD работает (создание, редактирование, удаление)
- [ ] Теги CRUD работает
- [ ] SEO настройки города сохраняются (hero_title и т.д.)
- [ ] Импорт markdown файла → статья создаётся
- [ ] Sidebar показывает секцию pSEO
- [ ] Mobile: формы корректно отображаются
- [ ] Консоль браузера чистая

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | /admin/pseo Dashboard | ⏳ | Medium | Выбор города + список статей |
| 2 | Форма создания/редактирования статьи | ⏳ | High | All fields + media + related + tags |
| 3 | Категории CRUD | ⏳ | Low | /admin/pseo/categories |
| 4 | Теги CRUD | ⏳ | Low | /admin/pseo/tags |
| 5 | SEO настройки города | ⏳ | Low | hero_title, meta_description |
| 6 | Импорт/Экспорт | ⏳ | Medium | Markdown import, CSV export |
| 7 | AdminSidebar — секция pSEO | ⏳ | Low | Добавить в sidebar |
| 8 | Компоненты (CitySelector, MediaEditor, RelatedEditor) | ⏳ | Medium | Reusable components |

---

## Задача 1: /admin/pseo Dashboard

**DoD:**
- [ ] Роут `/admin/pseo` с server load + page
- [ ] Выпадающий список городов (102 города) — поиск по названию
- [ ] После выбора города → список его статей в таблице
- [ ] Таблица: Title, Category, Tags, Status, Views, Actions (Edit, Delete)
- [ ] Фильтры: по категории, по статусу
- [ ] Кнопки: "New Article", "Export"
- [ ] Статистика по выбранному городу: кол-во статей, опубликованных, категорий

**Файлы:**
- `src/routes/(admin)/admin/pseo/+page.server.ts`
- `src/routes/(admin)/admin/pseo/+page.svelte`

---

## Задача 2: Форма создания/редактирования статьи

**DoD:**
- [ ] Роуты:
  - `/admin/pseo/articles/new?city_id=X` — создание
  - `/admin/pseo/articles/[id]` — редактирование
- [ ] Поля формы:
  - Город (readonly — выбран из контекста, display name)
  - Title, Slug (автогенерация из title)
  - Excerpt (textarea)
  - Content (textarea, HTML)
  - Featured Image (image_url input)
  - Category (select из city_article_categories)
  - Tags (multi-select из city_article_tags, возможность создать новый tag inline)
  - meta_title, meta_description (SEO секция)
  - read_time (число, минуты)
  - template_type (select: standard, unique, variant_A, variant_B)
  - is_published (toggle)
- [ ] Секция "Медиа" (ArticleMediaEditor):
  - Список медиа (изображения + видео)
  - Добавить медиа: type (image/video), url, alt_text, caption, position
  - Удалить медиа
- [ ] Секция "Перелинковка" (ArticleRelatedEditor):
  - Выбор related articles из статей ЭТОГО ЖЕ города
  - Порядок (position)
  - Удалить связь
- [ ] Секция "Товары" (необязательная):
  - Привязка products (из city_article_products)
- [ ] Валидация: title, slug, city_id — required
- [ ] Сохранение → все данные в БД (включая связи)

**Файлы:**
- `src/routes/(admin)/admin/pseo/articles/new/+page.server.ts` + `+page.svelte`
- `src/routes/(admin)/admin/pseo/articles/[id]/+page.server.ts` + `+page.svelte`

---

## Задача 3: Категории CRUD

**DoD:**
- [ ] Роут `/admin/pseo/categories`
- [ ] Таблица: Name, Slug, Position, Active, Actions
- [ ] Форма создания/редактирования: name, slug, description, position, is_active
- [ ] Удаление категории (с подтверждением)
- [ ] Категории общие для всех городов

**Файлы:**
- `src/routes/(admin)/admin/pseo/categories/+page.server.ts` + `+page.svelte`

---

## Задача 4: Теги CRUD

**DoD:**
- [ ] Роут `/admin/pseo/tags`
- [ ] Таблица: Name, Slug, Actions
- [ ] Форма создания: name, slug (автогенерация)
- [ ] Удаление тега
- [ ] Теги общие для всех городов
- [ ] Быстрое создание тега из формы статьи (inline)

**Файлы:**
- `src/routes/(admin)/admin/pseo/tags/+page.server.ts` + `+page.svelte`

---

## Задача 5: SEO настройки города

**DoD:**
- [ ] При выборе города в /admin/pseo → вкладка/секция "SEO"
- [ ] Форма полей города (из таблицы `cities`):
  - hero_title
  - hero_subtitle
  - hero_image_url
  - meta_description (для лендинга города)
- [ ] Сохранение → UPDATE cities WHERE id = ?

**Файлы:**
- `src/routes/(admin)/admin/pseo/+page.server.ts` + `+page.svelte` (расширение)

---

## Задача 6: Импорт/Экспорт

**DoD:**
- [ ] Роут `/admin/pseo/import` (или расширение существующего /admin/import из Session-3)
- [ ] Импорт статей:
  - Markdown файл → парсинг (frontmatter YAML: title, slug, category, tags, meta)
  - Создание статьи в БД
- [ ] Импорт тегов: CSV файл (name, slug)
- [ ] Экспорт статей города: CSV (все статьи выбранного города)
- [ ] Шаблоны для скачивания (markdown, csv)

**Файлы:**
- `src/routes/(admin)/admin/pseo/import/+page.server.ts` + `+page.svelte`

---

## Задача 7: AdminSidebar — секция pSEO

**DoD:**
- [ ] Добавить в AdminSidebar секцию pSEO:
  ```
  pSEO:
    - pSEO Dashboard (/admin/pseo)
    - Categories (/admin/pseo/categories)
    - Tags (/admin/pseo/tags)
  ```
- [ ] Иконки для секции

**Файлы:**
- `src/lib/components/admin/AdminSidebar.svelte`

---

## Задача 8: Компоненты (CitySelector, MediaEditor, RelatedEditor)

**DoD:**
- [ ] CitySelector.svelte:
  - Выпадающий список городов (102)
  - Поиск по названию
  - Emit события при выборе
- [ ] ArticleMediaEditor.svelte:
  - Таблица медиа (type, url, caption, position)
  - Форма добавления медиа
  - Удаление медиа
- [ ] ArticleRelatedEditor.svelte:
  - Выбор статей того же города
  - Порядок (position)
  - Удаление связи

**Файлы:**
- `src/lib/components/admin/CitySelector.svelte`
- `src/lib/components/admin/ArticleMediaEditor.svelte`
- `src/lib/components/admin/ArticleRelatedEditor.svelte`

---

*Создано: 2025-02-01*
