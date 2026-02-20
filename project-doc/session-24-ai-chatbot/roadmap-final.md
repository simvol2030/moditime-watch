# Session-24: AI Chatbot (OpenRouter) — Roadmap Final

> Дата: 2026-02-20
> На основе: research.md, tech-spec.md, plan.md

---

## Порядок реализации

```
Change-1: DB + OpenRouter client
    ↓
Change-2: Bot Logic Upgrade (async + 3 modes + FAQ grounding)
    ↓
Change-3: API async + Bugfixes (mobile, sidebar, sessionStorage)
    ↓
Change-4: Admin AI settings + stats + history tokens
    ↓
npm run build — проверка
    ↓
git push
```

---

## Change-1: Database + OpenRouter Client

### Файлы

| # | Файл | Действие | Описание |
|---|------|----------|----------|
| 1 | `schema.sql` | EDIT | ALTER chat_messages (+5 cols), ALTER chat_sessions (+2 cols) |
| 2 | `src/lib/server/db/database.ts` | EDIT | 4 новых queries + update seedChatbot() |
| 3 | `src/lib/server/chat/openrouter.ts` | CREATE | OpenRouter API client |

### Подробно

#### schema.sql
Добавить после существующей структуры chat_messages:
```sql
-- Session-24: AI расширение
ALTER TABLE chat_messages ADD COLUMN response_mode TEXT DEFAULT NULL;
ALTER TABLE chat_messages ADD COLUMN model TEXT DEFAULT NULL;
ALTER TABLE chat_messages ADD COLUMN tokens_prompt INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN tokens_completion INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN cost REAL DEFAULT 0;

ALTER TABLE chat_sessions ADD COLUMN total_tokens INTEGER DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN total_cost REAL DEFAULT 0;
```

#### database.ts — новые queries
```
insertChatMessageWithAI    — INSERT с AI полями
updateChatSessionTokens    — UPDATE total_tokens, total_cost
getChatMessagesForContext   — SELECT last N messages for AI
getMonthlyAISpend          — SUM(cost) за текущий месяц
```

#### database.ts — seedChatbot() расширение
Добавить 9 AI config defaults (chat_mode, openrouter_api_key, ai_model, ai_fallback_models, ai_temperature, ai_max_tokens, ai_system_prompt, ai_history_depth, ai_monthly_budget)

#### openrouter.ts
Экспорты:
- `callOpenRouter(options, apiKey)` — fetch + retry 3x + fallback models
- `getApiKey()` — из DB или env
- `checkBudget()` — {allowed, spent, limit}
- `estimateCost(model, promptTokens, completionTokens)` — приблизительная стоимость

### Commit
```
feat(session-24): Change-1 — DB schema + OpenRouter client
```

---

## Change-2: Bot Logic Upgrade

### Файлы

| # | Файл | Действие | Описание |
|---|------|----------|----------|
| 1 | `src/lib/server/chat/bot-logic.ts` | EDIT | async + 3 modes + FAQ grounding |

### Подробно

#### Рефакторинг
1. `generateResponse()` → `async generateResponse()`
2. Добавить `response_mode` в BotResponse
3. Извлечь текущую rule-логику в `rulesResponse()`
4. Новая `aiResponse()` — FAQ grounding + history + callOpenRouter

#### Новые функции
- `rulesResponse(message, sessionId)` — текущая rule-based логика
- `aiResponse(message, sessionId)` — OpenRouter с FAQ context
- `getRelevantFaq(message, limit)` — keyword scoring top N
- `buildSystemPrompt(faqEntries)` — base prompt + FAQ context
- `getMessageHistory(sessionId)` — last N messages from DB

#### Логика auto mode
```
1. Пробуем rulesResponse()
2. Если match (FAQ score > 0 или product найден) → return rules result
3. Иначе → try aiResponse()
4. Если AI ошибка → return fallback с offline_message
```

### Commit
```
feat(session-24): Change-2 — async bot logic + 3 modes + FAQ grounding
```

---

## Change-3: API Async + Bugfixes

### Файлы

| # | Файл | Действие | Описание |
|---|------|----------|----------|
| 1 | `src/routes/api/chat/+server.ts` | EDIT | await + token saving |
| 2 | `src/lib/components/chat/ChatDialog.svelte` | EDIT | B1: 768→480px |
| 3 | `src/lib/components/admin/AdminSidebar.svelte` | EDIT | B2: русские labels |
| 4 | `src/lib/components/chat/ChatWidget.svelte` | EDIT | B3: sessionStorage |

### Подробно

#### /api/chat/+server.ts
- `await generateResponse(message, sessionId)`
- Использовать `insertChatMessageWithAI` для bot messages
- Вызывать `updateChatSessionTokens` при cost > 0
- Вернуть `response_mode` в JSON ответе

#### ChatDialog.svelte (B1)
```css
@media (max-width: 480px) { /* was 768px */ }
```

#### AdminSidebar.svelte (B2)
```
'Support' → 'Поддержка'
'Chatbot' → 'Чатбот'
'Chat History' → 'История чатов'
'Bot Settings' → 'Настройки бота'
```

#### ChatWidget.svelte (B3)
```typescript
onMount(() => {
  isOpen = sessionStorage.getItem('chat_widget_open') === 'true';
});
// + при toggle: sessionStorage.setItem(...)
```

### Commit
```
feat(session-24): Change-3 — API async + bugfixes (mobile, sidebar, persistence)
```

---

## Change-4: Admin AI Settings + Stats

### Файлы

