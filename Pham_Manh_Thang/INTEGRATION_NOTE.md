# Integration Note - Pham Manh Thang (DE190404)

## Assigned Functions (Phạm vi phụ trách)

| Mã | Module | Chức năng |
|:---:|---|---|
| M2.1 | Module 2: Quản lý Sản phẩm | Xác thực & Duyệt sản phẩm đấu giá |
| M2.2 | Module 2: Quản lý Sản phẩm | Tự động ký & gửi Hợp đồng ủy quyền lên sàn (Listing Contract) |
| M2.3 | Module 2: Quản lý Sản phẩm | Quản lý danh mục & Thuộc tính SP |
| M8.1 | Module 8: Admin Dashboard & Báo cáo | Thống kê doanh thu & Giao dịch |
| M8.2 | Module 8: Admin Dashboard & Báo cáo | Xuất báo cáo dữ liệu (Excel/CSV) |

### Overview

Folder `Pham_Manh_Thang` implements the 5 functions above for the Realtime Bidding System (SWP391, Group 5). Database: `SWP_Nhom3` (SQL Server).

---

## M2.1 – Product Approval

**Flow:** Seller submits product (PENDING) → Admin/Staff approves or rejects → status updated, `ProductApprovals` record saved.

**Key files:**
- `ProductServiceImpl.java`, `ProductAdminController.java`
- `AdminProductViewController.java`, `StaffProductController.java`
- `product-approvals.html`, `staff/product-approvals.html`

**APIs:**
- `GET /api/admin/products/pending`
- `GET /api/admin/products/{productId}`
- `POST /api/admin/products/{productId}/approve`
- `POST /api/admin/products/{productId}/reject`

**UI:** `/admin/products/pending`, `/staff/products/pending`

---

## M2.2 – Listing Contract (auto after approve)

**Flow:** On approve → create `Contracts` (LISTING) → generate PDF (Flying Saucer) → send email with PDF attachment.

**Key files:**
- `ContractServiceImpl.java`, `ThymeleafPDFUtil.java`, `EmailServiceImpl.java`
- `listing-contract.html`

**Note:** `FileUrl` may be placeholder until cloud upload is integrated (see TODOs).

---

## M2.3 – Category & Product Attributes

**Flow:** Admin CRUD categories; define attributes/options per category; validation on category name.

**Key files:**
- `CategoryServiceImpl.java`, `CategoryController.java`, `CategoryAttributeController.java`
- `category-management.html`

**APIs:**
- `GET/POST/PUT/DELETE /api/admin/categories`
- `GET/POST/PUT/DELETE /api/admin/attributes/...`
- `POST /api/admin/categories/attributes`, `/attributes/options`

**UI:** `/admin/categories`

---

## M8.1 – Revenue & Transaction Statistics

**Flow:** Dashboard summary cards, revenue chart by day, paginated transaction table with date filter.

**Key files:**
- `AdminDashboardController.java`, `StatisticsServiceImpl.java`, `TransactionRepository.java`
- `revenue-analytics.html`, `AdminDashboardViewController.java`

**APIs:**
- `GET /api/admin/dashboard/summary`
- `GET /api/admin/dashboard/revenue?from=&to=`
- `GET /api/admin/dashboard/transactions?page=&size=&from=&to=`

**UI:** `/admin/revenue`

---

## M8.2 – Data Export (Excel/CSV)

**Flow:** Admin selects date range → download `transactions.xlsx` or `transactions.csv`.

**Key files:**
- `StatisticsServiceImpl.java` (Apache POI, CSV UTF-8 BOM)
- `data-reports.html`

**APIs:**
- `GET /api/admin/dashboard/export/excel?from=&to=`
- `GET /api/admin/dashboard/export/csv?from=&to=`

**UI:** `/admin/reports`

---

## External Dependencies & TODOs

1. **Spring Security (JWT)** – TODO
   - Replace hardcoded `reviewerId = 1L` with authenticated user
   - Add `@PreAuthorize` for admin/staff APIs

2. **Auction Service** – TODO (other team member)
   - Create auction when product is APPROVED
   - Hook: `ProductServiceImpl.approveProduct()`

3. **Cloud Storage** – TODO
   - Upload generated PDF to Cloudinary/S3 instead of placeholder URL
   - Hook: `ContractServiceImpl.createListingContract()`

---

## Database Tables Used

`Roles`, `Users`, `Categories`, `CategoryAttributes`, `AttributeOptions`, `Products`, `ProductImages`, `ProductAttributeValues`, `ProductApprovals`, `Contracts`, `Wallets`, `Transactions`

---

## Configuration

- Spring Boot 3.2, Java 21
- SQL Server (`application.properties`)
- Spring Data JPA, Thymeleaf, Lombok, Jakarta Validation
- Apache POI (Excel export), Flying Saucer (PDF), Spring Mail (email)
