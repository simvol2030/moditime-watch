# Session-13: Critical Bugfixes Session-12

> **Приоритет:** 🔴 CRITICAL (блокирует запуск на 100%)
> **Фокус:** Исправление 3 критичных багов из Session-12 QA validation
> **Задач:** 3 (phone icon + phone functionality + drag-and-drop)
> **Зависит от:** Session-12 (Communication & Admin UX)
> **Источник:** QA validation reports (session-12-v1)

---

## Контекст

После deploy Session-12 QA validation выявила **3 критичных бага** (score 27):
- Phone functionality не работает (icon missing, wrong click handler)
- Drag-and-drop не работает во всех 6 разделах админки

Эти баги **блокируют запуск проекта на 100%**, требуют отдельной сессии для исправления.

**QA Reports:**
- `/feedbacks/qa-reports/session-12-v1/tech-report.md`
- `/feedbacks/qa-reports/session-12-v1/ux-check.md`

---

## Критичные баги

### Bug 1: Phone icon отсутствует в CityHeader (mobile)

**Priority:** 🔴 CRITICAL
**Score:** 8
**Source:** Technical QA + UX QA (CRIT-1)

**Описание:**
Developer добавил phone icon в `SiteHeader.svelte`, но забыл добавить в `CityHeader.svelte`. В результате на city pages (например `/city/moscow`) пользователи на mobile НЕ видят телефон и не могут позвонить/заказать звонок.

**Где проверено:**
- URL: https://moditime-watch.ru/city/moscow
- Viewport: Mobile 375×812
- Результат: Phone icon отсутствует в header

**Что сейчас (CityHeader):**
```svelte
<!-- src/lib/components/layout/CityHeader.svelte -->
<header>
  <!-- Desktop -->
  <div class="desktop-header hidden md:flex">
    <Logo />
    <Badge>Часы в {city.name_prepositional}</Badge>
    <!-- Phone есть на desktop -->
  </div>

  <!-- Mobile -->
  <div class="mobile-header flex md:hidden">
    <Logo />
    <ThemeToggle />
    <!-- ❌ Phone icon ОТСУТСТВУЕТ -->
  </div>
</header>
```

**Что должно быть (аналогично SiteHeader):**
```svelte
<!-- Mobile -->
<div class="mobile-header flex md:hidden items-center justify-between gap-4 px-4">
  <Logo />

  <!-- ✅ Phone icon (добавить) -->
  {#if phoneMode === 'direct'}
    <a href="tel:{phoneNumber}" class="phone-icon-link">
      <PhoneIcon />
    </a>
  {:else}
    <button on:click={openCallbackModal} class="phone-icon-button">
      <PhoneIcon />
    </button>
  {/if}

  <ThemeToggle />
</div>

<!-- Callback modal -->
{#if phoneMode === 'callback'}
  <CallbackModal bind:open={callbackModalOpen} />
{/if}
```

**Реализация:**

**1. Добавить phone logic в CityHeader:**
```svelte
<!-- src/lib/components/layout/CityHeader.svelte -->
<script lang="ts">
  import { PhoneIcon } from 'lucide-svelte';
  import CallbackModal from '$lib/components/ui/CallbackModal.svelte';

  export let city;
  export let phoneMode: 'direct' | 'callback';
  export let phoneNumber: string;

  let callbackModalOpen = false;

  function openCallbackModal() {
    callbackModalOpen = true;
  }
</script>

<header>
  <!-- Desktop (уже есть телефон) -->
  <div class="desktop-header hidden md:flex">
    <!-- ... existing code ... -->
  </div>

  <!-- Mobile -->
  <div class="mobile-header flex md:hidden items-center justify-between gap-4 px-4">
    <Logo />

    <!-- Phone icon -->
    {#if phoneMode === 'direct'}
      <a href="tel:{phoneNumber}" class="text-primary hover:text-primary/80">
        <PhoneIcon class="h-6 w-6" />
      </a>
    {:else}
      <button on:click={openCallbackModal} class="text-primary hover:text-primary/80">
        <PhoneIcon class="h-6 w-6" />
      </button>
    {/if}

    <ThemeToggle />
  </div>
</header>

<!-- Callback modal (если режим callback) -->
{#if phoneMode === 'callback'}
  <CallbackModal bind:open={callbackModalOpen} />
{/if}
```

