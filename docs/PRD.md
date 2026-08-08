# Product Requirements Document (PRD) — Loadbyton

## 1. Executive Summary & Market Context

**Loadbyton** is a two-sided digital freight marketplace designed specifically to solve container haulage inefficiencies in Dubai’s Jebel Ali port ecosystem. Currently, over 80% of port-to-warehouse drayage deals in the UAE are brokered through fragmented WhatsApp groups and manual phone calls. This results in wide price variances, zero driver tracking visibility, paper-based customs delays, and high demurrage penalties.

### Key Market Data:
- **Jebel Ali Port Volume**: 15.5M TEU per year (~20,000+ containers daily requiring inland transport).
- **Average Drayage Spend**: ~AED 1,200 per trip.
- **Serviceable Addressable Market (SAM)**: ~AED 6.5 Billion (~USD 1.8 Billion) in Dubai inland drayage.
- **Monetization**: 5-8% commission fee on accepted bids + premium analytics subscriptions for large fleet operators.

---

## 2. User Personas & Core Journeys

### 2.1 Shipper / Customs Broker / Freight Forwarder
- **Goals**: Reduce drayage costs, secure instant truck availability during peak port congestion, eliminate demurrage charges through automated document sharing.
- **Key Actions**:
  1. Post load requirement (Container size, Pickup Terminal e.g. Jebel Ali T1/T2/T3/T4, Delivery Area e.g. JAFZA, Al Quoz, DIP, Deadline).
  2. Receive real-time bids from verified carriers.
  3. Compare bids by price, carrier rating, vehicle type, and estimated time of arrival (ETA).
  4. Award job, fund escrow, and track container from gate-out to warehouse unstacking.

### 2.2 Carrier / Fleet Operator / Owner-Driver
- **Goals**: Maximize fleet utilization, eliminate empty backhauls, secure instant payment release upon proof-of-delivery (POD).
- **Key Actions**:
  1. Browse open loads matching available trailer capacity.
  2. Place competitive bids with customizable validity periods.
  3. Dispatch driver, upload collection receipts and e-POD.
  4. Receive automatic escrow payment release upon shipper acceptance.

### 2.3 Admin / Platform Operator
- **Goals**: Ensure user verification (UAE Trade License, RTA Permit, TRN tax registration), handle disputes, monitor escrow accounts, and review liquidity metrics.

---

## 3. Key Feature Modules

| Module | Features & Functional Requirements |
| :--- | :--- |
| **Authentication & KYC** | Role-based login (Shipper/Carrier/Admin), Google OAuth, TOTP MFA, TRN & UAE Trade License verification. |
| **Job Posting Engine** | Multi-step job wizard: 20ft/40ft/40HC/Reefer options, Hazmat levels, Jebel Ali Terminal selector, destination autocomplete, pickup window. |
| **Real-Time Bidding** | Live reverse auction mechanism, price auto-suggestions based on historical lane averages, bid acceptance trigger, bid expiration timer. |
| **Instant Messaging** | Encrypted job-specific chat, file attachment support for Customs Gate Pass & Delivery Order, read receipts. |
| **Live Telematics & Tracking** | Simulated GPS telemetry, status milestone timeline (Port Gate-Out -> On-Route -> Warehouse Arrival -> Offloaded -> POD Signed), delay notifications. |
| **Escrow & Payments** | Automated escrow locking, Stripe / UAE Payment gateway integration, AED currency support, invoice generation, dispute resolution mode. |
| **Trust & Ratings** | Post-trip bilateral rating system (Punctuality, Communication, Equipment Condition, Value), carrier leaderboard badges. |

---

## 4. Key Performance Indicators (KPIs)

- **Match Rate**: > 92% of posted loads receive at least 3 bids within 15 minutes.
- **Cost Savings**: Average 12.5% reduction in drayage costs for shippers compared to offline rates.
- **Turnaround Time**: Under 4 minutes from posting to job awarding.
- **On-Time Delivery Rate**: > 98.5%.
