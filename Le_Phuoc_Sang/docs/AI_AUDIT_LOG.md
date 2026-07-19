# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Development Project |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | 5 |
| Tên bài tập / Project | Realtime Bidding System |
| Tên sinh viên / Nhóm | Phạm Mạnh Thắng (Nhóm 5) |
| MSSV / Danh sách MSSV | DE190404 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 18/05/2026 |
| Ngày hoàn thành | 12/07/2026 |
| Repository | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03 |

### Phạm vi phụ trách (Phạm Mạnh Thắng – folder `Pham_Manh_Thang`)

| Mã | Module | Chức năng | Trạng thái |
|:---:|---|---|:---:|
| M2.1 | **Module 2: Quản lý Sản phẩm** | Xác thực & Duyệt sản phẩm đấu giá | Hoàn thành |
| M2.2 | **Module 2: Quản lý Sản phẩm** | Tự động ký & gửi Hợp đồng ủy quyền lên sàn (Listing Contract) | Hoàn thành |
| M2.3 | **Module 2: Quản lý Sản phẩm** | Quản lý danh mục & Thuộc tính SP | Hoàn thành |
| M8.1 | **Module 8: Admin Dashboard & Báo cáo** | Thống kê doanh thu & Giao dịch | Hoàn thành |
| M8.2 | **Module 8: Admin Dashboard & Báo cáo** | Xuất báo cáo dữ liệu (Excel/CSV) | Hoàn thành |

---

## 2. Công cụ AI đã sử dụng

- [x] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [x] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Em sử dụng AI để hỗ trợ **5 chức năng** em phụ trách trong folder `Pham_Manh_Thang`:

| Chức năng | AI hỗ trợ chính |
|---|---|
| **M2.1** Xác thực & Duyệt sản phẩm đấu giá | Flow approve/reject, validation trạng thái PENDING, UI admin duyệt SP |
| **M2.2** Tự động ký & gửi Hợp đồng ủy quyền (Listing Contract) | Tạo contract, sinh PDF, gửi email kèm hợp đồng sau khi duyệt |
| **M2.3** Quản lý danh mục & Thuộc tính SP | CRUD category, attribute builder, validation tên danh mục |
| **M8.1** Thống kê doanh thu & Giao dịch | Summary API, revenue theo ngày, bảng giao dịch phân trang, Chart.js |
| **M8.2** Xuất báo cáo dữ liệu (Excel/CSV) | Apache POI export `.xlsx`, CSV UTF-8 BOM |

Các mục tiêu cụ thể:

- Gợi ý kiến trúc Spring Boot (Controller → Service → Repository) cho từng chức năng trên.
- Map entity JPA với database `SWP_Nhom3` (SQL Server).
- Debug lỗi Spring Boot, JPA query, FK constraint khi xóa category.
- Hỗ trợ Thymeleaf admin UI đồng bộ (Tailwind CSS, tiếng Anh).
- Viết tài liệu AI Audit phản ánh đúng phạm vi 5 chức năng.

### Mô tả mục tiêu sử dụng AI

