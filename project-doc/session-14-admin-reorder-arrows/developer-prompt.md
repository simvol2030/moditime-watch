# Developer Prompt — Session-14

## Контекст

Прочитай:
1. `CLAUDE.md` — пути проекта, deploy
2. `CLAUDE.web.md` — workflow Developer'а
3. `project-doc/session-14-admin-reorder-arrows/roadmap.md` — полная спецификация

## Задача

**Session-14: Admin Reorder Arrows** — заменить нерабочий drag-and-drop на стрелки ↑/↓.

### Проблема

Drag-and-drop (`DragDropList` + `svelte-dnd-action`) не работает в production. Две попытки исправить — безуспешно. Вероятная причина: несовместимость с Svelte 5 runes.

### Решение

1. Создать компонент `ReorderButtons.svelte` со стрелками ↑/↓
2. Заменить DragDropList на ReorderButtons в 6 разделах админки
3. Добавить backend action `?/move` для каждого раздела
4. Убрать ручной ввод position — автоматический пересчёт
5. Исправить стили Navigation (элементы сливаются с фоном)
6. Удалить DragDropList и svelte-dnd-action

### Разделы (6 шт)

| Раздел | URL | Сложность |
|--------|-----|-----------|
| Navigation | `/admin/navigation` | HIGH (nested) |
| Footer | `/admin/footer` | HIGH (nested) |
| Collections | `/admin/collections` | LOW |
| Brands | `/admin/brands` | LOW |
| Categories | `/admin/categories` | MEDIUM |
| Testimonials | `/admin/testimonials` | LOW |

## Действия

1. **Research:** Изучи текущую реализацию DragDropList и admin pages
2. **Tech-spec:** Определи точную структуру ReorderButtons и backend actions
3. **Plan:** Распиши файлы для изменения
4. **Implement:** Создай компонент, исправь 6 страниц, добавь actions
5. **Test:** `npm run build`, `npm run check`
6. **Commit:** Один коммит с описанием

## Критерии успеха

- [ ] Стрелки ↑/↓ работают во всех 6 разделах
- [ ] Navigation: стрелки для top-level И children
- [ ] Footer: стрелки для sections И links
- [ ] Стрелки disabled на краях списка
- [ ] Нет ручного ввода position
- [ ] Navigation элементы читаемые (контраст OK)
- [ ] DragDropList удалён, svelte-dnd-action удалён
- [ ] Build без ошибок

## Ветка

```bash
git checkout -b claude/session-14-reorder-arrows
```

---

**Приоритет:** HIGH
**Время:** ~3-4 часа
