# MASTER ROADMAP - Moditimewatch

**Версия:** 1.0
**Дата:** 24 ноября 2024
**Статус:** В работе

---

## СТРУКТУРА ПРОЕКТА

```
C:\dev\watch\project-box-v2\
├── frontend-sveltekit\          # SvelteKit фронтенд (port 5173)
├── backend-expressjs\           # Express API (НЕ ИСПОЛЬЗУЕТСЯ для админки)
├── data\db\sqlite\app.db        # SQLite база данных
└── schema.sql                   # Схема БД (36 таблиц)

C:\dev\box-app\project-box-adminjs\
└── backend-expressjs\           # Admin.js панель (ИСПОЛЬЗОВАТЬ ЭТУ!)
    └── src\
        ├── admin.ts             # Конфигурация AdminJS + Sequelize
        ├── db.ts                # Sequelize модели
        └── index.ts             # Express сервер
```

---

## WORKFLOW АГЕНТА (ОБЯЗАТЕЛЬНО!)

### После КАЖДОЙ задачи:

```
1. Реализация задачи
       ↓
2. Запуск суб-агента АУДИТ (code-reviewer)
       ↓
3. Исправление багов (цикл 1)
       ↓
4. Повторный аудит (если нужно)
       ↓
5. Исправление багов (цикл 2 - максимум)
       ↓
6. ПРОВЕРКА В БРАУЗЕРЕ через MCP Playwright:
   - mcp__playwright__browser_navigate
   - mcp__playwright__browser_snapshot
   - mcp__playwright__browser_click
   - mcp__playwright__browser_console_messages
       ↓
7. Отметка задачи как DONE только если работает в браузере
```

---

## ФАЗА 1: КРИТИЧЕСКИЙ MVP (для деплоя)

### Task 1.1: API сохранения заказов

**Приоритет:** КРИТИЧЕСКИЙ
**Сложность:** Средняя
**Время:** 1-2 часа

**Описание:**
Создать серверный endpoint для сохранения заказов в БД. Сейчас заказы работают только на клиенте (localStorage) и теряются.

**Файлы:**
- `frontend-sveltekit/src/routes/api/orders/+server.ts` (создать)
- `frontend-sveltekit/src/routes/checkout/+page.svelte` (изменить)

**Чек-лист:**
- [x] Создать POST `/api/orders` endpoint (реализовано в +page.server.ts actions)
- [x] Валидация: name, phone, address (обязательные)
- [x] Валидация: email (опционально, формат)
- [x] Валидация: items array (минимум 1 товар)
- [x] Генерация order_number (MW-XXXXXXXX)
- [x] Сохранение в таблицу `orders`
- [x] Сохранение items в таблицу `order_items`
- [x] Запись в `order_status_history` (status: pending)
- [x] Возврат redirect на success page
- [x] Обработка ошибок с понятными сообщениями
- [x] Checkout форма использует form actions с enhance
- [x] **БРАУЗЕР:** Проверено через MCP Playwright - заказ MW-MID00HH7-OACN создан
- [x] **БД:** Проверено - данные в orders, order_items, order_status_history

**Queries готовы в database.ts:**
```typescript
insertOrder, insertOrderItem, insertOrderStatusHistory
```

---

### Task 1.2: Уведомления о заказах (Email + Telegram)

**Приоритет:** КРИТИЧЕСКИЙ
**Сложность:** Средняя
**Время:** 2-3 часа

**Описание:**
При создании заказа отправлять уведомления на email клиенту и в Telegram владельцу.

**Файлы:**
- `frontend-sveltekit/src/lib/server/notifications/email.ts` (создано)
- `frontend-sveltekit/src/lib/server/notifications/telegram.ts` (создано)
- `frontend-sveltekit/src/lib/server/notifications/index.ts` (создано)
- `frontend-sveltekit/src/routes/checkout/+page.server.ts` (добавлены вызовы)
- `.env` (добавить ключи при production deployment)

**Чек-лист:**
- [x] Создать функцию sendOrderEmail(order) с HTML шаблоном
- [x] Создать функцию sendAdminOrderEmail(order) для админа
- [x] HTML шаблон письма (таблица товаров, итого, контакты)
- [x] Создать функцию sendTelegramNotification(order)
- [x] Telegram Bot API: POST /sendMessage с MarkdownV2
- [x] Форматирование сообщения (escapeMarkdown для спецсимволов)
- [x] ENV переменные: SMTP_*, SENDGRID_*, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
- [x] Интегрировать в checkout form action (после успешного сохранения)
- [x] Обработка ошибок (заказ сохраняется даже если уведомление не отправилось)
- [x] Mock-реализация для разработки (логи в консоль)
- [x] **АУДИТ:** Запущен code-reviewer - найдена CRITICAL XSS уязвимость
- [x] **FIX:** Добавлена escapeHtml() функция для всех user data
- [x] **БРАУЗЕР:** Проверено - заказ MW-MID4INP7-CF9F, mock уведомления в логах

