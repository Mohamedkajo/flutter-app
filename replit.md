# Cargo Marketplace

A production-ready AI-powered multi-vendor marketplace platform — think Talabat / Uber Eats for the Middle East. Customers browse stores, order food/groceries/products, and track delivery in real time. Includes a merchant dashboard, driver app, and admin panel.

## Run & Operate

- `pnpm --filter @workspace/cargo run dev` — run the customer-facing web app (port auto-assigned via workflow)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS v4 + shadcn/ui + framer-motion + Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)
- Font: Poppins (Google Fonts)

## Brand Identity

- **Primary**: #5E2D91 (deep purple)
- **Primary Dark**: #47206E
- **Primary Light**: #E8DDF6
- **Accent**: #F25B57 (coral red — flash sales, alerts)
- **Secondary Accent**: #F6A623 (amber — ratings, stars)
- **Background**: #FFFFFF
- **Surface**: #F8F8FC
- **Font**: Poppins 300/400/500/600/700

## Where things live

- `artifacts/cargo/src/pages/` — all page components
- `artifacts/cargo/src/components/` — shared UI components (layout, cards, nav)
- `artifacts/cargo/src/contexts/` — React contexts (auth, cart)
- `artifacts/cargo/src/index.css` — CSS variables / Cargo theme tokens
- `artifacts/api-server/src/routes/` — all API route handlers
- `artifacts/api-server/src/lib/seed.ts` — database seed data
- `lib/api-spec/openapi.yaml` — source-of-truth API contract
- `lib/db/src/schema/` — Drizzle table definitions

## App Sections

- **Customer App** (`/`) — home, store listing, store detail, product detail, cart, checkout, orders, live tracking, wallet, coupons, favorites, notifications, profile
- **Merchant Dashboard** (`/merchant`) — analytics, orders, product management, store settings
- **Driver App** (`/driver`) — dashboard, active orders, earnings, profile
- **Admin Dashboard** (`/admin`) — summary, revenue charts, orders, top stores

## Architecture decisions

- Auth is simplified (base64 token) for demo — swap for JWT in production
- Default user ID = 1 hardcoded in cart/orders/wallet routes (add real auth middleware for production)
- DB seeding runs on every API server startup, skips if already seeded
- Maps/tracking use placeholder div (no Google Maps API key required for demo)
- Flash sales countdown timer is live using endsAt timestamp from DB

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After OpenAPI spec changes, always run `pnpm --filter @workspace/api-spec run codegen` before touching frontend or backend code
- `GetStoreProductsParams` — this operation must NOT have query params (Orval name collision); filters go client-side
- API routes for stores/featured and stores/nearby must be declared BEFORE stores/:storeId in the router to prevent route shadowing

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
