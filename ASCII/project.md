# Проект — Конфигурация

> Единственный файл, где указывается конкретный стек и контекст проекта.

## Название проекта

Moditime Watch — E-commerce для премиальных часов

## Стек

- **Frontend:** SvelteKit 2.x + Svelte 5 (runes)
- **Backend:** SvelteKit server routes (fullstack monolith)
- **БД:** SQLite (better-sqlite3, WAL mode, FTS5)
- **Стили:** CSS (custom properties, без Tailwind)

## Тип проекта

- [ ] Новый проект с нуля
- [ ] Существующий проект — добавление админки
- [x] Существующий проект — расширение функционала
- [ ] Перенос статики на фреймворк

## Существующий код

- **Путь к проекту:** `/home/claude-user/dev/watch-site/moditime-watch`
- **Роуты/страницы:** `frontend-sveltekit/src/routes/`
- **Компоненты:** `frontend-sveltekit/src/lib/components/`
- **API:** `frontend-sveltekit/src/routes/api/`
- **Есть ли админка:** да
  - Путь: `frontend-sveltekit/src/routes/(admin)/admin/`
  - Подход: Custom admin panel на SvelteKit (form actions, server-side)

## Три layout-группы

| Layout | Header | Footer | Используется |
|--------|--------|--------|-------------|
| **Public** | SiteHeader | SiteFooter | Главная, каталог, товар, корзина, checkout, журнал |
| **City (pSEO)** | CityHeader | CityFooter | Городские поддомены (`/city/{slug}/*`) |
| **Admin** | AdminSidebar | (нет) | Админ-панель (`/admin/*`) |

## Особенности

- Тёмная тема (переключатель в header)
- pSEO: городские подсайты с упрощённым layout
- Sticky header с коллапсом topbar при скролле
- Responsive: mobile-first, breakpoints 640/768/1024/1280px
- Навигация из БД (header-menu, footer секции)
- Контакты/соцсети из БД (site_config key-value)
- Корзина через Svelte store
- Callback-модалка вместо прямого звонка (переключается)
