# Session 23: Chatbot — Roadmap Final

**Дата:** 2026-02-20
**На основе:** research.md, tech-spec.md, plan.md

---

## Статус Changes

| # | Change | Статус | Приоритет |
|---|--------|--------|-----------|
| 1 | Database Layer (таблицы, queries, seed) | ⏳ PENDING | P0 — фундамент |
| 2 | API Layer (endpoints, логика бота, CSRF) | ⏳ PENDING | P0 — ядро |
| 3 | Frontend Components (widget, dialog, messages) | ⏳ PENDING | P0 — UX |
| 4 | Admin Panel (dashboard, FAQ, history, settings) | ⏳ PENDING | P1 — управление |
| 5 | Integration & Final Audit | ⏳ PENDING | P0 — финал |

---

## Change-1: Database Layer

### Файлы для создания/изменения

| Файл | Действие | Описание |
|------|----------|----------|
| `schema.sql` | EDIT | Добавить 4 таблицы + индексы (БЛОК 9: Chatbot) |
| `frontend-sveltekit/src/lib/server/db/database.ts` | EDIT | Добавить prepared statements + seedChatbot() |

### Подзадачи

1. Добавить в `schema.sql`:
   - `chat_sessions` (12 колонок, 3 индекса)
   - `chat_messages` (7 колонок, 1 индекс)
   - `chat_faq` (10 колонок, 2 индекса)
   - `chat_config` (6 колонок)

2. Добавить в `createQueries()`:
   ```
   // Chat Sessions
   createChatSession, getChatSession, updateChatSession,
   updateChatSessionContact, adminListChatSessions,
   adminCountChatSessions, adminCountChatSessionsToday,
   adminCountChatSessionsWaiting

   // Chat Messages
   insertChatMessage, getChatMessagesBySession,
   markChatMessagesRead, adminGetChatDialog

   // Chat FAQ
   getChatFaqActive, searchChatFaq, adminListChatFaq,
   adminCreateChatFaq, adminUpdateChatFaq, adminDeleteChatFaq,
   adminToggleChatFaq, incrementFaqMatchCount,
   adminGetMaxFaqPosition, adminSwapFaqPositions

   // Chat Config
   getChatConfig, setChatConfig, getAllChatConfig
   ```

3. Добавить `seedChatbot()`:
   - 8 FAQ записей
   - 8 chat_config defaults

---

## Change-2: API Layer

### Файлы для создания

| Файл | Действие | Описание |
|------|----------|----------|
| `routes/api/chat/+server.ts` | CREATE | POST handler — отправка сообщения |
| `routes/api/chat/session/+server.ts` | CREATE | GET handler — получение сессии |
| `routes/api/chat/contact/+server.ts` | CREATE | POST handler — отправка контакта |
| `src/lib/server/chat/bot-logic.ts` | CREATE | Логика бота (FAQ match, product match, fallback) |
| `hooks.server.ts` | EDIT | Добавить CSRF exemption |

### Подзадачи

1. Создать `bot-logic.ts`:
   - `matchFaq(message)` — поиск по keywords
   - `matchProducts(message)` — поиск по бренду/категории
   - `generateResponse(message, session_id)` — orchestrator
   - `sanitizeMessage(input)` — очистка HTML, длина

2. Создать `POST /api/chat`:
   - Rate limiting (in-memory Map)
   - Session management (cookie `chat_session_id`)
   - Вызов `generateResponse()`
   - Сохранение user + bot messages

3. Создать `GET /api/chat/session`:
   - Получить/создать session
   - Вернуть config + history

4. Создать `POST /api/chat/contact`:
   - Валидация name + phone
   - Обновление session (contact info, status)
   - Telegram notification

5. CSRF: добавить в publicEndpoints

---

## Change-3: Frontend Components

### Файлы для создания

| Файл | Действие | Описание |
|------|----------|----------|
| `src/lib/components/chat/ChatWidget.svelte` | CREATE | Floating button |
| `src/lib/components/chat/ChatDialog.svelte` | CREATE | Окно чата |
| `src/lib/components/chat/ChatMessage.svelte` | CREATE | Сообщение |
| `src/lib/components/chat/ChatProductCard.svelte` | CREATE | Карточка товара |
| `src/lib/components/chat/ChatContactForm.svelte` | CREATE | Форма контакта |

### Подзадачи

1. ChatWidget.svelte:
   - Floating button 60×60px, bottom-right
   - State: isOpen ($state)
   - Badge counter
   - CSS: `position: fixed; z-index: 250;`
   - Dark theme support через CSS variables

2. ChatDialog.svelte:
   - Props: config, onclose
   - State: messages ($state), input ($state), isLoading ($state)
   - Methods: sendMessage(), loadSession()
   - onMount → fetch session + config
   - Auto-scroll на новые сообщения
   - Quick replies → sendMessage(text)
   - Desktop: 380×520px; Mobile: fullscreen

3. ChatMessage.svelte:
   - Props: role, content, timestamp, products?
   - User: right-aligned, primary color
   - Bot: left-aligned, surface color
   - Typing: animated dots

