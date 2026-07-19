# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:

- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Software Project (SWP391) |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | SU26 |
| Tên bài tập / Project | Real-time Bidding System (Hệ thống đấu giá trực tuyến thời gian thực) |
| Tên sinh viên / Nhóm | Nhóm 3 – Nguyen Ngoc Bao Long (Leader) |
| MSSV / Danh sách MSSV | DE190344 (Long), DE190062 (Sang), DE190404 (Thang), DE191098 (Duc), DE190463 (Tuan) |
| Giảng viên hướng dẫn | QuangLTN3 |
| Repository URL | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03 |
| Ngày bắt đầu | 11/05/2026 |
| Ngày hoàn thành | Đang thực hiện |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 11/05/2026 | Khởi tạo project, cấu trúc thư mục cá nhân | Completed |
| Phase 02 | 15–20/05/2026 | Phân tích yêu cầu module Bidding | Completed |
| Phase 03 | 20–22/05/2026 | Thiết kế entity, API, WebSocket | Completed |
| Phase 04 | 22–28/05/2026 | Implementation module Bidding | Completed |
| Phase 05 | 28/05/2026 | Unit test & debug logic đấu giá | Completed |
| Phase 06 | 07/2026 | Hoàn thiện báo cáo và demo | In Progress |

---

# [Phase 01] Khởi tạo project

## Ngày thực hiện

```text
11/05/2026
```

## Đã hoàn thành

- [x] Tạo repository
- [x] Tạo cấu trúc thư mục project
- [x] Tạo file README.md (ở root repo nhóm)
- [ ] Tạo thư mục `docs/`
- [x] Tạo file `AI_AUDIT_LOG.md`
- [x] Tạo file `PROMPTS.md`
- [x] Tạo file `REFLECTION.md`
- [x] Tạo file `CHANGELOG.md`
- [x] Khởi tạo source code ban đầu
- [x] Cài đặt thư viện/công cụ cần thiết
- [x] Cấu hình môi trường chạy project

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Clone repository nhóm từ template SWP391 AI Audit | Nguyen Ngoc Bao Long | Root repo | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03 |
| 2 | Tạo thư mục cá nhân `Nguyen_Ngoc_Bao_Long/` theo quy định nhóm | Nguyen Ngoc Bao Long | `Nguyen_Ngoc_Bao_Long/` | Commit `5edada3` |
| 3 | Khởi tạo các file audit bắt buộc (AI_AUDIT_LOG, PROMPTS, REFLECTION, CHANGELOG) | Nguyen Ngoc Bao Long | `Nguyen_Ngoc_Bao_Long/*.md` | Commit `5edada3` |
| 4 | Cập nhật thông tin dự án và danh sách thành viên nhóm trên README | Nguyen Ngoc Bao Long | `README.md` | Commit `5edada3` |

## AI có hỗ trợ không?

