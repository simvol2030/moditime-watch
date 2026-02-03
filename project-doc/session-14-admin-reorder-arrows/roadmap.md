# Session-14: Admin Reorder Arrows (Replace Drag-and-Drop)

> **Приоритет:** HIGH
> **Фокус:** Заменить нерабочий drag-and-drop на стрелки вверх/вниз
> **Задач:** 8 (6 разделов + компонент + стили)
> **Зависит от:** Session-13 (завершена)

---

## Контекст

### Проблема

Drag-and-drop сортировка (`DragDropList` компонент) **не работает** в production:
- Две попытки исправить (Session-12, Session-13) — безуспешно
- QA показывает PASS, но реально функционал не работает
- Вероятная причина: несовместимость `svelte-dnd-action` с Svelte 5 runes

### Дополнительная проблема

**Читаемость элементов** — пункты меню в Navigation сливаются с фоном, плохо видны.

### Решение

1. **Убрать** `DragDropList` компонент и `svelte-dnd-action`
2. **Добавить** стрелки ↑/↓ для перемещения элементов
3. **Убрать** ручной ввод `position` — автоматический пересчёт при перемещении
4. **Исправить** стили для читаемости

---

## Разделы для переделки (6 шт)

| # | Раздел | URL | Сложность | Особенности |
|---|--------|-----|-----------|-------------|
| 1 | Navigation | `/admin/navigation` | HIGH | top-level items + children (submenu) |
| 2 | Footer | `/admin/footer` | HIGH | sections + links внутри sections |
| 3 | Collections | `/admin/collections` | LOW | простой список |
| 4 | Brands | `/admin/brands` | LOW | простой список |
| 5 | Categories | `/admin/categories` | MEDIUM | может иметь parent_id |
| 6 | Testimonials | `/admin/testimonials` | LOW | простой список |

---

## Задачи

### Task 1: Создать компонент `ReorderButtons.svelte`

**Файл:** `src/lib/components/admin/ReorderButtons.svelte`

**Функционал:**
- Две кнопки: ↑ (вверх) и ↓ (вниз)
- Props: `itemId`, `onMoveUp`, `onMoveDown`, `isFirst`, `isLast`
- Disabled состояние для первого/последнего элемента
- Компактный размер для inline использования

**Пример:**
```svelte
<script lang="ts">
  import { ChevronUp, ChevronDown } from 'lucide-svelte';

  interface Props {
    itemId: number;
    onMoveUp: (id: number) => void;
    onMoveDown: (id: number) => void;
    isFirst?: boolean;
    isLast?: boolean;
  }

  let { itemId, onMoveUp, onMoveDown, isFirst = false, isLast = false }: Props = $props();
</script>

<div class="reorder-buttons">
  <button
    type="button"
    class="reorder-btn"
    disabled={isFirst}
    onclick={() => onMoveUp(itemId)}
    aria-label="Move up"
  >
    <ChevronUp size={16} />
  </button>
  <button
    type="button"
    class="reorder-btn"
    disabled={isLast}
    onclick={() => onMoveDown(itemId)}
    aria-label="Move down"
  >
    <ChevronDown size={16} />
  </button>
</div>

<style>
  .reorder-buttons {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .reorder-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 20px;
    padding: 0;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    background: #f9fafb;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reorder-btn:hover:not(:disabled) {
    background: #e5e7eb;
    color: #374151;
    border-color: #9ca3af;
  }

  .reorder-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
</style>
```

---

### Task 2: Исправить Navigation (`/admin/navigation`)

**Файл:** `src/routes/(admin)/admin/navigation/+page.svelte`

**Изменения:**

1. **Убрать:**
   - Import `DragDropList`
   - `reorderMode` state и кнопку "Reorder"
   - Весь блок `{#if reorderMode}...`
   - Ручной ввод `position` в формах

2. **Добавить:**
   - Import `ReorderButtons`
   - Стрелки ↑/↓ в каждом `nav-item-content`
   - Функции `moveUp(id)` и `moveDown(id)` с автоматическим submit

3. **Backend action:** `?/move` с параметрами `id`, `direction` ('up' | 'down')

**UI структура:**
```
┌─────────────────────────────────────────────────────┐
│ [↑↓] Каталог        /catalog        #1   Active  [Edit][Delete] │
│ [↑↓] Бренды         /brands         #2   Active  [Edit][Delete] │
│ [↑↓] О нас          /about          #3   Active  [Edit][Delete] │
│   └─ [↑↓] История   /about/history  #1   Active  [Edit][Delete] │
│   └─ [↑↓] Команда   /about/team     #2   Active  [Edit][Delete] │
│ [↑↓] Контакты       /contacts       #4   Active  [Edit][Delete] │
└─────────────────────────────────────────────────────┘
```

**Стили — исправить читаемость:**
```css
.nav-item {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

.nav-item-content {
  background: #f9fafb;
}

.nav-label {
  color: #1f2937;
  font-weight: 600;
}

.nav-href {
  color: #4b5563;
}
```

