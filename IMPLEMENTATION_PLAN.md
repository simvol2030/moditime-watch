# ПЛАН РЕАЛИЗАЦИИ: MODITIMEWATCH MVP

**Дата создания:** 2025-12-17
**Цель:** Базовый функционирующий магазин + SEO индексация
**Подход:** Минимум необходимого для работы, без излишеств

---

## 🎯 КЛЮЧЕВЫЕ ТРЕБОВАНИЯ

### Обязательный функционал:
1. ✅ Фильтрация товаров в каталоге
2. ✅ Заказы онлайн + Email/Telegram уведомления
3. ✅ Администрирование через AdminJS
4. ✅ Поиск товаров (FTS5)
5. ✅ Импорт товаров из CSV/JSON
6. ✅ Graceful degradation (товар отображается даже если данных мало)
7. ✅ SEO поддомены для городов
8. ✅ Импорт статей для городов

### Принципы реализации:
- **Простота:** Минимум кода, максимум функциональности
- **Устойчивость:** Работает даже при неполных данных
- **Администрируемость:** Всё через админку или импорт
- **SEO-first:** Индексация и скорость важнее красоты

---

## 📋 ПЛАН РЕАЛИЗАЦИИ (по приоритетам)

### **ФАЗА 1: КРИТИЧЕСКИЙ МИНИМУМ (День 1-2)**

#### Task 1.1: Email/Telegram уведомления о заказах 🔴
**Приоритет:** CRITICAL
**Время:** 3 часа
**Цель:** Получать реальные уведомления при заказе

**Файлы:**
- `frontend-sveltekit/src/lib/server/notifications/email.ts`
- `frontend-sveltekit/src/lib/server/notifications/telegram.ts`
- `frontend-sveltekit/.env`

**Что делать:**
1. Настроить SendGrid или SMTP для email
2. Создать Telegram бота через @BotFather
3. Получить chat_id группы для уведомлений
4. Добавить в .env:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=YOUR_SENDGRID_KEY
   SMTP_FROM=orders@moditimewatch.ru

   TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
   TELEGRAM_CHAT_ID=YOUR_CHAT_ID
   ```
5. Реализовать реальную отправку вместо mock
6. Тестировать: сделать заказ → проверить email + Telegram

**Критерии успеха:**
- [ ] Email приходит клиенту
- [ ] Email приходит админу
- [ ] Telegram уведомление в группу
- [ ] Если уведомление не отправилось - заказ всё равно сохраняется

---

#### Task 1.2: Инициализация БД + импорт seed данных
**Приоритет:** CRITICAL
**Время:** 1 час
**Цель:** База данных работает и наполнена

**Что делать:**
1. Запустить frontend dev сервер (создаст app.db)
2. Проверить что seed данные загрузились
3. Импортировать seed_products.sql если нужно больше товаров
4. Проверить в админке что данные видны

**Команды:**
```bash
cd frontend-sveltekit
npm run dev  # Создаст БД и seed данные

