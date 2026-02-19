# Session-23: AI Chatbot — Roadmap Start

**Дата:** 2026-02-19
**Спецификация:** `project-doc/session-23-chatbot/spec-final.md`
**Исходный проект:** https://github.com/simvol2030/project-kliee

---

## Задачи

### Task 1: DB — 4 таблицы + prepared statements + seed
**Score: 4** (Сложность 1×3=3 + Файлы 0×2=0 + Риск 0×2=0 + Время 1×1=1)
**Статус:** ⏳ PENDING

**Что сделать:**
1. Добавить 4 таблицы в `schema.sql`:
   - `chatbot_settings` (singleton: api_key, system_prompt, model, temperature, max_tokens, greeting_ru, avatar_url, is_enabled)
   - `chat_faq` (question, answer, keywords, is_active, order_index)
   - `chatbot_sessions` (session_id, visitor_id, started_at, last_message_at, is_saved, admin_note)
   - `chatbot_messages` (session_id, role, content, tokens_used, created_at)
2. Добавить индексы: `idx_chatbot_sessions_session_id`, `idx_chatbot_messages_session_id`
3. Добавить TypeScript интерфейсы в `database.ts`: ChatbotSettings, ChatFaq, ChatbotSession, ChatbotMessage
4. Добавить seed данные для `chatbot_settings` (system prompt про часы, greeting_ru)
5. Написать SQL миграцию для существующих БД (production)

**Источник SQL-схемы (Drizzle ORM -> адаптировать в raw SQLite DDL):**
- [frontend-sveltekit/src/lib/server/db/schema.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/db/schema.ts) — строки 840-901 (chatbot section)
- Точный SQL: см. `spec-final.md`, раздел "1. БД"

**Файлы:**
- `schema.sql` — добавить таблицы в конец
- `frontend-sveltekit/src/lib/server/db/database.ts` — добавить интерфейсы
- `migrations/023-chatbot-tables.sql` — миграция для production

**Критерии готовности:**
- [ ] 4 таблицы создаются без ошибок
- [ ] Seed данные вставляются (chatbot_settings с промптом про часы)
- [ ] Интерфейсы TypeScript соответствуют таблицам
- [ ] Миграция работает на существующей БД

---

### Task 2: Backend — OpenRouter client + FAQ search + API /api/chat
**Score: 5** (Сложность 2×3=6 + Файлы 1×2=2 + Риск 1×2=2 + Время 1×1=1 → capped at framework)
**Статус:** ⏳ PENDING
**Зависимости:** Task 1 (нужны таблицы в БД)

**Что сделать:**

**2.1 OpenRouter клиент — COPY + ADAPT:**
Источник: [frontend-sveltekit/src/lib/server/openrouter.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/openrouter.ts)

Изменения:
- `import { env } from '$env/dynamic/private'` -> `const apiKey = settings.apiKey || process.env.OPENROUTER_API_KEY`
- HTTP-Referer: `https://k-liee.com` -> `https://moditime-watch.ru`
- X-Title: `K-LIEE Art Consultant Melena` -> `Moditime Watch Consultant Modi`
- DEFAULT_SYSTEM_PROMPT: полностью заменить (art -> watches)
- AVAILABLE_MODELS, FALLBACK_MODELS, retry logic: скопировать без изменений

Целевой файл: `frontend-sveltekit/src/lib/server/openrouter.ts`

**2.2 FAQ search — REWRITE (Drizzle -> better-sqlite3):**
Источник: [frontend-sveltekit/src/lib/server/faq-search.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/faq-search.ts)

Изменения:
- `import { db } from '$lib/server/db/client'` -> `import { db } from '$lib/server/db/database'`
- `db.select().from(chatFaq).where(eq(chatFaq.is_active, true))` -> `db.prepare('SELECT * FROM chat_faq WHERE is_active = 1').all()`
- Убрать мультиязычную логику (`question_${lang}` -> просто `question`)
- `calculateMatchScore()` и `formatFaqContext()` — скопировать без изменений (чистые функции)

Целевой файл: `frontend-sveltekit/src/lib/server/faq-search.ts`

**2.3 API endpoint — REWRITE (Drizzle -> better-sqlite3):**
Источник: [frontend-sveltekit/src/routes/api/chat/+server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/api/chat/%2Bserver.ts)

Изменения:
- Все Drizzle запросы -> prepared statements:
  - `getSettings()`: `db.prepare('SELECT * FROM chatbot_settings LIMIT 1').get()`
  - `ensureSession()`: `db.prepare('INSERT OR IGNORE INTO chatbot_sessions (session_id, started_at) VALUES (?, ?)').run()`
  - `getConversationHistory()`: `db.prepare('SELECT role, content FROM chatbot_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?').all()`
  - `saveMessage()`: `db.prepare('INSERT INTO chatbot_messages (session_id, role, content, tokens_used, created_at) VALUES (?, ?, ?, ?, ?)').run()`
  - update last_message_at: `db.prepare('UPDATE chatbot_sessions SET last_message_at = ? WHERE session_id = ?').run()`
