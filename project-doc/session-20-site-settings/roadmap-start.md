# Session-20: Site Settings Admin — Roadmap

**Дата:** 2026-02-19
**Спецификация:** `spec-final.md`
**ASCII-спека:** `../../ASCII/admin/site-settings.md`

---

## Задачи

### Task 1: БД — Новые ключи site_config + seed
**Score: 3** (БД + 1 файл)

Добавить новые ключи в site_config (INSERT OR IGNORE):
- `site_name` = 'Moditimewatch'
- `logo_wordmark` = 'Moditimewatch'
- `logo_tagline` = 'Fine Time Delivery'
- `logo_image_url` = ''
- `logo_mode` = 'text'
- `company_description` = 'Сервис доставки оригинальных часов из-за рубежа...'
- `social_vk` = '', `social_youtube` = '', `social_whatsapp` = ''
- `topbar_badge` = 'Moditimewatch Delivery'
- `topbar_text` = 'Доставка премиальных часов по России и СНГ'
- `topbar_visible` = 'true'

**Файлы:** `src/lib/server/db/database.ts`

---

### Task 2: Admin — Страница Site Settings
**Score: 7** (UI + формы + image upload + 2-3 файла)

Создать `/admin/settings/site` (или расширить `/admin/settings`):
- Секции: Основное, Контакты, Соцсети, Telegram-группа, Header (Topbar), Юридическое
- Каждая секция — fieldset с заголовком
- Image upload для логотипа (SVG/PNG, без конвертации в WebP) и favicon
- Radio: logo_mode (text / image)
- Radio: phone_mode (direct / callback)
- Toggle: topbar_visible, telegram_group_enabled
- Server action: `saveSiteSettings` → bulk update site_config

**Файлы:** Новые: `src/routes/(admin)/admin/settings/site/+page.svelte`, `+page.server.ts`

**Важно:** Следовать ASCII-спеке `ASCII/admin/site-settings.md`

---

### Task 3: Обновить SiteHeader — данные из site_config
**Score: 5** (логика + 1-2 файла + risk)

SiteHeader.svelte:
- Topbar badge → `siteConfig.topbar_badge || 'Moditimewatch Delivery'`
- Topbar text → `siteConfig.topbar_text || 'Доставка...'`
- Topbar visible → `siteConfig.topbar_visible !== 'false'`
- Logo → если `logo_mode === 'image'` и `logo_image_url` → показать `<img>`, иначе wordmark/tagline из siteConfig

**Файлы:** `src/lib/components/layout/SiteHeader.svelte`

---

### Task 4: Обновить SiteFooter — данные из site_config
**Score: 4** (логика + 1 файл)

SiteFooter.svelte:
- Описание бренда → `siteConfig.company_description || 'Сервис доставки...'`
- Соцсети → показывать иконки для заполненных: telegram, vk, youtube, whatsapp
- Logo → аналогично header (wordmark или image)

**Файлы:** `src/lib/components/layout/SiteFooter.svelte`

---

### Task 5: Обновить CityHeader + CityFooter
**Score: 3** (логика + 2 файла)

Аналогично main header/footer:
- CityHeader: logo из siteConfig
- CityFooter: logo + соцсети из siteConfig

**Файлы:** `CityHeader.svelte`, `CityFooter.svelte`

---

### Task 6: Sidebar — ссылка "Настройки сайта"
**Score: 2** (UI + 1 файл)

Добавить в admin sidebar ссылку на `/admin/settings/site`.
Возможно подменю: "Настройки" → "Общие" + "Сайт".

**Файлы:** `src/routes/(admin)/admin/+layout.svelte`

---

## Порядок выполнения

```
Task 1 (БД: новые ключи)
    ↓
Task 2 (Admin: страница settings)
    ↓
Task 3 (SiteHeader)  ─┐
Task 4 (SiteFooter)   ├── параллельно
Task 5 (City H/F)    ─┘
    ↓
Task 6 (Sidebar)
```

---

*Roadmap Session-20 | 2026-02-19*
