# Схема данных (существующая + рекомендуемые изменения)

> Проект уже имеет 46 таблиц. Ниже описаны таблицы, релевантные для layout и homepage.
> `[ЕСТЬ]` = уже существует, `[НОВОЕ]` = нужно создать, `[ИЗМЕНЕНИЕ]` = нужно расширить.

---

## Таблица: site_config [ЕСТЬ]

> Глобальные настройки сайта (key-value store)

| key | value (пример) | Используется |
|-----|----------------|-------------|
| `contact_phone` | +7 (495) 120-00-00 | Header, Footer |
| `contact_email` | info@moditime-watch.ru | Topbar, Footer |
| `contact_address` | Москва, Столешников пер. | Footer "Офис" |
| `working_hours` | Пн-Пт: 10:00-20:00 | Footer "Офис" |
| `copyright_text` | © {year} Moditimewatch | Footer |
| `phone_mode` | direct / callback | Header phone action |
| `telegram_group_enabled` | true / false | Telegram CTA секция |
| `telegram_group_url` | https://t.me/moditime_watch | Telegram CTA, City Footer |
| `telegram_group_label` | Telegram группа | Telegram CTA |

### Рекомендуемые новые ключи [ИЗМЕНЕНИЕ]

| key | value | Назначение |
|-----|-------|-----------|
| `site_name` | Moditimewatch | Title, копирайт |
| `logo_wordmark` | Moditimewatch | Header/Footer wordmark |
| `logo_tagline` | Fine Time Delivery | Header tagline |
| `logo_image_url` | /media/logo.svg | Логотип-изображение (альтернатива wordmark) |
| `logo_mode` | text / image | Текст или изображение |
| `company_description` | Сервис доставки... | Footer бренд-колонка |
| `social_vk` | URL | Footer соцсети |
| `social_youtube` | URL | Footer соцсети |
| `social_whatsapp` | URL | Footer соцсети |
| `topbar_badge` | Moditimewatch Delivery | Topbar бейдж |
| `topbar_text` | Доставка премиальных часов... | Topbar описание |
| `topbar_visible` | true / false | Показывать topbar |

---

## Таблица: navigation_items [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| menu | TEXT | 'header_desktop', 'header_mobile' |
| label | TEXT | Текст пункта |
| link | TEXT | URL |
| parent_id | INTEGER | FK → self (для подменю) |
| position | INTEGER | Порядок |
| is_active | INTEGER | 1/0 |

---

## Таблица: footer_sections [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| title | TEXT | Заголовок секции |
| column | INTEGER | Номер колонки |
| position | INTEGER | Порядок |

---

## Таблица: footer_links [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| section_id | INTEGER | FK → footer_sections |
| label | TEXT | Текст ссылки |
| url | TEXT | URL |
| position | INTEGER | Порядок |

---

## Таблица: home_hero [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| tagline | TEXT | Маленький текст над заголовком |
| title | TEXT | Заголовок H1 |
| description | TEXT | Описание |
| primary_cta_text | TEXT | Текст кнопки 1 |
| primary_cta_href | TEXT | URL кнопки 1 |
| secondary_cta_text | TEXT | Текст кнопки 2 |
| secondary_cta_href | TEXT | URL кнопки 2 |
| image_url | TEXT | Hero изображение |
| image_alt | TEXT | Alt текст |
| image_badge_label | TEXT | Бейдж на изображении |
| image_badge_title | TEXT | Подзаголовок бейджа |
| stats_json | TEXT (JSON) | [{value, label}] |
| quick_links_json | TEXT (JSON) | [{text, href, variant}] |
| brands_json | TEXT (JSON) | ["Brand1", "Brand2"] |
| is_active | INTEGER | 1/0 |

---

## Таблица: collections [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| slug | TEXT UNIQUE | URL-идентификатор |
| category | TEXT | Категория/тег (напр. "Для переговоров") |
| title | TEXT | Название коллекции |
| description | TEXT | Описание |
| image_url | TEXT | Изображение |
| link_text | TEXT | Текст ссылки |
| link_href | TEXT | URL ссылки |
| position | INTEGER | Порядок |
| is_active | INTEGER | 1/0 |

---

## Таблица: collection_products [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| collection_id | INTEGER | FK → collections |
| product_id | INTEGER | FK → products |
| position | INTEGER | Порядок в коллекции |

---

## Таблица: home_services [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| icon_svg | TEXT | SVG-код иконки |
| title | TEXT | Название сервиса |
| description | TEXT | Описание |
| link_text | TEXT | Текст ссылки |
| link_href | TEXT | URL |
| position | INTEGER | Порядок |
| is_active | INTEGER | 1/0 |

---

## Таблица: home_service_stats [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| label | TEXT | Описание стата |
| value | TEXT | Значение |
| position | INTEGER | Порядок |

---

## Таблица: testimonials [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| name | TEXT | Имя клиента |
| position | TEXT | Должность |
| avatar_url | TEXT | Аватар (64×64) |
| text | TEXT | Текст отзыва |
| choice | TEXT | Выбор часов |
| is_active | INTEGER | 1/0 |
| display_order | INTEGER | Порядок |

---

## Таблица: widgets [ЕСТЬ]

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| type | TEXT | Тип виджета (напр. 'telegram_cta') |
| data_json | TEXT (JSON) | Данные виджета |
| is_active | INTEGER | 1/0 |

---

## Новая таблица: homepage_section_config [НОВОЕ]

> Для хранения eyebrow/title/description каждой секции (сейчас хардкод)

| Поле | Тип | Описание |
|------|-----|----------|
| id | INTEGER PK | |
| section_key | TEXT UNIQUE | 'collections', 'showcase', 'experience', 'testimonials', 'editorial' |
| eyebrow | TEXT | Текст над заголовком |
| title | TEXT | Заголовок секции |
| description | TEXT | Описание |
| extra_json | TEXT (JSON) | Доп. настройки (CTA text/href для experience) |
| is_active | INTEGER | Показывать секцию (1/0) |

---

## Связи

```
site_config          — глобальные настройки (key-value)
navigation_items     — header меню (parent_id → self)
footer_sections  1 ──→ N  footer_links
home_hero            — единственная запись hero
collections      1 ──→ N  collection_products  ←── products
home_services        — карточки сервисов
home_service_stats   — статистика сервисов
testimonials         — отзывы клиентов
widgets              — виджеты (telegram CTA и др.)
homepage_section_config — [НОВОЕ] тексты секций (вместо хардкода)
```
