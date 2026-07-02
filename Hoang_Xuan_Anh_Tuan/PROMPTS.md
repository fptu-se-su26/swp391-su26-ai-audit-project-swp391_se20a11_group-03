# Prompt Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học | Software development project |
| Mã môn học | SWP391 |
| Lớp | SE20A11 |
| Học kỳ | 5 |
| Tên bài tập / Project | Realtime Bidding System |
| Tên sinh viên / Nhóm | Hoàng Xuân Anh Tuấn / Nhóm 5 |
| MSSV / Danh sách MSSV | DE190463 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 18/05/2026 |
| Ngày cập nhật gần nhất | 30/06/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Sinh viên/nhóm cần ghi lại:

- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Sinh viên/nhóm đã kiểm tra, chỉnh sửa hoặc cải tiến gì sau khi nhận kết quả từ AI.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [ ] ChatGPT
- [x] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [x] Cursor
- [ ] Antigravity
- [ ] Microsoft Copilot
- [ ] Perplexity
- [x] Công cụ khác: Codex

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 08/06/2026 | Gemini | Có giải pháp về phần ví tiền nạp/rút | Hỏi cách thiết kế và triển khai ví điện tử cá nhân với Deposit và Withdrawal bằng Java, Spring Framework, SQL Server | AI gợi ý bảng Wallet, TransactionHistory, flow nạp/rút, Repository, Service, transaction, locking, double-spend và bảo mật | Có | Commit: https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/000aa5ab923b2fc35b6372b65e33159605a447a8 |
| 2 | 30/06/2026 | Cursor | Sửa lại giao diện web đấu giá | Yêu cầu AI đọc project và làm lại giao diện web đấu giá hiện đại, đẹp, dễ dùng, responsive, có animation nhẹ | AI sinh giao diện mới theo prompt, có cải thiện UI/UX, animation và responsive | Có | Commit: https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/e51280e3bd64ff6dea057eda0ec14b57d15412d1 |
| 3 | 30/06/2026 | Codex | Tối ưu giao diện không bị lag | Hỏi nguyên nhân giao diện sau khi thay đổi bị lag | AI chỉ ra các nguyên nhân và hướng tối ưu như giảm animation, xử lý double scrollbar, giảm polling, dừng polling khi tab ẩn, tối ưu ảnh, memo hóa card | Có | Commit: https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/6b7644f2a93b3b1f8b35eec75a0d03675ff75c44 |
| 4 |  |  |  |  |  | Có / Không |  |
| 5 |  |  |  |  |  | Có / Không |  |
| 6 |  |  |  |  |  | Có / Không |  |
| 7 |  |  |  |  |  | Có / Không |  |
| 8 |  |  |  |  |  | Có / Không |  |
| 9 |  |  |  |  |  | Có / Không |  |
| 10 |  |  |  |  |  | Có / Không |  |

---

## 5. Prompt chi tiết

> Sinh viên/nhóm có thể nhân bản mẫu “Prompt số...” nhiều lần tùy số lượng prompt thực tế đã sử dụng.

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 08/06/2026 |
| Công cụ AI | Gemini |
| Mục đích | Để có giải pháp về phần ví tiền nạp/rút |
| Phần việc liên quan | Database / Coding / Testing / Other |
| Mức độ sử dụng | Hỏi ý tưởng / Hỏi giải thích / Hỏi sinh code |

#### 5.1. Prompt nguyên văn

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

#### 5.2. Bối cảnh khi viết prompt

Mô tả ngắn gọn vì sao sinh viên/nhóm cần dùng prompt này.

```text
Trong project Realtime Bidding System, em cần xây dựng chức năng ví tiền cá nhân để hỗ trợ nạp tiền và rút tiền. Đây là phần liên quan đến database, backend, giao dịch tiền và bảo mật nên em cần AI gợi ý hướng thiết kế tổng quan trước khi triển khai.
```

#### 5.3. Kết quả AI trả về

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
AI gợi ý cần có hai bảng mới trong database là Wallet và TransactionHistory để lưu thông tin ví và lịch sử giao dịch. AI cũng đưa ra flow nạp tiền và rút tiền, gợi ý cấu trúc code cho Repository và Service, gồm interface WalletRepository và class WalletService.

