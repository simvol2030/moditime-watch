# Developer Prompt: Session-13 (Critical Bugfixes Session-12)

> **Приоритет:** 🔴 CRITICAL — блокирует запуск проекта на 100%

---

## 🚨 Контекст

Session-12 был реализован и задеплоен, но **QA validation выявила 3 критичных бага** (total score 27):

**Bug 1 (score 8):** Phone icon ОТСУТСТВУЕТ в CityHeader (mobile)
**Bug 2 (score 9):** Phone button открывает меню вместо tel:/callback
**Bug 3 (score 10):** Drag-and-drop НЕ работает во всех 6 разделах админки

Эти баги **блокируют запуск** — phone functionality и drag-and-drop критичны для проекта.

**QA Reports (прочитай ОБЯЗАТЕЛЬНО):**
- `/feedbacks/qa-reports/session-12-v1/tech-report.md`
- `/feedbacks/qa-reports/session-12-v1/ux-check.md`

---

## 📋 Session-13: Critical Bugfixes Session-12

**Roadmap:** `/project-doc/session-13-critical-bugfixes-session-12/roadmap.md` ← **ПРОЧИТАЙ ПЕРВЫМ!**

### 3 критичных бага для исправления

**Bug 1: Phone icon missing в CityHeader (mobile) — score 8**
- **Проблема:** Developer добавил phone icon в SiteHeader, но забыл в CityHeader
- **Где:** `/city/moscow` (mobile 375×812) — phone icon отсутствует
- **Fix:** Добавить phone logic в CityHeader (аналогично SiteHeader):
  - Direct mode → `<a href="tel:...">`
  - Callback mode → `<button on:click={openCallbackModal}>`
  - Импортировать CallbackModal

**Bug 2: Phone button malfunction в SiteHeader — score 9**
- **Проблема:** Phone button имеет неправильный click handler → открывает меню или redirect на `/catalog`
- **Где:** Homepage (mobile, SiteHeader) — клик на phone icon → redirect (НЕПРАВИЛЬНО)
- **Fix:** Исправить click handler:
  - Direct mode → `<a href="tel:...">` (НЕ button)
  - Callback mode → `<button on:click={openCallbackModal}>` (НЕ toggleMobileMenu)
  - Menu button должна быть ОТДЕЛЬНАЯ

**Bug 3: Drag-and-drop НЕ работает — score 10**
- **Проблема:** "Reorder" button не активирует drag mode, нет grab handles, элементы нельзя перетащить
- **Где:** Admin Navigation, Collections, Brands, Categories, Testimonials, Footer (6 разделов)
- **Возможные причины:**
  1. `svelte-dnd-action` не установлен
  2. DragDropList.svelte имеет ошибки (неправильный импорт, use:dndzone)
  3. `dragDisabled` остаётся true (не обновляется при клике "Reorder")
  4. Admin pages не передают правильный `dragDisabled` prop
- **Fix:**
  - Проверить `npm list svelte-dnd-action`
  - Исправить DragDropList.svelte (grab handles, use:dndzone, handlers)
  - Исправить admin pages (reorderMode state, dragDisabled={!reorderMode})

---

## 🛠️ Workflow (как всегда)

### Фаза 1: Research (30 мин)

**Прочитай QA reports:**
- `feedbacks/qa-reports/session-12-v1/tech-report.md` — детали багов
- `feedbacks/qa-reports/session-12-v1/ux-check.md` — screenshots

**Прочитай roadmap:**
- `project-doc/session-13-critical-bugfixes-session-12/roadmap.md` — детальные инструкции для каждого бага

**Research код:**
- `src/lib/components/layout/CityHeader.svelte` — где добавить phone icon
- `src/lib/components/layout/SiteHeader.svelte` — где исправить phone button handler
- `src/lib/components/admin/DragDropList.svelte` — проверить DragDropList
- `src/routes/(admin)/admin/system/navigation/+page.svelte` — пример admin page с drag-and-drop

