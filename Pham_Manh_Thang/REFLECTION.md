# AI Learning Reflection

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
| Ngày hoàn thành reflection | 12/07/2026 |

---

## 2. Mục đích Reflection

Tự đánh giá quá trình sử dụng AI khi phát triển **5 chức năng phụ trách** trong folder `Pham_Manh_Thang`:

| Mã | Chức năng |
|:---:|---|
| M2.1 | Xác thực & Duyệt sản phẩm đấu giá |
| M2.2 | Tự động ký & gửi Hợp đồng ủy quyền lên sàn (Listing Contract) |
| M2.3 | Quản lý danh mục & Thuộc tính SP |
| M8.1 | Thống kê doanh thu & Giao dịch |
| M8.2 | Xuất báo cáo dữ liệu (Excel/CSV) |

Ngoài 5 chức năng cũ, em còn dùng AI ở giai đoạn sau để tích hợp thêm **Module Event Management** và **Admin Event CRUD** vào main project.

---

## 3. Tóm tắt quá trình sử dụng AI

Em bắt đầu dùng ChatGPT từ Phase 01–02 để hỏi lý thuyết Spring Boot, JPA, và thiết kế entity cho M2.1/M2.3. Từ Phase 03 trở đi em chuyển sang dùng Cursor nhiều hơn vì nó đọc được toàn bộ project và gợi ý code phù hợp với cấu trúc sẵn có.

AI được dùng xuyên suốt 5 chức năng: **M2.1** approve/reject + UI admin, **M2.2** PDF contract + email, **M2.3** CRUD category/attribute + validation, **M8.1** thống kê doanh thu + Chart.js, **M8.2** export Excel/CSV. Ở giai đoạn sau, em còn dùng AI để tích hợp **Module Event Management**, sửa lỗi compile module `event`, tạo trang `/events`, `/events/[slug]` và `/admin/events`. Mức độ sử dụng ở mức **trung bình đến nhiều**, nhưng em luôn tự chạy thử và chỉnh sửa trước khi coi là xong.

Có một số gợi ý AI em **không** áp dụng, ví dụ implement Spring Security JWT ngay trong module vì nhóm chưa thống nhất phần authentication – em chỉ ghi TODO trong `INTEGRATION_NOTE.md`.

---

## 4. Công cụ AI đã sử dụng

- [x] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [x] Cursor

### Công cụ được sử dụng nhiều nhất

**Cursor** – vì tích hợp IDE, đọc multi-file context, phù hợp khi sửa code trực tiếp trong `Pham_Manh_Thang`.

### Lý do sử dụng công cụ đó

Cursor giúp em implement nhanh các module lớn (dashboard, category UI) mà vẫn giữ đúng package structure `com.swp391`. ChatGPT dùng khi em cần giải thích khái niệm hoặc hỏi nhanh không cần mở project.

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

- [x] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [ ] Tìm ý tưởng giải pháp (một phần – em tự quyết flow chính)
- [x] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case (chưa đầy đủ)
- [ ] Review code (một phần)
- [x] Tối ưu code (một phần)
- [ ] Kiểm tra bảo mật
- [x] Viết báo cáo
- [ ] Chuẩn bị thuyết trình
- [x] Tìm hiểu công nghệ mới (Apache POI, Flying Saucer PDF)

### Mô tả chi tiết theo từng chức năng

| Chức năng | AI hỗ trợ | Em tự làm |
|---|---|---|
| **M2.1** Duyệt SP | Khung API approve/reject, UI `product-approvals.html` | Validation PENDING, flow lưu `ProductApprovals` |
| **M2.2** Listing Contract | Flying Saucer PDF, template `listing-contract.html` | Tích hợp sau approve, cấu hình Spring Mail |
| **M2.3** Danh mục | CRUD category/attribute, regex validation | CASCADE delete, test FK trên SSMS |
| **M8.1** Thống kê | JPQL summary, native query group by date | Chart.js UI, date filter validation |
| **M8.2** Export | Apache POI, CSV UTF-8 BOM | UI `/admin/reports`, filename `transactions.xlsx` |
| **EVENT** Event Management | Di chuyển module, tạo UI public/admin, rà compile errors | Đối chiếu enum/DTO/service với codebase, chạy `mvn compile` |