Ngoài ra, AI chỉ ra rủi ro double-spend là rủi ro lớn khi làm ví tiền và gợi ý cách xử lý bằng database transaction, locking trong SQL Server và Spring. AI cũng đưa ra một số lưu ý bảo mật để tăng an toàn cho giao dịch.
```

#### 5.4. Kết quả đã áp dụng vào bài

Mô tả phần nào từ kết quả AI đã được sử dụng vào bài tập/project.

```text
Em đã sử dụng gợi ý database của AI để thêm hai bảng Wallet và TransactionHistory vào database hiện có của nhóm. Em cũng dựa trên phần xử lý rủi ro để có thêm ý tưởng viết test case kiểm tra chức năng ví tiền. Đối với phần bảo mật, em dùng gợi ý của AI để tìm hiểu thêm cách làm và áp dụng sau khi các module khác của dự án đã hoàn thành.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với kết quả AI trả về.

```text
Đối với phần System Flow, em không dùng hoàn toàn flow rút tiền do AI gợi ý. Em đã chỉnh lại để việc rút tiền không tự động thực hiện ngay mà cần thông qua nhân viên hoặc admin duyệt trước. Cách làm này giúp tăng tính bảo mật và tính pháp lý cho hệ thống, ví dụ tránh các rủi ro liên quan đến giao dịch bất thường hoặc rửa tiền.
```

#### 5.6. Đánh giá chất lượng prompt

Đánh dấu các nhận xét phù hợp.

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/000aa5ab923b2fc35b6372b65e33159605a447a8 |
| File liên quan | Wallet / TransactionHistory / Database / Backend |
| Screenshot | https://github.com/user-attachments/assets/5edb402c-84e1-436e-bea6-b28ddd1f79ea |
| Kết quả chạy/test | Thành công |
| Link tài liệu/báo cáo | https://drive.google.com/file/d/1DJ436u950_AjCIWHLa3tqqckELBKM3tb/view?usp=sharing |
| Ghi chú khác | AI hỗ trợ một phần, sinh viên tự rà soát và cải tiến flow rút tiền |

#### 5.8. Ghi chú thêm

```text
Qua prompt này, em học được rằng việc đặt vai trò cho AI và mô tả rõ công nghệ, yêu cầu đầu ra sẽ giúp AI trả lời rõ ràng hơn và hạn chế bị ảo giác.
```

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 30/06/2026 |
| Công cụ AI | Cursor |
| Mục đích | Sửa lại giao diện |
| Phần việc liên quan | Coding / Other |
| Mức độ sử dụng | Hỏi sinh code / Hỏi tối ưu |

#### 5.1. Prompt nguyên văn