- [ ] Có
- [x] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Không sử dụng AI trong giai đoạn khởi tạo project.
```

## Commit/Screenshot minh chứng

```text
[DE190344] docs: cap nhat thong tin du an va thanh vien
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/5edada3
```

## Ghi chú

```text
Nhóm 3 gồm 5 thành viên. Long (DE190344) đảm nhiệm vai trò Leader và phụ trách module Bidding.
```

---

# [Phase 02] Phân tích yêu cầu

## Ngày thực hiện

```text
15/05/2026 – 20/05/2026
```

## Đã hoàn thành

- [x] Xác định problem statement
- [x] Xác định user roles
- [ ] Viết user stories
- [ ] Viết use cases
- [x] Xác định functional requirements
- [x] Xác định non-functional requirements
- [x] Xác định business rules
- [x] Xác định acceptance criteria
- [x] Review yêu cầu với giảng viên/nhóm
- [ ] Chỉnh sửa yêu cầu sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Xác định bài toán: đấu giá thời gian thực với cập nhật giá qua WebSocket | Nguyen Ngoc Bao Long | Module Bidding | Thảo luận nhóm |
| 2 | Xác định vai trò: Buyer (đặt giá), Seller (tạo phiên), Admin (quản lý) | Nguyen Ngoc Bao Long | Toàn hệ thống | README nhóm |
| 3 | Business rule: bước nhảy giá tối thiểu 1.000.000 VND | Nguyen Ngoc Bao Long | `BiddingService` | `MIN_BID_INCREMENT = 1_000_000L` |
| 4 | Business rule: anti-sniper – mỗi bid hợp lệ kéo dài phiên thêm 10 giây | Nguyen Ngoc Bao Long | `BiddingService` | `ANTI_SNIPER_EXTENSION_SECONDS = 10L` |
| 5 | Business rule: điều kiện vào phòng – xác nhận cọc trước giờ bắt đầu 30 phút | Nguyen Ngoc Bao Long | `BiddingService.canJoinRoom()` | `DEPOSIT_DEADLINE_BEFORE_START_MINUTES = 30L` |
| 6 | Non-functional: xử lý đồng thời nhiều request đặt giá (race condition) | Nguyen Ngoc Bao Long | `BiddingService` | `ReentrantLock` + `findByIdForUpdate` |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Cursor hỗ trợ gợi ý các pattern xử lý race condition (ReentrantLock, pessimistic locking)
và cơ chế anti-sniper phổ biến trong hệ thống đấu giá. Sinh viên tự đánh giá, chọn và triển khai.
```

## Commit/Screenshot minh chứng

```text
Yêu cầu được triển khai trong commit Module_5_BiddingSystem:
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/f3d2b89
```

## Ghi chú

```text
Module Bidding là trách nhiệm chính của DE190344 trong nhóm 3.
```

---

# [Phase 03] Thiết kế hệ thống

## Ngày thực hiện

```text
20/05/2026 – 22/05/2026
```

## Đã hoàn thành