**TODO для production:**
- Установить nodemailer или @sendgrid/mail
- Настроить SMTP/SendGrid credentials
- Настроить Telegram bot credentials
- Добавить логирование в `email_log` таблицу

---

### Task 1.3: Исправить Header/Footer рендеринг из БД

**Приоритет:** ВЫСОКИЙ
**Сложность:** Низкая
**Время:** 30-60 минут

**Описание:**
Navigation items и Footer sections есть в БД (seed данные), но не отображаются на сайте.

**Файлы:**
- `frontend-sveltekit/src/routes/+layout.server.ts` (уже работает)
- `frontend-sveltekit/src/lib/components/layout/SiteHeader.svelte` (уже работает)
- `frontend-sveltekit/src/lib/components/layout/SiteFooter.svelte` (уже работает)

**Чек-лист:**
- [x] Проверить +layout.server.ts - загружает navigation/footer из БД
- [x] Debug логи показывают: 5 navigation items, 3 footer sections
- [x] Маппинг данных из queries работает корректно
- [x] Submenu загружаются (getNavigationSubmenu вызывается)
- [x] Данные передаются в компоненты через props
- [x] SiteHeader получает navigationItems и передаёт в DesktopNav/MobileNav
- [x] SiteFooter получает footerSections
- [x] **АНАЛИЗ:** Код проверен - реализация корректная
- [x] **БРАУЗЕР:** Ранее проверено - меню отображает 5 пунктов из БД

**Данные в БД:**
- Каталог, Коллекции, Бестселлеры, Сервис, Журнал
- Footer: Магазин, Сервис, Офис с соответствующими ссылками

---

### Task 1.4: SEO компоненты - исправление и оптимизация

**Приоритет:** ВЫСОКИЙ
**Сложность:** Средняя
**Время:** 1-2 часа

**Описание:**
SeoManager.svelte существует, но Yandex Metrika закомментирован. Нужно исправить и убедиться что аналитика загружается асинхронно (не блокирует рендер).

**Файлы:**
- `frontend-sveltekit/src/lib/components/seo/SeoManager.svelte`
- `frontend-sveltekit/src/lib/types/seo.ts` (проверить типы)
- `frontend-sveltekit/src/routes/+layout.svelte` (глобальная аналитика)

**Текущее состояние SeoManager:**
- [x] Title, description, canonical
- [x] Open Graph (og:*)
- [x] Twitter Cards
- [x] JSON-LD (Organization, BreadcrumbList)
- [x] Google Tag Manager
- [x] Google Analytics
- [x] Yandex Metrika (исправлено - onMount + динамическая вставка)
- [x] Асинхронная загрузка скриптов (все analytics через onMount)

**Чек-лист:**
- [x] Исправить Yandex Metrika - использовать onMount + динамическую вставку скрипта
- [x] Добавить defer/async для всех аналитических скриптов
- [x] Проверить что скрипты не блокируют First Contentful Paint
- [x] Добавить Product schema (JSON-LD) для страниц товаров - `schema-helpers.ts`
- [x] Добавить Article schema для страниц журнала - `generateArticleSchema`
- [x] Добавить LocalBusiness schema для страниц городов - `generateLocalBusinessSchema`
- [x] Страница товара использует SeoManager с Product JSON-LD
- [x] **АУДИТ:** code-reviewer: 1 CRITICAL (XSS), 2 HIGH (validation) - исправлены
- [x] **FIX:** safeJsonLd() для XSS защиты, валидаторы analytics IDs
- [ ] **БРАУЗЕР:** Проверить Network tab - скрипты загружаются async

**Созданные файлы:**
- `frontend-sveltekit/src/lib/utils/schema-helpers.ts` - хелперы JSON-LD схем
- `frontend-sveltekit/src/lib/components/seo/SeoManager.svelte` - обновлён

---

## ФАЗА 2: КОНТЕНТ ИЗ БД

### Task 2.1: Статические страницы из таблицы `pages`

**Приоритет:** СРЕДНИЙ
**Сложность:** Низкая
**Время:** 1-2 часа

**Описание:**
Страницы about, delivery, warranty, privacy, terms сейчас на mock данных. Нужно заполнить таблицу `pages` и подключить.

**Файлы:**
- `frontend-sveltekit/src/routes/about/+page.server.ts` (создать)
- `frontend-sveltekit/src/routes/about/+page.svelte` (изменить)
- Аналогично для: delivery, warranty, privacy, terms, contacts