```text
Bạn là senior frontend engineer + UI/UX designer. Hãy làm lại giao diện web đấu giá hiện tại của tôi sao cho hiện đại, đẹp, dễ dùng và có hiệu ứng động tinh tế.

Yêu cầu quan trọng:
1. Trước tiên hãy đọc toàn bộ cấu trúc project hiện tại.
2. Không phá logic backend, API, database, route, authentication, checkout/payment, bidding logic hoặc các chức năng đang chạy.
3. Chỉ refactor/làm mới phần giao diện, component, layout, CSS, animation và responsive UI.
4. Giữ nguyên dữ liệu thật đang được render từ project hiện tại.
5. Nếu cần đổi tên class/component thì phải đảm bảo không làm hỏng luồng hiện tại.

Phong cách thiết kế mong muốn:
- Website đấu giá hiện đại, chuyên nghiệp, đáng tin cậy.
- Giao diện sạch, có cảm giác premium nhưng không quá màu mè.
- Màu chủ đạo gợi ý: nền sáng, trắng/xám nhạt, điểm nhấn xanh dương hoặc tím đậm; có thể thêm gradient nhẹ.
- Card sản phẩm đấu giá phải nổi bật, dễ nhìn, có ảnh, tên sản phẩm, giá hiện tại, thời gian còn lại, số lượt bid và nút tham gia đấu giá.
- Trang chủ nên có hero section đẹp, CTA rõ ràng, danh sách sản phẩm đang đấu giá, sản phẩm nổi bật, danh mục, và phần hướng dẫn cách đấu giá.
- Header/navbar hiện đại, sticky nếu phù hợp.
- Footer gọn, chuyên nghiệp.

Hiệu ứng động:
- Thêm animation nhẹ nhàng khi hover card, button, ảnh sản phẩm.
- Card sản phẩm có hiệu ứng nâng lên, shadow mượt, ảnh zoom nhẹ khi hover.
- Button có transition mượt.
- Khi load danh sách sản phẩm, thêm fade-in hoặc slide-up animation.
- Countdown thời gian đấu giá nên nổi bật hơn, có thể dùng badge hoặc hiệu ứng nhẹ.
- Không dùng animation quá nặng hoặc gây rối mắt.
- Ưu tiên CSS animation / transition đơn giản, hiệu năng tốt.

Responsive:
- Giao diện phải đẹp trên desktop, tablet và mobile.
- Trên mobile, card sản phẩm phải dễ đọc, nút bấm đủ lớn, navbar có thể chuyển thành menu.
- Không để vỡ layout.

UX cần cải thiện:
- Làm rõ trạng thái sản phẩm: đang đấu giá, sắp kết thúc, đã kết thúc.
- Làm nổi bật giá hiện tại và nút đặt giá.
- Thêm empty state đẹp nếu không có sản phẩm.
- Thêm loading skeleton nếu project đang có trạng thái loading.
- Form đặt giá cần rõ ràng, dễ thao tác, có focus state đẹp.
- Thông báo lỗi/thành công nên hiển thị thân thiện.

Kỹ thuật:
- Dựa theo framework hiện tại của project. Nếu project dùng React thì refactor component React. Nếu dùng Next.js thì giữ chuẩn Next.js. Nếu dùng Laravel Blade thì chỉnh Blade/CSS tương ứng. Nếu dùng Tailwind thì ưu tiên Tailwind. Nếu chưa có Tailwind thì đừng tự ý thêm dependency lớn nếu không cần thiết.
- Ưu tiên tái sử dụng component.
- Code phải sạch, dễ đọc, có cấu trúc rõ ràng.
- Không thêm thư viện animation nặng nếu CSS/transition là đủ.
- Nếu muốn thêm icon, chỉ dùng thư viện đã có sẵn trong project. Nếu chưa có thì dùng SVG inline đơn giản.
- Đảm bảo accessibility cơ bản: contrast tốt, focus state, aria-label cho nút/icon cần thiết.

Các trang cần làm mới nếu tồn tại:
- Home page
- Product/Auction listing page
- Auction detail page
- Login/Register page
- User dashboard/profile page
- Admin page nếu có, nhưng ưu tiên không phá layout admin hiện tại nếu logic phức tạp

Kết quả mong muốn:
- Giao diện mới đẹp hơn rõ rệt.
- Có animation mượt nhưng nhẹ.
- Không làm hỏng chức năng hiện tại.
- Sau khi chỉnh sửa, hãy liệt kê các file đã thay đổi và giải thích ngắn gọn từng thay đổi.
- Nếu có lỗi build/lint/test, hãy sửa cho đến khi chạy được.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Sau khi project đã có giao diện web đấu giá, em muốn cải thiện UI/UX để giao diện hiện đại, đẹp hơn, dễ dùng hơn và có animation nhẹ. Em cần AI hỗ trợ refactor phần giao diện nhưng không được làm hỏng backend, API, route, authentication, checkout/payment hoặc bidding logic đang chạy.
```

#### 5.3. Kết quả AI trả về

