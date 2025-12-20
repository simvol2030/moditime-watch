# ПЛАН РЕАЛИЗАЦИИ: MODITIMEWATCH FULL MVP

**Дата:** 2025-12-20
**Статус:** В разработке
**Оценка времени:** ~48 часов
**Приоритет:** Качество важнее скорости

---

## КРАТКОЕ РЕЗЮМЕ ТРЕБОВАНИЙ

На основе анализа проекта и уточняющих вопросов:

1. **Email уведомления** - настройки в БД (меняются через админку)
2. **Telegram уведомления** - токен бота и ID канала из БД
3. **Импорт товаров** - CSV с шаблоном, доступным в админке
4. **Поддомены** - 2 города для теста, потом скрипт на 250
5. **Статьи для городов** - Markdown + YAML frontmatter, 50-100 на город
6. **Workflow статей** - создание → масштабирование скриптом → загрузка

---

## ФАЗА 0: ПОДГОТОВКА ИНФРАСТРУКТУРЫ
**Время: 3 часа**

### 0.1 Инициализация базы данных (1 час)

**Проблема:** БД `app.db` отсутствует, schema.sql не применена.

**Файлы:**
- `frontend-sveltekit/src/lib/server/db/database.ts` - проверить auto-init
- `schema.sql` - применить если нужно
- `data/db/sqlite/seed_products.sql` - импортировать seed данные

**Действия:**
```bash
# 1. Запустить frontend чтобы создалась БД
cd frontend-sveltekit && npm run dev

# 2. Применить seed данные
sqlite3 ../data/db/sqlite/app.db < ../data/db/sqlite/seed_products.sql
```

**Риски:**
- WAL mode конфликты при параллельном доступе frontend + backend
- Seed данные могут быть несовместимы с текущей schema

### 0.2 Создание таблицы настроек (1 час)

**Новая таблица `site_settings`:**
```sql
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'string', -- string, json, boolean, number
    category TEXT DEFAULT 'general', -- general, email, telegram, seo
    description TEXT,
    is_sensitive BOOLEAN DEFAULT 0, -- для паролей/токенов
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Начальные настройки
INSERT INTO site_settings (key, value, type, category, description, is_sensitive) VALUES
-- Email настройки
('email_provider', 'smtp', 'string', 'email', 'Провайдер: smtp, sendgrid, mailgun'),
('smtp_host', 'smtp.example.com', 'string', 'email', 'SMTP сервер'),
('smtp_port', '587', 'number', 'email', 'SMTP порт'),
('smtp_user', '', 'string', 'email', 'SMTP пользователь'),
('smtp_password', '', 'string', 'email', 'SMTP пароль', 1),
('smtp_from_email', 'orders@moditimewatch.ru', 'string', 'email', 'Email отправителя'),
('smtp_from_name', 'Moditimewatch', 'string', 'email', 'Имя отправителя'),
-- Telegram настройки
('telegram_bot_token', '', 'string', 'telegram', 'Токен Telegram бота', 1),
('telegram_channel_id', '', 'string', 'telegram', 'ID канала для уведомлений'),
('telegram_enabled', 'false', 'boolean', 'telegram', 'Включить Telegram уведомления'),
-- Общие настройки
('site_name', 'Moditimewatch', 'string', 'general', 'Название сайта'),
('site_url', 'https://moditimewatch.ru', 'string', 'general', 'URL сайта'),
('admin_email', 'admin@moditimewatch.ru', 'string', 'general', 'Email администратора');
```

**Файлы для изменения:**
- `schema.sql` - добавить таблицу
- `frontend-sveltekit/src/lib/server/db/database.ts` - добавить queries
- `backend-expressjs/src/db.ts` - добавить Sequelize модель

### 0.3 Добавление модели в AdminJS (1 час)

**Файл:** `backend-expressjs/src/db.ts`

```typescript
const SiteSettings = sequelize.define('SiteSettings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING, unique: true, allowNull: false },
    value: { type: DataTypes.TEXT },
    type: { type: DataTypes.STRING, defaultValue: 'string' },
    category: { type: DataTypes.STRING, defaultValue: 'general' },
    description: { type: DataTypes.TEXT },
    is_sensitive: { type: DataTypes.BOOLEAN, defaultValue: false },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'site_settings',
    timestamps: false
});
```

**Файл:** `backend-expressjs/src/admin.ts`

Добавить ресурс SiteSettings в группу "Настройки" с:
- Группировка по category
- Скрытие sensitive полей при отображении
- Валидация типов

---

## ФАЗА 1: EMAIL И TELEGRAM УВЕДОМЛЕНИЯ
**Время: 6 часов**

### 1.1 Рефакторинг email.ts (3 часа)

**Файл:** `frontend-sveltekit/src/lib/server/notifications/email.ts`

