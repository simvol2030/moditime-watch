# QA Checklist для проверки Sessions 9-12 (Bugfixes после Session-8)

> **Назначение:** Этот чеклист используется субагентами (qa-technical-validation + qa-ux-verification) для проверки исправлений после завершения Sessions 9-12.
>
> **Когда использовать:** После деплоя каждой сессии (Session-9 → проверка → Session-10 → проверка → и т.д.)
>
> **Формат проверки:** Субагенты должны проверить ТОЛЬКО исправленные баги из соответствующей сессии, НЕ искать новые баги (это отдельная проверка).

---

## Как использовать этот чеклист

**Для CLI (Integrator):**

После деплоя Session-N запустить двух субагентов с чеклистом:

```bash
# Пример команды для запуска субагентов
Task tool:
  subagent_type: qa-technical-validation
  prompt: |
    Проверь исправления Session-9 на production URL: https://moditime-watch.ru/
    Используй чеклист из feedbacks/qa-checklist-sessions-9-12.md (секция Session-9 Technical QA).
    Проверяй ТОЛЬКО исправленные баги, НЕ ищи новые.
    Сохрани отчёт в feedbacks/qa-reports/session-9-v2/tech-report.md
```

**Формат отчёта субагентов:**

```markdown
# QA Report: Session-9 Bugfixes Verification

## Summary

| Bug | Status | Notes |
|-----|--------|-------|
| CRIT-1: LocalBusiness JSON-LD | ✅ FIXED | Schema present on /city/moscow |
| CRIT-2: Article JSON-LD | ✅ FIXED | Schema present on article pages |
| ... | ... | ... |

## Detailed Findings

### ✅ FIXED: CRIT-1 LocalBusiness JSON-LD
- Verified: /city/moscow contains LocalBusiness schema
- Fields: name, address, geo, telephone, openingHours ✓
- Google Structured Data Tool: 0 errors ✓

### ❌ NOT FIXED: CRIT-4 Grammar error
- Issue: Badge still shows "Часы в Москва"
- Expected: "Часы в Москве"
- Reason: ...
```

---

## Session-9: Critical SEO & Content Fixes

### Technical QA Checklist

**JSON-LD Schemas:**

- [ ] **CRIT-1: LocalBusiness JSON-LD на city landing pages**
  - URL: `https://moditime-watch.ru/city/moscow`
  - Действие: Открыть страницу → View Source → найти `<script type="application/ld+json">` с `"@type": "LocalBusiness"`
  - Проверить поля: `name`, `address`, `geo`, `telephone`, `openingHours`, `priceRange`, `url`
  - Google Structured Data Testing Tool: 0 errors
  - Проверить на 3 городах: Москва, Санкт-Петербург, Казань

- [ ] **CRIT-2: Article JSON-LD на city article pages**
  - URL: `https://moditime-watch.ru/city/moscow/trade-in-chasov-v-moskve`
  - Действие: Открыть страницу → View Source → найти `"@type": "Article"`
  - Проверить поля: `headline`, `description`, `image`, `datePublished`, `dateModified`, `author`, `publisher`, `mainEntityOfPage`
  - Google Structured Data Testing Tool: 0 errors
  - Проверить на 3 статьях: по 1 статье из Москвы, СПб, Казани

- [ ] **CRIT-3: BreadcrumbList JSON-LD на city article pages**
  - URL: `https://moditime-watch.ru/city/moscow/trade-in-chasov-v-moskve`
  - Действие: Открыть страницу → View Source → найти `"@type": "BreadcrumbList"`
  - Проверить структуру: 3 уровня (Главная → Город → Статья)
  - Каждый ListItem имеет: `position`, `name`, `item`
  - Google Structured Data Testing Tool: 0 errors

- [ ] **MEDIUM-4: Убрать дублирование WebSite JSON-LD на homepage**
  - URL: `https://moditime-watch.ru/`
  - Действие: Открыть страницу → View Source → посчитать количество `"@type": "WebSite"`
  - Ожидаемый результат: ТОЛЬКО ОДИН WebSite schema (не два)
  - WebSite schema содержит SearchAction ✓

**Console:**

- [ ] No errors related to JSON-LD parsing
- [ ] No "Invalid structured data" warnings

---

### UX QA Checklist

**Грамматика:**