```text
AI sinh giao diện mới theo prompt của em. Giao diện được làm lại theo hướng hiện đại hơn, có bố cục rõ hơn, card sản phẩm đấu giá nổi bật hơn, có animation, responsive và cải thiện trải nghiệm người dùng.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Em đã sử dụng giao diện mà AI sinh ra để áp dụng vào project. Kết quả giao diện sau khi chỉnh sửa khá vừa mắt và đúng với yêu cầu trong prompt.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Sau khi AI sinh giao diện, em không dùng ngay toàn bộ một cách máy móc mà tiếp tục tự prompt lại và chỉnh sửa thêm để giao diện trông hợp mắt hơn. Sau đó em kiểm tra lại giao diện và chức năng để đảm bảo không phá logic hiện tại của project.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [x] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/e51280e3bd64ff6dea057eda0ec14b57d15412d1 |
| File liên quan | Frontend / UI / UX |
| Screenshot | https://github.com/user-attachments/assets/aa544572-3396-4524-a755-fae04fca5dc8 |
| Kết quả chạy/test | Giao diện khá vừa mắt, đúng với prompt đưa ra |
| Link tài liệu/báo cáo | https://drive.google.com/file/d/12qrdPDR63We-gllA8ap7CudGX0ZAxyje/view?usp=sharing |
| Ghi chú khác | Sau khi tạo giao diện xong, giao diện mới khá lag nên cần tiếp tục dùng AI để tìm nguyên nhân và tối ưu |

#### 5.8. Ghi chú thêm

```text
Prompt này giúp cải thiện giao diện nhưng vẫn cần tự kiểm tra và chỉnh lại vì một prompt dù chi tiết vẫn có thể chưa hoàn toàn hợp với ý của bản thân.
```

---

### Prompt số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 30/06/2026 |
| Công cụ AI | Codex |
| Mục đích | Tối ưu giao diện không bị lag nữa |
| Phần việc liên quan | Debug / Coding |
| Mức độ sử dụng | Hỏi debug / Hỏi tối ưu |

#### 5.1. Prompt nguyên văn

```text
Hiện tại giao diện của tôi sau khi thay đổi đang khá là lag, bạn hãy chỉ cho tôi nghuyên nhân gây ra hiện tượng này.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Sau khi dùng AI để làm mới giao diện web đấu giá, giao diện mới nhìn đẹp hơn nhưng khi chạy thì khá lag. Vì vậy, em cần AI hỗ trợ phân tích nguyên nhân gây lag trước khi tự kiểm tra và tối ưu lại code.
```

#### 5.3. Kết quả AI trả về

```text
AI chỉ ra nhiều nguyên nhân và hướng tối ưu giao diện:

1. Giảm double scrollbar:
Trang home bị 2 thanh cuộn vì main dùng overflow-x-hidden, làm trình duyệt tạo thêm scroll container. Đề xuất đổi sang overflow-x-clip để giảm khựng khi scroll.

2. Giảm tải animation:
Giảm blur/glow nặng, giảm số sao băng trên tablet/mobile, thêm rule cho máy yếu như @media (update: slow), (prefers-reduced-data: reduce).

3. Scroll reveal nhẹ hơn:
Cho hiệu ứng hiện sớm hơn, giảm delay tối đa, giảm transition và bỏ will-change sau khi hiện xong để giảm giữ GPU memory.

4. Dừng polling khi tab bị ẩn:
Các phần như đấu giá, dashboard, notification, bid history không nên gọi API khi tab không được xem. Khi document.hidden thì dừng polling, khi quay lại tab thì refresh.

5. Giảm polling đấu giá:
auctionPolling từ 1 giây/lần thành 2 giây/lần để nhẹ hơn nhưng vẫn đủ realtime cho web demo.

6. Tối ưu ảnh:
Chuyển một số card từ img sang next/image, dùng sizes, fill và chỉ dùng priority cho ảnh hero.

