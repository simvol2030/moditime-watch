# QA Technical Validation Report

**Page:** https://moditime-watch.ru/
**Admin:** https://moditime-watch.ru/admin
**Date:** 2026-02-19 23:30
**Checklist:** None provided (task-specific checks from user request)

## Summary

| Category | Status | Critical | Warnings |
|----------|--------|----------|----------|
| Console Errors | PASS | 0 | 0 |
| Network Requests | FAIL | 1 | 0 |
| JS Functionality | WARNING | 0 | 2 |
| API Integration | WARNING | 0 | 2 |
| Error Handling | PASS | 0 | 0 |
| Performance | PASS | 0 | 0 |

**Overall: WARNING**
**Total Critical: 1 | Total Warnings: 4**

---

## Critical Issues

### CRIT-1: All picsum.photos images blocked by ORB (Opaque Response Blocking)

- **Category:** Network Requests
- **Step found:** Step 3
- **Description:** Every image loaded from `picsum.photos` fails with `net::ERR_BLOCKED_BY_ORB`. This affects 21+ distinct image resources on the homepage:
  - 6 collection card images (`picsum.photos/seed/collection-{1-6}/520/360`)
  - 6 client/testimonial avatar images (`picsum.photos/seed/client-{1-6}/64/64`)
  - 6 journal/blog card images (`picsum.photos/seed/blog-{1-6}/420/280`)
  - 3 product/watch images (`picsum.photos/seed/watch-{1-3}/360/440`)
- **Expected:** Images should load and display correctly. If using placeholder images, they should be served from a CORS-compatible source or self-hosted.
- **Evidence:** Network log lines 32-73 all show `[FAILED] net::ERR_BLOCKED_BY_ORB` for picsum.photos URLs. The images do appear to have alt text fallbacks, so the layout does not break, but the visual content is missing.
- **Impact:** Collections, Bestsellers, Testimonials, and Journal sections all display broken/missing images. Only the Hero section image (from `images.unsplash.com`) loads successfully.
- **Screenshot:** homepage-fullpage.png (visible as placeholder areas without images)

---

## Warnings

### WARN-1: Homepage Admin "Bestsellers" tab renders empty content

- **Category:** JS Functionality
- **Step found:** Step 4
- **Description:** When navigating to `/admin/homepage?tab=bestsellers`, the tab area below the tab bar is completely empty -- no form fields, no editor, no content at all. The tab buttons are visible but the Bestsellers tab has no functional UI.
- **Evidence:** Accessibility snapshot shows only the tab bar and header with no content elements below. The page URL correctly changes to `?tab=bestsellers`. Screenshot: admin-homepage-bestsellers.png

### WARN-2: Homepage Admin "Journal" tab renders empty content

- **Category:** JS Functionality
- **Step found:** Step 4
- **Description:** When navigating to `/admin/homepage?tab=journal`, the tab area is completely empty -- identical behavior to the Bestsellers tab. No form fields or editor rendered.
- **Evidence:** Accessibility snapshot shows only tabs and header elements. All other tabs (Hero, Collections, Services, Testimonials, Telegram) render their content correctly.

### WARN-3: Hero section statistics mismatch between admin and public page

- **Category:** API Integration
- **Step found:** Step 4 / Step 5
- **Description:** The admin Hero tab shows manually configured statistics values:
  - "560+" / "моделей в наличии"
  - "48" / "мировых брендов"
  - "24ч" / "консьерж-подбор"

  But the public homepage displays different values:
  - "3+" / "моделей в каталоге"
  - "3" / "премиальных брендов"
  - "24ч" / "консьерж-подбор"

  The public page appears to use dynamic database counts (3 products, 3 brands) instead of the admin-configured values. The labels also differ ("моделей в наличии" vs "моделей в каталоге", "мировых брендов" vs "премиальных брендов").
- **Evidence:** Admin snapshot shows textbox values "560+", "48", "24ч". Public homepage snapshot shows "3+", "3", "24ч" displayed to users.

### WARN-4: Site Settings form shows temporarily empty fields after save

- **Category:** API Integration
- **Step found:** Step 5
- **Description:** After clicking "Сохранить" on the Site Settings form, the success message "Настройки сохранены" appears, but all form fields momentarily display as empty (no values, unchecked checkboxes, no radio selection). On subsequent page reload, all data is correctly restored. This appears to be a transient Svelte reactivity issue during the SvelteKit form action response -- the form state is briefly reset before being repopulated.
- **Evidence:** Snapshot after save showed all textboxes empty and checkboxes unchecked, while success message "Настройки сохранены" was visible. Reloading the page confirmed all data was correctly persisted.

---

## Passed Checks

