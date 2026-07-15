# AI Learning Reflection

## 1. Thông tin chung

| Thông tin | Nội dung |
| --- | --- |
| Môn học | Software Project - SWP391 |
| Lớp / Học kỳ | SE20A11 / SU26 |
| Project | BidZone - Real-time Bidding System |
| Nhóm | Nhóm 03 |
| Sinh viên | Trần Văn Đức - DE191098 |
| Ngày hoàn thành reflection | 15/07/2026 |

## 2. Tóm tắt quá trình sử dụng AI

Trong project BidZone, em sử dụng AI ở ba giai đoạn chính. Đầu tiên, AI hỗ trợ chuyển
bộ giao diện Stitch sang cấu trúc Next.js App Router và đề xuất cách tách component.
Tiếp theo, AI hỗ trợ thiết kế module chat real-time bằng Spring Boot, SQL Server, JWT và
WebSocket. Cuối cùng, AI được dùng để review source, tìm lỗi phân quyền Seller và kiểm
tra thay đổi Git trước khi commit.

AI giúp tăng tốc việc đọc repository lớn, tạo boilerplate và khoanh vùng lỗi. Tuy nhiên,
em không dùng nguyên trạng mọi kết quả. Các gợi ý đều được đối chiếu với source code,
tài liệu framework và kết quả build/test. Những phần không khớp entity, role hoặc API
thực tế được chỉnh sửa trước khi đưa vào project.

## 3. Công cụ AI đã sử dụng

- [x] Claude / Claude Code
- [x] OpenAI Codex
- [ ] ChatGPT
- [ ] Gemini
- [ ] GitHub Copilot
- [ ] Cursor

### Công cụ được sử dụng nhiều nhất

Claude/Claude Code được sử dụng nhiều trong giai đoạn khởi tạo frontend và module chat.
OpenAI Codex được sử dụng cho các tác vụ review repository, sửa lỗi phân quyền, kiểm tra
build và thao tác Git có kiểm soát.

### Lý do lựa chọn

Các công cụ này có khả năng đọc nhiều file, liên hệ lỗi giữa frontend và backend, đề xuất
thay đổi trực tiếp trên source và chạy lệnh kiểm chứng. Điều này phù hợp với project có
nhiều module và cần theo dõi diff/commit rõ ràng.

## 4. AI đã hỗ trợ ở điểm nào?

- [x] Hiểu và phân tích yêu cầu
- [x] Tìm ý tưởng giải pháp
- [x] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code khung/boilerplate
- [x] Debug lỗi
- [x] Review và tối ưu code
- [x] Kiểm thử/build sản phẩm
- [x] Viết tài liệu audit
- [x] Tìm hiểu công nghệ mới

AI hỗ trợ hiệu quả nhất ở việc phân rã một yêu cầu lớn thành các phần nhỏ. Ví dụ, với
tính năng chat, AI tách bài toán thành schema, entity, repository, service, controller,
WebSocket và security. Với lỗi Seller, AI rà từ sidebar, cookie role, Proxy đến quyền API
backend thay vì chỉ sửa phần giao diện nhìn thấy.

## 5. AI có giúp học tốt hơn không?

### Những điểm giúp học tốt hơn

- Em hiểu rõ hơn cách tổ chức Next.js App Router, client component và shell dùng chung.
- Em biết cách phân biệt hiển thị menu với authorization thực tế ở Proxy/backend.
- Em hiểu luồng STOMP WebSocket, JWT interceptor và quyền truy cập hội thoại.
- Em hình thành thói quen đọc diff, chạy lint/build và chỉ stage file đúng phạm vi.
- Em biết viết prompt có bối cảnh, ràng buộc và tiêu chí kiểm chứng cụ thể.

### Những điểm AI chưa làm tốt

- AI không tự biết đầy đủ entity, method và convention của repository nếu prompt không
  cung cấp đủ ngữ cảnh.
- Code sinh ra có thể compile nhưng vẫn sai logic nghiệp vụ, đặc biệt với role và quyền.
- Giải pháp đầu tiên đôi khi rộng hoặc phức tạp hơn mức cần thiết.
- AI có thể mô tả một bước test là thành công nếu người dùng không yêu cầu bằng chứng
  đầu ra rõ ràng.
- Khi thao tác Git, yêu cầu mơ hồ có thể dẫn đến cách hiểu khác nhau về branch cần giữ.

### Mức độ phụ thuộc

- [ ] Không phụ thuộc
- [x] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

Em sử dụng AI để tăng tốc phân tích và viết phần khung, nhưng vẫn tự xác nhận yêu cầu,
đọc code, quyết định thay đổi và kiểm tra kết quả. Khi AI đưa tên method hoặc rule không
khớp, em có thể tìm trong repository và điều chỉnh thay vì tiếp tục copy kết quả.

