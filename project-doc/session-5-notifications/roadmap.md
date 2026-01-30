# Session-5: Notifications & Order Flow

**Статус:** ⏳ Pending
**Дата:** 2025-01-30
**Источник:** KG005 (KG005-prd-notifications-orders.md)
**Зависит от:** Session-2 (Orders improve, Config)

---

## План проверок

### Проверка кода
- [ ] `npm run build` — frontend без ошибок
- [ ] Типы корректны
- [ ] Telegram API вызывается только при enabled=true
- [ ] Email отправляется только при enabled=true
- [ ] Credentials (bot token, SMTP password) не логируются
- [ ] Error handling: сбой уведомления не блокирует заказ

### Проверка в браузере
- [ ] /admin/system/notifications — страница настроек открывается
- [ ] Telegram: ввести token + chat_id → "Test" → сообщение приходит в группу
- [ ] Email: ввести SMTP данные → "Test" → email приходит
- [ ] /checkout → оформить заказ → Telegram сообщение в группу
- [ ] /checkout → оформить заказ → Email покупателю (подтверждение)
- [ ] /checkout → оформить заказ → Email админу (уведомление)
- [ ] /admin/orders/[id] → сменить статус → Email покупателю
- [ ] /admin/orders/[id] → история статусов отображается
- [ ] Корзина очищается после успешного оформления заказа
- [ ] Консоль браузера чистая

---

## Задачи

| # | Задача | Статус | Сложность | DoD |
|---|--------|--------|-----------|-----|
| 1 | Telegram Bot | ⏳ | Medium | Реальная отправка в группу |
| 2 | Email Service | ⏳ | Medium | SMTP отправка через Nodemailer |
| 3 | Email Templates seed | ⏳ | Low | 5 шаблонов в email_templates |
| 4 | Notifications Admin UI | ⏳ | Medium | Настройки + тест + шаблоны |
| 5 | Order Flow интеграция | ⏳ | Medium | Checkout → уведомления |
| 6 | Order Status уведомления | ⏳ | Medium | Смена статуса → email |

---

## Задача 1: Telegram Bot

**DoD:**
- [ ] Файл telegram.ts переписан: реальный вызов Telegram Bot API
- [ ] sendTelegramNotification(message) → fetch к api.telegram.org
- [ ] Формат сообщения: HTML parse_mode, заказ + товары + клиент
- [ ] Настройки из site_config: telegram_bot_token, telegram_chat_id
- [ ] Graceful: если token/chat_id пусто → skip (не ошибка)
- [ ] Логирование ошибок (не throw, чтобы не блокировать заказ)

**Файлы:**
- `src/lib/server/notifications/telegram.ts` — переписать

---

## Задача 2: Email Service

**DoD:**
- [ ] Файл email.ts переписан: реальная отправка через SMTP
- [ ] Зависимость: nodemailer (добавить в package.json)
- [ ] sendEmail(to, subject, html) → отправка
- [ ] Настройки из site_config: smtp_host, smtp_port, smtp_user, smtp_password, email_from
- [ ] Логирование в email_log (template_key, recipient, status, error)
- [ ] sendOrderConfirmation(order) — email покупателю
- [ ] sendOrderAdminNotification(order) — email админу
- [ ] sendOrderStatusChanged(order, oldStatus, newStatus) — email покупателю
- [ ] Шаблоны из email_templates с подстановкой переменных

**Файлы:**
- `src/lib/server/notifications/email.ts` — переписать
- `frontend-sveltekit/package.json` — добавить nodemailer

---

## Задача 3: Email Templates seed

**DoD:**
- [ ] 5 шаблонов в email_templates:
  - order_confirmation: "Заказ #{{order_number}} принят"
  - order_admin_notification: "Новый заказ #{{order_number}}"
  - order_status_confirmed: "Заказ подтверждён"
  - order_status_shipped: "Заказ отправлен"
  - order_status_delivered: "Заказ доставлен"
- [ ] HTML шаблоны с переменными: {{order_number}}, {{customer_name}}, {{items}}, {{total}}

**Файлы:**
- `src/lib/server/db/database.ts` — seedDatabase()

---

## Задача 4: Notifications Admin UI

**DoD:**
- [ ] /admin/system/notifications — страница с секциями:
  - Telegram: enabled toggle, bot_token input, chat_id input, Test button
  - Email: enabled toggle, SMTP fields (host, port, user, password, from, admin email), Test button
- [ ] Test Telegram: отправляет "Test from Moditime Admin" в группу
- [ ] Test Email: отправляет тестовое письмо на admin email
- [ ] Сохранение настроек в site_config

**Файлы:**
- `src/routes/(admin)/admin/system/notifications/+page.server.ts` + `+page.svelte`

---

## Задача 5: Order Flow интеграция

**DoD:**
- [ ] /checkout POST → после сохранения заказа:
  1. sendTelegramNotification(orderMessage)
  2. sendOrderConfirmation(order) — покупателю
  3. sendOrderAdminNotification(order) — админу
- [ ] Если уведомление не отправилось → заказ всё равно создан (catch + log)
- [ ] После успешного оформления → очистка корзины (clear cart cookie/store)
- [ ] /order/success показывает номер заказа

**Файлы:**
- `src/routes/checkout/+page.server.ts` — доработка POST action

---

## Задача 6: Order Status уведомления

**DoD:**
- [ ] /admin/orders/[id] → при смене статуса:
  1. UPDATE orders SET status
  2. INSERT order_status_history
  3. sendOrderStatusChanged(order, oldStatus, newStatus)
- [ ] Email покупателю с текстом в зависимости от нового статуса
- [ ] Telegram уведомление админу при cancelled

**Файлы:**
- `src/routes/(admin)/admin/orders/[id]/+page.server.ts` — доработка

---

*Создано: 2025-01-30*
