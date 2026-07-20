# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | SU26 |
| Tên bài tập / Project | Real-time Bidding System (LuxeAuction) |
| Tên sinh viên / Nhóm | Phạm Mạnh Thắng – Nhóm 3 |
| MSSV | DE190404 |
| Giảng viên hướng dẫn | QuangLTN3 |
| Ngày bắt đầu | 11/05/2026 |
| Ngày hoàn thành | 20/07/2026 |

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

Các mục tiêu cụ thể cho module cũ:

- Gợi ý kiến trúc Spring Boot (Controller -> Service -> Repository) cho từng chức năng trên.
- Map entity JPA với database `SWP_Nhom3` (SQL Server).
- Debug lỗi Spring Boot, JPA query, FK constraint khi xóa category.
- Hỗ trợ Thymeleaf admin UI đồng bộ (Tailwind CSS, tiếng Anh).
- Viết tài liệu AI Audit phản ánh đúng phạm vi 5 chức năng.

Ngoài ra, ở giai đoạn sau em tiếp tục dùng AI cho **Module Event Management** và **Admin Event Dashboard CRUD**:

- Tìm hiểu cách tổ chức module Event theo cấu trúc sẵn có của project (controller/service/repository/entity/dto).
- Dùng Cursor để di chuyển code từ `src/backend` sang `src/main/java` và fix lỗi thiếu `isLockedInEvent` trong `Product` entity.
- Dùng Cursor để tạo frontend Event pages (public và admin) theo thiết kế LuxeAuction hiện tại (Header, Footer, AdminSidebar).
- Dùng AI để sửa lỗi compile trong module `event` cho khớp với enum, DTO và notification service của codebase hiện tại.
- Cuối kỳ dùng Cursor hỗ trợ tổng hợp các file audit (CHANGELOG, PROMPTS, REFLECTION, AI_AUDIT_LOG) cho chính mình.

Em không copy nguyên code AI mà luôn kiểm tra, chạy thử (`mvn compile`), và chỉnh sửa để phù hợp với schema DB nhóm, kiến trúc hiện tại, và cả phạm vi nhiệm vụ cũ lẫn mới của mình.

---

## 4. Nhật ký sử dụng AI chi tiết

---

### Lần sử dụng AI số 1 – Di chuyển Event Module và Fix Product Entity

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 20/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Di chuyển toàn bộ module Event từ `src/backend` sang `src/main/java/com/auction/event` và fix missing field trong Product entity |
| Phần việc liên quan | Backend / Database / Code Integration |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng
```text
Em cần di chuyển toàn bộ code event từ thư mục src/backend/src/main/java/com/auction/event sang src/main/java/com/auction/event, giữ nguyên cấu trúc package. Sau đó kiểm tra xem có file nào lỗi không, đặc biệt là reference đến Product entity.
```

#### 4.2. Kết quả AI gợi ý
Cursor giúp copy tất cả file event module sang đúng thư mục, và phát hiện lỗi missing `isLockedInEvent` field trong `Product.java`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
Toàn bộ file event module được di chuyển thành công, và Cursor chỉ đúng vị trí cần thêm `isLockedInEvent` vào Product entity.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến
Em tự thêm `isLockedInEvent` với default `false` vào `Product.java`, sau đó chạy `mvn compile` để kiểm tra, và all passed!

#### 4.5. Minh chứng
| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `src/main/java/com/auction/product/entity/Product.java`, toàn bộ folder `src/main/java/com/auction/event` |
| Kết quả chạy/test | `mvn compile` exit code 0 (thành công) |

---

### Lần sử dụng AI số 2 – Cập nhật DataSeeder để seed Event data

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 20/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Cập nhật DataSeeder.java để đảm bảo schema event tồn tại và seed dữ liệu mẫu |
| Phần việc liên quan | Backend / Database / Seed Data |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng
```text
Hãy cập nhật DataSeeder.java để thêm method ensureEventTables() và seedSampleEvents(). Phương thức này sẽ kiểm tra và tạo các bảng AuctionEvent, EventProduct, EventRegistration, SealedBid, PennyBid nếu chưa có, sau đó seed 8 event mẫu với banner, thumbnail, nội dung, các trạng thái khác nhau, một số sản phẩm trong event, và một số user/seller đã đăng ký.
```