- [x] Thiết kế kiến trúc tổng quan
- [x] Thiết kế database/ERD
- [x] Thiết kế API
- [ ] Thiết kế giao diện/wireframe
- [x] Thiết kế flow xử lý
- [x] Thiết kế class diagram
- [ ] Thiết kế sequence diagram
- [ ] Thiết kế security/authorization flow
- [x] Review thiết kế
- [ ] Chỉnh sửa thiết kế sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Thiết kế entity `AuctionSession` map bảng `dbo.Auctions` | Nguyen Ngoc Bao Long | `entity/AuctionSession.java` | Commit `f3d2b89` |
| 2 | Thiết kế entity `Bid` lưu lịch sử đặt giá | Nguyen Ngoc Bao Long | `entity/Bid.java` | Commit `f3d2b89` |
| 3 | Thiết kế enum `AuctionStatus` (UPCOMING, ACTIVE, ENDED) | Nguyen Ngoc Bao Long | `entity/AuctionStatus.java` | Commit `f3d2b89` |
| 4 | Thiết kế REST API: `GET /api/bidding/rooms`, `POST /api/bidding/bid` | Nguyen Ngoc Bao Long | `controller/BiddingController.java` | Commit `f3d2b89` |
| 5 | Thiết kế WebSocket STOMP: endpoint `/ws-bidding`, topic `/topic/bids` | Nguyen Ngoc Bao Long | `config/WebSocketConfig.java` | Commit `f3d2b89` |
| 6 | Thiết kế DTO: `BidRequest`, `BidResponse`, `AuctionSessionDto` | Nguyen Ngoc Bao Long | `dto/*.java` | Commit `f3d2b89` |
| 7 | Thiết kế repository interface: `AuctionSessionRepository`, `BidRepository` | Nguyen Ngoc Bao Long | `repository/*.java` | Commit `f3d2b89` |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Cursor hỗ trợ gợi ý cấu trúc package theo Spring convention (controller/service/repository/entity/dto/config)
và cấu hình WebSocket STOMP cơ bản. Sinh viên tự điều chỉnh endpoint, topic và mapping entity theo schema DB nhóm.
```

## Commit/Screenshot minh chứng

```text
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/f3d2b89
```

## Ghi chú

```text
Module được tách riêng trong thư mục Nguyen_Ngoc_Bao_Long/ với pom.xml độc lập để phát triển và test đơn lẻ.
Sau đó tích hợp vào main project tại package com.auction.bidding.
```

---

# [Phase 04] Implementation

## Ngày thực hiện

```text
22/05/2026 – 28/05/2026
```

## Đã hoàn thành

- [x] Tạo project structure
- [x] Cài đặt database connection
- [x] Xây dựng backend
- [ ] Xây dựng frontend
- [ ] Xây dựng authentication/authorization
- [x] Xử lý CRUD
- [x] Xử lý validation
- [x] Tích hợp API
- [ ] Xử lý upload/download file
- [x] Xử lý lỗi
- [ ] Tối ưu giao diện
- [x] Cập nhật README hướng dẫn chạy

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Triển khai `BiddingService.placeBid()` – validate phiên ACTIVE, kiểm tra bước nhảy giá, lưu bid, cập nhật winner | Nguyen Ngoc Bao Long | `service/BiddingService.java` | Commit `f3d2b89` |
| 2 | Triển khai anti-sniper: mỗi bid hợp lệ cộng thêm 10 giây vào `endTime` | Nguyen Ngoc Bao Long | `service/BiddingService.java` | Commit `f3d2b89` |
| 3 | Triển khai `ReentrantLock` để đồng bộ hóa request đặt giá đồng thời | Nguyen Ngoc Bao Long | `service/BiddingService.java` | Commit `f3d2b89` |
| 4 | Triển khai `canJoinRoom()` – kiểm tra deposit confirmed trước deadline 30 phút | Nguyen Ngoc Bao Long | `service/BiddingService.java` | Commit `f3d2b89` |
| 5 | Triển khai `BiddingController` – REST + WebSocket broadcast bid thành công | Nguyen Ngoc Bao Long | `controller/BiddingController.java` | Commit `f3d2b89` |
| 6 | Cấu hình WebSocket STOMP broker và endpoint | Nguyen Ngoc Bao Long | `config/WebSocketConfig.java` | Commit `f3d2b89` |
| 7 | Tạo `pom.xml` với Spring Web, WebSocket, JPA API, JUnit 5, Mockito | Nguyen Ngoc Bao Long | `pom.xml` | Commit `f3d2b89` |
| 8 | Tích hợp module vào main project nhóm tại `com.auction.bidding` | Nguyen Ngoc Bao Long | `src/main/java/com/auction/bidding/` | Commit `d7aceb3`, `e7b61d3` |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Cursor hỗ trợ sinh code khung cho service, controller, entity và gợi ý cấu trúc test.
Sinh viên tự review, chỉnh sửa logic nghiệp vụ (bước nhảy giá, anti-sniper, lock) và tích hợp vào project nhóm.
```

## Commit/Screenshot minh chứng

```text
Module độc lập:
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/f3d2b89

Tích hợp vào main project:
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/d7aceb3
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/e7b61d3
```

## Ghi chú

```text
Frontend auction UI do các thành viên khác phụ trách. Long tập trung backend logic bidding và WebSocket realtime.
```

---

# [Phase 05] Testing & Debug

## Ngày thực hiện

```text
28/05/2026
```

## Đã hoàn thành

- [x] Viết test case
- [x] Chạy test chức năng chính
- [x] Kiểm tra output
- [x] Kiểm tra validation
- [ ] Kiểm tra lỗi giao diện
- [ ] Kiểm tra lỗi database
- [ ] Kiểm tra phân quyền
- [ ] Kiểm tra bảo mật cơ bản
- [x] Fix bug
- [x] Chạy lại sau khi fix bug
- [x] Ghi nhận kết quả test

