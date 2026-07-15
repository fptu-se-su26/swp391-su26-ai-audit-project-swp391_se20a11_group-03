# Prompt Log

## 1. Thông tin chung

| Thông tin | Nội dung |
| --- | --- |
| Môn học | Software Project - SWP391 |
| Lớp / Học kỳ | SE20A11 / SU26 |
| Project | BidZone - Real-time Bidding System |
| Nhóm | Nhóm 03 |
| Sinh viên | Trần Văn Đức - DE191098 |
| Thời gian ghi nhận | 08/06/2026 - 15/07/2026 |

## 2. Mục đích Prompt Log

File ghi lại các prompt có ảnh hưởng trực tiếp đến frontend Next.js, backend chat
real-time và việc sửa phân quyền Seller. Mỗi kết quả đều được kiểm tra với source code,
tài liệu framework và build/test trước khi áp dụng.

## 3. Công cụ AI đã sử dụng

- [x] Claude / Claude Code
- [x] OpenAI Codex
- [ ] ChatGPT
- [ ] Gemini
- [ ] GitHub Copilot
- [ ] Cursor

## 4. Bảng tổng hợp prompt

| STT | Ngày | Công cụ | Mục đích | Kết quả chính | Áp dụng | Minh chứng |
| ---: | --- | --- | --- | --- | :---: | --- |
| 1 | 08/06/2026 | Claude | Chuyển UI Stitch sang Next.js | Khởi tạo App Router và component frontend | Có | Commit `96994d8` |
| 2 | 09/06/2026 | Claude | Xây dựng chat real-time | Module chat Spring Boot và giao diện inbox | Có, sau chỉnh sửa | Commit `1475faf` |
| 3 | 15/07/2026 | OpenAI Codex | Sửa quyền Seller | Route dùng chung cho Collector và Seller | Có | Commit `1a90853` |

## 5. Prompt chi tiết

### Prompt số 1 - Chuyển UI Stitch sang Next.js

| Nội dung | Thông tin |
| --- | --- |
| Ngày | 08/06/2026 |
| Công cụ | Claude / Claude Code |
| Loại prompt | Thiết kế giải pháp và sinh code |
| Phần việc | Frontend |

#### Prompt nguyên văn

```text
Hãy đóng vai Senior Frontend Engineer chuyên React và Next.js. Tôi có một bộ UI
export từ Stitch; mỗi màn hình gồm code.html và screen.png. Hãy chuyển toàn bộ UI
thành project Next.js App Router dùng TypeScript và Tailwind CSS cài trong project.

Yêu cầu:
1. Đọc code.html và screen.png để giữ đúng layout, màu, font và spacing.
2. Tách các phần lặp lại thành component tái sử dụng.
3. Mapping màn Admin, Collector và Staff thành route phù hợp.
4. Dùng nested layout; chuyển HTML sang JSX hợp lệ.
5. Component tương tác phải dùng "use client" và state phù hợp.
6. Dùng mock data khi chưa có backend.
7. Project phải chạy được bằng npm install && npm run dev.
8. Trước khi code, liệt kê file đã đọc và kế hoạch component.
```

#### Bối cảnh

UI ban đầu được xuất dưới dạng HTML dùng Tailwind CDN, chưa có cấu trúc component,
route hoặc project React hoàn chỉnh. Mục tiêu là tạo nền tảng frontend có thể tiếp tục
tích hợp API.

#### Kết quả AI trả về

AI đề xuất cấu trúc App Router, shell/sidebar theo vai trò, component dùng chung và cách
mapping từng màn Stitch thành route. AI đồng thời sinh khung TypeScript/Tailwind và dữ
liệu mẫu cho các màn chưa có backend.

#### Kết quả đã áp dụng

- Khởi tạo `src/frontend` và các route chính.
- Tạo shell cho Admin, Staff và Collector/Seller.
- Tách component giao diện dùng lại.
- Chuyển các màn hình chính từ HTML sang TSX.

#### Phần tự chỉnh sửa

- Bổ sung route Staff, auth, profile, security, messages và won-items.
- Sửa JSX/className và điều chỉnh giao diện theo ảnh tham chiếu.
- Thay mock data bằng API thật theo tiến độ backend.
- Chạy ứng dụng và kiểm tra từng route trước khi commit.

#### Đánh giá

