# Developer Start Instructions

> **ПРОЧИТАЙ ПЕРВЫМ!** Инструкция для запуска Session-8 (ФИНАЛ!)

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО

1. **Работай ТОЛЬКО с Session-8** — ЭТО ФИНАЛЬНАЯ СЕССИЯ!
2. **После завершения Session-8 — ОБЯЗАТЕЛЬНО:**
   - `git add .`
   - `git commit -m "..."`
   - `git push origin claude/session-8-pseo-frontend`
3. **Уведоми CLI о завершении**
4. **ПРОЕКТ БУДЕТ ЗАВЕРШЁН НА 100%!**

---

## Шаг 1: Прочитай актуальное состояние проекта

**ОБЯЗАТЕЛЬНО прочитай эти файлы ПЕРВЫМИ:**

```
project-doc/SESSIONS_ROADMAP.md        — общий roadmap всех сессий
project-doc/COMPLETED.md               — что уже сделано (Sessions 1-7 = DONE)
project-doc/session-8-pseo-frontend/roadmap.md  — твоя сессия
CLAUDE.md                              — контекст проекта
CLAUDE.web.md                          — workflow Developer
```

**Ключевые факты:**
- Sessions 1-7 = ✅ DONE (50 задач выполнено)
- Session-8 = ⏳ PENDING (9 задач) ← **ТВОЯ СЕССИЯ — ФИНАЛ!**
- **Ветка main:** актуальная с Session-7 (commit 666f4f8)
- **ВАЖНО:** Сделай `git pull origin main` ПЕРЕД началом!
- **После Session-8 → проект готов на 100%!**

---

## Шаг 2: Твоя задача — Session-8 (ФИНАЛ!)

**Что делать:**

1. Прочитай `project-doc/session-8-pseo-frontend/roadmap.md`
2. Выполни **ТОЛЬКО 9 задач Session-8:**
   1. City Layout Group (Medium) — (city)/+layout с CityHeader/Footer
   2. CityHeader + CityFooter (Medium) — отдельные header/footer для городов
   3. Главная города (High) — категории + пагинация + hero
   4. Страница статьи (High) — медиа + видео + виджет + перелинковка
   5. Reroute article paths на поддоменах (Low) — hooks.ts расширение
   6. Sitemap Index (Medium) — sitemap index + sub-sitemaps
   7. robots.txt (Low) — добавить Sitemap:
   8. JSON-LD schemas (Medium) — LocalBusiness, BreadcrumbList, WebSite
   9. Cache-Control headers (Low) — setHeaders для city pages

**Что НЕ делать:**
- ❌ НЕ работай с несколькими сессиями одновременно
- ❌ НЕ переписывай уже готовый код из Sessions 1-7
- ✅ Это ПОСЛЕДНЯЯ сессия — после неё проект готов!

---

## Шаг 3: Workflow

**Следуй CLAUDE.web.md:**

1. **Research** → изучи существующий код (city layouts, CityHeader/Footer, schema-helpers, sitemap)
2. **Tech-spec** → создай tech-spec.md
3. **Plan** → создай plan.md
4. **Roadmap-final** → roadmap-final.md
5. **Implementation** → реализация 9 задач
6. **Commit + Push** → git commit + git push ← **ОБЯЗАТЕЛЬНО!**
7. **ФИНИШ** → проект готов на 100%!

---

## Шаг 4: Обновись до актуальной версии main

**КРИТИЧЕСКИ ВАЖНО — сделай это ПЕРВЫМ:**

```bash
# 1. Перейди на main
git checkout main

# 2. Получи последние изменения (Session-7 уже в main!)
git pull origin main

# 3. Проверь что ты на актуальном коммите
git log --oneline -1
# Должен быть коммит 666f4f8 или новее
# Если старее — повтори git pull!
```

**Только после этого создай ветку:**