- Убрать lang из GET и POST
- Rate limiting: скопировать in-memory реализацию без изменений
- Sanitization: скопировать без изменений

Целевой файл: `frontend-sveltekit/src/routes/api/chat/+server.ts`

**2.4 CSRF исключение:**
- В `hooks.server.ts`: добавить `/api/chat` в список путей, освобождённых от CSRF проверки

**2.5 Environment:**
- Добавить `OPENROUTER_API_KEY=` в `.env` и `.env.example`

**Файлы:**
- `frontend-sveltekit/src/lib/server/openrouter.ts` — новый файл
- `frontend-sveltekit/src/lib/server/faq-search.ts` — новый файл
- `frontend-sveltekit/src/routes/api/chat/+server.ts` — новый файл
- `frontend-sveltekit/src/hooks.server.ts` — edit (CSRF exemption)
- `.env` / `.env.example` — edit (add OPENROUTER_API_KEY)

**Критерии готовности:**
- [ ] GET /api/chat возвращает `{ enabled, greeting, model }`
- [ ] POST /api/chat принимает `{ message, session_id }` и возвращает AI ответ
- [ ] Rate limiting блокирует > 20 msg/min per IP
- [ ] FAQ grounding подмешивается в контекст при совпадении keywords
- [ ] Fallback модели работают (при ошибке primary переключается на следующую)
- [ ] CSRF не блокирует POST /api/chat

---

### Task 3: Frontend — ChatWidget + store + types + theme adaptation
**Score: 7** (Сложность 2×3=6 + Файлы 1×2=2 + Риск 0×2=0 + Время 1×1=1 → adjusted for CSS work)
**Статус:** ⏳ PENDING
**Зависимости:** Task 2 (нужен API endpoint)

**Что сделать:**

**3.1 Types — COPY + SIMPLIFY:**
Источник: [frontend-sveltekit/src/lib/types/chat.types.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/types/chat.types.ts)

Изменения:
- Убрать `ChatLanguage` type
- Убрать мультиязычные поля из `ChatSettings`
- Убрать `DEFAULT_GREETINGS`
- Оставить: `ChatMessage`, `ChatApiRequest`, `ChatApiResponse`, `ChatWidgetState`
- `FaqItem`: упростить (question: string, answer: string — без i18n)

Целевой файл: `frontend-sveltekit/src/lib/types/chat.types.ts`

**3.2 Chat Store — COPY + ADAPT:**
Источник: [frontend-sveltekit/src/lib/stores/chat.svelte.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/stores/chat.svelte.ts)

Изменения:
- `STORAGE_KEY`: `modi_chat_session`
- `SESSION_ID_KEY`: `modi_session_id`
- `init(lang)` -> `init()` (без параметра lang)
- `sendMessage(content, lang)` -> `sendMessage(content)` (без lang)
- fetch URL: `/api/chat?lang=${lang}` -> `/api/chat`
- POST body: убрать `lang` из JSON

Целевой файл: `frontend-sveltekit/src/lib/stores/chat.svelte.ts`

**3.3 ChatWidget — COPY + ADAPT + RETHEME:**
Источник: [frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte)

Изменения:
- Убрать `import { page }` и определение языка
- Убрать объект `placeholders` — hardcode `'Введите сообщение...'`
- "Melena" -> "Моди" (все вхождения)
- "Chat with Melena" -> "Чат с Моди"
- "M" (avatar) -> "М"
- "Online" -> "Онлайн"
- "Clear chat" -> "Очистить чат"
- "Close chat" -> "Закрыть чат"
- "Send message" -> "Отправить"
- CSS: проверить совместимость `var(--accent)`, `var(--bg-primary)`, `var(--text-primary)` с moditime-watch theme
- z-index: проверить `var(--z-fixed)`, `var(--z-modal)` — в moditime-watch могут быть другие

Целевой файл: `frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte`

**3.4 Интеграция в layout:**
- Добавить `<ChatWidget />` в `src/routes/+layout.svelte` (публичный layout)
- Import: `import ChatWidget from '$lib/components/chat/ChatWidget.svelte'`

**Файлы:**
- `frontend-sveltekit/src/lib/types/chat.types.ts` — новый файл
- `frontend-sveltekit/src/lib/stores/chat.svelte.ts` — новый файл
- `frontend-sveltekit/src/lib/components/chat/ChatWidget.svelte` — новый файл
- `frontend-sveltekit/src/routes/+layout.svelte` — edit (add ChatWidget)