**Чек-лист:**
- [x] Добавить query `getPageBySlug` в database.ts
- [x] Seed данные для страниц в seedDatabase()
- [x] Создать +page.server.ts для каждой страницы
- [x] Изменить +page.svelte - использовать data.page.content
- [x] HTML контент рендерить через {@html}
- [x] Добавить SEO данные из таблицы `seo_meta`
- [x] **АУДИТ:** Код проверен
- [x] **БРАУЗЕР:** Все страницы проверены через MCP Playwright

**Страницы:**
- [x] /about - работает, контент из БД
- [x] /delivery - работает, контент из БД
- [x] /warranty - работает, контент из БД
- [x] /privacy - работает, контент из БД
- [x] /terms - работает, контент из БД
- [x] /contacts - работает, contactMethods и officeInfo из БД

---

### Task 2.2: Страница города из БД (подготовка к поддоменам)

**Приоритет:** СРЕДНИЙ
**Сложность:** Средняя
**Время:** 2-3 часа

**Описание:**
Страница `/city/[city]` использует mock данные. Подключить к БД (cities, city_articles). Подготовить к работе на поддоменах.

**Файлы:**
- `frontend-sveltekit/src/routes/city/[city]/+page.server.ts` (создать)
- `frontend-sveltekit/src/routes/city/[city]/+page.svelte` (изменить)

**Чек-лист:**
- [x] Создать +page.server.ts с load функцией
- [x] Загрузка города: queries.getCityBySlug(params.city)
- [x] Загрузка статей: queries.getCityArticles(city.id, limit, offset)
- [x] 404 если город не найден
- [x] Передать данные в компонент
- [x] Изменить +page.svelte - использовать data из БД
- [x] Склонения города (name_genitive, name_prepositional)
- [x] WatchSearchWidget - редирект на основной сайт /catalog?search=
- [x] SEO: title, description, og:* из seo_meta
- [x] **АУДИТ:** Код проверен, TypeScript 0 errors
- [x] **БРАУЗЕР:** Проверено через MCP Playwright:
  - /city/moscow - 0 дн., Бесплатно
  - /city/saint-petersburg - 1 дн., Бесплатно
  - /city/kazan - 2 дн., Бесплатно
  - /city/nonexistent - 404 корректно

---

## ФАЗА 3: ADMIN.JS ИНТЕГРАЦИЯ

### Task 3.1: Подключить Admin.js к БД Moditimewatch

**Приоритет:** СРЕДНИЙ
**Сложность:** Высокая
**Время:** 3-4 часа

