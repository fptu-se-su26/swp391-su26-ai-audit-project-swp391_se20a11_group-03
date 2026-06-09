# AI Audit Log

## 1. Thông tin chung

| Thông tin             | Nội dung                          |
| --------------------- | --------------------------------- |
| Môn học               | SWP391 - Software Project         |
| Mã môn học            | SWP391                            |
| Lớp                   | SE20A11                           |
| Học kỳ                | Summer 2026                       |
| Tên bài tập / Project | AI Audit Project - Bidding Module |
| Tên sinh viên / Nhóm  | Nguyễn Ngọc Bảo Long / Nhóm 03    |
| MSSV / Danh sách MSSV | DE190344                          |
| Giảng viên hướng dẫn  | QuangLTN3                         |
| Ngày bắt đầu          | 01/06/2026                        |
| Ngày hoàn thành       | 09/06/2026                        |

---

## 2. Công cụ AI đã sử dụng

- [x] ChatGPT
- [ ] Gemini
- [x] Claude
- [ ] GitHub Copilot
- [x] Cursor
- [ ] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

- Phân tích yêu cầu nghiệp vụ của hệ thống đấu giá
- Gợi ý cách viết test case cho các rule thời gian và điều kiện tham gia phòng
- Hỗ trợ debug các lỗi logic trong service và test
- Kiểm tra lại cách diễn đạt trong report và phần mô tả kỹ thuật
- Gợi ý cách tổ chức nội dung khi hoàn thiện tài liệu cuối kỳ

### Mô tả mục tiêu sử dụng AI

```text
Tôi sử dụng AI chủ yếu để hỗ trợ phân tích yêu cầu, viết test case và debug các phần liên quan đến logic thời gian trong module đấu giá. Khi gặp các case biên như điều kiện vào phòng trước 30 phút, tôi dùng AI để gợi ý cách đặt dữ liệu test rõ ràng hơn. Sau đó tôi tự kiểm tra lại code, sửa lại cho đúng với cấu trúc project và yêu cầu thực tế.
```

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1

| Nội dung            | Thông tin                                         |
| ------------------- | ------------------------------------------------- |
| Ngày sử dụng        | 05/06/2026                                        |
| Công cụ AI          | Cursor                                            |
| Mục đích sử dụng    | Gợi ý cách viết test cho rule thời gian vào phòng |
| Phần việc liên quan | Testing / Debug                                   |
| Mức độ sử dụng      | Hỗ trợ một phần                                   |

#### 4.1. Prompt đã sử dụng

```text
Mình đang viết test cho nghiệp vụ vào phòng của hệ thống đấu giá. Rule là deposit phải được xác nhận ít nhất 30 phút trước StartTime mới được vào phòng. Bạn giúp mình viết lại test case sao cho dùng StartTime cố định ở tương lai, rồi kiểm tra cả trường hợp StartTime - 31 phút là pass và StartTime - 29 phút là fail được không?
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý tạo StartTime ở tương lai để test dễ hiểu hơn, sau đó lấy các mốc depositTime dựa trên StartTime thay vì dùng thời điểm hiện tại trực tiếp. AI cũng đề xuất thêm case không confirm deposit để kiểm tra đủ điều kiện.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Tôi dùng ý tưởng tạo StartTime cố định và truyền depositTime theo mốc StartTime.minusMinutes(31), StartTime.minusMinutes(29) để kiểm tra rule 30 phút trước khi phiên bắt đầu.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tôi tự đổi lại tên biến cho dễ đọc hơn và bổ sung thêm một case deposit sau giờ bắt đầu để test rõ hơn tình huống fail.
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Link commit       | Chưa chốt                                                                 |
| File liên quan    | `src/test/java/com/example/biddingmodule/service/BiddingServiceTest.java` |
| Screenshot        | Có trong quá trình sửa test                                               |
| Kết quả chạy/test | Test case đã được cập nhật theo đúng rule                                 |
| Link video demo   | Không có                                                                  |
| Ghi chú khác      | Dùng để chuẩn hóa test theo rule nghiệp vụ                                |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Cách test bám theo StartTime giúp tôi hiểu rõ rule hơn và làm test ổn định hơn so với việc phụ thuộc hoàn toàn vào LocalDateTime.now().
```

