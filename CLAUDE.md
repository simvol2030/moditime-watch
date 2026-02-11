# Moditime Watch — Codebase Context

**URL:** https://moditime-watch.ru
**Тип:** E-commerce для премиальных часов (SvelteKit fullstack)
**Workflow Developer:** см. `CLAUDE.web.md` (в этой директории)
**Workflow CLI:** см. `../CLAUDE.local.md` (в parent директории)

---

## ПРАВИЛО: Безопасность портов

> **СТРОГОЕ ПРАВИЛО:** При развёртывании проекта с нуля (новый сервер, VPS-Dev и т.д.)
> ЗАПРЕЩЕНО занимать порты других проектов.
>
> **Обязательный порядок:**
> 1. Проверить занятые порты: `ss -tlnp | grep LISTEN`
> 2. Выбрать СВОБОДНЫЕ порты
> 3. Обновить конфигурацию с выбранными портами
> 4. Задокументировать выбранные порты

---

## Структура проекта

```
moditime-watch/
├── frontend-sveltekit/          # SvelteKit 2.x + Svelte 5 (основное приложение)
│   ├── src/routes/              # Маршруты (public + admin)
│   │   ├── (admin)/             # Admin panel (protected)
│   │   ├── (city)/              # City-specific pages (pSEO)
│   │   ├── api/                 # API endpoints
│   │   ├── catalog/             # Каталог товаров
│   │   ├── product/             # Страница товара
│   │   ├── cart/                # Корзина
│   │   ├── checkout/            # Оформление заказа
│   │   ├── order/               # Статус заказа
│   │   ├── journal/             # Статьи/блог
│   │   ├── search/              # Поиск
│   │   └── sitemap*.xml/        # Sitemaps
│   ├── src/lib/                 # Shared библиотеки
│   │   ├── components/          # Svelte компоненты
│   │   ├── server/              # Серверная логика (auth, db, validation)
│   │   └── stores/              # Svelte stores
│   └── static/                  # Статика (images → symlink на сервере)
│
├── backend-expressjs/           # Express.js (НЕ деплоится отдельно на prod)
│   ├── src/                     # TypeScript source
│   └── components/              # AdminJS React компоненты
│
├── data/                        # Персистентные данные
│   ├── db/sqlite/               # SQLite БД (app.db, WAL mode)
│   ├── logs/                    # Логи
│   └── media/                   # Загруженные медиа-файлы
│
├── project-doc/                 # Документация сессий
│   ├── COMPLETED.md             # Статусы всех сессий
│   ├── SESSIONS_ROADMAP.md      # Roadmap всех сессий
│   ├── session-N-*/             # Спеки и roadmaps по сессиям
│   └── archive/                 # Архив завершённых
│
├── feedbacks/                   # Feedback для Developer
│   └── qa-reports/              # QA отчёты субагентов
│
├── .claude/                     # Claude Code hooks (в git!)
│   ├── settings.json            # Hook конфигурация
│   └── hooks/notify.sh          # Telegram уведомления
│
├── migrations/                  # Миграции БД
├── scripts/                     # Вспомогательные скрипты
├── schema.sql                   # Полная схема БД (46 таблиц)
└── docker-compose.yml           # Docker для локальной проверки
```

---

## Tech Stack

| Компонент | Технологии |
|-----------|------------|
| **Frontend** | SvelteKit 2.x, Svelte 5 (runes), TypeScript, Vite |
| **Backend** | SvelteKit server routes (hooks, load, actions), Express.js (legacy) |
| **Database** | SQLite (better-sqlite3, WAL mode, FTS5) |
| **Admin** | Custom admin panel в SvelteKit (`/admin` routes) |
| **Security** | bcrypt, AES-256-GCM, CSRF protection, rate limiting |
| **Styling** | CSS (custom), responsive design |
| **DevOps** | PM2, Nginx, Docker (local), SSH-MCP |

---

## Архитектура

