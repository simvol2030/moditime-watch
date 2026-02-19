# Session-20: Site Settings Admin — Спецификация

**Версия:** final
**Дата:** 2026-02-19
**ASCII-спека:** `../../ASCII/admin/site-settings.md`, `../../ASCII/layouts/headers/main.admin.md`, `../../ASCII/layouts/footers/main.admin.md`

---

## Есть сейчас vs Должно быть

| Аспект | Есть | Должно быть |
|--------|------|-------------|
| Контакты (телефон, email, адрес) | В БД (site_config), но нет UI | Форма в админке: все контакты в одном месте |
| Соцсети | Только Telegram в site_config | Все соцсети: Telegram, VK, YouTube, WhatsApp |
| Логотип | Текстовый wordmark захардкожен | Из БД: wordmark/tagline текст ИЛИ загруженное изображение |
| Topbar | Тексты захардкожены в SiteHeader | Из БД: бейдж, описание, toggle видимости |
| Footer описание | Захардкожено в SiteFooter | Из БД: описание компании |
| Копирайт | В БД, нет UI | Редактируемое поле |
| Favicon | Нет | Загрузка через админку |
| Админ-интерфейс | `/admin/settings` — только пароль | Полноценные настройки сайта |

---

## Что на выходе

Страница `/admin/settings/site` (или расширение `/admin/settings`) с секциями:

### Секция "Основное"
- Название сайта → `site_name` в site_config
- Логотип wordmark → `logo_wordmark` (текст, отображается в header/footer)
- Логотип tagline → `logo_tagline` (текст под wordmark)
- Логотип изображение → upload, `logo_image_url`
- Режим логотипа → `logo_mode`: text / image
- Favicon → upload
- Описание компании → `company_description` (для footer бренд-колонки)

### Секция "Контакты"
- Телефон → `contact_phone`
- Email → `contact_email`
- Адрес → `contact_address`
- Часы работы → `working_hours`
- Режим телефона → `phone_mode`: direct / callback

### Секция "Соцсети"
- Telegram → `social_telegram`
- VK → `social_vk`
- YouTube → `social_youtube`
- WhatsApp → `social_whatsapp`

### Секция "Telegram-группа"
- Включена → `telegram_group_enabled`
- URL → `telegram_group_url`
- Название → `telegram_group_label`

### Секция "Header (Topbar)"
- Бейдж → `topbar_badge`
- Текст → `topbar_text`
- Показывать topbar → `topbar_visible`

### Секция "Юридическое"
- Копирайт → `copyright_text` ({year} = автозамена)

---

## Что нужно сделать

### 1. Новые ключи в site_config (seed)

Добавить новые ключи с дефолтными значениями (INSERT OR IGNORE):
- `site_name`, `logo_wordmark`, `logo_tagline`, `logo_image_url`, `logo_mode`
- `company_description`
- `social_vk`, `social_youtube`, `social_whatsapp`
- `topbar_badge`, `topbar_text`, `topbar_visible`

### 2. Страница `/admin/settings/site`

Форма с секциями (как описано выше).
Server action: `saveSiteSettings` — bulk update site_config.
Image upload для логотипа и favicon.

### 3. Обновить SiteHeader

- Wordmark/tagline → читать из siteConfig (если logo_mode = 'text' → wordmark, если 'image' → img)
- Topbar badge/text → из siteConfig
- Topbar visible → условный рендеринг

### 4. Обновить SiteFooter

- Описание компании → из siteConfig вместо хардкода
- Соцсети → из siteConfig (показывать только заполненные)

### 5. Обновить CityHeader/CityFooter

Аналогично — wordmark из siteConfig.

---

## Факторы реализации

- **site_config уже используется:** просто добавляем новые ключи
- **Не ломать существующее:** все новые ключи с fallback на хардкод
- **Image upload:** логотип SVG/PNG через processImage или напрямую (SVG не нужно конвертировать)
- **ASCII-спека:** строго `ASCII/admin/site-settings.md`

---

## Критерии успеха

- [ ] Все контакты редактируются из `/admin/settings/site`
- [ ] Логотип: можно переключиться между текстом и изображением
- [ ] Topbar: тексты из БД, можно скрыть
- [ ] Footer: описание из БД, соцсети отображаются
- [ ] Favicon загружается
- [ ] Нет регрессий на header/footer при отсутствии новых ключей (fallback)