---

### Lần sử dụng AI số 2

| Nội dung            | Thông tin                                       |
| ------------------- | ----------------------------------------------- |
| Ngày sử dụng        | 05/06/2026                                      |
| Công cụ AI          | ChatGPT                                         |
| Mục đích sử dụng    | Hỏi cách kiểm tra branch và repo trước khi push |
| Phần việc liên quan | Other                                           |
| Mức độ sử dụng      | Hỗ trợ ít                                       |

#### 4.1. Prompt đã sử dụng

```text
Mình đang làm trên branch của mình. Nếu mở folder khác để sửa code rồi push lên git thì có khác gì không? Làm sao để kiểm tra chắc chắn mình đang đứng đúng repo và đúng branch trước khi commit/push?
```

#### 4.2. Kết quả AI gợi ý

```text
AI giải thích rằng Git quản lý theo repository và branch, không phụ thuộc vào việc mở folder cha hay folder con. AI cũng gợi ý kiểm tra bằng git branch, git status và git remote -v trước khi commit.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Tôi dùng phần giải thích này để tránh nhầm repo khi làm việc với nhiều folder và chú ý kiểm tra branch trước khi đẩy code.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tôi tự kiểm tra lại môi trường làm việc của mình bằng Git thay vì chỉ tin vào mô tả ban đầu của AI.
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                           |
| ----------------- | ---------------------------------- |
| Link commit       | Chưa chốt                          |
| File liên quan    | Không áp dụng trực tiếp            |
| Screenshot        | Có trao đổi trong chat             |
| Kết quả chạy/test | Không áp dụng                      |
| Link video demo   | Không có                           |
| Ghi chú khác      | Phục vụ quy trình làm việc với Git |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Tôi hiểu rõ hơn việc mở folder nào không quan trọng bằng việc đang làm trên đúng branch và đúng remote hay không.
```

---

### Lần sử dụng AI số 3

| Nội dung            | Thông tin                                  |
| ------------------- | ------------------------------------------ |
| Ngày sử dụng        | 06/06/2026                                 |
| Công cụ AI          | Cursor                                     |
| Mục đích sử dụng    | Gợi ý cách viết test đồng thời cho bidding |
| Phần việc liên quan | Testing / Debug                            |
| Mức độ sử dụng      | Hỗ trợ nhiều                               |

#### 4.1. Prompt đã sử dụng

```text
Mình có 2 request bid cùng lúc vào cùng một phiên đấu giá. Bạn gợi ý giúp mình cách viết test để kiểm tra trường hợp request vào trước sẽ thắng, request vào sau bị reject, và trường hợp bid cao hơn đến trước thì vẫn được nhận nếu hợp lệ.
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý dùng CountDownLatch và ExecutorService để mô phỏng hai luồng request đến gần như đồng thời. AI cũng gợi ý kiểm tra số lượng bid được lưu, currentHighestBid và currentWinnerUserId sau khi chạy test.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Tôi dùng ý tưởng mô phỏng concurrency bằng CountDownLatch và ExecutorService để viết các test cho tình huống cùng mức giá, bid cao hơn đến trước và bid thấp hơn đến sau.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tôi tự chỉnh lại dữ liệu bid, delay giữa các request và các assert để bám sát logic thật của service trong project.
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Link commit       | Chưa chốt                                                                 |
| File liên quan    | `src/test/java/com/example/biddingmodule/service/BiddingServiceTest.java` |
| Screenshot        | Có trong quá trình chạy test                                              |
| Kết quả chạy/test | Test đồng thời chạy đúng theo kỳ vọng                                     |
| Link video demo   | Không có                                                                  |
| Ghi chú khác      | Dùng để kiểm tra rule xử lý bid cạnh tranh                                |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Qua lần này tôi hiểu hơn cách test các tình huống cạnh tranh đồng thời và thấy việc viết test mô phỏng gần thực tế rất quan trọng.
```

