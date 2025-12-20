# Moditimewatch - E-commerce для премиальных часов

**Обновлено:** 20 декабря 2024
**Статус:** MVP 95% | Staging Ready 95% | Production Ready 80%

---

## Быстрый старт

```bash
# Terminal 1: Frontend (основной сайт)
cd frontend-sveltekit
npm install
npm run dev
# http://localhost:5173

# Terminal 2: Backend (админ-панель)
cd backend-expressjs
npm install
npm run dev
# http://localhost:3000/admin
# Логин: admin@example.com / admin123
```

---

## Архитектура проекта

```
project-box-v2/
├── frontend-sveltekit/          # SvelteKit 2.x + Svelte 5 (PORT 5173)
│   ├── src/
│   │   ├── routes/              # 17 страниц
│   │   ├── lib/
│   │   │   ├── components/      # 60 Svelte компонентов
│   │   │   ├── stores/          # Svelte 5 stores ($state)
│   │   │   └── server/
│   │   │       ├── db/database.ts    # SQLite + better-sqlite3
│   │   │       ├── notifications/    # Email + Telegram (mock)
│   │   │       └── auth/             # Session management
│   │   └── hooks.server.ts      # Security middleware
│   └── static/
│
├── backend-expressjs/           # Express 5.x + AdminJS (PORT 3000)
│   ├── src/
│   │   ├── index.ts             # Entry point
│   │   ├── db.ts                # Sequelize ORM (30+ моделей)
│   │   ├── admin.ts             # AdminJS конфигурация
│   │   └── components/          # React для админки
│   └── dist/
│
├── data/
│   └── db/sqlite/app.db         # SQLite база (~300 KB)
│
├── schema.sql                   # SQL схема (36 таблиц)
└── MASTER_ROADMAP.md            # Роадмап проекта
```

---

## Технологический стек

| Слой | Технология | Версия |
|------|-----------|--------|
| Frontend | SvelteKit | 2.43.2 |
| | Svelte | 5.39.5 (runes) |
| | TypeScript | 5.9.2 |
| | Vite | 7.1.7 |
| Backend | Express.js | 5.1.0 |
| | AdminJS | 6.8.7 |
| | Sequelize | 6.37.5 |
| Database | SQLite | WAL mode, FTS5 |
| Security | bcrypt, AES-256-GCM | - |

---

## Что работает (100%)

### E-commerce Flow
- `/catalog` - каталог товаров из БД
- `/product/[slug]` - страница товара (галерея, specs, tabs)
- `/cart` - корзина (localStorage, +/-, badge)
- `/checkout` - форма заказа с валидацией
- `/order/success` - подтверждение (order_number генерируется)
- Сохранение в БД: `orders`, `order_items`, `order_status_history`

### Главная страница
- Hero Section (из `home_hero`)
- Collections (6 коллекций из `collections`)
- Showcase/Бестселлеры (из `products`)
- Experience (из `home_services` + `home_service_stats`)
- Testimonials (6 отзывов из `testimonials`)
- Editorial/Журнал (6 статей из `articles`)
- Telegram CTA (из `widgets`)

### Контент
- `/journal` + `/journal/[slug]` - статьи из БД
- `/about`, `/delivery`, `/warranty`, `/privacy`, `/terms` - из таблицы `pages`
- `/contacts` - форма + данные из БД
- `/city/[city]` - Programmatic SEO (3 города)

### Admin Panel (AdminJS)
- 30+ Sequelize моделей
- 9 групп ресурсов
- RBAC (super-admin, editor, viewer)
- CRUD операции

### База данных
- 36 таблиц production-ready
- FTS5 полнотекстовый поиск (schema готова)
- Seed: 3 бренда, 3 товара, 6 коллекций, 6 testimonials, 6 статей, 3 города

---

## Новое в декабре 2024

### Реализовано
- **Email/Telegram уведомления** — настраиваются через `site_config` в БД, работают в mock-режиме без конфигурации
- **Динамические фильтры каталога** — фильтры загружаются из `filter_attributes`/`filter_values`, работают через URL params
- **FTS5 поиск** — endpoint `/api/search` с prefix matching и fallback на LIKE
- **CSV импорт товаров** — CLI скрипт `npm run import:products` с транзакциями
- **Markdown импорт статей** — CLI скрипт `npm run import:articles` с YAML frontmatter
- **SEO поддомены** — `moscow.moditimewatch.ru` → `/city/moscow` через hooks
- **Graceful degradation** — placeholder для товаров без изображений, пустое состояние каталога

### Import Scripts
```bash
# Импорт товаров из CSV
npm run import:products ../data/products.csv --dry-run
npm run import:products ../data/products.csv --update

# Импорт статей из Markdown
npm run import:articles ../data/articles/ --dry-run
npm run import:articles ../data/articles/ --update
```