7. Memo hóa card:
Dùng memo cho AuctionCard, FeaturedLotCard, ProductAuctionCard để giảm render lại khi state khác thay đổi.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Em đã áp dụng các phần AI gợi ý để bắt đầu tối ưu lại giao diện. Sau khi tối ưu, kết quả chạy/test cho thấy giao diện chạy mượt hơn.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Em đã rà soát lại code phần giao diện và thấy các nguyên nhân AI nêu là phù hợp. Sau đó em mới bắt đầu tối ưu theo hướng dẫn, thay vì để AI tự sửa toàn bộ khi em chưa hiểu kỹ nguyên nhân. Việc này giúp em kiểm soát tốt hơn các thay đổi và hiểu được kiến thức tối ưu giao diện.
```

#### 5.6. Đánh giá chất lượng prompt

- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/6b7644f2a93b3b1f8b35eec75a0d03675ff75c44 |
| File liên quan | Frontend performance / UI optimization |
| Screenshot | https://github.com/user-attachments/assets/ddb2a4c6-ceba-496f-b6dd-b9912a7ef5c2 |
| Kết quả chạy/test | Chạy mượt |
| Link tài liệu/báo cáo | https://drive.google.com/file/d/1Ud1B6jlcNYIqorSUHYVN2gpXYX2ru_04/view?usp=sharing |
| Ghi chú khác | AI hỗ trợ một phần, sinh viên tự rà soát và áp dụng tối ưu |

#### 5.8. Ghi chú thêm

```text
Trong AI Audit Log, ngày sử dụng prompt này được ghi là 30/06/2025. Tuy nhiên, do timeline project là năm 2026 nên trong Prompt Log này em ghi lại là 30/06/2026 để thống nhất với thời gian thực hiện project.
```

---

## 6. Prompt quan trọng nhất

Chọn một prompt có ảnh hưởng lớn nhất đến bài tập/project.

### 6.1. Prompt được chọn

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

### 6.2. Vì sao prompt này quan trọng?

```text
Prompt này quan trọng nhất vì nó liên quan trực tiếp đến chức năng ví tiền, một chức năng quan trọng trong hệ thống đấu giá thời gian thực. Ví tiền có liên quan đến tiền, giao dịch, database, bảo mật và rủi ro nên cần thiết kế cẩn thận hơn các phần giao diện thông thường.
```

### 6.3. Kết quả prompt này mang lại

```text
Prompt này giúp em có hướng thiết kế database cho ví tiền, biết cần có bảng Wallet và TransactionHistory, hiểu thêm flow nạp/rút tiền, cách xử lý backend bằng Repository và Service, cũng như các rủi ro cần chú ý như double-spend, race condition, transaction và locking.
```

### 6.4. Sinh viên/nhóm đã kiểm tra kết quả như thế nào?

```text
Em đã kiểm tra kết quả bằng cách search Google về các rủi ro và lỗi cần tránh khi làm ví tiền trên một hệ thống, xem thêm hướng dẫn YouTube, dùng một AI khác để kiểm chứng lại và tự rà soát trước khi áp dụng vào project.
```

### 6.5. Sinh viên/nhóm đã cải tiến gì từ kết quả AI?

```text
Em đã cải tiến flow rút tiền. Thay vì cho rút tiền tự động như flow AI gợi ý, em chỉnh lại để giao dịch rút tiền cần nhân viên hoặc admin duyệt trước. Việc này giúp tăng tính bảo mật và tính pháp lý cho hệ thống.
```

---

## 7. Prompt chưa hiệu quả

Ghi lại ít nhất một prompt chưa tạo ra kết quả tốt hoặc chưa phù hợp.

### 7.1. Prompt chưa hiệu quả

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

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Prompt này nhìn chung tạo ra kết quả tốt nhưng vẫn chưa hoàn toàn hiệu quả ở phần System Flow. AI chỉ đưa ra một flow chính để tham khảo, chưa đưa nhiều phương án flow khác nhau. Đối với nghiệp vụ rút tiền, flow AI gợi ý chưa phù hợp hoàn toàn vì rút tiền là phần nhạy cảm, cần cân nhắc bảo mật và pháp lý cao hơn.
```

Gợi ý nguyên nhân:

- Prompt quá ngắn.
- Thiếu bối cảnh bài toán.
- Không nêu rõ yêu cầu đầu ra.
- Không cung cấp ngôn ngữ lập trình/công nghệ đang dùng.
- Không đưa lỗi cụ thể.
- Không đưa ví dụ input/output.
- Không yêu cầu AI giải thích.
- Hỏi AI làm toàn bộ thay vì hỏi từng phần.

### 7.3. Cách cải thiện prompt

