# Feedback v6 - Remove AdminJS, Create SvelteKit Admin

**Дата:** 2025-12-31
**Branch to create:** claude/sveltekit-admin-v6
**Priority:** High
**Score:** 15+ (архитектурное изменение)

---

## Цель

Удалить AdminJS и создать нативную админ-панель на SvelteKit. Express.js остаётся как backend API.

---

## Часть 1: Удаление AdminJS из backend-expressjs

### 1.1 Удалить npm зависимости

```bash
cd backend-expressjs
npm uninstall adminjs @adminjs/express @adminjs/sequelize @adminjs/design-system react react-dom styled-components express-session
```

**Оставить:**
- express
- better-sqlite3
- dotenv
- express-formidable
- bcrypt (добавить если нет)
- typescript, tslib

### 1.2 Удалить файлы

```
backend-expressjs/
├── src/admin.ts                    [DELETE]
├── components/                     [DELETE FOLDER]
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── ContactsEditor.tsx
│   └── PageMetaEditor.tsx
└── .adminjs/                       [DELETE FOLDER]
    ├── .entry.js
    ├── bundle.js
    └── components.bundle.js
```

### 1.3 Обновить src/index.ts

**Было:**
```typescript
import { setupAdmin } from './admin';
// ...
const { admin, adminRouter } = await setupAdmin();
app.use('/admin/frontend/assets', express.static(adminJsDir));
app.get('/admin/frontend/assets/components.bundle.js', ...);
app.use(admin.options.rootPath, adminRouter);
```

**Стало:**
```typescript
import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'moditime-backend' });
});

// API routes (для будущего использования)
// app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
```

### 1.4 Обновить src/db.ts

Удалить все Sequelize модели (они использовались только для AdminJS).
Оставить только инициализацию БД если нужна.

**Или:** Удалить db.ts полностью — SvelteKit использует свой database.ts.

---

## Часть 2: SvelteKit Admin — Структура

### 2.1 Роутинг

```
frontend-sveltekit/src/routes/
└── (admin)/                        [Route group - no /admin prefix in URL]
    ├── admin/
    │   ├── +layout.server.ts       [Auth guard]
    │   ├── +layout.svelte          [Admin layout with sidebar]
    │   │
    │   ├── login/
    │   │   ├── +page.server.ts     [POST: authenticate]
    │   │   └── +page.svelte        [Login form]
    │   │
    │   ├── +page.svelte            [Dashboard - redirect or stats]
    │   │
    │   ├── products/
    │   │   ├── +page.server.ts     [List products]
    │   │   ├── +page.svelte        [Table view]
    │   │   ├── new/
    │   │   │   └── +page.svelte    [Create form]
    │   │   └── [id]/
    │   │       ├── +page.server.ts [Load single]
    │   │       └── +page.svelte    [Edit form]
    │   │
    │   ├── brands/
    │   │   ├── +page.svelte
    │   │   └── [id]/+page.svelte
    │   │
    │   ├── categories/
    │   │   ├── +page.svelte
    │   │   └── [id]/+page.svelte
    │   │
    │   ├── orders/
    │   │   ├── +page.svelte        [List + status update]
    │   │   └── [id]/+page.svelte   [Order details]
    │   │
    │   ├── pages/
    │   │   ├── +page.svelte
    │   │   └── [id]/+page.svelte
    │   │
    │   └── system/
    │       ├── admins/+page.svelte [User management]
    │       └── config/+page.svelte [Site settings]
```

### 2.2 Компоненты Admin UI

Создать в `src/lib/components/admin/`:

```
admin/
├── AdminLayout.svelte              [Sidebar + header + content area]
├── AdminSidebar.svelte             [Navigation menu]
├── AdminHeader.svelte              [User info + logout]
│
├── DataTable.svelte                [Sortable table with pagination]
├── DataTableRow.svelte             [Single row with actions]
│
├── FormField.svelte                [Input + label + error]
├── FormSelect.svelte               [Dropdown]
├── FormTextarea.svelte             [Multiline text]
├── FormCheckbox.svelte             [Boolean toggle]
├── FormImageUpload.svelte          [File upload with preview]
│
├── ActionButton.svelte             [Edit/Delete/Save buttons]
├── StatusBadge.svelte              [Order status, active/inactive]
├── Breadcrumbs.svelte              [Navigation path]
└── Modal.svelte                    [Confirm dialogs]
```

