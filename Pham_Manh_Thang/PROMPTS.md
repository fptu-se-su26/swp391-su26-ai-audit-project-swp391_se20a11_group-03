# Prompt Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Development Project |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | 5 |
| Tên bài tập / Project | Realtime Bidding System |
| Tên sinh viên / Nhóm | Phạm Mạnh Thắng – Nhóm 5 |
| MSSV | DE190404 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 18/05/2026 |
| Ngày cập nhật gần nhất | 12/07/2026 |

### Phạm vi phụ trách (5 chức năng)

| Mã | Module | Chức năng |
|:---:|---|---|
| M2.1 | Module 2: Quản lý Sản phẩm | Xác thực & Duyệt sản phẩm đấu giá |
| M2.2 | Module 2: Quản lý Sản phẩm | Tự động ký & gửi Hợp đồng ủy quyền lên sàn (Listing Contract) |
| M2.3 | Module 2: Quản lý Sản phẩm | Quản lý danh mục & Thuộc tính SP |
| M8.1 | Module 8: Admin Dashboard & Báo cáo | Thống kê doanh thu & Giao dịch |
| M8.2 | Module 8: Admin Dashboard & Báo cáo | Xuất báo cáo dữ liệu (Excel/CSV) |

---

## 2. Mục đích của file Prompt Log

Ghi lại các prompt quan trọng em đã dùng với ChatGPT và Cursor khi phát triển module trong folder `Pham_Manh_Thang`.

---

## 3. Công cụ AI đã sử dụng

- [x] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [x] Cursor

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Mã | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng? | Minh chứng |
|---:|:---:|---|---|---|---|---|---|---|
| 1 | M2.1, M2.3 | 22/05/2026 | ChatGPT | JPA Entity mapping | Map entity SQL Server PascalCase | Entity + naming strategy | Có | `entity/*.java` |
| 2 | M2.1 | 02/06/2026 | Cursor | Debug Bean | Lỗi autowire Repository | Kiểm tra @Repository, package scan | Có | `ProductServiceImpl` |
| 3 | M2.1 | 10/06/2026 | Cursor | Product Approval | Approve/reject pending products | Controller/Service/DTO | Có | `ProductAdminController` |
| 4 | M2.1 | 22/06/2026 | Cursor | Thymeleaf UI | Admin product approvals page | HTML + Tailwind | Có | `product-approvals.html` |
| 5 | M2.2 | 25/06/2026 | ChatGPT | Contract PDF + Email | Listing contract sau approve | Flying Saucer + Thymeleaf | Có | `ContractServiceImpl` |
| 6 | M2.3 | 15/06/2026 | Cursor | Category Validation | Validate category name regex | BusinessException server-side | Có | `CategoryServiceImpl` |
| 7 | M2.3 | 18/06/2026 | ChatGPT | Debug Database | FK error xóa category | CASCADE delete | Có | Script DB + service |
| 8 | M8.1 | 05/07/2026 | Cursor | Revenue statistics | Summary, revenue chart, transactions | JPQL + native query | Có | `StatisticsServiceImpl` |
| 9 | M8.2 | 05/07/2026 | Cursor | Export Excel/CSV | Download transactions.xlsx/csv | Apache POI + UTF-8 BOM | Có | `data-reports.html` |
| 10 | M8.1, M8.2 | 08/07/2026 | Cursor | Date filter validation | End date không sớm hơn start date | Frontend + backend validation | Có | `revenue-analytics.html` |
| 11 | M8.1, M8.2 | 10/07/2026 | Cursor | UI sync | Đồng bộ UI admin pages | Sidebar, font, English | Có | `data-reports.html` |
| 12 | — | 12/07/2026 | Cursor | Report | Điền AI Audit docs | Audit log từ source | Có | `AI_AUDIT_LOG.md` |

---

## 5. Prompt chi tiết

### Prompt số 1 – JPA Entity Mapping (M2.1, M2.3)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M2.1 Duyệt SP, M2.3 Danh mục |
| Ngày sử dụng | 22/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Map entity với SQL Server |
| Phần việc liên quan | Database / Coding |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn

```text
Spring Boot 3 + JPA + SQL Server database SWP_Nhom3.
Bảng Products có cột ProductId, SellerId, CategoryId, ProductName, StartingPrice BIGINT.
Hãy viết entity Java với @Column đúng tên cột PascalCase.
```

#### 5.2. Bối cảnh

