# QA Technical Validation Report: Session-12 (Communication & Admin UX)

**Page:** https://moditime-watch.ru/
**Admin:** https://moditime-watch.ru/admin
**Date:** 2026-02-02 15:30
**Checklist:** `/home/solo18/dev/watch/project/project-box-v2/feedbacks/qa-checklist-session-12.md`

---

## Summary

| Category | Status | Critical | Warnings |
|----------|--------|----------|----------|
| Console Errors (Telegram CSP) | **PASS** | 0 | 0 |
| Network Requests | **PASS** | 0 | 0 |
| Telegram Link Functionality | **PASS** | 0 | 0 |
| Phone Icon Mobile (MEDIUM-8) | **FAIL** | 2 | 0 |
| Drag-and-Drop Admin (FUNC-1) | **FAIL** | 1 | 0 |
| Admin Settings | **PASS** | 0 | 0 |

**Overall: FAIL**
**Total Critical: 3 | Total Warnings: 0**

---

## Critical Issues

### CRIT-1: Phone icon отсутствует в CityHeader на mobile

- **Category:** JS Functionality / MEDIUM-8
- **Step found:** Step 4 (JavaScript Functionality Check)
- **URL:** https://moditime-watch.ru/city/moscow
- **Viewport:** 375×812 (mobile)
- **Description:** На странице city/moscow в мобильном viewport phone icon полностью отсутствует в CityHeader. В snapshot нет button "Позвонить" или tel: link.
- **Expected:** Phone icon должен быть виден в CityHeader на mobile (как в SiteHeader)
- **Evidence:**
  - Snapshot CityHeader не содержит phone button/link
  - Screenshot показывает header без phone icon (только search + theme toggle)
- **Screenshot:** `session-12-v1-city-mobile.png`

---

### CRIT-2: Phone button открывает меню вместо callback/tel: link

- **Category:** JS Functionality / MEDIUM-8
- **Step found:** Step 4 (JavaScript Functionality Check)
- **URL:** https://moditime-watch.ru/
- **Viewport:** 375×812 (mobile)
- **Description:** При клике на phone button "Позвонить" [ref=e10] в SiteHeader на mobile открывается навигационное меню вместо callback modal или tel: link.
- **Expected:**
  - Если `phone_mode = "direct"` → должен открываться tel: link (+7 495 120-00-00)
  - Если `phone_mode = "callback"` → должна открываться callback modal с формой
- **Actual:** Открывается боковое меню с секциями "Магазин", "Сервис", "Офис"
- **Evidence:**
  - Config setting: `phone_mode = "direct"`
  - После клика: screenshot показывает меню навигации
  - Phone button работает как menu toggle вместо phone action
- **Screenshot:** `session-12-v1-phone-clicked.png`

---

### CRIT-3: Drag-and-drop не активируется в админке

- **Category:** JS Functionality / FUNC-1
- **Step found:** Step 4 (JavaScript Functionality Check)
- **URLs:**
  - https://moditime-watch.ru/admin/navigation
  - https://moditime-watch.ru/admin/collections
- **Description:** После клика на кнопку "Reorder" не появляются drag handles (≡ или ::) и визуальные индикаторы для drag-and-drop. Элементы остаются в обычном виде без возможности перетаскивания.
- **Expected:**
  - Клик "Reorder" → появляются grab handles
  - Cursor меняется на grab/grabbing при hover
  - Элементы можно перетаскивать мышью
- **Actual:**
  - Визуально ничего не изменилось после клика "Reorder"
  - Нет grab handles
  - Нет визуальных индикаторов drag mode
- **Evidence:**
  - Screenshot Navigation: плоский список без handles
  - Screenshot Collections: табличный вид без handles
  - Console: нет JS ошибок
- **Screenshots:**
  - `session-12-v1-navigation-reorder.png`
  - `session-12-v1-collections-reorder.png`
- **Impact:** Невозможно изменить порядок элементов во всех 6 разделах админки (Navigation, Footer, Collections, Brands, Categories, Testimonials)

---

## Passed Checks

### ✅ MEDIUM-2: Telegram CSP violation исправлен

- **URLs проверены:**
  - https://moditime-watch.ru/
  - https://moditime-watch.ru/catalog
- **Console:** Полностью чистая, нет CSP violation
- **Evidence:**
  - `browser_console_messages(level=info)` → пустой результат
  - Ранее было: "Framing 'https://t.me/' violates CSP"
  - Теперь: нет ошибок

---

### ✅ MEDIUM-2: Telegram ссылка работает корректно

- **URL:** https://moditime-watch.ru/
- **Action:** Клик на "Подписаться" [ref=e378]
- **Result:** Открывается новая вкладка с https://t.me/moditime_watch
- **Evidence:**
  - Tab list показывает: "Telegram: View @moditime_watch"
  - Screenshot Telegram страницы: корректный профиль канала
  - No broken iframe widget
- **Screenshot:** `session-12-v1-telegram-page.png`

---

### ✅ Phone icon присутствует в SiteHeader на mobile

- **URL:** https://moditime-watch.ru/
- **Viewport:** 375×812
- **Result:** Phone button "Позвонить" [ref=e10] виден в header
- **Evidence:** Snapshot показывает button с icon
- **Screenshot:** `session-12-v1-homepage-mobile.png`
- **Note:** Кнопка видна, но функционал НЕ работает (см. CRIT-2)

---

### ✅ Admin Settings страница работает

