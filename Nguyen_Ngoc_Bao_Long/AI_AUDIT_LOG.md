# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | SU26 |
| Tên bài tập / Project | Real-time Bidding System |
| Tên sinh viên / Nhóm | Nguyen Ngoc Bao Long – Nhóm 3 |
| MSSV / Danh sách MSSV | DE190344 |
| Giảng viên hướng dẫn | QuangLTN3 |
| Ngày bắt đầu | 11/05/2026 |
| Ngày hoàn thành | Đang thực hiện |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

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

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.

### Mô tả mục tiêu sử dụng AI

```text
Em dùng AI chủ yếu cho module Bidding (phần em phụ trách trong nhóm 3):
- Hỏi ChatGPT các khái niệm như anti-sniper, race condition khi nhiều người bid cùng lúc.
- Dùng Cursor khi code Spring (service, WebSocket STOMP) và viết unit test.
- Cuối kỳ dùng Cursor hỗ trợ tổng hợp CHANGELOG từ code và git history.

Em không copy nguyên code AI mà chạy test và chỉnh lại cho khớp schema DB nhóm (bảng Auctions).
```

---

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 18/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích sử dụng | Tìm hiểu business rule anti-sniper cho đấu giá online |
| Phần việc liên quan | Requirement |
| Mức độ sử dụng | Hỗ trợ ý tưởng |

#### 4.1. Prompt đã sử dụng

```text
Mình đang làm project SWP391 về hệ thống đấu giá realtime. Nhóm mình yêu cầu nếu có người bid sát giờ kết thúc thì phải kéo dài thêm thời gian (anti sniper). Bạn giải thích giúp mình anti-sniper hoạt động thế nào và thường set bao nhiêu giây là hợp lý? Mình dùng Java Spring Boot.
```

#### 4.2. Kết quả AI gợi ý

```text
AI giải thích anti-sniper là cơ chế gia hạn phiên đấu giá khi có bid hợp lệ gần thời điểm kết thúc, tránh người chơi "snipe" giá ở giây cuối. Gợi ý thường gặp: gia hạn 5–30 giây mỗi lần bid, hoặc reset countdown về X giây nếu bid trong window cuối.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Em hiểu được logic anti-sniper và quyết định mỗi bid hợp lệ sẽ cộng thêm 10 giây vào endTime (không reset full countdown như một số site lớn).
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Nhóm em chốt bước nhảy giá tối thiểu 1 triệu và gia hạn cố định +10s mỗi bid (không chỉ bid trong window cuối) cho dễ implement và test. Em tự code hằng số ANTI_SNIPER_EXTENSION_SECONDS = 10 trong BiddingService.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/f3d2b89 |
| File liên quan | `BiddingService.java` |
| Screenshot |  |
| Kết quả chạy/test | Test `successfulBid_extendsEndTimeBy10Seconds` |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Hỏi AI giúp em nắm nhanh khái niệm, nhưng em vẫn phải tự chọn rule phù hợp với đề nhóm rồi mới code.
```

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 22/05/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Cấu hình WebSocket STOMP để broadcast bid realtime |
| Phần việc liên quan | Backend |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
@BiddingController.java em cần config WebSocket STOMP cho Spring 6, endpoint /ws-bidding, client subscribe topic /topic/bids để nhận bid mới. Giúp em file WebSocketConfig và ví dụ convertAndSend trong controller khi bid thành công. Project em chưa dùng Spring Boot full chỉ dùng spring-websocket trong module riêng.
```

#### 4.2. Kết quả AI gợi ý

```text
AI sinh class WebSocketConfig implements WebSocketMessageBrokerConfigurer: enableSimpleBroker("/topic/bids"), setApplicationDestinationPrefixes("/app"), registerStompEndpoint("/ws-bidding"). Trong controller dùng SimpMessagingTemplate.convertAndSend("/topic/bids", response).
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Em dùng lại cấu trúc WebSocketConfig và cách inject SimpMessagingTemplate vào BiddingController. Topic name đặt constant BID_TOPIC trong config.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
AI ban đầu gợi ý allowedOrigins("*") nhưng em đổi sang setAllowedOriginPatterns("*") cho đúng API mới. Thêm @MessageMapping("/bid") cho bid qua WebSocket ngoài REST POST. Sau merge nhóm, frontend vẫn poll HTTP nên em ghi chú trong audit là backend đã có broadcast nhưng UI chưa subscribe hết.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/f3d2b89 |
| File liên quan | `WebSocketConfig.java`, `BiddingController.java` |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Config WebSocket khá nhiều annotation, AI giúp em đỡ nhầm broker vs endpoint. Em vẫn đọc doc Spring để hiểu flow STOMP.
```

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 22/05/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Viết BiddingService xử lý placeBid và tránh race condition |
| Phần việc liên quan | Backend |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Viết giúp mình class BiddingService Java:
- placeBid nhận auctionId, userId, bidAmount
- check auction ACTIVE và chưa hết giờ
- bid phải >= currentHighestBid + 1_000_000
- lưu Bid, update winner và currentHighestBid
- mỗi bid hợp lệ endTime += 10 giây
- nhiều user bid cùng lúc thì không được double accept

Dùng interface repository có sẵn, không cần JPA impl trong file này.
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý dùng synchronized trên method placeBid hoặc ReentrantLock, validate từng bước, trả BidResponse success/fail. Có skeleton createDefaultAuctionSession, canJoinRoom check deposit trước start 30 phút.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Em dùng khung method placeBid, BidResponse.fail với message tiếng Việt, và logic cộng 10 giây anti-sniper. Dùng ReentrantLock(true) fair lock như AI gợi ý thay vì synchronized đơn giản.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Em sửa message lỗi cho đúng yêu cầu nhóm ("Bạn cần đặt giá cao hơn"). Thêm findByIdForUpdate trong repository interface để sau này merge JPA dùng pessimistic lock. Tự viết toDto và lockEndedAuctions. Test tay thấy synchronized của AI demo chưa đủ rõ race nên em giữ ReentrantLock + viết test concurrent sau.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/f3d2b89 |
| File liên quan | `BiddingService.java` |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Đây là phần AI hỗ trợ nhiều nhất nhưng em phải tự hiểu lock và validation, không chạy được là em debug lại từng nhánh if.
```