**Описание:**
Использовать существующую админку из `C:\dev\box-app\project-box-adminjs\backend-expressjs\`. Добавить все таблицы Moditimewatch.

**РЕШЕНИЕ:** Использовать `project-box-v2/backend-expressjs` (не отдельный проект).

**Файлы:**
- `project-box-v2/backend-expressjs/src/db.ts` (обновлено - 30+ Sequelize моделей)
- `project-box-v2/backend-expressjs/src/admin.ts` (обновлено - все ресурсы с RBAC)
- `project-box-v2/backend-expressjs/components/Dashboard.tsx` (обновлено - Moditimewatch branding)

**Чек-лист:**
- [x] Изменить db.ts - путь к app.db из project-box-v2
- [x] Создать Sequelize модели для всех таблиц:
  - [x] Products, ProductImages, ProductHighlights, ProductTabs, ProductBenefits
  - [x] Brands, Categories, Reviews
  - [x] Orders, OrderItems, OrderStatusHistory
  - [x] Cities, CityArticles
  - [x] Articles, ArticleCategories
  - [x] Collections, Testimonials, HomeHero, HomeServices, HomeServiceStats
  - [x] Pages, Widgets, SeoMeta
  - [x] NavigationItems, FooterSections, FooterLinks
  - [x] EmailTemplates, EmailLog
  - [x] SiteConfig, Users, Posts, Admins
- [x] Настроить admin.ts - добавить все ресурсы
- [x] Группировка: E-commerce, Orders, Content-Homepage, Content-Articles, SEO-Cities, Layout, Pages&SEO, Email, System
- [x] RBAC: super-admin полный доступ, editor без удаления
- [x] Branding: Moditimewatch Admin
- [x] **БРАУЗЕР:** Проверено через MCP Playwright:
  - [x] Логин admin@example.com работает
  - [x] Dashboard отображает 9 групп ресурсов
  - [x] Products list - 20 товаров с пагинацией
  - [x] Product Show - все поля отображаются (Rolex Submariner)
  - [x] Product Edit - форма с всеми полями, Save кнопка
  - [x] Orders list - 3 заказа из БД
  - [x] Brands/Categories связи работают (ссылки)

---

## ФАЗА 4: ПОДДОМЕНЫ ДЛЯ ГОРОДОВ

### Task 4.1: Настройка роутинга поддоменов

**Приоритет:** НИЗКИЙ (после MVP)
**Сложность:** Высокая
**Время:** 4-6 часов

**Описание:**
Города должны работать на поддоменах: moscow.moditimewatch.ru, spb.moditimewatch.ru и т.д.

**Файлы:**
- `frontend-sveltekit/src/hooks.server.ts` (создать/изменить)
- `frontend-sveltekit/svelte.config.js` (настройки)
- `nginx.conf` (для production)

**Чек-лист:**
- [ ] Создать hooks.server.ts для определения поддомена
- [ ] Извлечь city slug из hostname
- [ ] Передать city в locals для всех routes
- [ ] Создать отдельный layout для city поддоменов
- [ ] Редирект /city/[city] → поддомен (для SEO)
- [ ] WatchSearchWidget → редирект на главный домен
- [ ] Canonical URLs для поддоменов
- [ ] nginx конфигурация для wildcard поддоменов
- [ ] **АУДИТ:** Запустить code-reviewer субагент
- [ ] **БРАУЗЕР:** Проверить localhost с hosts файлом

---

## ФАЗА 5: РАСШИРЕНИЕ (после MVP)

### Task 5.1: Фильтры каталога из БД
- [ ] Динамические фильтры из filter_attributes/filter_values
- [ ] URL параметры для фильтров
- [ ] Пагинация
- [ ] Сортировка

### Task 5.2: FTS5 поиск
- [ ] Endpoint /api/search
- [ ] Автодополнение
- [ ] Подсветка результатов

### Task 5.3: Генерация SEO статей для городов
- [ ] Шаблоны статей
- [ ] Массовая генерация для 250 городов
- [ ] Уникализация контента

---

## ТЕКУЩИЙ СТАТУС

```
ФАЗА 1: [████████░░] 90%
├── Task 1.1: API заказов      [✓] DONE (24.11.2024)
├── Task 1.2: Уведомления      [✓] DONE (24.11.2024) - mock implementation
├── Task 1.3: Header/Footer    [✓] DONE (24.11.2024) - уже было реализовано
└── Task 1.4: SEO компоненты   [~] PARTIAL - нужна проверка в браузере

ФАЗА 2: [██████████] 100%
├── Task 2.1: Статич. страницы [✓] DONE (24.11.2024) - 6 страниц из БД
└── Task 2.2: Страница города  [✓] DONE (24.11.2024) - 3 города из БД

ФАЗА 3: [██████████] 100%
└── Task 3.1: Admin.js         [✓] DONE (24.11.2024) - 30+ моделей, 9 групп ресурсов

ФАЗА 4: [░░░░░░░░░░] 0%
└── Task 4.1: Поддомены        [ ] NOT STARTED
```

---

## ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Версия | Изменения |
|------|--------|-----------|
| 24.11.2024 | 1.0 | Создан MASTER_ROADMAP |
| 24.11.2024 | 1.1 | Task 1.1 API заказов - DONE (проверено в браузере + БД) |
| 24.11.2024 | 1.2 | Task 1.2 Уведомления - DONE (mock implementation, XSS fixed после аудита) |
| 24.11.2024 | 1.3 | Task 1.3 Header/Footer - DONE (уже было реализовано, проверено) |
| 24.11.2024 | 1.4 | Task 2.1 Статические страницы - DONE (6 страниц из БД, проверено) |
| 24.11.2024 | 1.5 | Task 2.2 Страницы городов - DONE (3 города из БД, 404 работает) |
| 24.11.2024 | 1.6 | Task 3.1 Admin.js интеграция - DONE (30+ моделей, CRUD проверен в браузере) |

---

## ПРИМЕЧАНИЯ ДЛЯ АГЕНТА

1. **ВСЕГДА** запускать аудит после задачи (до 2 циклов)
2. **ВСЕГДА** проверять в браузере через MCP Playwright
3. **Admin.js** теперь в `project-box-v2/backend-expressjs/` (порт 3000)
4. **НЕ** менять схему БД без согласования
5. При ошибках БД "disk I/O error" - остановить dev сервер
6. SEO скрипты должны загружаться АСИНХРОННО (не блокировать рендер)

## ЗАПУСК ADMIN ПАНЕЛИ

```bash
cd /mnt/c/dev/watch/project-box-v2/backend-expressjs
npm run dev     # Запуск с hot reload
# или
npm start       # Production mode
```

**URL:** http://localhost:3000/admin
**Логин:** admin@example.com / admin123
