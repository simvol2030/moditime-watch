# Sessions Roadmap - Moditime Watch

> **Developer:** Прочитай этот файл ПЕРВЫМ перед началом работы!
> **Moderator:** Этот файл — актуальный статус всех сессий проекта

---

## Статус проекта

| Метрика | Значение |
|---------|----------|
| **Всего задач** | 58 |
| **Выполнено** | 28 (48%) |
| **Осталось** | 30 (52%) |
| **Текущая сессия** | Session-5 |
| **Всего сессий** | 8 |

---

## Выполненные сессии (Sessions 1-4)

### ✅ Session-1: Fix Pages (5 задач)

**Статус:** DONE
**Дата завершения:** 2025-02-01
**Что сделано:**
- Заполнены фильтры каталога (brands, categories)
- Добавлен image fallback для 404
- Исправлен CSP для Google Fonts
- Seed тестовых city articles (12 статей)
- Корректировка Homepage stats

**Roadmap:** `project-doc/session-1-fix-pages/roadmap.md`

---

### ✅ Session-2: Admin Panel E-commerce (9 задач)

**Статус:** DONE
**Дата завершения:** 2025-02-01
**Что сделано:**
- Collections CRUD
- Cities CRUD
- City Articles CRUD
- Testimonials CRUD
- Journal Articles CRUD
- Product Options UI
- Config seed + UI
- Orders improve
- Sidebar update

**Roadmap:** `project-doc/session-2-admin-panel/roadmap.md`

---

### ✅ Session-3: Import/Export (9 задач)

**Статус:** DONE
**Дата завершения:** 2025-02-01
**Зависит от:** Session-2
**Что сделано:**
- CSV Parser
- Products Importer
- Brands/Categories Importer
- Cities Importer
- City Articles Importer
- Filter Values Importer
- Import UI page
- Export endpoints
- Template downloads

**Roadmap:** `project-doc/session-3-import-export/roadmap.md`

---

### ✅ Session-4: Layout Management (5 задач)

**Статус:** DONE
**Дата завершения:** 2025-02-01
**Зависит от:** Session-2
**Что сделано:**
- Footer Management UI
- Config → Layout интеграция
- Homepage Management UI
- City Layout (layout group)
- Navigation extend

**Roadmap:** `project-doc/session-4-layout-management/roadmap.md`

---

## Текущая сессия

### ⏳ Session-5: Notifications & Order Flow (6 задач)

**Статус:** PENDING (готова к реализации!)
**Зависит от:** Session-2 (Orders improve, Config)
**Developer:** НАЧНИ С ЭТОЙ СЕССИИ

**Задачи:**
1. Telegram Bot (Medium) — реальная отправка в группу
2. Email Service (Medium) — SMTP отправка через Nodemailer
3. Email Templates seed (Low) — 5 шаблонов в email_templates
4. Notifications Admin UI (Medium) — настройки + тест + шаблоны
5. Order Flow интеграция (Medium) — Checkout → уведомления
6. Order Status уведомления (Medium) — смена статуса → email

**Roadmap:** `project-doc/session-5-notifications/roadmap.md`

**План работы:**
1. Прочитай `project-doc/session-5-notifications/roadmap.md`
2. Следуй Workflow Developer (CLAUDE.web.md)
3. Создай ветку `claude/session-5-notifications`
4. Реализуй 6 задач по roadmap
5. Commit + push → уведомление CLI

---

## Следующие сессии (pSEO)

### ⏳ Session-6: pSEO Schema & Backend (8 задач)

**Статус:** PENDING
**Зависит от:** Session-2 (Cities CRUD)
**Developer:** НАЧАТЬ ПОСЛЕ Session-5

**Задачи:**
1. ALTER city_articles (Low) — добавить meta_title, meta_description, category_id, read_time
2. Таблица city_article_categories (Low) — CREATE TABLE + prepared statements
3. Таблицы city_article_tags + relations (Medium) — CREATE TABLE + prepared statements
4. Таблица city_article_related (Low) — CREATE TABLE + prepared statements
5. Таблица city_article_media (Medium) — CREATE TABLE + prepared statements
6. Prepared statements city_article_products (Low) — statements для существующей таблицы
7. FTS5 для city_articles (Medium) — CREATE VIRTUAL TABLE + триггеры
8. Seed данных (Москва) (Medium) — 3-4 статьи + категории + теги + медиа

**Roadmap:** `project-doc/session-6-pseo-schema/roadmap.md`

**Описание:**
Расширение БД для полноценной CMS программатического SEO: категории статей, теги/ключевые слова, перелинковка внутри города, медиа (изображения, видео), полнотекстовый поиск.

---

### ⏳ Session-7: pSEO Admin UI (8 задач)

**Статус:** PENDING
**Зависит от:** Session-6 (pSEO Schema)
**Developer:** НАЧАТЬ ПОСЛЕ Session-6