## 6. Quá trình kiểm chứng kết quả AI

- [x] Chạy thử chương trình
- [x] Kiểm tra output và log build
- [x] So sánh với yêu cầu nghiệp vụ
- [x] Review source code và Git diff
- [x] Tra cứu tài liệu framework đi kèm project
- [x] Kiểm tra bằng tài khoản/role khác nhau
- [x] Đối chiếu frontend API với backend controller
- [x] Chỉ commit khi lint/build đạt

Quy trình kiểm chứng thường gồm: xác định file liên quan bằng tìm kiếm source, đọc quy
tắc của repository, kiểm tra tài liệu chính thức, tạo thay đổi nhỏ, xem `git diff`, chạy
lint/build/test và xác nhận commit chỉ chứa file thuộc yêu cầu. Với thay đổi có liên quan
Git remote, em kiểm tra SHA local/remote sau khi push.

### Ví dụ cụ thể

| Nội dung | Mô tả |
| --- | --- |
| AI gợi ý | Cho Seller dùng các route của Collector bằng cách sửa Next.js Proxy |
| Cách kiểm tra | Đọc `CollectorSidebar.tsx`, `proxy.ts`, `SecurityConfig.java`; chạy ESLint và production build |
| Kết quả | Nguyên nhân đúng nhưng cần đổi mô hình từ một role sang nhiều role được phép |
| Xử lý | Tạo danh sách route chung, giữ route riêng Seller/Admin/Staff và commit `1a90853` |

## 7. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
| --- | --- |
| Gợi ý chưa phù hợp | Code chat ban đầu giả định một số tên method/kiểu ID không đúng với `UserDetailsImpl` và entity hiện có |
| Vì sao chưa phù hợp | AI chỉ có mô tả yêu cầu, chưa đọc đầy đủ implementation thực tế khi sinh phần khung |
| Cách phát hiện | Compiler, tìm kiếm method trong repository và review controller/service |
| Cách sửa | Dùng đúng package, method, kiểu ID; điều chỉnh query và quyền người gửi |
| Bài học | Luôn cung cấp context thật và build sau khi tích hợp code AI |

Một ví dụ khác là Proxy cũ vẫn build thành công dù Seller bị redirect sai. Điều này cho
thấy kiểm tra cú pháp/TypeScript không thay thế được kiểm thử nghiệp vụ theo role.

## 8. Đóng góp thật sự của sinh viên

- Xác nhận và làm rõ yêu cầu nghiệp vụ với các vai trò User, Seller, Staff và Admin.
- Chọn cấu trúc phù hợp từ đề xuất AI thay vì áp dụng toàn bộ một cách máy móc.
- Tích hợp code vào entity, API và cấu trúc package đang tồn tại.
- Điều chỉnh UI, route, component, query và security theo source thật.
- Chạy chương trình, đọc lỗi, kiểm tra role và sửa các vấn đề phát sinh.
- Quản lý diff, commit và branch; bảo vệ file local/secret không đưa nhầm lên Git.
- Giải thích được lý do kỹ thuật của các thay đổi đã commit.

## 9. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện |
| --- | --- | --- | --- |
| Hiểu yêu cầu | Dễ tập trung vào màn hình đơn lẻ | Phân tích theo luồng và vai trò | Giảm bỏ sót route/quyền |
| Thiết kế frontend | HTML rời từ Stitch | App Router và component dùng chung | Dễ bảo trì hơn |
| Thiết kế backend | Chưa rõ đầy đủ luồng chat | Layered architecture và WebSocket flow | Có cấu trúc triển khai rõ |
| Debug | Tìm lỗi theo biểu hiện | Rà UI, Proxy, API và dữ liệu | Khoanh vùng nhanh hơn |
| Kiểm thử | Chủ yếu chạy thủ công | Kết hợp lint, build, diff và role test | Kết quả có bằng chứng hơn |
| Git | Dễ nhầm phạm vi branch/file | Kiểm tra SHA, stage theo path | Giảm nguy cơ push nhầm |
| Tài liệu | Ghi chép rời rạc | Liên kết prompt, quyết định và commit | Minh bạch hơn |

## 10. Bài học về môn học

Project giúp em hiểu rằng xây dựng phần mềm không chỉ là viết từng màn hình hay endpoint.
Một chức năng hoàn chỉnh cần sự thống nhất giữa database, entity, service, controller,
authentication, frontend state và authorization. Các lỗi khó thường xuất hiện tại ranh
giới giữa các tầng, ví dụ menu hiển thị đúng nhưng Proxy chặn sai hoặc API đúng nhưng
frontend gọi sai endpoint.

