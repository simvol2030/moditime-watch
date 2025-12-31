# Feedback v5 - Fix AdminJS Custom Components Bundling

**Дата:** 2025-12-31
**Branch to create:** claude/fix-adminjs-bundling-v5
**Priority:** High

## Проблема

Custom компоненты (ContactsEditor, PageMetaEditor) созданы и зарегистрированы, но не загружаются в браузере.

### Симптомы

1. В консоли браузера:
```
Failed to load resource: 404 @ /admin/frontend/assets/components.bundle.js
Error: Component "ContactsEditor" has not been bundled
```

2. Bundle существует:
```
/opt/websites/moditime-watch.ru/repo/backend-expressjs/.adminjs/bundle.js (15KB)
```

3. Entry.js правильный:
```javascript
AdminJS.UserComponents = {}
import Dashboard from '../components/Dashboard'
AdminJS.UserComponents.Dashboard = Dashboard
import Login from '../components/Login'
AdminJS.UserComponents.Login = Login
import PageMetaEditor from '../components/PageMetaEditor'
AdminJS.UserComponents.PageMetaEditor = PageMetaEditor
import ContactsEditor from '../components/ContactsEditor'
AdminJS.UserComponents.ContactsEditor = ContactsEditor
```

4. Bundle.js содержит все компоненты (проверено grep).

### Корневая причина

AdminJS ожидает bundle по URL `/admin/frontend/assets/components.bundle.js`, но:
- Bundle создаётся в `.adminjs/bundle.js`
- Express не настроен отдавать этот файл по ожидаемому URL

## Возможные решения

### Вариант A: Настроить Express static (рекомендуется)

В `src/index.ts` добавить статическую раздачу `.adminjs/`:

```typescript
import path from 'path';

// BEFORE adminRouter mount
app.use('/admin/frontend/assets', express.static(
  path.join(__dirname, '../.adminjs')
));

// Then mount adminRouter
app.use(admin.options.rootPath, adminRouter);
```

### Вариант B: Использовать AdminJS bundler напрямую

Проверить что `admin.initialize()` вызывается и завершается до старта сервера:

```typescript
// В setupAdmin() или index.ts
await admin.initialize();  // Ждём завершения бандлинга
await admin.watch();       // Для dev-режима с hot reload
```

### Вариант C: Настроить assetsCDN

В конфигурации AdminJS указать путь к assets:

```typescript
const admin = new AdminJS({
  componentLoader,
  assets: {
    globalsFromCDN: false,
  },
  // или
  // assetsCDN: 'https://moditime-watch.ru/admin-assets/'
});
```

### Вариант D: Обновить AdminJS

Текущая версия: `adminjs@6.8.7`
Возможно есть фикс в более новой версии.

```bash
npm update adminjs @adminjs/express @adminjs/sequelize
```

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `backend-expressjs/src/index.ts` | Добавить express.static для .adminjs |
| `backend-expressjs/package.json` | Возможно обновить версии AdminJS |

## Диагностика

Для отладки добавить в index.ts:

```typescript
console.log('AdminJS root:', admin.options.rootPath);
console.log('AdminJS assets:', admin.options.assetsCDN);
console.log('.adminjs exists:', fs.existsSync(path.join(__dirname, '../.adminjs')));
console.log('.adminjs contents:', fs.readdirSync(path.join(__dirname, '../.adminjs')));
```

## Критерии приёмки

1. [ ] При открытии `/admin/resources/pages/records/4/edit` нет ошибки 404 для components.bundle.js
2. [ ] ContactsEditor рендерится для страницы contacts (показывает SEO fields + Contact Methods + Office Info)
3. [ ] PageMetaEditor рендерится для остальных страниц (about, delivery, warranty, privacy, terms)
4. [ ] Изменения в редакторе сохраняются в meta_json

## Тестирование

После фикса проверить:
1. Открыть https://moditime-watch.ru/admin
2. Залогиниться
3. Pages & SEO → Pages → contacts → Edit
4. Должен появиться ContactsEditor с секциями:
   - SEO Metadata (title, description, keywords)
   - Contact Methods (add/remove entries)
   - Office Information (address, hours, metro)

---

*Создано: CLI Integrator*
*Score: 8 (AdminJS configuration debugging)*
