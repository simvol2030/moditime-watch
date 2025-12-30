# Task: SEO-оптимизация навигации для поддоменов

**Дата:** 2024-12-30
**Branch to create:** `claude/seo-navigation-v1`
**Score:** 10 (БД + компоненты + логика)

---

## Контекст

У нас 102 региональных поддомена (`moscow.moditime-watch.ru`, `vladivostok.moditime-watch.ru` и т.д.) для pSEO.

**Текущая проблема:**
- Ссылки в Header/Footer относительные (`/about`, `/catalog`)
- На поддоменах это создаёт дублированный контент (102 копии `/about`)
- Часть ссылок захардкожена в компонентах (`/privacy`, `/terms`)

**Уже сделано CLI (Integrator):**
- 301 редиректы для `/catalog`, `/product/*`, `/cart`, `/checkout`, `/search` с поддоменов на главный домен
- Это страховка, но не оптимально для SEO (теряется link juice)

---

## Требования

### 1. Единый layout для всех поддоменов

> **ВАЖНО:** Один layout должен работать на всех 102 поддоменах + главном домене.
> НЕ создавать отдельные layouts/компоненты для поддоменов!

Layout определяет куда вести ссылку на основе данных из БД, а не на основе текущего домена.

### 2. Поле `is_main_domain_only` в БД

```sql
ALTER TABLE navigation_items ADD COLUMN is_main_domain_only INTEGER DEFAULT 0;
```

| is_main_domain_only | Поведение |
|---------------------|-----------|
| 0 | Относительная ссылка (остаётся на текущем домене) |
| 1 | Абсолютная ссылка на `https://moditime-watch.ru{href}` |

### 3. Какие ссылки должны вести на главный домен

| href | is_main_domain_only | Причина |
|------|---------------------|---------|
| `/catalog` | 1 | Единый каталог товаров |
| `/search` | 1 | Единый поиск |
| `/cart` | 1 | Единая корзина |
| `/about` | 1 | Статическая страница |
| `/delivery` | 1 | Статическая страница |
| `/warranty` | 1 | Статическая страница |
| `/contacts` | 1 | Статическая страница |
| `/journal` | 1 | Общий журнал |
| `/privacy` | 1 | Юридическая страница |
| `/terms` | 1 | Юридическая страница |

### 4. Какие ссылки остаются относительными

| href | is_main_domain_only | Причина |
|------|---------------------|---------|
| `/` | 0 | На поддомене показывает landing города |
| `/city/{slug}/*` | 0 | pSEO статьи для города |

---

## Файлы для изменения

### 1. Миграция БД
**Файл:** `data/migrations/add-is-main-domain-only.sql` (создать)

```sql
ALTER TABLE navigation_items ADD COLUMN is_main_domain_only INTEGER DEFAULT 0;

-- Установить флаг для ссылок на главный домен
UPDATE navigation_items SET is_main_domain_only = 1
WHERE href IN ('/catalog', '/search', '/about', '/delivery', '/warranty', '/contacts', '/journal');
```

### 2. Схема БД
**Файл:** `schema.sql`
- Добавить поле `is_main_domain_only INTEGER DEFAULT 0` в `CREATE TABLE navigation_items`

### 3. Инициализация БД
**Файл:** `frontend-sveltekit/src/lib/server/db/database.ts`
- Обновить seed данные navigation_items с новым полем
- Добавить `/privacy` и `/terms` в БД (убрать из хардкода)

### 4. Типы TypeScript
**Файл:** `frontend-sveltekit/src/lib/types/navigation.ts`
- Добавить `is_main_domain_only?: boolean` в интерфейс

### 5. Компоненты Footer
**Файл:** `frontend-sveltekit/src/lib/components/layout/SiteFooter.svelte`
- Генерировать абсолютный URL если `is_main_domain_only = 1`
- Убрать захардкоженные `/privacy`, `/terms` (перенести в БД)

### 6. Компоненты Header (если есть ссылки)
**Файлы:**
- `frontend-sveltekit/src/lib/components/layout/SiteHeader.svelte`
- `frontend-sveltekit/src/lib/components/header/DesktopNav.svelte`
- `frontend-sveltekit/src/lib/components/header/MobileNav.svelte`

### 7. Layout (если передаёт данные)
**Файл:** `frontend-sveltekit/src/routes/+layout.server.ts`
- Убедиться что `is_main_domain_only` передаётся в компоненты

---

## Логика генерации URL

```typescript
// Утилита для генерации URL
function getNavigationHref(link: { href: string; is_main_domain_only?: boolean }): string {
  if (link.is_main_domain_only) {
    return `https://moditime-watch.ru${link.href}`;
  }
  return link.href;
}
```

В компоненте:
```svelte
{#each links as link}
  <a href={getNavigationHref(link)}>{link.label}</a>
{/each}
```

---

## Тестирование

После реализации проверить:

1. **На главном домене** (`moditime-watch.ru`):
   - Все ссылки работают
   - Ссылки с `is_main_domain_only=1` ведут на `moditime-watch.ru/*`

2. **На поддомене** (`vladivostok.moditime-watch.ru`):
   - Логотип `/` остаётся на поддомене
   - `/catalog` ведёт на `https://moditime-watch.ru/catalog` (абсолютная ссылка, НЕ редирект)
   - `/about` ведёт на `https://moditime-watch.ru/about`

3. **В View Source** проверить что в HTML абсолютные URL:
   ```html
   <a href="https://moditime-watch.ru/catalog">Каталог</a>
   ```

---

## Критерии приёмки

- [ ] Поле `is_main_domain_only` добавлено в БД
- [ ] Seed данные обновлены с правильными флагами
- [ ] Footer генерирует абсолютные URL для `is_main_domain_only=1`
- [ ] `/privacy` и `/terms` перенесены из хардкода в БД
- [ ] На поддоменах ссылки ведут напрямую на главный домен (без 301 редиректа)
- [ ] TypeScript типы обновлены
- [ ] Один layout работает на всех доменах (нет дублирования кода)

---

## Примечания

- **НЕ трогать** редиректы в `hooks.server.ts` — они остаются как страховка
- **НЕ создавать** отдельные компоненты для поддоменов
- Всё управление — через БД и админку
