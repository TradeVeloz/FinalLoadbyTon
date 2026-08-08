# Feature Ticket List (FTL) — Loadbyton Sprints

## Epic 1: Shared Core & Authentication
- [x] `FTL-101`: Setup monorepo structure (`packages/shared`, `packages/api`, `packages/web`).
- [x] `FTL-102`: Implement Prisma database schema for User, Job, Bid, Message, Document, Rating, Notification.
- [x] `FTL-103`: Build JWT authentication routes (Register, Login, Refresh, Logout, MFA).

## Epic 2: Backend API & Realtime Bidding
- [x] `FTL-201`: Build Job Management CRUD endpoints (`/api/v1/jobs`).
- [x] `FTL-202`: Build Reverse Bidding endpoints (`/api/v1/jobs/:id/bids`, `/bids/:id/accept`).
- [x] `FTL-203`: Integrate Socket.io gateway for live bid notifications and real-time chat.
- [x] `FTL-204`: Implement Customs Document Upload API and e-POD verification endpoints.

## Epic 3: High-Impact React Frontend
- [x] `FTL-301`: Construct Design System in Tailwind CSS + shadcn/ui components.
- [x] `FTL-302`: Build Landing Page with Live Bidding Ticker, Market Calculator, and CTA.
- [x] `FTL-303`: Build Multi-Step Job Creation Wizard (Container size, Jebel Ali Terminal, Route, Budget).
- [x] `FTL-304`: Build Shipper & Carrier Dashboards with real-time stats and bid comparison drawers.
- [x] `FTL-305`: Build Interactive Container Tracking Map with milestone timeline.
- [x] `FTL-306`: Build Real-time Chat component with Document attachments.
- [x] `FTL-307`: Build Escrow Payment overview & dispute resolution interface.

## Epic 4: Deployment & Verification
- [x] `FTL-401`: Write Docker Compose configuration for Postgres, Redis, API, Web.
- [x] `FTL-402`: Conduct complete build verification and end-to-end integration check.
- [x] `FTL-403`: Add automated tests — Jest + supertest API suite (`packages/api`) and Vitest + Testing Library frontend suite (`packages/web`).
