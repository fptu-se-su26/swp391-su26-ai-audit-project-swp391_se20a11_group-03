# AI Learning Reflection

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
| Ngày hoàn thành reflection | 12/07/2026 |

---

## 2. Mục đích Reflection

File này dùng để sinh viên/nhóm tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập, lab, assignment hoặc project.

Reflection cần thể hiện:

- AI đã hỗ trợ gì trong quá trình học.
- Sinh viên/nhóm đã kiểm chứng kết quả AI như thế nào.
- Sinh viên/nhóm đã tự chỉnh sửa, cải tiến ra sao.
- Sinh viên/nhóm học được gì về môn học.
- Sinh viên/nhóm học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

Mô tả ngắn gọn quá trình sử dụng AI trong bài tập/project này.

```text
Trong project Realtime Bidding System, em đã sử dụng AI ở một số giai đoạn quan trọng như thiết kế chức năng ví tiền, cải thiện giao diện web đấu giá và tối ưu giao diện sau khi bị lag.

Ở phần ví tiền, em dùng Gemini để hỏi ý tưởng thiết kế chức năng nạp tiền và rút tiền, bao gồm database, flow xử lý, Repository/Service, transaction, locking, race condition, double-spend và bảo mật. Kết quả từ AI giúp em biết cần chuẩn bị những phần nào khi làm một chức năng liên quan đến giao dịch tiền.

Ở phần giao diện, em dùng Cursor để hỗ trợ làm lại giao diện web đấu giá theo hướng hiện đại, đẹp hơn, dễ sử dụng hơn, có animation nhẹ và responsive. Sau đó, vì giao diện mới bị lag, em dùng Codex để hỏi nguyên nhân và hướng tối ưu. AI gợi ý các cách như giảm animation nặng, xử lý double scrollbar, giảm polling, dừng polling khi tab bị ẩn, tối ưu ảnh và memo hóa component.

AI có giúp cải thiện chất lượng bài làm, nhưng em không sử dụng hoàn toàn nguyên văn kết quả AI. Em đã tự kiểm tra, chỉnh sửa và cải tiến lại các phần quan trọng, đặc biệt là flow rút tiền. Thay vì rút tiền tự động như flow tham khảo, em chỉnh lại để nhân viên hoặc admin duyệt trước nhằm tăng tính bảo mật và phù hợp hơn với tính pháp lý.
```

Gợi ý:

- Em/nhóm đã dùng AI ở giai đoạn nào?
- Dùng AI để hỗ trợ việc gì?
- Công cụ AI nào được sử dụng nhiều nhất?
- AI có giúp cải thiện chất lượng bài làm không?
- Có phần nào AI gợi ý nhưng em/nhóm không sử dụng không?

---

## 4. Công cụ AI đã sử dụng

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

### Công cụ được sử dụng nhiều nhất

```text
Cursor
```

### Lý do sử dụng công cụ đó

```text
Cursor được sử dụng nhiều trong phần chỉnh sửa và cải thiện giao diện vì có thể đọc cấu trúc project hiện tại và hỗ trợ refactor trực tiếp phần frontend. Công cụ này phù hợp với nhu cầu làm lại giao diện, chỉnh component, layout, CSS, animation và responsive UI mà không phải viết lại toàn bộ từ đầu.

Ngoài ra, Gemini và Codex cũng được sử dụng ở các phần quan trọng khác. Gemini hỗ trợ phần thiết kế ví tiền, còn Codex hỗ trợ phân tích nguyên nhân giao diện bị lag và gợi ý hướng tối ưu.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [ ] Hiểu yêu cầu đề bài
- [ ] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [x] Thiết kế database
- [x] Thiết kế giao diện
- [ ] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [x] Viết test case
- [ ] Review code
- [x] Tối ưu code
- [x] Kiểm tra bảo mật
- [ ] Viết báo cáo
- [ ] Chuẩn bị thuyết trình
- [x] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
AI hỗ trợ em ở ba phần chính.

Thứ nhất, Gemini hỗ trợ em tìm ý tưởng giải pháp cho chức năng ví tiền. AI gợi ý cần có bảng Wallet và TransactionHistory, đưa ra flow nạp tiền/rút tiền, gợi ý cấu trúc code Repository và Service, đồng thời giải thích các rủi ro như double-spend, race condition và cách xử lý bằng database transaction, locking.

Thứ hai, Cursor hỗ trợ em chỉnh sửa giao diện web đấu giá. AI giúp tạo giao diện hiện đại hơn, có card sản phẩm nổi bật, animation nhẹ, responsive UI, trạng thái sản phẩm rõ ràng và trải nghiệm người dùng tốt hơn.

Thứ ba, Codex hỗ trợ em phân tích nguyên nhân giao diện bị lag sau khi thay đổi. AI chỉ ra các vấn đề liên quan đến animation nặng, double scrollbar, polling API, ảnh chưa tối ưu và component render lại nhiều. Từ đó, em có hướng tối ưu để giao diện chạy mượt hơn.
```

