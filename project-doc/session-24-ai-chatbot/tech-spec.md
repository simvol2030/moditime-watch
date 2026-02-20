# Session-24: AI Chatbot (OpenRouter) — Tech Spec

> Дата: 2026-02-20
> На основе: research.md

---

## 1. Изменения в БД

### 1.1 ALTER TABLE chat_messages — новые колонки

```sql
-- Режим генерации ответа
ALTER TABLE chat_messages ADD COLUMN response_mode TEXT DEFAULT NULL;
-- Значения: 'rules', 'ai', 'fallback', NULL (для user/human messages)

-- AI-специфичные поля
ALTER TABLE chat_messages ADD COLUMN model TEXT DEFAULT NULL;
ALTER TABLE chat_messages ADD COLUMN tokens_prompt INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN tokens_completion INTEGER DEFAULT 0;
ALTER TABLE chat_messages ADD COLUMN cost REAL DEFAULT 0;
```

### 1.2 ALTER TABLE chat_sessions — usage tracking

```sql
ALTER TABLE chat_sessions ADD COLUMN total_tokens INTEGER DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN total_cost REAL DEFAULT 0;
```

### 1.3 Новые ключи chat_config (seed)

```typescript
const aiConfigDefaults = [
  { key: 'chat_mode', value: 'auto', description: 'Режим бота: ai / rules / auto' },
  { key: 'openrouter_api_key', value: '', description: 'API ключ OpenRouter (зашифрован)' },
  { key: 'ai_model', value: 'google/gemini-2.0-flash-001', description: 'Основная AI модель' },
  { key: 'ai_fallback_models', value: '["meta-llama/llama-3.3-70b-instruct"]', description: 'Fallback модели JSON' },
  { key: 'ai_temperature', value: '0.7', description: 'Температура (0.0-2.0)' },
  { key: 'ai_max_tokens', value: '500', description: 'Макс. токенов в ответе' },
  { key: 'ai_system_prompt', value: 'Ты Modi — профессиональный консультант интернет-магазина премиальных часов Moditime Watch.\nОтвечай кратко, по-русски, в дружелюбном тоне.\nПомогай с выбором часов, доставкой, гарантией и оплатой.\nНе выходи за рамки тематики магазина часов.\nЕсли не знаешь ответа — предложи связаться с менеджером.', description: 'Системный промпт AI' },
  { key: 'ai_history_depth', value: '10', description: 'Кол-во сообщений в контексте AI' },
  { key: 'ai_monthly_budget', value: '10', description: 'Бюджет USD/месяц (0 = без лимита)' },
];
```

---

## 2. Новый файл: openrouter.ts

### Путь: `src/lib/server/chat/openrouter.ts`

### Интерфейсы

```typescript
interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterOptions {
  model: string;
  temperature: number;
  max_tokens: number;
  messages: OpenRouterMessage[];
}

interface OpenRouterResponse {
  content: string;
  model: string;
  tokens_prompt: number;
  tokens_completion: number;
  cost: number;
}
```

### Экспорты

```typescript
// Основная функция — вызов OpenRouter API с retry + fallback
export async function callOpenRouter(options: OpenRouterOptions, apiKey: string): Promise<OpenRouterResponse>

// Получить API key (из БД или env)
export function getApiKey(): string | null

// Проверить бюджет (текущий месяц)
export function checkBudget(): { allowed: boolean; spent: number; limit: number }

// Расчёт стоимости (приблизительный)
export function estimateCost(model: string, promptTokens: number, completionTokens: number): number
```

### Retry logic

```
Attempt 1: primary model → success/fail
  ↓ fail (429/500/502/503)
  wait 1s
Attempt 2: primary model → success/fail
  ↓ fail
  wait 2s
Attempt 3: primary model → success/fail
  ↓ fail
Attempt 4: fallback model #1 → success/fail
  ↓ fail
  wait 1s
Attempt 5: fallback model #1 → success/fail
  ↓ fail
→ throw OpenRouterError
```

---

## 3. Модификация: bot-logic.ts

### Новая сигнатура generateResponse

```typescript
// Было (синхронная):
export function generateResponse(message: string, sessionId: string): BotResponse

// Стало (асинхронная):
export async function generateResponse(message: string, sessionId: string): Promise<BotResponse>
```

### Расширенный BotResponse

```typescript
interface BotResponse {
  reply: string;
  products?: ProductCard[];
  quick_replies?: string[];
  metadata?: Record<string, unknown>;
  show_contact_form?: boolean;
  // Новые поля:
  response_mode: 'rules' | 'ai' | 'fallback';
  model?: string;
  tokens_prompt?: number;
  tokens_completion?: number;
  cost?: number;
}
```

