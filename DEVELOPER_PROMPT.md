# Промпт для Developer (Session-5)

> **Скопируй этот промпт в Claude Code Web**

---

## Промпт

```
Привет! Я Developer для проекта Moditime Watch (e-commerce для премиальных часов).

КРИТИЧЕСКИ ВАЖНО:
1. Работаю ТОЛЬКО с Session-5 (Notifications & Order Flow)
2. НЕ трогаю Sessions 6-8 (они для следующих запусков)
3. После завершения ОБЯЗАТЕЛЬНО делаю commit + push

ИНСТРУКЦИЯ:

Шаг 1: Прочитай контекст проекта
- project-doc/DEVELOPER_START.md        ← ПЕРВЫЙ ФАЙЛ!
- project-doc/SESSIONS_ROADMAP.md       ← roadmap всех сессий
- project-doc/COMPLETED.md              ← Sessions 1-4 = DONE
- project-doc/session-5-notifications/roadmap.md  ← моя сессия
- CLAUDE.md                             ← контекст проекта
- CLAUDE.web.md                         ← мой workflow

Шаг 2: Моя задача — Session-5 (6 задач)
1. Telegram Bot (Medium) — реальная отправка в группу
2. Email Service (Medium) — SMTP через Nodemailer
3. Email Templates seed (Low) — 5 шаблонов
4. Notifications Admin UI (Medium) — настройки + тест
5. Order Flow интеграция (Medium) — checkout → уведомления
6. Order Status уведомления (Medium) — смена статуса → email

Шаг 3: Workflow (CLAUDE.web.md)
1. Research → изучить src/lib/server/notifications/
2. Tech-spec → создать tech-spec.md
3. Plan → создать plan.md
4. Roadmap-final → roadmap-final.md
5. Implementation → реализация 6 задач
6. Commit + Push → git commit + git push ← ОБЯЗАТЕЛЬНО!

Шаг 4: Ветка
git checkout -b claude/session-5-notifications

Шаг 5: После завершения
1. npm run build (проверка)
2. git add .
3. git commit -m "feat: session-5 notifications complete..."
4. git push origin claude/session-5-notifications
5. Уведомить CLI: "Session-5 завершена, ветка запушена"

ВАЖНО:
- НЕ делать Sessions 6-8 сейчас!
- НЕ переписывать код Sessions 1-4
- Обязательно push после завершения
- Следовать roadmap.md проверкам

Начинаю с чтения project-doc/DEVELOPER_START.md!
```

---

## Как использовать

1. **Открой Claude Code Web** (claude.ai/code или app)
2. **Открой проект** `moditime-watch`
3. **Скопируй промпт выше** и отправь
4. **Developer начнёт работу** с чтения DEVELOPER_START.md

---

**Версия:** 1.0
**Создано:** 2025-02-01