**Критерии готовности:**
- [ ] FAB кнопка видна внизу справа на всех публичных страницах
- [ ] Клик открывает окно чата с приветствием от Моди
- [ ] Сообщение отправляется и AI-ответ отображается
- [ ] Typing indicator работает (три точки)
- [ ] Auto-scroll при новых сообщениях
- [ ] Кнопка очистки работает
- [ ] sessionStorage сохраняет историю при навигации
- [ ] Mobile: fullscreen на < 480px
- [ ] Нет ошибок в console

---

### Task 4: Admin — settings + FAQ CRUD + history + sidebar
**Score: 8** (Сложность 2×3=6 + Файлы 3×2=6 + Риск 1×2=2 + Время 2×1=2 → adjusted)
**Статус:** ⏳ PENDING
**Зависимости:** Task 1 (нужны таблицы), Task 2 (openrouter.ts для AVAILABLE_MODELS)

**Что сделать:**

**4.1 AdminSidebar — EDIT:**
Источник: нет (интеграция)
Файл: `frontend-sveltekit/src/lib/components/admin/AdminSidebar.svelte`

Добавить в массив `navItems` перед группой "System":
```typescript
{ label: 'Chatbot Settings', href: '/admin/chatbot/settings', icon: '🤖', group: 'AI' },
{ label: 'FAQ Knowledge Base', href: '/admin/chatbot/faq', icon: '❓', group: 'AI' },
{ label: 'Chat History', href: '/admin/chatbot/history', icon: '💬', group: 'AI' },
```

**4.2 Redirect page — COPY + ADAPT:**
Источник: [frontend-sveltekit/src/routes/(admin)/chatbot/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/%2Bpage.svelte)

Изменение: `goto('/chatbot/settings')` -> `goto('/admin/chatbot/settings')`

Целевой файл: `frontend-sveltekit/src/routes/(admin)/admin/chatbot/+page.svelte`

**4.3 Settings page — COPY + REWRITE server:**
Источник +page.svelte: [frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/settings/%2Bpage.svelte)
Источник +page.server.ts: [frontend-sveltekit/src/routes/(admin)/chatbot/settings/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/settings/%2Bpage.server.ts)

Изменения в .svelte:
- Убрать greeting_en/es/zh — оставить только greeting_ru
- Avatar: заменить upload на текстовое поле URL (убрать fetch `/api/media/upload`)
- Заголовок: "Melena" -> "Моди"

Изменения в .server.ts:
- Drizzle -> better-sqlite3:
  - load: `db.prepare('SELECT * FROM chatbot_settings LIMIT 1').get()`
  - save (update): `db.prepare('UPDATE chatbot_settings SET ... WHERE id = ?').run()`
  - save (insert): `db.prepare('INSERT INTO chatbot_settings (...) VALUES (...)').run()`
- Import AVAILABLE_MODELS из `$lib/server/openrouter`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/settings/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/settings/+page.server.ts`

**4.4 FAQ list page — COPY + REWRITE server:**
Источник +page.svelte: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%2Bpage.svelte)
Источник +page.server.ts: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%2Bpage.server.ts)

Изменения в .svelte:
- Убрать мультиязычные поля (question_en/ru/es/zh -> одно поле question)
- Убрать мультиязычные поля (answer_en/ru/es/zh -> одно поле answer)
- Путь edit: `/chatbot/faq/{id}` -> `/admin/chatbot/faq/{id}`

Изменения в .server.ts:
- Drizzle -> better-sqlite3:
  - load: `db.prepare('SELECT * FROM chat_faq ORDER BY order_index ASC').all()`
  - create: `db.prepare('INSERT INTO chat_faq (question, answer, keywords, is_active, order_index) VALUES (?, ?, ?, 1, ?)').run()`
  - delete: `db.prepare('DELETE FROM chat_faq WHERE id = ?').run(id)`
  - toggle: `db.prepare('UPDATE chat_faq SET is_active = ? WHERE id = ?').run()`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/+page.server.ts`

**4.5 FAQ edit page — COPY + REWRITE server:**
Источник +page.svelte: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/[id]/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%5Bid%5D/%2Bpage.svelte)
Источник +page.server.ts: [frontend-sveltekit/src/routes/(admin)/chatbot/faq/[id]/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/faq/%5Bid%5D/%2Bpage.server.ts)

Изменения в .svelte:
- Убрать мультиязычные поля
- Путь back: `/chatbot/faq` -> `/admin/chatbot/faq`