- [ ] **CRIT-4: Исправлена грамматика в CityHeader badge**
  - URL: `https://moditime-watch.ru/city/moscow`
  - Viewport: Desktop 1920×1080
  - Действие: Проверить badge в header
  - Ожидаемый текст: "Часы в Москве" (НЕ "Часы в Москва")
  - Проверить на 5 городах:
    - Москва → "Часы в Москве"
    - Санкт-Петербург → "Часы в Санкт-Петербурге"
    - Казань → "Часы в Казани"
    - Ростов-на-Дону → "Часы в Ростове-на-Дону"
    - Екатеринбург → "Часы в Екатеринбурге"

**Rich Media:**

- [ ] **CRIT-5: Rich media в city articles**
  - URL: `https://moditime-watch.ru/city/moscow/trade-in-chasov-v-moskve`
  - Viewport: Desktop 1920×1080
  - Действие: Scroll через статью, проверить наличие:
    - Inline изображения (если есть в БД `city_article_media` с `media_type='image'`)
    - Video embeds (если есть в БД `city_article_media` с `media_type='video'`)
    - Captions под изображениями
  - Проверить на 3 статьях
  - Если медиа нет в БД → проверить что Developer добавил seed/тестовые данные

---

## Session-10: Critical Admin pSEO Fixes

### Technical QA Checklist

**Admin Dashboard:**

- [ ] **CRIT-6: Admin pSEO dashboard НЕ пустой после выбора города**
  - URL: `https://moditime-watch.ru/admin/pseo`
  - Действие:
    1. Login в админку
    2. Перейти на /admin/pseo
    3. Кликнуть на город (например, "Москва")
    4. Проверить Network tab: `__data.json?city_id=1` → 200 OK
    5. Проверить UI: должны отобразиться статьи для выбранного города
  - Ожидаемый результат:
    - Заголовок: "pSEO: Москва" или аналогичный
    - Список статей для выбранного города (не пустой)
    - Фильтры по категориям работают
    - Статистика обновляется
  - No console errors

- [ ] **MEDIUM-9: Селектор городов присутствует в admin pSEO**
  - URL: `https://moditime-watch.ru/admin/pseo?city_id=1`
  - Действие: Проверить наличие dropdown/selector для переключения между городами
  - Ожидаемый результат:
    - Dropdown показывает текущий город ("Москва")
    - Dropdown содержит ВСЕ города (не только 3)
    - Переключение между городами работает (UI обновляется, URL меняется)

- [ ] **MINOR-1: В админке 102 города (не 3)**
  - URL: `https://moditime-watch.ru/admin/pseo` (city selector)
  - Действие: Открыть dropdown городов, посчитать количество
  - Ожидаемый результат: ~102 города (не только Москва, СПб, Казань)
  - Дополнительно: Проверить `/admin/content/cities` — тоже должны быть все города

- [ ] **MEDIUM-7: Sitemap-cities.xml содержит 102 города**
  - URL: `https://moditime-watch.ru/sitemap-cities.xml`
  - Действие: Открыть sitemap, посчитать количество `<url>` элементов
  - Ожидаемый результат: ~102 города (не 3)
  - Каждый город имеет: `<loc>`, `<lastmod>`, `<changefreq>`, `<priority>`

---

### UX QA Checklist

**Admin pSEO UI:**

- [ ] **CRIT-8: Поле "Категория" НЕ пустое в article cards**
  - URL: `https://moditime-watch.ru/admin/pseo?city_id=1`
  - Viewport: Desktop 1920×1080
  - Действие: Проверить карточки статей
  - Ожидаемый результат:
    - Поле "Категория" заполнено (например, "Общее", "Trade-in", etc.)
    - Если категории нет → показывается "Без категории" (но не пусто)
  - Проверить на 5 статьях из разных категорий

- [ ] **City selector функционален**
  - Действие: Переключиться между городами через dropdown
  - Проверить:
    - UI обновляется (список статей меняется)
    - URL обновляется (`?city_id=X`)
    - No visual glitches
    - No console errors

---

## Session-11: Media & Layout Fixes

### Technical QA Checklist

**Media:**

- [ ] **MEDIUM-1: No 404 для product images**
  - URL: `https://moditime-watch.ru/catalog`
  - Действие: Открыть Console → Network tab → Filter: Images
  - Ожидаемый результат: No 404 errors для product-1-1.jpg, product-2-1.jpg, etc.
  - Если изображение отсутствует → должна показываться fallback image (не broken image icon)

- [ ] **MEDIUM-5: No 404 для favicon**
  - URL: `https://moditime-watch.ru/` (любая страница)
  - Действие: Проверить Network tab → Filter: favicon
  - Ожидаемый результат: favicon.ico → 200 OK (не 404)
  - Favicon отображается в browser tab

