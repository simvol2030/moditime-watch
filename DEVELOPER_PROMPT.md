# Промпт для Developer (Session-8 — ФИНАЛ!)

> **Скопируй этот промпт в Claude Code Web**

---

## Промпт

```
Привет! Я Developer для проекта Moditime Watch (e-commerce для премиальных часов).

КРИТИЧЕСКИ ВАЖНО:
1. СНАЧАЛА обновляюсь до актуальной версии main (Session-7 уже в main!)
2. Работаю ТОЛЬКО с Session-8 (pSEO Frontend & SEO)
3. ЭТО ПОСЛЕДНЯЯ СЕССИЯ — после неё проект готов на 100%!
4. После завершения ОБЯЗАТЕЛЬНО делаю commit + push

ИНСТРУКЦИЯ:

Шаг 0: Обновляюсь до актуальной версии main
git checkout main
git pull origin main
git log --oneline -1
# Проверяю: должен быть коммит 666f4f8 или новее
# Если старее — повторяю git pull!

Шаг 1: Прочитай контекст проекта
- project-doc/DEVELOPER_START.md        ← ПЕРВЫЙ ФАЙЛ!
- project-doc/SESSIONS_ROADMAP.md       ← roadmap всех сессий
- project-doc/COMPLETED.md              ← Sessions 1-7 = DONE
- project-doc/session-8-pseo-frontend/roadmap.md  ← моя сессия
- CLAUDE.md                             ← контекст проекта
- CLAUDE.web.md                         ← мой workflow

Шаг 2: Моя задача — Session-8 (9 задач) — ФИНАЛ!
1. City Layout Group (Medium) — (city)/+layout с CityHeader/Footer
2. CityHeader + CityFooter (Medium) — отдельные header/footer для городов
3. Главная города (High) — категории + пагинация + hero
4. Страница статьи (High) — медиа + видео + виджет + перелинковка
5. Reroute article paths на поддоменах (Low) — hooks.ts расширение
6. Sitemap Index (Medium) — sitemap index + sub-sitemaps
7. robots.txt (Low) — добавить Sitemap:
8. JSON-LD schemas (Medium) — LocalBusiness, BreadcrumbList, WebSite
9. Cache-Control headers (Low) — setHeaders для city pages

Шаг 3: Workflow (CLAUDE.web.md)
1. Research → изучить city layouts, CityHeader/Footer, schema-helpers, sitemap
2. Tech-spec → создать tech-spec.md
3. Plan → создать plan.md
4. Roadmap-final → roadmap-final.md
5. Implementation → реализация 9 задач
6. Commit + Push → git commit + git push ← ОБЯЗАТЕЛЬНО!
7. ФИНИШ → проект готов на 100%!

Шаг 4: Ветка
git checkout -b claude/session-8-pseo-frontend

Шаг 5: После завершения
1. npm run build (проверка)
2. git add .
3. git commit -m "feat: session-8 pseo frontend & seo complete

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
4. git push origin claude/session-8-pseo-frontend
5. Уведомить CLI: "Session-8 завершена, ветка запушена. 🎉 ПРОЕКТ ГОТОВ НА 100%!"

ВАЖНО:
- Это ПОСЛЕДНЯЯ сессия!
- НЕ переписывать код Sessions 1-7
- Обязательно push после завершения
- Следовать roadmap.md проверкам
- ОБЯЗАТЕЛЬНО git pull origin main ПЕРЕД началом!
- Session-6 создала БД, Session-7 создала Admin — используй их!

ПРОВЕРКИ ПЕРЕД PUSH:
Desktop:
- /city/moscow — отдельный CityHeader, CityFooter
- /city/moscow — статьи по категориям + hero
- /city/moscow/article — rich content (изображения + видео)
- /city/moscow/article — перелинковка работает
- /city/moscow/article — breadcrumbs корректны
- moscow.moditime-watch.ru/article — reroute работает
- /catalog — стандартный layout не затронут

Mobile:
- /city/moscow — mobile responsive
- /city/moscow/article — mobile responsive
- Консоль браузера чистая

SEO:
- /sitemap.xml — sitemap index
- /sitemap-cities.xml — 102 города
- /sitemap-city-articles-1.xml — статьи городов
- robots.txt содержит Sitemap:
- /city/moscow — LocalBusiness JSON-LD
- /city/moscow/article — BreadcrumbList JSON-LD
- / — WebSite JSON-LD с SearchAction
- Cache-Control headers на city pages

Начинаю с git checkout main && git pull origin main!

🎉 ЭТО ФИНАЛ — ПОСЛЕ ЭТОЙ СЕССИИ ПРОЕКТ ГОТОВ НА 100%!
```

---

## Как использовать

1. **Открой Claude Code Web** (claude.ai/code или app)
2. **Открой проект** `moditime-watch`
3. **Скопируй промпт выше** и отправь
4. **Developer начнёт работу** — первым обновит main, потом прочитает DEVELOPER_START.md
5. **ЭТО ПОСЛЕДНЯЯ СЕССИЯ!** — после неё проект готов на 100%

---

## Session-8 задачи (9 tasks — ФИНАЛ!):

1. **City Layout Group** — новый layout для городов с CityHeader/Footer
2. **CityHeader + CityFooter** — отдельные header/footer компоненты
3. **Главная города** — листинги по категориям + hero + пагинация
4. **Страница статьи** — rich content + медиа + видео + перелинковка
5. **Reroute** — поддержка поддоменов (moscow.moditime-watch.ru/article)
6. **Sitemap Index** — масштабируемый sitemap (index + sub-sitemaps)
7. **robots.txt** — добавить Sitemap directive
8. **JSON-LD** — LocalBusiness, BreadcrumbList, WebSite schemas
9. **Cache-Control** — headers для city pages

---

**Прогресс проекта:**
- Выполнено: 50/58 задач (86%)
- Сессий завершено: 7/8 (87%)
- Осталось: 1 СЕССИЯ — ФИНАЛ!

**После Session-8:**
- 58/58 задач (100%) ✅
- 8/8 сессий (100%) ✅
- **ПРОЕКТ ПОЛНОСТЬЮ ГОТОВ!** 🎉

---

**Версия:** 4.0
**Создано:** 2025-02-01
**Обновлено:** 2025-02-02
**Для:** Session-8 start (ФИНАЛ!)
**Важно:** Developer ОБЯЗАТЕЛЬНО обновится до актуальной версии main (Session-7 уже в main!)
**Это последняя сессия — после неё проект готов на 100%!**