Em dùng ChatGPT để hỏi lý thuyết và giải thích nhanh các khái niệm Spring Data JPA, validation, exception handling. Cursor được dùng nhiều hơn khi code trực tiếp trong IDE vì nó đọc được toàn bộ project và gợi ý code phù hợp với cấu trúc hiện có. Em không copy nguyên code AI mà luôn chạy thử, sửa lại theo database thật và theo convention của nhóm.

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 22/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích sử dụng | Thiết kế entity JPA và mapping với database SQL Server |
| Phần việc liên quan | Database / Backend |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Tôi đang làm project SWP391 với database SWP_Nhom3 trên SQL Server.
Các bảng: Roles, Users, Categories, Products, ProductApprovals, Contracts.
Hãy gợi ý cách tạo entity JPA với @Column đúng tên cột PascalCase
và quan hệ @ManyToOne giữa Product-Seller, Product-Category.
```

#### 4.2. Kết quả AI gợi ý

AI gợi ý dùng `@Entity`, `@Table(name = "...")`, `@Column(name = "...")` với tên cột đúng schema SQL Server. Gợi ý dùng `PhysicalNamingStrategyStandardImpl` để giữ nguyên tên bảng/cột. Ví dụ entity `Product` map `SellerId` kiểu `Long` thay vì `@ManyToOne User` vì schema nhóm dùng foreign key dạng ID trực tiếp.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

- Cấu trúc package `com.swp391.entity`.
- Annotation `@Column(name = "ProductName")` cho các entity.
- Cấu hình `spring.jpa.hibernate.naming.physical-strategy` trong `application.properties`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Em tự bổ sung thêm entity `CategoryAttribute`, `AttributeOption`, `ProductImage`, `ProductAttributeValue` sau khi nhóm mở rộng yêu cầu category động.
- Kiểm tra lại kiểu dữ liệu `BIGINT` cho giá sản phẩm (`StartingPrice`, `StepPrice`).
- Thêm `@author Pham Manh Thang` và comment theo convention nhóm.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | suy luận từ source code – folder `entity/` |
| File liên quan | `Product.java`, `Category.java`, `User.java`, `application.properties` |
| Screenshot | Entity mapping trong IDE |
| Kết quả chạy/test | App start thành công, Hibernate log CREATE/UPDATE schema |
| Ghi chú khác | `INTEGRATION_NOTE.md` liệt kê entities ban đầu |

#### 4.6. Nhận xét cá nhân/nhóm

Lần này giúp em hiểu rõ hơn vì sao SQL Server cần map tên cột chính xác. Ban đầu em hay để Spring tự convert camelCase sang snake_case nên bị lỗi không tìm thấy bảng. Sau khi chỉnh `PhysicalNamingStrategyStandardImpl` thì ổn định hơn.

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 02/06/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Debug lỗi Spring Boot và cấu trúc Repository/Service injection |
| Phần việc liên quan | Backend / Debug |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
Spring Boot báo lỗi khi chạy ProductServiceImpl:
Could not autowire. No beans of type ProductApprovalRepository found.
Project dùng @RequiredArgsConstructor và Lombok.
Kiểm tra giúp tôi cấu trúc repository và service.
```

#### 4.2. Kết quả AI gợi ý

AI kiểm tra thiếu annotation `@Repository`, sai package scan, hoặc interface repository chưa extend `JpaRepository`. Gợi ý đảm bảo main class `Swp391Application` nằm ở package gốc `com.swp391` để scan toàn bộ sub-package.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

- Xác nhận `@Repository` trên các interface repository.
- Kiểm tra `@Service` và constructor injection qua Lombok `@RequiredArgsConstructor`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Lỗi thực tế của em là quên save file và thiếu method custom trong `ProductRepository` (`findByStatus`).
- Em tự thêm `@Transactional` cho `approveProduct()` và `rejectProduct()` sau khi đọc tài liệu Spring về transaction boundary.
- Tự test lại flow approve bằng Postman và giao diện Thymeleaf.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | suy luận từ source code |
| File liên quan | `ProductServiceImpl.java`, `ProductRepository.java`, `Swp391Application.java` |
| Kết quả chạy/test | `mvn compile` thành công, API `/api/admin/products/pending` trả dữ liệu |

#### 4.6. Nhận xét cá nhân/nhóm

AI gợi ý đúng hướng nhưng không thay em đọc log lỗi chi tiết. Em học được cách debug từng lớp: Repository → Service → Controller thay vì hỏi AI ngay khi gặp lỗi.

---

### Lần sử dụng AI số 3 – M2.1: Xác thực & Duyệt sản phẩm đấu giá

