# Session-23: AI Chatbot (портирование из project-kliee) — Спецификация

**Версия:** final
**Дата:** 2026-02-19
**Исходный проект:** https://github.com/simvol2030/project-kliee
**Целевой проект:** moditime-watch (https://moditime-watch.ru)

**Исходные файлы (полный список):**
- `frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte`
- `frontend-sveltekit/src/lib/stores/chat.svelte.ts`
- `frontend-sveltekit/src/lib/types/chat.types.ts`
- `frontend-sveltekit/src/lib/server/openrouter.ts`
- `frontend-sveltekit/src/lib/server/faq-search.ts`
- `frontend-sveltekit/src/routes/api/chat/+server.ts`
- `frontend-sveltekit/src/routes/(admin)/chatbot/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.server.ts`
- `frontend-sveltekit/src/routes/(admin)/chatbot/faq/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/chatbot/faq/+page.server.ts`
- `frontend-sveltekit/src/routes/(admin)/chatbot/faq/[id]/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/chatbot/faq/[id]/+page.server.ts`
- `frontend-sveltekit/src/routes/(admin)/chatbot/history/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/chatbot/history/+page.server.ts`
- `frontend-sveltekit/src/routes/(admin)/chatbot/history/[id]/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/chatbot/history/[id]/+page.server.ts`
- `frontend-sveltekit/src/lib/server/db/schema.ts` (chatbot tables section)

---

## Есть сейчас vs Должно быть

| Аспект | Есть (moditime-watch) | Должно быть |
|--------|----------------------|-------------|
| Чат-бот | Отсутствует | AI-консультант по часам на базе OpenRouter |
| FAQ база знаний | Отсутствует | CRUD для FAQ с keyword-matching grounding |
| История чатов | Отсутствует | Просмотр/удаление/пометка сессий в админке |
| Настройки чатбота | Отсутствует | Модель, температура, system prompt, API key, аватар |
| Виджет на публичных страницах | Отсутствует | Floating Action Button + чат-окно (mobile fullscreen) |
| Sidebar в админке | Нет пункта "Chatbot" | Новая группа "AI" с тремя ссылками |

---

## Что на выходе

### AI-консультант "Моди" (адаптация "Melena" из project-kliee)

1. **Публичный чат-виджет** — FAB кнопка внизу справа на всех публичных страницах:
   - Плавающая кнопка чата
   - Окно чата с историей сообщений
   - Typing indicator, auto-scroll, очистка истории
   - Fullscreen на мобильных (< 480px)
   - sessionStorage для сохранения истории внутри сессии браузера

2. **OpenRouter интеграция** — серверный клиент:
   - Retry с exponential backoff (3 попытки)
   - Fallback модели (gpt-4o-mini -> gpt-3.5-turbo -> gemini-flash -> claude-haiku -> llama)
   - Rate limiting (20 сообщений/минуту per IP)
   - FAQ grounding (подмешивание релевантных FAQ в контекст)

3. **Admin panel** — три страницы:
   - Settings: модель, температура, max_tokens, system prompt, приветствия, API key, аватар, вкл/выкл
   - FAQ: CRUD записей (вопрос/ответ на RU, keywords), toggle active, inline-создание
   - History: таблица сессий с кол-вом сообщений, save/delete, просмотр переписки, admin notes

---

## Что нужно сделать

### 1. БД — 4 таблицы для чатбота

Добавить в `schema.sql` и выполнить миграцию. SQL адаптирован из Drizzle ORM schema (project-kliee) в raw SQLite DDL:

```sql
-- ============================================
-- CHATBOT MODULE (AI Consultant "Modi")
-- ============================================

-- Настройки AI-консультанта (singleton)
CREATE TABLE IF NOT EXISTS chatbot_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  api_key TEXT,                           -- OpenRouter API key (overrides env)
  system_prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'openai/gpt-4o-mini',
  temperature TEXT DEFAULT '0.7',
  max_tokens INTEGER DEFAULT 1024,
  greeting_ru TEXT,                        -- moditime = только русский язык
  avatar_url TEXT,
  is_enabled INTEGER DEFAULT 1,           -- boolean: 0/1
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FAQ база знаний для grounding
CREATE TABLE IF NOT EXISTS chat_faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,                  -- вопрос (RU)
  answer TEXT NOT NULL,                    -- ответ (RU)
  keywords TEXT,                           -- JSON array для search
  is_active INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Сессии чата с посетителями
CREATE TABLE IF NOT EXISTS chatbot_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL UNIQUE,
  visitor_id TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_message_at DATETIME,
  is_saved INTEGER DEFAULT 0,
  admin_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_session_id ON chatbot_sessions(session_id);

-- Сообщения в чате
CREATE TABLE IF NOT EXISTS chatbot_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (session_id) REFERENCES chatbot_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session_id ON chatbot_messages(session_id);
```

**Отличия от project-kliee:**
- Убрана мультиязычность (greeting_en/ru/es/zh -> только greeting_ru)
- FAQ: question_en/ru/es/zh -> одно поле question (RU)
- FAQ: answer_en/ru/es/zh -> одно поле answer (RU)
- chatbot_sessions: убрано поле lang (всегда RU)
- Модель по умолчанию: `openai/gpt-4o-mini` (вместо `anthropic/claude-3-haiku`)

**Seed данные:**
```sql
INSERT INTO chatbot_settings (system_prompt, model, temperature, max_tokens, greeting_ru, is_enabled)
VALUES (
  'Ты — Моди, AI-консультант интернет-магазина премиальных часов Moditime.

Твоя роль:
- Помогать посетителям выбрать часы по бюджету, стилю и назначению
- Отвечать на вопросы о брендах, механизмах, материалах
- Консультировать по доставке, гарантии и возврату
- Направлять в каталог или к конкретным моделям

Правила:
- Отвечай на русском языке
- Будь вежливым, экспертным и лаконичным
- Не обсуждай темы, не связанные с часами и магазином
- Если не знаешь ответ — предложи связаться с менеджером
- Упоминай конкретные бренды и модели когда уместно',
  'openai/gpt-4o-mini',
  '0.7',
  1024,
  'Здравствуйте! Я Моди, ваш консультант по часам. Чем могу помочь?',
  1
);
```

### 2. Backend — OpenRouter клиент + FAQ search + API endpoint

**2.1 OpenRouter клиент**
Источник: [frontend-sveltekit/src/lib/server/openrouter.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/openrouter.ts)

Скопировать и адаптировать:
- Заменить `$env/dynamic/private` на `process.env.OPENROUTER_API_KEY`
- Заменить HTTP-Referer на `https://moditime-watch.ru`
- Заменить X-Title на `Moditime Watch Consultant Modi`
- DEFAULT_SYSTEM_PROMPT — заменить на промпт про часы (см. seed выше)
- AVAILABLE_MODELS — оставить как есть

Целевой файл: `frontend-sveltekit/src/lib/server/openrouter.ts`

**2.2 FAQ search**
Источник: [frontend-sveltekit/src/lib/server/faq-search.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/faq-search.ts)

Полностью переписать: заменить Drizzle ORM на better-sqlite3 prepared statements:
- `db.select().from(chatFaq).where(...)` -> `db.prepare('SELECT * FROM chat_faq WHERE is_active = 1').all()`
- Убрать мультиязычную логику (question_en/ru -> одно поле question)
- calculateMatchScore и formatFaqContext — скопировать как есть (чистые функции)

Целевой файл: `frontend-sveltekit/src/lib/server/faq-search.ts`

**2.3 Chat API endpoint**
Источник: [frontend-sveltekit/src/routes/api/chat/+server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/api/chat/+server.ts)

Полностью переписать с Drizzle на better-sqlite3:
- GET /api/chat — вернуть настройки и приветствие
- POST /api/chat — отправить сообщение и получить AI ответ
- Rate limiting — скопировать in-memory реализацию
- getSettings() — `db.prepare('SELECT * FROM chatbot_settings LIMIT 1').get()`
- ensureSession() — `db.prepare('INSERT OR IGNORE INTO chatbot_sessions ...').run()`
- getConversationHistory() — `db.prepare('SELECT * FROM chatbot_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?').all()`
- saveMessage() — `db.prepare('INSERT INTO chatbot_messages ...').run()`

**CSRF совместимость:** POST /api/chat вызывается с публичных страниц (без admin auth). В moditime-watch CSRF проверяется в hooks.server.ts. Варианты:
- Добавить `/api/chat` в исключения CSRF (рекомендуется, т.к. rate limiting уже защищает)
- Или передавать CSRF token из layout -> store -> fetch header

Целевой файл: `frontend-sveltekit/src/routes/api/chat/+server.ts`

### 3. Frontend — ChatWidget + store + types

**3.1 Types**
Источник: [frontend-sveltekit/src/lib/types/chat.types.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/types/chat.types.ts)

Скопировать и адаптировать:
- Убрать ChatLanguage type (всегда RU)
- Убрать мультиязычные поля из ChatSettings
- Убрать DEFAULT_GREETINGS
- ChatMessage, ChatApiRequest, ChatApiResponse — оставить как есть
- FaqItem — упростить (одно поле question/answer вместо мультиязычных)

Целевой файл: `frontend-sveltekit/src/lib/types/chat.types.ts`

**3.2 Chat Store**
Источник: [frontend-sveltekit/src/lib/stores/chat.svelte.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/stores/chat.svelte.ts)

Скопировать и адаптировать:
- Убрать параметр lang из init() и sendMessage()
- STORAGE_KEY: `modi_chat_session` (вместо `melena_chat_session`)
- SESSION_ID_KEY: `modi_session_id`
- init() — fetch `/api/chat` без `?lang=...`
- sendMessage() — fetch `/api/chat` без lang в body

Целевой файл: `frontend-sveltekit/src/lib/stores/chat.svelte.ts`

**3.3 ChatWidget**
Источник: [frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte)

Скопировать и адаптировать:
- Убрать import `page` store и логику определения языка
- Убрать объект placeholders — один placeholder: `'Введите сообщение...'`
- Заменить "Melena" -> "Моди"
- Заменить "Chat with Melena" -> "Чат с Моди"
- Заменить "M" (avatar placeholder) -> "М"
- CSS: заменить `var(--accent, #d4af37)` на переменные moditime-watch (проверить какие)
- CSS: адаптировать dark mode (moditime-watch может использовать другие CSS custom properties)
- z-index: согласовать с моditimе-watch'овскими z-index

Размещение виджета: добавить `<ChatWidget />` в публичный layout (`src/routes/+layout.svelte`)

Целевой файл: `frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte`

### 4. Admin — Settings + FAQ CRUD + History

**Важно:** moditime-watch admin использует собственный layout (`/admin/+layout.svelte` с AdminSidebar). Все admin pages в project-kliee расположены под `(admin)/chatbot/...`, в moditime-watch они должны быть под `(admin)/admin/chatbot/...`.

**4.1 Admin sidebar**
Добавить в `AdminSidebar.svelte` новую группу "AI":
```typescript
{ label: 'Chatbot Settings', href: '/admin/chatbot/settings', icon: '🤖', group: 'AI' },
{ label: 'FAQ Knowledge Base', href: '/admin/chatbot/faq', icon: '❓', group: 'AI' },
{ label: 'Chat History', href: '/admin/chatbot/history', icon: '💬', group: 'AI' },
```

**4.2 Chatbot Settings page**
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/settings/%2Bpage.svelte)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/settings/%2Bpage.server.ts)