# Если нужно импортировать дополнительные товары:
cd ../data/db/sqlite
sqlite3 app.db < seed_products.sql
```

**Критерии успеха:**
- [ ] БД создана в `data/db/sqlite/app.db`
- [ ] Таблицы созданы (36 штук)
- [ ] Seed данные загружены (3 бренда, 3 товара, 3 города)
- [ ] Админка показывает данные

---

#### Task 1.3: Graceful degradation для товаров
**Приоритет:** HIGH
**Время:** 2 часа
**Цель:** Товар отображается даже если каких-то данных нет

**Файлы:**
- `frontend-sveltekit/src/routes/product/[slug]/+page.server.ts`
- `frontend-sveltekit/src/routes/product/[slug]/+page.svelte`
- `frontend-sveltekit/src/routes/catalog/+page.server.ts`

**Что делать:**
1. Добавить fallback для отсутствующих изображений:
   ```typescript
   const mainImage = images[0]?.url || `/images/placeholder-watch.jpg`;
   ```
2. Specs: если specs_json пустой - показать "Уточняйте характеристики"
3. Highlights: если пустые - не показывать блок вообще
4. Tabs: если пустые - показать только основные (Описание, Доставка, Гарантия)
5. Reviews: если нет - показать "Станьте первым кто оставит отзыв"

**Правило:** Никогда не падать с ошибкой. Показать что есть.

**Критерии успеха:**
- [ ] Товар без изображений - показывается с placeholder
- [ ] Товар без specs_json - показывается с базовой информацией
- [ ] Каталог работает даже если у товара нет category
- [ ] Нет ошибок в консоли при неполных данных

---

### **ФАЗА 2: CORE ФУНКЦИОНАЛ (День 2-3)**

#### Task 2.1: Фильтры каталога → БД
**Приоритет:** HIGH
**Время:** 4 часа
**Цель:** Динамические фильтры материалов/механизмов из БД

**Файлы:**
- `frontend-sveltekit/src/lib/server/db/database.ts` (добавить queries)
- `frontend-sveltekit/src/routes/catalog/+page.server.ts`

**Подход:**
1. Использовать таблицы `filter_attributes`, `filter_values`, `product_filters`
2. При загрузке каталога:
   ```typescript
   // Получить все атрибуты фильтров
   const materials = queries.getFilterValues.all('material');
   const mechanisms = queries.getFilterValues.all('mechanism');
   ```
3. При применении фильтра:
   ```typescript
   // Фильтровать через product_filters таблицу
   WHERE p.id IN (
     SELECT product_id FROM product_filters
     WHERE filter_value_id IN (...)
   )
   ```
4. Добавить seed данные для фильтров в database.ts

**Seed данные для фильтров:**
```sql
-- filter_attributes
INSERT INTO filter_attributes (slug, name, type) VALUES
  ('material', 'Материал корпуса', 'checkbox'),
  ('mechanism', 'Тип механизма', 'checkbox'),
  ('scenario', 'Сценарий использования', 'checkbox');

-- filter_values
INSERT INTO filter_values (attribute_id, value, label) VALUES
  (1, 'steel', 'Сталь'),
  (1, 'gold-18k', 'Золото 18К'),
  (2, 'automatic', 'Автоматический'),
  (2, 'manual', 'Механический');
