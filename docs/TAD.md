# Technical Architecture Document (TAD) — Loadbyton

## 1. System Architecture Diagram

```
[ Web Client (React 19 + Vite + TS) ]  <--->  [ Socket.io / HTTP ]
                                                      |
                                                      v
                                        [ Nginx Reverse Proxy / Load Balancer ]
                                                      |
                                                      v
                                        [ Express.js TypeScript API Node.js ]
                                                      |
                    +---------------------------------+---------------------------------+
                    |                                 |                                 |
                    v                                 v                                 v
         [ PostgreSQL + Prisma ]                [ Redis Cache ]               [ S3 / Storage Service ]
        (User, Jobs, Bids, Escrow)           (Rate Limit, Sessions)          (Customs Docs, e-POD)
```

## 2. Monorepo Organization

- `packages/shared`: Shared TypeScript types, data schemas, constant enums (Terminal names, JAFZA areas, status flags).
- `packages/api`: Node.js Express server with Prisma ORM, JWT & TOTP authentication, Socket.io event gateway, Stripe payment webhooks.
- `packages/web`: Modern React 19 web application built with Vite, Tailwind CSS, shadcn/ui components, Lucide icons, Leaflet interactive tracking, dynamic interactive state management.

---

## 3. Database ERD & Data Models

### Primary Entities:
1. `User`: `id`, `email`, `passwordHash`, `role` (SHIPPER, CARRIER, ADMIN), `isVerified`, `mfaEnabled`, `mfaSecret`, `createdAt`.
2. `Profile`: `id`, `userId`, `companyName`, `trnNumber`, `tradeLicenseNumber`, `phone`, `avatarUrl`, `ratingAverage`.
3. `Job`: `id`, `shipperId`, `carrierId`, `containerSize`, `containerType`, `containerNumber`, `pickupTerminal`, `deliveryArea`, `deliveryAddress`, `readyTime`, `deadline`, `maxBudget`, `status`, `createdAt`.
4. `Bid`: `id`, `jobId`, `carrierId`, `amountAED`, `etaMinutes`, `notes`, `status`, `createdAt`.
5. `Message`: `id`, `jobId`, `senderId`, `content`, `attachmentUrl`, `isRead`, `createdAt`.
6. `Document`: `id`, `jobId`, `uploaderId`, `type` (CUSTOMS_CLEARANCE, COLLECTION_RECEIPT, POD), `fileUrl`, `createdAt`.
7. `Payment`: `id`, `jobId`, `amountAED`, `platformFeeAED`, `status` (PENDING, ESCROW, RELEASED, DISPUTED), `transactionRef`.
8. `Rating`: `id`, `jobId`, `raterId`, `rateeId`, `score`, `comment`, `category`.

---

## 4. WebSocket Event Specification

- `connection`: Client connects with JWT token authentication.
- `subscribe:job`: Room `job:{jobId}` joined.
- `bid:new`: Server emits new bid payload to room `job:{jobId}`.
- `bid:accepted`: Server notifies carrier `user:{carrierId}` that bid was accepted.
- `job:status`: Server broadcasts status transition (e.g. `IN_TRANSIT`, `DELIVERED`).
- `message:new`: Server broadcasts realtime chat message to room `job:{jobId}`.
- `tracking:update`: Server streams lat/lng updates for active container haulage.