### Фаза 2: Implementation (2-3 часа)

**Порядок (рекомендуемый):**

**2.1 Bug 1: Fix CityHeader phone icon (30 мин)**
```svelte
<!-- src/lib/components/layout/CityHeader.svelte -->
<script>
  import { PhoneIcon } from 'lucide-svelte';
  import CallbackModal from '$lib/components/ui/CallbackModal.svelte';

  export let city;
  export let phoneMode: 'direct' | 'callback';
  export let phoneNumber: string;

  let callbackModalOpen = false;
</script>

<!-- Mobile header -->
<div class="mobile-header flex md:hidden items-center justify-between gap-4 px-4">
  <Logo />

  <!-- Phone icon -->
  {#if phoneMode === 'direct'}
    <a href="tel:{phoneNumber}" class="text-primary">
      <PhoneIcon class="h-6 w-6" />
    </a>
  {:else}
    <button on:click={() => callbackModalOpen = true} class="text-primary">
      <PhoneIcon class="h-6 w-6" />
    </button>
  {/if}

  <ThemeToggle />
</div>

{#if phoneMode === 'callback'}
  <CallbackModal bind:open={callbackModalOpen} />
{/if}
```

Не забудь передать props из layout:
```typescript
// src/routes/(city)/city/[slug]/+layout.server.ts
const phoneMode = db.prepare(`SELECT value FROM site_config WHERE key = 'phone_mode'`).get()?.value || 'direct';
const phoneNumber = db.prepare(`SELECT value FROM site_config WHERE key = 'phone_number'`).get()?.value;
return { city, phoneMode, phoneNumber };
```

**2.2 Bug 2: Fix SiteHeader phone button (30 мин)**
```svelte
<!-- src/lib/components/layout/SiteHeader.svelte -->
<!-- Mobile nav actions -->
<div class="flex items-center gap-3">
  <!-- Phone icon (ИСПРАВИТЬ — НЕ должен вызывать toggleMobileMenu) -->
  {#if phoneMode === 'direct'}
    <a href="tel:{phoneNumber}" class="text-primary" aria-label="Позвонить">
      <PhoneIcon class="h-6 w-6" />
    </a>
  {:else if phoneMode === 'callback'}
    <button on:click={() => callbackModalOpen = true} class="text-primary" aria-label="Заказать звонок">
      <PhoneIcon class="h-6 w-6" />
    </button>
  {/if}

  <!-- Menu button (ОТДЕЛЬНАЯ КНОПКА) -->
  <button on:click={toggleMobileMenu} class="text-foreground" aria-label="Меню">
    <MenuIcon class="h-6 w-6" />
  </button>
</div>
```

**2.3 Bug 3: Fix drag-and-drop (1-2 часа)**

**Step 1:** Проверить dependency
```bash
npm list svelte-dnd-action
# Если нет → npm install svelte-dnd-action
```

**Step 2:** Исправить DragDropList.svelte
```svelte
<!-- src/lib/components/admin/DragDropList.svelte -->
<script lang="ts">
  import { flip } from 'svelte/animate';
  import { dndzone } from 'svelte-dnd-action';
  import { GripVertical } from 'lucide-svelte';

  export let items: Array<{ id: number; [key: string]: any }>;
  export let onReorder: (newOrder: typeof items) => void;
  export let dragDisabled = false;  // ✅ Prop from parent

  function handleDndConsider(e: CustomEvent) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent) {
    items = e.detail.items;
    const newOrder = items.map((item, index) => ({ id: item.id, order: index + 1 }));
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
      class="drag-item flex items-center gap-4 p-4 bg-card rounded-lg border cursor-move hover:border-primary"
    >
      <!-- Grab handle -->
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

**Step 3:** Исправить admin pages (Navigation пример)
```svelte
<!-- src/routes/(admin)/admin/system/navigation/+page.svelte -->
<script>
  import DragDropList from '$lib/components/admin/DragDropList.svelte';

  let reorderMode = false;  // ✅ State

  function toggleReorder() {
    reorderMode = !reorderMode;
  }