---

### Lần sử dụng AI số 4

| Nội dung            | Thông tin                                        |
| ------------------- | ------------------------------------------------ |
| Ngày sử dụng        | 07/06/2026                                       |
| Công cụ AI          | Cursor                                           |
| Mục đích sử dụng    | Kiểm tra logic anti-sniper kéo dài phiên đấu giá |
| Phần việc liên quan | Backend / Testing                                |
| Mức độ sử dụng      | Hỗ trợ một phần                                  |

#### 4.1. Prompt đã sử dụng

```text
Trong service đấu giá của mình có rule anti-sniper, tức là nếu bid hợp lệ gần cuối phiên thì end time sẽ được kéo dài thêm 10 giây. Bạn giúp mình nghĩ cách viết test cho rule này sao cho dễ hiểu và không bị phụ thuộc quá nhiều vào thời điểm hiện tại.
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý tạo StartTime và EndTime cụ thể, lưu lại originalEnd rồi so sánh endTime sau khi placeBid. Cách này giúp test dễ đọc hơn và kiểm tra được phần cộng thêm 10 giây.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Tôi dùng ý tưởng lưu originalEnd và so sánh với endTime sau khi bid thành công để xác nhận hệ thống có kéo dài phiên đấu giá đúng 10 giây hay không.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tôi tự điều chỉnh lại thời điểm bắt đầu phiên và mức giá bid để test case sát với logic thật trong service.
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Link commit       | Chưa chốt                                                                 |
| File liên quan    | `src/test/java/com/example/biddingmodule/service/BiddingServiceTest.java` |
| Screenshot        | Có trong quá trình sửa test                                               |
| Kết quả chạy/test | Case kéo dài end time hoạt động đúng                                      |
| Link video demo   | Không có                                                                  |
| Ghi chú khác      | Kiểm tra rule anti-sniper                                                 |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Test này giúp tôi hiểu rõ hơn cách hệ thống xử lý bid vào cuối phiên và cách xác nhận logic bằng assert trên thời gian.
```

---

### Lần sử dụng AI số 5

| Nội dung            | Thông tin                                                  |
| ------------------- | ---------------------------------------------------------- |
| Ngày sử dụng        | 08/06/2026                                                 |
| Công cụ AI          | Cursor                                                     |
| Mục đích sử dụng    | Gợi ý cách viết message khi bid thấp hơn minimum increment |
| Phần việc liên quan | Backend / Testing                                          |
| Mức độ sử dụng      | Hỗ trợ ít                                                  |

#### 4.1. Prompt đã sử dụng

```text
Mình muốn kiểm tra case bid thấp hơn mức tối thiểu thì hệ thống phải trả về đúng message. Bạn gợi ý giúp mình cách viết test cho dễ kiểm tra message và success flag.
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý tập trung kiểm tra cả isSuccess() và message trả về, thay vì chỉ kiểm tra một trong hai. AI cũng nhắc nên setup auction với currentHighestBid rõ ràng trước khi gọi placeBid.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Tôi dùng cách kiểm tra đồng thời success flag và message để chắc chắn hệ thống phản hồi đúng khi bid không đạt mức tối thiểu.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tôi tự điều chỉnh lại dữ liệu khởi tạo auction và bid amount để case này khớp với dữ liệu thật trong project.
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                                                                  |
| ----------------- | ------------------------------------------------------------------------- |
| Link commit       | Chưa chốt                                                                 |
| File liên quan    | `src/test/java/com/example/biddingmodule/service/BiddingServiceTest.java` |
| Screenshot        | Có trong quá trình kiểm tra test                                          |
| Kết quả chạy/test | Message được trả về đúng như mong đợi                                     |
| Link video demo   | Không có                                                                  |
| Ghi chú khác      | Kiểm tra validation của bid                                               |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Tôi rút ra rằng khi test validation thì nên kiểm tra cả trạng thái và nội dung phản hồi để tránh bỏ sót lỗi.
```

---

### Lần sử dụng AI số 6