#### 4.2. Kết quả AI gợi ý
Cursor đã thêm `ensureEventTables()` và `seedSampleEvents()` vào `DataSeeder.java`, cùng với các helper method như `insertSampleEvent()`, `insertEventProduct()`, `insertEventRegistration()`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
Toàn bộ logic seed event và ensure schema.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải thiện
Em tự kiểm tra DB schema và đảm bảo tên cột khớp, chạy lại `mvn compile` để confirm no errors.

#### 4.5. Minh chứng
| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `src/main/java/com/auction/config/DataSeeder.java` |
| Kết quả chạy/test | `mvn compile` OK |

---

### Lần sử dụng AI số 3 – Frontend Event Pages (Public)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 20/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Tạo trang Events List và Event Detail theo thiết kế LuxeAuction hiện tại |
| Phần việc liên quan | Frontend / User Interface |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng
```text
Hãy tạo trang events list (src/frontend/app/events/page.tsx) và event detail (src/frontend/app/events/[slug]/page.tsx). Dùng mock data cho event trước, sử dụng các component hiện tại: Header, Footer, và theo thiết kế LuxeAuction (gold accent, dark theme, material icons).
```

#### 4.2. Kết quả AI gợi ý
2 trang event hoàn chỉnh với UI phù hợp, mock data 5 events, status badges, và các button tương tác.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
Toàn bộ UI structure của 2 trang events.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải thiện
Em tự kiểm tra các import (đảm bảo Header, Footer đúng đường dẫn) và chỉnh màu sắc, spacing theo thiết kế hiện tại của project.

#### 4.5. Minh chứng
| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `src/frontend/app/events/page.tsx`, `src/frontend/app/events/[slug]/page.tsx` |

---

### Lần sử dụng AI số 4 – Admin Event Sidebar và Pages

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 20/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Thêm Events menu vào AdminSidebar, tạo admin events management page |
| Phần việc liên quan | Frontend / Admin Dashboard |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng
```text
1. Thêm menu "Events Management" vào AdminSidebar.tsx (src/frontend/components/shells/AdminSidebar.tsx) với icon "event" và href /admin/events.
2. Tạo trang admin events (src/frontend/app/admin/events/page.tsx và EventsClient.tsx) theo cấu trúc Categories page hiện tại (AdminShell + Client component).
3. Cập nhật vi.json và en.json để thêm sidebar key cho events.
```

#### 4.2. Kết quả AI gợi ý
- AdminSidebar updated with new event menu.
- 2 admin files created: page.tsx and EventsClient.tsx.
- Translation keys added in both language files.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
Toàn bộ changes trên.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải thiện
Em tự kiểm tra các translation keys đúng vị trí trong JSON files, và đảm bảo EventsClient dùng đúng AdminShell và styling.

#### 4.5. Minh chứng
| Loại minh chứng | Nội dung |
|---|---|
| File liên quan | `src/frontend/components/shells/AdminSidebar.tsx`, `src/frontend/app/admin/events/page.tsx`, `src/frontend/app/admin/events/EventsClient.tsx`, `src/frontend/messages/vi.json`, `src/frontend/messages/en.json` |

---

### Lần sử dụng AI số 5 – Tổng hợp file Audit (CHANGELOG, PROMPTS, REFLECTION, AI_AUDIT_LOG)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 20/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Cập nhật 4 file audit cho chính mình dựa trên work vừa done |
| Phần việc liên quan | Report / Documentation |
| Mức độ sử dụng | Hỗ trợ nhiều |

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Requirement |  |  | x |  | Hiểu yêu cầu Event module |
| Viết user story/use case | x |  |  |  | Tự làm theo request của bạn |
| Thiết kế database |  | x |  |  | Dùng schema sẵn có trong src/backend, chỉ cần ensure tables |
| Thiết kế kiến trúc hệ thống |  |  | x |  | Theo cấu trúc hiện tại của project |
| Thiết kế giao diện |  |  | x |  | Dùng Header/Footer/AdminSidebar hiện tại |
| Code frontend |  |  | x |  | Event public + admin pages |
| Code backend |  |  | x |  | Di chuyển module + fix Product + DataSeeder |
| Debug lỗi |  | x |  |  | Fix missing field, compile errors |
| Viết test case | x |  |  |  | Chưa viết test cho event module |
| Kiểm thử sản phẩm |  | x |  |  | mvn compile, kiểm tra UI |
| Tối ưu code |  | x |  |  | Chỉnh sửa code cho phù hợp project |
| Viết báo cáo |  |  | x |  | 4 file audit này |
| Làm slide thuyết trình | x |  |  |  | Chưa làm |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải thiện |
|---|---|---|---|
| 1 | Ban đầu không thấy folder `src/backend` vì em chưa open đúng root project | Kiểm tra terminal working directory | Đổi working directory về project root rồi tiến hành copy |
| 2 | AI cố gắng tạo nhiều file thừa, nhưng em chỉ cần giữ những file cần thiết | Kiểm tra file list sau khi copy | Xóa bỏ file thừa, giữ đúng cấu trúc event module |
| 3 | Đôi khi AI dùng sai đường dẫn import cho frontend component | Kiểm tra IDE warnings | Sửa đường dẫn import cho đúng (ví dụ: Header from @/components/home/Header) |