---

## Часть 3: Аутентификация

### 3.1 Схема

```
1. User → /admin/login (POST email + password)
2. Server → Query admins table, verify bcrypt hash
3. Server → Set encrypted cookie (admin_session)
4. All /admin/* routes → Check cookie in +layout.server.ts
5. Invalid/missing → Redirect to /admin/login
```

### 3.2 Файлы

**src/lib/server/auth.ts:**
```typescript
import bcrypt from 'bcrypt';
import { db } from './db/database';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: 'super-admin' | 'editor' | 'viewer';
}

export async function verifyAdmin(email: string, password: string): Promise<AdminUser | null> {
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (!admin) return null;

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return null;

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role
  };
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
```

**src/routes/(admin)/admin/+layout.server.ts:**
```typescript
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const session = cookies.get('admin_session');

  // Allow access to login page without auth
  if (url.pathname === '/admin/login') {
    return {};
  }

  if (!session) {
    throw redirect(302, '/admin/login');
  }

  // Decrypt and validate session
  try {
    const admin = JSON.parse(atob(session)); // Simple for MVP, use proper encryption later
    return { admin };
  } catch {
    cookies.delete('admin_session', { path: '/' });
    throw redirect(302, '/admin/login');
  }
};
```

### 3.3 Миграция паролей

**КРИТИЧНО:** Текущие пароли в plain text. Нужна миграция:

```typescript
// Одноразовый скрипт миграции
import bcrypt from 'bcrypt';
import Database from 'better-sqlite3';

const db = new Database('./data/db/sqlite/app.db');
const admins = db.prepare('SELECT id, password FROM admins').all();

for (const admin of admins) {
  const hash = await bcrypt.hash(admin.password, 10);
  db.prepare('UPDATE admins SET password = ? WHERE id = ?').run(hash, admin.id);
}

console.log('Migrated', admins.length, 'admin passwords to bcrypt');
```

---

## Часть 4: Database Queries

### 4.1 Расширить src/lib/server/db/database.ts

Добавить admin queries:

```typescript
// ADMIN QUERIES
export const adminQueries = {
  // Products
  listProducts: db.prepare(`
    SELECT p.*, b.name as brand_name, c.name as category_name
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    ORDER BY p.created_at DESC
  `),

  getProduct: db.prepare('SELECT * FROM products WHERE id = ?'),

  createProduct: db.prepare(`
    INSERT INTO products (name, slug, brand_id, category_id, price, description, is_active, is_featured)
    VALUES (@name, @slug, @brand_id, @category_id, @price, @description, @is_active, @is_featured)
  `),

  updateProduct: db.prepare(`
    UPDATE products SET
      name = @name, slug = @slug, brand_id = @brand_id, category_id = @category_id,
      price = @price, description = @description, is_active = @is_active, is_featured = @is_featured,
      updated_at = datetime('now')
    WHERE id = @id
  `),

  deleteProduct: db.prepare('DELETE FROM products WHERE id = ?'),

  // Brands
  listBrands: db.prepare('SELECT * FROM brands ORDER BY name'),
  getBrand: db.prepare('SELECT * FROM brands WHERE id = ?'),
  createBrand: db.prepare('INSERT INTO brands (name, slug, logo_url) VALUES (@name, @slug, @logo_url)'),
  updateBrand: db.prepare('UPDATE brands SET name = @name, slug = @slug, logo_url = @logo_url WHERE id = @id'),
  deleteBrand: db.prepare('DELETE FROM brands WHERE id = ?'),

  // Categories
  listCategories: db.prepare('SELECT * FROM categories ORDER BY position'),
  getCategory: db.prepare('SELECT * FROM categories WHERE id = ?'),

  // Orders
  listOrders: db.prepare(`
    SELECT o.*, COUNT(oi.id) as items_count, SUM(oi.quantity * oi.price) as total
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `),
  getOrder: db.prepare('SELECT * FROM orders WHERE id = ?'),
  getOrderItems: db.prepare('SELECT * FROM order_items WHERE order_id = ?'),
  updateOrderStatus: db.prepare('UPDATE orders SET status = ?, updated_at = datetime("now") WHERE id = ?'),

  // Pages
  listPages: db.prepare('SELECT * FROM pages ORDER BY id'),
  getPage: db.prepare('SELECT * FROM pages WHERE id = ?'),
  updatePage: db.prepare(`
    UPDATE pages SET title = @title, slug = @slug, content = @content,
    meta_json = @meta_json, is_published = @is_published, updated_at = datetime('now')
    WHERE id = @id
  `),

  // Admins
  listAdmins: db.prepare('SELECT id, email, name, role, created_at FROM admins'),
  getAdminByEmail: db.prepare('SELECT * FROM admins WHERE email = ?'),
  createAdmin: db.prepare('INSERT INTO admins (email, password, name, role) VALUES (@email, @password, @name, @role)'),
  updateAdmin: db.prepare('UPDATE admins SET email = @email, name = @name, role = @role WHERE id = @id'),
  deleteAdmin: db.prepare('DELETE FROM admins WHERE id = ?')
};
```