| Nội dung | Thông tin |
|---|---|
| Chức năng phụ trách | **Module 2** – Xác thực & Duyệt sản phẩm đấu giá |
| Ngày sử dụng | 15/06/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Duyệt/từ chối sản phẩm đấu giá (Admin/Staff) |
| Phần việc liên quan | Backend / Frontend |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Implement chức năng Xác thực & Duyệt sản phẩm đấu giá theo clean architecture:
- GET danh sách sản phẩm PENDING chờ duyệt
- Approve/Reject với lý do, lưu lịch sử ProductApprovals
- Chỉ cho phép duyệt khi status = PENDING
- Admin/Staff UI Thymeleaf: /admin/products/pending
Database: Products, ProductApprovals, Users.
```

#### 4.2. Kết quả AI gợi ý

AI sinh `ProductAdminController`, `ProductServiceImpl`, DTO `ProductApprovalRequestDTO`, và template `product-approvals.html`. Gợi ý dùng `BusinessException` khi product không ở trạng thái PENDING. Khi approve thì gọi `ContractService.createListingContract()`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

- Flow approve/reject cơ bản.
- `ApiResponse<T>` wrapper cho REST API.
- Cấu trúc `GlobalExceptionHandler` xử lý `ResourceNotFoundException`, `BusinessException`.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Em tự gọi `ContractService` sau khi approve (liên kết sang M2.2).
- `reviewerId` hardcode `1L` – chờ module Security của nhóm (ghi TODO).
- Thêm 50+ sản phẩm test trong `DataInitializer` để test phân trang UI duyệt.
- UI: `product-approvals.html` (Admin), `staff/product-approvals.html` (Staff).

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `ProductServiceImpl.java`, `ProductAdminController.java`, `AdminProductViewController.java`, `StaffProductController.java`, `product-approvals.html` |
| API | `GET /api/admin/products/pending`, `POST .../approve`, `POST .../reject` |
| Kết quả chạy/test | Approve → `Products.Status = APPROVED`, bản ghi `ProductApprovals` được tạo |

#### 4.6. Nhận xét cá nhân/nhóm

Đây là chức năng cốt lõi của Module 2. AI giúp nhanh khung code nhưng rule nghiệp vụ (chỉ duyệt PENDING, lưu lịch sử) em phải tự kiểm tra kỹ.

---

### Lần sử dụng AI số 4 – M2.2: Tự động ký & gửi Hợp đồng ủy quyền lên sàn

| Nội dung | Thông tin |
|---|---|
| Chức năng phụ trách | **Module 2** – Tự động ký & gửi Hợp đồng ủy quyền lên sàn (Listing Contract) |
| Ngày sử dụng | 25/06/2026 |
| Công cụ AI | ChatGPT + Cursor |
| Mục đích sử dụng | Tự động tạo hợp đồng LISTING, sinh PDF, gửi email sau khi duyệt SP |
| Phần việc liên quan | Backend |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Sau khi admin approve sản phẩm đấu giá, tự động:
1. Tạo bản ghi Contracts (ContractType=LISTING, Status=GENERATED)
2. Render PDF từ Thymeleaf template bằng Flying Saucer
3. Gửi email kèm PDF cho seller và admin
Spring Boot 3, bảng Contracts, Products.
```

#### 4.2. Kết quả AI gợi ý

`ContractServiceImpl.createListingContract()`, `generateListingContractPdf()`, `ThymeleafPDFUtil`, template `listing-contract.html`, tích hợp `EmailServiceImpl` trong `ProductServiceImpl.approveProduct()`.

#### 4.3. Phần đã sử dụng từ AI

- Flow tạo contract tự động khi approve.
- PDF generation từ HTML template.
- Gửi email Spring Mail kèm file đính kèm.

#### 4.4. Phần tự chỉnh sửa

