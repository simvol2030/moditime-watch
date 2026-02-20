# Session-24: AI Chatbot Enhancement — Roadmap

**Дата:** 2026-02-20
**На основе:** spec-final.md

---

## Статус Changes

| # | Change | Score | Исполнитель | Статус |
|---|--------|-------|-------------|--------|
| 1 | OpenRouter API клиент + DB миграция | 8 | Developer | PENDING |
| 2 | AI Bot Logic + режимы работы | 9 | Developer | PENDING |
| 3 | Admin Settings расширение + History detail | 8 | Developer | PENDING |
| 4 | Bugfixes + polish (persistence, CSS, labels) | 5 | Developer | PENDING |

---

## Change-1: OpenRouter API клиент + DB миграция

### Файлы

| Файл | Действие | Источник (project-kliee) |
|------|----------|--------------------------|
| `src/lib/server/chat/openrouter.ts` | CREATE | [`src/lib/server/openrouter.ts`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/openrouter.ts) |
| `src/lib/server/chat/faq-search.ts` | CREATE | [`src/lib/server/faq-search.ts`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/faq-search.ts) |
| `src/lib/server/db/database.ts` | EDIT | Новые prepared statements + seed + ALTER TABLE |
| `schema.sql` | EDIT | ALTER TABLE для chat_messages, chat_sessions |

### Подзадачи

1. **Скопировать и адаптировать `openrouter.ts`** из project-kliee:
   - Убрать multi-language (только RU)
   - Адаптировать imports под moditime-watch
   - Сохранить retry logic (3 попытки, exponential backoff)
   - Сохранить fallback models
   - Читать API key и model из `chat_config` таблицы (через queries)
   - Env fallback: `process.env.OPENROUTER_API_KEY`
   - Ссылка: https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/openrouter.ts

2. **Скопировать и адаптировать `faq-search.ts`**:
   - Упростить: только `question` и `answer` поля (без `_en/_ru/_es/_zh`)
   - Алгоритм: substring match + word match + keyword match → score 0-1
   - Возвращать top 3 FAQ с score > 0.2
   - Форматировать как контекст для AI промпта
   - Ссылка: https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/faq-search.ts

3. **Миграция БД** в `database.ts`:
   ```sql
   -- В initializeDatabase() добавить:
   ALTER TABLE chat_messages ADD COLUMN tokens_used INTEGER DEFAULT NULL;
   ALTER TABLE chat_sessions ADD COLUMN admin_note TEXT DEFAULT NULL;
   ALTER TABLE chat_sessions ADD COLUMN is_saved INTEGER DEFAULT 0;
   ```
   Обернуть в try/catch (ALTER TABLE может fail если колонка уже есть).

4. **Новые seed ключи** в `seedChatbot()`:
   ```
   ai_mode, openrouter_api_key, ai_model, ai_temperature,
   ai_max_tokens, ai_system_prompt, ai_fallback_models
   ```

5. **Новые prepared statements**:
   ```
   getChatMessagesBySession  — SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 10
   updateChatMessageTokens   — UPDATE chat_messages SET tokens_used = ? WHERE id = ?
   updateSessionAdminNote    — UPDATE chat_sessions SET admin_note = ? WHERE session_id = ?
   toggleSessionSaved        — UPDATE chat_sessions SET is_saved = CASE WHEN is_saved = 1 THEN 0 ELSE 1 END WHERE session_id = ?
   ```

### Завершение
- [ ] `openrouter.ts` создан, экспортирует `callOpenRouter(messages, config)`
- [ ] `faq-search.ts` создан, экспортирует `searchFaqForContext(query)`
- [ ] ALTER TABLE выполняется при старте (idempotent)
- [ ] 7 новых chat_config seed ключей
- [ ] Новые prepared statements добавлены

---

## Change-2: AI Bot Logic + режимы работы

### Файлы

| Файл | Действие | Описание |
|------|----------|----------|
| `src/lib/server/chat/bot-logic.ts` | EDIT | Добавить AI pipeline, режимы |
| `src/routes/api/chat/+server.ts` | EDIT | Добавить tokens tracking |
| `src/routes/api/chat/session/+server.ts` | EDIT | Возвращать историю сообщений |

### Подзадачи

1. **Расширить `generateResponse()` в `bot-logic.ts`**:
   ```typescript
   export function generateResponse(message, sessionId): BotResponse {
     const mode = getChatConfigValue('ai_mode') || 'auto';

     if (mode === 'rules') {
       return rulesOnlyResponse(message, sessionId);
     }

     if (mode === 'ai') {
       return aiResponse(message, sessionId);
     }

     // mode === 'auto'
     const rulesResult = rulesOnlyResponse(message, sessionId);
     if (rulesResult.matched) return rulesResult;
     return aiResponse(message, sessionId);
   }
   ```

2. **Добавить `aiResponse()` функцию**:
   - Получить chat_config (model, temperature, max_tokens, system_prompt, api_key)
   - Если нет API key — return fallback
   - Получить FAQ контекст через `searchFaqForContext(message)`
   - Получить историю (последние 10 сообщений через `getChatMessagesBySession`)
   - Построить messages array: system prompt + faq context + history + user message
   - Вызвать `callOpenRouter(messages, config)`
   - Вернуть ответ + tokens_used

