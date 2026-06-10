# Changelog

## 1. Quy định ghi Changelog

File này ghi lại các thay đổi quan trọng trong quá trình thực hiện project SWP391 – Realtime Bidding System, phạm vi folder `Pham_Manh_Thang` (Phạm Mạnh Thắng – DE190404).

---

## 2. Thông tin project

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
| Repository URL | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03 |
| Ngày bắt đầu | 18/05/2026 |
| Ngày hoàn thành | 12/07/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 18/05 – 25/05/2026 | Khởi tạo project | Completed |
| Phase 02 | 26/05 – 05/06/2026 | Phân tích yêu cầu | Completed |
| Phase 03 | 06/06 – 18/06/2026 | Thiết kế hệ thống | Completed |
| Phase 04 | 19/06 – 02/07/2026 | Implementation | Completed |
| Phase 05 | 03/07 – 10/07/2026 | Testing & Debug | Completed |
| Phase 06 | 11/07 – 12/07/2026 | Hoàn thiện báo cáo và demo | Completed |

---

# [Phase 01] Khởi tạo project

## Ngày thực hiện

18/05/2026 – 25/05/2026

## Đã hoàn thành

- [x] Tạo repository nhóm trên GitHub
- [x] Tạo cấu trúc thư mục `Pham_Manh_Thang`
- [x] Tạo file `AI_AUDIT_LOG.md`, `PROMPTS.md`, `REFLECTION.md`, `CHANGELOG.md`
- [x] Khởi tạo Spring Boot project (`Swp391Application.java`)
- [x] Cài đặt Maven dependencies (Web, JPA, Thymeleaf, SQL Server, Lombok, Validation)
- [x] Cấu hình `application.properties` kết nối `SWP_Nhom3`

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Khởi tạo Spring Boot 3.2, Java 21 | Phạm Mạnh Thắng | `pom.xml`, `Swp391Application.java` | `mvn compile` OK |
| 2 | Cấu hình SQL Server datasource | Phạm Mạnh Thắng | `application.properties` | App connect DB |
| 3 | Tạo package structure `controller/service/repository/entity/dto` | Phạm Mạnh Thắng | `com.swp391.*` | Source tree |

## AI có hỗ trợ không?

- [x] Có

ChatGPT gợi ý cấu trúc Maven Spring Boot và dependencies cơ bản. Em tự chọn SQL Server driver và naming strategy.

## Ghi chú

Folder `Pham_Manh_Thang` là module cá nhân trong repo nhóm 5.

---

# [Phase 02] Phân tích yêu cầu

## Ngày thực hiện

26/05/2026 – 05/06/2026

## Đã hoàn thành

- [x] Xác định **5 chức năng phụ trách**: M2.1 Duyệt SP, M2.2 Listing Contract, M2.3 Danh mục & Thuộc tính, M8.1 Thống kê doanh thu, M8.2 Xuất báo cáo
- [x] Xác định user roles: Admin, Staff, Seller, User (từ bảng `Roles`)
- [x] Xác định functional requirements cho approve/reject product (M2.1)
- [x] Xác định business rules: product PENDING → APPROVED/REJECTED → tạo contract (M2.2)
- [x] Review yêu cầu với nhóm và `INTEGRATION_NOTE.md`

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Ghi nhận TODO Spring Security, Auction, Notification | Phạm Mạnh Thắng | `INTEGRATION_NOTE.md` | File trong repo |
| 2 | Xác định API contract cho Product & Category | Phạm Mạnh Thắng | `INTEGRATION_NOTE.md` | API list |
| 3 | Phân chia module theo folder thành viên | Nhóm 5 | Repo structure | GitHub |

## AI có hỗ trợ không?

- [x] Có

AI hỗ trợ gợi ý user story và use case cho product approval flow.

## Ghi chú

Authentication/Authorization chưa implement trong phase này – ghi TODO trong code.

---

# [Phase 03] Thiết kế hệ thống

## Ngày thực hiện

06/06/2026 – 18/06/2026

## Đã hoàn thành

- [x] Thiết kế kiến trúc layered: Controller → Service → Repository
- [x] Thiết kế database mapping với `SWP_Nhom3` (suy luận từ entity)
- [x] Thiết kế API REST + Thymeleaf admin views
- [x] Thiết kế DTO pattern (`ApiResponse`, các DTO request/response)
- [x] Thiết kế exception handling (`GlobalExceptionHandler`)
- [x] Thiết kế flow: Approve Product → Create Contract → Generate PDF → Send Email

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Entity JPA cho 12 bảng | Phạm Mạnh Thắng | `entity/*.java` | Hibernate mapping |
| 2 | `ApiResponse<T>` wrapper | Phạm Mạnh Thắng | `ApiResponse.java` | API JSON format |
| 3 | Exception classes + handler | Phạm Mạnh Thắng | `exception/*.java` | Error response |
| 4 | ERD suy luận: Products → ProductApprovals, Categories → CategoryAttributes | Phạm Mạnh Thắng | Entity relations | Source code |