**Текущее состояние:** Mock реализация (только console.log)

**Требования:**
- Получать настройки SMTP из БД (таблица site_settings)
- Поддержка нескольких провайдеров (SMTP, SendGrid)
- HTML шаблоны писем
- Fallback на mock если настройки не заданы

**Новая структура:**
```typescript
import nodemailer from 'nodemailer';
import { getSettings } from '../db/settings';

interface EmailConfig {
    provider: 'smtp' | 'sendgrid' | 'mock';
    smtp?: { host: string; port: number; user: string; password: string; };
    fromEmail: string;
    fromName: string;
}

async function getEmailConfig(): Promise<EmailConfig> {
    const settings = await getSettings('email');
    // Если настройки пустые - возвращаем mock
    if (!settings.smtp_host || !settings.smtp_user) {
        return { provider: 'mock', fromEmail: '', fromName: '' };
    }
    return {
        provider: settings.email_provider as 'smtp' | 'sendgrid',
        smtp: {
            host: settings.smtp_host,
            port: parseInt(settings.smtp_port),
            user: settings.smtp_user,
            password: settings.smtp_password,
        },
        fromEmail: settings.smtp_from_email,
        fromName: settings.smtp_from_name,
    };
}

export async function sendOrderConfirmation(order: Order): Promise<boolean> {
    const config = await getEmailConfig();

    if (config.provider === 'mock') {
        console.log('[Email MOCK] Would send order confirmation:', order.order_number);
        return true; // Не блокируем checkout
    }

    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.password },
    });

    try {
        await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to: order.customer_email,
            subject: `Заказ #${order.order_number} подтверждён`,
            html: generateOrderEmailHtml(order),
        });
        return true;
    } catch (error) {
        console.error('[Email ERROR]', error);
        // Логировать ошибку, но не блокировать checkout
        return false;
    }
}
```

**Зависимости:**
```bash
cd frontend-sveltekit
npm install nodemailer
npm install -D @types/nodemailer
```

### 1.2 Рефакторинг telegram.ts (2 часа)

**Файл:** `frontend-sveltekit/src/lib/server/notifications/telegram.ts`

**Текущее состояние:** Mock реализация

**Новая структура:**
```typescript
interface TelegramConfig {
    enabled: boolean;
    botToken: string;
    channelId: string;
}

async function getTelegramConfig(): Promise<TelegramConfig> {
    const settings = await getSettings('telegram');
    return {
        enabled: settings.telegram_enabled === 'true',
        botToken: settings.telegram_bot_token || '',
        channelId: settings.telegram_channel_id || '',
    };
}

export async function sendOrderNotification(order: Order): Promise<boolean> {
    const config = await getTelegramConfig();

    if (!config.enabled || !config.botToken || !config.channelId) {
        console.log('[Telegram MOCK] Would send:', order.order_number);
        return true;
    }

    const message = formatOrderMessage(order);
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: config.channelId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error('[Telegram ERROR]', error);
        return false;
    }
}

function formatOrderMessage(order: Order): string {
    return `
🛒 <b>Новый заказ #${order.order_number}</b>

👤 ${order.customer_name}
📧 ${order.customer_email}
📱 ${order.customer_phone}

💰 Сумма: ${order.total_amount.toLocaleString('ru-RU')} ₽

📦 Товары:
${order.items.map(i => `• ${i.name} x${i.quantity}`).join('\n')}

<a href="https://moditimewatch.ru/admin/orders/${order.id}">Открыть в админке</a>
    `.trim();
}
```

### 1.3 Интеграция в checkout (1 час)

**Файл:** `frontend-sveltekit/src/routes/checkout/+page.server.ts`

**Изменения:**
```typescript
import { sendOrderConfirmation } from '$lib/server/notifications/email';
import { sendOrderNotification } from '$lib/server/notifications/telegram';

// После успешного создания заказа:
const order = await createOrder(orderData);

// Отправляем уведомления параллельно (не блокируем ответ)
Promise.all([
    sendOrderConfirmation(order),
    sendOrderNotification(order),
]).catch(err => console.error('[Notifications Error]', err));

// Возвращаем успех сразу
return { success: true, orderNumber: order.order_number };
```

**Риски:**
- Если SMTP сервер недоступен - timeout может замедлить checkout
- Решение: Promise.all с timeout 5 секунд

---

## ФАЗА 2: ДИНАМИЧЕСКИЕ ФИЛЬТРЫ КАТАЛОГА
**Время: 5 часов**

### 2.1 Анализ текущего состояния

**Файл:** `frontend-sveltekit/src/routes/catalog/+page.server.ts`

**Что работает:**
- Фильтр по брендам (из БД)
- Фильтр по цене
- Фильтр по наличию
- Сортировка

**Что НЕ работает:**
- Материалы, механизмы, стили - hardcoded, не фильтруют

**Проблема:** Таблицы `filter_attributes` и `product_filters` существуют в schema, но:
- Не заполнены seed данными
- Нет связи в queries

### 2.2 Seed данных для фильтров (1 час)

**Файл:** `data/db/sqlite/seed_filters.sql` (НОВЫЙ)

```sql
-- Атрибуты фильтров
INSERT INTO filter_attributes (name, display_name, type, sort_order, is_active) VALUES
('material', 'Материал корпуса', 'select', 1, 1),
('movement', 'Механизм', 'select', 2, 1),
('style', 'Стиль', 'select', 3, 1),
('water_resistance', 'Водозащита', 'select', 4, 1),
('case_size', 'Размер корпуса', 'range', 5, 1);

