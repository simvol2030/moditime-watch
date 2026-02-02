# Session-12: Communication & Admin UX Improvements

> **Приоритет:** 🟡 MEDIUM PRIORITY
> **Фокус:** Telegram концепция, phone functionality, drag-and-drop UX
> **Задач:** 3 (одна масштабная)
> **Зависит от:** Session-5 (Notifications), Session-2 (Admin Panel)
> **Источник:** QA validation reports + Moderator feedback

---

## Контекст

Последняя сессия bugfixes после Session-8 QA validation. Фокус на:

1. **Изменение концепции Telegram** — убрать iframe widget, заменить на ссылку + админка
2. **Phone functionality upgrade** — mobile visibility + новый функционал (телефон/форма обратного звонка)
3. **Admin UX improvement** — drag-and-drop для приоритетов вместо ручного ввода

Эти задачи **не критичны**, но улучшают коммуникацию с клиентами и UX админки.

---

## Задачи

### Task 1: Убрать Telegram iframe → ссылка + админка управление
**Priority:** 🟡 MEDIUM
**Source:** Technical QA (MEDIUM-2 / WARN-2) + Moderator feedback
**Roadmap ref:** Session-5 (Notifications), изменение концепции

**Описание:**
Catalog page (и возможно другие страницы) показывают CSP violation для Telegram iframe:
```
[ERROR] Framing 'https://t.me/' violates the following CSP directive has been blocked.
```

**Изменение концепции (Moderator):**
> "Мы не будем вставлять виджет как виджет, что прямо Telegram встроен. Просто будем давать ссылку на Telegram-группу. Поэтому поменяем концепцию."

**Telegram группа:** `t.me/moditime_watch`

**Что сейчас:**
```svelte
<!-- Где-то в Footer/CatalogPage -->
<iframe src="https://t.me/moditime_watch_widget" ...></iframe>
<!-- CSP блокирует iframe -->
```

**Что должно быть:**
```svelte
<a href="https://t.me/moditime_watch" target="_blank" class="telegram-link">
  <TelegramIcon />
  Присоединиться к нашей группе в Telegram
</a>
```

**Дополнительное требование (Moderator):**
> "Чтобы была возможность менять в админке, отключать отображение этой ссылки на Telegram-группу. Чтобы была какая-то возможность — нужно посмотреть, подумать."

**Реализация:**

**Часть A: Убрать iframe, заменить на ссылку**

**1. Найти все места с Telegram iframe:**
```bash
grep -r "t.me" src/
grep -r "telegram" src/ -i
# Вероятные места:
# - Footer.svelte
# - CatalogPage (+page.svelte)
# - Возможно Hero.svelte
```

**2. Заменить iframe на ссылку:**
```svelte
<!-- src/lib/components/layout/Footer.svelte -->
<script>
  export let data; // config from root layout
</script>

<footer>
  <!-- ... другие секции ... -->

  {#if data.config.telegram_enabled}
    <div class="telegram-section">
      <h3>Присоединяйтесь к нам</h3>
      <a
        href={data.config.telegram_url || 'https://t.me/moditime_watch'}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 text-primary hover:underline"
      >
        <svg class="w-6 h-6"><!-- Telegram icon --></svg>
        Telegram группа
      </a>
    </div>
  {/if}
</footer>
```

**Часть B: Админка для управления Telegram ссылкой**

**1. Добавить поля в таблицу config:**
```sql
-- migrations/007-telegram-config.sql
INSERT OR REPLACE INTO config (key, value, type, category) VALUES
  ('telegram_enabled', 'true', 'boolean', 'communication'),
  ('telegram_url', 'https://t.me/moditime_watch', 'string', 'communication'),
  ('telegram_label', 'Telegram группа', 'string', 'communication');
```

**2. Backend endpoint для обновления:**
```typescript
// backend-expressjs/src/routes/config.ts
router.put('/config/telegram', async (req, res) => {
  const { enabled, url, label } = req.body;

  db.prepare(`UPDATE config SET value = ? WHERE key = 'telegram_enabled'`).run(enabled);
  db.prepare(`UPDATE config SET value = ? WHERE key = 'telegram_url'`).run(url);
  db.prepare(`UPDATE config SET value = ? WHERE key = 'telegram_label'`).run(label);

  res.json({ success: true });
});
```