**2. Передать phoneMode и phoneNumber в CityHeader:**
```svelte
<!-- src/routes/(city)/city/[slug]/+page.svelte -->
<script>
  export let data;
  const { city, articles, phoneMode, phoneNumber } = data;
</script>

<CityHeader
  {city}
  {phoneMode}
  {phoneNumber}
/>
```

**3. Загрузить config в city layout:**
```typescript
// src/routes/(city)/city/[slug]/+layout.server.ts
export async function load({ params }) {
  // ... existing city loading ...

  const phoneMode = db.prepare(`SELECT value FROM site_config WHERE key = 'phone_mode'`).get()?.value || 'direct';
  const phoneNumber = db.prepare(`SELECT value FROM site_config WHERE key = 'phone_number'`).get()?.value || '+7 (999) 123-45-67';

  return {
    city,
    phoneMode,
    phoneNumber
  };
}
```

**Критерии успеха:**
- [ ] Phone icon виден на mobile в CityHeader (city pages)
- [ ] Direct mode: клик открывает tel: link
- [ ] Callback mode: клик открывает CallbackModal
- [ ] Styling идентичен SiteHeader

---

### Bug 2: Phone button открывает МЕНЮ вместо tel:/callback

**Priority:** 🔴 CRITICAL
**Score:** 9
**Source:** Technical QA + UX QA (CRIT-2)

**Описание:**
В `SiteHeader.svelte` phone button имеет **неправильный click handler**. Вместо того чтобы:
- В режиме "direct" → открывать tel: link
- В режиме "callback" → открывать CallbackModal

...он открывает боковое меню навигации или делает redirect на `/catalog`.

**Где проверено:**
- URL: https://moditime-watch.ru/ (homepage)
- Viewport: Mobile 375×812
- Config: `phone_mode = "direct"`
- Результат: Клик на phone icon → redirect на `/catalog` (НЕПРАВИЛЬНО)

**Что сейчас (проблема):**
```svelte
<!-- src/lib/components/layout/SiteHeader.svelte -->
<!-- Вероятно, phone button имеет неправильный handler -->
<button on:click={handleMenuToggle} class="phone-icon">
  <!-- ❌ Открывает меню вместо tel:/callback -->
  <PhoneIcon />
</button>
```

**Что должно быть:**

**1. Для direct mode (tel: link):**
```svelte
{#if phoneMode === 'direct'}
  <a
    href="tel:{phoneNumber}"
    class="text-primary hover:text-primary/80"
    aria-label="Позвонить"
  >
    <PhoneIcon class="h-6 w-6" />
  </a>
{/if}
```

**2. Для callback mode (modal):**
```svelte
{#if phoneMode === 'callback'}
  <button
    on:click={openCallbackModal}
    class="text-primary hover:text-primary/80"
    aria-label="Заказать звонок"
  >
    <PhoneIcon class="h-6 w-6" />
  </button>
{/if}
```

**Реализация:**