## AI có hỗ trợ không?

- [x] Có

AI hỗ trợ thiết kế entity JPA, gợi ý `@Column` mapping SQL Server PascalCase.

## Ghi chú

Database schema dùng chung cả nhóm (`SWP_Nhom3`). Em chỉ map các bảng liên quan module mình.

**Bảng database sử dụng (suy luận từ entity):**
`Roles`, `Users`, `Categories`, `CategoryAttributes`, `AttributeOptions`, `Products`, `ProductImages`, `ProductAttributeValues`, `ProductApprovals`, `Contracts`, `Wallets`, `Transactions`

---

# [Phase 04] Implementation

## Ngày thực hiện

19/06/2026 – 02/07/2026

## Đã hoàn thành

- [x] **M2.1** Xác thực & Duyệt sản phẩm đấu giá (Admin/Staff API + UI)
- [x] **M2.2** Tự động ký & gửi Hợp đồng ủy quyền lên sàn (PDF + Email sau approve)
- [x] **M2.3** Quản lý danh mục & Thuộc tính SP (CRUD category/attribute + Admin UI)
- [x] **M8.1** Thống kê doanh thu & Giao dịch (summary, revenue chart, bảng phân trang)
- [x] **M8.2** Xuất báo cáo dữ liệu Excel/CSV (`transactions.xlsx`, `transactions.csv`)
- [x] Thymeleaf UI: `product-approvals`, `category-management`, `revenue-analytics`, `data-reports`
- [x] `DataInitializer` seed dữ liệu demo (categories, products, transactions)
- [ ] Spring Security / JWT (TODO – ngoài phạm vi 5 chức năng)
- [ ] Auction/Bidding module (thuộc thành viên khác)

## Thay đổi chi tiết

| STT | Chức năng | Nội dung thay đổi | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | M2.1 | Product Approval flow + UI Admin/Staff | `ProductServiceImpl`, `ProductAdminController`, `product-approvals.html` | Approve → APPROVED |
| 2 | M2.2 | Listing Contract + PDF + Email | `ContractServiceImpl`, `ThymeleafPDFUtil`, `EmailServiceImpl`, `listing-contract.html` | PDF bytes + email |
| 3 | M2.3 | Category CRUD + Attribute Builder | `CategoryController`, `CategoryAttributeController`, `category-management.html` | `/admin/categories` |
| 4 | M8.1 | Dashboard thống kê doanh thu & giao dịch | `AdminDashboardController`, `StatisticsServiceImpl`, `revenue-analytics.html` | `/api/admin/dashboard/summary`, `/revenue`, `/transactions` |
| 5 | M8.2 | Export Excel/CSV | `StatisticsServiceImpl` (Apache POI), `data-reports.html` | Download `transactions.xlsx`, `transactions.csv` |

## AI có hỗ trợ không?

- [x] Có

Cursor hỗ trợ sinh khung code CRUD, dashboard statistics, Thymeleaf pages. Em review và chỉnh theo DB thật.

## Ghi chú

`reviewerId = 1L` hardcoded trong `StaffProductController`, `AdminProductViewController` – chờ module Security.

---

# [Phase 05] Testing & Debug

## Ngày thực hiện

03/07/2026 – 10/07/2026

## Đã hoàn thành

- [x] Chạy test chức năng chính trên browser
- [x] Kiểm tra validation category name, product status, date range
- [x] Kiểm tra export Excel/CSV
- [x] Fix bug foreign key khi xóa category (CASCADE – suy luận từ script DB nhóm)
- [x] Fix revenue API group by date (native query SQL Server)
- [x] Fix date filter validation (from > to)
- [x] Đồng bộ UI admin pages (font, sidebar, English)
- [ ] Unit test tự động (chưa có – suy luận từ source, chỉ có `spring-boot-starter-test` dependency)

## Danh sách lỗi đã xử lý

| STT | Lỗi phát hiện | Nguyên nhân | Cách xử lý | Trạng thái |
|---:|---|---|---|---|
| 1 | Xóa category bị FK constraint | CategoryAttributes chưa CASCADE | Script SQL `ON DELETE CASCADE` + xử lý service | Fixed |
| 2 | Revenue API không group đúng theo ngày | JPQL cast date không tương thích SQL Server | Native query `CAST(CreatedAt AS DATE)` | Fixed |
| 3 | End date < start date vẫn filter được | Thiếu validation | `BusinessException` + JS validation frontend | Fixed |
| 4 | Dashboard chart trống | Không có PAY_AUCTION data | `DataInitializer` + `sample-dashboard-transactions.sql` | Fixed |
| 5 | UI revenue/reports không đồng bộ | Template khác category page | Redesign Thymeleaf theo design system chung | Fixed |

