# Session-24: AI Chatbot (OpenRouter) — Plan

> Дата: 2026-02-20
> На основе: research.md, tech-spec.md

---

## Changes Overview

| Change | Название | Зависимости | Описание |
|--------|----------|-------------|----------|
| **1** | Database + OpenRouter client | — | ALTER tables, новые queries, openrouter.ts |
| **2** | Bot logic upgrade | Change-1 | async generateResponse, 3 modes, FAQ grounding |
| **3** | API + Frontend fixes | Change-2 | await в API, bugfixes (mobile, sidebar, sessionStorage) |
| **4** | Admin AI settings + stats | Change-3 | Settings UI, dashboard stats, history tokens |

---

## Change-1: Database + OpenRouter Client

### Задачи

#### 1.1 ALTER TABLE chat_messages
- Добавить колонки: `response_mode`, `model`, `tokens_prompt`, `tokens_completion`, `cost`
- Обновить schema.sql

#### 1.2 ALTER TABLE chat_sessions
- Добавить колонки: `total_tokens`, `total_cost`
- Обновить schema.sql

#### 1.3 Новые DB queries в database.ts
- `insertChatMessageWithAI` — вставка с AI полями
- `updateChatSessionTokens` — обновление token totals
- `getChatMessagesForContext` — последние N сообщений для AI context
- `getMonthlyAISpend` — расход за месяц
- Обновить `seedChatbot()` — добавить AI config defaults

#### 1.4 Создать openrouter.ts
- `callOpenRouter()` — HTTP fetch с retry 3x + fallback models
- `getApiKey()` — из chat_config или env
- `checkBudget()` — проверка месячного бюджета
- `estimateCost()` — расчёт стоимости

### DoD Change-1
- [ ] schema.sql содержит новые колонки
- [ ] database.ts содержит 4+ новых queries
- [ ] seedChatbot() добавляет 9 AI config keys
- [ ] openrouter.ts экспортирует callOpenRouter, getApiKey, checkBudget
- [ ] Retry logic: 3 попытки primary + 2 попытки fallback
- [ ] Budget check читает getMonthlyAISpend и сравнивает с ai_monthly_budget
- [ ] Коммит: "feat(session-24): Change-1 — DB + OpenRouter client"

---

## Change-2: Bot Logic Upgrade

### Задачи

#### 2.1 Рефакторинг generateResponse → async
- Сделать `generateResponse` async
- Добавить `response_mode` в BotResponse interface
- Извлечь текущую rule-based логику в `rulesResponse()`

#### 2.2 Добавить aiResponse()
- Build system prompt с FAQ grounding
- Получить message history (последние N)
- Вызвать callOpenRouter()
- Вернуть BotResponse с token metadata

#### 2.3 Реализовать 3 modes
- `rules`: только rulesResponse()
- `ai`: только aiResponse() с fallback
- `auto`: rules first → AI if no match

#### 2.4 FAQ grounding functions
- `getRelevantFaq(message, limit)` — keyword scoring, top N
- `buildSystemPrompt(faqEntries)` — system prompt + FAQ context
- `getMessageHistory(sessionId)` — последние N из chat_messages

### DoD Change-2
- [ ] generateResponse() является async
- [ ] 3 режима работают (rules / ai / auto)
- [ ] Auto mode: rules first, AI fallback
- [ ] FAQ grounding: top 3 FAQ в system prompt
- [ ] History: последние N сообщений в контексте
- [ ] При ошибке AI → fallback на rules или offline message
- [ ] Коммит: "feat(session-24): Change-2 — async bot logic + 3 modes"

---

## Change-3: API + Frontend Fixes

### Задачи

#### 3.1 /api/chat/+server.ts — await + token saving
- Добавить `await` перед generateResponse()
- Использовать `insertChatMessageWithAI` вместо `insertChatMessage` для bot messages
- Вызывать `updateChatSessionTokens` если tokens > 0

#### 3.2 Bugfix B1: ChatDialog.svelte — mobile fullscreen
- Изменить `@media (max-width: 768px)` → `@media (max-width: 480px)`

