# AI Audit Log

## 1. Thông tin chung

| Thông tin             | Nội dung |
| --------------------- | -------- |
| Môn học               |          |
| Mã môn học            |          |
| Lớp                   |          |
| Học kỳ                |          |
| Tên bài tập / Project |          |
| Tên sinh viên / Nhóm  |          |
| MSSV / Danh sách MSSV |          |
| Giảng viên hướng dẫn  |          |
| Ngày bắt đầu          |          |
| Ngày hoàn thành       |          |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [ ] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

Ví dụ:

- Phân tích yêu cầu bài toán
- Gợi ý ý tưởng giải pháp
- Thiết kế database
- Thiết kế giao diện
- Viết code mẫu
- Debug lỗi
- Tối ưu code
- Viết test case
- Kiểm tra bảo mật
- Viết báo cáo
- Chuẩn bị slide thuyết trình
- Tìm hiểu công nghệ mới

### Mô tả mục tiêu sử dụng AI

````text
Viết tại đây...

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.
> Sinh viên/nhóm có thể nhân bản mẫu “Lần sử dụng AI” nhiều lần tùy theo số lần sử dụng AI thực tế.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Claude (Claude Code) |
| Mục đích sử dụng | Tạo prompt chuẩn để agent AI chuyển đổi toàn bộ UI từ Stitch (HTML + Tailwind CDN) sang project Next.js hoàn chỉnh |
| Phần việc liên quan | Frontend |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
hãy đóng vai với vai trò là senior về frontend về react và củ thể hơn là nextjs tôi muốn 1 câu prompt tôi sẽ gắn lên để agent của tôi thực hiện việc chuyển từ  Stitch dạng html sang code nextjs
````

#### 4.2. Kết quả AI gợi ý

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
Tôi có một bộ UI export từ Stitch (stitch.withgoogle.com). Cấu trúc:
thư mục UI/ chứa nhiều folder, mỗi folder là một màn hình gồm:
- code.html  (HTML + Tailwind CDN do Stitch sinh ra)
- screen.png (ảnh render của màn đó, dùng để đối chiếu layout/màu/spacing)

NHIỆM VỤ: Viết lại TOÀN BỘ bộ UI này thành một project Next.js hoàn chỉnh,
chạy được, giữ đúng thiết kế gốc.

STACK BẮT BUỘC:
- Next.js (App Router)
- TypeScript
- Tailwind CSS (cài thật trong project, KHÔNG dùng CDN)

QUY TRÌNH:
1. Đọc tất cả file code.html và xem screen.png tương ứng để nắm layout, màu,
   font, spacing của từng màn.
2. Trích cấu hình chung vào tailwind.config.ts: bảng màu, font (Stitch hay dùng
   Material Symbols, Spline Sans / Manrope), border-radius, shadow...
3. Tách các phần lặp lại thành component tái sử dụng trong src/components/
   (sidebar, header/topbar, card, badge, button, table, modal...).
4. Mỗi folder Stitch map sang một route trong App Router. Đề xuất mapping:
   - admin_control_center_*           -> /admin/(categories|reports|auction-history|revenue|broadcasts)
   - collector_dashboard_with_live_chat -> /dashboard
   - collector_wallet_dashboard_*     -> /wallet
   - dynamic_authenticated_storefront_carousel_layout -> /storefront
   - kyc_verification_identity_security_final -> /kyc
   - live_auction_detail_bidding_panel -> /auctions/[id]
   Dùng route group (admin) và (collector) để tách layout.
5. Tạo layout chung (RootLayout + nested layout cho admin/collector) thay vì lặp
   sidebar/header ở từng trang.
6. Chuyển toàn bộ inline style / class Tailwind sang JSX hợp lệ (class -> className,
   for -> htmlFor, đóng thẻ tự đóng, v.v.). Ảnh dùng next/image hoặc thẻ img tùy phù hợp.
7. Component nào có tương tác (bidding panel, live chat, carousel, dropdown) thì
   thêm "use client" và state cơ bản bằng useState. Chưa cần backend thật — dùng
   mock data đặt trong src/lib/mock-data.ts.

YÊU CẦU CHẤT LƯỢNG:
- Giao diện phải khớp với screen.png (pixel càng gần càng tốt).
- Code sạch, đặt tên rõ ràng, không trùng lặp.
- Responsive nếu thiết kế gốc có dấu hiệu responsive.
- Sau khi xong, chạy được với: npm install && npm run dev

