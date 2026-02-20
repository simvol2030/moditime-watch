# Session-24: AI Chatbot Enhancement

**Дата:** 2026-02-20
**Зависимость:** Session-23 (rule-based chatbot) — deployed
**Мета-задача:** Превратить rule-based бот в полноценный AI-чатбот с OpenRouter

---

## Контекст

Session-23 реализовала rule-based чатбот (FAQ match -> Product match -> Fallback).
Теперь нужно добавить AI-слой: OpenRouter API, системный промпт, выбор модели,
и расширить админку для управления AI-настройками.

**Исходный код для копирования:**
- Репозиторий: https://github.com/simvol2030/project-kliee
- Ветка: `main`
- Путь: `frontend-sveltekit/`

---

## Есть сейчас vs Должно быть

| Аспект | Есть (session-23) | Должно быть (session-24) |
|--------|-------------------|--------------------------|
| Логика бота | Rule-based (FAQ + Product + Fallback) | AI через OpenRouter + rule-based fallback |
| Системный промпт | Нет | Настраиваемый через админку |
| Модель LLM | Нет | Выбор из 7+ моделей в админке |
| API ключ | Нет | В админке (с .env fallback) |
| Temperature | Нет | Слайдер 0-2 в админке |
| Max tokens | Нет | Поле 100-4096 в админке |
| FAQ grounding | Keyword match only | FAQ контекст передаётся в AI |
| История в контексте | Нет | Последние 10 сообщений в промпте AI |
| Режим работы | Только rule-based | Переключатель: AI / Rule-based / Auto |
| Token usage | Нет | Трекинг per message, показ в истории |
| Сохранение чата | Сброс при закрытии виджета | sessionStorage persistence |
| Admin notes | Нет | Заметки на сессиях |
| Fullscreen breakpoint | 768px | 480px (только телефоны) |
| Sidebar labels | English | Russian |

---

## Исходные файлы project-kliee для копирования

| Исходный файл (project-kliee) | Назначение | Адаптация |
|-------------------------------|------------|-----------|
| [`src/lib/server/openrouter.ts`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/openrouter.ts) (206 строк) | OpenRouter API клиент | Скопировать, адаптировать imports |
| [`src/lib/server/faq-search.ts`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/server/faq-search.ts) (109 строк) | FAQ search для AI grounding | Скопировать, упростить (только RU) |
| [`src/routes/api/chat/+server.ts`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/api/chat/%2Bserver.ts) (255 строк) | API endpoint с AI | Взять AI pipeline, merge с текущим |
| [`src/lib/stores/chat.svelte.ts`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/lib/stores/chat.svelte.ts) (239 строк) | Chat store с persistence | Скопировать, адаптировать endpoints |
| [`src/routes/(admin)/chatbot/settings/+page.svelte`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/settings/%2Bpage.svelte) (537 строк) | Admin settings с AI полями | Взять AI-поля, merge с текущим |
| [`src/routes/(admin)/chatbot/history/[id]/+page.svelte`](https://github.com/simvol2030/project-kliee/blob/main/frontend-sveltekit/src/routes/(admin)/chatbot/history/) | Session detail с tokens | Скопировать, адаптировать |

---

## Изменения в БД

### Расширение таблицы `chat_config`

Новые ключи (INSERT OR IGNORE в seed):

```
ai_mode          = 'auto'           -- 'ai' | 'rules' | 'auto'
openrouter_api_key = ''             -- зашифрованный или plain
ai_model         = 'openai/gpt-4o-mini'
ai_temperature   = '0.7'
ai_max_tokens    = '1024'
ai_system_prompt = 'Вы Modi — консультант...'
ai_fallback_models = '["anthropic/claude-3-haiku","google/gemini-flash-1.5"]'
```

### Расширение таблицы `chat_messages`

```sql
ALTER TABLE chat_messages ADD COLUMN tokens_used INTEGER DEFAULT NULL;
```

### Расширение таблицы `chat_sessions`

```sql
ALTER TABLE chat_sessions ADD COLUMN admin_note TEXT DEFAULT NULL;
ALTER TABLE chat_sessions ADD COLUMN is_saved INTEGER DEFAULT 0;
```

---

## Режим работы бота (ai_mode)

| Режим | Поведение |
|-------|-----------|
| `rules` | Только rule-based (текущая логика session-23) |
| `ai` | Только AI (OpenRouter), rule-based как fallback при ошибке API |
| `auto` | Сначала rule-based (FAQ/Product match), если нет match — AI |

**Режим `auto` (рекомендуемый по умолчанию):**
1. Пользователь отправляет сообщение
2. Пробуем rule-based: FAQ match → Product match
3. Если нашёлся ответ → отдаём (бесплатно, быстро)
4. Если не нашёлся → отправляем в AI с контекстом
5. Если AI упал → fallback сообщение

---

## OpenRouter API клиент

**Скопировать из:** `project-kliee/frontend-sveltekit/src/lib/server/openrouter.ts`

**Ключевые параметры:**
- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Retry: 3 попытки, exponential backoff (1s → 2s → 4s)
- Fallback models: если основная модель упала → следующая из списка
- Headers: Authorization, Content-Type, HTTP-Referer, X-Title

**Доступные модели:**

| Model ID | Название | Тип |
|----------|----------|-----|
| `openai/gpt-4o-mini` | GPT-4o Mini | Быстрая, бюджетная (рекомендуется) |
| `anthropic/claude-3-haiku` | Claude 3 Haiku | Быстрая |
| `google/gemini-flash-1.5` | Gemini Flash | Быстрая |
| `openai/gpt-3.5-turbo` | GPT-3.5 Turbo | Бюджетная |
| `anthropic/claude-3.5-sonnet` | Claude 3.5 Sonnet | Мощная |
| `openai/gpt-4o` | GPT-4o | Мощная |
| `meta-llama/llama-3.1-8b-instruct` | Llama 3.1 8B | Open source |

---

## Системный промпт по умолчанию

```
Вы Modi — профессиональный консультант интернет-магазина премиальных часов Moditimewatch.

Ваши задачи:
- Помогать клиентам с выбором часов
- Отвечать на вопросы о доставке, гарантии, оплате
- Рекомендовать модели исходя из предпочтений клиента
- Быть вежливым, компетентным и лаконичным

Контекст из базы знаний:
{faq_context}

Правила:
- Отвечайте только на русском языке
- Если не знаете ответ — предложите связаться с менеджером
- Не придумывайте цены и характеристики
- Максимум 3-4 предложения в ответе
```

---

## Критерии успеха

- [ ] Переключатель режима (AI / Rules / Auto) работает в админке
- [ ] OpenRouter API key сохраняется и используется
- [ ] Выбор модели из dropdown работает
- [ ] Temperature и max tokens настраиваются
- [ ] Системный промпт редактируется в textarea
- [ ] В режиме AI бот отвечает через OpenRouter
- [ ] FAQ grounding: релевантные FAQ передаются как контекст AI
- [ ] История чата (10 последних сообщений) передаётся в AI
- [ ] Token usage сохраняется per message
- [ ] Token usage отображается в /admin/chatbot/history
- [ ] При ошибке AI — fallback на rule-based или сообщение об ошибке
- [ ] Retry logic (3 попытки) + fallback models работают
- [ ] Чат сохраняется при закрытии виджета (sessionStorage)
- [ ] Admin notes на сессиях работают
- [ ] Fullscreen только на <480px (не на планшетах)
- [ ] Sidebar labels на русском
- [ ] npm run build без ошибок

---

*Версия: final | 2026-02-20*