**Исправить SiteHeader.svelte:**
```svelte
<!-- src/lib/components/layout/SiteHeader.svelte -->
<script lang="ts">
  import { PhoneIcon } from 'lucide-svelte';
  import CallbackModal from '$lib/components/ui/CallbackModal.svelte';

  export let phoneMode: 'direct' | 'callback';
  export let phoneNumber: string;

  let callbackModalOpen = false;
  let mobileMenuOpen = false;

  function openCallbackModal() {
    callbackModalOpen = true;
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<header>
  <!-- Desktop (topbar with phone) -->
  <div class="topbar hidden md:flex">
    <!-- Existing topbar code -->
  </div>

  <!-- Mobile header -->
  <div class="mobile-header flex md:hidden items-center justify-between gap-4 px-4">
    <!-- Logo -->
    <Logo />

    <!-- Nav actions -->
    <div class="flex items-center gap-3">
      <!-- Phone icon (ИСПРАВИТЬ) -->
      {#if phoneMode === 'direct'}
        <a
          href="tel:{phoneNumber}"
          class="text-primary hover:text-primary/80"
          aria-label="Позвонить"
        >
          <PhoneIcon class="h-6 w-6" />
        </a>
      {:else if phoneMode === 'callback'}
        <button
          on:click={openCallbackModal}
          class="text-primary hover:text-primary/80"
          aria-label="Заказать звонок"
        >
          <PhoneIcon class="h-6 w-6" />
        </button>
      {/if}

      <!-- Mobile menu toggle (ОТДЕЛЬНАЯ КНОПКА) -->
      <button
        on:click={toggleMobileMenu}
        class="text-foreground hover:text-primary"
        aria-label="Меню"
      >
        <MenuIcon class="h-6 w-6" />
      </button>
    </div>
  </div>
</header>

<!-- Callback modal -->
{#if phoneMode === 'callback'}
  <CallbackModal bind:open={callbackModalOpen} />
{/if}

<!-- Mobile menu -->
{#if mobileMenuOpen}
  <MobileMenu bind:open={mobileMenuOpen} />
{/if}
```

**Ключевые изменения:**
1. **Phone button:** НЕ должен вызывать `toggleMobileMenu()` или любой другой handler кроме tel: link / callback modal
2. **Menu button:** Должна быть ОТДЕЛЬНАЯ кнопка (MenuIcon) для открытия меню
3. **Conditional render:** `{#if phoneMode === 'direct'}` → `<a href="tel:...">`, `{:else if phoneMode === 'callback'}` → `<button on:click={openCallbackModal}>`

**Критерии успеха:**
- [ ] Direct mode: клик на phone icon → открывается приложение для звонка (tel: link)
- [ ] Callback mode: клик на phone icon → открывается CallbackModal
- [ ] Phone button НЕ открывает меню навигации
- [ ] Phone button НЕ делает redirect на /catalog
- [ ] Menu button отдельная, работает корректно

---

### Bug 3: Drag-and-drop НЕ работает во всех 6 разделах админки

**Priority:** 🔴 CRITICAL
**Score:** 10
**Source:** Technical QA (CRIT-3)

**Описание:**
Кнопка "Reorder" присутствует во всех 6 разделах админки (Navigation, Footer sections/links, Collections, Brands, Categories, Testimonials), но **не активирует drag-and-drop mode**:
- No grab handles (≡)
- Элементы нельзя перетащить
- Визуально ничего не меняется после клика "Reorder"

**Где проверено:**
- URL: https://moditime-watch.ru/admin/system/navigation (и 5 других)
- Viewport: Desktop 1920×1080
- Результат: "Reorder" button не работает, drag mode не активируется

**Возможные причины:**

**Причина 1: `svelte-dnd-action` не установлен или неправильно импортирован**
```bash
# Проверить:
npm list svelte-dnd-action
# Если нет → установить:
npm install svelte-dnd-action
```

**Причина 2: DragDropList.svelte имеет ошибки**
```svelte
<!-- src/lib/components/admin/DragDropList.svelte -->
<script lang="ts">
  // ❌ Неправильный импорт?
  import { dndzone } from 'svelte-dnd-action';
  // ✅ Правильный импорт:
  import { dndzone } from 'svelte-dnd-action';

  export let items: Array<{ id: number; [key: string]: any }>;
  export let onReorder: (newOrder: typeof items) => void;

  let dragDisabled = false;
</script>
```

