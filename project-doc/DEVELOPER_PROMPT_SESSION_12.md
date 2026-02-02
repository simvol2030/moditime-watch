# Developer Prompt: Session-12 (Communication & Admin UX) — ПОСЛЕДНЯЯ СЕССИЯ! 🎉

> **Важно:** Это ПОСЛЕДНЯЯ сессия проекта! После завершения проект готов на 100%.

---

## 🎯 Контекст проекта

**Проект:** Moditime Watch — премиальные часы (SvelteKit 2.x + Express + SQLite)
**Production:** https://moditime-watch.ru
**Прогресс:** 74/77 задач (96%) — осталось 3 задачи!

**Завершённые сессии:**
- ✅ Sessions 1-11 — все выполнены и задеплоены

**Текущая сессия:** Session-12 (Communication & Admin UX)

---

## 📋 Session-12: Communication & Admin UX Improvements

**Приоритет:** 🟡 MEDIUM
**Задач:** 3 (одна масштабная — drag-and-drop)
**Зависимости:** Session-5 (Notifications) ✅ DONE, Session-2 (Admin Panel) ✅ DONE
**Roadmap:** `/project-doc/session-12-communication-ux/roadmap.md` ← **ПРОЧИТАЙ ПЕРВЫМ!**

### Что нужно сделать

**Task 1: Убрать Telegram iframe → ссылка + админка управление (MEDIUM-2)**
- Убрать CSP violation (Telegram iframe blocked)
- Заменить iframe на простую ссылку `t.me/moditime_watch`
- Добавить админку для управления: включить/выключить, изменить URL и текст
- Config в БД: `telegram_enabled`, `telegram_url`, `telegram_label`

**Task 2: Phone visibility + функционал обратного звонка (MEDIUM-8)**
- Phone icon на mobile (CityHeader + Footer)
- Два режима работы телефона (настраивается в админке):
  1. **Прямой звонок** → `<a href="tel:+79991234567">`
  2. **Форма обратного звонка** → modal с формой, отправка на email + Telegram
- Callback endpoint: `/api/callback` → email + Telegram notification
- CallbackModal компонент (Dialog с формой)
- Админка: `/admin/system/settings` — переключение режима + телефон

**Task 3: Drag-and-drop для приоритетов во всех разделах (FUNC-1) — МАСШТАБНАЯ ЗАДАЧА**
- Проблема: Ручной ввод order → конфликты, неудобно
- Решение: Drag-and-drop интерфейс для изменения порядка
- Создать универсальный `DragDropList.svelte` компонент (используя `svelte-dnd-action`)
- Применить во всех разделах с order полями:
  - Navigation (`/admin/system/navigation`)
  - Collections (`/admin/content/collections` — если есть `display_order`)
  - Categories (`/admin/content/categories` — если есть `sort_order`)
  - Footer links (`/admin/system/footer` — если есть `order`)
  - City Article Categories (`/admin/pseo/categories` — если есть `order`)
- Backend endpoint для reorder: `/api/{resource}/reorder`
- Убрать ручной ввод order из форм

---

## 🛠️ Workflow (как всегда)

### Фаза 1: Research & Tech-spec (1-2 часа)

**Действие:**
1. Прочитай **roadmap.md** полностью — там детальная реализация
2. Research:
   - Где используется Telegram iframe? (`grep -r "t.me" src/`)
   - Где отображается phone в CityHeader/Footer? (читай компоненты)
   - Какие таблицы имеют `order`/`priority` поля? (проверь schema.sql или sqlite `.schema`)
3. Создай `tech-spec.md` в `project-doc/session-12-communication-ux/`:
   - Telegram: где iframe, как заменить, config endpoints
   - Phone: CityHeader/Footer изменения, CallbackModal design, backend endpoint
   - Drag-and-drop: список всех разделов с order, компонент API, backend endpoints

**Вопросы для tech-spec:**
- Где точно используется Telegram iframe?
- Есть ли уже config endpoints в backend или нужно создать?
- Какие таблицы имеют order поля? (найди ВСЕ)
- Существует ли уже CallbackModal или создать с нуля?

### Фаза 2: Plan & Roadmap-final (30 мин)

**Действие:**
1. Создай `plan.md` — sequence задач:
   - Task 1: Telegram (2 subtasks)
   - Task 2: Phone (5 subtasks)
   - Task 3: Drag-and-drop (6+ subtasks)