---

## Что требует доработки

### Приоритет 1: ВЫСОКИЙ

| Проблема | Описание | Оценка |
|----------|----------|--------|
| **Header submenu** | Данные в БД есть, не рендерится (CSS/JS issue) | 1-2 ч |
| **Pagination** | UI есть, backend support отсутствует | 2-3 ч |
| **Error logging** | Нет Sentry или аналога | 2-3 ч |

### Приоритет 2: СРЕДНИЙ

| Проблема | Описание | Оценка |
|----------|----------|--------|
| REST API endpoints | Только AdminJS, нет публичного API | 8-12 ч |
| Тесты | 0 тестов | 2-5 дней |
| Docker setup | Пустые директории | 2-3 ч |

---

## Безопасность

### Реализовано
- Encrypted sessions (AES-256-GCM)
- CSRF protection на всех формах
- Password hashing (bcrypt)
- Prepared statements (SQL injection protection)
- Input validation (XSS checks)
- Security headers (CSP, X-Frame-Options, HSTS)
- Rate limiting на login (frontend)

### Требует внимания
- Rate limiting на backend API
- Двухфакторная аутентификация
- Audit logs
- HTTPS enforcement в production

---

## Критические файлы

### Frontend
```
src/lib/server/db/database.ts      # SQL queries, 37 таблиц
src/routes/+layout.server.ts       # Data loading
src/hooks.server.ts                # Security middleware
src/lib/stores/cart.svelte.ts      # Корзина ($state)
src/routes/checkout/+page.server.ts # Order save
```

### Backend
```
src/index.ts    # Express entry point
src/db.ts       # Sequelize models (30+)
src/admin.ts    # AdminJS configuration
```

---

## Svelte 5 паттерны

### Cart Store (runes)
```typescript
// src/lib/stores/cart.svelte.ts
class CartStore {
    items = $state<CartItem[]>([]);

    get count() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    addItem(item) { ... }
    removeItem(id) { ... }
    clear() { ... }
}
export const cart = new CartStore();
```

### Использование в компонентах
```svelte
<script>
import { cart } from '$lib/stores/cart.svelte';
</script>

<span>{cart.count}</span>
<button onclick={() => cart.addItem(product)}>В корзину</button>
```

---

## Environment Variables

### frontend-sveltekit/.env
```
SESSION_SECRET=base64-encoded-secret-here
NODE_ENV=development
PUBLIC_GTM_ID=
PUBLIC_GA_ID=
PUBLIC_YM_ID=
```

### backend-expressjs/.env
```
PORT=3000
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
COOKIE_SECRET=your-secret-min-32-chars
SESSION_SECRET=your-secret-min-32-chars
```

---

## Troubleshooting

```bash
# Странное поведение Vite
rm -rf .svelte-kit node_modules && npm install && npm run dev

# SQLite disk I/O error
# Остановить оба dev сервера, перезагрузить

# TypeScript ошибки
npm run check

# Очистить кэш
rm -rf dist .svelte-kit && npm run build
```

---

## Готовность к деплою

| Компонент | Разработка | Production |
|-----------|-----------|------------|
| Frontend UI | 100% | 90% |
| Database schema | 100% | 95% |
| E-commerce flow | 100% | 85% |
| Admin panel | 100% | 70% |
| SEO | 100% | 90% |
| Search | 100% | 95% |
| Notifications | 100% | 80% |
| Import tools | 100% | 100% |
| DevOps | 0% | 0% |
| Tests | 0% | 0% |

**Общая готовность:** 95%

### Для Staging (готово!)
1. Email/Telegram уведомления настроены через БД
2. FTS5 поиск работает
3. Динамические фильтры подключены
4. SEO поддомены для городов

### Для Production (1 неделя)
1. Header submenu fix
2. Error logging (Sentry)
3. Docker setup
4. E2E тесты (Playwright)
5. PostgreSQL migration (для scale)

---

## Известные проблемы

1. **Header submenu** - данные загружаются, но не отображаются
2. **Yandex Metrika** - закомментирован в SeoManager (Svelte интерполяция в raw script)
3. **SSR/Hydration** - cart store загружается из localStorage только на клиенте
4. **SQLite ограничения** - OK до 10GB, для high-load нужен PostgreSQL

---

## Следующие шаги (MVP)

1. [ ] Email notifications (SendGrid/SMTP)
2. [ ] Telegram notifications (Bot API)
3. [ ] Header navigation fix
4. [ ] Catalog filters → БД
5. [ ] Search endpoint (FTS5)
6. [ ] Error logging (Sentry)