## Danh sách lỗi đã xử lý

| STT | Lỗi phát hiện | Nguyên nhân | Cách xử lý | Trạng thái |
|---:|---|---|---|---|
| 1 | Hai user cùng đặt một mức giá đều được chấp nhận | Thiếu cơ chế đồng bộ hóa khi xử lý concurrent bid | Thêm `ReentrantLock` trong `placeBid()` và test concurrent với `ExecutorService` | Fixed |
| 2 | Bid thấp hơn mức tối thiểu vẫn pass | Thiếu validation bước nhảy giá | Thêm kiểm tra `bidAmount >= currentHighestBid + MIN_BID_INCREMENT` | Fixed |
| 3 | Phiên đấu giá kết thúc ngay khi có bid cuối | Chưa có cơ chế anti-sniper | Mỗi bid hợp lệ cộng thêm 10 giây vào `endTime` | Fixed |
| 4 | User chưa xác nhận cọc vẫn vào phòng | Thiếu kiểm tra deposit | Thêm `canJoinRoom()` với deadline 30 phút trước start | Fixed |

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Viết 6 unit test cho `BiddingService` | Nguyen Ngoc Bao Long | `BiddingServiceTest.java` | Commit `008e921` |
| 2 | Test concurrent: cùng mức giá – request trước thắng, request sau reject | Nguyen Ngoc Bao Long | `sameBidAmount_firstRequestWins_secondRejected` | Commit `008e921` |
| 3 | Test concurrent: bid cao hơn đến trước, bid thấp hơn bị reject | Nguyen Ngoc Bao Long | `higherBidFirst_lowerBidRejected` | Commit `008e921` |
| 4 | Test anti-sniper: bid hợp lệ kéo dài endTime thêm 10 giây | Nguyen Ngoc Bao Long | `successfulBid_extendsEndTimeBy10Seconds` | Commit `008e921` |
| 5 | Test validation bước nhảy giá và message lỗi | Nguyen Ngoc Bao Long | `bidBelowMinimumIncrement_isRejectedWithCorrectMessage` | Commit `008e921` |
| 6 | Test điều kiện vào phòng (deposit + deadline) | Nguyen Ngoc Bao Long | `canJoinRoom_requiresConfirmedDepositBeforeDeadline` | Commit `008e921` |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Cursor hỗ trợ gợi ý test case concurrent bidding với CountDownLatch và ExecutorService,
cùng in-memory repository để test độc lập không cần database. Sinh viên tự viết assertion và chạy verify.
```

## Commit/Screenshot minh chứng

```text
#DE190344 Update logic test
https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/008e921

Kết quả: 6/6 tests passed (BiddingServiceTest)
```

## Ghi chú

```text
Test chạy độc lập trong module Nguyen_Ngoc_Bao_Long/ bằng Maven Surefire.
Sử dụng in-memory repository, không phụ thuộc SQL Server.
```

---

# [Phase 06] Hoàn thiện báo cáo và demo

## Ngày thực hiện

```text
07/2026 (đang thực hiện)
```

## Đã hoàn thành

- [ ] Hoàn thiện source code
- [ ] Hoàn thiện README.md
- [ ] Hoàn thiện report
- [ ] Hoàn thiện slide
- [ ] Hoàn thiện video demo
- [ ] Kiểm tra lại `AI_AUDIT_LOG.md`
- [ ] Kiểm tra lại `PROMPTS.md`
- [ ] Hoàn thiện `REFLECTION.md`
- [x] Kiểm tra lại `CHANGELOG.md`
- [ ] Đóng gói bài nộp

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Điền nội dung CHANGELOG theo các phase đã hoàn thành | Nguyen Ngoc Bao Long | `CHANGELOG.md` | Phiên làm việc 02/07/2026 |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Cursor hỗ trợ tổng hợp thông tin từ source code, git history và README để điền CHANGELOG.
Sinh viên review và bổ sung thông tin còn thiếu (giảng viên, ngày hoàn thành, minh chứng demo).
```

