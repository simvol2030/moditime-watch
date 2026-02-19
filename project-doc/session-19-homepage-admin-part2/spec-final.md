# Session-19: Homepage Admin Part 2 (Сервисы + Отзывы + Журнал + Telegram) — Спецификация

**Версия:** final
**Дата:** 2026-02-19
**ASCII-спека:** `../../ASCII/templates/homepage.admin.md`
**Зависит от:** Session-18 (вкладки + homepage_section_config)

---

## Есть сейчас vs Должно быть

| Аспект | Есть | Должно быть |
|--------|------|-------------|
| Управление сервисами | Базовая форма в `/admin/homepage` (раздел "Services") | Полноценная вкладка: тексты секции + CRUD карточек сервисов + статистика + CTA |
| Управление отзывами | Нет UI | CRUD отзывов: аватар, имя, должность, текст, выбор часов, порядок |
| Управление журналом | Нет UI. Показываются articles WHERE is_featured = 1 | Выбор режима: авто / ручной. Настройка текстов секции |
| Управление Telegram | Нет UI. Конфиг через site_config + widgets | Полная форма: вкл/выкл, тексты, фичи (буллеты), URL канала |

---

## Что на выходе

Завершение страницы `/admin/homepage` — оставшиеся 4 вкладки:

### Вкладка "Сервисы" (Experience)
- **Тексты секции:** eyebrow, title, description из `homepage_section_config`
- **CTA:** текст кнопки + URL (из extra_json)
- **Статистика:** CRUD [{value, label}] из `home_service_stats`
- **Карточки сервисов:** CRUD из `home_services` — icon_svg, title, description, link_text, link_href
- **Порядок:** стрелки вверх/вниз

### Вкладка "Отзывы" (Testimonials)
- **Тексты секции:** eyebrow, title, description
- **Список отзывов:** таблица с аватаром, именем, должностью
- **CRUD отзыва:** avatar upload, name, position, text, choice, is_active
- **Порядок:** стрелки вверх/вниз (display_order)

### Вкладка "Журнал" (Editorial)
- **Тексты секции:** eyebrow, title
- **Режим:** переключатель — "Автоматический" (is_featured + последние) / "Ручной"
- **Ручной режим:** поиск статей + добавление + порядок + удаление
- **Лимит:** макс. 8 статей

### Вкладка "Telegram"
- **Toggle:** показывать/скрывать секцию (telegram_group_enabled в site_config)
- **Тексты:** eyebrow, title, description
- **Фичи (буллеты):** массив строк, добавление/удаление
- **CTA:** текст кнопки
- **URL канала:** ссылка на Telegram

---

## Что нужно сделать

### 1. Новая таблица `homepage_editorial_items` (для ручного режима журнала)

```sql
CREATE TABLE IF NOT EXISTS homepage_editorial_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0
);
```

### 2. Prepared statements в database.ts

- CRUD для `home_services` (расширить существующие)
- CRUD для `home_service_stats` (расширить существующие)
- CRUD для `testimonials` (новые admin queries)
- CRUD для `homepage_editorial_items`
- Обновление `widgets` (type = 'telegram_cta')
- Поиск articles для ручного выбора

### 3. Реализовать 4 вкладки

Каждая вкладка — отдельная форма с server actions:
- Сервисы: `saveExperienceConfig`, `createService`, `updateService`, `deleteService`, CRUD stats
- Отзывы: `saveTestimonialsConfig`, `createTestimonial`, `updateTestimonial`, `deleteTestimonial`, reorder
- Журнал: `saveEditorialConfig`, `addEditorialItem`, `removeEditorialItem`, reorder
- Telegram: `saveTelegramConfig`

### 4. Обновить компоненты секций

`ExperienceSection`, `TestimonialsSection`, `EditorialSection`, `TelegramCtaSection` — читать eyebrow/title/description из props.

### 5. Обновить `+page.server.ts` (главная)

- Journal: если ручной режим — читать из `homepage_editorial_items`
- Telegram: тексты из `homepage_section_config` + widget

---

## Факторы реализации

- **Session-18 уже сделана:** вкладки работают, `homepage_section_config` есть, паттерн установлен
- **Таблицы:** `home_services`, `home_service_stats`, `testimonials` — уже существуют
- **Image upload:** для аватаров отзывов — использовать `processImage` + `saveMedia`
- **SVG иконки:** для сервисов — textarea с SVG-кодом (не файл)
- **Telegram widget:** обновлять `widgets` WHERE type = 'telegram_cta'
- **ASCII-спека:** строго следовать `ASCII/templates/homepage.admin.md`

---

## Критерии успеха

- [ ] Вкладка "Сервисы": CRUD карточек и статистики работает, CTA настраивается
- [ ] Вкладка "Отзывы": CRUD с avatar upload работает, порядок меняется
- [ ] Вкладка "Журнал": авто/ручной режим работает, поиск статей
- [ ] Вкладка "Telegram": вкл/выкл, тексты, фичи, URL — всё сохраняется
- [ ] Все eyebrow/title/description из БД, не из хардкода
- [ ] На публичной главной все секции отображаются корректно
- [ ] Все 7 вкладок Homepage Admin работают полноценно