**SvelteKit обрабатывает ВСЁ** (fullstack monolith):
- Публичные страницы (каталог, товары, корзина, checkout)
- Admin panel (CRUD для всех сущностей)
- API endpoints (`/api/*`)
- Auth (сессии, bcrypt, CSRF)
- БД (better-sqlite3, prepared statements)
- SEO (sitemaps, meta, pSEO по городам)

**backend-expressjs** — legacy компонент, существует в репо но НЕ деплоится отдельно на production.

---

## База данных (SQLite, 46 таблиц)

### Блок 1: Глобальные настройки
| Таблица | Описание |
|---------|----------|
| `site_config` | Настройки сайта (key-value) |
| `navigation_items` | Навигация (header + footer menus) |
| `widgets` | Переиспользуемые виджеты |

### Блок 2: Layout
| Таблица | Описание |
|---------|----------|
| `footer_sections` | Секции футера |
| `footer_links` | Ссылки в футере |

### Блок 3: Homepage
| Таблица | Описание |
|---------|----------|
| `home_hero` | Hero-секция главной |
| `collections` / `collection_products` | Коллекции товаров |
| `home_services` / `home_service_stats` | Сервисы и статистика |
| `testimonials` | Отзывы |

### Блок 4: Каталог
| Таблица | Описание |
|---------|----------|
| `brands` | Бренды часов |
| `categories` | Категории |
| `products` | Товары |
| `product_images` | Изображения товаров |
| `product_specs` / `product_options` | Характеристики и опции |
| `product_highlights` / `product_tabs` / `product_benefits` | Доп. контент товара |
| `filter_attributes` / `filter_values` / `product_filters` | Фильтры каталога |
| `reviews` | Отзывы о товарах |
| `catalog_config` | Настройки каталога |

### Блок 5: Контент
| Таблица | Описание |
|---------|----------|
| `articles` / `article_categories` | Статьи и категории |
| `article_tags` / `article_tag_relations` | Теги статей |
| `article_related_products` | Связь статей с товарами |

### Блок 6: pSEO (города)
| Таблица | Описание |
|---------|----------|
| `cities` | Города |
| `city_articles` | Статьи по городам |
| `city_article_products` / `city_article_categories` | Связи |
| `city_article_tags` / `city_article_tag_relations` | Теги |
| `city_article_related` / `city_article_media` | Связи и медиа |

### Блок 7: E-commerce
| Таблица | Описание |
|---------|----------|
| `orders` / `order_items` | Заказы |
| `order_status_history` | История статусов |
| `callback_requests` | Запросы обратного звонка |

### Блок 8: Система
| Таблица | Описание |
|---------|----------|
| `seo_meta` | SEO мета-теги |
| `pages` | Статические страницы |
| `email_templates` / `email_log` | Email шаблоны и лог |

---

## API Endpoints (основные)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/products` | Список товаров |
| GET | `/api/brands` | Список брендов |
| GET | `/api/categories` | Список категорий |
| GET | `/api/collections` | Коллекции |
| POST | `/api/orders` | Создание заказа |
| POST | `/api/callback` | Запрос обратного звонка |
| GET | `/api/search` | Поиск товаров |
| GET | `/sitemap.xml` | Индексный sitemap |

---

## .gitignore (важное)

```gitignore
# Build
node_modules/
frontend-sveltekit/.svelte-kit/
frontend-sveltekit/build/
backend-expressjs/dist/

# Database
data/db/sqlite/*.db

# Media & images
data/logs/*
data/media/*
frontend-sveltekit/static/images/**/*
frontend-sveltekit/static/fonts/**/*

# Environment
.env
```

---

## Безопасность (hooks.server.ts)

1. **Security headers** (CSP, X-Frame-Options, HSTS)
2. **CSRF protection** (токен в cookie + hidden field)
3. **Rate limiting** (login brute-force protection)
4. **Input validation** (SQL injection, XSS patterns)
5. **Session encryption** (AES-256-GCM)
6. **Prepared statements** (все SQL запросы)

---

*Версия: 2.0 | 2025-02-11*
*Используется с: CLAUDE.web.md (v2.6), CLAUDE.local.md (v6.1)*
