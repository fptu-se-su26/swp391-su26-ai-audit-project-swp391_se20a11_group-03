# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software development project |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | 5 |
| Tên bài tập / Project | Realtime Bidding System |
| Tên sinh viên / Nhóm | Hoàng Xuân Anh Tuấn/5 |
| MSSV / Danh sách MSSV | DE190463 |
| Giảng viên hướng dẫn | 	Lê Thiện Nhật Quang |
| Ngày bắt đầu | 18/05/2026 |
| Ngày hoàn thành | 12/07/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [ ] ChatGPT
- [x] Gemini
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

```text
- Dùng Gemini gợi ý ý tưởng giải pháp về ví tiền(nạp/rút).
- Dùng Cursor để tối ưu phần code mình viết.
```
## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.  
> Sinh viên/nhóm có thể nhân bản mẫu “Lần sử dụng AI” nhiều lần tùy theo số lần sử dụng AI thực tế.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 08/006/2026 |
| Công cụ AI | Gemini |
| Mục đích sử dụng | Để có giải pháp về phần ví tiền (nạp/rút) |
| Phần việc liên quan | Database / Backend |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
Đóng vai: Một Backend Software Engineer và System Architect có nhiều năm kinh nghiệm trong lĩnh vực FinTech và hệ thống thanh toán.

Nhiệm vụ: Hãy hướng dẫn tôi cách thiết kế và triển khai tính năng Ví điện tử cá nhân, cụ thể là hai luồng: Nạp tiền (Deposit) và Rút tiền (Withdrawal).

Công nghệ (Tech Stack) mong muốn: Sử dụng Java, Spring Framework và cơ sở dữ liệu SQL Server.

Vui lòng cung cấp cho tôi các nội dung sau:

1.Thiết kế Database: Lược đồ các bảng cần thiết để lưu trữ thông tin ví và lịch sử giao dịch.

2.System Flow: Bước đi của dòng dữ liệu từ lúc người dùng ấn nút "Nạp/Rút" cho đến khi số dư được cập nhật.

3.Xử lý cốt lõi: Cấu trúc code gợi ý để xử lý logic này.

4.Xử lý rủi ro: Phân tích chi tiết cách sử dụng Database Transaction và cơ chế Locking để ngăn chặn lỗi Race Condition.

5.Bảo mật: Cần lưu ý những gì để đảm bảo an toàn cho giao dịch?
```

#### 4.2. Kết quả AI gợi ý

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
1.Thiết kế Database (Lược đồ dữ liệu):
Gợi ý cần có hai bảng mới cần thiết trong database.
Cung cấp mã của 2 bảng mới là Wallet và TransactionHistory

2. System flow:
Đưa ra hai  nạp tiền và rút tiền
3. Sử lý cốt lõi:
Đưa ra đoạn code về hai phần Repository và Service gồm có interface WalletRepository và class WalletService.
4. Xử lý rủi ro:
Đưa ra double spend là rủi ro lớn nhất đồng thời đưa ra giải pháp với SQL Server và Spring
5. Bảo mật:
Đưa ra 4 gợi ý để tăng tính bảo mật.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Mô tả rõ phần nào được sử dụng lại từ gợi ý của AI.

```text
Sau khi nhận được gợi ý từi AI em đã sử dụng lại:
- Database: Xử dụng chính hai bảng đó để thêm vào database hiện có của nhóm .
- Xử lý rủi ro: Dựa trên gợi ý đó e đã có ý tưởng thêm về test case dùng để test.
- Bảo mật: Tìm hiểu về cách làm của những bảo mật này để có thể làm nhanh và chất lượng sau khi dự án đã xong hết tất cả các module trừ phần ví tiền sẽ để cuối cùng.