---

### Task 3: Исправить Footer (`/admin/footer`)

**Файл:** `src/routes/(admin)/admin/footer/+page.svelte`

**Изменения:**

1. **Убрать:** DragDropList, reorderMode, кнопку "Reorder"

2. **Добавить:**
   - Стрелки ↑/↓ для sections
   - Стрелки ↑/↓ для links внутри sections
   - Действия `?/moveSection` и `?/moveLink`

**UI:**
```
Section: О компании (Col 1) [↑↓] [Edit][+ Link][Delete]
  ├─ [↑↓] О нас        /about      [Edit][Delete]
  ├─ [↑↓] Доставка     /delivery   [Edit][Delete]
  └─ [↑↓] Гарантия     /warranty   [Edit][Delete]

Section: Каталог (Col 2) [↑↓] [Edit][+ Link][Delete]
  ├─ [↑↓] Все часы     /catalog    [Edit][Delete]
  └─ [↑↓] Бренды       /brands     [Edit][Delete]
```

---

### Task 4: Исправить Collections (`/admin/collections`)

**Файл:** `src/routes/(admin)/admin/collections/+page.svelte`

**Изменения:**

1. **Убрать:** DragDropList, reorderMode, кнопку "Reorder"

2. **Добавить:**
   - Колонку "Order" в DataTable с компонентом `ReorderButtons`
   - Или: отдельные кнопки ↑/↓ в actions

3. **Backend:** `?/move` action

---

### Task 5: Исправить Brands (`/admin/brands`)

**Файл:** `src/routes/(admin)/admin/brands/+page.svelte`

Аналогично Task 4.

---

### Task 6: Исправить Categories (`/admin/categories`)

**Файл:** `src/routes/(admin)/admin/categories/+page.svelte`

**Особенность:** Может иметь `parent_id`. Сортировка должна работать в пределах одного уровня (siblings).

---

### Task 7: Исправить Testimonials (`/admin/testimonials`)

**Файл:** `src/routes/(admin)/admin/testimonials/+page.svelte`

Аналогично Task 4.

---

### Task 8: Удалить DragDropList и svelte-dnd-action

1. Удалить файл: `src/lib/components/admin/DragDropList.svelte`
2. Удалить dependency: `npm uninstall svelte-dnd-action`
3. Удалить все импорты DragDropList из админки

---

## Backend Actions (для каждого раздела)

**Паттерн для action `move`:**

```typescript
// +page.server.ts
export const actions = {
  move: async ({ request }) => {
    const formData = await request.formData();
    const id = Number(formData.get('id'));
    const direction = formData.get('direction') as 'up' | 'down';

    const db = getDatabase();

    // Получить текущий элемент
    const current = db.prepare('SELECT * FROM table WHERE id = ?').get(id);
    if (!current) return fail(404, { error: 'Not found' });

    // Найти соседний элемент
    const sibling = db.prepare(`
      SELECT * FROM table
      WHERE position ${direction === 'up' ? '<' : '>'} ?
      ${current.parent_id ? 'AND parent_id = ?' : 'AND parent_id IS NULL'}
      ORDER BY position ${direction === 'up' ? 'DESC' : 'ASC'}
      LIMIT 1
    `).get(current.position, ...(current.parent_id ? [current.parent_id] : []));

    if (!sibling) return { success: true }; // Уже на краю

    // Swap positions
    db.prepare('UPDATE table SET position = ? WHERE id = ?').run(sibling.position, current.id);
    db.prepare('UPDATE table SET position = ? WHERE id = ?').run(current.position, sibling.id);

    return { success: true };
  }
};
```

---

## Проверки

**Frontend:**
- [ ] `npm run build` — без ошибок
- [ ] `npm run check` — TypeScript OK

**Функционал:**
- [ ] Navigation: стрелки работают для top-level и children
- [ ] Footer: стрелки работают для sections и links
- [ ] Collections: стрелки работают
- [ ] Brands: стрелки работают
- [ ] Categories: стрелки работают (учитывают parent_id)
- [ ] Testimonials: стрелки работают

**UI/UX:**
- [ ] Стрелки disabled на краях списка
- [ ] Instant feedback (страница обновляется после move)
- [ ] Navigation элементы читаемые (контраст исправлен)
- [ ] Нет ручного ввода position

**Cleanup:**
- [ ] DragDropList.svelte удалён
- [ ] svelte-dnd-action удалён из package.json
- [ ] Нет упоминаний DragDropList в коде

---

## Оценка

**Сложность:** Средняя
**Файлов:** ~10-12 файлов
**Время:** ~3-4 часа

**Риски:**
- LOW: Простые списки (Collections, Brands, Testimonials)
- MEDIUM: Navigation и Footer (вложенные структуры)

---

**Версия:** 1.0
**Создано:** 2025-02-03
**Для:** Developer (Claude Code Web)
**Приоритет:** HIGH — администрирование невозможно без рабочей сортировки