- `FileUrl` contract hiện là placeholder – ghi TODO upload cloud (Cloudinary/S3) trong `INTEGRATION_NOTE.md`.
- Em tự test PDF mở được và email gửi thành công qua Gmail SMTP.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `ContractServiceImpl.java`, `ThymeleafPDFUtil.java`, `EmailServiceImpl.java`, `listing-contract.html` |
| Kết quả chạy/test | Approve SP → `Contracts` có bản ghi mới, email nhận được PDF |

#### 4.6. Nhận xét

Chức năng này gắn chặt với M2.1 – chỉ chạy sau khi duyệt thành công. AI gợi ý Flying Saucer phù hợp với stack Thymeleaf sẵn có.

---

### Lần sử dụng AI số 5 – M2.3: Quản lý danh mục & Thuộc tính SP

| Nội dung | Thông tin |
|---|---|
| Chức năng phụ trách | **Module 2** – Quản lý danh mục & Thuộc tính SP |
| Ngày sử dụng | 20/06/2026 |
| Công cụ AI | ChatGPT + Cursor |
| Mục đích sử dụng | CRUD danh mục, thuộc tính động theo category, xử lý CASCADE delete |
| Phần việc liên quan | Database / Backend / Frontend |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Khi xóa Categories bị lỗi foreign key với CategoryAttributes và AttributeOptions.
Database SQL Server SWP_Nhom3.
Làm sao xử lý CASCADE hoặc xóa tháp trong Spring JPA?
```

#### 4.2. Kết quả AI gợi ý

AI gợi ý `ON DELETE CASCADE` ở database hoặc `@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)` ở entity. Với project đã có schema chung nhóm, AI gợi ý chạy script SQL `ALTER TABLE ... ON DELETE CASCADE` và xóa dữ liệu con trước trong service.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

- `CategoryServiceImpl` validate tên category (chỉ chữ cái, không trùng).
- `CategoryAttributeController` CRUD attribute theo category.
- UI `category-management.html` với Category Tree + Attribute Builder.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Em và nhóm chạy script SQL CASCADE trên SSMS (thấy trong script database nhóm).
- Validation phía server: regex `^[a-zA-ZÀ-ỹ\\s]+$` trong `CategoryServiceImpl`.
- Validation phía client: JavaScript `validateCategoryName()` trong HTML.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `CategoryServiceImpl.java`, `CategoryAttributeController.java`, `category-management.html` |
| Ghi chú khác | Lỗi FK khi xóa category – suy luận từ comment/script database nhóm |

#### 4.6. Nhận xét cá nhân/nhóm

Đây là lỗi thực tế em gặp khi test xóa category. AI gợi ý đúng hướng CASCADE nhưng em vẫn phải tự chạy script trên SQL Server và test lại từng bảng con (`ProductAttributeValues`).

---

### Lần sử dụng AI số 6 – M8.1: Thống kê doanh thu & Giao dịch

| Nội dung | Thông tin |
|---|---|
| Chức năng phụ trách | **Module 8** – Thống kê doanh thu & Giao dịch |
| Ngày sử dụng | 05/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Dashboard thống kê doanh thu, biểu đồ, bảng giao dịch |
| Phần việc liên quan | Backend / Frontend / Database |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Implement Module 8 – Thống kê doanh thu & Giao dịch:
- GET /api/admin/dashboard/summary (totalRevenue, totalTransactions, success/failed)
- GET /api/admin/dashboard/revenue?from=&to= (group by day, PAY_AUCTION + COMPLETED)
- GET /api/admin/dashboard/transactions?page=&size= (join Wallets→Users)
- UI /admin/revenue với Chart.js, summary cards, date filter
Tables: Transactions, Wallets, Users. Clean architecture.
```

#### 4.2. Kết quả AI gợi ý

`AdminDashboardController`, `StatisticsServiceImpl`, `TransactionRepository` (JPQL summary + native query group by date), DTO `DashboardSummaryDTO`, `RevenueStatisticResponse`, `TransactionReportResponse`, UI `revenue-analytics.html` với Chart.js.

#### 4.3. Phần đã sử dụng từ AI

