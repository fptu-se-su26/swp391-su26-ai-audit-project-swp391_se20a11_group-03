# LuxeAuction — AI Project Context (single source of truth)

> **Đọc file này trước** khi sửa code hoặc onboard AI assistant khác.  
> **Course:** SWP391 SU26 · Group 3 · Nền tảng đấu giá realtime.

---

## Stack & chạy local

| Layer | Tech |
|-------|------|
| Backend | Java 17, Spring Boot 3.3, JPA, Spring Security + JWT |
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind |
| DB | SQL Server dev: `SWP_Nhom3_App` |
| Realtime chat | STOMP/WebSocket `SockJS → /ws/chat` |
| Realtime bid UI | **HTTP poll 1s** (`auctionPolling.ts`) — backend vẫn broadcast `/topic/bids` nhưng frontend chưa subscribe STOMP cho bid |
| OCR KYC | Google Gemini `gemini.ocr.api.keys` (round-robin + 429 failover via `GeminiKeyPool`; 1 request front+back) |
| AI valuation | Google Gemini `gemini.valuation.api.keys` (same pool pattern) |
| Thanh toán | Ví nội bộ + SePay webhook |

**Ports:** Backend `8096` · Frontend `3000`

```bash
npm run backend       # hoặc mvn spring-boot:run
npm run frontend      # Next.js :3000
npm run backend:kill  # giải phóng :8096
npm run dev:all       # cả hai
```

**IntelliJ / IDE:** Bật compiler flag `-parameters` (project đã có `.idea/compiler.xml` và `maven.compiler.parameters=true` trong `pom.xml`). Nếu chạy Run từ IDE mà POST `/api/kyc/{id}/approve` báo lỗi `Name for argument of type [java.lang.Long]`, rebuild project hoặc chạy qua `mvn spring-boot:run`.

**Config:** `src/main/resources/application.properties` · `src/frontend/.env.local`  
(`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`)

**Demo** (seed, mật khẩu `123456`):  
`user123@gmail.com` · `seller123@gmail.com` · `staff123@gmail.com` · `admin123@gmail.com`

---

## Cấu trúc repo (code đang chạy)

```
src/main/java/com/auction/   # Backend monolith
src/frontend/src/          # Next.js
scripts/                   # start-backend.ps1, start-frontend.ps1
docs/AI_PROJECT_CONTEXT.md  # ← file này
```

Bỏ qua: `target/`, `.next/`, các folder thành viên cũ ở root repo.

---

## Vai trò & UI

| Role | Shell | Trang chính |
|------|-------|-------------|
| User (buyer) | `CollectorShell` | dashboard, auctions, wallet, KYC, messages |
| Seller | `CollectorShell` + nav seller | post-item, đăng sản phẩm |
| Staff | `StaffShell` | approvals, kyc-review, support |
| Admin | `AdminShell` | dashboard, contracts, users, revenue |

**Auth:** `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/select-role`  
JWT: `localStorage.token` + `localStorage.currentUser`  
Helpers: `src/frontend/src/lib/userSession.ts`, `apiClient.ts`

---

## Luồng nghiệp vụ chính

### Đăng sản phẩm (seller)
1. Seller `POST /api/seller/products` → `PENDING`
2. Staff/Admin duyệt → `AuctionCreationServiceImpl` tạo phiên `UPCOMING`
3. PDF hợp đồng niêm yết (`LISTING`)

**Điều kiện đăng bán** (`ProductServiceImpl`): KYC đã duyệt + đã ký **hợp đồng nền tảng seller** (trừ Admin).

### Đấu giá
1. User nạp ví → đặt cọc phiên (`AuctionDeposit`)
2. `BiddingService.placeBid` cập nhật `AuctionSession` (cùng bảng `Auctions`)

**LIVE**
- Có bước giá (`StepCalculator`)
- Giá công khai realtime (poll)
- Anti-sniper: mỗi bid +10s `endTime`