Скопировать и адаптировать:
- +page.server.ts: переписать Drizzle -> better-sqlite3 prepared statements
- +page.svelte: убрать мультиязычные поля greeting (оставить только RU)
- +page.svelte: убрать avatar upload через `/api/media/upload` (moditime не имеет media API; вместо этого — просто текстовое поле для URL или убрать аватар)
- Все пути внутри hrefs: `/chatbot/...` -> `/admin/chatbot/...`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/+page.svelte` (redirect)
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/settings/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/settings/+page.server.ts`

**4.3 FAQ pages**
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%2Bpage.svelte)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%2Bpage.server.ts)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/[id]/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%5Bid%5D/%2Bpage.svelte)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/[id]/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%5Bid%5D/%2Bpage.server.ts)

Скопировать и адаптировать:
- Все .server.ts файлы: переписать Drizzle -> better-sqlite3
- Убрать мультиязычные поля (en/ru/es/zh -> одно русское поле question/answer)
- Пути: `/chatbot/faq/...` -> `/admin/chatbot/faq/...`
- CsrfToken компонент — в moditime-watch уже есть, использовать его

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/+page.server.ts`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/[id]/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/[id]/+page.server.ts`

**4.4 History pages**
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/history/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%2Bpage.svelte)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/history/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%2Bpage.server.ts)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/history/[id]/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%5Bid%5D/%2Bpage.svelte)
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/history/[id]/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%5Bid%5D/%2Bpage.server.ts)