- API summary, revenue theo ngày, transactions phân trang.
- Join `Transactions → Wallets → Users` lấy username.
- Revenue = `SUM(Amount)` WHERE `PAY_AUCTION` + `COMPLETED`.

#### 4.4. Phần tự chỉnh sửa

- Native query `CAST(CreatedAt AS DATE)` thay JPQL (SQL Server).
- Date filter validation, banner "This report is from ... to ...".
- `DataInitializer` + `sample-dashboard-transactions.sql` cho demo.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `StatisticsServiceImpl.java`, `TransactionRepository.java`, `revenue-analytics.html` |
| API | `/api/admin/dashboard/summary`, `/revenue`, `/transactions` |
| UI | `http://localhost:8080/admin/revenue` |

#### 4.6. Nhận xét

Chart ban đầu trống vì chưa có dữ liệu PAY_AUCTION – em phải tự thêm sample data mới test được.

---

### Lần sử dụng AI số 7 – M8.2: Xuất báo cáo dữ liệu (Excel/CSV)

| Nội dung | Thông tin |
|---|---|
| Chức năng phụ trách | **Module 8** – Xuất báo cáo dữ liệu (Excel/CSV) |
| Ngày sử dụng | 07/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Export file transactions.xlsx và transactions.csv |
| Phần việc liên quan | Backend / Frontend |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Implement Xuất báo cáo dữ liệu Module 8:
- GET /api/admin/dashboard/export/excel?from=&to= → transactions.xlsx (Apache POI)
- GET /api/admin/dashboard/export/csv?from=&to= → transactions.csv (UTF-8 BOM)
- UI /admin/reports với date filter, nút Download Excel/CSV
Columns: Transaction ID, Username, Amount, Type, Status, Created At
```

#### 4.2. Kết quả AI gợi ý

Export endpoints trong `AdminDashboardController`, logic export trong `StatisticsServiceImpl.exportTransactionsToExcel()` và `exportTransactionsToCsv()`, UI `data-reports.html`.

#### 4.3. Phần đã sử dụng từ AI

- Apache POI `XSSFWorkbook` cho Excel.
- CSV UTF-8 BOM (`\uFEFF`) để Excel mở đúng tiếng Việt.
- Filename `transactions.xlsx`, `transactions.csv`.

#### 4.4. Phần tự chỉnh sửa

- UI `/admin/reports` đồng bộ với admin design system.
- Nút Apply Filter + banner thông báo khoảng ngày trước khi export.
- Dùng chung `findTransactionReportItemsForExport()` từ `TransactionRepository`.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `AdminDashboardController.java`, `StatisticsServiceImpl.java`, `data-reports.html` |
| API | `/api/admin/dashboard/export/excel`, `/export/csv` |
| UI | `http://localhost:8080/admin/reports` |

#### 4.6. Nhận xét

Export dùng chung query với M8.1 nhưng tách UI riêng `/admin/reports` theo yêu cầu đề bài Module 8.

---

### Lần sử dụng AI số 8