---

## Часть 5: MVP — Минимальный запуск

### Фаза 1: Auth + Layout (3-4 дня)
- [ ] Удалить AdminJS из backend
- [ ] Создать auth.ts с bcrypt
- [ ] Мигрировать пароли админов
- [ ] Создать /admin/login
- [ ] Создать AdminLayout + Sidebar
- [ ] Создать auth guard в +layout.server.ts

### Фаза 2: Первые CRUD (5-7 дней)
- [ ] DataTable компонент
- [ ] Form компоненты (Field, Select, Textarea, Checkbox)
- [ ] Brands CRUD (самый простой)
- [ ] Categories CRUD
- [ ] Products CRUD (сложнее — связи)

### Фаза 3: Operations (5-7 дней)
- [ ] Orders list + status update
- [ ] Pages editor
- [ ] Navigation editor

### Фаза 4: Polish (3-4 дня)
- [ ] System admins management
- [ ] Site config
- [ ] Image upload
- [ ] Validation + error handling

---

## Часть 6: Роли и права

Сохраняем текущую модель:

| Роль | Просмотр | Создание | Редактирование | Удаление |
|------|----------|----------|----------------|----------|
| viewer | ✅ | ❌ | ❌ | ❌ |
| editor | ✅ | ✅ | ✅ | ❌ |
| super-admin | ✅ | ✅ | ✅ | ✅ |

**Реализация:**
```typescript
// src/lib/server/auth.ts
export function canModify(role: string): boolean {
  return ['super-admin', 'editor'].includes(role);
}

export function canDelete(role: string): boolean {
  return role === 'super-admin';
}

export function isSuperAdmin(role: string): boolean {
  return role === 'super-admin';
}
```

---

## Критерии приёмки

### Фаза 1 (Auth + Layout):
- [ ] AdminJS полностью удалён из backend
- [ ] /admin/login работает с bcrypt
- [ ] Неавторизованный пользователь редиректится на login
- [ ] AdminLayout показывает sidebar с навигацией

### Фаза 2 (CRUD):
- [ ] Brands: list, create, edit, delete
- [ ] Categories: list, create, edit, delete
- [ ] Products: list, create, edit, delete (с выбором brand/category)

### Общие:
- [ ] Нет React зависимостей в проекте
- [ ] Backend запускается без ошибок (npm run build && npm start)
- [ ] Frontend запускается без ошибок

---

## Файлы для изменения

| Файл | Действие |
|------|----------|
| `backend-expressjs/package.json` | Удалить AdminJS dependencies |
| `backend-expressjs/src/admin.ts` | DELETE |
| `backend-expressjs/src/index.ts` | Убрать AdminJS, оставить минимум |
| `backend-expressjs/src/db.ts` | Упростить или удалить |
| `backend-expressjs/components/` | DELETE FOLDER |
| `backend-expressjs/.adminjs/` | DELETE FOLDER |
| `frontend-sveltekit/src/routes/(admin)/` | CREATE - admin routes |
| `frontend-sveltekit/src/lib/components/admin/` | CREATE - UI components |
| `frontend-sveltekit/src/lib/server/auth.ts` | CREATE - authentication |
| `frontend-sveltekit/src/lib/server/db/database.ts` | EXTEND - admin queries |

---

*Создано: CLI Integrator*
*Score: 15+ (архитектурное изменение, 4 фазы)*