---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em/nhóm học tốt hơn

```text
AI giúp em học tốt hơn vì giúp em hiểu nhanh hơn các vấn đề kỹ thuật khó, đặc biệt là phần ví tiền trong hệ thống có giao dịch tiền. Trước khi hỏi AI, em chưa nắm rõ cần thiết kế database ví tiền như thế nào, cần lưu lịch sử giao dịch ra sao và cần chú ý rủi ro gì. Sau khi nhận gợi ý từ Gemini, em biết thêm về Wallet, TransactionHistory, transaction, locking, race condition và double-spend.

AI cũng giúp em có thêm ý tưởng khi cải thiện giao diện. Cursor giúp em nhìn được cách tổ chức lại giao diện hiện đại hơn, còn Codex giúp em hiểu vì sao giao diện đẹp hơn nhưng lại bị lag. Qua đó, em học thêm được các cách tối ưu frontend như giảm animation nặng, giảm polling, dừng polling khi tab ẩn, tối ưu ảnh và memo hóa component.

Ngoài ra, AI còn giúp em biết cách viết prompt tốt hơn. Khi prompt có vai trò, bối cảnh, công nghệ và yêu cầu đầu ra rõ ràng thì kết quả AI trả lời cũng rõ ràng và có ích hơn.
```

Gợi ý:

- Hiểu bài nhanh hơn.
- Có thêm ví dụ minh họa.
- Biết cách debug lỗi.
- Biết thêm cách tổ chức code.
- Biết thêm cách thiết kế giải pháp.
- Biết cách viết test case.
- Biết cách cải thiện báo cáo hoặc slide.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

```text
AI vẫn có một số điểm chưa thật sự phù hợp. Ở phần ví tiền, AI chỉ đưa ra một flow chính để tham khảo, chưa đưa nhiều phương án flow khác nhau. Đặc biệt với rút tiền, nếu chỉ làm theo flow tự động thì có thể chưa phù hợp vì chức năng này liên quan đến bảo mật và pháp lý. Vì vậy, em phải tự chỉnh lại flow để nhân viên hoặc admin duyệt trước khi xử lý rút tiền.

Ở phần giao diện, mặc dù Cursor giúp làm giao diện đẹp hơn, nhưng sau khi áp dụng thì giao diện khá lag. Điều này cho thấy AI có thể tạo ra kết quả nhìn tốt nhưng chưa chắc đã tối ưu về hiệu năng. Em phải tiếp tục kiểm tra, hỏi thêm Codex về nguyên nhân và tự tối ưu lại.

Ngoài ra, nếu chỉ dùng một prompt dù khá chi tiết thì kết quả vẫn có thể chưa hợp hoàn toàn với ý của mình. Vì vậy, cần hỏi lại, kiểm tra lại và chỉnh sửa nhiều lần.
```

Gợi ý:

- AI trả lời sai.
- AI sinh code không chạy.
- AI hiểu sai yêu cầu đề bài.
- AI đưa giải pháp quá phức tạp.
- AI thiếu ngữ cảnh môn học.
- AI trả lời chung chung.
- AI khiến em/nhóm dễ phụ thuộc.

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [ ] Không phụ thuộc
- [x] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

Giải thích:

```text
Em chỉ phụ thuộc ít vào AI vì AI chủ yếu được dùng để gợi ý hướng làm, giải thích kiến thức, hỗ trợ thiết kế và chỉ ra nguyên nhân lỗi. Em không dùng nguyên văn kết quả AI mà không kiểm tra. Các phần quan trọng như flow rút tiền, kiểm chứng rủi ro, rà soát code và quyết định áp dụng vào project đều do em tự xem xét và chỉnh sửa.

Ví dụ, AI có gợi ý flow rút tiền nhưng em không áp dụng hoàn toàn. Em tự chỉnh lại để giao dịch rút tiền cần nhân viên hoặc admin duyệt trước nhằm tăng bảo mật và phù hợp hơn với hệ thống.
```

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