- [x] Prompt rõ mục tiêu và stack.
- [x] Có đủ bối cảnh, ràng buộc và yêu cầu đầu ra.
- [x] Kết quả hữu ích.
- [x] Cần review và chỉnh sửa trước khi dùng.

#### Minh chứng

| Loại | Nội dung |
| --- | --- |
| Commit | [`96994d8`](https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/96994d85d5770eb9afd6d0934211a4c3e8cfb013) |
| File | `src/frontend/` |
| Kiểm tra | `npm install`, `npm run dev` |

### Prompt số 2 - Backend chat real-time

| Nội dung | Thông tin |
| --- | --- |
| Ngày | 09/06/2026 |
| Công cụ | Claude |
| Loại prompt | Thiết kế database, kiến trúc và sinh code |
| Phần việc | Backend và tích hợp frontend |

#### Prompt nguyên văn

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

#### Bối cảnh

Dự án đã có authentication/JWT nhưng chưa có module hội thoại hoàn chỉnh. Tính năng
cần tuân theo entity User, SecurityConfig và cấu trúc package hiện hữu.

#### Kết quả AI trả về

AI tạo đề xuất schema, entity, DTO, repository, service, controller và WebSocket flow.
Kết quả cũng mô tả kiểm tra quyền người tham gia hội thoại và broadcast tin nhắn.

#### Kết quả đã áp dụng

- Module `com.auction.chat` và các API hội thoại/tin nhắn.
- Cấu trúc conversation/message trong database.
- Giao diện inbox tại `src/frontend/app/messages`.

#### Phần tự chỉnh sửa

- Sửa package, kiểu ID và method theo User entity thật.
- Điều chỉnh query cho SQL Server.
- Bổ sung kiểm tra buyer, seller và staff được phân công.
- Đồng bộ endpoint frontend với controller backend.

#### Đánh giá

- [x] Prompt rõ công nghệ và phạm vi.
- [x] Kết quả tạo nền tảng tốt.
- [x] Cần tự kiểm tra và sửa nhiều chi tiết tích hợp.
- [x] Không dùng nguyên trạng toàn bộ code AI.

#### Minh chứng

| Loại | Nội dung |
| --- | --- |
| Commit | [`1475faf`](https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/1475faffb02e2f883fbcfbf64be6182054fef205) |
| File | `src/backend/src/main/java/com/auction/chat/`, `src/frontend/app/messages/` |
| Kiểm tra | Build backend và kiểm tra API theo tài khoản đăng nhập |

### Prompt số 3 - Quyền truy cập của Seller

| Nội dung | Thông tin |
| --- | --- |
| Ngày | 15/07/2026 |
| Công cụ | OpenAI Codex |
| Loại prompt | Debug và sửa code |
| Phần việc | Frontend authorization |

#### Prompt nguyên văn

```text
các mục này seller vẫn k vào dc seller vẫn dùng dc các tính năng giống user bth
```

#### Bối cảnh

Sidebar của Seller hiển thị các mục Phòng đấu giá, Tổng quan, Theo dõi, Đã thắng,
Tin nhắn, Ví, KYC, Hồ sơ và Bảo mật nhưng khi bấm một số mục, người dùng bị chuyển
ngược về `/inventory`.

#### Kết quả AI trả về

AI rà sidebar, cookie role, `proxy.ts` và `SecurityConfig`. Lỗi nằm ở mô hình một path
chỉ có một role bắt buộc; các route chung được nhận là Collector nên Seller bị redirect.

#### Kết quả đã áp dụng

- Dùng danh sách route chung cho Collector và Seller.
- Một route có thể trả về nhiều role được phép.
- Giữ route Admin/Staff và route riêng của Seller không thay đổi quyền.

#### Phần tự chỉnh sửa và kiểm chứng

- Xác nhận yêu cầu nghiệp vụ Seller kế thừa tính năng của User.
- Đối chiếu tài liệu Proxy/authorization của Next.js 16.2.10.
- Rà quyền backend và chạy `npm run lint`, `npm run build`.
- Kiểm tra Git diff rồi mới commit đúng một file.

#### Đánh giá

- [ ] Prompt có đầy đủ bối cảnh ngay từ đầu.
- [x] Ảnh giao diện và repository giúp bổ sung bối cảnh còn thiếu.
- [x] Kết quả xác định đúng nguyên nhân.
- [x] Kết quả đã được build và commit.

#### Minh chứng