```text
Cần yêu cầu AI đưa ra ít nhất 2 flow khác nhau cho từng nghiệp vụ, đặc biệt là rút tiền. Cũng cần nói rõ hệ thống là web đấu giá, có vai trò user, staff/admin và giao dịch tiền cần được kiểm soát. Ngoài ra nên yêu cầu AI phân tích ưu điểm, nhược điểm, rủi ro bảo mật và tính pháp lý của từng flow.
```

### 7.4. Prompt sau khi cải tiến

```text
Đóng vai: Một Backend Software Engineer và System Architect có nhiều kinh nghiệm trong FinTech, hệ thống thanh toán và hệ thống đấu giá.

Bối cảnh: Tôi đang làm project Realtime Bidding System bằng Java, Spring Framework và SQL Server. Hệ thống có người dùng tham gia đấu giá, có ví tiền cá nhân để nạp tiền và rút tiền. Vì giao dịch tiền có rủi ro bảo mật và pháp lý, tôi không muốn chỉ dùng flow tự động nếu không phù hợp.

Nhiệm vụ: Hãy hướng dẫn tôi thiết kế và triển khai tính năng ví điện tử cá nhân gồm Deposit và Withdrawal.

Yêu cầu đầu ra:
1. Đề xuất database schema cho Wallet và TransactionHistory.
2. Đưa ra ít nhất 2 phương án flow cho Deposit.
3. Đưa ra ít nhất 2 phương án flow cho Withdrawal, gồm flow rút tiền tự động và flow cần staff/admin duyệt.
4. Phân tích ưu điểm, nhược điểm, rủi ro bảo mật và tính pháp lý của từng flow.
5. Gợi ý cách xử lý transaction, locking, race condition và double-spend trong SQL Server và Spring.
6. Gợi ý test case quan trọng để kiểm tra chức năng ví tiền.
7. Chỉ đưa code mẫu ở mức tham khảo, không viết toàn bộ project thay tôi.
```

### 7.5. Kết quả sau khi cải tiến prompt

```text
Prompt sau khi cải tiến sẽ giúp AI đưa ra nhiều phương án flow hơn, đặc biệt là flow rút tiền cần staff/admin duyệt. Nhờ đó sinh viên có thêm lựa chọn để so sánh và chọn giải pháp phù hợp hơn với yêu cầu bảo mật, pháp lý và nghiệp vụ của hệ thống đấu giá.
```

---

## 8. Bài học về cách viết prompt

### 8.1. Khi viết prompt, em/nhóm cần cung cấp thông tin gì để AI trả lời tốt hơn?

```text
Khi viết prompt, em cần cung cấp mục tiêu cần đạt, bối cảnh bài toán, công nghệ/ngôn ngữ lập trình đang dùng, phần việc cụ thể cần AI hỗ trợ, ràng buộc không được phá logic hiện tại, yêu cầu đầu ra mong muốn và các rủi ro cần AI phân tích.

Ví dụ, với ví tiền cần nói rõ dùng Java, Spring Framework, SQL Server và cần chú ý transaction, locking, race condition, double-spend, bảo mật. Với giao diện cần nói rõ chỉ refactor UI, không phá backend, API, route, authentication, payment hoặc bidding logic.
```

Gợi ý:

- Mục tiêu cần đạt.
- Bối cảnh bài toán.
- Công nghệ/ngôn ngữ lập trình đang dùng.
- Input/output mong muốn.
- Ràng buộc của đề bài.
- Lỗi đang gặp.
- Format kết quả mong muốn.
- Yêu cầu AI giải thích từng bước.

### 8.2. Em/nhóm đã học được gì về cách đặt câu hỏi cho AI?

```text
Em học được rằng prompt càng rõ vai trò, bối cảnh, yêu cầu và format đầu ra thì AI càng trả lời rõ ràng hơn. Tuy nhiên, không nên tin hoàn toàn vào kết quả AI. Sau khi nhận kết quả, cần tự kiểm tra lại, chạy thử, so sánh với yêu cầu project và chỉnh sửa cho phù hợp.

Em cũng học được rằng với các phần quan trọng như ví tiền hoặc bảo mật, nên yêu cầu AI phân tích nhiều phương án thay vì chỉ xin một giải pháp duy nhất.
```