| Nội dung | Thông tin |
|---|---|
| Chức năng phụ trách | Tài liệu AI Audit (5 chức năng phụ trách) |
| Ngày sử dụng | 10–12/07/2026 |
| Công cụ AI | ChatGPT + Cursor |
| Mục đích sử dụng | Hoàn thiện tài liệu AI Audit và reflection |
| Phần việc liên quan | Report |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
Đọc source code folder Pham_Manh_Thang và điền AI_AUDIT_LOG.md, CHANGELOG.md,
PROMPTS.md, REFLECTION.md dựa trên code thực tế.
Không sửa source code, không bịa chức năng.
```

#### 4.2. Kết quả AI gợi ý

AI quét codebase, liệt kê entities, controllers, services, và suy luận tiến độ phát triển theo phase. Gợi ý nội dung audit log trung thực, ghi rõ phần chưa có (Spring Security, Auction module).

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

- Cấu trúc file audit theo template môn học.
- Danh sách module và công nghệ từ source thực tế.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

- Em tự đọc lại từng file Java để xác nhận API, entity, TODO trước khi nộp.
- Bổ sung ngày tháng, MSSV, thông tin cá nhân.
- Chỉnh văn phong cho tự nhiên hơn.

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `AI_AUDIT_LOG.md`, `CHANGELOG.md`, `PROMPTS.md`, `REFLECTION.md` |

#### 4.6. Nhận xét cá nhân/nhóm

Việc dùng AI để viết audit log giúp tiết kiệm thời gian format, nhưng nội dung kỹ thuật em vẫn phải tự verify với code.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | x |  |  | AI gợi ý use case, em tự chốt với nhóm |
| Viết user story/use case | x |  |  |  | Nhóm tự viết |
| Thiết kế database |  |  | x |  | Schema chung nhóm; AI hỗ trợ map JPA |
| Thiết kế kiến trúc hệ thống |  | x |  |  | Layered architecture, em tự quyết |
| Thiết kế giao diện |  |  | x |  | Tham khảo UI nhóm, AI hỗ trợ Tailwind/Thymeleaf |
| Code frontend |  |  | x |  | HTML/Thymeleaf + JS; em chỉnh UI sau AI |
| Code backend |  |  | x |  | Service/Repository chính; em review & test |
| Debug lỗi |  |  | x |  | AI gợi ý hướng, em tự đọc log |
| Viết test case | x |  |  |  | Chưa có unit test đầy đủ (suy luận từ source) |
| Kiểm thử sản phẩm | x | x |  |  | Em test thủ công trên browser/Postman |
| Tối ưu code |  | x |  |  | Refactor nhỏ sau khi chạy được |
| Viết báo cáo |  |  | x |  | AI Audit docs; em verify nội dung |
| Làm slide thuyết trình | x | x |  |  | Em tự làm slide demo |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI gợi ý `@ManyToOne User seller` trong Product nhưng schema nhóm dùng `SellerId BIGINT` trực tiếp | So sánh với script SQL `SWP_Nhom3` | Giữ `sellerId` kiểu Long, join qua repository khi cần |
| 2 | AI sinh JPQL `cast(createdAt as localdate)` không chạy ổn trên SQL Server | Chạy API `/revenue` báo lỗi query | Đổi sang native query `CAST(t.CreatedAt AS DATE)` |
| 3 | AI gợi ý thêm Spring Security config đầy đủ nhưng nhóm chưa tích hợp JWT | Đọc `INTEGRATION_NOTE.md` TODO | Giữ `reviewerId = 1L` tạm, ghi TODO rõ ràng |
| 4 | AI sinh UI tiếng Việt không đồng bộ với admin pages khác | Review giao diện | Đồng bộ sang tiếng Anh, cùng sidebar với category page |
| 5 | AI quên validate `from > to` ở date filter | Test thủ công chọn ngày sai | Thêm validation frontend + `BusinessException` backend |

---

## 7. Kiểm chứng kết quả AI

### Nội dung kiểm chứng

Em kiểm chứng kết quả AI bằng các cách sau:

1. **Chạy ứng dụng**: `mvn spring-boot:run` trong folder `Pham_Manh_Thang`, truy cập `http://localhost:8080`.
2. **Compile**: `mvn compile` sau mỗi thay đổi lớn.
3. **Test API thủ công**: Postman/browser cho các endpoint `/api/admin/...`.
4. **Kiểm tra database**: SSMS xem bảng `Products`, `Transactions`, `Categories` sau thao tác CRUD.
5. **So sánh với yêu cầu đề bài**: Đối chiếu 5 chức năng M2.1, M2.2, M2.3, M8.1, M8.2 với task được giao.
6. **Review code**: Đọc lại Service không để logic trong Controller.
7. **Dữ liệu mẫu**: `DataInitializer` và `sample-dashboard-transactions.sql` để demo dashboard.
8. **Đọc TODO trong code**: Xác nhận phần chưa làm (Security, Auction) không bị AI ghi nhầm là đã xong.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