- [ ] **MEDIUM-3: No hydration mismatch warning на homepage**
  - URL: `https://moditime-watch.ru/`
  - Действие: Открыть Console
  - Ожидаемый результат: No warning `https://svelte.dev/e/hydration_mismatch`
  - Интерактивность работает корректно

**Layout:**

- [ ] **CRIT-7: No duplicate footer на city pages**
  - URL: `https://moditime-watch.ru/city/moscow`
  - Действие: Scroll вниз до footer
  - Ожидаемый результат: ТОЛЬКО ОДИН footer (CityFooter, не два)
  - Проверить на 3 городах

- [ ] **Main site pages имеют MainFooter**
  - URL: `https://moditime-watch.ru/catalog`
  - Действие: Scroll вниз до footer
  - Ожидаемый результат: MainFooter присутствует (standard site footer)

**Products:**

- [ ] **MEDIUM-6: Product pages доступны (no 404)**
  - URL: `https://moditime-watch.ru/product/rolex-submariner-date-126610ln`
  - Действие: Открыть product page
  - Ожидаемый результат: Страница открывается (200 OK, не 404)
  - Если 404 → проверить, что продукты published в БД
  - Проверить на 3 продуктах

---

### UX QA Checklist

**Media:**

- [ ] **Fallback image отображается корректно**
  - URL: `https://moditime-watch.ru/catalog`
  - Viewport: Desktop 1920×1080
  - Действие: Найти продукт без изображения
  - Ожидаемый результат: Красивая placeholder image (не broken image icon)
  - Placeholder соответствует дизайну сайта

- [ ] **Favicon visible в browser tab**
  - URL: `https://moditime-watch.ru/` (любая страница)
  - Действие: Проверить browser tab
  - Ожидаемый результат: Favicon отображается

- [ ] **Админка favicon management работает**
  - URL: `https://moditime-watch.ru/admin/system/settings`
  - Действие: Найти раздел "Favicon сайта"
  - Проверить:
    - Preview показывает текущий favicon
    - Можно загрузить новый favicon (upload file)
    - После загрузки favicon обновляется на сайте

**Layout:**

- [ ] **City pages: single footer (no duplicate)**
  - Viewport: Desktop 1920×1080 + Mobile 375×812
  - URL: `https://moditime-watch.ru/city/moscow`
  - Действие: Scroll вниз
  - Ожидаемый результат: Только CityFooter (не два footer)

---

## Session-12: Communication & Admin UX

### Technical QA Checklist

**Telegram:**

- [ ] **MEDIUM-2: No CSP violation для Telegram**
  - URL: `https://moditime-watch.ru/catalog` (или другая страница с Telegram link)
  - Действие: Открыть Console
  - Ожидаемый результат: No error "Framing 'https://t.me/' violates CSP"
  - Telegram iframe должен быть заменён на ссылку

- [ ] **Telegram link работает**
  - URL: `https://moditime-watch.ru/` (Footer)
  - Действие: Найти Telegram link → Click
  - Ожидаемый результат: Открывается `https://t.me/moditime_watch` в новой вкладке

**Phone Callback:**

- [ ] **MEDIUM-8: Callback form отправляет данные**
  - URL: `https://moditime-watch.ru/city/moscow` (Mobile viewport)
  - Действие:
    1. Кликнуть phone icon (если режим = callback)
    2. Заполнить форму (имя, телефон)
    3. Нажать "Заказать звонок"
    4. Проверить Network tab: POST /api/callback → 200 OK
  - Ожидаемый результат:
    - Форма отправляется успешно
    - Показывается сообщение "Спасибо! Мы перезвоним"
    - Email notification отправлен (проверить через admin email)
    - Telegram notification отправлен (проверить Telegram группу)

---

### UX QA Checklist

**Telegram:**

- [ ] **Telegram link visible и functional**
  - Viewport: Desktop 1920×1080 + Mobile 375×812
  - URL: `https://moditime-watch.ru/` (Footer)
  - Действие: Найти Telegram link
  - Ожидаемый результат:
    - Link присутствует в Footer
    - Иконка Telegram отображается
    - Клик открывает t.me группу
  - Проверить на 3 страницах: homepage, catalog, city page