</script>

<Button on:click={toggleReorder}>
  {reorderMode ? 'Save Order' : 'Reorder'}
</Button>

<DragDropList
  items={navigationItems}
  onReorder={handleReorder}
  dragDisabled={!reorderMode}  <!-- ✅ Pass correct state -->
  let:item
>
  <!-- content -->
</DragDropList>
```

**Step 4:** Применить во всех 6 разделах:
- Navigation ✅
- Footer Sections
- Footer Links
- Collections
- Brands
- Categories
- Testimonials

### Фаза 3: Testing (30 мин)

**Build check:**
```bash
npm run build  # Должен пройти без ошибок
```

**Phone functionality (Mobile):**
- [ ] CityHeader: phone icon visible на mobile
- [ ] SiteHeader: phone icon visible на mobile
- [ ] Direct mode: tel: link works
- [ ] Callback mode: modal opens
- [ ] Phone button НЕ открывает меню

**Drag-and-drop (Desktop):**
- [ ] "Reorder" button активирует drag mode
- [ ] Grab handles visible
- [ ] Можно перетащить элементы
- [ ] Order saves to DB
- [ ] Reload → order persists
- [ ] Works in all 6 admin sections

---

## ⚠️ Критические напоминания

1. **Phone icon:** Добавить в CityHeader (mobile) — скопировать логику из SiteHeader
2. **Phone button:** НЕ должен вызывать toggleMobileMenu() или redirect — только tel:/callback
3. **Drag-and-drop:** Проверить `dragDisabled` prop передаётся правильно (`dragDisabled={!reorderMode}`)
4. **Testing:** Обязательно протестировать на mobile (phone) и desktop (drag-and-drop)

---

## 🎯 Завершение сессии

### Когда закончишь:

1. **Commit & Push:**
```bash
git add -A
git commit -m "fix: session-13 critical bugfixes session-12

Bug 1 (score 8): Phone icon в CityHeader
- Added phone icon to CityHeader mobile layout
- Direct mode: tel: link
- Callback mode: CallbackModal

Bug 2 (score 9): Phone button handler в SiteHeader
- Fixed phone button click handler (removed toggleMobileMenu)
- Direct mode: <a href='tel:...'>
- Callback mode: <button on:click={openCallbackModal}>
- Separate menu button

Bug 3 (score 10): Drag-and-drop functionality
- Fixed DragDropList dragDisabled prop
- Fixed admin pages reorderMode state
- Applied to all 6 admin sections
- Grab handles visible, drag animation works

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git push origin claude/session-13-critical-bugfixes
```

2. **Обнови TODO:**
```markdown
## Session-13 Status

✅ Bug 1: Phone icon в CityHeader — FIXED
✅ Bug 2: Phone button handler в SiteHeader — FIXED
✅ Bug 3: Drag-and-drop functionality — FIXED

Build: ✅ PASS
Tests: ✅ ALL PASSED
```

3. **Сообщи CLI:**
> "Session-13 завершена. Ветка `claude/session-13-critical-bugfixes` запушена. Commit: [hash]. Все 3 критичных бага исправлены: phone icon в CityHeader, phone button handler в SiteHeader, drag-and-drop во всех 6 разделах. Build успешен. Готов к merge и deploy!"

---

## 🎉 После завершения Session-13

**→ Проект готов на 100%! 🚀**

80/80 задач выполнено, 13/13 сессий завершено.

**Удачи! Это последние исправления! 💪**

---

**Версия:** 1.0
**Создано:** 2025-02-02
**Для:** Claude Code Web (Developer)
**Roadmap:** `/project-doc/session-13-critical-bugfixes-session-12/roadmap.md`
**QA Reports:** `/feedbacks/qa-reports/session-12-v1/tech-report.md`, `/feedbacks/qa-reports/session-12-v1/ux-check.md`
**Приоритет:** 🔴 CRITICAL
