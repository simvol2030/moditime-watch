# Feedback v1

**Дата:** 2025-02-01
**Sessions:** 1-4 (Fix Pages, Admin Panel, Import/Export, Layout Management)
**Branch:** claude/review-project-sessions-KVeyD
**Коммит main:** 72f0c7f
**Developer commits:** 15 commits (4d65a01...6a255d8)

---

## Summary

| Category | Status | Issues |
|----------|--------|--------|
| Seed & DB | ✅ OK | 0 |
| Dev mode | ✅ OK | 0 |
| Production build | ❌ FAIL | 1 critical |

**Blocker:** Production build fails with SQLITE_ERROR. Cannot deploy.

---

## Что работает

- [x] `npm run dev` — работает без ошибок
- [x] Database initialization — schema создаётся корректно
- [x] Database seed — все данные (filters, config, city articles) заполняются
- [x] Prepared statements в `database.ts` exports (queries object) — работают
- [x] Admin pages в dev mode — открываются и функционируют
- [x] City layout в dev mode — рендерится корректно

---

## Баги (score 6+)

### Bug 1: Production build fails — prepared statements on module level

- **Score:** 10 (блокирует деплой на production)
- **Severity:** BLOCKER
- **Category:** Architecture / Build System
- **Где:** 71 prepared statement в ~30 файлах

**Steps to reproduce:**
1. `cd frontend-sveltekit`
2. `npm run build`
3. Observe error:
   ```
   Error [ERR_UNHANDLED_ERROR]: Unhandled error. ({ code: 'SQLITE_ERROR' })
   ```

**Expected:**
Build должен успешно компилироваться в production-ready код без попыток подключения к БД на этапе сборки.

**Actual:**
Vite SSR загружает все `+page.server.ts` файлы → импорт `db` → prepared statements создаются на module level → SQLite connection → ошибка (БД ещё не инициализирована или vite worker не имеет доступа).

**Root cause:**

Во всех новых admin pages prepared statements объявлены **на module level** (вне функций):

```typescript
// ❌ WRONG (module level)
import { db } from '$lib/server/db/database';

const listArticles = db.prepare('SELECT ...');
const deleteArticle = db.prepare('DELETE ...');

export const load: PageServerLoad = async () => {
  const articles = listArticles.all();
  // ...
};
```

При vite build эти файлы импортируются **до** инициализации БД → ошибка.

**Файлы с проблемой (примеры):**

| File | Prepared statements count |
|------|---------------------------|
| `src/routes/(admin)/admin/articles/+page.server.ts` | 4 |
| `src/routes/(admin)/admin/articles/[id]/+page.server.ts` | 3 |
| `src/routes/(admin)/admin/cities/+page.server.ts` | 2 |
| `src/routes/(admin)/admin/collections/[id]/+page.server.ts` | 5 |
| `src/routes/(admin)/admin/footer/+page.server.ts` | 6 |
| `src/routes/(admin)/admin/homepage/+page.server.ts` | 8 |
| `src/routes/(admin)/admin/import/+page.server.ts` | 7 |
| `src/routes/(city)/+layout.server.ts` | 3 |
| `src/routes/+layout.server.ts` | 1 |
| ... и ещё ~20 файлов | ... |

**Всего:** 71 prepared statement на module level (по `git diff e4122a5..HEAD | grep "^+const.*db.prepare" | wc -l`)

**Recommended fix:**

**Вариант A (рекомендуемый):** Добавить все statements в `queries` объект в `database.ts`

```typescript
// database.ts
export const queries = {
  // ... существующие queries

  // Admin - Articles
  listArticles: db.prepare(`SELECT a.*, ac.name as category_name ...`),
  listArticlesByCategory: db.prepare(`SELECT ... WHERE category_id = ?`),
  getAllCategories: db.prepare('SELECT id, name FROM article_categories ...'),
  deleteArticle: db.prepare('DELETE FROM articles WHERE id = ?'),

  // Admin - Cities
  listCities: db.prepare(`SELECT c.*, (SELECT COUNT(*) ...) as article_count ...`),
  // ... и т.д. для всех 71 statements
};
```