**3. Frontend admin UI:**
```svelte
<!-- src/routes/(admin)/admin/system/settings/+page.svelte -->
<section>
  <h2>Telegram интеграция</h2>

  <label>
    <input
      type="checkbox"
      bind:checked={telegramEnabled}
    />
    Показывать ссылку на Telegram группу
  </label>

  {#if telegramEnabled}
    <div class="space-y-4">
      <div>
        <label>URL группы</label>
        <Input
          type="url"
          bind:value={telegramUrl}
          placeholder="https://t.me/moditime_watch"
        />
      </div>

      <div>
        <label>Текст ссылки</label>
        <Input
          type="text"
          bind:value={telegramLabel}
          placeholder="Telegram группа"
        />
      </div>
    </div>
  {/if}

  <Button on:click={saveTelegramConfig}>Сохранить</Button>
</section>
```

**4. Загрузка config в root layout:**
```typescript
// src/routes/+layout.server.ts
export async function load() {
  const config = {
    telegram_enabled: db.prepare(`SELECT value FROM config WHERE key = 'telegram_enabled'`).get().value === 'true',
    telegram_url: db.prepare(`SELECT value FROM config WHERE key = 'telegram_url'`).get().value,
    telegram_label: db.prepare(`SELECT value FROM config WHERE key = 'telegram_label'`).get().value,
    // ... другие config
  };

  return { config };
}
```

**Критерии успеха:**
- [ ] No CSP violation для Telegram
- [ ] Ссылка на Telegram группу работает (opens t.me/moditime_watch)
- [ ] Админка `/admin/system/settings` имеет раздел "Telegram интеграция"
- [ ] Можно включить/выключить отображение ссылки
- [ ] Можно изменить URL и текст ссылки
- [ ] Изменения сохраняются и применяются на фронтенде

---

### Task 2: Phone mobile visibility + функционал телефон/форма обратного звонка
**Priority:** 🟡 MEDIUM (но требует нового функционала)
**Source:** UX QA (MEDIUM-8 / MINOR-1) + Moderator feedback
**Roadmap ref:** Session-8 Task 2 (CityHeader), новый функционал

**Описание:**
Phone number не виден на mobile в CityHeader.

**Комментарий Moderator (БОЛЬШОЕ ДОПОЛНЕНИЕ):**
> "Отображать иконку телефона → клик → запуск звонка. **НОВЫЙ ФУНКЦИОНАЛ:** В админке возможность переключить режим:
> - Режим 1: Иконка телефона → звонок
> - Режим 2: Иконка → popup форма обратного звонка (пользователь вводит номер, сообщение приходит на email + Telegram)
> Настройка должна работать одновременно в header И footer. Админка: где-то в настройках магазина."

**Что сейчас:**
```svelte
<!-- CityHeader mobile -->
<div class="mobile-header">
  <Logo />
  <ThemeToggle />
  <!-- Телефон ОТСУТСТВУЕТ -->
</div>
```

**Что должно быть (два режима):**

**Режим 1: Прямой звонок**
```svelte
<a href="tel:+79991234567" class="phone-icon">
  <PhoneIcon />
</a>
```

**Режим 2: Форма обратного звонка**
```svelte
<button on:click={openCallbackForm} class="phone-icon">
  <PhoneIcon />
</button>

<CallbackModal bind:open={callbackModalOpen} />
```

**Реализация:**

**Часть A: Mobile phone visibility в CityHeader**