**Причина 3: use:dndzone не применён корректно**
```svelte
<!-- DragDropList.svelte -->
<div
  use:dndzone={{ items, flipDurationMs: 200, dragDisabled }}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
  class="space-y-2"
>
  {#each items as item (item.id)}
    <div animate:flip={{ duration: 200 }} class="drag-item">
      <!-- Grab handle -->
      <div class="drag-handle">
        <GripVerticalIcon />
      </div>

      <!-- Slot -->
      <slot {item} />
    </div>
  {/each}
</div>
```

**Причина 4: dragDisabled остаётся true**
```svelte
<!-- Admin page -->
<script>
  let reorderMode = false;

  function toggleReorder() {
    reorderMode = !reorderMode;
    // ❌ Если dragDisabled НЕ обновляется → drag mode не активируется
  }
</script>

<Button on:click={toggleReorder}>
  {reorderMode ? 'Save Order' : 'Reorder'}
</Button>

<DragDropList
  {items}
  onReorder={handleReorder}
  dragDisabled={!reorderMode}  <!-- ✅ Передать правильный state -->
/>
```

**Реализация:**

**Шаг 1: Проверить установку svelte-dnd-action**
```bash
cd frontend-sveltekit
npm list svelte-dnd-action
# Если нет:
npm install svelte-dnd-action
```

**Шаг 2: Исправить DragDropList.svelte**

Проверить/исправить компонент:
```svelte
<!-- src/lib/components/admin/DragDropList.svelte -->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import { GripVertical } from 'lucide-svelte';

  export let items: Array<{ id: number; [key: string]: any }>;
  export let onReorder: (newOrder: typeof items) => void;
  export let dragDisabled = false;  // ✅ Default false for testing

  function handleDndConsider(e: CustomEvent) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent) {
    items = e.detail.items;

    // Update order in DB
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
      class="drag-item flex items-center gap-4 p-4 bg-card rounded-lg border cursor-move hover:border-primary transition-colors"
      class:opacity-50={dragDisabled}
    >
      <!-- Grab handle (visible ALWAYS for testing, later: only when !dragDisabled) -->
      <div class="drag-handle text-muted-foreground">
        <GripVertical class="h-5 w-5" />
      </div>

      <div class="flex-1">
        <slot {item} />
      </div>
    </div>
  {/each}
</div>
```

**Шаг 3: Исправить admin page (Navigation пример)**

```svelte
<!-- src/routes/(admin)/admin/system/navigation/+page.svelte -->
<script lang="ts">
  import DragDropList from '$lib/components/admin/DragDropList.svelte';
  import { Button } from '$lib/components/ui';

  export let data;
  let navigationItems = data.navigation;

  let reorderMode = false;

  function toggleReorder() {
    reorderMode = !reorderMode;
  }

  async function handleReorder(newOrder: Array<{ id: number; order: number }>) {
    const res = await fetch('/api/navigation/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: newOrder })
    });

    if (res.ok) {
      console.log('✅ Order updated');
    } else {
      console.error('❌ Failed to update order');
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1>Navigation</h1>

    <Button on:click={toggleReorder}>
      {reorderMode ? 'Save Order' : 'Reorder'}
    </Button>
  </div>

  <!-- DragDropList -->
  <DragDropList
    items={navigationItems}
    onReorder={handleReorder}
    dragDisabled={!reorderMode}
    let:item
  >
    <div>
      <h3 class="font-medium">{item.title}</h3>
      <p class="text-sm text-muted-foreground">{item.url}</p>
    </div>
  </DragDropList>
</div>
```

**Ключевые моменты:**
1. **dragDisabled prop:** Должен правильно передаваться в DragDropList (`dragDisabled={!reorderMode}`)
2. **Reorder button:** Toggle между "Reorder" и "Save Order" state
3. **Grab handles:** Должны быть видны (GripVertical icon)
4. **Cursor:** `cursor-move` когда drag enabled

**Шаг 4: Применить fix во всех 6 разделах**

