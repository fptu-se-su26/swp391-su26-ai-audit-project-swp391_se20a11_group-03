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
- [x] Công cụ khác: Codex

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
- Dùng Cursor và codex để tối ưu phần code mình viết.
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
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/000aa5ab923b2fc35b6372b65e33159605a447a8 |
| File liên quan | x |
| Screenshot |  <img width="1896" height="917" alt="image" src="https://github.com/user-attachments/assets/5edb402c-84e1-436e-bea6-b28ddd1f79ea" />
  |
| Kết quả chạy/test |  thành công  |
| Link video demo |  https://drive.google.com/file/d/1DJ436u950_AjCIWHLa3tqqckELBKM3tb/view?usp=sharing  |
| Ghi chú khác | X |

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
| Ngày sử dụng | 30/06/2026 |
| Công cụ AI | Cursor  |
| Mục đích sử dụng | sửa lại giao diện |
| Phần việc liên quan | X |
| Mức độ sử dụng | Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

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

#### 4.2. Kết quả AI gợi ý

```text
AI gen giao diẹn theo prompt của tôi
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Giao diện mà nó sinh ra.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Sau đó tự prompt lại để nó chỉnh sửa trông hợp mắt hơn tí nữa.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/e51280e3bd64ff6dea057eda0ec14b57d15412d1 |
| File liên quan | X |
| Screenshot | <img width="1901" height="915" alt="image" src="https://github.com/user-attachments/assets/aa544572-3396-4524-a755-fae04fca5dc8" />
 |
| Kết quả chạy/test | giao diện cũng khá vừa mắt đúng với prompt đưa ra |
| Link video demo | https://drive.google.com/file/d/12qrdPDR63We-gllA8ap7CudGX0ZAxyje/view?usp=sharing |
| Ghi chú khác | X |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Sau khi tạo giao diện xong thì giao diện mới khá là lag nên sau đó đã tiếp nhục nhờ AI đưa ra nguyên do để tối ưu giao diện không bị lag nữa.
```

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 30/06/2025 |
| Công cụ AI | codex |
| Mục đích sử dụng | tối ưu giao diện không bị lag nữa |
| Phần việc liên quan | X |
| Mức độ sử dụng | Hỗ trợ một phần |

#### 4.1. Prompt đã sử dụng

```text
Hiện tại giao diện của tôi sau khi thay đổi đang khá là lag, bạn hãy chỉ cho tôi nghuyên nhân gây ra hiện tượng này.
```

#### 4.2. Kết quả AI gợi ý