Затем в `+page.server.ts` файлах использовать:

```typescript
import { queries } from '$lib/server/db/database';

export const load: PageServerLoad = async () => {
  const articles = queries.listArticles.all();
  // ...
};
```

**Вариант B (workaround):** Переместить statements внутрь функций

```typescript
export const load: PageServerLoad = async () => {
  // ✅ CORRECT (inside load function)
  const listArticles = db.prepare('SELECT ...');
  const articles = listArticles.all();
  // ...
};
```

Но это менее эффективно (prepared statements пересоздаются на каждый запрос).

**Вариант A предпочтительнее:** централизация, переиспользование, лучшая производительность.

---

## Дополнительные рекомендации

### 1. Pattern consistency

В `database.ts` уже есть правильный паттерн:

```typescript
export const queries = {
  getProducts: db.prepare('SELECT * FROM products WHERE is_active = 1'),
  getBrands: db.prepare('SELECT * FROM brands WHERE is_active = 1'),
  // ... etc
};
```

Все новые admin CRUD должны следовать этому паттерну. Определения в одном месте, использование везде.

### 2. Naming convention

При добавлении в `queries`:
- `list{Entity}` — для списков (listArticles, listCities)
- `get{Entity}ById` — для получения по ID
- `create{Entity}` — для INSERT
- `update{Entity}` — для UPDATE
- `delete{Entity}` — для DELETE
- `get{Entity}By{Field}` — для фильтрации (getArticlesByCategory)

### 3. Migration priority

Начать с файлов, которые ломают build первыми (те, что импортируются при SSR):
1. `src/routes/+layout.server.ts` (root layout — влияет на все страницы)
2. `src/routes/(city)/+layout.server.ts` (city layout)
3. Остальные admin pages

---

## Test plan (после фикса)

- [ ] `npm run build` — успешно без ошибок
- [ ] `npm run preview` — production build запускается
- [ ] Admin pages — все CRUD операции работают
- [ ] City pages — layout рендерится
- [ ] Deploy на production — успешно

---

## Files to fix

<details>
<summary>Полный список файлов с module-level prepared statements (71 total)</summary>

```bash
# Получено через:
git diff e4122a5..HEAD --name-only | xargs grep -l "^const.*db.prepare" 2>/dev/null

src/routes/(admin)/admin/articles/+page.server.ts
src/routes/(admin)/admin/articles/[id]/+page.server.ts
src/routes/(admin)/admin/articles/new/+page.server.ts
src/routes/(admin)/admin/cities/+page.server.ts
src/routes/(admin)/admin/cities/[id]/+page.server.ts
src/routes/(admin)/admin/cities/new/+page.server.ts
src/routes/(admin)/admin/city-articles/+page.server.ts
src/routes/(admin)/admin/city-articles/[id]/+page.server.ts
src/routes/(admin)/admin/city-articles/new/+page.server.ts
src/routes/(admin)/admin/collections/+page.server.ts
src/routes/(admin)/admin/collections/[id]/+page.server.ts
src/routes/(admin)/admin/collections/new/+page.server.ts
src/routes/(admin)/admin/footer/+page.server.ts
src/routes/(admin)/admin/homepage/+page.server.ts
src/routes/(admin)/admin/import/+page.server.ts
src/routes/(admin)/admin/navigation/+page.server.ts
src/routes/(admin)/admin/testimonials/+page.server.ts
src/routes/(admin)/admin/testimonials/[id]/+page.server.ts
src/routes/(admin)/admin/testimonials/new/+page.server.ts
src/routes/(city)/+layout.server.ts
src/routes/+layout.server.ts
# ... (еще ~10 файлов в зависимости от session-specific изменений)
```

</details>

---

**Priority:** CRITICAL
**Action required:** Refactor all prepared statements to use centralized `queries` object
**ETA:** ~2-3 hours (add ~71 queries to database.ts + update ~30 files)