- **URL:** https://moditime-watch.ru/admin/system/config
- **Telegram settings найдены:**
  - `telegram_group_enabled`: True
  - `telegram_group_url`: https://t.me/moditime_watch
  - `telegram_group_label`: "Telegram группа Moditimewatch"
- **Phone settings найдены:**
  - `phone_mode`: "direct"
  - `contact_phone`: "+7 (495) 120-00-00"
- **Result:** Все настройки присутствуют в БД и доступны для редактирования
- **Note:** Settings существуют, но phone_mode не применяется корректно на фронтенде (см. CRIT-2)

---

### ✅ Network requests чистые

- **Check:** `browser_network_requests(includeStatic=false)`
- **Result:** Нет failed/slow requests при загрузке всех страниц
- **Pages checked:**
  - Homepage
  - Catalog
  - City/Moscow
  - Admin pages

---

### ✅ No JavaScript errors на всех страницах

- **Console check:** `browser_console_messages(level=error)`
- **Result:** Нет ошибок во всех проверенных сценариях
- **Pages checked:**
  - Homepage (desktop + mobile)
  - Catalog
  - City/Moscow
  - Admin Navigation
  - Admin Collections
  - Admin Config

---

## Checklist Verification

| # | Checklist Item | Status | Notes |
|---|---------------|--------|-------|
| 1 | Telegram link работает, no CSP violation | ✅ | Console чистая, ссылка открывает t.me/moditime_watch |
| 2 | Phone icon виден на mobile (CityHeader) | ❌ | **CRITICAL:** Phone icon отсутствует в CityHeader |
| 3 | Phone icon виден на mobile (SiteHeader) | ✅ | Icon присутствует, но функционал НЕ работает |
| 4 | Callback functionality работает | ❌ | **CRITICAL:** Phone button открывает меню вместо tel:/callback |
| 5 | Drag-and-drop работает в Navigation | ❌ | **CRITICAL:** Reorder не активирует drag handles |
| 6 | Drag-and-drop работает в Collections | ❌ | **CRITICAL:** Reorder не активирует drag handles |
| 7 | Админка Telegram settings работает | ✅ | Settings присутствуют и редактируемые |
| 8 | Админка Phone settings работает | ✅ | Settings присутствуют, но не применяются на фронтенде |

---

## Not Tested

### Callback Telegram notification (MEDIUM-8 п.3)

**Reason:** Невозможно протестировать, т.к. phone button не открывает callback form (CRIT-2). Сначала нужно исправить функционал phone button.

**To test after fix:**
1. Переключить `phone_mode` на "callback" в админке
2. Кликнуть phone icon на mobile
3. Заполнить форму (имя: "QA Test", телефон: "+7 (999) 123-45-67")
4. Submit
5. Проверить Telegram бота на наличие уведомления

---

### Drag-and-drop в остальных 4 разделах (FUNC-1)

**Reason:** Drag-and-drop не работает в Navigation и Collections, поэтому нет смысла проверять остальные 4 раздела (Footer, Brands, Categories, Testimonials) — проблема системная.

**Expected behavior after fix:**
- Footer (sections + links)
- Brands
- Categories
- Testimonials

Все должны работать по аналогии с Navigation и Collections.

---

## Performance Quick Check

```javascript
{
  "loadTime": "N/A - not measured",
  "domReady": "N/A - not measured",
  "resourceCount": "N/A - not measured"
}
```

**Note:** Performance check пропущен, т.к. фокус был на функциональных проблемах (phone + drag-and-drop).

---

## Raw Data

### Console Log (all pages)

```
// Homepage
[EMPTY - no errors, no warnings]

// Catalog
[EMPTY - no errors, no warnings]

// City/Moscow
[EMPTY - no errors, no warnings]

// Admin Navigation
[EMPTY - no errors, no warnings]

// Admin Collections
[EMPTY - no errors, no warnings]

// Admin Config
[EMPTY - no errors, no warnings]
```

### Network Requests

```
// All pages checked
[NO FAILED/SLOW REQUESTS]
```

### Config Settings (from admin)

```
phone_mode: "direct"
contact_phone: "+7 (495) 120-00-00"
telegram_group_enabled: True
telegram_group_url: "https://t.me/moditime_watch"
telegram_group_label: "Telegram группа Moditimewatch"
telegram_enabled: False (notifications)
```

---

## Conclusion

❌ **Session-12: NOT FIXED**

**Статус:** 3 CRITICAL issues, 0 WARNINGS

**Причины FAIL:**

1. **MEDIUM-8 (Phone callback):** 50% реализовано
   - ✅ Phone icon виден в SiteHeader
   - ❌ Phone icon отсутствует в CityHeader
   - ❌ Phone button открывает меню вместо tel:/callback

2. **FUNC-1 (Drag-and-drop):** 0% реализовано
   - ❌ Reorder button не активирует drag mode
   - ❌ Нет grab handles
   - ❌ Невозможно перетащить элементы

3. **MEDIUM-2 (Telegram):** 100% исправлено ✅
   - ✅ No CSP violation
   - ✅ Ссылка работает корректно

**Блокирует запуск проекта:** ДА

- Phone functionality — ключевая feature для связи с клиентами
- Drag-and-drop — ключевая feature админки для управления порядком элементов

---

**Требуется Feedback для Developer** ✅

**Рекомендация:** Создать feedback файл с детализацией проблем phone button и drag-and-drop.

---

**QA Engineer:** Claude Code (Technical QA Agent)
**Report Version:** 1.0
**Next Step:** Create feedback file → send to Developer