```bash
git checkout -b claude/session-8-pseo-frontend
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
   git commit -m "feat: session-8 pseo frontend & seo complete

   - City Layout Group ((city)/+layout)
   - CityHeader + CityFooter (отдельные header/footer)
   - Главная города (категории + пагинация + hero)
   - Страница статьи (rich content + медиа + видео + перелинковка)
   - Reroute на поддоменах (hooks.ts)
   - Sitemap Index (масштабируемый sitemap)
   - robots.txt (Sitemap directive)
   - JSON-LD schemas (LocalBusiness, BreadcrumbList, WebSite)
   - Cache-Control headers

   🎉 PROJECT COMPLETE 100%

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

   git push origin claude/session-8-pseo-frontend
   ```

3. **Уведоми CLI:**
   - Напиши: "Session-8 завершена, ветка `claude/session-8-pseo-frontend` запушена. 🎉 ПРОЕКТ ГОТОВ НА 100%!"

---

## Проверки из roadmap.md

**Перед push проверь:**

**Desktop:**
- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] /city/moscow — отдельный CityHeader, CityFooter
- [ ] /city/moscow — статьи по категориям + hero
- [ ] /city/moscow/article — rich content (изображения + видео)
- [ ] /city/moscow/article — перелинковка работает
- [ ] /city/moscow/article — breadcrumbs корректны
- [ ] moscow.moditime-watch.ru/article — reroute работает
- [ ] /catalog — стандартный layout не затронут

**Mobile:**
- [ ] /city/moscow — mobile responsive
- [ ] /city/moscow/article — mobile responsive
- [ ] Консоль браузера чистая

**SEO:**
- [ ] /sitemap.xml — sitemap index
- [ ] /sitemap-cities.xml — 102 города
- [ ] /sitemap-city-articles-1.xml — статьи городов
- [ ] robots.txt содержит `Sitemap:`
- [ ] /city/moscow — LocalBusiness JSON-LD
- [ ] /city/moscow/article — BreadcrumbList JSON-LD
- [ ] / — WebSite JSON-LD с SearchAction
- [ ] Cache-Control headers на city pages

---

## Файлы для чтения (контекст)

**Существующий код (НЕ переписывай!):**
- `src/lib/server/db/database.ts` — pSEO prepared statements (Session-6)
- `src/routes/(admin)/admin/pseo/` — admin UI (Session-7)
- `src/lib/components/layout/Header.svelte` — использовать как пример для CityHeader
- `src/lib/components/layout/Footer.svelte` — использовать как пример для CityFooter
- `src/lib/utils/schema-helpers.ts` — JSON-LD хелперы
- `src/routes/sitemap.xml/+server.ts` — существующий sitemap (переработать)

**Файлы для создания/модификации:**
- `src/routes/(city)/+layout.server.ts` — новый layout для городов
- `src/routes/(city)/+layout.svelte` — новый layout с CityHeader/Footer
- `src/lib/components/layout/CityHeader.svelte` — новый компонент
- `src/lib/components/layout/CityFooter.svelte` — новый компонент
- `src/routes/sitemap-*.xml/+server.ts` — новые sitemap endpoints
- `static/robots.txt` — добавить Sitemap directive
- `src/hooks.ts` — расширить reroute для поддоменов

---

## Напоминание

**Session-8 — это про pSEO Frontend & SEO:**
- Отдельные layouts для городов (CityHeader + CityFooter)
- Главная города с листингами по категориям
- Страницы статей с rich content, медиа, перелинковкой
- Reroute для поддоменов
- Масштабируемый sitemap (index + sub-sitemaps)
- JSON-LD structured data
- Cache-Control headers

**НЕ про Admin!** (это Session-7, уже сделано)
**НЕ про Backend!** (это Session-6, уже сделано)

**ЭТО ФИНАЛ — после этой сессии проект готов на 100%!**

---

**Версия:** 4.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-02
**Для:** Session-8 start (ФИНАЛ!)
**Предыдущая сессия:** Session-7 (уже в main, commit 666f4f8)
**Следующая сессия:** НЕТ — это последняя сессия!