Изменения в .server.ts:
- Drizzle -> better-sqlite3:
  - load: `db.prepare('SELECT * FROM chat_faq WHERE id = ?').get(id)`
  - update: `db.prepare('UPDATE chat_faq SET question = ?, answer = ?, keywords = ? WHERE id = ?').run()`
  - redirect: `/chatbot/faq` -> `/admin/chatbot/faq`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/[id]/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/[id]/+page.server.ts`

**4.6 History list page — COPY + REWRITE server:**
Источник +page.svelte: [frontend-sveltekit/src/routes/(admin)/chatbot/history/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%2Bpage.svelte)
Источник +page.server.ts: [frontend-sveltekit/src/routes/(admin)/chatbot/history/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%2Bpage.server.ts)

Изменения в .svelte:
- Убрать колонку Language из таблицы
- Путь view: `/chatbot/history/{id}` -> `/admin/chatbot/history/{id}`

Изменения в .server.ts:
- Drizzle -> better-sqlite3:
  - load: `db.prepare('SELECT s.*, (SELECT COUNT(*) FROM chatbot_messages WHERE session_id = s.session_id) as message_count FROM chatbot_sessions s ORDER BY s.started_at DESC LIMIT 100').all()`
  - toggleSaved: `db.prepare('UPDATE chatbot_sessions SET is_saved = ? WHERE session_id = ?').run()`
  - delete: `db.prepare('DELETE FROM chatbot_sessions WHERE session_id = ?').run()`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/+page.server.ts`

**4.7 History detail page — COPY + REWRITE server:**
Источник +page.svelte: [frontend-sveltekit/src/routes/(admin)/chatbot/history/[id]/+page.svelte](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%5Bid%5D/%2Bpage.svelte)
Источник +page.server.ts: [frontend-sveltekit/src/routes/(admin)/chatbot/history/[id]/+page.server.ts](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/%5Bid%5D/%2Bpage.server.ts)

Изменения в .svelte:
- "Melena" -> "Моди"
- "Visitor" -> "Посетитель"
- Путь back: `/chatbot/history` -> `/admin/chatbot/history`

Изменения в .server.ts:
- Drizzle -> better-sqlite3:
  - load session: `db.prepare('SELECT * FROM chatbot_sessions WHERE session_id = ?').get(session_id)`
  - load messages: `db.prepare('SELECT * FROM chatbot_messages WHERE session_id = ? ORDER BY created_at ASC').all(session_id)`
  - updateNote: `db.prepare('UPDATE chatbot_sessions SET admin_note = ? WHERE session_id = ?').run()`

Целевые файлы:
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/[id]/+page.svelte`
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/[id]/+page.server.ts`

**Файлы (всего 13 файлов):**
- `frontend-sveltekit/src/lib/components/admin/AdminSidebar.svelte` — edit
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/+page.svelte` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/settings/+page.svelte` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/settings/+page.server.ts` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/+page.svelte` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/+page.server.ts` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/[id]/+page.svelte` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/faq/[id]/+page.server.ts` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/+page.svelte` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/+page.server.ts` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/[id]/+page.svelte` — новый
- `frontend-sveltekit/src/routes/(admin)/admin/chatbot/history/[id]/+page.server.ts` — новый

**Критерии готовности:**
- [ ] AdminSidebar показывает группу "AI" с 3 ссылками
- [ ] Settings: загружаются текущие настройки, сохраняются изменения
- [ ] Settings: можно включить/выключить чатбота
- [ ] Settings: можно изменить модель, temperature, max_tokens
- [ ] Settings: system prompt сохраняется и используется при отправке сообщений
- [ ] FAQ: список отображается с keywords
- [ ] FAQ: можно создать/редактировать/удалить/toggle запись
- [ ] History: таблица сессий с message count
- [ ] History: можно пометить (save/unsave) и удалить сессию
- [ ] History detail: переписка отображается корректно
- [ ] History detail: admin note сохраняется
- [ ] Все формы используют CsrfToken
- [ ] Нет ошибок TypeScript (npm run check)

---

## Порядок выполнения

```
Task 1 (DB)
    ↓
Task 2 (Backend) ← зависит от Task 1
    ↓
Task 3 (Frontend) ← зависит от Task 2
Task 4 (Admin)    ← зависит от Task 1 + Task 2 (параллельно с Task 3)
```

Task 3 и Task 4 могут выполняться параллельно после завершения Task 1 и Task 2.

---

## Общий Score сессии

| Task | Score | Файлов | Описание |
|------|-------|--------|----------|
| 1. DB | 4 | 3 | Таблицы, интерфейсы, миграция |
| 2. Backend | 5 | 5 | OpenRouter, FAQ search, API, CSRF, env |
| 3. Frontend | 7 | 4 | Widget, store, types, layout integration |
| 4. Admin | 8 | 13 | Settings, FAQ CRUD, History, sidebar |
| **Итого** | **24** | **25** | **Все задачи -> Developer (Claude Web)** |

> Все 4 задачи score 4-8 -> Developer (Claude Web) выполняет всё.
> CLI (Integrator) делает merge + deploy + QA.

---

*Roadmap Start v1.0 | 2026-02-19*