### 8.3. Lần sau em/nhóm sẽ cải thiện prompt như thế nào?

```text
Lần sau, em sẽ viết prompt có bối cảnh cụ thể hơn, yêu cầu AI đưa ra nhiều phương án hơn, yêu cầu phân tích ưu nhược điểm và rủi ro rõ hơn. Em cũng sẽ chia nhỏ prompt theo từng phần như database, flow, coding, testing, debug, tối ưu thay vì hỏi quá rộng trong một lần.
```

---

## 9. Phân loại prompt đã sử dụng

Đánh dấu số lượng prompt theo từng nhóm.

| Loại prompt | Số lượng | Ví dụ prompt tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu | 0 |  |
| Prompt giải thích kiến thức | 1 | Hỏi về rủi ro, bảo mật, transaction và locking khi làm ví tiền |
| Prompt thiết kế giải pháp | 1 | Prompt Gemini thiết kế ví điện tử cá nhân gồm nạp tiền và rút tiền |
| Prompt thiết kế database | 1 | Prompt Gemini yêu cầu lược đồ bảng Wallet và TransactionHistory |
| Prompt sinh code mẫu | 2 | Prompt Gemini hỏi cấu trúc code Repository/Service; Prompt Cursor yêu cầu refactor giao diện |
| Prompt debug lỗi | 1 | Prompt Codex hỏi nguyên nhân giao diện bị lag |
| Prompt viết test case | 1 | Dựa trên prompt Gemini về rủi ro double-spend và race condition |
| Prompt review code | 0 |  |
| Prompt tối ưu code | 1 | Prompt Codex tối ưu giao diện không bị lag |
| Prompt viết báo cáo | 0 |  |
| Prompt chuẩn bị thuyết trình | 0 |  |
| Prompt khác | 1 | Prompt Cursor thiết kế lại UI/UX giao diện web đấu giá |

---

## 10. Checklist chất lượng prompt

Sinh viên/nhóm tự kiểm tra chất lượng prompt đã dùng.

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng | Có | Các prompt đều nêu mục tiêu như thiết kế ví tiền, sửa giao diện, tìm nguyên nhân lag |
| Prompt có đủ bối cảnh | Có | Prompt ví tiền có vai trò AI, công nghệ và nội dung cần trả lời; prompt giao diện có bối cảnh project hiện tại |
| Prompt có nêu công nghệ/ngôn ngữ sử dụng | Có | Prompt ví tiền nêu Java, Spring Framework, SQL Server |
| Prompt có nêu yêu cầu đầu ra | Có | Prompt ví tiền và prompt giao diện đều có danh sách yêu cầu đầu ra |
| Prompt không yêu cầu AI làm toàn bộ bài một cách máy móc | Có | Sinh viên vẫn tự kiểm tra, chỉnh sửa và cải tiến sau khi AI trả lời |
| Prompt có yêu cầu AI giải thích hoặc phân tích | Có | Prompt ví tiền yêu cầu phân tích rủi ro, transaction và locking |
| Kết quả AI được kiểm tra lại | Có | Có search Google, xem YouTube, dùng AI khác kiểm chứng và tự rà soát code |
| Kết quả AI được chỉnh sửa trước khi sử dụng | Có | Flow rút tiền được chỉnh lại cần staff/admin duyệt; giao diện được prompt lại để hợp mắt hơn |
| Prompt quan trọng được ghi lại đầy đủ | Có | Prompt ví tiền được ghi lại nguyên văn |
| Prompt sai/chưa hiệu quả được rút kinh nghiệm | Có | Ghi nhận hạn chế là AI chưa đưa nhiều flow để tham khảo và cần prompt rõ hơn |

---

## 11. Cam kết sử dụng prompt minh bạch

Sinh viên/nhóm cam kết rằng:

- Các prompt quan trọng đã được ghi lại trung thực.
- Không che giấu việc sử dụng AI trong các phần quan trọng của bài.
- Không nộp nguyên văn kết quả AI nếu chưa kiểm tra và chỉnh sửa.
- Có khả năng giải thích các phần đã sử dụng từ AI.
- Chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Hoàng Xuân Anh Tuấn | 7/1/2026 |