-- Опции для фильтра "Материал"
INSERT INTO filter_options (attribute_id, value, display_name, sort_order) VALUES
((SELECT id FROM filter_attributes WHERE name = 'material'), 'steel', 'Сталь', 1),
((SELECT id FROM filter_attributes WHERE name = 'material'), 'gold', 'Золото', 2),
((SELECT id FROM filter_attributes WHERE name = 'material'), 'titanium', 'Титан', 3),
((SELECT id FROM filter_attributes WHERE name = 'material'), 'ceramic', 'Керамика', 4);

-- Опции для фильтра "Механизм"
INSERT INTO filter_options (attribute_id, value, display_name, sort_order) VALUES
((SELECT id FROM filter_attributes WHERE name = 'movement'), 'automatic', 'Автоматический', 1),
((SELECT id FROM filter_attributes WHERE name = 'movement'), 'manual', 'Ручной завод', 2),
((SELECT id FROM filter_attributes WHERE name = 'movement'), 'quartz', 'Кварцевый', 3);

-- Опции для фильтра "Стиль"
INSERT INTO filter_options (attribute_id, value, display_name, sort_order) VALUES
((SELECT id FROM filter_attributes WHERE name = 'style'), 'classic', 'Классика', 1),
((SELECT id FROM filter_attributes WHERE name = 'style'), 'sport', 'Спорт', 2),
((SELECT id FROM filter_attributes WHERE name = 'style'), 'luxury', 'Люкс', 3),
((SELECT id FROM filter_attributes WHERE name = 'style'), 'casual', 'Повседневные', 4);

-- Связи продуктов с фильтрами (пример для seed товаров)
-- Rolex Submariner
INSERT INTO product_filters (product_id, attribute_id, option_id)
SELECT 1, fa.id, fo.id
FROM filter_attributes fa
JOIN filter_options fo ON fo.attribute_id = fa.id
WHERE fa.name = 'material' AND fo.value = 'steel';

-- ... аналогично для других товаров
```

### 2.3 Обновление queries в database.ts (2 часа)

**Файл:** `frontend-sveltekit/src/lib/server/db/database.ts`

```typescript
// Получить все активные фильтры с опциями
getFilterAttributes: db.prepare(`
    SELECT
        fa.id, fa.name, fa.display_name, fa.type,
        json_group_array(json_object(
            'id', fo.id,
            'value', fo.value,
            'display_name', fo.display_name,
            'count', (
                SELECT COUNT(DISTINCT pf.product_id)
                FROM product_filters pf
                WHERE pf.option_id = fo.id
            )
        )) as options
    FROM filter_attributes fa
    LEFT JOIN filter_options fo ON fo.attribute_id = fa.id
    WHERE fa.is_active = 1
    GROUP BY fa.id
    ORDER BY fa.sort_order
`),

// Фильтрация продуктов с динамическими атрибутами
getFilteredProducts: db.prepare(`
    SELECT DISTINCT p.*, b.name as brand_name
    FROM products p
    JOIN brands b ON b.id = p.brand_id
    LEFT JOIN product_filters pf ON pf.product_id = p.id
    LEFT JOIN filter_options fo ON fo.id = pf.option_id
    LEFT JOIN filter_attributes fa ON fa.id = fo.attribute_id
    WHERE p.is_active = 1
    AND (? IS NULL OR b.id = ?)
    AND (? IS NULL OR p.price >= ?)
    AND (? IS NULL OR p.price <= ?)
    AND (? IS NULL OR (fa.name = 'material' AND fo.value IN (?)))
    AND (? IS NULL OR (fa.name = 'movement' AND fo.value IN (?)))
    ORDER BY p.created_at DESC
`),
```

### 2.4 Обновление CatalogFilters.svelte (1 час)

**Файл:** `frontend-sveltekit/src/lib/components/sections/CatalogFilters.svelte`

Заменить hardcoded опции на динамические из props:
- Получать `filterAttributes` из page data
- Рендерить фильтры динамически
- Отображать количество товаров для каждой опции

### 2.5 Обновление catalog/+page.server.ts (1 час)

**Файл:** `frontend-sveltekit/src/routes/catalog/+page.server.ts`

- Загружать фильтры из БД
- Парсить URL параметры для динамических фильтров
- Применять фильтрацию через новые queries

---

## ФАЗА 3: ПОИСК (FTS5)
**Время: 2 часа**

### 3.1 Анализ текущего состояния

**Хорошая новость:** FTS5 уже настроен в schema.sql!

```sql
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
    name, description, brand_name,
    content='products',
    content_rowid='id'
);
```

Триггеры для синхронизации тоже есть.

### 3.2 Создание search endpoint (1 час)

**Файл:** `frontend-sveltekit/src/routes/api/search/+server.ts` (НОВЫЙ)

```typescript
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db, queries } from '$lib/server/db/database';