2. Создай `roadmap-final.md` — копия roadmap.md с твоими уточнениями

**Обязательно учти:**
- Добавить `svelte-dnd-action` в dependencies
- Callback requests нужна таблица в БД (или использовать existing notifications table?)
- Phone config: где хранить? (в `config` table с category='communication')

### Фаза 3: Implementation (4-5 часов)

**Порядок реализации (рекомендуемый):**

**3.1 Task 1: Telegram (30 мин)**
- Найти и убрать iframe
- Заменить на ссылку с conditional render (`{#if config.telegram_enabled}`)
- Config seed (telegram_enabled, telegram_url, telegram_label)
- Backend endpoint `/api/config/telegram` (PUT)
- Admin UI `/admin/system/settings` — Telegram section

**3.2 Task 2: Phone (2 часа)**
- Mobile phone icon в CityHeader (conditional: direct/callback)
- Mobile phone icon в Footer (аналогично)
- CallbackModal компонент (Dialog + form)
- Backend endpoint `/api/callback` (POST) — email + Telegram
- DB migration (если нужна таблица callback_requests)
- Config seed (phone_mode, phone_number)
- Backend endpoint `/api/config/phone` (PUT)
- Admin UI `/admin/system/settings` — Phone section

**3.3 Task 3: Drag-and-drop (2-3 часа) — МАСШТАБНАЯ**
- `npm install svelte-dnd-action`
- Создать `DragDropList.svelte` (universal component)
- Найти ВСЕ разделы с order:
  ```bash
  sqlite3 app.db ".schema" | grep -E "order|priority"
  # Вероятно: navigation, collections?, categories?, footer_links?, city_article_categories?
  ```
- Для каждого раздела:
  - Добавить DragDropList в admin страницу
  - Backend endpoint `/api/{resource}/reorder`
  - Убрать ручной ввод order из forms
- Тестировать reorder в каждом разделе

**Файлы для изменения:**
- Frontend:
  - `src/lib/components/layout/Footer.svelte` (убрать iframe, добавить ссылку, phone icon)
  - `src/lib/components/layout/CityHeader.svelte` (phone icon mobile)
  - `src/lib/components/layout/CityFooter.svelte` (phone icon mobile если есть)
  - `src/lib/components/modals/CallbackModal.svelte` (NEW)
  - `src/lib/components/admin/DragDropList.svelte` (NEW)
  - `src/routes/+layout.server.ts` (load config: telegram, phone)
  - `src/routes/(admin)/admin/system/settings/+page.svelte` (Telegram + Phone UI)
  - `src/routes/(admin)/admin/system/navigation/+page.svelte` (DragDropList)
  - Другие admin pages с order (collections, categories, footer, pseo/categories)
- Backend:
  - `backend-expressjs/src/routes/config.ts` (telegram, phone endpoints)
  - `backend-expressjs/src/routes/callback.ts` (NEW — POST /callback)
  - `backend-expressjs/src/routes/navigation.ts` (PUT /reorder)
  - Другие routes для reorder (collections, categories, etc.)
- Database:
  - migrations/008-communication-config.sql (telegram, phone config)
  - migrations/009-callback-requests.sql (если нужна отдельная таблица)

**Build check:**
```bash
cd frontend-sveltekit
npm install  # svelte-dnd-action
npm run build  # Должен пройти без ошибок

cd ../backend-expressjs
npm run build  # Должен пройти без ошибок
```

### Фаза 4: Testing & Checklist (30 мин)

**Проверки из roadmap:**

**Communication (Desktop + Mobile):**
- [ ] No CSP violation для Telegram
- [ ] Telegram link работает (opens t.me/moditime_watch)
- [ ] Phone icon виден на mobile (CityHeader + Footer)
- [ ] Phone режим "direct" → tel: link работает
- [ ] Phone режим "callback" → modal открывается
- [ ] Callback form отправляет данные → email + Telegram notification

**Admin UX (Desktop):**
- [ ] Админка Telegram settings работает (enable/disable, change URL)
- [ ] Админка Phone settings работает (mode switch, change number)
- [ ] Drag-and-drop работает в Navigation
- [ ] Drag-and-drop работает во всех разделах с order
- [ ] No order conflicts после reorder

---

## 📁 Где найти информацию