Em cũng cải thiện kỹ năng đọc code của người khác, tìm kiếm trong repository, chia thay
đổi thành commit nhỏ, kiểm tra build và bảo vệ cấu hình nhạy cảm. Đây là các kỹ năng quan
trọng khi làm việc nhóm trên một repository chung.

## 11. Bài học về sử dụng AI có trách nhiệm

- Không nộp code AI nếu chưa đọc và hiểu.
- Không coi AI là nguồn sự thật duy nhất; phải đối chiếu tài liệu và source thực tế.
- Ghi lại prompt quan trọng, phần đã áp dụng và phần tự chỉnh sửa.
- Không tuyên bố test thành công nếu chưa chạy và lưu kết quả kiểm chứng.
- Không để AI tự ý đưa secret, file local hoặc thay đổi ngoài phạm vi vào commit.
- Con người chịu trách nhiệm cuối cùng với nghiệp vụ, bảo mật và sản phẩm đã nộp.

## 12. Điều sẽ không làm khi sử dụng AI

- [x] Không dùng AI làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc dùng AI trong phần quan trọng.
- [x] Không dùng AI để tạo dữ liệu hoặc minh chứng sai lệch.
- [x] Không bỏ qua rubric và yêu cầu của giảng viên.
- [x] Không commit secret, cấu hình local hoặc file build do AI phát hiện.
- [x] Không force-push/reset branch nếu yêu cầu và phạm vi chưa rõ.

## 13. Kế hoạch cải thiện lần sau

- Ghi Prompt Log ngay khi sử dụng thay vì tổng hợp vào cuối giai đoạn.
- Cung cấp version framework, file liên quan và expected behavior ngay trong prompt.
- Xây dựng ma trận role-route và test tự động cho authorization.
- Bổ sung unit/integration test cho service và Proxy thay vì chỉ dựa vào build.
- Chia commit theo một mục tiêu, thêm link commit/screenshot vào audit log sớm.
- Yêu cầu AI phân biệt rõ dữ kiện đã xác minh và suy luận.
- Thảo luận thay đổi branch với nhóm trước các thao tác có thể viết lại lịch sử.

## 14. Tự đánh giá mức độ hoàn thành

| Tiêu chí | Điểm (1-5) | Ghi chú |
| --- | :---: | --- |
| Ghi nhận việc dùng AI trung thực | 5 | Có prompt, công cụ và commit minh chứng |
| Prompt có mục tiêu rõ ràng | 4 | Một số prompt ban đầu còn ngắn |
| Kiểm chứng kết quả AI | 4 | Có lint/build/review; cần thêm test tự động |
| Tự chỉnh sửa và cải tiến | 5 | Điều chỉnh theo source và nghiệp vụ thật |
| Hiểu nội dung đã nộp | 4 | Có thể giải thích các thay đổi chính |
| Reflection có chiều sâu | 4 | Nêu cả lợi ích, hạn chế và ví dụ cụ thể |
| Sử dụng AI có trách nhiệm | 5 | Không đưa secret/file ngoài phạm vi vào commit |

## 15. Câu hỏi tự vấn cuối bài

### Nếu giảng viên hỏi về phần AI hỗ trợ, em có giải thích lại được không?

Có. Em có thể chỉ ra prompt, file, diff và commit tương ứng; đồng thời giải thích vì sao
chọn hoặc sửa từng gợi ý của AI.

### Nếu không có AI, em có thể tự làm lại phần quan trọng nhất không?

Có, nhưng sẽ mất nhiều thời gian hơn để tra tài liệu và viết boilerplate. Em có thể tự
thiết kế component, API và sửa Proxy bằng cách đọc documentation, debug và kiểm thử.

### Phần nào thể hiện rõ nhất năng lực thật sự?

Khả năng tích hợp nhiều tầng và kiểm chứng kết quả: điều chỉnh code theo repository thật,
xử lý role/authorization, chạy build, quản lý diff và giữ commit đúng phạm vi.

### Kỹ năng muốn cải thiện sau project?

Em muốn cải thiện automated testing cho authorization/WebSocket, thiết kế database ở
quy mô lớn, quan sát hệ thống production và quy trình Git nhiều nhánh trong nhóm.

## 16. Cam kết Reflection

Em cam kết nội dung reflection phản ánh trung thực quá trình sử dụng AI. AI là công cụ hỗ
trợ; em chịu trách nhiệm về việc kiểm tra, chỉnh sửa và giải thích sản phẩm cuối cùng.

| Sinh viên | MSSV | Ngày xác nhận |
| --- | --- | --- |
| Trần Văn Đức | DE191098 | 15/07/2026 |
