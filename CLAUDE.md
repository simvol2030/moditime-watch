# Moditime Watch - E-commerce для премиальных часов

**URL:** https://moditime-watch.ru
**Тип:** SvelteKit E-commerce + AdminJS панель
**Workflow Developer:** см. `CLAUDE.web.md`

---

## Пути проекта

| Среда | Путь |
|-------|------|
| **WSL** | `/home/solo18/dev/watch/project/project-box-v2` |
| **Windows** | `\\wsl$\Ubuntu\home\solo18\dev\watch\project\project-box-v2` |
| **GitHub** | https://github.com/simvol2030/moditime-watch |
| **GitHub ветка** | `main` (единственная) |
| **Сервер** | `/opt/websites/moditime-watch.ru/repo` |

---

## PM2 (Production)

| Процесс | Порт | Описание |
|---------|------|----------|
| `moditime-watch` | 4173 | SvelteKit frontend |
| `moditime-backend` | 3000 | Express + AdminJS |

```bash
source ~/.nvm/nvm.sh && pm2 restart moditime-watch moditime-backend
```

---

## Доступы

**Admin Panel:** https://moditime-watch.ru/admin
- Email: `admin@moditime-watch.ru`
- Password: `ModitimeAdmin2024!SecurePass`

**Database:** SQLite → `/opt/websites/moditime-watch.ru/repo/data/db/sqlite/app.db`

---

## Структура

```
moditime-watch/
├── frontend-sveltekit/   # SvelteKit 2.x + Svelte 5
├── backend-expressjs/    # Express.js + AdminJS
├── data/db/sqlite/       # SQLite DB (WAL mode)
└── schema.sql            # 36 таблиц
```

---

## Tech Stack

- **Frontend:** SvelteKit 2.x, Svelte 5 (runes), TypeScript, Vite
- **Backend:** Express.js 5.x, AdminJS 6.8.7, Sequelize
- **Database:** SQLite (better-sqlite3, WAL mode, FTS5)
- **Security:** bcrypt, AES-256-GCM, CSRF protection
- **DevOps:** PM2, Nginx, SSH-MCP, GitHub MCP

---

## Deploy

```bash
# На сервере (через SSH MCP или deploy.sh)
cd /opt/websites/moditime-watch.ru
./deploy.sh

# Или вручную:
cd /opt/websites/moditime-watch.ru/repo && git pull origin main
cd frontend-sveltekit && npm install && npm run build
cd ../backend-expressjs && npm install && npm run build
source ~/.nvm/nvm.sh && pm2 restart moditime-watch moditime-backend
```

---

## Статус проекта

| Компонент | Dev | Production |
|-----------|-----|------------|
| Frontend UI | 100% | 75% |
| Database schema | 100% | 85% |
| E-commerce flow | 90% | 50% |
| Admin panel | 100% | 70% |
| **Общая готовность** | **78%** | — |

### Что требует доработки
1. Email/Telegram notifications (mock → real)
2. Фильтры каталога → подключить к БД
3. FTS5 поиск → создать endpoint
4. Header submenu → исправить рендеринг

---

## Nginx конфигурация

| URL | Прокси |
|-----|--------|
| `https://moditime-watch.ru` | → `localhost:4173` |
| `https://moditime-watch.ru/admin` | → `localhost:3000` |

---

## Особенности сервера

- **Static images:** `/opt/websites/moditime-watch.ru/static-images` (symlink в `static/images`)
- **Backups:** `/opt/websites/moditime-watch.ru/backups`
- **Deploy script:** `/opt/websites/moditime-watch.ru/deploy.sh`

---

*Версия: 1.0 | Обновлено: 2025-12-24*
*Используется с: CLAUDE.local.md (Workflow v4.2)*
