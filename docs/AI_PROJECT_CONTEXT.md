# LuxeAuction — AI Context (compact)

> **Purpose:** Single-file onboarding for AI assistants. Read this before exploring the repo.  
> **Course:** SWP391 SU26 · Group 3 · Real-time bidding platform.

---

## Stack

| Layer | Tech |
|-------|------|
| Backend | Java 17, Spring Boot 3.3, JPA/Hibernate, Spring Security + JWT |
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind |
| DB | SQL Server (`SWP_Nhom3_App` in dev) |
| Realtime | STOMP/WebSocket (`/ws/chat`) for bids + chat |
| OCR | FPT.AI Vision (CCCD) via `FPT_AI_API_KEY` |
| Payments | Internal wallet + SePay webhook |

**Ports:** Backend `8096` · Frontend `3000`  
**Config:** `src/main/resources/application.properties` · `src/frontend/.env.local` (`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)

**Run (root):**
```bash
npm run backend      # or mvn spring-boot:run
npm run frontend     # Next.js dev
npm run backend:kill # free port 8096 if conflict
```

---

## Repo layout (active code only)

```
src/main/java/com/auction/     # Monolithic backend (all domains)
src/frontend/src/              # Next.js app
src/main/resources/            # application.properties, static uploads, SQL migrations
scripts/                       # start-backend.ps1, start-frontend.ps1, free-port.ps1
docs/                          # AI audit docs + this file
sql/                           # Legacy/reference SQL
```

Ignore: `Nguyen_Ngoc_Bao_Long/`, `Le_Phuoc_Sang/`, `Hoang_Xuan_Anh_Tuan/` (old submodules), `target/`, `.next/`.

---

## Roles & UI shells

| Role | Frontend shell | Main areas |
|------|----------------|------------|
| **User** (buyer) | `CollectorShell` | bid, watchlist, won-items, wallet, KYC, `/messages` |
| **Seller** | `CollectorShell` + seller nav | post-item, inventory, earnings |
| **Staff** | `StaffShell` | approvals, KYC review, withdrawals, `/staff/support` |
| **Admin** | `AdminShell` + can use Collector routes | dashboard, users, contracts, revenue, `/messages` (all convos) |

Auth: `POST /api/auth/login`, Google `POST /api/auth/google`. JWT in `localStorage` (`token`, `currentUser`).  
Frontend session: `src/frontend/src/lib/userSession.ts`, API: `src/frontend/src/lib/apiClient.ts`.

**Demo accounts** (seeded, password `123456` for gmail demos):
- `user123@gmail.com` · `seller123@gmail.com` · `staff123@gmail.com` · `admin123@gmail.com`
- Legacy: `admin@example.com` / `password`, etc.

---

## Backend modules (`com.auction.*`)

| Package | Responsibility |
|---------|----------------|
| `account` | Users, roles, login, Google OAuth, KYC submit/review, OCR (`KycController`, `CccdOcrService`, `FptAiService`) |
| `bidding` | Auctions LIVE/TIMED, bids, deposits, settlement, payment after win |
| `product` | Products, categories, staff approve → schedule auction, contracts PDF |
| `wallet` | Balance, hold, deposit (VietQR/SePay), withdraw, transactions |
| `chat` | Conversations + messages, WebSocket |
| `notification` | In-app notifications |
| `admin` | Dashboard KPIs, sales history, contract listing |
| `config` | Security, JWT filter, `DataSeeder` (dev data) |
| `common` | Exceptions, file upload, mail |

Entry: `com.auction.AuctionApplication`

---

## Core business flows

### 1. Seller lists item
`POST` product → status `PENDING` → Staff/Admin approve (`ProductServiceImpl.approveProduct`) → `AuctionCreationServiceImpl` creates auction (`UPCOMING`) → listing contract PDF.

### 2. Bidding
User deposits to wallet hold → `BiddingService.placeBid` → `AuctionSession` row (same `Auctions` table) updated. Modes: **LIVE** (3 min), **TIMED** (6–12h).

### 3. Auction ends → payment
`AuctionSettlementServiceImpl`: ended → `AWAITING_PAYMENT`, **72h** payment window.  
Winner must **sign purchase contract** (`ContractServiceImpl.signPurchaseContract`) then `AuctionPaymentServiceImpl.payAuction`.  
Frontend: `PurchaseContractPanel.tsx`, `/won-items`, `/auctions/[id]`.

### 4. Payment forfeit / relist
After 72h: forfeit deposit, product → `PENDING`, notify Admin/Staff/Seller. Admin re-approves → `AuctionCreationServiceImpl` resets `FORFEITED` auction.

### 5. KYC (Seller)
User uploads CCCD → FPT OCR auto-fill → manual sign seller agreement on KYC page (no auto-sign) → staff reviews.

### 6. Chat
Types: `BUYER_SELLER`, `BUYER_STAFF`, `SELLER_STAFF`.  
API: `/api/v1/conversations`, `/api/v1/messages`. Admin can send in all threads. UI bubbles: `ChatMessageList.tsx` (me=right, other=left).

---

## Contracts (PDF)

| Type | Constant | When |
|------|----------|------|
| Seller agreement | `SELLER_AGREEMENT` | KYC (seller signs once) |
| Listing | `LISTING` | Product approved |
| Purchase | `PURCHASE_AGREEMENT` | Winner signs before pay (`referenceId` = auctionId) |

Services: `SellerContractPdfService`, `ListingContractPdfService`, `PurchaseContractPdfService` · orchestration: `ContractServiceImpl`.

---

## Key files (jump here first)

**Backend**
- `config/DataSeeder.java` — dev users/products/auctions
- `bidding/service/impl/AuctionSettlementServiceImpl.java` — 72h window, forfeit, relist
- `bidding/service/impl/AuctionPaymentServiceImpl.java` — pay requires purchase contract
- `product/service/impl/ContractServiceImpl.java` — all contract logic
- `chat/service/impl/MessageServiceImpl.java` — send permissions
- `config/SecurityConfig.java` — route rules

**Frontend**
- `app/messages/page.tsx` — inbox (user/admin)
- `app/kyc/page.tsx` — KYC + seller contract sign
- `components/features/PurchaseContractPanel.tsx`
- `components/features/ChatMessageList.tsx`
- `lib/services/*` — API wrappers
- `i18n/messages/vi.json`, `en.json`

---

## API patterns

- REST prefix: `/api/...` · Chat: `/api/v1/...`
- Public GET: products, categories, auction details
- Auth header: `Authorization: Bearer <jwt>`
- WebSocket: SockJS → `/ws/chat`, topics `/topic/conversation/{id}`

---

## Conventions for AI edits

1. **Minimize diff** — match existing naming (DTOs, services, Tailwind palette `#071626`, `#c9aa5d`).
2. **Don't commit** unless user asks.
3. **Port 8096** — only one backend (IDE *or* `npm run backend`).
4. **Hydration** — never read `localStorage` during SSR; use `useState` + `useEffect` (see `AdminSidebar`, `CollectorSidebar`).
5. **`AuctionStatus` enum** must include `AWAITING_PAYMENT`, `PAID`, `FORFEITED` (shared `Auctions` table with JPA + native bidding).
6. **User ID:** JPA `User.id` == DB `UserId`; API often returns `userId` (Long).

---

## DataSeeder notes

Enabled when `app.seed.enabled=true`. Creates roles, demo users, wallets, products, upcoming auctions, demo LIVE windows.  
Removed: demo won-auction lot (`Demo Contract Test Lot`) — cleanup runs on startup.

---

## Out of scope / stubs

Some admin pages are UI-only (broadcasts, disputes, financial-policies). Member folders at repo root are not the running app.

---

*Last updated: 2026-06-29 — maintain when architecture changes.*
