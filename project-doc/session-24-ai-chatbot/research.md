# Session-24: AI Chatbot (OpenRouter) — Research

> Дата: 2026-02-20
> Задача: Расширить rule-based чатбот (Session-23) до AI-чатбота с OpenRouter API

---

## 1. Текущее состояние (Session-23)

### Архитектура
```
ChatWidget.svelte (FAB кнопка)
  └── ChatDialog.svelte (окно чата)
        ├── ChatMessage.svelte (сообщения)
        ├── ChatProductCard.svelte (карточки товаров)
        └── ChatContactForm.svelte (форма контакта)

API:
  /api/chat          — POST: отправка сообщения (синхронно)
  /api/chat/session  — GET: инициализация сессии
  /api/chat/contact  — POST: отправка контактов

Bot Logic:
  bot-logic.ts — generateResponse() → синхронный, rule-based
    1. Quick Reply matching (exact)
    2. FAQ keyword scoring
    3. Product brand/category matching
    4. Fallback → контактная форма после 3 промахов

Admin:
  /admin/chatbot           — dashboard (stats + toggle)
  /admin/chatbot/faq       — CRUD FAQ записей
  /admin/chatbot/history   — сессии + сообщения
  /admin/chatbot/settings  — персона бота, быстрые ответы, поведение
```

### Таблицы БД (БЛОК 14: CHATBOT)

| Таблица | Колонки | Нужно добавить |
|---------|---------|----------------|
| `chat_sessions` | id, session_id, visitor_*, status, message_count, last_message_at, ip_address, user_agent, page_url, timestamps | `total_tokens_used` |
| `chat_messages` | id, session_id, role, content, metadata_json, is_read, created_at | `response_mode`, `model`, `tokens_prompt`, `tokens_completion`, `cost` |
| `chat_faq` | id, question, answer, keywords, category, is_active, position, match_count, timestamps | — (без изменений) |
| `chat_config` | id, key, value, description, timestamps | Новые ключи (см. ниже) |

### Новые ключи для chat_config

| Ключ | Значение по умолчанию | Описание |
|------|----------------------|----------|
| `chat_mode` | `auto` | Режим: ai / rules / auto |
| `openrouter_api_key` | `''` | API key OpenRouter (шифрованный) |
| `ai_model` | `google/gemini-2.0-flash-001` | Текущая модель |
| `ai_fallback_models` | `["google/gemini-2.0-flash-001","meta-llama/llama-3.3-70b-instruct"]` | Fallback модели JSON |
| `ai_temperature` | `0.7` | Температура |
| `ai_max_tokens` | `500` | Макс. токенов в ответе |
| `ai_system_prompt` | (см. ниже) | Системный промпт |
| `ai_history_depth` | `10` | Кол-во сообщений в контексте |
| `ai_monthly_budget` | `10` | Бюджет USD/месяц (0 = без лимита) |

### Системный промпт по умолчанию
```
Ты Modi — профессиональный консультант интернет-магазина премиальных часов Moditime Watch.
Отвечай кратко, по-русски, в дружелюбном тоне.
Помогай с выбором часов, доставкой, гарантией и оплатой.
Не выходи за рамки тематики магазина часов.
Если не знаешь ответа — предложи связаться с менеджером.
```

---

## 2. OpenRouter API

### Endpoint
```
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer <API_KEY>
```

### Request format
```json
{
  "model": "google/gemini-2.0-flash-001",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ],
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Response format
```json
{
  "choices": [{ "message": { "role": "assistant", "content": "..." } }],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 80,
    "total_tokens": 230
  },
  "model": "google/gemini-2.0-flash-001"
}
```

### Retry strategy
- 3 попытки на текущую модель
- Если все 3 провалились — переключение на fallback модель
- Между попытками: 1s, 2s delay
- Коды для retry: 429 (rate limit), 500, 502, 503

### Рекомендуемые модели
| Модель | Стоимость | Качество |
|--------|-----------|----------|
| `google/gemini-2.0-flash-001` | $0.10/$0.40 per 1M tok | Быстрый, дешёвый |
| `meta-llama/llama-3.3-70b-instruct` | $0.10/$0.10 per 1M tok | Хороший fallback |
| `anthropic/claude-3.5-haiku` | $0.80/$4.00 per 1M tok | Премиум |

---

## 3. Режимы работы (3 mode)

### Mode: `rules` (текущий)
- Только rule-based логика из Session-23
- FAQ matching + product matching + fallback
- Нулевая стоимость
- Работает оффлайн

### Mode: `ai`
- Каждое сообщение → OpenRouter API
- FAQ grounding: top-3 FAQ передаются в system prompt
- История: последние N сообщений в контексте
- Token tracking per message
- Fallback на rules при ошибке API

### Mode: `auto` (рекомендуемый)
1. Сначала rules-based matching (FAQ + products)
2. Если score > порога → вернуть rule-based ответ
3. Если нет match → отправить в OpenRouter AI
4. При ошибке AI → fallback сообщение

```
User message
    ↓