```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với gợi ý ban đầu của AI.

```text
Đối với phần System flow thì phần rút tiền không phải tự động rút mà phải cần qua nhân viên hoặc admin duyệt mới có thể rút tiền.
Việc làm như thế sẽ làm tăng tính bảo mật hơn và tính pháp lý (ví dụ để tránh tình trạng rửa tiền) của hệ thống. 
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | Hiện tại chưa có vì phần ví(nạp/rút tiền) sẽ để đến cuối cùng sau khi hoàn thành các muodule  và tính năng khác |
| File liên quan | x |
| Screenshot |  Hiện tại chưa có vì phần ví(nạp/rút tiền) sẽ để đến cuối cùng sau khi hoàn thành các muodule  và tính năng khác  |
| Kết quả chạy/test |  Hiện tại chưa có vì phần ví(nạp/rút tiền) sẽ để đến cuối cùng sau khi hoàn thành các muodule  và tính năng khác  |
| Link video demo |  Hiện tại chưa có vì phần ví(nạp/rút tiền) sẽ để đến cuối cùng sau khi hoàn thành các muodule  và tính năng khác  |
| Ghi chú khác | Vì đây chỉ là dùng AI để gợi ý ý tưởng và phần module này nên được làm cuối cùng của dự án nên minh chứng hiện tạ là chưa có |

#### 4.6. Nhận xét cá nhân/nhóm

Sinh viên/nhóm học được gì sau lần sử dụng AI này?

```text
Việc prompt cho AI một format cố định và có kiến thức thì AI sẽ đưa ra cho mình một kết quả tốt hơn rõ ràng hơn và tránh bị ảo giác.
Học được việc cách làm ví tiền như phải cần thêm database nào vào, các lỗ hổng hay rủi ro và bảo mật khi làm tính năng này để thánh bị người khác lợi dụng lỗ hổng bảo mật quan trọng này. 
```

---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích sử dụng |  |
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung |

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

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích sử dụng |  |
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung |

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

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu | x |  |  |  |  |
| Viết user story/use case | x |  |  |  |  |
| Thiết kế database |  |  |  | x | Sau khi AI gen ra thì em đã rà soát lại thì thấy đúng nên áp dụng luôn data do nó gen ra |
| Thiết kế kiến trúc hệ thống | x |  |  |  |  |
| Thiết kế giao diện | x |  |  |  |  |
| Code frontend | x |  |  |  |  |
| Code backend |  | x |  |  | Chỉ xem gợi ý code mà nó đưa ra |
| Debug lỗi | x |  |  |  |  |
| Viết test case |  | x |  |  | Dựa trên việc AI đưa ra rủi ro để tự viết test case |
| Kiểm thử sản phẩm | x |  |  |  |  |
| Tối ưu code | x |  |  |  |  |
| Viết báo cáo | x |  |  |  |  |
| Làm slide thuyết trình | x |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI không đưa ra nhiều hơn flow hệ thống để có thể tham khảo | Chỉ đưa 1 luồng duy nhất | Ghi chú cho nó có thể đưa ra gợi ý ít nhất là 2 Flow |
| 2 |  |  |  |
| 3 |  |  |  |

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
- Search google về các rủi ro và lỗi cần tránh khi làm ví tiền trên một hệ thống.
- Xem hướng dẫn youtube: https://youtu.be/O28WJb0C6VY?si=4fO5Mk8mqf5MA8ZM.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

Mô tả phần sinh viên tự làm, phần AI hỗ trợ và phần đã tự cải tiến.

```text
Em đã đóng góp được một trong những chức năng quan trọng trong một hệ thống đó là ví tiền, yêu cầu xử lý bảo mật rất cao.
Em đã tự đưa ra một flow để làm tăng tính bảo mật và pháp lý hơn cho hệ thống, AI dã hỗ trợ cho em biết những việc cần làm khi làm một ví tiền trên 1 hệ thống và vì còn hạn chế về việc đưa ra nhiều option của AI nên em đã tự cải tiến phần flow hệ thống đó. 
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
|  |  |  | Có / Không |  |
|  |  |  | Có / Không |  |
|  |  |  | Có / Không |  |
|  |  |  | Có / Không |  |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
Biết được những kiến thức cần có khi làm một ví tiền ở hệ thống.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Dó là flow hệ thống vì em thấy việc đó dễ dính tới phần pháp lý và bảo khá là cao.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Search google và xem hướng dẫn ở youtube
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần xử lý bảo mật và rủi ro sẽ khó khăn nhất.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Học được nhiều kiến thức về việc bảo mật và rủi ro của của ví tiền hệ thống.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Việc kiểm chứng lại những gì mà AI gen ra là vô cùng quan trọng
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
| Hoàng Xuân Anh Tuấn | 08/06/2026 |