Em mới setup project, cần map entity đúng schema nhóm để Hibernate không tạo sai tên bảng.

#### 5.3. Kết quả AI trả về

AI sinh class `Product` với `@Table(name = "Products")`, `@Column(name = "ProductId")`, và gợi ý `PhysicalNamingStrategyStandardImpl`.

#### 5.4. Kết quả đã áp dụng

Dùng cấu trúc entity và cấu hình naming strategy trong `application.properties`.

#### 5.5. Phần chỉnh sửa

Em giữ `sellerId`/`categoryId` kiểu Long thay vì `@ManyToOne` vì schema nhóm dùng FK trực tiếp.

---

### Prompt số 2 – Product Approval (M2.1)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M2.1 Xác thực & Duyệt sản phẩm đấu giá |
| Ngày sử dụng | 10/06/2026 |
| Công cụ AI | Cursor |
| Mục đích | Approve/reject product pending |
| Phần việc liên quan | Backend |

#### 5.1. Prompt nguyên văn

```text
Implement Product Approval theo clean architecture:
GET /api/admin/products/pending
POST /api/admin/products/{id}/approve
POST /api/admin/products/{id}/reject
Lưu ProductApprovals, chỉ approve khi status=PENDING.
Dùng ApiResponse wrapper, BusinessException, ResourceNotFoundException.
```

#### 5.2. Bối cảnh

Em cần module admin duyệt sản phẩm seller đăng ký đấu giá.

#### 5.3. Kết quả AI trả về

`ProductAdminController`, `ProductServiceImpl`, `ProductApprovalRequestDTO`, flow lưu lịch sử approval.

#### 5.4. Kết quả đã áp dụng

Toàn bộ flow approve/reject cơ bản.

#### 5.5. Phần chỉnh sửa

Em tách flow M2.2 (contract) sang prompt riêng; M2.1 chỉ giữ approve/reject + validation PENDING.

---

### Prompt số 3 – Category Validation (M2.3)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M2.3 Quản lý danh mục & Thuộc tính SP |
| Ngày sử dụng | 15/06/2026 |
| Công cụ AI | Cursor |
| Mục đích | Validation tên category |
| Phần việc liên quan | Backend / Frontend |

#### 5.1. Prompt nguyên văn

```text
Validate category name: chỉ chữ cái và khoảng trắng (có dấu tiếng Việt),
không số, không ký tự đặc biệt, không trùng tên.
Validate cả server (CategoryServiceImpl) và client (JavaScript).
```

#### 5.3. Kết quả AI trả về

Regex `^[a-zA-ZÀ-ỹ\\s]+$`, `existsByCategoryName`, JS `validateCategoryName()`.

#### 5.4. Kết quả đã áp dụng

Validation trong `CategoryServiceImpl` và `category-management.html`.

---

### Prompt số 4 – Debug Foreign Key CASCADE (M2.3)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M2.3 Quản lý danh mục & Thuộc tính SP |
| Ngày sử dụng | 18/06/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Debug lỗi xóa category |
| Phần việc liên quan | Database / Debug |

#### 5.1. Prompt nguyên văn

```text
SQL Server báo lỗi FK khi DELETE FROM Categories.
CategoryAttributes và AttributeOptions vẫn reference CategoryId.
Cách xử lý ON DELETE CASCADE hoặc xóa con trước?
```

#### 5.3. Kết quả

Script `ALTER TABLE ... ON DELETE CASCADE` và gợi ý xóa attribute trước trong service.

#### 5.5. Phần chỉnh sửa

Nhóm chạy script trên SSMS; em test lại xóa category trên UI.

---

### Prompt số 5 – Thymeleaf Admin UI (M2.1)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M2.1 Xác thực & Duyệt sản phẩm đấu giá |
| Ngày sử dụng | 22/06/2026 |
| Công cụ AI | Cursor |
| Mục đích | UI admin product approvals |
| Phần việc liên quan | Frontend |

#### 5.1. Prompt nguyên văn

```text
Tạo trang Thymeleaf admin pending product approvals:
sidebar LuxeAuction, bảng product, nút approve/reject,
Tailwind CSS, font Inter + Montserrat, tiếng Anh.
```

#### 5.4. Kết quả đã áp dụng

`product-approvals.html`, `AdminProductViewController`.

---

### Prompt số 6 – Contract PDF + Email

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/06/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Generate PDF contract |
| Phần việc liên quan | Backend |

#### 5.1. Prompt nguyên văn