---

### Lần sử dụng AI số 4

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 28/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích sử dụng | Viết unit test concurrent bidding không cần database |
| Phần việc liên quan | Testing |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
Mình có BiddingService dùng ReentrantLock. Làm sao viết JUnit 5 test mô phỏng 2 thread cùng gọi placeBid gần như đồng thời? Mình muốn case 1: cùng mức giá thì thằng vào trước thắng. Case 2: giá cao hơn vào sau vẫn thắng nếu hợp lệ. Không muốn dùng SQL Server trong test, có thể mock repository in-memory không?
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý ExecutorService 2 thread + CountDownLatch, sleep nhỏ để điều khiển thứ tự, implement repository in-memory lưu 1 auction. Dùng AtomicInteger đếm success/fail. Assert chỉ 1 bid được lưu khi cùng giá.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Em copy pattern ExecutorService + CountDownLatch và class InMemoryAuctionSessionRepository / InMemoryBidRepository trong BiddingServiceTest.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Em viết thêm 4 test nữa (anti-sniper, validation bước nhảy, canJoinRoom). Đặt tên method dài kiểu sameBidAmount_firstRequestWins_secondRejected cho dễ đọc khi báo cáo. Chạy mvn test confirm 6/6 pass rồi mới commit.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/008e921 |
| File liên quan | `BiddingServiceTest.java` |
| Screenshot |  |
| Kết quả chạy/test | Maven Surefire: 6 tests, 0 failures |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Test concurrent em chưa học kỹ trên lớp, AI gợi ý hướng đi nhưng em phải tự chỉnh delay ms cho ổn định trên máy em.
```

---

### Lần sử dụng AI số 5

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 02/07/2026 |
| Công cụ AI | Cursor |
| Mục đích sử dụng | Điền CHANGELOG và rà soát AI audit log theo template môn học |
| Phần việc liên quan | Report |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
bây giờ tôi cần bạn giúp làm file change log cho bài. Nhóm em SWP391 nhóm 3, em phụ trách module bidding. Điền CHANGELOG theo template có sẵn, ghi đúng những gì đã làm, có link commit f3d2b89 và 008e921.
```

#### 4.2. Kết quả AI gợi ý