## Commit/Screenshot minh chứng

```text
Chưa commit – sẽ cập nhật sau khi hoàn thiện toàn bộ Phase 06.
```

## Ghi chú

```text
Cần hoàn thiện AI_AUDIT_LOG, PROMPTS, REFLECTION trước khi nộp bài.
```

---

# 4. Tổng kết thay đổi cuối project

## 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---:|---|---|---|---|
| 1 | Đặt giá (place bid) với validation bước nhảy tối thiểu | Completed | `BiddingService.placeBid()`, test `bidBelowMinimumIncrement_*` | Bước nhảy 1.000.000 VND |
| 2 | Anti-sniper – kéo dài phiên 10 giây mỗi bid hợp lệ | Completed | `ANTI_SNIPER_EXTENSION_SECONDS`, test `successfulBid_extendsEndTimeBy10Seconds` |  |
| 3 | Xử lý đồng thời (race condition) khi nhiều user bid cùng lúc | Completed | `ReentrantLock`, test concurrent | Request vào trước thắng |
| 4 | Điều kiện vào phòng đấu giá (deposit + deadline) | Completed | `canJoinRoom()`, test `canJoinRoom_*` | Cọc trước 30 phút |
| 5 | Realtime broadcast bid qua WebSocket STOMP | Completed | `BiddingController`, `WebSocketConfig` | Topic `/topic/bids` |
| 6 | REST API lấy danh sách phòng đấu giá | Completed | `GET /api/bidding/rooms` |  |
| 7 | Frontend auction UI | Partial | Commit `e51280e` | Do thành viên khác phụ trách chính |
| 8 | Authentication / Authorization cho bidding | Not Completed |  | Chưa tích hợp trong module cá nhân |

---

## 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Phân quyền khi đặt giá (chỉ user đã login/deposit) | Tập trung logic core trước | Tích hợp Spring Security + wallet/deposit check |
| 2 | Sequence diagram và tài liệu thiết kế chi tiết | Ưu tiên implementation | Bổ sung trong báo cáo cuối kỳ |
| 3 | Integration test với SQL Server thật | Đã dùng in-memory test | Thêm test @SpringBootTest với DB |

---

## 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Ít | Gợi ý business rule anti-sniper, concurrent handling |
| Design | Có | Trung bình | Gợi ý cấu trúc package, WebSocket config |
| Database | Không | Ít | Entity mapping theo schema nhóm có sẵn |
| Coding | Có | Trung bình | Sinh code khung, sinh viên tự chỉnh logic |
| Debug | Có | Trung bình | Gợi ý test concurrent, fix race condition |
| Testing | Có | Nhiều | Gợi ý test case và in-memory repository |
| Report | Có | Ít | Hỗ trợ điền CHANGELOG (phiên 02/07/2026) |
| Presentation | Không | Ít |  |

---

## 4.4. Bài học rút ra

```text
- Hiểu rõ hơn về xử lý race condition trong hệ thống realtime (lock, pessimistic locking).
- Nắm được cơ chế anti-sniper phổ biến trong đấu giá trực tuyến.
- Biết cách tách module để phát triển và test độc lập trước khi merge vào project nhóm.
- Cần ghi log AI và changelog song song với code, không để dồn cuối kỳ.
```

---

## 4.5. Hướng cải thiện tiếp theo

```text
- Tích hợp Spring Security cho API bidding.
- Thêm integration test với database thật.
- Bổ sung monitoring/logging cho WebSocket connection.
- Hoàn thiện AI_AUDIT_LOG, PROMPTS, REFLECTION đồng bộ với CHANGELOG.
```

---

# 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nguyen Ngoc Bao Long (DE190344) | 02/07/2026 |