```text
Spring Boot generate PDF từ Thymeleaf template dùng Flying Saucer.
Sau khi approve product, tạo contract LISTING và gửi email kèm PDF.
```

#### 5.4. Kết quả đã áp dụng

`ThymeleafPDFUtil`, `listing-contract.html`, `EmailServiceImpl`.

---

### Prompt số 7 – Revenue Statistics (M8.1)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M8.1 Thống kê doanh thu & Giao dịch |
| Ngày sử dụng | 05/07/2026 |
| Công cụ AI | Cursor |
| Mục đích | Summary, revenue chart, transaction table |
| Phần việc liên quan | Backend / Database / Frontend |

#### 5.1. Prompt nguyên văn

```text
Implement M8.1 – Thống kê doanh thu & Giao dịch:
- GET /api/admin/dashboard/summary (totalRevenue, totalTransactions, success/failed)
- GET /api/admin/dashboard/revenue?from=&to= (group by day, PAY_AUCTION + COMPLETED)
- GET /api/admin/dashboard/transactions?page=&size= (join Wallets→Users)
- UI /admin/revenue với Chart.js, summary cards, date filter
Tables: Transactions, Wallets, Users. Clean architecture, SQL Server SWP_Nhom3.
```

#### 5.4. Kết quả đã áp dụng

`AdminDashboardController`, `StatisticsServiceImpl`, `TransactionRepository`, `revenue-analytics.html`.

#### 5.5. Phần chỉnh sửa

Native query `CAST(CreatedAt AS DATE)`; sample data trong `DataInitializer`.

---

### Prompt số 7b – Export Excel/CSV (M8.2)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M8.2 Xuất báo cáo dữ liệu (Excel/CSV) |
| Ngày sử dụng | 05/07/2026 |
| Công cụ AI | Cursor |
| Mục đích | Export transactions.xlsx và transactions.csv |
| Phần việc liên quan | Backend / Frontend |

#### 5.1. Prompt nguyên văn

```text
Implement M8.2 – Xuất báo cáo dữ liệu:
- GET /api/admin/dashboard/export/excel?from=&to= → transactions.xlsx (Apache POI)
- GET /api/admin/dashboard/export/csv?from=&to= → transactions.csv (UTF-8 BOM)
- UI /admin/reports với date filter, nút Download Excel/CSV
Columns: Transaction ID, Username, Amount, Type, Status, Created At
```

#### 5.4. Kết quả đã áp dụng

`StatisticsServiceImpl.exportTransactionsToExcel/Csv()`, `data-reports.html`.

---

### Prompt số 8 – Debug Date Filter (M8.1, M8.2)

| Nội dung | Thông tin |
|---|---|
| Chức năng | M8.1, M8.2 |
| Ngày sử dụng | 08/07/2026 |
| Công cụ AI | Cursor |
| Mục đích | Validate date range filter |
| Phần việc liên quan | Frontend / Backend |

#### 5.1. Prompt nguyên văn

```text
Date filter không được phép end date sớm hơn start date.
Thêm validation frontend (min/max input, disable button)
và backend BusinessException trong StatisticsServiceImpl.
Hiện banner: "This report is from ... to ..." bằng tiếng Anh.
```

#### 5.4. Kết quả đã áp dụng

`validateDateRange()`, `buildFilterReportMessage()` trong HTML; backend `buildDateRange()`.

---

### Prompt số 9 – Debug Bean Injection (chưa hiệu quả lần đầu)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 02/06/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Fix autowire error |
| Phần việc liên quan | Debug |

#### 5.1. Prompt nguyên văn

```text
Fix Spring autowire error ProductRepository
```

#### 5.2. Bối cảnh

Prompt quá ngắn, thiếu log lỗi chi tiết.

#### 5.3. Kết quả

AI trả lời chung chung về @ComponentScan, không đúng root cause.

#### 5.5. Phần cải tiến

Prompt lại với full stack trace và file path → Cursor tìm đúng thiếu method `findByStatus`.

---

### Prompt số 10 – Authentication (chưa áp dụng)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 12/06/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Hỏi Spring Security JWT |
| Phần việc liên quan | Backend |

#### 5.1. Prompt nguyên văn

```text
Cách implement JWT authentication Spring Boot 3 cho admin API?
```

#### 5.3. Kết quả

AI sinh SecurityConfig, JwtFilter, UserDetailsService đầy đủ.

#### 5.4. Kết quả đã áp dụng