**TIMED (đấu giá kín)**
- Không bước giá; bid ≥ giá khởi điểm (và > giá hiện tại nếu đã có bid)
- **Không** cập nhật giá công khai; API mask `priceHidden`, `bidsAnonymous`
- Lịch sử bid trống khi phiên đang mở
- **Không** gia hạn thời gian
- Kết phiên: `AuctionSettlementServiceImpl` thông báo người thắng + giá cao nhất

Utils: `AuctionPhaseUtil.isTimedBlindBiddingOpen()`

### Kết phiên → thanh toán
- `AWAITING_PAYMENT`, cửa sổ **72h**
- Người thắng: ký **hợp đồng mua** (`PurchaseContractPanel`) → `payAuction`
- Quá hạn: thu cọc, sản phẩm `PENDING`, admin duyệt lại

---

## Profile, KYC & xác minh danh tính

> Gộp từ hướng dẫn Profile cũ — ánh xạ **code hiện tại** (Spring + Next.js).

### Trang Profile (`/profile`)
- **Đã có:** xem/sửa họ tên, SĐT; hiển thị email, CCCD (read-only), hạng thành viên, `profileStatus`, badge KYC
- **API:** `GET/PUT /api/users/profile` (`UserProfileController`)
- **Chưa có / stub:** verify Gmail bằng link token, đổi mật khẩu trong profile, lịch sử audit trên UI

### KYC (`/kyc`)
- Upload CCCD 3 ảnh (front/back/selfie)
- **Gemini OCR** auto-fill (`POST /api/kyc/ocr`)
- Cảnh báo CCCD trùng tài khoản khác
- Staff duyệt tại `/staff/kyc-review`
- Trường user: `identityVerified`, `profileStatus`, `identityVerifiedAt`

### Trạng thái đề xuất (một phần đã dùng)
`PENDING` · `VERIFIED` · `REJECTED` — staff set khi duyệt KYC.

### Nguyên tắc bảo mật (áp dụng khi mở rộng)
- Token verify email: hash trong DB, TTL ngắn, one-time
- Ảnh KYC: lưu ngoài public root, giới hạn MIME/size, `ProtectedKycImage` khi hiển thị
- Không hardcode SMTP/secret trong source

---

## Đăng ký Seller & hợp đồng nền tảng

**Luồng chuẩn** (không chỉ đổi role trên profile):

```
/post-item (User) → /become-seller
  → xem trước PDF (watermark "BẢN XEM TRƯỚC")
  → tick đồng ý điều khoản
  → POST /api/seller-contract/sign
       (tự nâng User → Seller nếu cần + tạo PDF ký điện tử)
  → đã KYC? → /post-item : → /kyc (ký lại hợp đồng trên KYC nếu cần)
```

| Thành phần | File / API |
|------------|------------|
| Trang đăng ký | `src/frontend/src/app/become-seller/page.tsx` |
| UI hợp đồng | `components/features/SellerContractPanel.tsx` |
| Preview PDF | `GET /api/seller-contract/preview-pdf` (JWT, watermark) |
| Ký + PDF | `POST /api/seller-contract/sign` |
| PDF service | `SellerContractPdfService` → `/uploads/contracts/seller_agreement_user_{id}.pdf` |
| DB | `Contracts` type `SELLER_AGREEMENT`, `referenceId` = userId |

**Profile** (`/profile#seller-upgrade`): khối CTA → link **`/become-seller`** (không ký hợp đồng trực tiếp trên profile).

**Điều khoản chính trong PDF:** phí nền tảng 20% giá chốt; seller tự kê khai thuế TNCN; hiệu lực sau khi staff duyệt KYC.

---

## Hợp đồng PDF (tổng hợp)

| Loại | Constant | Khi ký |
|------|----------|--------|
| Nền tảng seller | `SELLER_AGREEMENT` | Đăng ký seller / KYC |
| Niêm yết | `LISTING` | Staff duyệt sản phẩm |
| Mua bán | `PURCHASE_AGREEMENT` | Người thắng, trước thanh toán (`referenceId` = auctionId) |