**Debug:** Khi gặp lỗi FK xóa category (M2.3), lỗi JPQL group by date (M8.1), hoặc lỗi autowire bean (M2.1), AI gợi ý hướng xử lý. Em vẫn phải tự đọc log và test lại.

**Báo cáo:** AI hỗ trợ format AI Audit docs từ source code; em tự verify nội dung kỹ thuật theo đúng 5 chức năng cũ và phần Event bổ sung.

---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em học tốt hơn

- Hiểu nhanh hơn cách map JPA với SQL Server (PascalCase columns).
- Biết thêm pattern layered architecture và `GlobalExceptionHandler`.
- Học cách dùng Apache POI export Excel và native query cho thống kê.
- Có thêm ví dụ Thymeleaf admin UI thực tế.
- Biết cách debug có hệ thống hơn thay vì trial-and-error mù quáng.
- Hiểu rõ hơn cách tích hợp một module mới như Event vào codebase lớn mà không phá vỡ kiến trúc hiện có.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

- Đôi khi AI gợi ý `@ManyToOne` không khớp schema nhóm (FK dạng ID).
- JPQL cast date không luôn chạy trên SQL Server – em phải tự đổi native query.
- Prompt ngắn thì AI trả lời chung chung, mất thời gian hỏi lại.
- Có lúc AI sinh code "đẹp" nhưng thừa so với yêu cầu môn học.
- Dễ có cảm giác xong nhanh nhưng chưa chắc đã hiểu nếu không tự test.

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [ ] Không phụ thuộc
- [ ] Phụ thuộc ít
- [x] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

**Giải thích:** Em dùng AI khá nhiều cho code boilerplate và query phức tạp, nhưng phần business logic (approve chỉ khi PENDING, validate category, date filter) em tự nghĩ và tự test. Nếu không có AI em vẫn làm được nhưng chậm hơn đáng kể, đặc biệt phần dashboard và export.

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [ ] Viết test case
- [x] So sánh với yêu cầu đề bài
- [x] Đối chiếu với tài liệu môn học
- [x] Review code
- [ ] Hỏi lại giảng viên
- [x] Tra cứu tài liệu chính thống
- [x] Thảo luận với thành viên nhóm
- [x] Kiểm tra bằng dữ liệu mẫu
- [x] So sánh trước và sau khi dùng AI

### Mô tả quá trình kiểm chứng

Sau mỗi lần AI sinh code, em chạy `mvn compile` và `mvn spring-boot:run`. Với API em test bằng browser/Postman. Với dashboard em tạo sample transactions trong `DataInitializer` để chart có dữ liệu. Với category em test xóa/sửa trên UI và xem SSMS. Em đọc lại từng Service để chắc không có SQL trong Controller.

### Ví dụ cụ thể về một lần kiểm chứng

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | JPQL group revenue by `cast(createdAt as localdate)` |
| Em đã kiểm tra bằng cách nào? | Gọi `GET /api/admin/dashboard/revenue` → lỗi query |
| Kết quả kiểm tra | Sai – cần chỉnh sửa |
| Em đã xử lý tiếp như thế nào? | Đổi sang native query `CAST(t.CreatedAt AS DATE)` trong `TransactionRepository`, test lại OK |

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Map `Product.seller` bằng `@ManyToOne User` |
| Vì sao gợi ý đó sai/chưa phù hợp? | Schema `SWP_Nhom3` dùng cột `SellerId BIGINT` trực tiếp, không phải quan hệ JPA object |
| Em phát hiện bằng cách nào? | So sánh entity với script SQL database nhóm |
| Em đã sửa như thế nào? | Dùng `private Long sellerId` trong `Product.java` |
| Bài học rút ra | Luôn mở script DB trước khi tin entity AI sinh ra |