```svelte
<!-- src/lib/components/layout/CityHeader.svelte -->
<script>
  export let city;
  export let config; // phone settings

  let callbackModalOpen = false;

  function handlePhoneClick() {
    if (config.phone_mode === 'direct') {
      // Ничего не делать, href="tel:..." сработает
      return;
    } else if (config.phone_mode === 'callback') {
      callbackModalOpen = true;
    }
  }
</script>

<header>
  <!-- Desktop -->
  <div class="desktop-header hidden md:flex">
    <Logo />
    <Badge>Часы в {city.name_prepositional}</Badge>
    {#if config.phone_mode === 'direct'}
      <a href="tel:{config.phone}" class="phone-link">
        <PhoneIcon />
        {config.phone}
      </a>
    {:else}
      <button on:click={handlePhoneClick} class="phone-button">
        <PhoneIcon />
        Заказать звонок
      </button>
    {/if}
  </div>

  <!-- Mobile -->
  <div class="mobile-header flex md:hidden">
    <Logo />
    {#if config.phone_mode === 'direct'}
      <a href="tel:{config.phone}" class="phone-icon">
        <PhoneIcon />
      </a>
    {:else}
      <button on:click={handlePhoneClick} class="phone-icon">
        <PhoneIcon />
      </button>
    {/if}
    <ThemeToggle />
  </div>
</header>

{#if config.phone_mode === 'callback'}
  <CallbackModal bind:open={callbackModalOpen} />
{/if}
```

**Часть B: CallbackModal компонент**

```svelte
<!-- src/lib/components/modals/CallbackModal.svelte -->
<script>
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui';
  import { Input, Button } from '$lib/components/ui';

  export let open = false;

  let phone = '';
  let name = '';
  let loading = false;

  async function submitCallback() {
    loading = true;

    const res = await fetch('/api/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name })
    });

    if (res.ok) {
      alert('Спасибо! Мы перезвоним вам в ближайшее время.');
      open = false;
      phone = '';
      name = '';
    } else {
      alert('Ошибка. Попробуйте позже.');
    }

    loading = false;
  }
</script>

<Dialog bind:open>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Заказать обратный звонок</DialogTitle>
    </DialogHeader>

    <form on:submit|preventDefault={submitCallback} class="space-y-4">
      <div>
        <label>Ваше имя</label>
        <Input bind:value={name} required />
      </div>

      <div>
        <label>Ваш телефон</label>
        <Input
          type="tel"
          bind:value={phone}
          placeholder="+7 (999) 123-45-67"
          required
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Отправка...' : 'Заказать звонок'}
      </Button>
    </form>
  </DialogContent>
</Dialog>
```

**Часть C: Backend endpoint для обратного звонка**

```typescript
// backend-expressjs/src/routes/callback.ts
import { sendEmail } from '../services/email';
import { sendTelegramNotification } from '../services/telegram';

router.post('/callback', async (req, res) => {
  const { phone, name } = req.body;

  if (!phone || !name) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Save to DB (optional)
  db.prepare(`
    INSERT INTO callback_requests (name, phone, created_at)
    VALUES (?, ?, datetime('now'))
  `).run(name, phone);

  // Send email
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'Новый запрос на обратный звонок',
    text: `Имя: ${name}\nТелефон: ${phone}`
  });

  // Send Telegram
  await sendTelegramNotification(
    `🔔 Новый запрос на звонок:\n👤 ${name}\n📞 ${phone}`
  );

  res.json({ success: true });
});
```

**Часть D: Админка для настройки phone mode**

```svelte
<!-- src/routes/(admin)/admin/system/settings/+page.svelte -->
<section>
  <h2>Настройки телефона</h2>

  <div>
    <label>Телефон</label>
    <Input
      type="tel"
      bind:value={phoneNumber}
      placeholder="+7 (999) 123-45-67"
    />
  </div>

  <div>
    <label>Режим работы</label>
    <select bind:value={phoneMode}>
      <option value="direct">Прямой звонок</option>
      <option value="callback">Форма обратного звонка</option>
    </select>
  </div>

  <p class="text-sm text-muted-foreground">
    {#if phoneMode === 'direct'}
      При клике на телефон откроется приложение для звонка
    {:else}
      При клике на телефон откроется форма для заказа обратного звонка
    {/if}
  </p>

  <Button on:click={savePhoneConfig}>Сохранить</Button>
</section>
```

**Часть E: Config в БД**

```sql
INSERT OR REPLACE INTO config (key, value, type, category) VALUES
  ('phone_mode', 'direct', 'string', 'communication'),
  ('phone_number', '+7 (999) 123-45-67', 'string', 'communication');
```

**Часть F: Применить в Footer**