[Rules engine: FAQ + Products]
    ↓ match found?
   YES → return rule response (mode=rules, cost=0)
    NO ↓
[OpenRouter AI + FAQ context]
    ↓ success?
   YES → return AI response (mode=ai, cost>0)
    NO ↓
[Fallback message]
```

---

## 4. FAQ Grounding

Для AI режима: перед вызовом OpenRouter, выбираем top-3 FAQ, релевантных запросу:

```typescript
function getRelevantFaq(message: string, limit: number = 3): FaqEntry[] {
  const allFaq = queries.getChatFaqActive.all();
  // Score by keyword overlap (reuse existing scoring logic)
  // Return top N by score (score > 0)
}
```

Передаём в system prompt:
```
<context>
Часто задаваемые вопросы:
Q: {faq.question}
A: {faq.answer}
---
Q: {faq.question}
A: {faq.answer}
</context>
```

---

## 5. Паттерны проекта (соблюдать!)

### DB queries
```typescript
// Именование: camelCase, описательные имена
queries.adminCountChatSessions
queries.getChatConfig
queries.setChatConfig

// Prepared statements с named params (@param)
db.prepare('UPDATE chat_messages SET tokens_prompt = @tokens_prompt WHERE id = @id')
```

### API endpoints
```typescript
// SvelteKit RequestHandler, json() responses
export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // ... logic
    return json({ ... });
  } catch {
    return json({ error: '...' }, { status: 500 });
  }
};
```

### Admin pages
```typescript
// +page.server.ts: load + actions
export const load: PageServerLoad = async () => { ... };
export const actions: Actions = {
  save: async ({ request }) => { ... }
};
```

### Svelte 5 runes
```svelte
let { data, form }: { data: PageData; form: ActionData } = $props();
let value = $state('');
const derived = $derived(expression);
```

---

## 6. Bugfixes из QA (от Session-23)

| Bug | Описание | Файл |
|-----|----------|------|
| B1 | Mobile fullscreen порог 768px → 480px | ChatDialog.svelte |
| B2 | Admin sidebar labels на русском | AdminSidebar.svelte (Support group) |
| B3 | sessionStorage persistence (widget open state) | ChatWidget.svelte / ChatDialog.svelte |

### B1: Mobile fullscreen
Текущий: `@media (max-width: 768px)` — fullscreen на планшетах.
Исправление: `@media (max-width: 480px)` — fullscreen только на телефонах.

### B2: Sidebar labels
Текущий: `Chatbot`, `FAQ`, `Chat History`, `Bot Settings`
Исправление: `Чатбот`, `FAQ`, `История чатов`, `Настройки бота`

### B3: sessionStorage persistence
- ChatWidget: запоминать isOpen в sessionStorage
- ChatDialog: при закрытии/открытии не терять состояние

---

## 7. API Key безопасность

Два источника API key (приоритет):
1. `chat_config` таблица (ключ `openrouter_api_key`) — AES-256 шифрование
2. `process.env.OPENROUTER_API_KEY` — fallback через .env

### Шифрование
Проект уже использует AES-256-GCM для сессий (hooks.server.ts).
Переиспользовать тот же подход для API key в БД.

---

## 8. Анализ файлов project-kliee

> GitHub недоступен (egress proxy блокирует github.com).
> Реализация будет основана на OpenRouter API документации и существующих паттернах moditime-watch.

### Что было бы в openrouter.ts (project-kliee):
- Функция `callOpenRouter(messages, model, options)` — HTTP fetch к API
- Retry logic с exponential backoff
- Fallback models array
- Token usage extraction из response
- Error handling (rate limit, model unavailable)

### Что было бы в faq-search.ts (project-kliee):
- Функция `searchRelevantFaq(query, limit)` — keyword scoring
- Формирование контекста для system prompt
- В moditime уже есть `matchFaq()` — адаптируем

### Подход:
Пишем `openrouter.ts` с нуля по API документации, т.к. Drizzle→better-sqlite3 и multi-lang→ru требуют значительных изменений. Структуру и retry-логику берём из стандартных OpenRouter patterns.

---

*Research version: 1.0 | 2026-02-20*