#### 3.3 Bugfix B2: AdminSidebar.svelte — русские labels
- `Chatbot` → `Чатбот`
- `Chat History` → `История чатов`
- `Bot Settings` → `Настройки бота`
- `Support` → `Поддержка`

#### 3.4 Bugfix B3: ChatWidget.svelte — sessionStorage
- onMount: прочитать `sessionStorage.getItem('chat_widget_open')`
- При toggle: `sessionStorage.setItem('chat_widget_open', ...)`

### DoD Change-3
- [ ] /api/chat использует await и сохраняет token данные
- [ ] Mobile fullscreen только на ≤480px (не на планшетах)
- [ ] Sidebar labels на русском
- [ ] Widget сохраняет открытое/закрытое состояние в sessionStorage
- [ ] Коммит: "feat(session-24): Change-3 — API async + bugfixes"

---

## Change-4: Admin AI Settings + Stats

### Задачи

#### 4.1 Расширить settings/+page.server.ts
- Добавить AI config fields в save action
- Маскирование API key (показывать только последние 4 символа)
- Загружать monthly spend для отображения

#### 4.2 Расширить settings/+page.svelte
- Новая секция "Режим работы" (radio: rules/ai/auto)
- Новая секция "OpenRouter AI" (key, model, temp, tokens, prompt, budget)
- Секция "Статистика AI" (потрачено/бюджет)

#### 4.3 Расширить dashboard (+page.server.ts + +page.svelte)
- Добавить: общий расход tokens/cost за месяц
- Добавить: текущий режим бота
- Показывать response_mode badge

#### 4.4 Расширить history/+page.svelte — token display
- Badge `response_mode` (rules/ai/fallback) для bot messages
- Показать model, tokens, cost для AI messages
- Итого tokens/cost по сессии

### DoD Change-4
- [ ] Settings: можно выбрать mode (rules/ai/auto)
- [ ] Settings: API key сохраняется и маскируется
- [ ] Settings: model dropdown, temperature slider, system prompt textarea
- [ ] Settings: monthly budget + отображение текущего расхода
- [ ] Dashboard: AI stats (расход за месяц, режим)
- [ ] History: token/cost data per message + session totals
- [ ] Коммит: "feat(session-24): Change-4 — admin AI settings + stats"

---

## Аудит плана (тройной)

### 1. Полнота
- [x] 3 режима бота (ai/rules/auto) — Change-2
- [x] OpenRouter client с retry + fallback — Change-1
- [x] FAQ grounding (top 3 FAQ) — Change-2
- [x] History context (last 10 msgs) — Change-2
- [x] Token tracking per message — Change-1 (schema) + Change-3 (API)
- [x] API key storage (DB + env) — Change-1
- [x] Admin: mode, model, temp, prompt, budget — Change-4
- [x] Session detail: tokens + cost — Change-4
- [x] Bugfix B1 (fullscreen 768→480) — Change-3
- [x] Bugfix B2 (sidebar русский) — Change-3
- [x] Bugfix B3 (sessionStorage) — Change-3
- [x] Commit each change separately — да, 4 коммита

### 2. Реалистичность
- [x] Все DoD конкретны и проверяемы
- [x] schema.sql ALTER добавляет DEFAULT — не ломает существующие данные
- [x] openrouter.ts — стандартный HTTP fetch, не требует новых зависимостей
- [x] generateResponse async — нужно изменить все callsites (только /api/chat)
- [x] Admin UI расширяет существующие файлы — не новые страницы

### 3. Порядок зависимостей
- [x] Change-1 (DB + openrouter) — независимый, база для всего
- [x] Change-2 (bot-logic) зависит от Change-1 — использует openrouter.ts и новые queries
- [x] Change-3 (API + fixes) зависит от Change-2 — await async generateResponse
- [x] Change-4 (admin) зависит от Change-1,3 — использует AI queries, отображает token data

---

*Plan version: 1.0 (audited) | 2026-02-20*