```text
AI tổng hợp từ README, git log và source BiddingService để điền 6 phase CHANGELOG: thông tin project, business rules, implementation, 6 unit test, phần AI hỗ trợ. Gợi ý Phase 06 còn In Progress.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Em dùng khung phase và bảng thay đổi chi tiết, link commit AI đưa (đã tự mở GitHub verify tồn tại).
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Em sẽ tự bổ sung tên GV, đồng bộ file AI_AUDIT_LOG và PROMPTS cho khớp. Không tick "class diagram" nếu em chưa có file diagram thật. Commit message sẽ dùng [DE190344] docs: ...
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | Chưa commit (dự kiến cùng PR docs) |
| File liên quan | `CHANGELOG.md`, `AI_AUDIT_LOG.md` |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác | Phiên Cursor 02/07/2026 |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Nên ghi changelog từng đợt hơn là dồn cuối kỳ. Lần này AI giúp em nhớ lại commit cũ nhanh hơn.
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | x |  |  | ChatGPT anti-sniper |
| Viết user story/use case | x |  |  |  | Tự làm với nhóm |
| Thiết kế database | x |  |  |  | Dùng schema chung nhóm |
| Thiết kế kiến trúc hệ thống |  | x |  |  | Cursor gợi ý package |
| Thiết kế giao diện | x |  |  |  | Không phụ trách FE |
| Code frontend | x |  |  |  |  |
| Code backend |  |  | x |  | BiddingService, WebSocket |
| Debug lỗi |  | x |  |  | Race condition, test flake |
| Viết test case |  | x |  |  | Concurrent test pattern |
| Kiểm thử sản phẩm |  | x |  |  | mvn test local |
| Tối ưu code |  | x |  |  | Lock, message tiếng Việt |
| Viết báo cáo |  | x |  |  | CHANGELOG |
| Làm slide thuyết trình | x |  |  |  | Chưa làm |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Gợi ý `synchronized` đơn giản cho placeBid, chưa rõ fair ordering | Đọc lại code AI, thấy chưa giải thích rõ 2 request cùng giá | Đổi sang `ReentrantLock(true)` và viết test concurrent |
| 2 | `allowedOrigins("*")` deprecated trong Spring WebSocket mới | IDE warning khi build | Đổi `setAllowedOriginPatterns("*")` |
| 3 | Test concurrent AI gợi ý không sleep → đôi khi flaky trên máy yếu | Chạy mvn test lặp lại thấy đôi khi fail | Thêm delayMs trong BidAttempt để kiểm soát thứ tự |

---

## 7. Kiểm chứng kết quả AI

### Nội dung kiểm chứng

```text
- Chạy mvn test trong Nguyen_Ngoc_Bao_Long/ (6/6 pass).
- Đối chiếu business rule với nhóm trên Discord/meeting.
- Merge vào dev rồi chạy backend :8096, thử bid trên auction room.
- Đọc lại Spring doc về WebSocket STOMP để confirm config.
- Không nộp code AI nếu chưa hiểu — em giải thích được placeBid và anti-sniper trước mentor nhóm.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

```text
Phần em tự làm: chọn rule +1M và +10s, message lỗi tiếng Việt, tích hợp module vào com.auction.bidding, viết đủ 6 test và chạy verify.
Phần AI hỗ trợ: giải thích khái niệm, skeleton code WebSocket/service/test.
Phần em cải tiến: ReentrantLock, in-memory repo test, chỉnh WebSocket config, audit log trung thực.
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Nguyen Ngoc Bao Long | DE190344 | Module Bidding, Leader | Có | `Nguyen_Ngoc_Bao_Long/`, commit f3d2b89, 008e921 |
| Le Phuoc Sang | DE190062 | Auth, KYC | Có / Không | `Le_Phuoc_Sang/` |
| Pham Manh Thang | DE190404 |  | Có / Không |  |
| Tran Van Duc | DE191098 |  | Có / Không |  |
| Hoang Xuan Anh Tuan | DE190463 | Wallet, Product | Có / Không | `Hoang_Xuan_Anh_Tuan/` |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
Hỗ trợ em hiểu nhanh anti-sniper, có skeleton Spring WebSocket và test concurrent — tiết kiệm thời gian tra cứu.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Không dùng synchronized đơn giản; không reset full countdown 30s như AI ví dụ vì nhóm chốt rule khác.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
JUnit test, chạy lại nhiều lần, review với nhóm trước khi merge dev.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Viết test concurrent và config WebSocket STOMP — em ít kinh nghiệm, phải đọc doc lâu.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Biết thiết kế module realtime, xử lý race condition, tách package để merge nhóm.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Phải ghi log đầy đủ, test trước khi nộp, và tự giải thích được — AI chỉ là trợ lý.
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
|---|---|
| Nguyen Ngoc Bao Long (DE190344) | 02/07/2026 |
