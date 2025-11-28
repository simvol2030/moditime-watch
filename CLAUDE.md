# Moditimewatch - E-commerce для премиальных часов

**Обновлено:** 25 ноября 2024
**Статус:** MVP 78% | Staging Ready 85% | Production Ready 60%

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

## Что требует доработки

### Приоритет 1: КРИТИЧЕСКИЙ (блокирует production)

| Проблема | Файлы | Оценка |
|----------|-------|--------|
| **Email уведомления** - mock реализация | `src/lib/server/notifications/email.ts` | 2-3 ч |
| **Telegram уведомления** - mock реализация | `src/lib/server/notifications/telegram.ts` | 1-2 ч |
| **Фильтры каталога** - UI есть, не соединены с БД | `CatalogFilters.svelte`, API endpoints | 3-4 ч |
| **FTS5 поиск** - schema есть, endpoint отсутствует | Нужен `/api/search` | 2-3 ч |

### Приоритет 2: ВЫСОКИЙ

| Проблема | Описание | Оценка |
|----------|----------|--------|
| **Header submenu** | Данные в БД есть, не рендерится (CSS/JS issue) | 1-2 ч |
| **Pagination** | UI есть, backend support отсутствует | 2-3 ч |
| **Error logging** | Нет Sentry или аналога | 2-3 ч |
| **Rate limiting backend** | Только на frontend | 1-2 ч |

### Приоритет 3: СРЕДНИЙ

| Проблема | Описание | Оценка |
|----------|----------|--------|
| Поддомены для городов | Не реализовано | 4-6 ч |
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
| Frontend UI | 100% | 75% |
| Database schema | 100% | 85% |
| E-commerce flow | 90% | 50% (notifications!) |
| Admin panel | 100% | 70% |
| SEO | 100% | 70% |
| Search | 10% | 0% |
| Notifications | 20% | 0% |
| DevOps | 0% | 0% |
| Tests | 0% | 0% |

**Общая готовность:** 78%

### Для Staging (1-2 дня)
1. Настроить email notifications
2. Исправить header navigation
3. Добавить error logging

### Для Production (2-3 недели)
1. Email/Telegram notifications
2. REST API endpoints
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