- [ ] **Админка Telegram settings работает**
  - URL: `https://moditime-watch.ru/admin/system/settings`
  - Действие: Найти раздел "Telegram интеграция"
  - Проверить:
    - Checkbox "Показывать ссылку на Telegram группу"
    - Поле "URL группы" (можно изменить)
    - Поле "Текст ссылки" (можно изменить)
    - После сохранения изменения применяются на frontend

**Phone:**

- [ ] **Phone icon visible на mobile**
  - Viewport: Mobile 375×812
  - URL: `https://moditime-watch.ru/city/moscow`
  - Действие: Проверить CityHeader
  - Ожидаемый результат: Phone icon отображается (рядом с theme toggle)
  - Также проверить Footer: phone icon присутствует

- [ ] **Phone режим "direct" работает**
  - URL: `https://moditime-watch.ru/city/moscow` (если режим = direct)
  - Viewport: Mobile 375×812
  - Действие: Кликнуть phone icon
  - Ожидаемый результат: Открывается tel: link (приложение для звонка)

- [ ] **Phone режим "callback" работает**
  - URL: `https://moditime-watch.ru/city/moscow` (если режим = callback)
  - Viewport: Mobile 375×812
  - Действие: Кликнуть phone icon
  - Ожидаемый результат:
    - Открывается modal "Заказать обратный звонок"
    - Форма содержит поля: Имя, Телефон
    - Кнопка "Заказать звонок" работает
    - После отправки modal закрывается, показывается success message

- [ ] **Админка Phone settings работает**
  - URL: `https://moditime-watch.ru/admin/system/settings`
  - Действие: Найти раздел "Настройки телефона"
  - Проверить:
    - Поле "Телефон" (можно изменить номер)
    - Dropdown "Режим работы": Прямой звонок / Форма обратного звонка
    - После изменения режима — frontend обновляется (phone icon ведёт себя по-другому)

**Admin Drag-and-Drop:**

- [ ] **FUNC-1: Drag-and-drop работает в Navigation**
  - URL: `https://moditime-watch.ru/admin/system/navigation`
  - Viewport: Desktop 1920×1080
  - Действие:
    1. Найти список navigation items
    2. Перетащить элемент вверх/вниз (drag handle)
    3. Проверить, что порядок сохраняется (page refresh → порядок остался)
  - Ожидаемый результат:
    - Drag-and-drop работает плавно
    - Порядок сохраняется в БД
    - Frontend отображает новый порядок
    - No console errors

- [ ] **Drag-and-drop работает во всех разделах с order**
  - Проверить аналогично Navigation в:
    - [ ] Collections (`/admin/content/collections` если применимо)
    - [ ] Categories (`/admin/content/categories` если применимо)
    - [ ] Footer links (`/admin/system/footer` если применимо)
    - [ ] City Article Categories (`/admin/pseo/categories` если применимо)

- [ ] **Ручной ввод order убран из форм**
  - URL: Любая форма создания/редактирования (navigation, categories, etc.)
  - Действие: Открыть форму "Create new item"
  - Ожидаемый результат: Поле "Order" / "Priority" ОТСУТСТВУЕТ (порядок определяется через drag-and-drop)

---

## Формат финального отчёта

После проверки всех 4 сессий субагенты должны создать **итоговый отчёт**:

```markdown
# QA Final Report: Sessions 9-12 Bugfixes

## Summary

| Session | Bugs Verified | Fixed | Not Fixed | Pass Rate |
|---------|---------------|-------|-----------|-----------|
| Session-9 | 6 | 6 | 0 | 100% |
| Session-10 | 5 | 4 | 1 | 80% |
| Session-11 | 5 | 5 | 0 | 100% |
| Session-12 | 3 | 2 | 1 | 67% |
| **TOTAL** | **19** | **17** | **2** | **89%** |

## Not Fixed Issues

### Session-10: CRIT-6 (Admin pSEO dashboard пустой)
- Status: Partially fixed
- Issue: Dashboard loads but shows only 5 articles (should show all)
- Recommendation: Investigate pagination/limit

### Session-12: FUNC-1 (Drag-and-drop в Collections)
- Status: Not implemented
- Issue: Drag-and-drop works in Navigation but not in Collections
- Recommendation: Add drag-and-drop to Collections CRUD

## Recommendation

- [ ] Create Session-13 для исправления 2 оставшихся багов
- [ ] ИЛИ: создать feedback file для быстрого fix
```

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** QA Subagents (qa-technical-validation + qa-ux-verification)
**Использование:** После деплоя Sessions 9-12, проверить ТОЛЬКО исправленные баги (не искать новые)