**Phần em tự làm (theo 5 chức năng):**

| Chức năng | Đóng góp chính của em |
|---|---|
| M2.1 Duyệt sản phẩm đấu giá | Flow approve/reject, validation PENDING, UI admin/staff |
| M2.2 Listing Contract | Tích hợp tạo contract + PDF + email sau approve |
| M2.3 Danh mục & Thuộc tính | CRUD category/attribute, validation, CASCADE delete |
| M8.1 Thống kê doanh thu | JPQL/native query, Chart.js, date filter validation |
| M8.2 Xuất báo cáo | Apache POI Excel, CSV UTF-8 BOM, UI `/admin/reports` |

**Phần AI hỗ trợ:**

- Sinh khung code Controller/Service/Repository/DTO.
- Gợi ý JPQL, native query, Apache POI export.
- Gợi ý cấu trúc Thymeleaf admin UI.
- Hỗ trợ debug hướng xử lý lỗi.

**Phần em tự cải tiến:**

- Tích hợp email, PDF contract.
- Đồng bộ UI admin.
- Sample data cho dashboard.
- Exception handling đầy đủ hơn.

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Phạm Mạnh Thắng | DE190404 | M2.1 Duyệt SP, M2.2 Listing Contract, M2.3 Danh mục, M8.1 Thống kê, M8.2 Export | Có | Folder `Pham_Manh_Thang` |
| (Thành viên khác) | (MSSV) | Auction, Auth, ... | (Có/Không) | Folder tương ứng trong repo nhóm |

*Ghi chú: Bảng trên chỉ xác nhận phần đóng góp của em trong folder `Pham_Manh_Thang`. Các module khác do thành viên khác phụ trách.*

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

AI giúp em tiết kiệm thời gian khi tạo khung Spring Boot, entity JPA, và REST API. Đặc biệt hữu ích với các query thống kê dashboard và export Excel mà em chưa làm nhiều trước đây. Cursor hỗ trợ tốt khi sửa code trực tiếp trong project vì hiểu context nhiều file.

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

- **Spring Security/JWT**: AI gợi ý implement ngay nhưng nhóm chưa thống nhất module auth, em chỉ để TODO.
- **Auction module**: Thuộc phần thành viên khác, em không implement trong folder mình.
- **Một số cách map entity**: AI gợi ý quan hệ JPA phức tạp nhưng schema nhóm dùng FK dạng ID, em chọn cách đơn giản hơn phù hợp DB thật.

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

Chạy app, test API, xem database SSMS, compile Maven, và đọc lại code từng lớp. Với dashboard em tạo sample transactions để chắc chắn chart và export có dữ liệu.

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

Phần khó nhất sẽ là **native query group by date trên SQL Server** và **export Excel/CSV với Apache POI** vì em chưa có nhiều kinh nghiệm. Phần CRUD cơ bản em vẫn tự làm được nhưng sẽ mất nhiều thời gian hơn.

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

Em hiểu rõ hơn kiến trúc layered trong Spring Boot, cách tách DTO/Entity, xử lý exception tập trung, và tích hợp Thymeleaf với REST API. Em cũng học cách làm việc với database dùng chung trong nhóm và ghi chú integration (`INTEGRATION_NOTE.md`) cho thành viên khác.

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

AI là công cụ hỗ trợ, không thay thế việc hiểu bài. Em phải luôn chạy thử, đọc code AI sinh ra, và ghi nhận trung thực phần nào dùng AI. Không nộp code mà mình không giải thích được trước giảng viên.

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực trong file này và các file `PROMPTS.md`, `REFLECTION.md`, `CHANGELOG.md`.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp trong folder `Pham_Manh_Thang`.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phạm Mạnh Thắng – DE190404 | 12/07/2026 |