Повторить fix для:
- `/admin/system/navigation` — ✅
- `/admin/system/footer` (sections) — TODO
- `/admin/system/footer` (links) — TODO
- `/admin/content/collections` — TODO
- `/admin/content/brands` — TODO
- `/admin/content/categories` — TODO
- `/admin/content/testimonials` — TODO

**Критерии успеха:**
- [ ] `svelte-dnd-action` установлен и корректно импортирован
- [ ] DragDropList.svelte работает (grab handles видны)
- [ ] Кнопка "Reorder" активирует drag mode
- [ ] Элементы можно перетаскивать (cursor-move, drag animation)
- [ ] После drop → order сохраняется в БД (PUT /api/.../reorder)
- [ ] Reload страницы → новый order сохранён
- [ ] Работает во всех 6 разделах админки
- [ ] No order conflicts (каждый элемент имеет уникальный order)

---

## Проверки (для CLI перед созданием PR)

**Код:**
- [ ] `npm run build` — frontend без ошибок
- [ ] `npm list svelte-dnd-action` — dependency установлена
- [ ] TypeScript типы корректны

**Phone functionality (Desktop + Mobile):**
- [ ] Phone icon виден в CityHeader mobile (city pages)
- [ ] Phone icon виден в SiteHeader mobile (main pages)
- [ ] Direct mode: tel: link работает (opens phone app)
- [ ] Callback mode: modal открывается
- [ ] Phone button НЕ открывает меню
- [ ] Phone button НЕ делает redirect на /catalog

**Drag-and-drop (Desktop):**
- [ ] "Reorder" button активирует drag mode
- [ ] Grab handles (≡) появляются
- [ ] Cursor меняется на move
- [ ] Можно перетаскивать элементы
- [ ] After drop → order saves to DB
- [ ] Reload → order persists
- [ ] Работает во всех 6 разделах:
  - [ ] Navigation
  - [ ] Footer Sections
  - [ ] Footer Links
  - [ ] Collections
  - [ ] Brands
  - [ ] Categories
  - [ ] Testimonials

---

## Чек-лист для субагентов (на проверку Session-13)

**Technical QA:**
- [ ] Phone icon present в CityHeader (mobile)
- [ ] Phone icon present в SiteHeader (mobile)
- [ ] Phone direct mode: tel: link works
- [ ] Phone callback mode: modal opens, form submits, notification sent
- [ ] Phone button НЕ открывает меню/НЕ делает redirect
- [ ] Drag-and-drop: "Reorder" activates drag mode
- [ ] Drag-and-drop: можно перетащить элементы
- [ ] Drag-and-drop: order saves to DB
- [ ] Drag-and-drop: works in all 6 admin sections

**UX QA:**
- [ ] Phone icon visible на mobile (both headers)
- [ ] Phone icon adequate size for tap
- [ ] Phone direct mode: opens phone app smoothly
- [ ] Phone callback mode: modal UX correct (form, validation, success state)
- [ ] Drag-and-drop: grab handles visible
- [ ] Drag-and-drop: cursor changes to move
- [ ] Drag-and-drop: animation smooth (200ms flip)
- [ ] Drag-and-drop: no visual glitches

---

## Оценка

**Сложность:** Средняя
**Файлов:** ~5-7 файлов
- CityHeader: добавить phone icon + CallbackModal
- SiteHeader: исправить phone click handler
- DragDropList: исправить dragDisabled logic
- 6 admin pages: проверить/исправить dragDisabled prop

**Время:** ~2-3 часа (Developer)

**Риски:**
- LOW: Bug 1-2 (phone) — straightforward fixes
- MEDIUM: Bug 3 (drag-and-drop) — нужно найти root cause (svelte-dnd-action setup или dragDisabled state)

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Developer (Claude Code Web)
**Приоритет:** 🔴 CRITICAL — блокирует запуск проекта на 100%
**QA Reports:** `/feedbacks/qa-reports/session-12-v1/tech-report.md`, `/feedbacks/qa-reports/session-12-v1/ux-check.md`