Đánh dấu các cách đã sử dụng.

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [x] Viết test case
- [x] So sánh với yêu cầu đề bài
- [ ] Đối chiếu với tài liệu môn học
- [x] Review code
- [ ] Hỏi lại giảng viên
- [ ] Tra cứu tài liệu chính thống
- [ ] Thảo luận với thành viên nhóm
- [x] Kiểm tra bằng dữ liệu mẫu
- [x] So sánh trước và sau khi dùng AI
- [x] Khác: Search Google về rủi ro khi làm ví tiền, xem video hướng dẫn YouTube và dùng một AI khác để kiểm chứng

### Mô tả quá trình kiểm chứng

```text
Sau khi nhận kết quả từ AI, em không áp dụng ngay mà kiểm tra lại theo nhiều cách. Với phần ví tiền, em search Google về các rủi ro và lỗi cần tránh khi làm ví tiền trong một hệ thống, xem thêm video hướng dẫn YouTube và dùng một AI khác để kiểm chứng lại. Em cũng dựa trên các rủi ro AI nêu ra như double-spend và race condition để nghĩ thêm test case.

Với phần giao diện, em chạy thử sau khi Cursor chỉnh UI. Khi thấy giao diện khá lag, em tiếp tục kiểm tra và hỏi Codex về nguyên nhân. Sau đó em rà soát code, so sánh trước và sau khi tối ưu để xem giao diện đã chạy mượt hơn chưa.

Việc kiểm chứng giúp em nhận ra rằng kết quả AI chỉ nên dùng làm tài liệu tham khảo, còn quyết định cuối cùng phải dựa trên việc tự kiểm tra, chạy thử và hiểu rõ code của mình.
```

### Ví dụ cụ thể về một lần kiểm chứng

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | Codex gợi ý giao diện bị lag do animation nặng, double scrollbar, polling API vẫn chạy khi tab bị ẩn, ảnh chưa tối ưu và card render lại nhiều |
| Em/nhóm đã kiểm tra bằng cách nào? | Em rà soát lại code giao diện, kiểm tra phần scroll, animation, polling và component card; sau đó áp dụng tối ưu rồi chạy lại project |
| Kết quả kiểm tra | Đúng / Cần chỉnh sửa |
| Em/nhóm đã xử lý tiếp như thế nào? | Em giảm animation nặng, xử lý double scrollbar, giảm polling, dừng polling khi tab bị ẩn, tối ưu ảnh và memo hóa card để giao diện chạy mượt hơn |

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

Ghi lại ít nhất một ví dụ nếu có.

| Nội dung | Mô tả |
|---|---|
| AI đã gợi ý gì? | AI gợi ý flow xử lý ví tiền gồm nạp tiền và rút tiền, trong đó flow rút tiền có thể hiểu theo hướng xử lý tự động |
| Vì sao gợi ý đó sai/chưa phù hợp? | Rút tiền là nghiệp vụ nhạy cảm, liên quan đến tiền, bảo mật và pháp lý. Nếu rút tự động hoàn toàn thì có thể khó kiểm soát giao dịch bất thường hoặc các rủi ro như gian lận, lạm dụng hệ thống |
| Em/nhóm phát hiện bằng cách nào? | Em tự rà soát lại flow, tìm hiểu thêm về rủi ro khi làm ví tiền, search Google, xem hướng dẫn YouTube và kiểm chứng bằng một AI khác |
| Em/nhóm đã sửa như thế nào? | Em chỉnh flow rút tiền để cần nhân viên hoặc admin duyệt trước khi giao dịch rút tiền được xử lý |
| Bài học rút ra | Không nên áp dụng máy móc kết quả AI, đặc biệt với các chức năng liên quan đến tiền và bảo mật. Cần tự kiểm tra, hiểu nghiệp vụ và chỉnh lại cho phù hợp với project |

Nếu không có trường hợp AI gợi ý sai, hãy ghi rõ:

```text
Trong quá trình thực hiện, em/nhóm có ghi nhận trường hợp AI gợi ý chưa hoàn toàn phù hợp ở phần flow rút tiền. Tuy nhiên, em đã kiểm tra lại và chỉnh sửa trước khi áp dụng vào project.
```

---

## 9. Phần đóng góp thật sự của sinh viên/nhóm

Mô tả rõ phần nào là đóng góp chính của sinh viên/nhóm, không phải chỉ copy từ AI.

