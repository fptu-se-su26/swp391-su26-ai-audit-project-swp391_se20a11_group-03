# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
| --- | --- |
| Môn học | Software Project |
| Mã môn học | SWP391 |
| Lớp / Học kỳ | SE20A11 / SU26 |
| Project | BidZone - Real-time Bidding System |
| Nhóm | Nhóm 03 |
| Sinh viên | Trần Văn Đức |
| MSSV | DE191098 |
| Vai trò | Thành viên - frontend và tích hợp hệ thống |
| Giảng viên hướng dẫn | Chưa được cung cấp trong repository |
| Thời gian ghi nhận | 08/06/2026 - 15/07/2026 |

## 2. Công cụ AI đã sử dụng

- [x] Claude / Claude Code
- [x] OpenAI Codex
- [ ] ChatGPT
- [ ] Gemini
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity

## 3. Mục tiêu sử dụng AI

AI được sử dụng để hỗ trợ chuyển giao diện Stitch sang Next.js, thiết kế module chat
real-time, phân tích lỗi phân quyền theo vai trò, review source/Git và kiểm tra chất lượng
trước khi commit. Kết quả AI chỉ được áp dụng sau khi đối chiếu với source code, tài liệu
framework và kết quả build/test.

## 4. Nhật ký sử dụng AI

### Lần 1 - Khởi tạo frontend Next.js

| Nội dung | Thông tin |
| --- | --- |
| Ngày | 08/06/2026 |
| Công cụ | Claude / Claude Code |
| Mục đích | Chuyển UI Stitch (HTML + Tailwind CDN) thành frontend Next.js |
| Mức độ sử dụng | AI sinh khung chính; sinh viên kiểm tra và hoàn thiện |

#### Prompt

```text
Hãy đóng vai Senior Frontend Engineer chuyên React và Next.js. Tôi có một bộ UI
export từ Stitch; mỗi màn hình gồm code.html và screen.png. Hãy chuyển toàn bộ UI
thành project Next.js App Router dùng TypeScript và Tailwind CSS cài trong project.

Yêu cầu: giữ đúng layout/màu/font/spacing; tách component dùng lại; mapping các màn
Admin, Collector và Staff thành route; dùng nested layout; chuyển HTML sang JSX hợp lệ;
dùng "use client" cho phần tương tác; tạo mock data khi chưa có backend; project phải
chạy được bằng npm install && npm run dev. Trước khi code, liệt kê file đã đọc và kế
hoạch component.
```

#### Kết quả AI và phần đã áp dụng

- Đề xuất App Router, shell/sidebar theo vai trò và component dùng chung.
- Khởi tạo `src/frontend/app`, `components`, `lib` và các route chính.
- Chuyển màn hình Stitch sang TSX và tạo dữ liệu mẫu cho giai đoạn đầu.

#### Phần sinh viên tự chỉnh sửa và kiểm chứng

- Bổ sung các màn Staff, auth, profile, security, messages và won-items.
- Sửa JSX/className, responsive và style theo ảnh tham chiếu.
- Thay mock data bằng API theo tiến độ backend.
- Chạy `npm install`, `npm run dev` và kiểm tra từng route.

#### Minh chứng

| Loại | Nội dung |
| --- | --- |
| Commit | [`96994d8`](https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/96994d85d5770eb9afd6d0934211a4c3e8cfb013) - `feat: initialize frontend project` |
| File | `src/frontend/` |
| Kết quả | Frontend chạy được và tạo nền tảng cho các bước tích hợp tiếp theo |

#### Bài học

Prompt có stack, phạm vi, ràng buộc và đầu ra rõ ràng giúp AI tạo cấu trúc sát nhu cầu.
Tuy nhiên, AI không biết đầy đủ role/API của repository nên kết quả vẫn cần review.

### Lần 2 - Xây dựng chat real-time

| Nội dung | Thông tin |
| --- | --- |
| Ngày | 09/06/2026 |
| Công cụ | Claude |
| Mục đích | Thiết kế chat real-time giữa User/Seller và Staff |
| Mức độ sử dụng | AI hỗ trợ nhiều; sinh viên tích hợp và sửa theo source thật |

