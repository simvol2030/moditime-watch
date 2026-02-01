# Developer Start Instructions

> **ПРОЧИТАЙ ПЕРВЫМ!** Инструкция для запуска Session-6

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО

1. **Работай ТОЛЬКО с Session-7** — НЕ делай Session-8 сейчас!
2. **После завершения Session-7 — ОБЯЗАТЕЛЬНО:**
   - `git add .`
   - `git commit -m "..."`
   - `git push origin claude/session-7-pseo-admin`
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
- Sessions 1-6 = ✅ DONE (42 задачи выполнено)
- Session-7 = ⏳ PENDING (8 задач) ← **ТВОЯ СЕССИЯ**
- Session-8 = ⏳ PENDING (НЕ ТРОГАЙ ЕГО СЕЙЧАС!)
- **Ветка main:** актуальная с Session-6 (commit 17e6397)
- **ВАЖНО:** Сделай `git pull origin main` ПЕРЕД началом!

---

## Шаг 2: Твоя задача — Session-7

**Что делать:**

1. Прочитай `project-doc/session-7-pseo-admin/roadmap.md`
2. Выполни **ТОЛЬКО 8 задач Session-7:**
   1. /admin/pseo Dashboard (Medium) — выбор города + список статей
   2. Форма создания/редактирования статьи (High) — all fields + media + related + tags
   3. Категории CRUD (Low) — /admin/pseo/categories
   4. Теги CRUD (Low) — /admin/pseo/tags
   5. SEO настройки города (Low) — hero_title, meta_description
   6. Импорт/Экспорт (Medium) — Markdown import, CSV export
   7. AdminSidebar — секция pSEO (Low) — добавить в sidebar
   8. Компоненты (CitySelector, MediaEditor, RelatedEditor) (Medium) — reusable components

**Что НЕ делать:**
- ❌ НЕ начинай Session-8
- ❌ НЕ работай с несколькими сессиями одновременно
- ❌ НЕ переписывай уже готовый код из Sessions 1-6

---

## Шаг 3: Workflow

**Следуй CLAUDE.web.md:**

1. **Research** → изучи существующий код (AdminSidebar, существующие CRUD, database.ts prepared statements для pSEO)
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

# 2. Получи последние изменения (Session-6 уже в main!)
git pull origin main

# 3. Проверь что ты на актуальном коммите
git log --oneline -1
# Должен быть коммит 17e6397 или новее
# Если старше — повтори git pull!
```

**Только после этого создай ветку:**

```bash
git checkout -b claude/session-7-pseo-admin
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
   git commit -m "feat: session-7 pseo admin ui complete

   - /admin/pseo Dashboard (city selector + articles list)
   - Article form (all fields + media + related + tags)
   - Categories CRUD
   - Tags CRUD
   - SEO настройки города
   - Import/Export (Markdown + CSV)
   - AdminSidebar pSEO section
   - Components (CitySelector, MediaEditor, RelatedEditor)

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

   git push origin claude/session-7-pseo-admin
   ```

3. **Уведоми CLI:**
   - Напиши: "Session-7 завершена, ветка `claude/session-7-pseo-admin` запушена"

---

## Проверки из roadmap.md

**Перед push проверь:**

- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] Все CRUD операции сохраняют данные в БД
- [ ] /admin/pseo — выбор города работает (102 города)
- [ ] Форма статьи: все поля сохраняются (включая media, tags, related)
- [ ] Categories CRUD работает
- [ ] Tags CRUD работает
- [ ] SEO настройки города сохраняются
- [ ] Импорт markdown → статья создаётся
- [ ] Sidebar показывает секцию pSEO
- [ ] Консоль браузера чистая

---

## Файлы для чтения (контекст)

**Существующий код (НЕ переписывай!):**
- `src/lib/server/db/database.ts` — pSEO prepared statements (Session-6, используй их!)
- `schema.sql` — таблицы pSEO уже созданы (Session-6)
- `src/routes/(admin)/admin/city-articles/` — существующая админка (использовать как пример)
- `src/lib/components/admin/AdminSidebar.svelte` — расширить секцией pSEO

**Файлы для создания:**
- `src/routes/(admin)/admin/pseo/` — новая админка для pSEO
- `src/lib/components/admin/CitySelector.svelte` — компонент выбора города
- `src/lib/components/admin/ArticleMediaEditor.svelte` — редактор медиа
- `src/lib/components/admin/ArticleRelatedEditor.svelte` — редактор перелинковки

---

## Напоминание

**Session-7 — это про pSEO Admin UI:**
- Админка для управления статьями городов (/admin/pseo)
- Форма статьи (все поля + медиа + теги + перелинковка)
- CRUD для категорий и тегов
- SEO настройки города
- Импорт/Экспорт (Markdown + CSV)
- Компоненты: CitySelector, MediaEditor, RelatedEditor

**НЕ про Frontend страницы городов!** (это Session-8, делать позже)
**НЕ про sitemap/JSON-LD!** (это Session-8, делать позже)

---

**Версия:** 3.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-02
**Для:** Session-7 start
**Предыдущая сессия:** Session-6 (уже в main, commit 17e6397)
**Следующая сессия:** Session-8 (после завершения Session-7)