```text
Đóng góp chính của em là tự triển khai và cải tiến các phần quan trọng trong project, đặc biệt là chức năng ví tiền và tối ưu giao diện.

Ở phần ví tiền, AI chỉ hỗ trợ gợi ý kiến thức cần có, nhưng em là người tự rà soát, chọn phần phù hợp để áp dụng vào project và tự cải tiến flow rút tiền. Em quyết định không để rút tiền tự động mà cần nhân viên hoặc admin duyệt trước để tăng bảo mật và tính pháp lý cho hệ thống.

Ở phần giao diện, AI hỗ trợ tạo giao diện mới, nhưng em vẫn tự kiểm tra, prompt lại và chỉnh sửa để giao diện hợp mắt hơn. Khi giao diện bị lag, em không để AI tự sửa toàn bộ mà dùng AI để tìm nguyên nhân, sau đó tự rà soát code và áp dụng các hướng tối ưu phù hợp.

Ngoài ra, em cũng tự kiểm tra kết quả chạy/test, tự so sánh trước và sau khi dùng AI, tự ghi nhận minh chứng bằng commit, screenshot và video demo. Vì vậy, AI chỉ đóng vai trò hỗ trợ, còn việc hiểu, lựa chọn, kiểm chứng và chịu trách nhiệm với sản phẩm là do em thực hiện.
```

Gợi ý:

- Tự phân tích yêu cầu.
- Tự chọn giải pháp.
- Tự chỉnh sửa code.
- Tự kiểm tra output.
- Tự thiết kế logic.
- Tự sửa lỗi.
- Tự viết báo cáo theo hiểu biết của mình.
- Tự đánh giá ưu/nhược điểm của sản phẩm.
- Tự thuyết trình và giải thích sản phẩm.

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Em đã hiểu project là hệ thống đấu giá nhưng chưa rõ đầy đủ các yêu cầu kỹ thuật của ví tiền | Em hiểu rõ hơn các phần cần có khi làm ví tiền như database, flow, transaction, locking và bảo mật | Hiểu sâu hơn phần nghiệp vụ ví tiền |
| Phân tích bài toán | Chưa nhìn rõ các rủi ro khi xử lý giao dịch tiền | Biết thêm các rủi ro như double-spend, race condition, giao dịch bất thường và yêu cầu kiểm soát rút tiền | Phân tích bài toán cẩn thận hơn |
| Thiết kế giải pháp | Chưa có hướng rõ ràng cho database ví tiền và lịch sử giao dịch | Có hướng thiết kế Wallet, TransactionHistory và flow nạp/rút tiền | Có giải pháp cụ thể hơn để triển khai |
| Code/Implementation | Giao diện cũ chưa đẹp và ví tiền cần thêm định hướng triển khai | Có giao diện mới hiện đại hơn và có hướng triển khai ví tiền rõ hơn | Sản phẩm hoàn thiện hơn về chức năng và UI |
| Debug/Testing | Chưa biết nguyên nhân giao diện mới bị lag | Biết các nguyên nhân như animation nặng, polling nhiều, double scrollbar, ảnh chưa tối ưu và render lại component | Tối ưu giao diện mượt hơn |
| Báo cáo/Thuyết trình | Chưa ghi nhận đầy đủ quá trình sử dụng AI | Có AI Audit Log, Prompt Log, Changelog và Reflection ghi lại quá trình sử dụng AI | Minh bạch hơn trong việc sử dụng AI |
| Làm việc nhóm | Chưa có thông tin ghi nhận chi tiết trong AI Audit Log | Chưa có thông tin ghi nhận chi tiết trong AI Audit Log | Chưa đánh giá được từ dữ liệu hiện có |

---

## 11. Bài học về môn học

Sau bài tập/project này, em/nhóm học được gì về kiến thức môn học?

```text
Sau project này, em học được nhiều kiến thức hơn về phát triển phần mềm thực tế, đặc biệt là khi xây dựng một hệ thống đấu giá có chức năng ví tiền. Em hiểu rằng một chức năng liên quan đến giao dịch tiền không chỉ cần chạy được, mà còn phải chú ý đến bảo mật, tính đúng đắn của dữ liệu, lịch sử giao dịch, transaction, locking và phòng tránh các lỗi như race condition hoặc double-spend.

Em cũng học được rằng thiết kế database rất quan trọng. Với chức năng ví tiền, cần có bảng lưu thông tin ví và bảng lưu lịch sử giao dịch để dễ kiểm tra, truy vết và xử lý khi có lỗi. Ngoài ra, em hiểu thêm rằng flow nghiệp vụ phải phù hợp với thực tế, không nên chỉ làm tự động nếu nghiệp vụ đó cần kiểm soát bởi staff/admin.

Ở phần frontend, em học được cách cải thiện giao diện web đấu giá sao cho dễ dùng hơn và chuyên nghiệp hơn. Đồng thời, em cũng học được rằng giao diện đẹp chưa đủ, mà còn phải tối ưu hiệu năng để người dùng trải nghiệm mượt mà. Các kỹ thuật như giảm animation nặng, tối ưu ảnh, giảm polling và memo hóa component là những kiến thức quan trọng em rút ra được.
```

