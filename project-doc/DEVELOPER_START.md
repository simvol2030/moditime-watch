# Developer Start Instructions

> **ПРОЧИТАЙ ПЕРВЫМ!** Инструкция для запуска Session-6

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО

1. **Работай ТОЛЬКО с Session-6** — НЕ делай Sessions 7-8 сейчас!
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
project-doc/COMPLETED.md               — что уже сделано (Sessions 1-5 = DONE)
project-doc/session-6-pseo-schema/roadmap.md  — твоя сессия
CLAUDE.md                              — контекст проекта
CLAUDE.web.md                          — workflow Developer
```

**Ключевые факты:**
- Sessions 1-5 = ✅ DONE (34 задачи выполнено)
- Session-6 = ⏳ PENDING (8 задач) ← **ТВОЯ СЕССИЯ**
- Sessions 7-8 = ⏳ PENDING (НЕ ТРОГАЙ ИХ СЕЙЧАС!)
- **Ветка main:** актуальная с Session-5 (commit 453f938)
- **ВАЖНО:** Сделай `git pull origin main` ПЕРЕД началом!

---

## Шаг 2: Твоя задача — Session-6

**Что делать:**

1. Прочитай `project-doc/session-6-pseo-schema/roadmap.md`
2. Выполни **ТОЛЬКО 8 задач Session-6:**
   1. ALTER city_articles (Low)
   2. Таблица city_article_categories (Low)
   3. Таблицы city_article_tags + relations (Medium)
   4. Таблица city_article_related (Low)
   5. Таблица city_article_media (Medium)
   6. Prepared statements city_article_products (Low)
   7. FTS5 для city_articles (Medium)
   8. Seed данных (Москва) (Medium)

**Что НЕ делать:**
- ❌ НЕ начинай Session-7, Session-8
- ❌ НЕ работай с несколькими сессиями одновременно
- ❌ НЕ переписывай уже готовый код из Sessions 1-5

---

## Шаг 3: Workflow

**Следуй CLAUDE.web.md:**

1. **Research** → изучи существующий код (src/lib/server/db/database.ts, schema.sql)
2. **Tech-spec** → создай tech-spec.md
3. **Plan** → создай plan.md
4. **Roadmap-final** → roadmap-final.md
5. **Implementation** → реализация 8 задач
6. **Commit + Push** → git commit + git push ← **ОБЯЗАТЕЛЬНО!**

---

## Шаг 4: Обновись до актуальной версии main

**КРИТИЧЕСКИ ВАЖНО — сделай это ПЕРВЫМ:**

```bash
# 1. Перейди на main
git checkout main

# 2. Получи последние изменения (Session-5 уже в main!)
git pull origin main

# 3. Проверь что ты на актуальном коммите
git log --oneline -1
# Должен быть коммит 453f938 или новее
# Если старше — повтори git pull!
```

**Только после этого создай ветку:**

```bash
git checkout -b claude/session-6-pseo-schema
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
- `src/lib/server/db/database.ts` — queries (расширить)
- `schema.sql` — существующие таблицы (расширить)
- `src/routes/(admin)/admin/city-articles/` — существующая админка (использовать как пример)

**Файлы для модификации:**
- `schema.sql` — добавить новые таблицы и колонки
- `src/lib/server/db/database.ts` — добавить prepared statements
- `migrations/` — создать миграции (если нужно)

---

## Напоминание

**Session-6 — это про pSEO Schema & Backend:**
- Расширение БД для pSEO (категории, теги, related, media)
- FTS5 полнотекстовый поиск
- Prepared statements для всех новых таблиц
- Seed данных для Москвы (3-4 статьи с категориями, тегами, медиа)

**НЕ про Admin UI!** (это Session-7, делать позже)
**НЕ про Frontend!** (это Session-8, делать позже)

---

**Версия:** 2.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-01
**Для:** Session-6 start
**Предыдущая сессия:** Session-5 (уже в main, commit 453f938)
**Следующая сессия:** Session-7 (после завершения Session-6)
