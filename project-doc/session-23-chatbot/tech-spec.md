# Session 23: Chatbot — Tech-spec

**Дата:** 2026-02-20
**На основе:** research.md, требования пользователя

---

## 1. Обзор

Портирование чат-бота из project-kliee в moditime-watch с адаптацией:
- Drizzle ORM → better-sqlite3 prepared statements
- Multi-language → только русский
- "Melena" арт-консультант → "Modi" консультант по часам
- Светлая + тёмная тема (CSS variables)
- CSRF exemption для /api/chat
- Админка: /admin/chatbot/* (настройки, FAQ, история)

---

## 2. Схема базы данных

### 2.1 Таблица `chat_sessions`

```sql
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,       -- UUID для идентификации в cookie
  visitor_name TEXT,                      -- Имя посетителя (если представился)
  visitor_email TEXT,                     -- Email (если оставил)
  visitor_phone TEXT,                     -- Телефон (если оставил)
  status TEXT DEFAULT 'active',           -- active | closed | waiting_human
  message_count INTEGER DEFAULT 0,
  last_message_at DATETIME,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,                          -- Страница, с которой начат чат
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_session_id ON chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at DESC);
```

### 2.2 Таблица `chat_messages`

```sql
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,               -- FK → chat_sessions.session_id
  role TEXT NOT NULL,                     -- user | bot | human | system
  content TEXT NOT NULL,
  metadata_json TEXT,                     -- JSON: { matched_faq_id, product_ids, ... }
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at);
```

### 2.3 Таблица `chat_faq`

```sql
CREATE TABLE IF NOT EXISTS chat_faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,                 -- Вопрос (отображается пользователю)
  answer TEXT NOT NULL,                   -- Ответ бота
  keywords TEXT,                          -- Ключевые слова через запятую для matching
  category TEXT DEFAULT 'general',        -- general | delivery | payment | warranty | returns
  is_active INTEGER DEFAULT 1,
  position INTEGER DEFAULT 0,
  match_count INTEGER DEFAULT 0,          -- Счётчик совпадений (для аналитики)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_faq_active ON chat_faq(is_active, position);
CREATE INDEX IF NOT EXISTS idx_chat_faq_category ON chat_faq(category) WHERE is_active = 1;
```

### 2.4 Таблица `chat_config`

```sql
CREATE TABLE IF NOT EXISTS chat_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Ключи chat_config:**

| key | default value | description |
|-----|---------------|-------------|
| `bot_name` | `Modi` | Имя бота |
| `bot_avatar_emoji` | `⌚` | Эмодзи-аватар |
| `welcome_message` | `Здравствуйте! Я Modi — ваш консультант по часам. Чем могу помочь?` | Приветственное сообщение |
| `offline_message` | `Спасибо за обращение! Оставьте контакт, и мы свяжемся с вами.` | Сообщение когда бот не может помочь |
| `is_enabled` | `true` | Включён ли чатбот |
| `auto_open_delay` | `0` | Задержка автооткрытия (0 = не открывать, в секундах) |
| `working_hours` | `{"start": "10:00", "end": "20:00"}` | Часы работы |
| `quick_replies_json` | `["Каталог часов", "Доставка и оплата", "Гарантия", "Связаться с консультантом"]` | Быстрые ответы |

---

## 3. API Endpoints

### 3.1 POST /api/chat

**Назначение:** Отправка сообщения и получение ответа бота

**Request:**
```json
{
  "message": "Какие часы Rolex у вас есть?",
  "session_id": "uuid-..." // опционально, берётся из cookie
}
```

**Response (200):**
```json
{
  "reply": "У нас есть следующие модели Rolex:",
  "products": [
    { "id": 1, "name": "Submariner", "brand": "Rolex", "price": 1320000, "slug": "rolex-submariner-126610ln", "image": "/images/..." }
  ],
  "session_id": "uuid-...",
  "quick_replies": ["Подробнее о Submariner", "Другие бренды", "Связаться с консультантом"]
}
```

**Response (400):**
```json
{ "error": "Сообщение не может быть пустым" }
```

**CSRF:** Exempted (добавлен в publicEndpoints)
**Rate limit:** Max 30 сообщений в минуту на session_id

### 3.2 GET /api/chat/session

**Назначение:** Получение или создание сессии

**Response (200):**
```json
{
  "session_id": "uuid-...",
  "config": {
    "bot_name": "Modi",
    "bot_avatar_emoji": "⌚",
    "welcome_message": "...",
    "quick_replies": ["Каталог часов", "Доставка и оплата", ...],
    "is_enabled": true
  },
  "messages": []  // Пустой для новой сессии, или история для существующей
}
```

### 3.3 POST /api/chat/contact

**Назначение:** Посетитель оставляет контактные данные

**Request:**
```json
{
  "session_id": "uuid-...",
  "name": "Иван",
  "phone": "+7 999 123-45-67",
  "email": "ivan@example.com"  // опционально
}
```

**Response (200):**
```json
{ "success": true }
```

---

## 4. Логика бота (Rule-based)

### 4.1 Алгоритм обработки сообщения

```
Пользователь отправил message
      ↓
1. Нормализация: toLowerCase(), trim(), убрать лишние пробелы
      ↓
2. FAQ Matching:
   - Поиск по keywords в chat_faq (LIKE '%keyword%')
   - Если найдено → вернуть answer, увеличить match_count
      ↓
3. Product Matching:
   - Поиск бренда в сообщении (LIKE '%rolex%' и т.д.)
   - Поиск категории (мужские, спортивные, ...)
   - Если найдены товары → вернуть с карточками
      ↓
4. Fallback:
   - Вернуть offline_message
   - Предложить quick_replies
   - Если 3+ fallback подряд → предложить оставить контакт
```

### 4.2 Quick Replies

При отправке quick reply текст отправляется как обычное сообщение.
Бот определяет intent по точному совпадению:

| Quick Reply | Action |
|-------------|--------|
| "Каталог часов" | Ссылка на /catalog + популярные бренды |
| "Доставка и оплата" | FAQ ответ из категории delivery/payment |
| "Гарантия" | FAQ ответ из категории warranty |
| "Связаться с консультантом" | Форма контакта (имя + телефон) |

---

## 5. Компоненты (Svelte 5)

### 5.1 Файловая структура

```
frontend-sveltekit/src/lib/components/chat/
├── ChatWidget.svelte          # Floating button + badge
├── ChatDialog.svelte          # Окно чата (заголовок, сообщения, ввод)
├── ChatMessage.svelte         # Отдельное сообщение
├── ChatProductCard.svelte     # Карточка товара в чате
└── ChatContactForm.svelte     # Форма "оставить контакт"
```

### 5.2 ChatWidget.svelte

- Floating button в правом нижнем углу
- Анимация появления (fade-up)
- Badge с количеством непрочитанных (если есть)
- Клик → toggle ChatDialog
- Z-index: 250

### 5.3 ChatDialog.svelte

- Окно 380×520px (desktop), fullscreen на мобильных (<768px)
- Заголовок: аватар бота + имя + статус
- Область сообщений (scrollable, auto-scroll to bottom)
- Quick replies (горизонтальный scroll, chips)
- Поле ввода + кнопка отправки
- Кнопка закрытия (крестик)
- Анимация открытия/закрытия (slide-up)

### 5.4 ChatMessage.svelte

- Два варианта: user (справа, primary bg) и bot (слева, surface bg)
- Timestamp под сообщением
- Typing indicator (три точки) для ожидания ответа
- Поддержка markdown-like форматирования (жирный, ссылки)

### 5.5 ChatProductCard.svelte

- Мини-карточка товара в чате
- Изображение + название + бренд + цена
- Кнопка "Подробнее" → ссылка на /product/slug

---

## 6. Админка

### 6.1 /admin/chatbot — Dashboard

- Статистика: всего чатов, сегодня, ожидают ответа, среднее время
- Последние 10 чатов (таблица с быстрым доступом)
- Toggle: включить/выключить чатбот

### 6.2 /admin/chatbot/faq — Управление FAQ

- Таблица FAQ: question, answer, category, keywords, is_active, match_count
- CRUD: создание, редактирование, удаление, toggle active
- Перетаскивание для порядка (position)
- Фильтр по категории
- Сидирование начальных FAQ при первом запуске

### 6.3 /admin/chatbot/history — История чатов

- Список чатов с пагинацией
- Фильтры: по статусу (active/closed/waiting_human), по дате
- Клик → развёрнутый диалог (все сообщения)
- Возможность добавить заметку (human note)

### 6.4 /admin/chatbot/settings — Настройки

- Форма с полями из chat_config
- Имя бота, аватар, приветственное сообщение
- Offline сообщение
- Быстрые ответы (редактируемый список)
- Часы работы
- Задержка автооткрытия

---

## 7. CSRF и безопасность

### 7.1 CSRF Exemption

В `hooks.server.ts:157` добавить `/api/chat` в publicEndpoints:
```typescript
const publicEndpoints = ['/api/health', '/api/chat', '/api/chat/session', '/api/chat/contact'];
```

### 7.2 Rate Limiting

Реализация в API endpoint:
- In-memory Map: `session_id → { count, resetAt }`
- Max 30 сообщений/минуту на session
- Cleanup каждые 5 минут

### 7.3 Input Sanitization

- Strip HTML tags из сообщений
- Max длина сообщения: 500 символов
- Проверка session_id формата (UUID)

---

## 8. Seed данные (начальные FAQ)

```
1. "Как оформить заказ?" → "Выберите часы в каталоге, добавьте в корзину и оформите заказ..."
2. "Доставка" → "Мы доставляем по всей России. Сроки: Москва 1-2 дня, регионы 3-7 дней..."
3. "Оплата" → "Принимаем оплату картой, переводом, наличными при получении..."
4. "Гарантия" → "Все часы поставляются с официальной гарантией от производителя..."
5. "Оригинальность" → "Мы работаем только с оригинальными часами. Каждые часы проходят проверку..."
6. "Возврат" → "Возврат возможен в течение 14 дней при сохранении товарного вида..."
7. "Контакты" → "Телефон: +7 (495) 120-00-00, Email: info@moditime-watch.ru..."
8. "Часы работы" → "Пн-Пт: 10:00-20:00, Сб: 11:00-18:00..."
```

---

## 9. Интеграция в layout

### +layout.svelte (публичный)

```svelte
{#if !isAdminPage && !isCityPage}
  <SiteFooter ... />
  <ChatWidget />   <!-- ДОБАВИТЬ -->
{/if}
```

### AdminSidebar.svelte

Добавить в navItems:
```typescript
{ label: 'Chatbot', href: '/admin/chatbot', icon: '🤖', group: 'Support' },
```

---

*Tech-spec завершён: 2026-02-20*