OUTPUT: Toàn bộ source code project Next.js, kèm hướng dẫn chạy ngắn gọn.
Bắt đầu bằng việc liệt kê các file đã đọc và kế hoạch component trước khi code.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Mô tả rõ phần nào được sử dụng lại từ gợi ý của AI.

```text
Sử dụng toàn bộ prompt do AI sinh ra để làm system prompt cho agent Claude Code.
Prompt đã được dùng trực tiếp để agent đọc các file code.html từ Stitch và tự động:
- Phân tích cấu trúc folder UI/ và mapping sang App Router Next.js
- Tách layout chung (admin/collector/staff) thành route group
- Chuyển Tailwind CDN sang cài đặt thật trong project
- Tách component tái sử dụng: Sidebar, Shell, BiddingPanel, LiveChat, Carousel
- Thêm "use client" và useState cho các component có tương tác
- Sinh mock data trong src/lib/mock-data.ts
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với gợi ý ban đầu của AI.

```text
- Kiểm tra lại toàn bộ output bằng cách chạy npm install && npm run dev để xác nhận project build thành công
- Bổ sung thêm route group (staff) ngoài (admin) và (collector) vì dự án có thêm vai trò Staff
- Thêm các trang staff chưa có trong prompt gốc: /staff/approvals, /staff/kyc-review, /staff/support
- Điều chỉnh một số className không hợp lệ trong JSX mà AI sinh ra
- Thêm route /auth, /auth/onboarding, /profile, /security, /messages, /won-items chưa được đề cập trong prompt
- Kiểm tra lại mapping màu sắc trong tailwind.config để khớp với screen.png
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung |
| ----------------- | -------- |
| Link commit       | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/96994d85d5770eb9afd6d0934211a4c3e8cfb013 |
| File liên quan    | src/frontend/ (toàn bộ project Next.js được khởi tạo) |
| Screenshot        |          |
| Kết quả chạy/test | Project Next.js chạy thành công với npm install && npm run dev |
| Link video demo   |          |
| Ghi chú khác      | Commit: `feat: initialize frontend project` ngày 08/06/2026 |

#### 4.6. Nhận xét cá nhân/nhóm

Sinh viên/nhóm học được gì sau lần sử dụng AI này?

```text
- Học được cách viết prompt rõ ràng, có cấu trúc (stack, quy trình, yêu cầu chất lượng, output) để AI sinh ra kết quả sát với mong muốn
- Nhận ra rằng AI có thể sinh code nhanh nhưng vẫn cần người lập trình kiểm tra, chỉnh sửa và bổ sung phần logic phát sinh từ yêu cầu thực tế (role Staff chưa có trong prompt)
- Hiểu rõ hơn về cấu trúc App Router của Next.js, đặc biệt là route group và nested layout
- Thấy được tầm quan trọng của việc "dùng AI như một công cụ hỗ trợ" thay vì phụ thuộc hoàn toàn — kết quả AI vẫn cần được kiểm chứng bằng cách chạy thực tế
```

---

### Lần sử dụng AI số 2

| Nội dung            | Thông tin                                                                 |
| ------------------- | ------------------------------------------------------------------------- |
| Ngày sử dụng        | 09/06/2026                                                                |
| Công cụ AI          | Claude                                                                    |
| Mục đích sử dụng    | Thiết kế và sinh code backend cho tính năng nhắn tin real-time giữa User/Seller và Staff |
| Phần việc liên quan | Backend                                                                   |
| Mức độ sử dụng      | Sinh chính nội dung                                                       |

#### 4.1. Prompt đã sử dụng

```text
Bạn là một Senior Backend Engineer chuyên về Spring Boot 3.x.
Dự án là hệ thống đấu giá SWP_Nhom3 sử dụng SQL Server, Spring Security, JWT, Spring Data JPA.
Dưới đây là schema database hiện có (dán nội dung file SQL vào đây).

Nhiệm vụ: implement hoàn chỉnh tính năng nhắn tin real-time giữa User/Seller và Staff gồm:
1. Thêm 2 bảng mới vào database: Conversations và Messages
2. Tạo đầy đủ các tầng: Entity, DTO (Request/Response), Repository, Service (interface + impl),
   WebSocket Config, WebSocket Interceptor dùng JWT, REST Controller, Exception Handler.
3. Phân quyền: User/Seller tạo conversation, Staff nhận và reply, Admin xem tất cả.
4. Real-time qua WebSocket STOMP over SockJS.
5. Không tạo lại các class đã có (UserRepository, JwtService, UserDetailsImpl).
6. Sau khi code xong chạy mvn clean install và báo kết quả.
```

