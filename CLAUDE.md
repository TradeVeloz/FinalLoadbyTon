# CLAUDE.md

Guidance for AI coding assistants working in this repository.

## Project

Loadbyton — freight bid marketplace for container haulage around Jebel Ali, Dubai.
Monorepo with `packages/shared` (types), `packages/api` (Express backend),
`packages/web` (React frontend).

## Commands

```bash
# API
cd packages/api
npm install
npm run dev              # dev server on :5000 (ts-node-dev)
npm run build            # tsc -> dist/
npm run test             # jest + supertest API tests
npm run prisma:generate  # generate Prisma client
npm run prisma:seed      # seed mock data (needs DB)

# Web
cd packages/web
npm install
npm run dev              # vite dev server on :3000 (proxies /api -> :5000)
npm run build            # tsc && vite build
npm run test             # vitest + @testing-library/react component/unit tests
```

## Conventions

- **Language:** TypeScript everywhere. No `any` in new code; existing mock
  route files may still contain `any[]` — do not reintroduce it.
- **API is mock-first.** Routes run against in-memory stores in
  `packages/api/src/services/*` so the whole app is previewable without
  Postgres. The Prisma schema (`packages/api/prisma/schema.prisma`) is the
  production data model and must stay in sync with service shapes.
- **API contract** (base path `/api/v1`):
  - `auth`: register, login, mfa/setup, mfa/verify, refresh, logout, forgot-password, reset-password
  - `jobs`: `GET|POST /jobs`, `GET|PUT|DELETE /jobs/:id`, `POST /jobs/:id/submit`, `POST /jobs/:id/status`
  - `bids`: `GET|POST /bids/job/:jobId`, `GET|PUT /bids/:id`, `POST /bids/:id/accept|reject`
  - `messages`: `GET|POST /messages/job/:jobId`, `PUT /messages/:id/read`
  - `documents`: `GET|POST /documents/job/:jobId`, `GET|DELETE /documents/:id`
  - `payments`: `POST /payments/escrow`, `GET /payments/history`, `GET /payments/:id`,
    `POST /payments/:id/release|dispute`
  - `users`: `GET|PUT /users/profile`, `POST /users/verify`, `PUT /users/:id/verify`,
    `GET /users/:id/ratings`, `GET /users/:id/stats`
  - `analytics` (admin): dashboard, lanes, carriers, shippers, revenue
  - `tracking`: `GET|PUT /tracking/:jobId`
  - `webhooks`: stripe, supabase
- **Frontend design tokens:** navy (`navy-800` #0F2B3D), brand orange
  (`brand-orange` #E8742B), brand teal (`brand-teal` #1A7A6A). Tailwind theme
  in `packages/web/tailwind.config.js`. shadcn-style primitives in
  `packages/web/src/components/ui/*`.
- **State/data:** `lib/api.ts` (`fetchApi`), hooks in `src/hooks`,
  AuthContext + SocketContext in `src/contexts`.
- **Roles:** SHIPPER, CARRIER, ADMIN, DRIVER (see `packages/shared/src/types/index.ts`).
- **Statuses:** JobStatus, BidStatus, PaymentStatus enums live in shared types.

## Verification

- Typecheck API: `cd packages/api && npm run build`
- Typecheck web: `cd packages/web && npm run build` (runs `tsc && vite build`)
- API tests: `cd packages/api && npm run test` (Jest + supertest, in `src/__tests__`)
- Web tests: `cd packages/web && npm run test` (Vitest + Testing Library)
- Test files are excluded from production builds (`tsconfig.json` `exclude`).
