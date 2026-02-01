# Developer Start Instructions

> **ПРОЧИТАЙ ПЕРВЫМ!** Инструкция для запуска Session-5

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО

1. **Работай ТОЛЬКО с Session-5** — НЕ делай Sessions 6-8 сейчас!
2. **После завершения Session-5 — ОБЯЗАТЕЛЬНО:**
   - `git add .`
   - `git commit -m "..."`
   - `git push origin claude/session-5-notifications`
3. **Уведоми CLI о завершении**

---

## Шаг 1: Прочитай актуальное состояние проекта

**ОБЯЗАТЕЛЬНО прочитай эти файлы ПЕРВЫМИ:**

```
project-doc/SESSIONS_ROADMAP.md        — общий roadmap всех сессий
project-doc/COMPLETED.md               — что уже сделано (Sessions 1-4 = DONE)
project-doc/session-5-notifications/roadmap.md  — твоя сессия
CLAUDE.md                              — контекст проекта
CLAUDE.web.md                          — workflow Developer
```

**Ключевые факты:**
- Sessions 1-4 = ✅ DONE (28 задач выполнено)
- Session-5 = ⏳ PENDING (6 задач)
- Sessions 6-8 = ⏳ PENDING (НЕ ТРОГАЙ ИХ СЕЙЧАС!)
- Ветка main — актуальная, на production

---

## Шаг 2: Твоя задача — Session-5

**Что делать:**

1. Прочитай `project-doc/session-5-notifications/roadmap.md`
2. Выполни **ТОЛЬКО 6 задач Session-5:**
   1. Telegram Bot (Medium)
   2. Email Service (Medium)
   3. Email Templates seed (Low)
   4. Notifications Admin UI (Medium)
   5. Order Flow интеграция (Medium)
   6. Order Status уведомления (Medium)

**Что НЕ делать:**
- ❌ НЕ начинай Session-6, Session-7, Session-8
- ❌ НЕ работай с несколькими сессиями одновременно
- ❌ НЕ переписывай уже готовый код из Sessions 1-4

---

## Шаг 3: Workflow

**Следуй CLAUDE.web.md:**

1. **Research** → изучи существующий код (src/lib/server/notifications/)
2. **Tech-spec** → создай tech-spec.md
3. **Plan** → создай plan.md
4. **Roadmap-final** → roadmap-final.md
5. **Implementation** → реализация 6 задач
6. **Commit + Push** → git commit + git push ← **ОБЯЗАТЕЛЬНО!**

---

## Шаг 4: Ветка

**Создай ветку:**

```bash
git checkout -b claude/session-5-notifications
```

**Работай в этой ветке** — НЕ коммить в main напрямую.

---

## Шаг 5: После завершения

**КРИТИЧЕСКИ ВАЖНО:**

1. **Проверь build:**
   ```bash
   npm run build
   ```

2. **Commit + Push:**
   ```bash
   git add .
   git commit -m "feat: session-5 notifications complete

   - Telegram Bot (real sending)
   - Email Service (SMTP via Nodemailer)
   - Email Templates seed (5 templates)
   - Notifications Admin UI
   - Order Flow integration
   - Order Status notifications

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

   git push origin claude/session-5-notifications
   ```

3. **Уведоми CLI:**
   - Напиши: "Session-5 завершена, ветка `claude/session-5-notifications` запушена"

---

## Проверки из roadmap.md

**Перед push проверь:**

- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] Telegram API вызывается только при enabled=true
- [ ] Email отправляется только при enabled=true
- [ ] Credentials (bot token, SMTP password) не логируются
- [ ] Error handling: сбой уведомления не блокирует заказ

---

## Файлы для чтения (контекст)

**Существующий код (НЕ переписывай!):**
- `src/lib/server/db/database.ts` — queries
- `src/routes/(admin)/admin/+layout.svelte` — admin layout
- `src/routes/checkout/+page.server.ts` — checkout flow

**Файлы для модификации:**
- `src/lib/server/notifications/telegram.ts` — переписать (mock → real)
- `src/lib/server/notifications/email.ts` — переписать (mock → real)
- `src/routes/(admin)/admin/system/notifications/` — создать (новая страница)

---

## Напоминание

**Session-5 — это про уведомления:**
- Telegram уведомления в группу при новом заказе
- Email покупателю (подтверждение заказа)
- Email админу (уведомление о заказе)
- Email при смене статуса заказа
- Админка для настройки (токены, SMTP)

**НЕ про pSEO!** (это Sessions 6-8, делать позже)

---

**Версия:** 1.0
**Создано:** 2025-02-01
**Для:** Session-5 start
**Следующая сессия:** Session-6 (после завершения Session-5 и merge в main)
