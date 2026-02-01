# Промпт для Developer (Session-7)

> **Скопируй этот промпт в Claude Code Web**

---

## Промпт

```
Привет! Я Developer для проекта Moditime Watch (e-commerce для премиальных часов).

КРИТИЧЕСКИ ВАЖНО:
1. СНАЧАЛА обновляюсь до актуальной версии main (Session-6 уже в main!)
2. Работаю ТОЛЬКО с Session-7 (pSEO Admin UI)
3. НЕ трогаю Session-8 (она для следующего запуска)
4. После завершения ОБЯЗАТЕЛЬНО делаю commit + push

ИНСТРУКЦИЯ:

Шаг 0: Обновляюсь до актуальной версии main
git checkout main
git pull origin main
git log --oneline -1
# Проверяю: должен быть коммит 17e6397 или новее
# Если старее — повторяю git pull!

Шаг 1: Прочитай контекст проекта
- project-doc/DEVELOPER_START.md        ← ПЕРВЫЙ ФАЙЛ!
- project-doc/SESSIONS_ROADMAP.md       ← roadmap всех сессий
- project-doc/COMPLETED.md              ← Sessions 1-6 = DONE
- project-doc/session-7-pseo-admin/roadmap.md  ← моя сессия
- CLAUDE.md                             ← контекст проекта
- CLAUDE.web.md                         ← мой workflow

Шаг 2: Моя задача — Session-7 (8 задач)
1. /admin/pseo Dashboard (Medium) — выбор города + список статей
2. Форма создания/редактирования статьи (High) — all fields + media + related + tags
3. Категории CRUD (Low) — /admin/pseo/categories
4. Теги CRUD (Low) — /admin/pseo/tags
5. SEO настройки города (Low) — hero_title, meta_description
6. Импорт/Экспорт (Medium) — Markdown import, CSV export
7. AdminSidebar — секция pSEO (Low) — добавить в sidebar
8. Компоненты (Medium) — CitySelector, MediaEditor, RelatedEditor

Шаг 3: Workflow (CLAUDE.web.md)
1. Research → изучить AdminSidebar, существующие CRUD, database.ts pSEO statements
2. Tech-spec → создать tech-spec.md
3. Plan → создать plan.md
4. Roadmap-final → roadmap-final.md
5. Implementation → реализация 8 задач
6. Commit + Push → git commit + git push ← ОБЯЗАТЕЛЬНО!

Шаг 4: Ветка
git checkout -b claude/session-7-pseo-admin

Шаг 5: После завершения
1. npm run build (проверка)
2. git add .
3. git commit -m "feat: session-7 pseo admin ui complete..."
4. git push origin claude/session-7-pseo-admin
5. Уведомить CLI: "Session-7 завершена, ветка запушена"

ВАЖНО:
- НЕ делать Session-8 сейчас!
- НЕ переписывать код Sessions 1-6
- Обязательно push после завершения
- Следовать roadmap.md проверкам
- ОБЯЗАТЕЛЬНО git pull origin main ПЕРЕД началом!
- Session-6 уже создала все БД таблицы и prepared statements — используй их!

Начинаю с git checkout main && git pull origin main!
```

---

## Как использовать

1. **Открой Claude Code Web** (claude.ai/code или app)
2. **Открой проект** `moditime-watch`
3. **Скопируй промпт выше** и отправь
4. **Developer начнёт работу** — первым обновит main, потом прочитает DEVELOPER_START.md

---

**Версия:** 3.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-02
**Для:** Session-7 start
**Важно:** Developer ОБЯЗАТЕЛЬНО обновится до актуальной версии main (Session-6 уже в main!)