3. **Обновить API endpoint** (`+server.ts`):
   - После сохранения bot message → обновить `tokens_used` если есть
   - Обработать async AI вызов (может быть медленным)

4. **Обновить session endpoint**:
   - Возвращать `messages` (историю) при GET

### Завершение
- [ ] Режим `rules` работает (как сейчас)
- [ ] Режим `ai` отправляет в OpenRouter, получает ответ
- [ ] Режим `auto` пробует rules → если нет match → AI
- [ ] FAQ grounding передаётся в системный промпт
- [ ] История 10 сообщений передаётся в AI
- [ ] tokens_used сохраняется per message
- [ ] При ошибке AI — fallback сообщение

---

## Change-3: Admin Settings расширение + History detail

### Файлы

| Файл | Действие | Источник |
|------|----------|----------|
| `admin/chatbot/settings/+page.svelte` | EDIT | Поля из [`project-kliee settings`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/settings/%2Bpage.svelte) |
| `admin/chatbot/settings/+page.server.ts` | EDIT | Сохранение AI полей |
| `admin/chatbot/history/+page.svelte` | EDIT | Добавить admin_note, is_saved |
| `admin/chatbot/history/[session_id]/+page.server.ts` | CREATE | Load session detail |
| `admin/chatbot/history/[session_id]/+page.svelte` | CREATE | Session detail view |

### Подзадачи

1. **Расширить settings page** — добавить секцию "AI настройки":
   - **Режим работы**: radio group (AI / Rules / Auto)
   - **API Key**: input type="password" с кнопкой показать/скрыть
   - **Модель**: dropdown (7 моделей из spec)
   - **Temperature**: input type="range" (0-2, step 0.1, default 0.7)
   - **Max Tokens**: input type="number" (100-4096, default 1024)
   - **Системный промпт**: textarea (rows=8, max 2000 chars)
   - **Fallback модели**: textarea (JSON array, с подсказкой)

2. **Расширить settings server** — сохранение новых полей

3. **Session detail page** (`/admin/chatbot/history/[session_id]`):
   - Метаданные сессии (дата, кол-во сообщений, статус)
   - Полная история сообщений с timestamps
   - Tokens used per message (если есть)
   - Admin note textarea + save
   - Toggle is_saved (звёздочка)
   - Ссылка: https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/

4. **Обновить history list** — добавить колонки is_saved, admin_note preview

### Завершение
- [ ] AI секция в settings работает (все поля сохраняются)
- [ ] Переключатель режима отображается и сохраняется
- [ ] Session detail page показывает полный диалог
- [ ] Tokens usage отображается per message
- [ ] Admin notes сохраняются
- [ ] is_saved toggle работает

---

## Change-4: Bugfixes + polish

### Файлы

| Файл | Действие | Описание |
|------|----------|----------|
| `components/chat/ChatWidget.svelte` | EDIT | sessionStorage persistence |
| `components/chat/ChatDialog.svelte` | EDIT | CSS breakpoint fix |
| `components/admin/AdminSidebar.svelte` | EDIT | Russian labels |

### Подзадачи

1. **sessionStorage persistence** в ChatWidget:
   - При закрытии виджета → сохранить `isOpen` state
   - При mount → восстановить из sessionStorage
   - Ссылка на паттерн: https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/stores/chat.svelte.ts

2. **Chat store** — создать `src/lib/stores/chat.svelte.ts`:
   - Хранить messages и sessionId в sessionStorage
   - При переоткрытии виджета — восстановить историю
   - Ключи: `moditime_chat_messages`, `moditime_chat_session_id`

3. **CSS breakpoint fix** в ChatDialog:
   - Изменить `@media (max-width: 768px)` → `@media (max-width: 480px)` для fullscreen
   - Аналогично в ChatWidget overlay

4. **Russian sidebar labels** в AdminSidebar:
   ```
   'Chatbot' → 'Чатбот'
   'FAQ' → 'База знаний'
   'Chat History' → 'История чатов'
   'Bot Settings' → 'Настройки бота'
   'Support' → 'Поддержка'
   ```

5. **npm run build** — убедиться что всё собирается

### Завершение
- [ ] Чат сохраняется при закрытии/открытии виджета
- [ ] Fullscreen только на телефонах (<480px)
- [ ] Sidebar labels на русском
- [ ] Build проходит без ошибок

---

## Оценка объёма

| Change | Новых файлов | Изменённых файлов | Строк кода (~) |
|--------|-------------|-------------------|----------------|
| 1 - OpenRouter + DB | 2 | 2 | ~400 |
| 2 - AI Bot Logic | 0 | 3 | ~200 |
| 3 - Admin AI + History | 2 | 3 | ~500 |
| 4 - Bugfixes | 1 | 3 | ~150 |
| **ИТОГО** | **5** | **11** | **~1250** |

---

## Зависимости

```
Change-1 (DB + API клиент)
    ↓
Change-2 (AI logic) ← зависит от 1
    ↓
Change-3 (Admin) ← зависит от 1
    ↓
Change-4 (Polish) ← независимый, можно параллельно с 2-3
```

---

*Roadmap-start готов: 2026-02-20*