#### 4.2. Kết quả AI gợi ý

```text
AI sinh ra toàn bộ các thành phần backend bao gồm:

1. SQL Script – Tạo 2 bảng:
   - Conversations (ConversationId, UserId, AssignedStaff, Subject, Status, CreatedAt, UpdatedAt)
   - Messages (MessageId, ConversationId, SenderId, Content, IsRead, SentAt)

2. Enum – ConversationStatus: OPEN, IN_PROGRESS, CLOSED

3. Entity – Conversation.java và Message.java với đầy đủ JPA annotation,
   @PrePersist, @PreUpdate, quan hệ @ManyToOne / @OneToMany

4. DTO:
   - CreateConversationRequest (subject, firstMessage)
   - SendMessageRequest (conversationId, content)
   - MessageResponse (messageId, conversationId, senderId, senderName, senderRole, content, isRead, sentAt)
   - ConversationResponse (conversationId, userId, userName, assignedStaffId, subject, status,
     lastMessage, unreadCount, createdAt, updatedAt)
   - ConversationDetailResponse (info + danh sách messages)

5. Repository:
   - ConversationRepository: query theo userId, staffId, unassigned
   - MessageRepository: countUnread, markAllAsRead, findTop by sentAt

6. Service:
   - ConversationService / ConversationServiceImpl: tạo conversation, giao staff,
     đóng conversation, lấy chi tiết, validate quyền truy cập
   - MessageService / MessageServiceImpl: gửi tin nhắn, lấy lịch sử, markAsRead,
     broadcast WebSocket qua SimpMessagingTemplate

7. WebSocket:
   - WebSocketConfig: cấu hình broker /topic /queue, endpoint /ws/chat với SockJS
   - WebSocketAuthInterceptor: validate JWT khi CONNECT, set Principal
   - ChatWebSocketController: xử lý /app/chat.sendMessage và /app/chat.markRead

8. REST Controllers:
   - ConversationController: 7 endpoints với @PreAuthorize phân quyền theo role
   - MessageController: 3 endpoints (gửi, lấy lịch sử, markRead)

9. Exception Handling: bổ sung vào GlobalExceptionHandler cho
   ResourceNotFoundException, AccessDeniedException, IllegalStateException
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
- Toàn bộ SQL script tạo bảng Conversations và Messages
- Cấu trúc thư mục và tên file đề xuất
- Entity classes Conversation.java và Message.java
- Tất cả DTO classes (Request và Response)
- ConversationRepository và MessageRepository với custom JPQL queries
- Logic nghiệp vụ trong ConversationServiceImpl và MessageServiceImpl
- Cấu hình WebSocketConfig và WebSocketAuthInterceptor
- ChatWebSocketController
- ConversationController và MessageController với annotation phân quyền
- Các exception handler bổ sung vào GlobalExceptionHandler
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
- Điều chỉnh tên package cho khớp với cấu trúc thư mục thực tế của dự án
- Sửa tên method getId() trong UserDetailsImpl cho đúng với implementation hiện có
- Bổ sung kiểm tra: Staff chỉ được reply conversation đã được giao cho chính mình
  (AI chỉ kiểm tra ở tầng service khi getDetail, nhóm bổ sung thêm ở sendMessage)
- Thêm Pageable vào getUnassignedConversations() để tránh load toàn bộ khi dữ liệu lớn
- Điều chỉnh CORS config trong WebSocketConfig cho khớp với domain frontend thực tế
- Viết thêm unit test cho ConversationServiceImpl và MessageServiceImpl
- Tích hợp thông báo đẩy (notification badge) vào Navbar khi có tin nhắn mới chưa đọc
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                                                    |
| ----------------- | ----------------------------------------------------------- |
| Link commit       | *(Dán link commit GitHub sau khi push)*                     |
| File liên quan    | `Conversations` table, `Messages` table, `ConversationController.java`, `MessageController.java`, `WebSocketConfig.java`, `ConversationServiceImpl.java`, `MessageServiceImpl.java` |
| Screenshot        | *(Chụp màn hình Postman test REST API và STOMP WebSocket)*  |
| Kết quả chạy/test | Build thành công `mvn clean install` — 0 lỗi compile; Test Postman: tạo conversation, gửi tin nhắn, nhận real-time qua WebSocket |
| Link video demo   | *(Quay màn hình demo chat real-time giữa 2 tab User và Staff)* |
| Ghi chú khác      | Dùng Postman STOMP WebSocket client để test kết nối `/ws/chat` với JWT header |

#### 4.6. Nhận xét cá nhân/nhóm

```text
AI hỗ trợ rất hiệu quả trong việc thiết kế kiến trúc và sinh code boilerplate cho tính năng
nhắn tin real-time — phần mà nhóm chưa có kinh nghiệm với WebSocket STOMP trước đó.