4. ChatProductCard.svelte:
   - Props: product (id, name, brand, price, slug, image)
   - Мини-карточка (120px high)
   - Link to /product/slug

5. ChatContactForm.svelte:
   - Props: session_id, onsubmit
   - Fields: name, phone, email (optional)
   - POST /api/chat/contact

---

## Change-4: Admin Panel

### Файлы для создания

| Файл | Действие | Описание |
|------|----------|----------|
| `routes/(admin)/admin/chatbot/+page.server.ts` | CREATE | Dashboard load + actions |
| `routes/(admin)/admin/chatbot/+page.svelte` | CREATE | Dashboard UI |
| `routes/(admin)/admin/chatbot/faq/+page.server.ts` | CREATE | FAQ CRUD |
| `routes/(admin)/admin/chatbot/faq/+page.svelte` | CREATE | FAQ UI |
| `routes/(admin)/admin/chatbot/history/+page.server.ts` | CREATE | History load |
| `routes/(admin)/admin/chatbot/history/+page.svelte` | CREATE | History UI |
| `routes/(admin)/admin/chatbot/settings/+page.server.ts` | CREATE | Settings CRUD |
| `routes/(admin)/admin/chatbot/settings/+page.svelte` | CREATE | Settings UI |

### Подзадачи

1. Dashboard:
   - Load: count sessions (total, today, waiting)
   - Load: last 10 sessions с message_count
   - Action: toggleEnabled (is_enabled в chat_config)

2. FAQ Management:
   - Load: all FAQ records с фильтром по category
   - Actions: create, update, delete, toggle, move (up/down)
   - UI: таблица + inline edit + модальное создание

3. History:
   - Load: sessions с пагинацией (20/page), фильтр по status
   - Load: messages для выбранной сессии (query param ?session=)
   - Action: addNote (добавить human заметку)

4. Settings:
   - Load: all chat_config records
   - Action: save (массовое обновление всех key-value)
   - UI: форма с полями из tech-spec §2.4

---

## Change-5: Integration & Final Audit

### Файлы для изменения

| Файл | Действие | Описание |
|------|----------|----------|
| `routes/+layout.svelte` | EDIT | Import ChatWidget |
| `src/lib/components/admin/AdminSidebar.svelte` | EDIT | Добавить Chatbot в nav |
| `CLAUDE.md` | EDIT | Обновить таблицы БД (50 таблиц) |

### Подзадачи

1. Layout integration:
   - Import ChatWidget
   - Render после SiteFooter (для публичных страниц)

2. AdminSidebar:
   - Добавить группу "Support"
   - 4 пункта навигации

3. Audit:
   - npm run build
   - Проверка каждого endpoint (curl)
   - Проверка UI (визуальная)
   - Dark/light тема
   - Mobile responsive
   - Code review

---

## Оценка объёма

| Change | Новых файлов | Изменённых файлов | Строк кода (~ ) |
|--------|-------------|-------------------|-----------------|
| 1 - DB | 0 | 2 | ~200 |
| 2 - API | 4 | 1 | ~350 |
| 3 - Frontend | 5 | 0 | ~600 |
| 4 - Admin | 8 | 0 | ~800 |
| 5 - Integration | 0 | 3 | ~30 |
| **ИТОГО** | **17** | **6** | **~1980** |

---

## Чек-лист браузера (для финального аудита)

### Публичная часть
- [ ] Floating button видим на главной
- [ ] Floating button видим на /catalog
- [ ] Floating button видим на /product/slug
- [ ] Floating button НЕ видим на /admin/*
- [ ] Клик → открытие диалога
- [ ] Приветственное сообщение от Modi
- [ ] Quick replies отображаются
- [ ] Клик по quick reply → отправка
- [ ] Ввод текста + Enter → отправка
- [ ] Ответ бота отображается
- [ ] Typing indicator во время загрузки
- [ ] "Связаться с консультантом" → форма контакта
- [ ] Форма контакта → отправка → подтверждение
- [ ] Карточки товаров в ответе бота (если есть match)
- [ ] Ссылка "Подробнее" в карточке → /product/slug
- [ ] Закрытие диалога (крестик)
- [ ] Переоткрытие → история сохранена
- [ ] Dark theme: все элементы читабельны
- [ ] Mobile: диалог fullscreen

### Админка
- [ ] /admin/chatbot — статистика отображается
- [ ] /admin/chatbot — toggle включения работает
- [ ] /admin/chatbot/faq — список FAQ отображается
- [ ] /admin/chatbot/faq — создание нового FAQ
- [ ] /admin/chatbot/faq — редактирование FAQ
- [ ] /admin/chatbot/faq — удаление FAQ
- [ ] /admin/chatbot/faq — toggle active
- [ ] /admin/chatbot/faq — reorder (up/down)
- [ ] /admin/chatbot/history — список чатов с пагинацией
- [ ] /admin/chatbot/history — фильтр по статусу
- [ ] /admin/chatbot/history — просмотр диалога
- [ ] /admin/chatbot/settings — форма настроек
- [ ] /admin/chatbot/settings — сохранение работает

---

*Roadmap-final готов: 2026-02-20*
