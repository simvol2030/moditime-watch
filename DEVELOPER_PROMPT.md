# Промпт для Developer (Session-6)

> **Скопируй этот промпт в Claude Code Web**

---

## Промпт

```
Привет! Я Developer для проекта Moditime Watch (e-commerce для премиальных часов).

КРИТИЧЕСКИ ВАЖНО:
1. СНАЧАЛА обновляюсь до актуальной версии main (Session-5 уже в main!)
2. Работаю ТОЛЬКО с Session-6 (pSEO Schema & Backend)
3. НЕ трогаю Sessions 7-8 (они для следующих запусков)
4. После завершения ОБЯЗАТЕЛЬНО делаю commit + push

ИНСТРУКЦИЯ:

Шаг 0: Обновляюсь до актуальной версии main
git checkout main
git pull origin main
git log --oneline -1
# Проверяю: должен быть коммит 453f938 или новее
# Если старее — повторяю git pull!

Шаг 1: Прочитай контекст проекта
- project-doc/DEVELOPER_START.md        ← ПЕРВЫЙ ФАЙЛ!
- project-doc/SESSIONS_ROADMAP.md       ← roadmap всех сессий
- project-doc/COMPLETED.md              ← Sessions 1-5 = DONE
- project-doc/session-6-pseo-schema/roadmap.md  ← моя сессия
- CLAUDE.md                             ← контекст проекта
- CLAUDE.web.md                         ← мой workflow

Шаг 2: Моя задача — Session-6 (8 задач)
1. ALTER city_articles (Low) — добавить meta_title, meta_description, category_id, read_time
2. Таблица city_article_categories (Low) — CREATE TABLE + prepared statements
3. Таблицы city_article_tags + relations (Medium) — CREATE TABLE + prepared statements
4. Таблица city_article_related (Low) — CREATE TABLE + prepared statements
5. Таблица city_article_media (Medium) — CREATE TABLE + prepared statements
6. Prepared statements city_article_products (Low) — для существующей таблицы
7. FTS5 для city_articles (Medium) — CREATE VIRTUAL TABLE + триггеры
8. Seed данных (Москва) (Medium) — 3-4 статьи + категории + теги + медиа

Шаг 3: Workflow (CLAUDE.web.md)
1. Research → изучить schema.sql, database.ts
2. Tech-spec → создать tech-spec.md
3. Plan → создать plan.md
4. Roadmap-final → roadmap-final.md
5. Implementation → реализация 8 задач
6. Commit + Push → git commit + git push ← ОБЯЗАТЕЛЬНО!

Шаг 4: Ветка
git checkout -b claude/session-6-pseo-schema

Шаг 5: После завершения
1. npm run build (проверка)
2. git add .
3. git commit -m "feat: session-6 pseo schema complete..."
4. git push origin claude/session-6-pseo-schema
5. Уведомить CLI: "Session-6 завершена, ветка запушена"

ВАЖНО:
- НЕ делать Sessions 7-8 сейчас!
- НЕ переписывать код Sessions 1-5
- Обязательно push после завершения
- Следовать roadmap.md проверкам
- ОБЯЗАТЕЛЬНО git pull origin main ПЕРЕД началом!

Начинаю с git checkout main && git pull origin main!
```

---

## Как использовать

1. **Открой Claude Code Web** (claude.ai/code или app)
2. **Открой проект** `moditime-watch`
3. **Скопируй промпт выше** и отправь
4. **Developer начнёт работу** — первым обновит main, потом прочитает DEVELOPER_START.md

---

**Версия:** 2.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-01
**Для:** Session-6 start
**Важно:** Developer ОБЯЗАТЕЛЬНО обновится до актуальной версии main (Session-5 уже в main!)
