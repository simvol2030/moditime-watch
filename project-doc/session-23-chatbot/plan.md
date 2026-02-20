# Session 23: Chatbot — Plan

**Дата:** 2026-02-20
**На основе:** research.md, tech-spec.md

---

## Changes Overview

| Change | Описание | Зависимости |
|--------|----------|-------------|
| **Change-1** | БД: таблицы + queries + seed + миграция | — |
| **Change-2** | API: /api/chat endpoints + логика бота | Change-1 |
| **Change-3** | Frontend: ChatWidget + ChatDialog компоненты | Change-2 |
| **Change-4** | Админка: /admin/chatbot/* (dashboard, FAQ, history, settings) | Change-1, Change-2 |
| **Change-5** | Интеграция: layout, CSRF, sidebar, финальный аудит | Change-1..4 |

---

## Change-1: Database Layer

### Задачи

1. **Добавить таблицы в schema.sql**
   - `chat_sessions` — сессии чатов
   - `chat_messages` — сообщения
   - `chat_faq` — FAQ база
   - `chat_config` — настройки чатбота
   - Индексы для каждой таблицы

2. **Добавить prepared statements в database.ts**
   - Queries для chat_sessions (create, get, update, list, count)
   - Queries для chat_messages (insert, getBySession, markRead)
   - Queries для chat_faq (CRUD, search, increment match_count)
   - Queries для chat_config (get, set, getAll)

3. **Seed начальные данные**
   - 8 FAQ записей (доставка, оплата, гарантия, возврат и т.д.)
   - chat_config defaults (bot_name, welcome_message, quick_replies и т.д.)
   - Seed в функцию `seedChatbot()` в database.ts

### DoD (Definition of Done)

- [ ] 4 новые таблицы в schema.sql с корректным синтаксисом
- [ ] Все prepared statements добавлены в createQueries()
- [ ] Seed данные создаются при первом запуске
- [ ] `npm run build` проходит без ошибок

---

## Change-2: API Layer

### Задачи

1. **POST /api/chat — основной endpoint**
   - Получение/создание session через cookie `chat_session_id`
   - Сохранение user message в chat_messages
   - Логика бота:
     - FAQ matching (keywords search)
     - Product matching (brand/category search)
     - Fallback с quick_replies
   - Сохранение bot response в chat_messages
   - Rate limiting (30 msg/min per session)

2. **GET /api/chat/session — получение сессии**
   - Если есть cookie → загрузить сессию + историю
   - Если нет → создать новую + вернуть config
   - Установить cookie `chat_session_id`

3. **POST /api/chat/contact — отправка контакта**
   - Сохранение name/phone/email в chat_sessions
   - Изменение статуса на `waiting_human`
   - Telegram уведомление

4. **CSRF exemption**
   - Добавить `/api/chat`, `/api/chat/session`, `/api/chat/contact` в publicEndpoints

### DoD

- [ ] POST /api/chat возвращает корректный ответ на любое сообщение
- [ ] FAQ matching работает по ключевым словам
- [ ] Product matching находит товары по бренду/категории
- [ ] Session создаётся и сохраняется в cookie
- [ ] Rate limiting работает (429 при превышении)
- [ ] CSRF не блокирует запросы к /api/chat*
- [ ] `npm run build` проходит без ошибок

---

## Change-3: Frontend Components

### Задачи

1. **ChatWidget.svelte — плавающая кнопка**
   - Floating button (bottom-right, 60×60px)
   - Иконка часов/чата + badge с непрочитанными
   - Анимация появления (fade-up, delay 1s)
   - Клик → toggle ChatDialog
   - Скрывается когда ChatDialog открыт
   - Полная поддержка light/dark theme

2. **ChatDialog.svelte — окно чата**
   - Header: аватар бота (emoji), имя "Modi", статус "Онлайн"
   - Область сообщений (auto-scroll, typing indicator)
   - Quick replies (chips, горизонтальный scroll)
   - Input + кнопка отправки (Enter = отправить)
   - Кнопка закрытия
   - Размер: 380×520px desktop, fullscreen mobile
   - Slide-up анимация открытия
   - Fetch /api/chat/session на mount
   - Fetch /api/chat на отправку сообщения

3. **ChatMessage.svelte — сообщение**
   - User: справа, primary background, белый текст
   - Bot: слева, surface background
   - Timestamp (HH:MM)
   - Typing indicator (animated dots)

4. **ChatProductCard.svelte — карточка товара**
   - Мини-карточка внутри сообщения бота
   - Изображение + name + brand + цена
   - Кнопка "Подробнее" → /product/slug

5. **ChatContactForm.svelte — форма контакта**
   - Имя (required) + Телефон (required) + Email (optional)
   - Кнопка "Отправить"
   - POST /api/chat/contact

### DoD

- [ ] ChatWidget отображается на всех публичных страницах
- [ ] ChatDialog открывается/закрывается с анимацией
- [ ] Сообщения отправляются и отображаются корректно
- [ ] Quick replies кликабельны и отправляют сообщение
- [ ] Typing indicator показывается при ожидании ответа
- [ ] Карточки товаров отображаются в ответах бота
- [ ] Форма контакта отправляет данные
- [ ] Light/dark тема работает без артефактов
- [ ] Мобильная версия fullscreen
- [ ] `npm run build` проходит без ошибок

---

## Change-4: Admin Panel

### Задачи

1. **/admin/chatbot — Dashboard**
   - Статистика: всего чатов, сегодня, ожидают ответа
   - Последние 10 чатов (таблица: session_id, visitor, messages, status, date)
   - Toggle: включить/выключить чатбот (is_enabled)

