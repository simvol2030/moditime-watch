# Session-18: Homepage Admin Part 1 (Hero + Коллекции + Бестселлеры) — Спецификация

**Версия:** final
**Дата:** 2026-02-19
**ASCII-спека:** `../../ASCII/templates/homepage.md`, `../../ASCII/templates/homepage.admin.md`

---

## Есть сейчас vs Должно быть

| Аспект | Есть | Должно быть |
|--------|------|-------------|
| Управление Hero | Базовая форма с JSON-полями в `/admin/homepage` | Полноценная форма: тексты, CTA, image upload, stats, quick links, brands — каждое поле отдельное |
| Управление коллекциями | Нет UI. Данные в БД через seed | CRUD коллекций: создание, редактирование, удаление, порядок. Привязка товаров к коллекции |
| Управление бестселлерами | Нет UI. Показываются products WHERE is_featured = 1 | Выбор режима: авто (is_featured) или ручной (выбрать конкретные товары). Настройка текстов секции |
| Eyebrow/Title секций | Захардкожены в компонентах | Из БД: eyebrow, title, description для каждой секции |
| Навигация по секциям | Одна простая форма | Вкладки: Hero / Коллекции / Бестселлеры (+ заглушки для остальных секций) |

---

## Что на выходе

Страница `/admin/homepage` с вкладками (tabs). Session-18 реализует первые 3 вкладки:

### Вкладка "Hero"
Полная форма редактирования hero-секции:
- **Тексты:** tagline, заголовок H1, описание — отдельные текстовые поля (не JSON)
- **CTA кнопки:** primary (текст + ссылка), secondary (текст + ссылка + toggle показа)
- **Изображение:** upload hero image + alt text + badge (label + title + toggle)
- **Статистика:** массив до 4 элементов [{value, label}], добавление/удаление
- **Quick Links:** массив чипов [{text, href}], добавление/удаление, drag-and-drop или стрелки
- **Бренды:** массив строк из чекбоксов (все активные бренды из БД) или авто-режим

### Вкладка "Коллекции"
- **Тексты секции:** eyebrow, заголовок, описание — редактируемые
- **Список коллекций:** таблица с thumb, названием, категорией, статусом
- **CRUD коллекции:** форма — slug, category, title, description, image upload, link text/href, is_active
- **Товары в коллекции:** поиск по имени/SKU + добавление + удаление + порядок
- **Порядок коллекций:** стрелки вверх/вниз (ReorderButtons)

### Вкладка "Бестселлеры"
- **Тексты секции:** eyebrow, заголовок, текст и URL ссылки "Вся витрина"
- **Режим:** переключатель — "Автоматический" (is_featured) / "Ручной"
- **Ручной режим:** поиск товаров + добавление в список + порядок + удаление
- **Лимит:** макс. 12 товаров

---

## Что нужно сделать

### 1. Новая таблица `homepage_section_config`

```sql
CREATE TABLE IF NOT EXISTS homepage_section_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  section_key TEXT UNIQUE NOT NULL,
  eyebrow TEXT DEFAULT '',
  title TEXT DEFAULT '',
  description TEXT DEFAULT '',
  extra_json TEXT DEFAULT '{}',
  is_active INTEGER DEFAULT 1
);
```

Seed-данные:
```sql
INSERT INTO homepage_section_config (section_key, eyebrow, title, description) VALUES
('collections', 'Подборки', 'Кураторские коллекции Moditimewatch', 'Авторский отбор от экспертов для тех, кто ценит детали...'),
('showcase', 'Бестселлеры', 'Топ-модели недели', ''),
('experience', 'Опыт Moditimewatch', 'Премиальный сервис для ценителей часов', 'Индивидуальный подход...'),
('testimonials', 'Отзывы клиентов', 'Истории владельцев Moditimewatch', 'Что говорят клиенты...'),
('editorial', 'Журнал', 'Экспертиза и вдохновение', ''),
('telegram', 'Подписка', 'Канал Moditimewatch в Telegram', 'Анонсы релизов и эксклюзивные предложения');
```

### 2. Новая таблица `homepage_showcase_items` (для ручного режима бестселлеров)

```sql
CREATE TABLE IF NOT EXISTS homepage_showcase_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0
);
```

### 3. Prepared statements в database.ts

- `getHomepageSectionConfig`: SELECT all from homepage_section_config
- `updateHomepageSectionConfig`: UPDATE by section_key
- CRUD для collection_products (уже есть таблица, нужны queries)
- CRUD для homepage_showcase_items

### 4. Страница `/admin/homepage` с вкладками

**Layout:**
- Tabs bar: Hero | Коллекции | Бестселлеры | Сервисы* | Отзывы* | Журнал* | Telegram*
- `*` = inactive (placeholder, Session-19)
- Каждая вкладка — отдельная `<form>` с `use:enhance`
- URL params для вкладки: `?tab=hero`, `?tab=collections`, `?tab=showcase`

### 5. Обновить компоненты секций

Компоненты на главной (`HeroSection`, `CollectionsSection`, `ShowcaseSection`) должны читать eyebrow/title/description из props (которые приходят из `homepage_section_config`), а не из хардкода.

### 6. Обновить `+page.server.ts` главной

Загружать `homepage_section_config` и передавать в компоненты.

---

## Факторы реализации

- **Существующий код:** Hero форма уже есть (`/admin/homepage`), нужно расширить
- **Таблицы:** `home_hero`, `collections`, `collection_products` — уже существуют
- **Порядок:** использовать стрелки (Session-14 стиль), не drag-and-drop
- **Image upload:** использовать существующие `processImage` + `saveMedia` из `$lib/server/media/`
- **CSRF:** все формы через `use:enhance`, CSRF через существующий механизм
- **ASCII-спека:** строго следовать `ASCII/templates/homepage.admin.md` — вкладки Hero, Коллекции, Бестселлеры

---

## Критерии успеха

- [ ] Страница `/admin/homepage` открывается с вкладками
- [ ] Hero: все поля редактируются и сохраняются (тексты, CTA, изображение, stats, quick links, brands)
- [ ] Коллекции: CRUD работает (создание, редактирование, удаление, порядок)
- [ ] Коллекции: привязка товаров к коллекции работает (поиск + добавление + удаление)
- [ ] Бестселлеры: авто-режим и ручной режим работают
- [ ] Eyebrow/title секций из БД вместо хардкода
- [ ] На публичной главной данные отображаются корректно после изменений
- [ ] Нет регрессий на существующем функционале