## AI có hỗ trợ không?

- [x] Có

AI hỗ trợ debug hướng xử lý CASCADE, native query, và UI sync.

## Ghi chú

Test chủ yếu thủ công qua UI và Postman, chưa có bộ test case tự động đầy đủ.

---

# [Phase 06] Hoàn thiện báo cáo và demo

## Ngày thực hiện

11/07/2026 – 12/07/2026

## Đã hoàn thành

- [x] Hoàn thiện source code module `Pham_Manh_Thang`
- [x] Hoàn thiện `AI_AUDIT_LOG.md`
- [x] Hoàn thiện `PROMPTS.md`
- [x] Hoàn thiện `REFLECTION.md`
- [x] Hoàn thiện `CHANGELOG.md`
- [x] Cập nhật `INTEGRATION_NOTE.md` (đã có từ trước)
- [ ] Video demo (nếu nhóm yêu cầu – ngoài phạm vi source)

## AI có hỗ trợ không?

- [x] Có

AI hỗ trợ tổng hợp tài liệu audit từ source code thực tế.

---

# 4. Tổng kết thay đổi cuối project

## 4.1. Các chức năng đã hoàn thành (5 chức năng phụ trách)

| Mã | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|:---:|---|---|---|---|
| M2.1 | Xác thực & Duyệt sản phẩm đấu giá | Completed | `ProductAdminController`, `ProductServiceImpl`, `product-approvals.html` | Approve/reject khi status=PENDING |
| M2.2 | Tự động ký & gửi Hợp đồng ủy quyền (Listing Contract) | Completed | `ContractServiceImpl`, `ThymeleafPDFUtil`, `EmailServiceImpl` | Tự động sau approve, PDF + email |
| M2.3 | Quản lý danh mục & Thuộc tính SP | Completed | `CategoryController`, `CategoryAttributeController`, `category-management.html` | CRUD + validation tên category |
| M8.1 | Thống kê doanh thu & Giao dịch | Completed | `GET /api/admin/dashboard/summary`, `/revenue`, `/transactions`, `revenue-analytics.html` | Chart.js, date filter, phân trang |
| M8.2 | Xuất báo cáo dữ liệu (Excel/CSV) | Completed | `GET /api/admin/dashboard/export/excel`, `/export/csv`, `data-reports.html` | Apache POI, CSV UTF-8 BOM |

## 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Spring Security / JWT Authentication | TODO trong `INTEGRATION_NOTE.md`, chưa có dependency security | Tích hợp khi nhóm hoàn thành module auth |
| 2 | Role-based Authorization | Phụ thuộc Security module | `@PreAuthorize` cho admin/staff APIs |
| 3 | Auction/Bidding realtime | Thuộc thành viên khác trong nhóm | Tích hợp sau khi product APPROVED |
| 4 | Cloud storage cho PDF/Images | TODO trong `ContractServiceImpl` | Upload Cloudinary/S3 |
| 5 | Unit/Integration tests | Chưa viết test class | Bổ sung JUnit + MockMvc |

## 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Trung bình | Gợi ý use case, em tự chốt |
| Design | Có | Trung bình | Entity mapping, API design |
| Database | Có | Nhiều | JPA, native query, CASCADE |
| Coding | Có | Nhiều | Controller/Service/Repository/UI |
| Debug | Có | Nhiều | FK error, query SQL Server, validation |
| Testing | Có | Ít | Gợi ý test case, em test thủ công |
| Report | Có | Nhiều | AI Audit docs |
| Presentation | Có | Ít | Em tự làm slide |

## 4.4. Bài học rút ra

- Luôn đối chiếu code AI với database schema thật (`SWP_Nhom3`).
- Native query cần thiết khi JPQL không tương thích SQL Server (group by date).
- Tách rõ Controller/Service/Repository giúp debug và mở rộng dễ hơn.
- Ghi `INTEGRATION_NOTE.md` và TODO rõ ràng khi làm việc nhóm.
- AI tiết kiệm thời gian nhưng không thay việc tự test và hiểu code.

## 4.5. Hướng cải thiện tiếp theo

- Tích hợp Spring Security khi nhóm merge module auth.
- Viết unit test cho `ProductServiceImpl`, `StatisticsServiceImpl`.
- Kết nối approve product với Auction service.
- Upload PDF lên cloud storage thay vì URL placeholder.

---

# 5. Cam kết cập nhật Changelog

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phạm Mạnh Thắng – DE190404 | 12/07/2026 |