#### Prompt

```text
Bạn là Senior Backend Engineer chuyên Spring Boot 3.x. Dự án là hệ thống đấu giá
SWP_Nhom3 sử dụng SQL Server, Spring Security, JWT và Spring Data JPA.

Implement tính năng nhắn tin real-time giữa User/Seller và Staff:
1. Thêm bảng Conversations và Messages.
2. Tạo Entity, DTO, Repository, Service, WebSocket Config, JWT Interceptor,
   REST Controller và Exception Handler.
3. User/Seller tạo conversation, Staff nhận và reply, Admin xem theo quyền.
4. Dùng WebSocket STOMP over SockJS.
5. Không tạo lại UserRepository, JwtService và UserDetailsImpl đã có.
6. Chạy mvn clean install và báo kết quả.
```

#### Kết quả AI và phần đã áp dụng

- Đề xuất schema `Conversations`, `Messages`, entity, DTO và repository.
- Tạo cấu trúc service/controller và luồng WebSocket STOMP có JWT.
- Áp dụng module `com.auction.chat` và giao diện inbox frontend.

#### Phần sinh viên tự chỉnh sửa và kiểm chứng

- Sửa package, kiểu ID và method cho khớp `User`/`UserDetailsImpl` thực tế.
- Điều chỉnh query cho SQL Server và endpoint theo controller hiện có.
- Bổ sung kiểm tra buyer, seller và staff được phân công.
- Build backend và kiểm tra luồng API theo người dùng đăng nhập.

#### Minh chứng

| Loại | Nội dung |
| --- | --- |
| Commit | [`1475faf`](https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/1475faffb02e2f883fbcfbf64be6182054fef205) - `feat: add backend Spring Boot chat system and frontend Next.js UI` |
| File | `src/backend/src/main/java/com/auction/chat/`, `src/frontend/app/messages/` |
| Kết quả | Module chat được tích hợp vào cấu trúc backend/frontend hiện tại |

#### Bài học

AI giúp giảm thời gian viết boilerplate và giải thích WebSocket flow. Các chi tiết entity,
query, endpoint và quyền truy cập vẫn phải được kiểm tra trực tiếp trong repository.

### Lần 3 - Sửa quyền truy cập Seller

| Nội dung | Thông tin |
| --- | --- |
| Ngày | 15/07/2026 |
| Công cụ | OpenAI Codex |
| Mục đích | Cho Seller dùng chức năng chung giống User/Collector |
| Mức độ sử dụng | AI phân tích và sửa một phần; sinh viên xác nhận nghiệp vụ |

#### Prompt

```text
các mục này seller vẫn k vào dc seller vẫn dùng dc các tính năng giống user bth
```

#### Kết quả AI

AI kiểm tra sidebar, cookie role, Next.js Proxy và quyền API backend. Nguyên nhân nằm ở
`src/frontend/proxy.ts`: code cũ chỉ trả về một role bắt buộc cho mỗi path. Các route
chung được nhận là `collector`, vì vậy Seller bị redirect về `/inventory` dù menu vẫn
hiển thị.

#### Phần đã áp dụng

- Tạo danh sách route chung cho Collector và Seller.
- Thay `getRequiredRole()` bằng `getAllowedRoles()` để một route cho phép nhiều role.
- Giữ `/inventory`, `/post-item`, `/earnings` là chức năng bổ sung của Seller.
- Không mở quyền các route `/staff` và `/admin`.

#### Phần sinh viên tự chỉnh sửa và kiểm chứng

- Đọc tài liệu Proxy/authorization của Next.js 16.2.10 trước khi sửa.
- Rà `SecurityConfig` để xác nhận API dùng chung không khóa riêng User.
- Chạy ESLint, TypeScript và production build; chỉ stage file Proxy.
- Phát hiện bản sửa bị ghi đè sau thao tác đồng bộ branch, áp dụng lại và push `dev`.

#### Minh chứng

| Loại | Nội dung |
| --- | --- |
| Commit | [`1a90853`](https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/1a90853c4094d4d1eee5015833efab98b309fc68) - `fix(frontend): allow sellers to access collector routes` |
| File | `src/frontend/proxy.ts`, `CollectorSidebar.tsx` |
| Kết quả | `npm run lint` và `npm run build` thành công; 44 route được build |