Gợi ý:

- Kiến thức kỹ thuật đã hiểu rõ hơn.
- Kỹ năng lập trình đã cải thiện.
- Cách thiết kế hệ thống.
- Cách kiểm thử.
- Cách phân tích yêu cầu.
- Cách làm việc nhóm.
- Cách giải quyết lỗi.
- Cách trình bày sản phẩm.
- Cách đọc và hiểu tài liệu kỹ thuật.

---

## 12. Bài học về sử dụng AI có trách nhiệm

Sau bài tập/project này, em/nhóm học được gì về việc sử dụng AI một cách minh bạch, có trách nhiệm?

```text
Em học được rằng AI là công cụ hỗ trợ rất hữu ích nhưng không thể thay thế hoàn toàn việc học và tự làm. Khi sử dụng AI, em cần ghi nhận rõ đã dùng công cụ nào, dùng để làm gì, prompt đã hỏi gì, kết quả AI gợi ý ra sao và phần nào đã được áp dụng vào project.

Em cũng học được rằng không nên copy nguyên kết quả AI rồi nộp mà chưa hiểu hoặc chưa kiểm tra. AI có thể gợi ý thiếu, chưa phù hợp với bối cảnh hoặc tạo ra kết quả nhìn đúng nhưng chưa tối ưu. Ví dụ, AI hỗ trợ làm giao diện đẹp hơn nhưng giao diện lại bị lag, nên em phải tiếp tục kiểm tra và tối ưu lại.

Quan trọng nhất, em hiểu rằng người chịu trách nhiệm cuối cùng với sản phẩm vẫn là sinh viên/nhóm. Vì vậy, cần kiểm chứng kết quả AI bằng cách chạy thử, review code, viết test case, search thêm tài liệu, so sánh với yêu cầu bài và tự chỉnh sửa trước khi sử dụng.
```

Gợi ý:

- Không nên copy nguyên kết quả AI.
- Cần kiểm tra lại mọi kết quả AI.
- Cần hiểu nội dung trước khi nộp.
- Cần ghi nhận việc sử dụng AI.
- Cần biết AI có thể sai.
- Cần tự chịu trách nhiệm với sản phẩm cuối cùng.
- Cần dùng AI như công cụ hỗ trợ học tập, không thay thế hoàn toàn việc học.

---

## 13. Điều em/nhóm sẽ không làm khi sử dụng AI

Đánh dấu các cam kết phù hợp.

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.
- [x] Không dùng AI để tạo nội dung sai lệch hoặc gian lận.
- [x] Không dùng AI thay thế hoàn toàn quá trình học.
- [x] Không bỏ qua yêu cầu, rubric hoặc hướng dẫn của giảng viên.

### Giải thích thêm nếu có

```text
Em sẽ chỉ dùng AI như một công cụ hỗ trợ học tập, gợi ý ý tưởng, giải thích kiến thức, hỗ trợ debug hoặc tối ưu. Em không dùng AI để thay thế toàn bộ quá trình làm bài. Trước khi áp dụng bất kỳ kết quả nào từ AI, em cần kiểm tra lại, hiểu rõ nội dung và chỉnh sửa cho phù hợp với project.
```

---

## 14. Kế hoạch cải thiện lần sau

Lần sau em/nhóm sẽ sử dụng AI tốt hơn bằng cách nào?

```text
Lần sau, em sẽ sử dụng AI tốt hơn bằng cách viết prompt rõ ràng hơn, cung cấp nhiều bối cảnh hơn và yêu cầu AI đưa ra nhiều phương án để so sánh thay vì chỉ một giải pháp. Đối với các chức năng quan trọng như ví tiền, bảo mật hoặc giao dịch, em sẽ yêu cầu AI phân tích ưu điểm, nhược điểm, rủi ro và test case cần kiểm tra.

Em cũng sẽ ghi log prompt thường xuyên hơn, liên kết từng prompt với commit, screenshot hoặc kết quả chạy/test rõ hơn. Sau khi nhận kết quả AI, em sẽ tiếp tục tự kiểm tra kỹ bằng cách chạy thử chương trình, review code, viết test case, so sánh với yêu cầu đề bài và đối chiếu thêm tài liệu nếu cần.

Ngoài ra, em sẽ chia nhỏ câu hỏi cho AI theo từng phần như database, flow, coding, testing, debug và tối ưu thay vì hỏi quá rộng trong một lần. Điều này giúp kết quả AI cụ thể hơn và dễ kiểm chứng hơn.
```