```

**Критерии успеха:**
- [ ] Фильтры загружаются из БД
- [ ] При выборе фильтра - каталог обновляется
- [ ] URL содержит параметры фильтров
- [ ] Можно добавить новые фильтры через админку

---

#### Task 2.2: FTS5 поиск
**Приоритет:** HIGH
**Время:** 3 часа
**Цель:** Работающий полнотекстовый поиск

**Файлы:**
- `frontend-sveltekit/src/routes/search/+page.server.ts`
- `frontend-sveltekit/src/routes/search/+page.svelte`

**Что делать:**
1. Реализовать load функцию в +page.server.ts:
   ```typescript
   export const load: PageServerLoad = async ({ url }) => {
     const query = url.searchParams.get('q') || '';
     if (!query) return { products: [], query: '' };

     const searchSql = `
       SELECT p.*, b.name as brand_name,
         (SELECT url FROM product_images WHERE product_id = p.id AND is_main = 1 LIMIT 1) as main_image
       FROM products_fts f
       JOIN products p ON p.id = f.rowid
       JOIN brands b ON b.id = p.brand_id
       WHERE products_fts MATCH ?
       ORDER BY rank LIMIT 20
     `;
     const products = db.prepare(searchSql).all(query);
     return { products, query };
   };
   ```
2. Проверить что FTS5 триггеры работают (уже настроены в schema.sql)
3. Добавить подсветку результатов (опционально)

**Критерии успеха:**
- [ ] Поиск по названию находит товары
- [ ] Поиск по бренду работает
- [ ] Поиск по описанию работает
- [ ] Результаты ранжируются по релевантности

---

#### Task 2.3: Импорт товаров
**Приоритет:** HIGH
**Время:** 4 часа
**Цель:** Импорт товаров из CSV/JSON

**Подход:** Создать Node.js скрипт для импорта

**Файл:** `scripts/import-products.ts`

**Формат CSV:**
```csv
brand_slug,name,sku,price,description,availability_status,specs_json,image_urls
rolex,Rolex Submariner,RLX-001,1320000,"Описание",in-stock,"{""Корпус"":[{""label"":""Материал"",""value"":""Сталь""}]}","url1,url2,url3"
```

**Что делать:**
1. Парсинг CSV/JSON файла
2. Валидация данных (обязательные поля: brand_slug, name, price)
3. Проверка что бренд существует (или создать)
4. Вставка в products таблицу
5. Вставка изображений в product_images
6. Обновление FTS5 индекса (автоматически через триггеры)

**Команда:**
```bash
npm run import -- --file=products.csv --type=csv
```

**Критерии успеха:**
- [ ] Импорт из CSV работает
- [ ] Импорт из JSON работает
- [ ] Можно импортировать 100+ товаров за раз
- [ ] При ошибке - показывает какая строка проблемная
- [ ] Graceful: пропускает невалидные строки, импортирует остальные

---

### **ФАЗА 3: SEO И ГОРОДА (День 3-4)**

#### Task 3.1: Поддомены для городов
**Приоритет:** MEDIUM
**Время:** 4 часа
**Цель:** moscow.moditimewatch.ru отображает контент города

**Файлы:**
- `frontend-sveltekit/src/hooks.server.ts`
- `frontend-sveltekit/svelte.config.js`

**Что делать:**
1. Добавить определение поддомена в hooks.server.ts:
   ```typescript
   const handle: Handle = async ({ event, resolve }) => {
     const hostname = event.request.headers.get('host') || '';
     const subdomain = hostname.split('.')[0];

     // Проверить что это город
     if (subdomain !== 'www' && subdomain !== 'moditimewatch') {
       const city = queries.getCityBySlug.get(subdomain);
       if (city) {
         event.locals.city = city;
         event.locals.isSubdomain = true;
       }
     }
     return resolve(event);
   };
   ```

2. Создать отдельный layout для поддоменов:
   `src/routes/(subdomain)/+layout.server.ts`

3. Роутинг:
   - `moscow.moditimewatch.ru/` → главная города
   - `moscow.moditimewatch.ru/articles/[slug]` → статья

4. Виджет WatchSearchWidget → редирект на main domain:
   ```typescript
   const searchUrl = `https://moditimewatch.ru/catalog?search=${query}&city=${citySlug}`;
   ```

**Критерии успеха:**
- [ ] moscow.moditimewatch.ru работает (локально через /etc/hosts)
- [ ] Показывает контент города Москвы
- [ ] Виджет поиска → редирект на основной домен
- [ ] SEO метаданные корректные (canonical, og:url)

---

#### Task 3.2: Импорт статей для городов
**Приоритет:** MEDIUM
**Время:** 3 часа
**Цель:** Массовый импорт статей для programmatic SEO

**Файл:** `scripts/import-city-articles.ts`

**Формат JSON:**
```json
{
  "city_slug": "moscow",
  "articles": [
    {
      "slug": "swiss-watches-moscow",
      "title": "Где купить швейцарские часы в Москве",
      "content": "<p>Контент...</p>",
      "template_type": "unique"
    }
  ]
}
```

**Что делать:**
1. Парсинг JSON файла
2. Проверка что город существует
3. Генерация уникальных slug (если дубликаты)
4. Вставка в city_articles
5. Batch insert для производительности (1000 статей за раз)

**Шаблоны статей:**
- `standard` - базовый шаблон (используется для bulk генерации)
- `unique` - уникальная статья (написана вручную)
- `variant_A`, `variant_B` - для A/B тестирования

**Команда:**
```bash
npm run import-articles -- --city=moscow --file=moscow-articles.json
# Или массово для всех городов:
npm run import-articles -- --dir=./articles-data/
```

**Критерии успеха:**
- [ ] Можно импортировать 1000+ статей для одного города
- [ ] Slug автоматически уникализируется
- [ ] Можно импортировать для всех 250 городов скриптом
- [ ] Статьи сразу видны на поддоменах

---

### **ФАЗА 4: АДМИНКА И ФИНАЛЬНАЯ ДОРАБОТКА (День 4-5)**

#### Task 4.1: Проверка AdminJS
**Приоритет:** MEDIUM
**Время:** 2 часа
**Цель:** Убедиться что все таблицы администрируются

**Что проверить:**
1. Запустить админку: `cd backend-expressjs && npm run dev`
2. Логин: admin@example.com / admin123
3. Проверить все ресурсы:
   - Products - CRUD работает
   - Orders - можно менять статус
   - Cities - можно редактировать
   - CityArticles - можно добавлять
   - Brands, Categories - CRUD
4. Тестировать загрузку изображений
5. Проверить RBAC (права доступа)

**Если что-то не работает:**
- Добавить недостающие ресурсы в admin.ts
- Настроить custom components для сложных полей (specs_json)

**Критерии успеха:**
- [ ] Все основные таблицы доступны
- [ ] Можно создать/редактировать товар
- [ ] Можно обработать заказ (сменить статус)
- [ ] Можно добавить город и статьи к нему
- [ ] Загрузка изображений работает

---

#### Task 4.2: Error monitoring (минимальный)
**Приоритет:** LOW (но рекомендуется)
**Время:** 1 час
**Цель:** Знать когда что-то сломалось

**Подход:** Простое логирование в файл (без Sentry для MVP)

**Файл:** `frontend-sveltekit/src/hooks.server.ts`

```typescript
import { writeFileSync, appendFileSync } from 'fs';
import { join } from 'path';