```text
1. Giảm double scrollbar
Trang home bị 2 thanh cuộn vì main dùng overflow-x-hidden, làm trình duyệt tạo thêm scroll container. Mình đổi sang:
overflow-x-clip
=> giảm khựng khi scroll.
2. Giảm tải animation
Mình giảm blur/glow nặng, giảm số sao băng trên tablet/mobile, thêm rule cho máy yếu:
@media (update: slow), (prefers-reduced-data: reduce)
=> máy yếu sẽ tự giảm animation.
3. Scroll reveal nhẹ hơn
Hiệu ứng khi lướt xuống được chỉnh:
hiện sớm hơn
delay tối đa thấp hơn
transition ngắn hơn
bỏ will-change sau khi hiện xong
=> đỡ delay và đỡ giữ GPU memory.
4. Dừng polling khi tab bị ẩn
Các phần như đấu giá, dashboard, notification, bid history trước đó vẫn gọi API dù tab không xem. Mình chỉnh để khi document.hidden thì không poll nữa, quay lại tab thì refresh.
=> giảm CPU/network.
5. Giảm polling đấu giá
auctionPolling từ 1 giây/lần thành 2 giây/lần.
=> nhẹ hơn mà vẫn đủ realtime cho web demo.
6. Tối ưu ảnh
Một số card chuyển từ <img> sang next/image, dùng sizes, fill, priority chỉ cho ảnh hero.
=> scroll danh sách sản phẩm mượt hơn.
7. Memo hóa card
Các card như AuctionCard, FeaturedLotCard, ProductAuctionCard dùng memo.
=> khi state khác thay đổi, card ít render lại hơn.
Tóm lại: muốn web mượt hơn nữa thì bước tiếp theo nên làm là tối ưu 3 trang /live, /upcoming, /results đồng bộ UI nhưng nhẹ, tránh animation nặng và dùng chung ProductAuctionCard.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Đã áp dụng tất acr các phần mà AI gợi ý để bắt đầu tối ưu lại giao diện.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Em đã rà soát code phần đó và thấy đúng như vậy thật nên đã bắt đầu tối ưu theo AI hướng dẫn.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | https://github.com/fptu-se-su26/swp391-su26-ai-audit-project-swp391_se20a11_group-03/commit/6b7644f2a93b3b1f8b35eec75a0d03675ff75c44 |
| File liên quan | X |
| Screenshot | <img width="1901" height="910" alt="image" src="https://github.com/user-attachments/assets/ddb2a4c6-ceba-496f-b6dd-b9912a7ef5c2" />
 |
| Kết quả chạy/test | chạy mượt |
| Link video demo | https://drive.google.com/file/d/1Ud1B6jlcNYIqorSUHYVN2gpXYX2ru_04/view?usp=sharing |
| Ghi chú khác | X |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Việc nhờ AI tìm các cách tôi ưu thì em nghĩ nên nhừo nó đưa ra các phần cần tối ưu trước và sau khi đi tìm hiêur xem các kiến thức về tối ưu đó thì mình bắt tay vào tối ưu sẽ tốt hơn nhiều với việc để AI tự tối ưu mà khi chưa tìm hiểu kĩ càng.
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
| Thiết kế giao diện |  |  | x |  | Tạo một giao diện mới đẹp hơn |
| Code frontend |  | x |  |  | web đã có fron end sãn nên AI chỉ việc sửa phần giao diện |
| Code backend |  | x |  |  | Chỉ xem gợi ý code mà nó đưa ra |
| Debug lỗi | x |  |  |  |  |
| Viết test case |  | x |  |  | Dựa trên việc AI đưa ra rủi ro để tự viết test case |
| Kiểm thử sản phẩm | x |  |  |  |  |
| Tối ưu code |  | x |  |  | Tối ưu giao diện mượt mà hơn |
| Viết báo cáo | x |  |  |  |  |
| Làm slide thuyết trình | x |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI không đưa ra nhiều hơn flow hệ thống để có thể tham khảo | Chỉ đưa 1 luồng duy nhất | Ghi chú cho nó có thể đưa ra gợi ý ít nhất là 2 Flow |
| 2 | Việc dùng 1 prompt dù có kĩ đến đâu vẫn không thể hợp với ýcuar bản thân | check lại sau khi mỗi lần prompt | phải kiểm tra kĩ và sửa lại để đúng theo ý của mình |
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
- sử dụng 1 con AI khác để kiểm chứng.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

Mô tả phần sinh viên tự làm, phần AI hỗ trợ và phần đã tự cải tiến.

```text
Em đã đóng góp được một trong những chức năng quan trọng trong một hệ thống đó là ví tiền, yêu cầu xử lý bảo mật rất cao.
Em đã tự đưa ra một flow để làm tăng tính bảo mật và pháp lý hơn cho hệ thống, AI dã hỗ trợ cho em biết những việc cần làm khi làm một ví tiền trên 1 hệ thống và vì còn hạn chế về việc đưa ra nhiều option của AI nên em đã tự cải tiến phần flow hệ thống đó.
Em đã làm được một giao diện đẹp mắt hơn và mượt mà hơn.
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
biết được caccs tối ưu giao diện khi lag.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Dó là flow hệ thống vì em thấy việc đó dễ dính tới phần pháp lý và bảo khá là cao.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Search google và xem hướng dẫn ở youtube
check lại bằng 1 con AI khác
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần xử lý bảo mật và rủi ro sẽ khó khăn nhất.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Học được nhiều kiến thức về việc bảo mật và rủi ro của của ví tiền hệ thống.
Học được cách tối ưu giao diện.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Việc kiểm chứng lại những gì mà AI gen ra là vô cùng quan trọng.
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