| # | Файл | Действие | Описание |
|---|------|----------|----------|
| 1 | `src/routes/(admin)/admin/chatbot/settings/+page.server.ts` | EDIT | AI config save + monthly spend |
| 2 | `src/routes/(admin)/admin/chatbot/settings/+page.svelte` | EDIT | AI settings UI sections |
| 3 | `src/routes/(admin)/admin/chatbot/+page.server.ts` | EDIT | AI stats load |
| 4 | `src/routes/(admin)/admin/chatbot/+page.svelte` | EDIT | AI stats display |
| 5 | `src/routes/(admin)/admin/chatbot/history/+page.svelte` | EDIT | Token/cost per message |

### Подробно

#### settings/+page.server.ts
- Добавить AI fields в save action: chat_mode, ai_model, ai_temperature, ai_max_tokens, ai_system_prompt, ai_history_depth, ai_monthly_budget, openrouter_api_key
- API key: если пустой → не перезаписывать (оставить старый)
- Load: добавить monthlySpend из getMonthlyAISpend

#### settings/+page.svelte — новые секции
1. **Режим работы** — radio group (rules/ai/auto) с описаниями
2. **OpenRouter AI**:
   - API Key (password input, маскированный)
   - Model (dropdown)
   - Fallback models (text)
   - Temperature (range 0.0-2.0)
   - Max tokens (number 100-2000)
   - System prompt (textarea 5 rows)
   - History depth (number 1-20)
   - Monthly budget (number, 0=unlimited)
3. **Статистика** — потрачено $X / $Y (бюджет)

#### dashboard/+page.server.ts
- Добавить: monthlySpend, currentMode

#### dashboard/+page.svelte
- Новая stat card: "AI расход" (потрачено/бюджет)
- Отображение текущего режима бота

#### history/+page.svelte
- Badge для response_mode (rules=зелёный, ai=синий, fallback=серый)
- Для AI messages: показать model, tokens_prompt, tokens_completion, cost
- Session totals: total_tokens, total_cost

### Commit
```
feat(session-24): Change-4 — admin AI settings, stats, history tokens
```

---

## Чек-лист браузера

### Public (чатбот)
- [ ] 1. Chat widget появляется на всех public страницах
- [ ] 2. Chat widget НЕ появляется на admin страницах
- [ ] 3. Открытие/закрытие виджета сохраняется в sessionStorage
- [ ] 4. Переход между страницами сохраняет состояние (open/closed)
- [ ] 5. Mode=rules: FAQ ответ возвращается (ключевое слово "доставка")
- [ ] 6. Mode=rules: Product matching по бренду
- [ ] 7. Mode=ai: AI ответ возвращается (если API key настроен)
- [ ] 8. Mode=auto: rules-ответ при match, AI при no-match
- [ ] 9. При ошибке API → fallback сообщение (не crash)
- [ ] 10. Rate limiting: 30 msg/min → сообщение "подождите"
- [ ] 11. Contact form → Telegram notification
- [ ] 12. Mobile ≤480px: fullscreen dialog
- [ ] 13. Mobile 481-768px: обычное окно чата (НЕ fullscreen)
- [ ] 14. Desktop: 380x520px окно в правом нижнем углу

### Admin — Dashboard /admin/chatbot
- [ ] 15. Stats: total sessions, today, waiting
- [ ] 16. Stats: AI расход за месяц (если есть AI messages)
- [ ] 17. Текущий режим бота отображается
- [ ] 18. Enable/disable toggle работает

### Admin — FAQ /admin/chatbot/faq
- [ ] 19. CRUD FAQ работает (создать, редактировать, удалить)
- [ ] 20. Toggle active/inactive
- [ ] 21. Reorder arrows

### Admin — History /admin/chatbot/history
- [ ] 22. Список сессий с фильтром по статусу
- [ ] 23. Pagination работает с фильтром
- [ ] 24. Session detail: все сообщения видны
- [ ] 25. Bot messages: badge response_mode (rules/ai/fallback)
- [ ] 26. AI messages: model + tokens + cost отображаются
- [ ] 27. Session totals: total_tokens + total_cost
- [ ] 28. Operator note: можно добавить
- [ ] 29. Close session: кнопка работает

### Admin — Settings /admin/chatbot/settings
- [ ] 30. Режим работы: radio group (rules/ai/auto)
- [ ] 31. API Key: password input, маскирован (****XXXX)
- [ ] 32. Model: dropdown с 3+ опциями
- [ ] 33. Temperature: range slider 0.0-2.0
- [ ] 34. Max tokens: number input
- [ ] 35. System prompt: textarea
- [ ] 36. History depth: number
- [ ] 37. Monthly budget: number + текущий расход
- [ ] 38. Быстрые ответы: add/remove
- [ ] 39. Сохранение всех настроек → success alert
- [ ] 40. Sidebar labels на русском: Чатбот, FAQ, История чатов, Настройки бота

---

## Полный список файлов

### Новые (1):
```
src/lib/server/chat/openrouter.ts
```

### Модифицируемые (12):
```
schema.sql
src/lib/server/db/database.ts
src/lib/server/chat/bot-logic.ts
src/routes/api/chat/+server.ts
src/lib/components/chat/ChatDialog.svelte
src/lib/components/chat/ChatWidget.svelte
src/lib/components/admin/AdminSidebar.svelte
src/routes/(admin)/admin/chatbot/+page.server.ts
src/routes/(admin)/admin/chatbot/+page.svelte
src/routes/(admin)/admin/chatbot/settings/+page.server.ts
src/routes/(admin)/admin/chatbot/settings/+page.svelte
src/routes/(admin)/admin/chatbot/history/+page.svelte
```

---

*Roadmap Final version: 1.0 | 2026-02-20*