Скопировать и адаптировать:
- Все .server.ts файлы: переписать Drizzle -> better-sqlite3
- Убрать поле Language из таблицы/отображения (всегда RU)
- "Melena" -> "Моди", "Visitor" -> "Посетитель"
- Пути: `/chatbot/history/...` -> `/admin/chatbot/history/...`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/+page.server.ts`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/[id]/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/[id]/+page.server.ts`

### 5. Интеграция

1. **AdminSidebar** — добавить группу "AI" с 3 ссылками (Chatbot Settings, FAQ Knowledge Base, Chat History)
2. **Public layout** — добавить `<ChatWidget />` в `src/routes/+layout.svelte`
3. **CSRF** — добавить `/api/chat` в исключения CSRF validation в `hooks.server.ts`
4. **Environment** — добавить `OPENROUTER_API_KEY` в `.env` и `.env.example`
5. **schema.sql** — добавить 4 таблицы chatbot в конец файла
6. **database.ts** — добавить интерфейсы для новых таблиц (ChatbotSettings, ChatFaq, ChatbotSession, ChatbotMessage)

---

## Исходные файлы (полный маппинг)

| # | Source Path (project-kliee) | Target Path (moditime-watch) | Action |
|---|---------------------------|------------------------------|--------|
| 1 | `schema.ts` (chatbot tables section) | `schema.sql` + `database.ts` | Rewrite (Drizzle -> raw SQLite DDL + interfaces) |
| 2 | `src/lib/server/openrouter.ts` | `src/lib/server/openrouter.ts` | Copy + adapt (env vars, branding) |
| 3 | `src/lib/server/faq-search.ts` | `src/lib/server/faq-search.ts` | Rewrite (Drizzle -> better-sqlite3, remove i18n) |
| 4 | `src/routes/api/chat/+server.ts` | `src/routes/api/chat/+server.ts` | Rewrite (Drizzle -> better-sqlite3, remove i18n) |
| 5 | `src/lib/types/chat.types.ts` | `src/lib/types/chat.types.ts` | Copy + simplify (remove i18n types) |
| 6 | `src/lib/stores/chat.svelte.ts` | `src/lib/stores/chat.svelte.ts` | Copy + adapt (remove lang, rename keys) |
| 7 | `src/lib/components/chat/ChatWidget.svelte` | `src/lib/components/chat/ChatWidget.svelte` | Copy + adapt (remove i18n, rebrand, CSS vars) |
| 8 | `src/routes/(admin)/chatbot/+page.svelte` | `src/routes/(admin)/admin/chatbot/+page.svelte` | Copy + fix redirect path |
| 9 | `src/routes/(admin)/chatbot/settings/+page.svelte` | `src/routes/(admin)/admin/chatbot/settings/+page.svelte` | Copy + adapt (remove i18n fields, simplify avatar) |
| 10 | `src/routes/(admin)/chatbot/settings/+page.server.ts` | `src/routes/(admin)/admin/chatbot/settings/+page.server.ts` | Rewrite (Drizzle -> better-sqlite3) |
| 11 | `src/routes/(admin)/chatbot/faq/+page.svelte` | `src/routes/(admin)/admin/chatbot/faq/+page.svelte` | Copy + adapt (remove i18n, fix paths) |
| 12 | `src/routes/(admin)/chatbot/faq/+page.server.ts` | `src/routes/(admin)/admin/chatbot/faq/+page.server.ts` | Rewrite (Drizzle -> better-sqlite3) |
| 13 | `src/routes/(admin)/chatbot/faq/[id]/+page.svelte` | `src/routes/(admin)/admin/chatbot/faq/[id]/+page.svelte` | Copy + adapt (remove i18n, fix paths) |
| 14 | `src/routes/(admin)/chatbot/faq/[id]/+page.server.ts` | `src/routes/(admin)/admin/chatbot/faq/[id]/+page.server.ts` | Rewrite (Drizzle -> better-sqlite3) |
| 15 | `src/routes/(admin)/chatbot/history/+page.svelte` | `src/routes/(admin)/admin/chatbot/history/+page.svelte` | Copy + adapt (remove lang column, rebrand) |
| 16 | `src/routes/(admin)/chatbot/history/+page.server.ts` | `src/routes/(admin)/admin/chatbot/history/+page.server.ts` | Rewrite (Drizzle -> better-sqlite3) |
| 17 | `src/routes/(admin)/chatbot/history/[id]/+page.svelte` | `src/routes/(admin)/admin/chatbot/history/[id]/+page.svelte` | Copy + adapt (rebrand Melena -> Modi) |
| 18 | `src/routes/(admin)/chatbot/history/[id]/+page.server.ts` | `src/routes/(admin)/admin/chatbot/history/[id]/+page.server.ts` | Rewrite (Drizzle -> better-sqlite3) |
| 19 | — (integration) | `src/lib/components/admin/AdminSidebar.svelte` | Edit (add AI group) |
| 20 | — (integration) | `src/routes/+layout.svelte` | Edit (add ChatWidget) |
| 21 | — (integration) | `src/hooks.server.ts` | Edit (CSRF exemption for /api/chat) |
| 22 | — (integration) | `.env` / `.env.example` | Edit (add OPENROUTER_API_KEY) |