| Loại | Nội dung |
| --- | --- |
| Commit | [`1a90853`](https://github.com/fptu-se-su26-ai-audit-project-swp391_se20a11_group-03/commit/1a90853c4094d4d1eee5015833efab98b309fc68) |
| File | `src/frontend/proxy.ts` |
| Kiểm tra | ESLint và Next.js production build thành công |

## 6. Prompt quan trọng nhất

Prompt số 1 là prompt quan trọng nhất vì nó tạo nền tảng frontend cho toàn bộ các bước
tích hợp sau đó. Prompt hiệu quả nhờ nêu rõ nguồn UI, stack bắt buộc, cấu trúc mong muốn,
route mapping, tiêu chí chất lượng và lệnh kiểm tra.

Kết quả được kiểm chứng bằng cách chạy project, so sánh giao diện với ảnh Stitch và
review cấu trúc component. Phần sinh viên cải tiến gồm bổ sung role Staff, các route tài
khoản còn thiếu, sửa JSX và thay dần mock data bằng API.

## 7. Prompt chưa hiệu quả và cách cải thiện

### Prompt chưa hiệu quả

```text
kiểm tra mục .git
```

Prompt này quá ngắn, không nói rõ cần kiểm tra cấu trúc, tính toàn vẹn, trạng thái branch
hay mong muốn sửa lỗi. AI phải tự suy đoán phạm vi và tạo nhiều output không cần thiết.

### Prompt cải tiến

```text
Hãy kiểm tra repository Git hiện tại ở chế độ chỉ đọc. Báo cáo ngắn gọn:
1. Nhánh hiện tại và trạng thái đồng bộ với origin.
2. Số file modified/staged/untracked.
3. Remote đang cấu hình.
4. Kết quả git fsck và các cảnh báo đáng chú ý.
5. Không sửa file, không reset và không push.
```

Prompt cải tiến xác định rõ phạm vi, đầu ra và giới hạn hành động, nhờ đó kết quả ngắn
gọn hơn và giảm rủi ro thay đổi repository ngoài ý muốn.

## 8. Bài học về cách viết prompt

- Cung cấp mục tiêu nghiệp vụ trước khi yêu cầu sinh code.
- Nêu rõ stack, phiên bản framework và cấu trúc repository đang có.
- Chỉ định file/phạm vi được phép thay đổi và hành động không được thực hiện.
- Đưa lỗi quan sát được, role, route, input/output hoặc ảnh minh chứng.
- Yêu cầu chạy lint/build/test và báo rõ phần chưa xác minh.
- Chia nhiệm vụ lớn thành phân tích, sửa code và kiểm chứng.
- Không coi output AI là đúng chỉ vì code compile.

## 9. Phân loại prompt

| Loại prompt | Số lượng | Ví dụ |
| --- | ---: | --- |
| Phân tích/thiết kế giải pháp | 2 | Frontend Next.js, module chat |
| Thiết kế database | 1 | Conversations và Messages |
| Sinh code | 2 | Frontend và chat backend |
| Debug | 1 | Quyền Seller qua Next.js Proxy |
| Review/kiểm chứng | 3 | Review source, lint/build, Git diff |
| Quản lý Git | 1 | Kiểm tra `.git` và đồng bộ branch |

## 10. Checklist chất lượng prompt

| Tiêu chí | Đã đạt | Ghi chú |
| --- | :---: | --- |
| Có mục tiêu rõ ràng | Có | Prompt ngắn được bổ sung bối cảnh qua trao đổi |
| Nêu công nghệ và phiên bản | Có | Spring Boot, SQL Server, Next.js 16 |
| Nêu yêu cầu đầu ra | Có | File, route và kết quả build |
| Có ràng buộc phạm vi | Có | Không tạo lại class, chỉ sửa file liên quan |
| Kết quả được kiểm tra | Có | Build, lint, API và Git diff |
| Kết quả được chỉnh sửa | Có | Điều chỉnh theo source/role thực tế |
| Có minh chứng | Có | Ba commit GitHub cụ thể |
| Có ghi nhận prompt chưa tốt | Có | Prompt kiểm tra `.git` |

## 11. Cam kết

Tôi cam kết các prompt quan trọng đã được ghi lại trung thực, kết quả AI đã được kiểm tra
và tôi có khả năng giải thích các phần được áp dụng vào project.

| Sinh viên | MSSV | Ngày xác nhận |
| --- | --- | --- |
| Trần Văn Đức | DE191098 | 15/07/2026 |