**Không** – nhóm chưa merge module auth. Em chỉ ghi TODO trong `INTEGRATION_NOTE.md`.

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn

```text
Implement M8.1 – Thống kê doanh thu & Giao dịch với clean architecture:
summary, revenue by day, paginated transactions.
Database SWP_Nhom3 SQL Server. Tables: Transactions, Wallets, Users.
Revenue = SUM(Amount) WHERE Status=COMPLETED AND TransactionType=PAY_AUCTION.
Không viết query trong controller.
```

### 6.2. Vì sao prompt này quan trọng?

M8.1 là module phức tạp nhất em làm: kết hợp JPQL, native query SQL Server, pagination, và Thymeleaf UI với Chart.js. M8.2 tách riêng prompt export.

### 6.3. Kết quả

`StatisticsServiceImpl`, `TransactionRepository`, `revenue-analytics.html` (M8.1); `data-reports.html` (M8.2).

### 6.4. Kiểm tra

Em chạy `mvn compile`, insert sample transactions, test API và download file Excel/CSV.

### 6.5. Cải tiến

Đồng bộ UI, thêm date validation, highlight banner thông báo filter.

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả

```text
Fix Spring autowire error
```

### 7.2. Vì sao chưa hiệu quả?

Quá ngắn, không có stack trace, không nêu class/file cụ thể.

### 7.3. Cách cải thiện

Thêm log lỗi đầy đủ, tên bean, file path, và framework version.

### 7.4. Prompt sau khi cải tiến

```text
Spring Boot 3.2 báo: Could not autowire ProductApprovalRepository
trong ProductServiceImpl.java line 33.
Project dùng @RequiredArgsConstructor Lombok.
Package: com.swp391. Hãy kiểm tra repository interface và annotation.
```

### 7.5. Kết quả sau cải tiến

AI (Cursor) chỉ đúng file thiếu method custom trong repository.

---

## 8. Bài học về cách viết prompt

### 8.1. Thông tin cần cung cấp

- Mục tiêu rõ ràng (CRUD, debug, export...).
- Công nghệ: Spring Boot 3.2, Java 21, SQL Server, JPA.
- Schema database hoặc tên bảng/cột.
- Ràng buộc: clean architecture, không logic trong controller.
- Log lỗi đầy đủ khi debug.
- Format output mong muốn (API response, file download...).

### 8.2. Học được gì

Prompt càng cụ thể, AI càng ít "đoán mò". Em nên hỏi từng phần nhỏ thay vì "làm hết project giúp tôi".

### 8.3. Cải thiện lần sau

Luôn attach context project (folder `Pham_Manh_Thang`), nêu file liên quan, và yêu cầu AI giải thích trước khi sinh code dài.

---

## 9. Phân loại prompt đã sử dụng

| Loại prompt | Số lượng | Ví dụ tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu | 2 | Use case product approval |
| Prompt giải thích kiến thức | 3 | JPA mapping, CASCADE |
| Prompt thiết kế giải pháp | 2 | Dashboard architecture |
| Prompt thiết kế database | 3 | Entity mapping, native query |
| Prompt sinh code mẫu | 8 | CRUD, dashboard, Thymeleaf |
| Prompt debug lỗi | 4 | Autowire, FK, date filter |
| Prompt review code | 1 | UI sync check |
| Prompt viết báo cáo | 2 | AI Audit docs |
| Prompt khác | 1 | Email/PDF integration |

---

## 10. Checklist chất lượng prompt

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng | x | Cải thiện dần qua các phase |
| Prompt có đủ bối cảnh | x | Cursor tốt hơn khi có full project |
| Prompt có nêu công nghệ/ngôn ngữ | x | Spring Boot 3, SQL Server |
| Prompt có nêu yêu cầu đầu ra | x | API format, file export |
| Không yêu cầu AI làm toàn bộ máy móc | x | Em chia nhỏ từng module |
| Có yêu cầu AI giải thích |  | Cần cải thiện thêm |
| Kết quả AI được kiểm tra lại | x | mvn compile + test thủ công |
| Kết quả AI được chỉnh sửa trước khi dùng | x | Luôn review |
| Prompt quan trọng được ghi lại | x | File này |
| Prompt sai được rút kinh nghiệm | x | Mục 7 |

---

## 11. Cam kết sử dụng prompt minh bạch

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phạm Mạnh Thắng – DE190404 | 12/07/2026 |