Điểm tích cực:
- Code sinh ra có cấu trúc rõ ràng, đúng layered architecture (Controller → Service → Repository)
- Xử lý đúng các trường hợp nghiệp vụ: phân quyền, validate truy cập, conversation CLOSED
- Gợi ý WebSocket flow cụ thể giúp nhóm hiểu và test nhanh hơn

Điểm cần lưu ý:
- AI không biết chính xác tên method trong UserDetailsImpl của dự án nên cần chỉnh tay
- Một số query JPQL cần kiểm tra lại với SQL Server vì AI có thể sinh ra syntax của MySQL
- Phần phân trang (Pageable) và notification badge AI không tự động thêm, nhóm phải tự bổ sung

Kết luận: AI tiết kiệm khoảng 60–70% thời gian code phần này. Nhóm vẫn cần đọc hiểu,
kiểm tra logic và tích hợp thủ công vào project thực tế.
```

---

### Lần sử dụng AI số 3

| Nội dung            | Thông tin                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------------------ |
| Ngày sử dụng        |                                                                                                        |
| Công cụ AI          | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác                               |
| Mục đích sử dụng    |                                                                                                        |
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng      | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung                                  |

#### 4.1. Prompt đã sử dụng

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
```

#### 4.2. Kết quả AI gợi ý

```text
Viết tại đây...
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Viết tại đây...
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung |
| ----------------- | -------- |
| Link commit       |          |
| File liên quan    |          |
| Screenshot        |          |
| Kết quả chạy/test |          |
| Link video demo   |          |
| Ghi chú khác      |          |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục                    | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
| --------------------------- | :-----------: | :----------: | :-------------: | :-----------: | ------- |
| Phân tích yêu cầu           |               |              |                 |               |         |
| Viết user story/use case    |               |              |                 |               |         |
| Thiết kế database           |               |              |                 |               |         |
| Thiết kế kiến trúc hệ thống |               |              |                 |               |         |
| Thiết kế giao diện          |               |              |                 |               |         |
| Code frontend               |               |              |                 |               |         |
| Code backend                |               |              |                 |               |         |
| Debug lỗi                   |               |              |                 |               |         |
| Viết test case              |               |              |                 |               |         |
| Kiểm thử sản phẩm           |               |              |                 |               |         |
| Tối ưu code                 |               |              |                 |               |         |
| Viết báo cáo                |               |              |                 |               |         |
| Làm slide thuyết trình      |               |              |                 |               |         |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
| --: | ----------------- | -------------- | ------------------- |
|   1 |                   |                |                     |
|   2 |                   |                |                     |
|   3 |                   |                |                     |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

Có thể bao gồm:

- Chạy thử chương trình
- Viết test case
- So sánh với yêu cầu đề bài
- Kiểm tra output
- Đối chiếu tài liệu môn học
- Hỏi lại giảng viên
- Review cùng thành viên nhóm
- Kiểm tra lỗi bảo mật
- Kiểm tra bằng dữ liệu mẫu
- So sánh trước và sau khi dùng AI

### Nội dung kiểm chứng

```text
Viết tại đây...
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

Mô tả phần sinh viên tự làm, phần AI hỗ trợ và phần đã tự cải tiến.

```text
Viết tại đây...
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
| ---------- | ---- | -------------- | -------------------- | ------------------- |
|            |      |                | Có / Không           |                     |
|            |      |                | Có / Không           |                     |
|            |      |                | Có / Không           |                     |
|            |      |                | Có / Không           |                     |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
Viết tại đây...
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Viết tại đây...
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Viết tại đây...
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Viết tại đây...
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Viết tại đây...
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Viết tại đây...
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
| ----------------------- | ------------- |
|                         |               |