| Nội dung            | Thông tin                                                  |
| ------------------- | ---------------------------------------------------------- |
| Ngày sử dụng        | 09/06/2026                                                 |
| Công cụ AI          | ChatGPT                                                    |
| Mục đích sử dụng    | Hỗ trợ viết nội dung báo cáo cuối cùng theo giọng tự nhiên |
| Phần việc liên quan | Report                                                     |
| Mức độ sử dụng      | Hỗ trợ một phần                                            |

#### 4.1. Prompt đã sử dụng

```text
Mình cần viết phần reflection và mô tả mức độ sử dụng AI trong báo cáo, nhưng muốn viết theo kiểu tự nhiên như sinh viên làm thật, không quá máy móc. Bạn gợi ý giúp mình cách diễn đạt ngắn gọn, đúng ngữ cảnh project đấu giá được không?
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý cách mô tả vai trò của AI trong việc phân tích yêu cầu, test case và debug, đồng thời nhấn mạnh việc tự kiểm tra lại code và không chép nguyên văn.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Tôi dùng khung diễn đạt đó để viết phần reflection và phần mô tả mục tiêu sử dụng AI trong báo cáo.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Tôi tự chỉnh lại câu chữ cho khớp với cách làm việc thực tế của mình và giảm bớt các câu quá chung chung.
```

#### 4.5. Minh chứng

| Loại minh chứng   | Nội dung                         |
| ----------------- | -------------------------------- |
| Link commit       | Chưa chốt                        |
| File liên quan    | `AI_AUDIT_LOG.md`                |
| Screenshot        | Có trong quá trình soạn thảo     |
| Kết quả chạy/test | Không áp dụng                    |
| Link video demo   | Không có                         |
| Ghi chú khác      | Dùng để hoàn thiện hồ sơ nộp bài |

#### 4.6. Nhận xét cá nhân/nhóm

```text
AI giúp tôi tiết kiệm thời gian khi viết phần mô tả, nhưng tôi vẫn cần tự biên tập lại để đúng với những gì mình đã làm.
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

| Hạng mục                    | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú                                            |
| --------------------------- | :-----------: | :----------: | :-------------: | :-----------: | -------------------------------------------------- |
| Phân tích yêu cầu           |               |      x       |                 |               | Dùng AI để làm rõ rule nghiệp vụ                   |
| Viết user story/use case    |       x       |              |                 |               | Tự làm là chính                                    |
| Thiết kế database           |       x       |              |                 |               | Không dùng AI cho phần này                         |
| Thiết kế kiến trúc hệ thống |       x       |              |                 |               | Chủ yếu theo project có sẵn                        |
| Thiết kế giao diện          |       x       |              |                 |               | Không dùng AI                                      |
| Code frontend               |       x       |              |                 |               | Không dùng AI                                      |
| Code backend                |               |      x       |                 |               | Có hỏi gợi ý khi cần                               |
| Debug lỗi                   |               |              |        x        |               | AI hỗ trợ khá nhiều ở phần test và logic thời gian |
| Viết test case              |               |              |        x        |               | Dùng AI để chỉnh điều kiện biên                    |
| Kiểm thử sản phẩm           |               |      x       |                 |               | Dùng AI để gợi ý tình huống test                   |
| Tối ưu code                 |       x       |              |                 |               | Không tập trung nhiều                              |
| Viết báo cáo                |               |      x       |                 |               | Dùng AI để hỗ trợ diễn đạt                         |
| Làm slide thuyết trình      |       x       |              |                 |               | Chưa dùng                                          |

---

## 6. Các lỗi hoặc hạn chế từ AI

| STT | Lỗi/hạn chế từ AI                                                                 | Cách phát hiện                       | Cách xử lý/cải tiến                                                |
| --: | --------------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------ |
|   1 | Một số gợi ý ban đầu dùng `LocalDateTime.now()` nhiều nên test có thể khó ổn định | Khi xem lại test theo rule nghiệp vụ | Tôi đổi sang dùng `StartTime` cố định rồi suy ra các mốc thời gian |
|   2 | AI đôi khi trả lời khá chung chung, chưa bám sát cấu trúc project                 | So sánh với code thật trong repo     | Tôi tự chỉnh lại cho đúng entity, service và repository đang có    |
|   3 | Một số câu diễn đạt trong report nghe hơi máy móc                                 | Đọc lại toàn bộ nội dung             | Tôi biên tập lại theo văn phong tự nhiên hơn                       |

---

## 7. Kiểm chứng kết quả AI

```text
Sau khi AI gợi ý, tôi kiểm tra lại bằng cách đối chiếu trực tiếp với rule nghiệp vụ của bài toán, đặc biệt là mốc 30 phút trước StartTime. Tôi chạy lại test case để xem trường hợp pass/fail có đúng không, đồng thời đọc lại code service và test để chắc chắn logic không bị phụ thuộc quá mức vào thời điểm hiện tại. Với phần nội dung report, tôi cũng tự đọc lại để chỉnh cho tự nhiên và đúng với những gì tôi thật sự đã làm trong project.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