**Задачи:**
1. /admin/pseo Dashboard (Medium) — выбор города + список статей
2. Форма создания/редактирования статьи (High) — all fields + media + related + tags
3. Категории CRUD (Low) — /admin/pseo/categories
4. Теги CRUD (Low) — /admin/pseo/tags
5. SEO настройки города (Low) — hero_title, meta_description
6. Импорт/Экспорт (Medium) — Markdown import, CSV export
7. AdminSidebar — секция pSEO (Low) — добавить в sidebar
8. Компоненты (CitySelector, MediaEditor, RelatedEditor) (Medium) — reusable components

**Roadmap:** `project-doc/session-7-pseo-admin/roadmap.md`

**Описание:**
Единый интерфейс в админке для управления pSEO: выбор города → управление его статьями, категориями, тегами, перелинковкой, медиа.

---

### ⏳ Session-8: pSEO Frontend & SEO (9 задач)

**Статус:** PENDING
**Зависит от:** Session-6 (Schema), Session-7 (Admin)
**Developer:** НАЧАТЬ ПОСЛЕ Session-7

**Задачи:**
1. City Layout Group (Medium) — (city)/+layout с CityHeader/Footer
2. CityHeader + CityFooter (Medium) — отдельные header/footer для городов
3. Главная города (листинги по категориям) (High) — категории + пагинация + hero
4. Страница статьи (rich content) (High) — медиа + видео + виджет + перелинковка
5. Reroute article paths на поддоменах (Low) — hooks.ts расширение
6. Sitemap Index (Medium) — sitemap index + sub-sitemaps
7. robots.txt (Low) — добавить Sitemap:
8. JSON-LD schemas (Medium) — LocalBusiness, BreadcrumbList, WebSite
9. Cache-Control headers (Low) — setHeaders для city pages

**Roadmap:** `project-doc/session-8-pseo-frontend/roadmap.md`

**Описание:**
Превратить поддомены городов в полноценные мини-сайты: отдельный layout, главная с листингами по категориям, rich content в статьях, перелинковка, виджет поиска, масштабируемый SEO.

---

## Порядок выполнения сессий

```
Session-1 (независимая) → ✅ DONE
Session-2 (независимая) → ✅ DONE
    ├── Session-3 (после Session-2) → ✅ DONE
    ├── Session-4 (после Session-2) → ✅ DONE
    ├── Session-5 (после Session-2) → ⏳ PENDING ← **СЕЙЧАС ЗДЕСЬ**
    └── Session-6 (после Session-2) → ⏳ PENDING
            ├── Session-7 (после Session-6) → ⏳ PENDING
            └── Session-8 (после Session-6 + Session-7) → ⏳ PENDING
```

---

## Критерии готовности сессии

**Сессия считается DONE когда:**
- [ ] Все задачи реализованы по roadmap
- [ ] `npm run build` успешно (frontend + backend)
- [ ] Все проверки из roadmap.md пройдены
- [ ] Код задеплоен на production
- [ ] CLI обновил COMPLETED.md: `⏳ PENDING` → `✅ DONE`

---

## Прогресс по сессиям

| Session | Задач | Статус | Завершено |
|---------|-------|--------|-----------|
| Session-1 | 5 | ✅ DONE | 2025-02-01 |
| Session-2 | 9 | ✅ DONE | 2025-02-01 |
| Session-3 | 9 | ✅ DONE | 2025-02-01 |
| Session-4 | 5 | ✅ DONE | 2025-02-01 |
| **Session-5** | **6** | **⏳ PENDING** | — |
| Session-6 | 8 | ⏳ PENDING | — |
| Session-7 | 8 | ⏳ PENDING | — |
| Session-8 | 9 | ⏳ PENDING | — |
| **ИТОГО** | **58** | **28 DONE / 30 PENDING** | **48%** |

---

## Дорожная карта проекта

**Фаза 1: Core E-commerce (Sessions 1-4)** → ✅ ЗАВЕРШЕНО
- Исправление багов и базовый функционал
- Админ-панель для управления каталогом
- Импорт/экспорт данных
- Управление layout (footer, navigation, homepage)

**Фаза 2: Order Management (Session-5)** → ⏳ В РАБОТЕ
- Уведомления (Telegram + Email)
- Интеграция в Order Flow
- Email шаблоны

**Фаза 3: Programmatic SEO (Sessions 6-8)** → ⏳ ЗАПЛАНИРОВАНО
- Расширение БД для pSEO (категории, теги, медиа, FTS5)
- Админка для управления pSEO контентом
- Frontend: отдельные layouts для городов, rich content, sitemap index, JSON-LD

**После завершения Session-8 — проект готов на 100%!**

---

**Версия:** 2.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-01
**Для Developer:** Начни с Session-5, затем Sessions 6-8 по порядку!
**Для Moderator:** 28 из 58 задач выполнено (48%), осталось 30 задач (3 сессии)