const errorLogger: Handle = async ({ event, resolve }) => {
  try {
    return await resolve(event);
  } catch (error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: event.request.method,
      url: event.url.pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };

    const logPath = join(process.cwd(), '..', 'logs', 'errors.log');
    appendFileSync(logPath, JSON.stringify(logEntry) + '\n');

    throw error;
  }
};
```

**Критерии успеха:**
- [ ] Ошибки логируются в logs/errors.log
- [ ] Можно посмотреть что пошло не так
- [ ] Не ломает работу сайта

---

#### Task 4.3: Финальное тестирование
**Приоритет:** HIGH
**Время:** 2 часа
**Цель:** Убедиться что всё работает

**Чек-лист:**
1. **E-commerce flow:**
   - [ ] Открыть каталог
   - [ ] Применить фильтры (бренд, цена, материал)
   - [ ] Открыть товар
   - [ ] Добавить в корзину
   - [ ] Оформить заказ
   - [ ] Проверить email
   - [ ] Проверить Telegram
   - [ ] Зайти в админку - увидеть заказ

2. **Поиск:**
   - [ ] Найти товар по названию
   - [ ] Найти по бренду
   - [ ] Проверить что результаты корректны

3. **Города:**
   - [ ] Открыть moscow.moditimewatch.ru (локально)
   - [ ] Проверить что статьи отображаются
   - [ ] Кликнуть виджет поиска - перейти на основной домен

4. **Админка:**
   - [ ] Добавить новый товар
   - [ ] Изменить статус заказа
   - [ ] Добавить статью для города

5. **Импорт:**
   - [ ] Импортировать 10 товаров из CSV
   - [ ] Импортировать 20 статей для города
   - [ ] Проверить что всё отображается

---

## 📊 ОЦЕНКА ВРЕМЕНИ

| Фаза | Задачи | Время |
|------|--------|-------|
| **Фаза 1** | Email/Telegram + БД + Graceful | 6 ч |
| **Фаза 2** | Фильтры + Поиск + Импорт товаров | 11 ч |
| **Фаза 3** | Поддомены + Импорт статей | 7 ч |
| **Фаза 4** | Админка + Тестирование | 5 ч |
| **ИТОГО** | | **29 часов** |

**Реально:** 3-4 рабочих дня (с перерывами и багфиксами)

---

## 🎯 КРИТЕРИИ УСПЕХА MVP

### Минимально рабочий продукт должен:
- [x] Показывать каталог товаров из БД
- [x] Фильтровать товары (бренды, цена, материалы)
- [x] Искать товары (FTS5)
- [x] Оформлять заказы
- [x] Отправлять Email клиенту
- [x] Отправлять Telegram уведомление админу
- [x] Администрироваться через AdminJS
- [x] Импортировать товары из файлов
- [x] Показывать страницы городов
- [x] Импортировать статьи для городов
- [x] Работать без ошибок даже при неполных данных

---

## 🔧 ТЕХНИЧЕСКИЕ РЕШЕНИЯ

### База данных:
- **SQLite** (достаточно для 10k товаров, 250 городов, 100k статей)
- Если нужно больше → PostgreSQL (но не сейчас)

### Email:
- **SendGrid** (бесплатно 100 email/день) ИЛИ
- **SMTP** (любой провайдер)

### Telegram:
- Создать бота через @BotFather
- Добавить в группу администраторов
- Получить chat_id через `https://api.telegram.org/bot<TOKEN>/getUpdates`