export const GET: RequestHandler = async ({ url }) => {
    const query = url.searchParams.get('q')?.trim();

    if (!query || query.length < 2) {
        return json({ results: [], query: '' });
    }

    // Экранируем специальные символы FTS5
    const sanitizedQuery = query.replace(/['"*()]/g, ' ').trim();
    const ftsQuery = sanitizedQuery.split(/\s+/).map(w => `${w}*`).join(' ');

    const results = db.prepare(`
        SELECT p.id, p.name, p.slug, p.price, p.image_url,
               b.name as brand_name,
               highlight(products_fts, 0, '<mark>', '</mark>') as name_highlighted
        FROM products_fts f
        JOIN products p ON p.id = f.rowid
        JOIN brands b ON b.id = p.brand_id
        WHERE products_fts MATCH ?
        AND p.is_active = 1
        ORDER BY rank
        LIMIT 20
    `).all(ftsQuery);

    return json({ results, query });
};
```

### 3.3 Создание UI поиска (1 час)

**Файл:** `frontend-sveltekit/src/lib/components/ui/SearchModal.svelte` (НОВЫЙ)

- Модальное окно поиска (Ctrl+K или клик на иконку)
- Debounced input (300ms)
- Отображение результатов с подсветкой
- Навигация клавиатурой

---

## ФАЗА 4: ИМПОРТ ТОВАРОВ
**Время: 8 часов**

### 4.1 Структура CSV файла (1 час)

**Файл:** `docs/import-templates/products-template.csv` (НОВЫЙ)

```csv
sku,name,brand,price,old_price,description,image_url,gallery_images,material,movement,style,water_resistance,case_size,availability,is_active
ROLEX-SUB-001,Rolex Submariner Date,Rolex,1250000,,Легендарные дайверские часы,https://example.com/img.jpg,"img1.jpg,img2.jpg",steel,automatic,sport,300m,41,in_stock,true
```

**Поля:**
- `sku` - уникальный артикул (обязательно)
- `name` - название товара (обязательно)
- `brand` - название бренда (должен существовать в БД)
- `price` - цена (обязательно)
- `old_price` - старая цена (опционально)
- `description` - описание (опционально)
- `image_url` - URL главного изображения
- `gallery_images` - URL доп. изображений через запятую
- `material`, `movement`, `style` - значения фильтров
- `availability` - in_stock, out_of_stock, pre_order
- `is_active` - true/false

### 4.2 Скрипт импорта (4 часа)

**Файл:** `scripts/import-products.ts` (НОВЫЙ)

```typescript
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

interface ImportResult {
    total: number;
    imported: number;
    updated: number;
    errors: Array<{ row: number; sku: string; error: string }>;
}

export async function importProducts(csvPath: string): Promise<ImportResult> {
    const db = new Database(path.join(__dirname, '../data/db/sqlite/app.db'));
    const csvContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    const result: ImportResult = {
        total: records.length,
        imported: 0,
        updated: 0,
        errors: [],
    };

    // Начинаем транзакцию для rollback при ошибке
    const transaction = db.transaction(() => {
        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            try {
                // Проверяем обязательные поля
                if (!row.sku || !row.name || !row.price) {
                    throw new Error('Missing required fields: sku, name, or price');
                }

                // Находим бренд
                const brand = db.prepare('SELECT id FROM brands WHERE name = ?').get(row.brand);
                if (!brand && row.brand) {
                    // Создаём бренд если не существует
                    const brandResult = db.prepare(
                        'INSERT INTO brands (name, slug) VALUES (?, ?)'
                    ).run(row.brand, slugify(row.brand));
                    brand = { id: brandResult.lastInsertRowid };
                }

                // Проверяем существует ли товар
                const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(row.sku);

                if (existing) {
                    // UPDATE
                    db.prepare(`
                        UPDATE products SET
                            name = ?, brand_id = ?, price = ?, old_price = ?,
                            description = ?, image_url = ?, availability_status = ?,
                            is_active = ?, updated_at = CURRENT_TIMESTAMP
                        WHERE sku = ?
                    `).run(
                        row.name, brand?.id, parseFloat(row.price),
                        row.old_price ? parseFloat(row.old_price) : null,
                        row.description || null, row.image_url || null,
                        row.availability || 'in_stock',
                        row.is_active !== 'false' ? 1 : 0,
                        row.sku
                    );
                    result.updated++;
                } else {
                    // INSERT
                    const slug = slugify(row.name);
                    db.prepare(`
                        INSERT INTO products (
                            sku, name, slug, brand_id, price, old_price,
                            description, image_url, availability_status, is_active
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        row.sku, row.name, slug, brand?.id,
                        parseFloat(row.price),
                        row.old_price ? parseFloat(row.old_price) : null,
                        row.description || null, row.image_url || null,
                        row.availability || 'in_stock',
                        row.is_active !== 'false' ? 1 : 0
                    );
                    result.imported++;
                }

                // Обрабатываем фильтры
                if (row.material || row.movement || row.style) {
                    // ... логика добавления в product_filters
                }

            } catch (error) {
                result.errors.push({
                    row: i + 2, // +2 потому что header + 0-based index
                    sku: row.sku || 'unknown',
                    error: error.message,
                });
            }
        }
    });

    try {
        transaction();
    } catch (error) {
        console.error('Transaction failed, rolling back:', error);
        throw error;
    }

    return result;
}
```

### 4.3 CLI для импорта (1 час)

**Файл:** `scripts/cli.ts`

```typescript
import { importProducts } from './import-products';

const command = process.argv[2];
const filePath = process.argv[3];

switch (command) {
    case 'import:products':
        if (!filePath) {
            console.error('Usage: npm run import:products <path-to-csv>');
            process.exit(1);
        }
        const result = await importProducts(filePath);
        console.log(`
Import completed:
- Total rows: ${result.total}
- Imported: ${result.imported}
- Updated: ${result.updated}
- Errors: ${result.errors.length}
        `);
        if (result.errors.length > 0) {
            console.log('\nErrors:');
            result.errors.forEach(e => console.log(`  Row ${e.row}: ${e.error}`));
        }
        break;

    default:
        console.log('Available commands: import:products');
}
```

### 4.4 Интеграция в AdminJS (2 часа)

**Файл:** `backend-expressjs/src/admin.ts`

Добавить кастомную страницу импорта:
- Форма загрузки CSV
- Скачивание шаблона
- Отображение результатов импорта
- История импортов

---

## ФАЗА 5: GRACEFUL DEGRADATION
**Время: 3 часа**

### 5.1 Концепция

Товар должен отображаться даже если некоторые данные отсутствуют:
- Нет изображения → показать placeholder
- Нет описания → показать "Описание скоро появится"
- Нет цены → НЕ показывать товар в каталоге
- Нет бренда → показать "Без бренда"

### 5.2 Обновление ProductCard.svelte (1 час)

```svelte
<script>
    export let product;

    $: hasImage = product.image_url && !product.image_url.includes('placeholder');
    $: hasDescription = product.description && product.description.length > 10;
    $: hasBrand = product.brand_name;
</script>

<div class="product-card">
    {#if hasImage}
        <img src={product.image_url} alt={product.name} />
    {:else}
        <div class="placeholder-image">
            <span>Фото скоро появится</span>
        </div>
    {/if}

    <h3>{product.name}</h3>

    {#if hasBrand}
        <span class="brand">{product.brand_name}</span>
    {/if}

    <span class="price">{formatPrice(product.price)} ₽</span>
</div>
```

### 5.3 Обновление ProductPage (1 час)

**Файл:** `frontend-sveltekit/src/routes/product/[slug]/+page.svelte`

- Скрывать пустые табы (спецификации, отзывы)
- Показывать fallback для отсутствующей галереи
- Graceful handling для отсутствующих данных

### 5.4 Валидация при импорте (1 час)

В скрипте импорта добавить уровни валидации:
- `required` - без этого поля товар не импортируется (sku, name, price)
- `recommended` - предупреждение в логе (description, image_url)
- `optional` - молча пропускаем (old_price, gallery)

---

## ФАЗА 6: SEO ПОДДОМЕНЫ ДЛЯ ГОРОДОВ
**Время: 12 часов**

### 6.1 Архитектура

```
moditimewatch.ru           - основной каталог
moscow.moditimewatch.ru    - SEO контент для Москвы + виджет
spb.moditimewatch.ru       - SEO контент для СПб + виджет
```

**Как это работает:**
1. Nginx/DNS настроен на wildcard *.moditimewatch.ru
2. hooks.server.ts определяет поддомен из Host header
3. Layout загружает данные города
4. Контент адаптируется под город

### 6.2 Обновление hooks.server.ts (2 часа)

**Файл:** `frontend-sveltekit/src/hooks.server.ts`

```typescript
import type { Handle } from '@sveltejs/kit';
import { queries } from '$lib/server/db/database';

export const handle: Handle = async ({ event, resolve }) => {
    const hostname = event.request.headers.get('host') || '';

    // Парсим поддомен
    // moscow.moditimewatch.ru → moscow
    // moditimewatch.ru → null
    // localhost:5173 → null
    let citySlug: string | null = null;

    const parts = hostname.split('.');
    if (parts.length >= 3) { // subdomain.domain.tld
        const potentialCity = parts[0];
        // Проверяем что это не www и не другие служебные поддомены
        if (!['www', 'api', 'admin', 'cdn'].includes(potentialCity)) {
            citySlug = potentialCity;
        }
    }

    // Если есть поддомен - загружаем город
    if (citySlug) {
        const city = queries.getCityBySlug.get(citySlug);
        if (city) {
            event.locals.city = city;
            event.locals.isSubdomain = true;
            event.locals.citySlug = citySlug;
        } else {
            // Город не найден - редирект на основной домен
            return new Response(null, {
                status: 302,
                headers: { Location: 'https://moditimewatch.ru' }
            });
        }
    }

    // CSRF: Валидация Origin для поддоменов
    const origin = event.request.headers.get('origin');
    if (origin) {
        const originHost = new URL(origin).hostname;
        const allowedPattern = /^([\w-]+\.)?moditimewatch\.ru$/;
        if (!allowedPattern.test(originHost) && !originHost.includes('localhost')) {
            return new Response('Forbidden', { status: 403 });
        }
    }

    return resolve(event);
};
```

### 6.3 Layout для поддоменов (2 часа)

**Файл:** `frontend-sveltekit/src/routes/+layout.server.ts`

```typescript
export const load: LayoutServerLoad = async ({ locals }) => {
    // Базовые данные сайта
    const navigation = await queries.getNavigation.all();
    const siteSettings = await queries.getSiteSettings.all();

    // Если это поддомен города
    if (locals.isSubdomain && locals.city) {
        return {
            navigation,
            siteSettings,
            city: locals.city,
            isSubdomain: true,
            // Модифицированные данные для города
            seo: {
                title: `Часы в ${locals.city.name_prepositional} | Moditimewatch`,
                description: locals.city.meta_description,
            }
        };
    }

    return { navigation, siteSettings, city: null, isSubdomain: false };
};
```

### 6.4 Главная страница поддомена (3 часа)

**Файл:** `frontend-sveltekit/src/routes/+page.svelte`

Если `$page.data.isSubdomain`:
- Показать hero с упоминанием города
- Показать статьи для этого города
- Показать виджет каталога (ссылается на основной сайт)
- Локальные контакты/доставка для города

```svelte
<script>
    import { page } from '$app/stores';
    import WatchSearchWidget from '$lib/components/widgets/WatchSearchWidget.svelte';
    import CityArticles from '$lib/components/sections/CityArticles.svelte';
</script>

{#if $page.data.isSubdomain}
    <!-- Версия для поддомена города -->
    <section class="hero">
        <h1>Премиальные часы в {$page.data.city.name_prepositional}</h1>
        <p>Официальный дилер в вашем городе</p>
    </section>

    <WatchSearchWidget
        city={$page.data.city}
        redirectUrl="https://moditimewatch.ru/catalog"
    />

    <CityArticles cityId={$page.data.city.id} />
{:else}
    <!-- Обычная главная страница -->
    <HeroSection />
    <Collections />
    <!-- ... -->
{/if}
```

### 6.5 Статьи для городов (3 часа)

**Таблица уже существует:** `city_articles`

**Файл:** `frontend-sveltekit/src/routes/[city]/articles/[slug]/+page.server.ts`

```typescript
export const load: PageServerLoad = async ({ params, locals }) => {
    if (!locals.isSubdomain) {
        throw redirect(302, '/');
    }

    const article = queries.getCityArticle.get(locals.city.id, params.slug);
    if (!article) {
        throw error(404, 'Статья не найдена');
    }

    return { article };
};
```

### 6.6 Тестирование поддоменов локально (2 часа)

**Файл:** `/etc/hosts` (локально)
```
127.0.0.1 moditimewatch.local
127.0.0.1 moscow.moditimewatch.local
127.0.0.1 spb.moditimewatch.local
```

**Nginx конфиг для production:**
```nginx
server {
    listen 80;
    server_name *.moditimewatch.ru moditimewatch.ru;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## ФАЗА 7: ИМПОРТ СТАТЕЙ (MARKDOWN + YAML)
**Время: 6 часов**

### 7.1 Структура Markdown файлов

**Файл:** `docs/import-templates/article-template.md`

```markdown
---
title: "Лучшие часы для бизнесмена в Москве"
slug: "luchshie-chasy-dlya-biznesmena"
city: moscow
category: guides
excerpt: "Как выбрать идеальные часы для делового человека"
image: /images/articles/business-watches.jpg
author: Эксперт Moditimewatch
published: true
publishedAt: 2025-01-15
seo:
  title: "Лучшие часы для бизнесмена в Москве | Moditimewatch"
  description: "Рейтинг премиальных часов для деловых людей..."
  keywords: часы для бизнесмена, купить часы москва
---

# Лучшие часы для бизнесмена в Москве

Выбор часов для делового человека — это не просто покупка аксессуара...

## Топ-5 моделей

### 1. Rolex Datejust
Классика вне времени...

### 2. Omega Seamaster
Идеальный баланс...
```

### 7.2 Workflow обработки статей

```
1. Создание шаблона статьи (article-template.md)
    ↓
2. Написание базовой статьи с {city} плейсхолдерами
    ↓
3. Скрипт масштабирования (generate-city-articles.ts)
   - Читает шаблон
   - Генерирует 250 версий для каждого города
   - Заменяет {city}, {city_prepositional}, {city_genitive}
    ↓
4. Скрипт импорта (import-articles.ts)
   - Читает все .md файлы из директории
   - Парсит YAML frontmatter
   - Загружает в БД (таблица city_articles)
```

### 7.3 Скрипт генерации статей для городов (3 часа)

**Файл:** `scripts/generate-city-articles.ts`

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface City {
    slug: string;
    name: string;
    name_prepositional: string; // "в Москве"
    name_genitive: string; // "Москвы"
}

const cities: City[] = [
    { slug: 'moscow', name: 'Москва', name_prepositional: 'Москве', name_genitive: 'Москвы' },
    { slug: 'spb', name: 'Санкт-Петербург', name_prepositional: 'Санкт-Петербурге', name_genitive: 'Санкт-Петербурга' },
    // ... загрузить из cities.json или БД
];

async function generateArticles(templatePath: string, outputDir: string) {
    const template = fs.readFileSync(templatePath, 'utf-8');
    const { data: frontmatter, content } = matter(template);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    for (const city of cities) {
        // Заменяем плейсхолдеры
        let cityContent = content
            .replace(/\{city\}/g, city.name)
            .replace(/\{city_prepositional\}/g, city.name_prepositional)
            .replace(/\{city_genitive\}/g, city.name_genitive);

        let cityFrontmatter = {
            ...frontmatter,
            city: city.slug,
            slug: `${frontmatter.slug}-${city.slug}`,
            title: frontmatter.title.replace(/\{city\}/g, city.name),
        };

        // Собираем файл
        const output = matter.stringify(cityContent, cityFrontmatter);
        const outputPath = path.join(outputDir, `${cityFrontmatter.slug}.md`);

        fs.writeFileSync(outputPath, output);
        console.log(`Generated: ${outputPath}`);
    }
}

// CLI
const templatePath = process.argv[2];
const outputDir = process.argv[3] || './generated-articles';

if (!templatePath) {
    console.error('Usage: npx ts-node generate-city-articles.ts <template.md> [output-dir]');
    process.exit(1);
}

generateArticles(templatePath, outputDir);
```

### 7.4 Скрипт импорта статей (2 часа)

**Файл:** `scripts/import-articles.ts`

```typescript
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';
import Database from 'better-sqlite3';

interface ArticleData {
    title: string;
    slug: string;
    city: string;
    content: string;
    content_html: string;
    excerpt?: string;
    image?: string;
    author?: string;
    published: boolean;
    published_at?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
}

async function importArticles(articlesDir: string): Promise<void> {
    const db = new Database('./data/db/sqlite/app.db');

    const files = fs.readdirSync(articlesDir)
        .filter(f => f.endsWith('.md'));

    console.log(`Found ${files.length} markdown files`);

    const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO city_articles (
            city_id, title, slug, content, content_html, excerpt,
            image_url, author, is_published, published_at,
            meta_title, meta_description, meta_keywords
        ) VALUES (
            (SELECT id FROM cities WHERE slug = ?),
            ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?
        )
    `);

    const transaction = db.transaction(() => {
        for (const file of files) {
            const filePath = path.join(articlesDir, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const { data, content } = matter(fileContent);

            // Конвертируем Markdown в HTML
            const contentHtml = marked(content);

            insertStmt.run(
                data.city,
                data.title,
                data.slug,
                content,
                contentHtml,
                data.excerpt || null,
                data.image || null,
                data.author || 'Moditimewatch',
                data.published ? 1 : 0,
                data.publishedAt || null,
                data.seo?.title || data.title,
                data.seo?.description || data.excerpt,
                data.seo?.keywords || null
            );

            console.log(`Imported: ${data.slug}`);
        }
    });

    transaction();
    console.log('Import completed!');
}

// CLI
const articlesDir = process.argv[2];
if (!articlesDir) {
    console.error('Usage: npx ts-node import-articles.ts <articles-directory>');
    process.exit(1);
}

importArticles(articlesDir);
```

### 7.5 Шаблон статьи (1 час)

**Файл:** `content/templates/city-article-template.md`

```markdown
---
title: "Где купить оригинальные часы в {city}"
slug: "gde-kupit-originalnye-chasy"
city: "{city_slug}"
category: guides
excerpt: "Полный гид по покупке оригинальных часов в {city_prepositional}"
image: /images/articles/original-watches.jpg
author: Эксперт Moditimewatch
published: true
publishedAt: 2025-01-01
seo:
  title: "Где купить оригинальные часы в {city} | Moditimewatch"
  description: "Советы по покупке оригинальных часов в {city_prepositional}. Как отличить подделку, где найти официального дилера."
  keywords: "купить часы {city}, оригинальные часы {city}"
---

# Где купить оригинальные часы в {city}

Покупка премиальных часов — это серьёзная инвестиция. В {city_prepositional}
есть несколько способов приобрести оригинальные часы известных брендов.

## Почему важно покупать у официального дилера

При покупке в {city_prepositional} важно...

## Наш бутик в {city_prepositional}

Moditimewatch — официальный дилер ведущих часовых брендов.
Мы работаем в {city_prepositional} с 2020 года.

### Наши преимущества:
- Только оригинальные часы с гарантией
- Бесплатная доставка по {city_genitive}
- Сервисное обслуживание
- Гибкие условия оплаты

[Смотреть каталог часов →](https://moditimewatch.ru/catalog)
```

---

## ФАЗА 8: ФИНАЛИЗАЦИЯ И ТЕСТИРОВАНИЕ
**Время: 3 часа**

### 8.1 Проверка AdminJS (1 час)

Убедиться что все новые модели доступны в админке:
- [ ] SiteSettings - редактирование настроек
- [ ] FilterAttributes - управление фильтрами
- [ ] FilterOptions - опции фильтров
- [ ] Cities - управление городами
- [ ] CityArticles - статьи городов
- [ ] Import Products - страница импорта

### 8.2 Тестирование потоков (1.5 часа)

**Чеклист:**
- [ ] Создать заказ → проверить email в inbox
- [ ] Создать заказ → проверить Telegram канал
- [ ] Импорт 10 товаров из CSV
- [ ] Поиск по названию товара
- [ ] Фильтрация по материалу
- [ ] Открыть поддомен moscow.localhost:5173
- [ ] Импортировать 5 статей для Москвы

### 8.3 Документация (0.5 часа)

Обновить CLAUDE.md:
- Добавить инструкции по импорту
- Добавить настройку поддоменов
- Обновить статус готовности

---

## СВОДНАЯ ТАБЛИЦА

| Фаза | Описание | Время | Зависимости |
|------|----------|-------|-------------|
| 0 | Подготовка инфраструктуры | 3 ч | - |
| 1 | Email/Telegram уведомления | 6 ч | Фаза 0 |
| 2 | Динамические фильтры | 5 ч | Фаза 0 |
| 3 | Поиск FTS5 | 2 ч | Фаза 0 |
| 4 | Импорт товаров | 8 ч | Фаза 0, 2 |
| 5 | Graceful degradation | 3 ч | - |
| 6 | SEO поддомены | 12 ч | Фаза 0 |
| 7 | Импорт статей | 6 ч | Фаза 6 |
| 8 | Финализация | 3 ч | Все |

**ИТОГО: 48 часов**

---

## РИСКИ И МИТИГАЦИЯ

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| SMTP сервер недоступен | Средняя | Высокое | Fallback на mock + логирование |
| Конфликт WAL mode SQLite | Высокая | Среднее | Единый connection pool |
| CSRF на поддоменах | Средняя | Критическое | Строгая валидация Origin |
| Импорт большого CSV (10k+) | Низкая | Среднее | Batch processing + progress |
| FTS5 не синхронизирован | Низкая | Среднее | Ручной rebuild триггеров |

---

## ПОРЯДОК КОММИТОВ

1. `feat(db): add site_settings table for configurable notifications`
2. `feat(notifications): implement real email sending with SMTP from DB`
3. `feat(notifications): implement Telegram notifications from DB config`
4. `feat(catalog): add dynamic filters from database`
5. `feat(search): add FTS5 search API endpoint`
6. `feat(import): add product import from CSV`
7. `feat(ui): add graceful degradation for incomplete products`
8. `feat(seo): add subdomain support for cities`
9. `feat(import): add article import from Markdown`
10. `docs: update CLAUDE.md with new features`

---

## СЛЕДУЮЩИЙ ШАГ

После аудита плана начинаем с **Фазы 0: Подготовка инфраструктуры**.
