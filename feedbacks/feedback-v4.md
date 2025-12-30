# Feedback v4 - Улучшение редактирования Pages в AdminJS

**Дата:** 2025-12-30
**Branch to create:** claude/admin-pages-editor-v4

## Контекст

Ресурс `Page` уже добавлен в AdminJS (`backend-expressjs/src/admin.ts`, строки 507-520), но редактирование неудобное:
- `meta_json` отображается как обычная textarea с сырым JSON
- Для разных типов страниц нужны разные поля (contacts требует contactMethods + officeInfo)
- Нет валидации структуры данных
- Пользователь может сломать JSON при редактировании

## Что нужно сделать

### 1. Создать кастомные компоненты для редактирования Pages

**Файлы для создания:**
- `backend-expressjs/components/PageMetaEditor.tsx` — компонент для редактирования SEO полей (title, description, keywords)
- `backend-expressjs/components/ContactsEditor.tsx` — компонент для редактирования контактов (телефоны, email, адрес офиса)

### 2. Обновить конфигурацию Page ресурса

**Файл:** `backend-expressjs/src/admin.ts`

Текущая конфигурация:
```typescript
{
  resource: Page,
  options: {
    navigation: { name: 'Pages & SEO', icon: 'File' },
    listProperties: ['id', 'slug', 'title', 'template', 'is_published'],
    properties: {
      ...commonProps,
      content: { type: 'richtext' },
      meta_json: { type: 'textarea' },
      ...booleanProps('is_published')
    },
    actions: standardActions
  }
}
```

**Нужно добавить:**
- Кастомный компонент для `meta_json` в зависимости от `template`
- Разделить SEO поля отдельно (title, description, keywords — это общие для всех)
- Для template='contacts' показывать специальные поля

### 3. Структура данных по типам страниц

#### template: 'about', 'delivery', 'warranty', 'legal'
```json
{
  "title": "SEO title",
  "description": "SEO description",
  "keywords": "seo, keywords"
}
```
Контент хранится в поле `content` (richtext)

#### template: 'contacts'
```json
{
  "title": "SEO title",
  "description": "SEO description",
  "contactMethods": [
    { "icon": "phone", "title": "Телефон", "value": "+7 (999) 960-43-22", "description": "Ежедневно 10-22", "href": "tel:+79999604322", "primary": true }
  ],
  "officeInfo": {
    "address": "г. Москва, Кутузовский проспект, д. 12, офис 501",
    "hours": "Пн–Вс: 10:00 — 22:00",
    "metro": "м. Кутузовская"
  }
}
```

### 4. Рекомендуемый подход

**Вариант A (Простой):** Разделить meta_json на отдельные поля в UI
- Показывать SEO-поля как обычные input/textarea
- При сохранении собирать в JSON

**Вариант B (Продвинутый):** Условные поля по template
- Когда template='contacts', показывать дополнительные поля для contactMethods
- Использовать AdminJS custom components с React

### 5. Пример кастомного компонента

```tsx
// components/PageMetaEditor.tsx
import React, { useState, useEffect } from 'react';
import { Box, Label, Input, TextArea } from '@adminjs/design-system';

const PageMetaEditor = (props) => {
  const { record, onChange, property } = props;
  const [meta, setMeta] = useState({ title: '', description: '', keywords: '' });

  useEffect(() => {
    try {
      const parsed = JSON.parse(record.params.meta_json || '{}');
      setMeta(parsed);
    } catch (e) {}
  }, [record.params.meta_json]);

  const handleChange = (field, value) => {
    const updated = { ...meta, [field]: value };
    setMeta(updated);
    onChange(property.path, JSON.stringify(updated));
  };

  return (
    <Box>
      <Label>SEO Title</Label>
      <Input value={meta.title} onChange={(e) => handleChange('title', e.target.value)} />

      <Label>SEO Description</Label>
      <TextArea value={meta.description} onChange={(e) => handleChange('description', e.target.value)} />

      <Label>Keywords</Label>
      <Input value={meta.keywords} onChange={(e) => handleChange('keywords', e.target.value)} />
    </Box>
  );
};

export default PageMetaEditor;
```

## Регистрация компонента

```typescript
// В admin.ts
const Components = {
  Dashboard: componentLoader.add('Dashboard', path.join(__dirname, '../components/Dashboard')),
  Login: componentLoader.add('Login', path.join(__dirname, '../components/Login')),
  PageMetaEditor: componentLoader.add('PageMetaEditor', path.join(__dirname, '../components/PageMetaEditor'))
};

// В конфигурации Page:
{
  resource: Page,
  options: {
    properties: {
      meta_json: {
        components: {
          edit: Components.PageMetaEditor,
          show: Components.PageMetaEditor
        }
      }
    }
  }
}
```

## Критерии приёмки

1. [ ] В AdminJS можно редактировать страницы about, delivery, warranty, contacts, privacy, terms
2. [ ] SEO поля (title, description, keywords) показываются как отдельные поля, не сырой JSON
3. [ ] Для страницы contacts можно редактировать методы связи и информацию офиса
4. [ ] При сохранении данные корректно сериализуются в meta_json
5. [ ] Страницы отображаются корректно на фронтенде после редактирования

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `backend-expressjs/components/PageMetaEditor.tsx` | Создать |
| `backend-expressjs/components/ContactsEditor.tsx` | Создать (опционально) |
| `backend-expressjs/src/admin.ts` | Обновить конфигурацию Page |

## Приоритет

Medium — сейчас страницы редактируются напрямую в БД, что неудобно. Админка уже поддерживает Pages, но UX плохой.

---

*Создано: CLI Integrator*
*Score: 18 (Developer task)*