Gợi ý:

- Viết prompt rõ hơn.
- Cung cấp nhiều ngữ cảnh hơn cho AI.
- Không hỏi AI làm toàn bộ bài.
- Tập trung hỏi AI giải thích, gợi ý, review.
- Tự kiểm tra kỹ hơn.
- Ghi log thường xuyên hơn.
- Liên kết log với commit/screenshot rõ hơn.
- Thảo luận với nhóm trước khi áp dụng kết quả AI.
- Đối chiếu kết quả AI với tài liệu môn học.

---

## 15. Tự đánh giá mức độ hoàn thành

Sinh viên/nhóm tự đánh giá theo thang 1-5.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Đã ghi rõ công cụ AI, mục đích sử dụng, prompt, kết quả, phần áp dụng và minh chứng |
| Prompt có mục tiêu rõ ràng | 4 | Prompt khá rõ, đặc biệt là prompt ví tiền và giao diện, nhưng vẫn cần cải thiện để yêu cầu nhiều flow hơn |
| Kiểm chứng kết quả AI | 4 | Đã chạy thử, kiểm tra, search Google, xem YouTube và dùng AI khác kiểm chứng |
| Tự chỉnh sửa/cải tiến | 5 | Đã tự cải tiến flow rút tiền và tự tối ưu giao diện sau khi phát hiện lag |
| Hiểu nội dung đã nộp | 4 | Có thể giải thích các phần AI hỗ trợ và phần tự chỉnh sửa |
| Reflection có chiều sâu | 4 | Đã nêu rõ điểm AI hỗ trợ, hạn chế, cách kiểm chứng và bài học rút ra |
| Sử dụng AI có trách nhiệm | 5 | Không dùng nguyên văn kết quả AI nếu chưa kiểm tra, có ghi nhận minh bạch trong AI Audit Log |

---

## 16. Câu hỏi tự vấn cuối bài

Trả lời ngắn gọn các câu hỏi sau.

### 16.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Có. Em có thể giải thích AI đã hỗ trợ ở phần thiết kế ví tiền, cải thiện giao diện và tối ưu giao diện bị lag. Em cũng có thể nói rõ phần nào em dùng từ AI và phần nào em tự chỉnh sửa, ví dụ flow rút tiền cần nhân viên hoặc admin duyệt.
```

### 16.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Có thể, nhưng sẽ mất nhiều thời gian hơn, đặc biệt là phần xử lý bảo mật và rủi ro của ví tiền. Nếu không có AI, em vẫn có thể tự tìm hiểu tài liệu, xem hướng dẫn và thử nghiệm, nhưng quá trình sẽ chậm hơn.
```

### 16.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Phần thể hiện rõ nhất năng lực thật sự của em là việc tự cải tiến flow rút tiền để cần nhân viên hoặc admin duyệt, thay vì áp dụng máy móc flow AI gợi ý. Ngoài ra, việc tự rà soát và tối ưu giao diện sau khi bị lag cũng thể hiện khả năng kiểm tra và xử lý vấn đề thực tế.
```

### 16.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Em muốn cải thiện thêm kỹ năng thiết kế hệ thống, bảo mật giao dịch, viết test case, tối ưu hiệu năng frontend và cách viết prompt hiệu quả hơn. Em cũng muốn rèn kỹ năng đọc tài liệu kỹ thuật để kiểm chứng kết quả AI tốt hơn.
```

---

## 17. Cam kết Reflection

Em/nhóm cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI và quá trình học tập trong bài tập/project.

Sinh viên/nhóm hiểu rằng:

- AI là công cụ hỗ trợ học tập, không thay thế hoàn toàn năng lực cá nhân.
- Mọi kết quả AI gợi ý cần được kiểm tra trước khi sử dụng.
- Sinh viên/nhóm chịu trách nhiệm với sản phẩm cuối cùng.
- Sinh viên/nhóm cần giải thích được các phần đã nộp.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Hoàng Xuân Anh Tuấn | 1/7/2026 |