---

## Факторы реализации

- **moditime uses better-sqlite3 with prepared statements (NOT Drizzle ORM)** — все 6 server-side файлов (faq-search, api/chat, 4x page.server.ts) содержат Drizzle-специфичный код (`db.select().from()`, `eq()`, `desc()`, etc.) который нужно полностью переписать на `db.prepare('SQL').all()` / `.get()` / `.run()`
- **moditime uses CSRF protection** — POST /api/chat вызывается с публичных страниц без admin auth; нужно добавить `/api/chat` в исключения CSRF в `hooks.server.ts` (rate limiting в самом endpoint обеспечивает защиту от abuse)
- **moditime admin layout is custom** — admin pages расположены под `/admin/...` (не `/chatbot/...`); используется `AdminSidebar.svelte` с группами навигации
- **System prompt must be about watches, not art** — полностью заменить промпт Melena (art consultant) на Modi (watch consultant)
- **moditime-watch is Russian-only** — убрать всю мультиязычность (en/ru/es/zh -> только RU); project-kliee имеет 4-язычный чат
- **CSS must support moditime's admin theme** — admin использует `#f3f4f6` background, Inter font; публичный виджет использует CSS custom properties (`--accent`, `--bg-primary`, etc.) которые нужно проверить на совместимость
- **Avatar upload** — project-kliee использует `/api/media/upload` для аватара; moditime не имеет такого endpoint; упростить до текстового поля URL или пропустить
- **CsrfToken component** — уже существует в moditime-watch (`src/lib/components/CsrfToken.svelte`), импорт совместим

---

## Критерии успеха

- [ ] Чат-виджет виден на всех публичных страницах (FAB кнопка внизу справа)
- [ ] Клик на FAB открывает окно чата с приветственным сообщением от Моди
- [ ] Пользователь может отправить сообщение и получить AI-ответ
- [ ] История сообщений сохраняется в sessionStorage и в БД
- [ ] Rate limiting работает (20 msg/min per IP)
- [ ] При ошибке API — пользователь видит сообщение об ошибке
- [ ] FAQ grounding: если вопрос матчит FAQ — контекст подмешивается в system prompt
- [ ] Admin: Settings page позволяет изменить модель, temperature, prompt, greeting, вкл/выкл
- [ ] Admin: FAQ page позволяет создать/редактировать/удалить/toggle FAQ записи
- [ ] Admin: History page показывает список сессий с message count, позволяет просмотреть/удалить/пометить
- [ ] Admin: History detail показывает переписку и позволяет добавить admin note
- [ ] AdminSidebar содержит группу "AI" с тремя ссылками
- [ ] Mobile: чат-окно fullscreen на экранах < 480px
- [ ] Нет ошибок в console при открытии/закрытии/отправке
- [ ] CSRF не блокирует POST /api/chat с публичных страниц
