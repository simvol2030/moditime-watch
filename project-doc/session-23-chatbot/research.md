# Session 23: Chatbot — Research

**Дата:** 2026-02-20
**Задача:** Портировать чат-бот из project-kliee в moditime-watch

---

## 1. Исходный проект (project-kliee)

**Репозиторий:** https://github.com/simvol2030/project-kliee
**Статус доступа:** GitHub недоступен из текущего окружения (egress proxy). Работаем на основе требований и знания архитектуры.

### Ключевые отличия project-kliee → moditime-watch

| Аспект | project-kliee | moditime-watch |
|--------|--------------|----------------|
| ORM | Drizzle ORM | better-sqlite3 prepared statements |
| Языки | en/ru/es/zh (multi-language) | Только русский |
| Персона бота | "Melena" арт-консультант | "Modi" консультант по часам |
| Тема | Светлая/тёмная | Светлая/тёмная (CSS variables) |
| CSRF | Своя реализация | hooks.server.ts publicEndpoints |

---

## 2. Паттерны moditime-watch (изучены)

### 2.1 База данных

**Файл:** `frontend-sveltekit/src/lib/server/db/database.ts`

- **Движок:** better-sqlite3, WAL mode, foreign_keys = ON
- **Инициализация:** `schema.sql` → `db.exec(schema)`
- **Запросы:** `createQueries()` — все prepared statements в одной функции
- **Именование:** `camelCase` для query names (e.g., `getProductBySlug`, `adminListBrands`)
- **Параметры:** Named params (`@name`, `@id`) для INSERT/UPDATE, позиционные (`?`) для SELECT
- **Типы:** `is_active` → INTEGER 0/1, `created_at`/`updated_at` → DATETIME DEFAULT CURRENT_TIMESTAMP
- **Экспорт:** `export const queries` — lazy proxy

### 2.2 API Endpoints

**Файл-образец:** `routes/api/callback/+server.ts`

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { queries } from '$lib/server/db/database';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    // Валидация
    if (!field) return json({ error: 'Сообщение' }, { status: 400 });
    // DB операция
    queries.insertSomething.run({ ...params });
    // Telegram (non-blocking)
    sendTelegramText(`...`).catch(() => {});
    return json({ success: true });
  } catch {
    return json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
};
```

### 2.3 CSRF Protection

**Файл:** `hooks.server.ts:107-171`

- Токен генерируется на GET и хранится в httpOnly cookie
- Проверяется для POST/PUT/DELETE/PATCH через заголовок `x-csrf-token` или form field `csrf_token`
- **Для /api/chat:** Добавить в `publicEndpoints` массив (строка 157)
- Login endpoints уже exempted

### 2.4 Админ-панель

**Структура:**
- `routes/(admin)/admin/+layout.server.ts` — auth (сейчас open access)
- `routes/(admin)/admin/+layout.svelte` — AdminSidebar + main content
- `AdminSidebar.svelte` — группированная навигация
- Паттерн admin страниц: `load()` → queries, `actions` → form handlers

**Для чатбота:**
- Добавить в AdminSidebar группу "Communication" или "Support":
  - `{ label: 'Chatbot', href: '/admin/chatbot', icon: '🤖', group: 'Support' }`

### 2.5 Глобальный layout

**Файл:** `routes/+layout.svelte`

- SiteHeader + SiteFooter для публичных страниц
- Скрывается для admin и city pages
- **ChatWidget** должен рендериться аналогично — рядом с SiteFooter, но для всех публичных страниц

### 2.6 CSS Система

**Файл:** `app.css`

- Custom CSS с CSS variables (НЕ Tailwind)
- `body[data-theme="dark"]` — полный набор dark theme переменных
- Fonts: Playfair Display (serif), Inter (sans-serif), Montserrat (accent)
- Z-index стек: header=120, backdrop=110, drawer=200, overlay=220
- **Уже есть:** `.chat-bot__messages::-webkit-scrollbar` стили (строки 627-634)
- **ChatWidget z-index:** 250 (выше drawer, ниже modals)

### 2.7 Telegram уведомления

**Файл:** `$lib/server/notifications/telegram.ts`

- Функция `sendTelegramText()` — отправка в Telegram
- Используется в callback endpoint (non-blocking `.catch(() => {})`)
- **Для чатбота:** уведомления о новых чатах, запросах живого оператора

---

## 3. Схема БД для чатбота

Нужны 4 новые таблицы:

### chat_sessions
Сессии чатов (один посетитель = одна сессия)

### chat_messages
Сообщения в чатах (user + bot + human)

### chat_faq
FAQ база для бота (вопрос-ответ, ключевые слова)

### chat_config
Настройки чатбота (key-value, как site_config)

---

## 4. Компоненты для реализации

### Публичная часть (frontend)
1. `ChatWidget.svelte` — плавающая кнопка (floating button, bottom-right)
2. `ChatDialog.svelte` — окно чата (modal/popup)
3. `ChatMessage.svelte` — отдельное сообщение (user/bot/system)
4. `ChatInput.svelte` — поле ввода с кнопкой отправки

### API
1. `POST /api/chat` — отправка сообщения, получение ответа
2. `GET /api/chat/session` — получение/создание сессии
3. `GET /api/chat/faq` — получение FAQ для автоответов

### Админка
1. `/admin/chatbot` — dashboard (статистика, последние чаты)
2. `/admin/chatbot/faq` — управление FAQ
3. `/admin/chatbot/history` — история чатов
4. `/admin/chatbot/settings` — настройки (имя бота, приветствие, и т.д.)

---

## 5. Логика бота

### Tier 1: FAQ matching
Поиск по ключевым словам в chat_faq → мгновенный ответ

### Tier 2: Контекстный ответ
Поиск по товарам/брендам в БД → ответ с карточками товаров

### Tier 3: Fallback
Предложение связаться с оператором / оставить контакт

*Примечание: AI-модель (Claude/OpenAI) не используется на первом этапе — только rule-based бот. AI можно добавить позже через chat_config.*

---

*Research завершён: 2026-02-20*