```text
Tôi tự thực hiện phần lớn việc code và kiểm thử của project. AI chỉ hỗ trợ tôi ở các chỗ cần làm rõ yêu cầu, gợi ý test case, và chỉnh cách diễn đạt trong báo cáo. Sau khi có gợi ý, tôi đều tự kiểm tra lại trên code thật, sửa tên biến, bổ sung điều kiện test và tinh chỉnh nội dung để phù hợp với dự án của mình.
```

### 8.2. Đối với bài nhóm

| Thành viên           | MSSV     | Nhiệm vụ chính                              | Có sử dụng AI không? | Minh chứng đóng góp                       |
| -------------------- | -------- | ------------------------------------------- | -------------------- | ----------------------------------------- |
| Nguyễn Ngọc Bảo Long | DE190344 | Phần bidding, test case và báo cáo AI audit | Có                   | Commit code, file test, file AI_AUDIT_LOG |
|                      |          |                                             | Có / Không           |                                           |
|                      |          |                                             | Có / Không           |                                           |
|                      |          |                                             | Có / Không           |                                           |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI hỗ trợ tốt nhất ở phần phân tích yêu cầu, gợi ý cách viết test case và sửa cách diễn đạt trong báo cáo. Khi gặp các rule thời gian dễ nhầm, AI giúp tôi nhìn ra cách đặt mốc thời gian rõ ràng hơn.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Tôi không dùng nguyên văn toàn bộ gợi ý của AI vì một số chỗ chưa khớp hoàn toàn với cấu trúc project. Tôi chỉ lấy phần phù hợp rồi tự chỉnh lại để đảm bảo đúng code thực tế và đúng cách viết của mình.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Tôi kiểm tra bằng cách đọc lại code, chạy test, và so sánh với yêu cầu đề bài. Những chỗ AI gợi ý nhưng chưa chắc chắn thì tôi tự đối chiếu với logic trong service và entity để sửa lại cho đúng.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Khó nhất là việc nghĩ ra các test case biên và rà lại các mốc thời gian dễ gây lỗi trong nghiệp vụ vào phòng. Ngoài ra, việc viết AI audit log cũng mất thời gian hơn nếu không có gợi ý khung nội dung ban đầu.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Tôi hiểu rõ hơn cách áp dụng nghiệp vụ vào code và test, đặc biệt là trong các tình huống có ràng buộc về thời gian và điều kiện tham gia phiên đấu giá. Tôi cũng luyện thêm được cách viết test có mục đích rõ ràng hơn.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Tôi học được rằng AI chỉ nên dùng như công cụ hỗ trợ, còn trách nhiệm cuối cùng vẫn là người làm bài phải tự hiểu và tự kiểm tra. Cần ghi nhận rõ phần nào AI hỗ trợ, không chép nguyên văn máy móc và phải đối chiếu lại với project thực tế.
```

---

## 10. Cam kết học thuật

| Đại diện sinh viên/nhóm | Ngày xác nhận |
| ----------------------- | ------------- |
| Nguyễn Ngọc Bảo Long    | 09/06/2026    |