Orchestration: `ContractServiceImpl` · PDF: `*ContractPdfService`

---

## Module backend (`com.auction.*`)

| Package | Việc |
|---------|------|
| `account` | User, auth, Google, KYC, OCR, profile API |
| `bidding` | Auction LIVE/TIMED, bid, deposit, settlement, payment |
| `product` | Sản phẩm, duyệt, contracts |
| `wallet` | Số dư, hold, nạp/rút, SePay |
| `chat` | Hội thoại + message + WS |
| `notification` | Thông báo in-app |
| `admin` | KPI, sales history, contracts admin |
| `config` | Security, JWT, `DataSeeder` |

---

## File quan trọng (nhảy nhanh)

**Backend**
- `bidding/service/BiddingService.java` — placeBid, LIVE vs TIMED
- `bidding/util/AuctionPhaseUtil.java` — TIMED blind
- `bidding/service/impl/AuctionSettlementServiceImpl.java` — 72h, forfeit
- `product/controller/SellerContractController.java` — preview + sign seller
- `product/service/impl/ContractServiceImpl.java`
- `config/DataSeeder.java`

**Frontend**
- `app/become-seller/page.tsx`, `components/features/SellerContractPanel.tsx`
- `app/profile/page.tsx`, `app/kyc/page.tsx`
- `components/features/PurchaseContractPanel.tsx`
- `lib/services/auctionPolling.ts` — poll state 1s
- `i18n/messages/vi.json`, `en.json`

---

## API & realtime

- REST: `/api/...` · Chat: `/api/v1/...`
- Header: `Authorization: Bearer <jwt>`
- Uploads public: `/uploads/**`
- Chat WS: `/ws/chat`, topic `/topic/conversation/{id}`

---

## Quy ước khi AI sửa code

1. Diff nhỏ, giữ palette `#071626`, `#c9aa5d`
2. Không commit trừ khi user yêu cầu
3. Chỉ **một** backend trên `:8096`
4. **Hydration:** không đọc `localStorage` lúc SSR — `useState` + `useEffect`
5. `AuctionStatus`: cần `AWAITING_PAYMENT`, `PAID`, `FORFEITED`
6. User ID: JPA `User.id` = DB `UserId`

---

## DataSeeder

`app.seed.enabled=true` → roles, demo users, ví, sản phẩm, phiên sắp diễn ra.

---

## Chưa làm / stub

- Admin: broadcasts, disputes, financial-policies (UI placeholder)
- Verify Gmail bằng email link (có controller legacy JSP, chưa gắn Next.js profile)
- **AI Smart Auto-Bidder** — chưa implement (xem roadmap bên dưới)
- **AI Fraud / Shill detector** — chưa implement

---

## Roadmap AI (đã phân tích, chưa code)

### Smart Auto-Bidder (bidding + wallet)
- **MVP khả thi:** server-side rule engine — `maxBudget`, hook sau `placeBid`, snipe LIVE trong X giây cuối
- **TIMED:** logic khác — thường 1 sealed bid trong budget, không snipe
- Cần bảng `AutoBidConfig`, API bật/tắt, kiểm tra cọc + ví
- Không nên chạy auto-bid trên browser tab (user đóng là mất)

### Fraud & Shill detector (bidding + wallet + chat)
- **MVP khả thi:** rule engine — bidder chỉ bid hàng của 1 seller, ví nạp thấp bid cao, flag + notify admin
- Chat NLP/LLM: tuỳ chọn sau
- Cần `FraudFlag`, tăng cọc hoặc chặn bid khi score cao

Ưu tiên SWP391 demo: Auto-Bidder MVP **hoặc** Fraud rules v1 — không cần train ML.

---

## Trang admin / staff stub

Một số menu admin chỉ có UI, chưa nối API đầy đủ.

---

*Cập nhật: 2026-06-29 — gộp Profile guide + seller contract flow + TIMED blind. Chỉ maintain file này.*