- [PASS] Homepage loads successfully (HTTP 200, title: "Moditimewatch - Премиальные часы с доставкой")
- [PASS] All 7 homepage sections rendered: Hero, Collections (6 cards), Bestsellers (3 products), Services (3 cards + stats), Testimonials (6 reviews), Journal (6 articles), Telegram CTA
- [PASS] Header navigation menu renders correctly from Menu Manager data (Каталог, Коллекции, Бестселлеры, Сервис, Журнал)
- [PASS] Footer renders correctly with 3 column sections (Магазин, Сервис, Офис) + legal links
- [PASS] Topbar renders correctly with badge "Moditimewatch Delivery" and description text
- [PASS] Zero console errors on homepage load
- [PASS] Zero console errors on all admin pages
- [PASS] Admin Dashboard loads without authentication issues (session active)
- [PASS] Admin sidebar shows all new menu items: Homepage, Menus, Site Settings, Pages
- [PASS] Admin /admin/homepage -- all 7 tabs visible (Hero, Коллекции, Бестселлеры, Сервисы, Отзывы, Журнал, Telegram)
- [PASS] Admin /admin/homepage -- Hero tab loads with all form sections (Тексты, CTA, Изображение, Статистика, Quick Links, Бренды)
- [PASS] Admin /admin/homepage -- Collections tab loads with 6 collections list and text editor
- [PASS] Admin /admin/homepage -- Services tab loads with text editor, 3 stats, 3 service cards
- [PASS] Admin /admin/homepage -- Testimonials tab loads with 6 reviews listed
- [PASS] Admin /admin/homepage -- Telegram tab loads with content editor and CTA settings
- [PASS] Admin /admin/settings/site -- all 6 sections present (Основное, Контакты, Соцсети, Telegram-группа, Header Topbar, Юридическое)
- [PASS] Admin /admin/settings/site -- Save button works, shows "Настройки сохранены" success message
- [PASS] Admin /admin/settings/site -- Data persists correctly after save (verified on reload)
- [PASS] Admin /admin/menus -- 5 menus listed (header_desktop: 18 items, header_mobile: 0, footer: 14, footer_legal: 2, city_header: 0)
- [PASS] Admin /admin/menus?menu=header_desktop -- Menu editor loads correctly with hierarchical items, move up/down/edit/delete buttons
- [PASS] Admin /admin/pages -- Singleton pages listed (6): Главная, О сервисе, Контакты, Доставка, Политика конфиденциальности, Оферта
- [PASS] Admin /admin/pages -- Content pages listed (18): 6 articles + 12 pSEO city pages
- [PASS] Admin /admin/pages -- Filter dropdown works (Все типы, Статьи, Города pSEO)
- [PASS] Admin /admin/pages -- Search field present and functional
- [PASS] 404 error page works correctly with custom design, user-friendly message, and navigation links
- [PASS] Performance: Page load time 444ms, DOM ready 331ms (well under 3s threshold)
- [PASS] Performance: 55 resources loaded
- [PASS] All SvelteKit JS/CSS assets loaded successfully (HTTP 200)
- [PASS] Hero image from images.unsplash.com loads successfully

---

## Checklist Verification

| # | Checklist Item | Status | Notes |
|---|---------------|--------|-------|
| 1 | Homepage renders all 7 sections (Hero, Collections, Bestsellers, Services, Testimonials, Journal, Telegram CTA) | PASS | All 7 sections confirmed in accessibility snapshot |
| 2 | Admin login page loads at /admin | PASS | Admin loaded directly to Dashboard (session was active, no login required) |
| 3 | Homepage Admin /admin/homepage has 7 tabs | PASS | All 7 tabs visible: Hero, Коллекции, Бестселлеры, Сервисы, Отзывы, Журнал, Telegram |
| 4 | Homepage Admin -- all tabs load with content | WARNING | Bestsellers and Journal tabs render empty content area; other 5 tabs work correctly |
| 5 | Site Settings /admin/settings/site has all sections | PASS | All 6 sections present: Основное, Контакты, Соцсети, Telegram-группа, Header, Юридическое |
| 6 | Menu Manager /admin/menus shows 5 menus | PASS | 5 menus listed: header_desktop (18), header_mobile (0), footer (14), footer_legal (2), city_header (0) |
| 7 | Menu Manager -- click into editors works | PASS | header_desktop editor loads correctly with hierarchical menu structure |
| 8 | Page Manager /admin/pages shows pages | PASS | 6 singleton + 18 content pages displayed correctly |
| 9 | No console JS errors | PASS | 0 errors on homepage and all admin pages |
| 10 | No network errors (4xx/5xx) | FAIL | 21+ picsum.photos images blocked by ERR_BLOCKED_BY_ORB |
| 11 | Forms submit correctly (try saving settings) | PASS | Site Settings save succeeds, data persists correctly |
| 12 | Public homepage sections all visible | PASS | All 7 sections render with content from admin data |

---

## Raw Data

### Console Log
```
Homepage (https://moditime-watch.ru/): 0 errors, 0 warnings
Admin Dashboard (/admin): 0 errors, 0 warnings
Admin Homepage (/admin/homepage): 0 errors, 0 warnings
Admin Homepage Bestsellers tab: 0 errors, 0 warnings
Admin Homepage Journal tab: 0 errors, 0 warnings
Admin Site Settings (/admin/settings/site): 0 errors, 0 warnings
Admin Menus (/admin/menus): 0 errors, 0 warnings
Admin Pages (/admin/pages): 0 errors, 0 warnings
404 page (/nonexistent-page-xyz): 1 error (expected HTTP 404 status)
```

### Network Requests (Failed)
```
[GET] picsum.photos/seed/collection-1/520/360 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/collection-2/520/360 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/collection-3/520/360 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/collection-4/520/360 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/collection-5/520/360 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/collection-6/520/360 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/client-1/64/64 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/client-2/64/64 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/client-3/64/64 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/client-4/64/64 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/client-5/64/64 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/client-6/64/64 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/blog-1/420/280 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/blog-2/420/280 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/blog-3/420/280 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/blog-4/420/280 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/blog-5/420/280 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/blog-6/420/280 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/watch-1/360/440 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/watch-2/360/440 => [FAILED] net::ERR_BLOCKED_BY_ORB
[GET] picsum.photos/seed/watch-3/360/440 => [FAILED] net::ERR_BLOCKED_BY_ORB

Successful: All SvelteKit assets (_app/immutable/*), 1 Unsplash hero image
Total failed: 21 distinct URLs (42 requests including retries)
```

### Performance Metrics
```
Page load time: 444ms
DOM ready: 331ms
Resource count: 55
Large assets: None detected (transfer sizes not reported due to cross-origin)
Console errors: 0
Console warnings: 0
```