Аналогично CityHeader, в Footer.svelte тоже должен быть телефон с двумя режимами.

**Критерии успеха:**
- [ ] Mobile CityHeader показывает phone icon
- [ ] Mobile Footer показывает phone icon
- [ ] Режим "Прямой звонок" → клик открывает tel: link
- [ ] Режим "Форма обратного звонка" → клик открывает modal
- [ ] Callback form отправляет данные на backend
- [ ] Backend отправляет email + Telegram уведомление
- [ ] Админка позволяет переключить режим
- [ ] Работает в header И footer одновременно

---

### Task 3: Drag-and-drop для приоритетов во всех разделах админки
**Priority:** 🟡 MEDIUM (но масштабная задача)
**Source:** Moderator feedback (FUNC-1 / NEW-3)
**Roadmap ref:** Session-2 (Admin Panel), Session-4 (Navigation), общее улучшение UX

**Описание:**
В админке есть несколько разделов, где приоритет/порядок элементов задаётся вручную числами (1, 2, 3...). Это создаёт проблемы:
- Конфликты (два элемента с одинаковым приоритетом)
- Неудобство (нужно помнить номера и переставлять вручную)
- Баги (если два элемента имеют order = 4 → система виснет)

**Комментарий Moderator:**
> "Найти везде, где используются приоритеты, исправить во всех разделах. Задавать вручную = конфликт, неудобно. Хорошо бы drag-and-drop."

**Разделы, где используются приоритеты:**
1. **Navigation items** (`navigation` table, `order` field) — Session-4
2. **Menu items** (если есть) — Session-2
3. **Collections** (если есть `display_order`) — Session-2
4. **Categories** (если есть `sort_order`) — Session-2
5. **Footer links** (если есть `order`) — Session-4
6. **Возможно City Article Categories** — Session-7

**Реализация:**

**Шаг 1: Найти все таблицы с priority/order полями**

```bash
ssh moditime-server
sqlite3 /opt/websites/moditime-watch.ru/repo/data/db/sqlite/app.db

# Найти таблицы с order/priority полями
.schema | grep -E "(order|priority|sort_order)"

# Вероятные таблицы:
# - navigation (order)
# - collections (display_order?)
# - categories (sort_order?)
# - footer_links (order?)
# - city_article_categories (order?)
```

**Шаг 2: Создать универсальный DragDropList компонент**

```svelte
<!-- src/lib/components/admin/DragDropList.svelte -->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';

  export let items: Array<{ id: number; [key: string]: any }>;
  export let onReorder: (newOrder: typeof items) => void;

  let dragDisabled = false;

  function handleDndConsider(e: CustomEvent) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent) {
    items = e.detail.items;

    // Update order в БД
    const newOrder = items.map((item, index) => ({
      id: item.id,
      order: index + 1
    }));

    onReorder(newOrder);
  }
</script>

<div
  use:dndzone={{ items, flipDurationMs: 200, dragDisabled }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
  class="space-y-2"
>
  {#each items as item (item.id)}
    <div
      animate:flip={{ duration: 200 }}
      class="drag-item flex items-center gap-4 p-4 bg-card rounded-lg border cursor-move"
    >
      <div class="drag-handle">
        <GripVerticalIcon />
      </div>

      <div class="flex-1">
        <slot {item} />
      </div>
    </div>
  {/each}
</div>

<style>
  .drag-item:hover {
    border-color: var(--primary);
  }
</style>
```

**Шаг 3: Использовать в Navigation CRUD**

```svelte
<!-- src/routes/(admin)/admin/system/navigation/+page.svelte -->
<script>
  import DragDropList from '$lib/components/admin/DragDropList.svelte';

  export let data;

  let navigationItems = data.navigation;

  async function handleReorder(newOrder: Array<{ id: number; order: number }>) {
    const res = await fetch('/api/navigation/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newOrder })
    });

    if (res.ok) {
      // Success feedback
      console.log('Order updated');
    }
  }
</script>

<DragDropList
  items={navigationItems}
  onReorder={handleReorder}
  let:item
>
  <div>
    <h3>{item.title}</h3>
    <p>{item.url}</p>
  </div>
</DragDropList>
```