#### Bài học

Menu hiển thị không đồng nghĩa với được phép truy cập route. Authorization cần được kiểm
tra ở giao diện, Proxy và backend. Build thành công cũng không thay thế role test.

## 5. Tổng hợp mức độ sử dụng AI

| Hạng mục | Mức độ | Ghi chú |
| --- | --- | --- |
| Phân tích yêu cầu | AI hỗ trợ nhiều | Phân rã role, route và luồng chat |
| Thiết kế database | AI hỗ trợ nhiều | Schema chat được kiểm tra với SQL Server |
| Thiết kế kiến trúc | AI hỗ trợ nhiều | App Router và layered backend |
| Code frontend | AI sinh khung chính | Sinh viên tích hợp API và sửa quyền |
| Code backend | AI hỗ trợ nhiều | Sinh viên chỉnh entity, query và security |
| Debug | AI hỗ trợ nhiều | Tìm lỗi Proxy một-role-một-route |
| Kiểm chứng | Sinh viên thực hiện chính | Build, lint, role test và Git diff |
| Viết tài liệu | AI hỗ trợ một phần | Nội dung đối chiếu commit thực tế |

## 6. Lỗi hoặc hạn chế đã ghi nhận

| STT | Lỗi/hạn chế | Cách phát hiện | Cách xử lý |
| ---: | --- | --- | --- |
| 1 | UI ban đầu thiếu một số route Staff/tài khoản | So sánh yêu cầu và màn hình | Bổ sung route/shell còn thiếu |
| 2 | Code chat dùng method/ID chưa khớp entity | Compiler và review source | Sửa package, method, ID, query |
| 3 | Proxy giả định mỗi route chỉ thuộc một role | Đăng nhập Seller và bấm menu | Cho phép danh sách nhiều role |
| 4 | Build không phát hiện sai logic role runtime | Build đạt nhưng vẫn redirect | Kiểm thử theo ma trận role-route |

## 7. Phương pháp kiểm chứng

- Đọc source code và Git diff trước khi áp dụng kết quả AI.
- Đối chiếu tài liệu Next.js 16 có sẵn trong project.
- Chạy `npm run lint` và `npm run build` cho frontend.
- Build backend và kiểm tra endpoint bằng role phù hợp.
- Dùng `git diff --check` và chỉ stage file thuộc phạm vi thay đổi.
- Liên kết nội dung audit với commit GitHub cụ thể.

## 8. Đóng góp cá nhân

Trần Văn Đức chịu trách nhiệm xác nhận yêu cầu, lựa chọn gợi ý phù hợp, tích hợp frontend,
sửa lỗi route/role, kiểm tra build và quản lý commit liên quan. AI hỗ trợ phân tích và
sinh mã; quyết định cuối cùng, việc kiểm chứng và trách nhiệm source thuộc về sinh viên.

## 9. Reflection cuối bài

AI giúp rút ngắn thời gian dựng cấu trúc frontend/backend và khoanh vùng lỗi trên
repository lớn. Giá trị quan trọng nhất là khả năng dùng AI để phân tích vấn đề rồi kiểm
chứng bằng tài liệu, compiler, test và Git diff. Gợi ý không khớp kiến trúc hoặc quyền
nghiệp vụ đều phải được điều chỉnh.

Nếu không có AI, phần WebSocket và rà nhiều tầng phân quyền sẽ mất nhiều thời gian hơn.
Sau quá trình này, sinh viên có thể giải thích App Router, Proxy, layered architecture,
JWT/WebSocket và lý do của các thay đổi đã commit.

## 10. Cam kết học thuật

Tôi cam kết nội dung trên phản ánh trung thực việc sử dụng AI. Mọi kết quả AI đều được
kiểm tra trước khi đưa vào project; tôi hiểu và chịu trách nhiệm với source code đã nộp.

| Sinh viên | MSSV | Ngày xác nhận |
| --- | --- | --- |
| Trần Văn Đức | DE191098 | 15/07/2026 |