**Roadmap и спецификации:**
- `/project-doc/session-12-communication-ux/roadmap.md` ← **ГЛАВНЫЙ ДОКУМЕНТ**
- `/feedbacks/qa-reports/session-8-v1/tech-report.md` — источник WARN-2 (Telegram CSP)
- `/feedbacks/qa-reports/session-8-v1/ux-report.md` — источник MINOR-1 (Phone mobile)

**Контекст кодовой базы:**
- `/CLAUDE.md` — общий контекст проекта
- `/CLAUDE.web.md` — твой workflow (Research → Plan → Implementation)
- `/frontend-sveltekit/CLAUDE.md` — frontend architecture
- `/backend-expressjs/CLAUDE.md` — backend architecture

**Предыдущие сессии (для примеров):**
- Session-5 (Notifications) — email + Telegram notifications service
- Session-2 (Admin Panel) — admin UI patterns
- Session-4 (Layout Management) — Footer management

---

## ⚠️ Критические напоминания

### 1. Dependencies check
- ✅ Session-5 (Notifications) — DONE (используй `sendEmail`, `sendTelegramNotification`)
- ✅ Session-2 (Admin Panel) — DONE (используй admin UI patterns)

### 2. Security & Validation
- **Callback endpoint:** validate phone format, rate limiting (avoid spam)
- **Config endpoints:** require admin auth (middleware)
- **CSP:** после убирания iframe проверь что CSP violation исчез

### 3. Database migrations
- Используй `migrations/008-*.sql` для config
- Если нужна таблица callback_requests — создай migration 009

### 4. Drag-and-drop library
```bash
npm install svelte-dnd-action
```
Используй пример из roadmap.md — он уже проверенный.

### 5. Task 3 масштабная
Drag-and-drop нужно применить во **ВСЕХ** разделах с order. Не пропусти ни один!

Проверь schema:
```bash
sqlite3 app.db
.schema navigation    # есть ли order?
.schema collections   # есть ли display_order?
.schema categories    # есть ли sort_order?
.schema city_article_categories  # есть ли order?
# etc.
```

---

## 🎯 Завершение сессии

### Когда закончишь:

1. **Commit & Push:**
```bash
git add -A
git commit -m "feat: session-12 communication & admin UX improvements

Task 1: Telegram iframe → link + admin management
- Removed CSP violation (iframe blocked)
- Added telegram link with config
- Admin UI for telegram settings

Task 2: Phone visibility + callback functionality
- Phone icon on mobile (CityHeader + Footer)
- Two modes: direct call / callback form
- CallbackModal component
- Backend endpoint /api/callback → email + Telegram
- Admin UI for phone settings

Task 3: Drag-and-drop for priorities in all admin sections
- Created DragDropList component (svelte-dnd-action)
- Applied to: Navigation, Collections, Categories, Footer, pSEO Categories
- Backend /reorder endpoints
- Removed manual order input from forms

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin claude/session-12-communication-ux
```

2. **Обнови TODO:**
```markdown
## Session-12 Status

✅ Task 1: Telegram iframe → link + admin (MEDIUM-2) — DONE
✅ Task 2: Phone visibility + callback (MEDIUM-8) — DONE
✅ Task 3: Drag-and-drop priorities (FUNC-1) — DONE

Build: ✅ PASS
Checks: ✅ ALL PASSED
```

3. **Telegram уведомление (автоматически через hooks):**
```
✅ Session-12 завершена! 🎉
3/3 задач выполнено
Ветка: claude/session-12-communication-ux
Commit: [hash]
```

4. **Сообщи CLI:**
> "Session-12 завершена. Ветка `claude/session-12-communication-ux` запушена. Commit: [hash]. Все 3 задачи реализованы: Telegram link + admin, Phone callback + admin, Drag-and-drop для всех order полей. Build успешен. Готов к merge и deploy!"

---

## 🎉 Особые поздравления

**Ты завершаешь ПОСЛЕДНЮЮ сессию проекта Moditime Watch!**

После merge и deploy Session-12 → **проект готов на 100%! 🚀**

77/77 задач выполнено, 12/12 сессий завершено. Поздравляю! 🎊

---

**Удачи в реализации! Ты справишься! 💪**

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Claude Code Web (Developer)
**Roadmap:** `/project-doc/session-12-communication-ux/roadmap.md`
**Сессия:** Session-12 — ПОСЛЕДНЯЯ СЕССИЯ ПРОЕКТА! 🎯