---

## 9. Phần đóng góp thật sự của sinh viên/nhóm

**Em tự làm (theo 5 chức năng):**

- **M2.1:** Flow approve/reject, kiểm tra status PENDING, UI admin/staff.
- **M2.2:** Tích hợp tạo contract + PDF + email ngay sau approve.
- **M2.3:** CRUD category/attribute, validation tên, xử lý CASCADE delete.
- **M8.1:** Native query SQL Server, Chart.js, date filter validation.
- **M8.2:** Export Excel/CSV, UI `/admin/reports`.
- Cấu hình `application.properties`, Spring Mail, `DataInitializer` seed demo.
- Quyết định không implement Security/Auction vì ngoài phạm vi 5 chức năng.
- Tích hợp module Event vào main project, sửa lỗi compile do enum/DTO/service không khớp, và tạo thêm giao diện Event cho public/admin.
- Đọc lại và verify tài liệu AI Audit trước khi nộp.

**AI hỗ trợ:** sinh khung code, gợi ý query, gợi ý UI, hỗ trợ debug hướng, format tài liệu, và hỗ trợ tích hợp module Event.

**Em không copy nguyên văn** – mọi file đều qua ít nhất một vòng em tự chạy và sửa.

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Đọc đề nhiều lần | AI gợi ý use case nhanh | Tiết kiệm ~1–2 ngày phân tích |
| Phân tích bài toán | Tự vẽ flow | AI gợi ý layered arch | Rõ cấu trúc package hơn |
| Thiết kế giải pháp | Tự nghĩ | AI + tự chọn | Cân bằng tốc độ và kiểm soát, kể cả khi thêm Event module |
| Code/Implementation | Chậm, hay sai cú pháp | Nhanh hơn với boilerplate | Hoàn thành nhiều module hơn, thêm cả Event |
| Debug/Testing | Mất nhiều thời gian | AI gợi ý hướng | Giảm thời gian "mò" lỗi, đặc biệt với compile errors của Event |
| Báo cáo/Thuyết trình | Format thủ công | AI hỗ trợ structure | Tập trung verify nội dung |
| Làm việc nhóm | `INTEGRATION_NOTE.md` tự viết | AI gợi ý TODO rõ | Dễ handoff cho thành viên khác |

---

## 11. Bài học về môn học

Sau project này em hiểu rõ hơn:

- **Spring Boot layered architecture**: tách Controller, Service, Repository, DTO.
- **JPA/Hibernate** với SQL Server: naming strategy, native query khi cần.
- **Exception handling** tập trung với `@RestControllerAdvice`.
- **Thymeleaf** kết hợp REST API trong cùng project.
- **Tích hợp module nhóm**: ghi TODO, không implement phần không thuộc scope.
- **Validation** cả server và client.
- **Export dữ liệu** với Apache POI và CSV encoding.
- **Tích hợp module có sẵn**: biết cách lấy code từ package khác, đưa về đúng source set và sửa các điểm không tương thích.

Em cũng nhận ra môn SWP391 không chỉ là viết code mà còn là quản lý phạm vi, tài liệu, và làm việc nhóm.

---

## 12. Bài học về sử dụng AI có trách nhiệm

- AI có thể sai – đặc biệt với database schema cụ thể.
- Phải ghi nhận trung thực trong AI Audit Log.
- Không nộp code mình không giải thích được.
- Prompt càng cụ thể càng hiệu quả.
- AI là trợ lý, không thay thế tư duy và trách nhiệm cá nhân.
- Kiểm tra bằng chạy thử quan trọng hơn tin AI "code đã OK".
- Khi tích hợp module mới, phải kiểm tra compile/build toàn project thay vì chỉ nhìn từng file riêng lẻ.