2. **/admin/chatbot/faq — Управление FAQ**
   - Таблица FAQ с колонками: question, answer, category, keywords, active, matches
   - Создание нового FAQ (модальное окно или inline form)
   - Редактирование (inline editing)
   - Удаление (с подтверждением)
   - Toggle is_active
   - Фильтр по category
   - Reorder (up/down arrows, как в других админ-страницах)

3. **/admin/chatbot/history — История чатов**
   - Список сессий с пагинацией (20/page)
   - Фильтр по статусу (all/active/closed/waiting_human)
   - Клик → полный диалог (все сообщения)
   - Добавление заметки оператором

4. **/admin/chatbot/settings — Настройки**
   - Имя бота + аватар emoji
   - Приветственное сообщение (textarea)
   - Offline сообщение (textarea)
   - Быстрые ответы (editable list — add/remove/reorder)
   - Часы работы (start/end time inputs)
   - Задержка автооткрытия (number input)

### DoD

- [ ] Dashboard показывает актуальную статистику
- [ ] FAQ CRUD работает (создание, редактирование, удаление)
- [ ] FAQ reorder работает (up/down)
- [ ] History показывает чаты с пагинацией
- [ ] History → просмотр полного диалога работает
- [ ] Settings форма сохраняет все поля
- [ ] Все страницы соответствуют стилю существующей админки
- [ ] `npm run build` проходит без ошибок

---

## Change-5: Integration & Final Audit

### Задачи

1. **Интеграция ChatWidget в +layout.svelte**
   - Import и рендеринг рядом с SiteFooter
   - Только для публичных страниц (не admin, не city)

2. **Добавить Chatbot в AdminSidebar**
   - Новая группа "Support" в navItems
   - 4 пункта: Dashboard, FAQ, History, Settings

3. **Финальный аудит**
   - Build check: `npm run build` без ошибок
   - TypeScript check (если `npx tsc --noEmit` доступен)
   - Функциональная проверка каждого компонента
   - Light/dark тема проверка
   - Mobile responsive проверка
   - Код review: нет console.log, нет TODO, стиль соответствует проекту

### DoD

- [ ] ChatWidget видим на публичных страницах
- [ ] Chatbot в сайдбаре админки
- [ ] Build проходит без ошибок
- [ ] Код соответствует стилю проекта (Правило 2)
- [ ] Нет console.log для отладки
- [ ] Нет закомментированного кода

---

## Порядок выполнения

```
Change-1 (DB) → Change-2 (API) → Change-3 (Frontend) → Change-4 (Admin) → Change-5 (Integration)
```

Строго последовательно: каждый change зависит от предыдущего.

---

## Аудит плана (тройная проверка)

### 1. Полнота
- [x] Все 4 таблицы БД описаны
- [x] Все 3 API endpoints описаны
- [x] Все 5 frontend компонентов описаны
- [x] Все 4 страницы админки описаны
- [x] CSRF exemption учтён
- [x] Rate limiting учтён
- [x] Light/dark тема учтена
- [x] Мобильная адаптация учтена
- [x] Seed данные описаны
- [x] Интеграция в layout описана

### 2. Реалистичность
- [x] DoD для каждого change конкретные и проверяемые
- [x] Нет зависимости от внешних API (rule-based бот)
- [x] Все паттерны взяты из существующего кода проекта
- [x] Объём адекватный (5 changes для полного chatbot)

### 3. Порядок
- [x] DB → API → Frontend → Admin → Integration (правильная последовательность)
- [x] Каждый change может быть проверен независимо
- [x] Зависимости указаны явно

---

*Plan завершён и проверен: 2026-02-20*
