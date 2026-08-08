# Loadbyton

**Freight bid marketplace for container haulage — Jebel Ali, Dubai**

Loadbyton is a two-sided marketplace that replaces WhatsApp/phone negotiation for container drayage with a transparent bidding system. Shippers post haulage requirements, vetted carriers compete with live bids based on real-time truck availability, and shippers award in a couple of taps. Customs papers, collection receipts, chat, and tracking all live in one thread.

- **Market:** ~20,000+ containers/day moving inland from Jebel Ali (15.5M TEU in 2024, world's 9th-busiest port)
- **Average drayage fee:** ~AED 1,200
- **Target take-rate:** 5–8%

## Repository layout

```
loadbyton/
├── docs/                  # PRD, TAD, SAD, FSD, FTL, README
├── packages/
│   ├── shared/            # Shared TypeScript types
│   ├── api/               # Express + TypeScript backend (Prisma schema included)
│   └── web/               # React + TypeScript + Tailwind + shadcn/ui frontend
├── docker-compose.yml     # Postgres, Redis, API, web
├── .env.example
└── CLAUDE.md
```

## Quick start (local, no infra required)

The API ships with an in-memory demo data layer, so you can preview the full
marketplace without standing up Postgres.

```bash
# Terminal 1 — API
cd packages/api
npm install
npm run dev                # http://localhost:5000

# Terminal 2 — Web
cd packages/web
npm install
npm run dev                # http://localhost:3000
```

Open `http://localhost:3000`. The header includes a **Shipper View / Carrier
View** toggle to explore both sides of the marketplace without re-logging-in.

Demo credentials (any password works against the mock store):

| Role | Email |
| --- | --- |
| Shipper | `shipper@jebelalilogistics.ae` |
| Carrier | `carrier@dubaidrayage.com` |

## Production stack

| Layer | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query |
| Backend | Express, TypeScript, Socket.io, Zod |
| Data | PostgreSQL, Prisma ORM, Redis |
| Auth | JWT (15 min access / 7 day refresh), TOTP MFA, bcrypt-12, RBAC |
| Payments | Stripe (escrow flow, webhooks) |
| Infra | Docker Compose, Nginx static hosting, Cloudflare |

Run the full stack:

```bash
cp .env.example .env
docker compose up --build
```

Apply the Prisma schema and seed:

```bash
cd packages/api
npx prisma migrate dev --name init
npm run prisma:seed
```

## Docs

- [`docs/PRD.md`](docs/PRD.md) — Product Requirements
- [`docs/TAD.md`](docs/TAD.md) — Technical Architecture
- [`docs/SAD.md`](docs/SAD.md) — Security & Access
- [`docs/FSD.md`](docs/FSD.md) — Frontend Specification & Design System
- [`docs/FTL.md`](docs/FTL.md) — Feature Ticket List

## License

MIT — see [`LICENSE`](LICENSE).