---

## 13. Điều em/nhóm sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.
- [x] Không dùng AI để tạo nội dung sai lệch hoặc gian lận.
- [x] Không dùng AI thay thế hoàn toàn quá trình học.
- [x] Không bỏ qua yêu cầu, rubric hoặc hướng dẫn của giảng viên.

### Giải thích thêm

Em dùng AI nhiều nhưng vẫn coi đây là **công cụ học tập**. Phần quan trọng nhất là em hiểu flow approve product, cách query dashboard, và lý do chưa có authentication trong module mình.

---

## 14. Kế hoạch cải thiện lần sau

- Viết prompt kèm stack trace và file path ngay từ đầu.
- Hỏi AI giải thích trước khi sinh code dài.
- Bổ sung unit test thay vì chỉ test thủ công.
- Ghi prompt log ngay khi dùng AI, không để cuối kỳ mới nhớ.
- Đối chiếu AI output với tài liệu Spring chính thống.
- Thảo luận nhóm trước khi merge code AI vào repo chung.
- Với module mới như Event, cần nối thêm nội dung audit ngay lúc làm để không bị thiếu ở CHANGELOG/PROMPTS/REFLECTION.

---

## 15. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Đầy đủ 4 file audit |
| Prompt có mục tiêu rõ ràng | 4 | Cải thiện dần qua project |
| Kiểm chứng kết quả AI | 4 | Test thủ công, chưa có auto test |
| Tự chỉnh sửa/cải tiến | 5 | Luôn review code AI |
| Hiểu nội dung đã nộp | 4 | Tự tin giải thích module mình |
| Reflection có chiều sâu | 4 | Dựa trên trải nghiệm thực |
| Sử dụng AI có trách nhiệm | 5 | Ghi log, không copy mù |

---

## 16. Câu hỏi tự vấn cuối bài

### 16.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

Có. Em có thể chỉ rõ file nào AI hỗ trợ nhiều (dashboard, category UI, event integration) và file nào em tự thiết kế logic chính (approve flow, validation, rà soát tương thích codebase). Em có `AI_AUDIT_LOG.md` và `PROMPTS.md` làm minh chứng.

### 16.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

Có, nhưng mất nhiều thời gian hơn. Phần CRUD cơ bản em tự làm được. Phần khó nhất nếu không có AI là native query thống kê, export Excel và việc rà lỗi compile khi tích hợp module Event.

### 16.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

- **M2.1:** `ProductServiceImpl.approveProduct()` – kiểm tra PENDING, lưu lịch sử approval.
- **M2.2:** Tích hợp contract → PDF → email trong một flow sau approve.
- **M2.3:** Validation `CategoryServiceImpl` – regex tên category, xử lý CASCADE.
- **M8.1:** Đổi JPQL sang native query `CAST(CreatedAt AS DATE)` sau khi test thất bại.
- **M8.2:** Export Excel/CSV với encoding đúng cho tiếng Việt.
- **EVENT:** Sửa tương thích giữa module Event và codebase hiện tại (enum, DTO, notification service, Product entity) để `mvn compile` chạy thành công.
- Quyết định kiến trúc: không nhét SQL vào Controller, ghi TODO Security thay vì implement nửa vời.

### 16.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

- Viết unit test tự động (JUnit, MockMvc).
- Spring Security / JWT khi nhóm tích hợp.
- Prompt engineering – viết prompt cụ thể hơn ngay từ đầu.
- Đọc tài liệu SQL Server/JPA sâu hơn thay vì phụ thuộc AI cho query phức tạp.
- Kỹ năng tích hợp module lớn vào codebase hiện có và đồng bộ tài liệu audit cho đầy đủ.

---

## 17. Cam kết Reflection

Em cam kết nội dung reflection này phản ánh trung thực quá trình sử dụng AI và học tập trong project SWP391.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Phạm Mạnh Thắng – DE190404 | 12/07/2026 |