### Поддомены (локально):
```bash
# /etc/hosts (Linux/Mac) или C:\Windows\System32\drivers\etc\hosts (Windows)
127.0.0.1 moscow.moditimewatch.ru
127.0.0.1 spb.moditimewatch.ru
127.0.0.1 kazan.moditimewatch.ru
```

### Production (когда будет готово):
- Nginx с wildcard субдоменами
- SSL через Let's Encrypt (certbot)
- PM2 для Node.js процессов

---

## ⚠️ ЧТО НЕ ВКЛЮЧЕНО (но можно добавить потом)

- ❌ Docker/docker-compose
- ❌ CI/CD
- ❌ E2E тесты
- ❌ CDN для изображений
- ❌ Rate limiting на API
- ❌ 2FA для админки
- ❌ Audit logs
- ❌ Performance optimization
- ❌ Social login
- ❌ Live chat

**Причина:** Это всё можно добавить после запуска, когда будет реальный трафик и понимание что нужно.

---

## 📝 ПРИМЕЧАНИЯ ДЛЯ РЕАЛИЗАЦИИ

### Graceful degradation - примеры:

```typescript
// Если нет изображений
const images = product.images?.length
  ? product.images
  : [{ url: '/images/placeholder-watch.jpg', alt: product.name }];

// Если нет specs
const specs = product.specs_json
  ? JSON.parse(product.specs_json)
  : { 'Основное': [{ label: 'Информация', value: 'Уточняйте у менеджера' }] };

// Если нет категории
const categoryName = product.category_name || 'Премиальные часы';

// Если нет availability_text
const availability = product.availability_text ||
  (product.availability_status === 'in-stock' ? 'В наличии' : 'Уточняйте');
```

### Импорт товаров - валидация:

```typescript
// Обязательные поля
const required = ['brand_slug', 'name', 'price'];
for (const field of required) {
  if (!row[field]) {
    console.warn(`Пропущена строка ${i}: отсутствует ${field}`);
    continue; // Пропускаем, не падаем
  }
}

// Проверка что бренд существует
const brand = queries.getBrandBySlug.get(row.brand_slug);
if (!brand) {
  console.warn(`Пропущена строка ${i}: бренд ${row.brand_slug} не найден`);
  continue;
}

// Валидация цены
const price = parseInt(row.price);
if (isNaN(price) || price <= 0) {
  console.warn(`Пропущена строка ${i}: некорректная цена ${row.price}`);
  continue;
}
```

---

## 🚀 ПОРЯДОК РЕАЛИЗАЦИИ

1. **Сначала аудит этого плана** (через Task tool)
2. Исправить план на основе замечаний
3. Начать реализацию с Фазы 1
4. После каждой задачи - коммит в git
5. После каждой фазы - тестирование
6. Финальное тестирование всего потока

---

## ✅ ГОТОВО К АУДИТУ

Этот план учитывает:
- ✅ Базовый функционал без излишеств
- ✅ Фильтрация товаров
- ✅ Email + Telegram уведомления
- ✅ Администрирование через AdminJS
- ✅ Поиск (FTS5)
- ✅ Импорт товаров и статей
- ✅ Graceful degradation
- ✅ SEO поддомены для городов
- ✅ Простота реализации
- ✅ Устойчивость к ошибкам

**Следующий шаг:** Аудит плана для выявления потенциальных проблем