### Логика по mode

```typescript
export async function generateResponse(message: string, sessionId: string): Promise<BotResponse> {
  const mode = getChatConfigValue('chat_mode') || 'auto';

  if (mode === 'rules') {
    return rulesResponse(message, sessionId);
  }

  if (mode === 'ai') {
    return aiResponse(message, sessionId);
  }

  // mode === 'auto'
  const rulesResult = rulesResponse(message, sessionId);
  if (rulesResult.response_mode === 'rules') {
    return rulesResult; // FAQ/product match found
  }

  // No rules match → try AI
  try {
    return await aiResponse(message, sessionId);
  } catch {
    return rulesResult; // fallback to rules response
  }
}
```

### Новая функция aiResponse

```typescript
async function aiResponse(message: string, sessionId: string): Promise<BotResponse> {
  const apiKey = getApiKey();
  if (!apiKey) return fallbackResponse(sessionId);

  if (!checkBudget().allowed) return fallbackResponse(sessionId);

  // 1. Build message context
  const history = getMessageHistory(sessionId); // last N messages
  const faqContext = getRelevantFaq(message, 3); // top 3 FAQ
  const systemPrompt = buildSystemPrompt(faqContext);

  // 2. Call OpenRouter
  const result = await callOpenRouter({
    model: getChatConfigValue('ai_model') || 'google/gemini-2.0-flash-001',
    temperature: parseFloat(getChatConfigValue('ai_temperature') || '0.7'),
    max_tokens: parseInt(getChatConfigValue('ai_max_tokens') || '500'),
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ]
  }, apiKey);

  return {
    reply: result.content,
    response_mode: 'ai',
    model: result.model,
    tokens_prompt: result.tokens_prompt,
    tokens_completion: result.tokens_completion,
    cost: result.cost,
    quick_replies: getQuickReplies()
  };
}
```

### FAQ grounding helper

```typescript
function getRelevantFaq(message: string, limit: number): FaqEntry[] {
  // Reuse existing scoring logic from matchFaq()
  // Return top N by score (score > 0)
}

function buildSystemPrompt(faqEntries: FaqEntry[]): string {
  const base = getChatConfigValue('ai_system_prompt') || DEFAULT_SYSTEM_PROMPT;
  if (faqEntries.length === 0) return base;

  const faqSection = faqEntries.map(f =>
    `В: ${f.question}\nО: ${f.answer}`
  ).join('\n---\n');

  return `${base}\n\n<context>\nЧасто задаваемые вопросы:\n${faqSection}\n</context>`;
}
```

---

## 4. Модификация: API endpoints

### /api/chat/+server.ts

Изменения:
- `generateResponse()` теперь async → нужен `await`
- Сохранять `response_mode`, `model`, `tokens_*`, `cost` в chat_messages
- Обновлять `total_tokens`, `total_cost` в chat_sessions

```typescript
// Save bot response WITH AI metadata
queries.insertChatMessageWithAI.run({
  session_id: sessionId,
  role: 'bot',
  content: response.reply,
  metadata_json: response.metadata ? JSON.stringify(response.metadata) : null,
  response_mode: response.response_mode,
  model: response.model || null,
  tokens_prompt: response.tokens_prompt || 0,
  tokens_completion: response.tokens_completion || 0,
  cost: response.cost || 0
});

// Update session totals
if (response.tokens_prompt || response.tokens_completion) {
  queries.updateChatSessionTokens.run({
    session_id: sessionId,
    tokens: (response.tokens_prompt || 0) + (response.tokens_completion || 0),
    cost: response.cost || 0
  });
}
```

### Новые queries

```sql
-- Insert message with AI fields
insertChatMessageWithAI:
INSERT INTO chat_messages (session_id, role, content, metadata_json, response_mode, model, tokens_prompt, tokens_completion, cost)
VALUES (@session_id, @role, @content, @metadata_json, @response_mode, @model, @tokens_prompt, @tokens_completion, @cost)

-- Update session token totals
updateChatSessionTokens:
UPDATE chat_sessions
SET total_tokens = total_tokens + @tokens,
    total_cost = total_cost + @cost
WHERE session_id = @session_id

-- Get last N messages for AI context
getChatMessagesForContext:
SELECT role, content FROM chat_messages
WHERE session_id = ? AND role IN ('user', 'bot')
ORDER BY created_at DESC LIMIT ?

-- Monthly spend for budget check
getMonthlyAISpend:
SELECT COALESCE(SUM(cost), 0) as total_cost
FROM chat_messages
WHERE cost > 0 AND created_at >= date('now', 'start of month')
```