---

## 7. Kiểm chứng kết quả AI

### Nội dung kiểm chứng
- Chạy `mvn compile` trong project root → exit code 0, không có lỗi.
- Kiểm tra tất cả file được tạo/edited đúng vị trí, đúng tên.
- Kiểm tra translation keys trong vi.json và en.json đúng cấu trúc.
- Đọc lại toàn bộ 4 file audit để đảm bảo nội dung trung thực, không sai sót.

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân
- **Em tự làm**: Chọn các file cần di chuyển, fix `isLockedInEvent` trong Product, kiểm tra compile, verify UI imports, tổng hợp và chỉnh sửa nội dung 4 file audit.
- **AI hỗ trợ**: Copy module, tạo seed data logic, tạo UI pages, tạo sidebar menu, format audit docs.
- **Em cải thiện**: Đảm bảo mọi thứ phù hợp với kiến trúc và thiết kế hiện tại của project, kiểm tra compile, viết nội dung audit trung thực.

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyễn Ngọc Bảo Long | DE190344 | Module Bidding, Leader | Có | `Nguyen_Ngoc_Bao_Long/` |
| Lê Phước Sang | DE190062 | Auth, KYC | Có | `Le_Phuoc_Sang/` |
| **Phạm Mạnh Thắng** | **DE190404** | **Module Event Management, Admin Event CRUD** | **Có** | `Pham_Manh_Thang/` + toàn bộ file event trong `src/` |
| Trần Văn Đức | DE191098 | — | Có | `Tran_Van_Duc/` |
| Hoàng Xuân Anh Tuấn | DE190463 | Wallet, Product | Có | `Hoang_Xuan_Anh_Tuan/` |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?
- Tiết kiệm thời gian di chuyển module lớn và tạo boilerplate code (frontend pages, sidebar menu).
- Nhanh chóng phát hiện lỗi thiếu field trong entity.
- Hỗ trợ format các file audit docs.

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?
- Không dùng AI để viết logic business core của event (vì đã có sẵn trong src/backend, chỉ cần di chuyển).
- Không dùng AI để thay đổi kiến trúc project (tuân thủ quy tắc không thay đổi kiến trúc hiện tại).

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?
- `mvn compile` để kiểm tra backend errors.
- Kiểm tra import paths trong frontend files bằng IDE.
- Đọc lại từng dòng code AI sinh ra để đảm bảo không có gì sai sót.

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?
- Di chuyển module event và đảm bảo không có import error (vì nhiều file liên quan).
- Tạo frontend pages từ đầu theo thiết kế hiện tại (phải tự tìm hiểu các component).

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?
- Cách tích hợp module mới vào hệ thống hiện tại mà không làm thay đổi kiến trúc cũ.
- Tận dụng code đã có thay vì viết lại từ đầu.
- Quan trọng của việc đảm bảo compile thành công trước khi kết thúc công việc.

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?
- Phải luôn kiểm tra kết quả AI bằng cách chạy thử (compile, test UI).
- Không được thay đổi kiến trúc project nếu không có sự chấp thuận.
- Phải ghi nhận việc sử dụng AI một cách trung thực trong các file audit.

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:
- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phạm Mạnh Thắng (DE190404) | 20/07/2026 |