**Шаг 4: Backend endpoint для reorder**

```typescript
// backend-expressjs/src/routes/navigation.ts
router.put('/navigation/reorder', async (req, res) => {
  const { items } = req.body; // [{ id: 1, order: 1 }, { id: 2, order: 2 }, ...]

  db.transaction(() => {
    items.forEach((item: { id: number; order: number }) => {
      db.prepare(`
        UPDATE navigation SET "order" = ? WHERE id = ?
      `).run(item.order, item.id);
    });
  })();

  res.json({ success: true });
});
```

**Шаг 5: Применить во всех разделах**

Повторить шаги 3-4 для:
- Collections (`/admin/content/collections`)
- Categories (`/admin/content/categories`)
- Footer links (`/admin/system/footer`)
- City Article Categories (`/admin/pseo/categories`)

**Шаг 6: Убрать ручной ввод order**

В формах создания/редактирования убрать поле "Order":
```svelte
<!-- БЫЛО: -->
<Input type="number" label="Order" bind:value={item.order} />

<!-- СТАЛО: -->
<!-- Поле order убрано, определяется через drag-and-drop -->
```

**Критерии успеха:**
- [ ] Во всех разделах с приоритетами есть drag-and-drop интерфейс
- [ ] Можно перетаскивать элементы для изменения порядка
- [ ] После перетаскивания order сохраняется в БД
- [ ] No конфликтов order (каждый элемент имеет уникальный order)
- [ ] Ручной ввод order убран из форм
- [ ] Работает во всех разделах:
  - [ ] Navigation
  - [ ] Collections (если применимо)
  - [ ] Categories (если применимо)
  - [ ] Footer links (если применимо)
  - [ ] City Article Categories (если применимо)

**Примечание:** Для drag-and-drop использовать библиотеку `svelte-dnd-action`:
```bash
npm install svelte-dnd-action
```

---

## Проверки (для CLI перед созданием PR)

**Код:**
- [ ] `npm run build` — frontend без ошибок
- [ ] `npm install svelte-dnd-action` — dependency добавлена
- [ ] TypeScript типы корректны

**Communication (Desktop + Mobile):**
- [ ] No CSP violation для Telegram
- [ ] Telegram link работает (opens t.me/moditime_watch)
- [ ] Phone icon виден на mobile (CityHeader + Footer)
- [ ] Phone режим "direct" → tel: link работает
- [ ] Phone режим "callback" → modal открывается
- [ ] Callback form отправляет данные → email + Telegram notification

**Admin UX (Desktop):**
- [ ] Админка Telegram settings работает (enable/disable, change URL)
- [ ] Админка Phone settings работает (mode switch, change number)
- [ ] Drag-and-drop работает в Navigation
- [ ] Drag-and-drop работает во всех разделах с order
- [ ] No order conflicts после reorder

---

## Чек-лист для субагентов (на проверку Session-12)

**Technical QA:**
- [ ] Verify no CSP violation for Telegram
- [ ] Verify callback form submits successfully
- [ ] Verify callback notification arrives (email + Telegram)
- [ ] Check console: no errors

**UX QA:**
- [ ] Telegram link works (opens t.me group)
- [ ] Phone icon visible on mobile (CityHeader + Footer)
- [ ] Phone direct mode works (tel: link)
- [ ] Phone callback mode works (modal opens, form submits)
- [ ] Drag-and-drop in admin works smoothly (navigation, categories, etc.)

---

## Оценка

**Сложность:** Средняя-Высокая (Task 3 масштабная)
**Файлов:** ~12 файлов
- Telegram: Footer, config, admin UI
- Phone: CityHeader, Footer, CallbackModal, backend endpoint
- Drag-and-drop: DragDropList component + 5-6 admin pages

**Время:** ~4-5 часов (Developer)

**Риски:**
- MEDIUM: Task 3 (drag-and-drop) — нужно найти все места с order, может затронуть много разделов
- LOW: Task 1-2 — стандартные задачи

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Developer (Claude Code Web)
**Приоритет:** 🟡 MEDIUM — улучшения UX и коммуникации, но не блокируют основной функционал