---

## 5. Admin: Настройки AI

### Путь: /admin/chatbot/settings/+page.server.ts + +page.svelte

Расширяем существующую страницу настроек (НЕ новая страница).

### Новые секции (добавить к существующим):

#### Секция "Режим работы"
- Radio group: `rules` / `ai` / `auto` (auto рекомендуется)
- Описание каждого режима

#### Секция "OpenRouter AI"
- API Key: password input (маскированный)
- Model: dropdown (google/gemini-2.0-flash-001, meta-llama/llama-3.3-70b-instruct, anthropic/claude-3.5-haiku)
- Fallback models: text (JSON array)
- Temperature: range slider 0.0-2.0 (шаг 0.1)
- Max tokens: number input (100-2000)
- System prompt: textarea (5 строк)
- History depth: number input (1-20)
- Monthly budget: number input (0=unlimited)

#### Секция "Статистика AI"
- Показать: потрачено за месяц / бюджет
- Общий расход tokens за месяц

---

## 6. Admin: Session Detail

### Путь: /admin/chatbot/history/ (расширяем существующую)

### Изменения в session detail view:
- Показывать `response_mode` badge для каждого сообщения бота
- Показывать tokens (prompt/completion) для AI сообщений
- Показывать model для AI сообщений
- Показывать cost для AI сообщений
- Итого по сессии: total_tokens, total_cost

---

## 7. Bugfixes

### B1: ChatDialog.svelte — mobile fullscreen threshold
```css
/* Было */
@media (max-width: 768px) { ... }
/* Стало */
@media (max-width: 480px) { ... }
```

### B2: AdminSidebar.svelte — русские labels
```typescript
// Было
{ label: 'Chatbot', href: '/admin/chatbot', icon: '💬', group: 'Support' },
{ label: 'FAQ', href: '/admin/chatbot/faq', icon: '❓', group: 'Support' },
{ label: 'Chat History', href: '/admin/chatbot/history', icon: '📜', group: 'Support' },
{ label: 'Bot Settings', href: '/admin/chatbot/settings', icon: '🤖', group: 'Support' },

// Стало
{ label: 'Чатбот', href: '/admin/chatbot', icon: '💬', group: 'Поддержка' },
{ label: 'FAQ', href: '/admin/chatbot/faq', icon: '❓', group: 'Поддержка' },
{ label: 'История чатов', href: '/admin/chatbot/history', icon: '📜', group: 'Поддержка' },
{ label: 'Настройки бота', href: '/admin/chatbot/settings', icon: '🤖', group: 'Поддержка' },
```

### B3: sessionStorage persistence
```typescript
// ChatWidget.svelte — сохранять isOpen
onMount(() => {
  isOpen = sessionStorage.getItem('chat_widget_open') === 'true';
});
// При toggle:
sessionStorage.setItem('chat_widget_open', String(isOpen));

// ChatDialog.svelte — сохранять sessionId
// Уже используется cookie chat_session_id — достаточно
```

---

## 8. Схема файлов (что меняется)

### Новые файлы:
| Файл | Описание |
|------|----------|
| `src/lib/server/chat/openrouter.ts` | OpenRouter API client |

### Модифицируемые файлы:
| Файл | Что меняется |
|------|-------------|
| `schema.sql` | ALTER TABLE chat_messages, chat_sessions |
| `src/lib/server/db/database.ts` | Новые queries + update seedChatbot() |
| `src/lib/server/chat/bot-logic.ts` | async generateResponse + 3 modes + FAQ grounding |
| `src/routes/api/chat/+server.ts` | await + token saving |
| `src/routes/(admin)/admin/chatbot/settings/+page.server.ts` | AI config fields |
| `src/routes/(admin)/admin/chatbot/settings/+page.svelte` | AI settings UI |
| `src/routes/(admin)/admin/chatbot/history/+page.svelte` | Token/cost display |
| `src/routes/(admin)/admin/chatbot/+page.svelte` | AI stats на dashboard |
| `src/routes/(admin)/admin/chatbot/+page.server.ts` | AI stats queries |
| `src/lib/components/chat/ChatDialog.svelte` | Mobile breakpoint fix |
| `src/lib/components/chat/ChatWidget.svelte` | sessionStorage persistence |
| `src/lib/components/admin/AdminSidebar.svelte` | Русские labels |

---

*Tech Spec version: 1.0 | 2026-02-20*
