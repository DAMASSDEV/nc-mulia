# NC MULIA — Claude Code Companion

## Project Overview

Full-stack nutrition/health consultation platform for NC MULIA (Herbalife distributor). Built for a local Indonesian clinic — members can calculate BMI, consult about nutrition, browse/buy Herbalife products, and chat with admins.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + Vite + Tailwind CSS v4 + Framer Motion |
| Backend | Express + TypeScript + Prisma + MySQL |
| Auth | JWT (httpOnly cookies) + RBAC |
| Real-time | Socket.io (chat) |

## Quick Start

```bash
# 1. Setup (once)
npm run setup
# Edit apps/backend/.env with DATABASE_URL

# 2. Database (once)
npm run migrate
npm run seed:admin
npm run seed:products   # optional

# 3. Run
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Admin login: admin@nc-mulia.local / admin123

## Project Structure

```
apps/
  backend/
    prisma/schema.prisma     ← semua model database
    src/
      config/env.ts          ← environment validation
      lib/db.ts              ← Prisma client
      middleware/             ← auth, requirePermission
      modules/               ← satu folder per domain
        auth/                 ← login, register, logout
        users/                ← profile + admin CRUD
        products/             ← product listing, detail
        cart/                 ← cart management
        transactions/         ← checkout, order history
        payments/             ← payment simulation
        memberships/          ← member discounts
        stats/                ← dashboard stats
        bmi/                  ← BMI calculation
        consultations/         ← Q&A consultations
        chat/                 ← real-time chat
        locations/            ← branch management
        rbac/                 ← roles, permissions, navigation
        audit/                ← audit log
      seed.ts                ← RBAC + admin seed
      seed-products.ts        ← product seed
  frontend/
    src/
      pages/                  ← public pages
      pages/admin/            ← admin panel pages
      components/ui/          ← reusable UI components
      components/admin/       ← admin layout, sidebar, topbar
      components/layout/      ← navbar, footer
      contexts/               ← cart context
      lib/
        api.ts               ← API client functions
        motion.ts            ← Framer Motion variants
      styles/tokens.css       ← Tailwind v4 design tokens
```

## Key Conventions

### RBAC
- 3 roles: `super_admin`, `admin`, `user`
- 38 granular permissions (e.g., `users:read`, `products:create`)
- Super admin bypasses all permission checks
- Navigation is role-based (fetched from DB, rendered in sidebar)
- Use `requirePermission(permKey)` middleware for endpoint protection

### API Design
- All responses: `{ success: boolean, message?: string, data?: T, errors?: ValidationError[] }`
- Public routes use JWT in httpOnly cookies
- Admin routes use `requirePermission` middleware
- All mutations log to `AdminAuditLog`

### Database
- Prisma ORM with MySQL
- Soft delete: transactions use `isActive`, hard deletes for locations
- Always run `npx prisma generate` after schema changes
- Prisma client is in `apps/backend/src/lib/db.ts` as `prisma`

### Frontend
- All API calls via `src/lib/api.ts` functions
- Admin pages use `AdminLayout` with `{ user, onLogout }` props
- Public pages use `Navbar` + `Footer`
- Design tokens in `src/styles/tokens.css` (Tailwind v4 CSS-first)
- Motion variants in `src/lib/motion.ts`
- `VITE_` prefix for all frontend env vars

### Google Maps
- Uses `VITE_GOOGLE_MAPS_API_KEY` env var
- If empty: LocationPage uses iframe fallback, PlacesAutocomplete shows plain input
- Both work without API key — just less feature-rich

## Common Commands

```bash
npm run dev:all        # run both
npm run build          # production build
npm run verify         # lint + build
npm run seed:admin     # seed RBAC + admin
npm run seed:products  # seed products
npm run db:reset       # reset migrations (destructive)
```

## Sensitive Files

- `apps/backend/.env` — database credentials, JWT secret
- `apps/frontend/.env` — VITE_ variables only (safe to commit)
