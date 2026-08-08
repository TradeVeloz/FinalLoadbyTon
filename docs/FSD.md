# Frontend Specification Document (FSD) — Loadbyton

## 1. Design System & Aesthetics

Loadbyton uses a custom, high-contrast, professional logistics palette tailored for B2B marketplaces.

### 1.1 Color Palette
- **Primary Navy**: `#0F2B3D` (Trust, Maritime, Deep Ocean)
- **Primary Orange**: `#E8742B` (Energy, Action, Bidding Highlight)
- **Secondary Teal**: `#1A7A6A` (Reliability, Logistics Growth)
- **Neutral Grays**:
  - Dark Slate: `#111827`
  - Mid Slate: `#374151`
  - Border Gray: `#E5E7EB`
  - Canvas Light: `#F9FAFB`
  - Card White: `#FFFFFF`
- **Status Colors**:
  - Success Green: `#10B981` (Completed / Delivered / Awarded)
  - Warning Amber: `#F59E0B` (Open for Bidding / Pending)
  - Error Red: `#EF4444` (Cancelled / Rejected / Disputed)

### 1.2 Typography
- **Headings & Brand**: Geist / Inter (Modern, geometric sans-serif)
- **Body Text**: Inter (Maximum legibility across high-density tables)
- **Monospace**: JetBrains Mono (For Container Numbers e.g. `MSKU9281745`, TRNs, tracking codes)

### 1.3 Micro-Animations & Variance
- Ease-out transitions under 250ms (`transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)`).
- Hover elevation cards for live bids and active job tracking cards.
- Pulse badges for live real-time bidding indicators.

---

## 2. Component Hierarchy

- **Navbar / Header**: Logo, Live Market Ticker, Role Switcher, Notifications Bell, User Menu.
- **Shipper Dashboard**:
  - KPI Stat Bar (Active Shipments, Total Bids Pending, Spend AED, Savings %)
  - Post Load Quick Action Button
  - Filterable Job Table (Open, Bidding, In-Transit, Completed)
  - Bid Comparison Drawer / Modal
- **Carrier Dashboard**:
  - Available Loads Feed with instant filter by Terminal (Jebel Ali T1-T4) & Container Type
  - One-Click Bid Submission Drawer
  - Active Dispatch Tracker
- **Job Detail View**:
  - Container Specifications Card
  - Live Bid Stream with countdown timer
  - Integrated Driver Telematics Map
  - Real-Time Chat & Customs Document Upload Box
