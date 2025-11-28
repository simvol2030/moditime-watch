# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Express.js backend with AdminJS admin panel for SEO Campaign Manager. Uses TypeScript, Sequelize ORM, and SQLite for data persistence. The application provides a full-featured admin interface with role-based access control.

## Common Commands

### Development
```bash
npm run dev          # Start development server with hot reload (nodemon + tsx)
npm run build        # Compile TypeScript to dist/
npm start            # Run production build from dist/
```

The dev server runs on `http://localhost:3000` (configurable via PORT env var). AdminJS is available at `/admin`.

## Architecture

### Application Entry Point (src/index.ts)
- Loads environment variables via dotenv
- Initializes Express app
- Sets up AdminJS before body parsing middleware (AdminJS has its own body parser)
- Mounts AdminJS at `/admin`
- Root endpoint (`/`) returns API info

### Database Layer (src/db.ts)
- **Database Location**: `../../data/db/sqlite/app.db` (shared SQLite database, two levels up from src/)
- **WAL Mode**: Enabled for better concurrent access
- **Models**: User, Post, Admin (Sequelize models without timestamps, uses manual `created_at`)
- **Admin Initialization**: `initializeAdmins()` creates default super-admin on first run using `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env (falls back to admin@example.com / admin123)
- No Sequelize migrations - models use `.sync()` implicitly

### Admin Panel (src/admin.ts)
- **Authentication**: Plain text password comparison against Admin table (not production-ready)
- **Role System**: Three roles with different permissions:
  - `super-admin`: Full access including admin management
  - `editor`: Can create/edit content (Users, Posts)
  - `viewer`: Read-only access
- **Permission Helpers**:
  - `canModifyResource`: Allows super-admin and editor to create/edit
  - `canDelete`: Only super-admin can delete
- **Custom Components**: Dashboard and Login pages in `/components` (React/TSX)
- **Session Config**: Uses express-session with secrets from env vars (`COOKIE_SECRET`, `SESSION_SECRET`)

### Component System
- Custom React components in `/components/` directory (not `/src/components/`)
- Registered via AdminJS ComponentLoader
- Uses @adminjs/design-system for UI components
- Dashboard (Dashboard.tsx): Welcome screen with feature overview cards
- Login (Login.tsx): Custom branded login page

## Environment Variables

Required in `.env`:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `ADMIN_EMAIL`: Initial super-admin email
- `ADMIN_PASSWORD`: Initial super-admin password
- `COOKIE_SECRET`: AdminJS cookie encryption (min 32 chars)
- `SESSION_SECRET`: Express session secret (min 32 chars)

## Key Technical Details

### Database Path Resolution
The database path is relative to the compiled `dist/` directory: `join(__dirname, '..', '..', 'data', 'db', 'sqlite', 'app.db')`. When running from `dist/db.js`, this resolves to the shared data directory at the project root level.

### Middleware Order
AdminJS router must be mounted BEFORE express.json/urlencoded middleware, as AdminJS includes its own body parsing. Custom API routes should be added after AdminJS setup.

### Model Relationships
Posts reference Users via `user_id` foreign key. The relationship is defined at the Sequelize model level but associations are not explicitly declared with `belongsTo`/`hasMany`.

### AdminJS Resource Configuration
Resources use detailed property visibility controls (`isVisible: { list, show, edit, filter }`) and action-level access control based on user role.

### TypeScript Configuration
- Target: ES2022, CommonJS modules
- Output: `./dist` from `./src`
- Strict mode enabled
- No custom path aliases configured
