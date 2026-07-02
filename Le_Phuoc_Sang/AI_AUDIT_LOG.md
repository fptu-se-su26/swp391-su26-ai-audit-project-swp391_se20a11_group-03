# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học |Software development project | 
| Mã môn học |SWP391 |
| Lớp |SE20A11 |
| Học kỳ |Summer 2026  |
| Tên bài tập / Project |Realtime Bidding System  |
| Tên sinh viên / Nhóm |Lê Phước Sang - Nhóm 3 |
| MSSV / Danh sách MSSV |DE190062 |
| Giảng viên hướng dẫn |Lê Thiện Nhật Quang |
| Ngày bắt đầu |18/05/2026 |
| Ngày hoàn thành |12/07/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [x] ChatGPT
- [ ] Gemini
- [x] Claude
- [x] GitHub Copilot
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
Viết tại đây...
AI được sử dụng để hỗ trợ quá trình phát triển hệ thống đấu giá trực tuyến, bao gồm phân tích yêu cầu, thiết kế giao diện, kiểm tra lỗi, cải thiện bảo mật, thiết kế flow eKYC, hỗ trợ tích hợp OCR FPT.AI, xây dựng dashboard, xử lý phân quyền người dùng và tối ưu trải nghiệm người dùng.

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.  
> Sinh viên/nhóm có thể nhân bản mẫu “Lần sử dụng AI” nhiều lần tùy theo số lần sử dụng AI thực tế.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  | 08/06/2026
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác | Cursor
| Mục đích sử dụng |  | Phần việc liên quan
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung | Hỗ trợ nhiều

#### 4.1. Prompt đã sử dụng

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
Bạn là chuyên gia thiết kế UX/UI có 20 năm kinh nghiệm. Sử dụng mẫu hình tôi gửi và design trang đăng nhập/đăng ký tài khoản hiện đại, tối giản nhưng đẹp.

Bạn là Senior UI/UX Designer + Frontend Engineer chuyên thiết kế website marketplace cao cấp. Hãy redesign giao diện Web Đấu Giá Online “LuxeAuction” dựa trên giao diện hiện tại: navbar trắng, hero nền xanh đậm, sản phẩm đấu giá nổi bật là đồng hồ luxury, các tab Live Auctions / Upcoming / Results / Sell, ô search, icon thông báo, yêu thích và avatar người dùng.

```

#### 4.2. Kết quả AI gợi ý

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
Viết tại đây...
- Màu chủ đạo navy, charcoal, off-white, champagne gold.
- Navbar sticky, search bar rõ ràng, icon đồng bộ.
- Hero section 2 cột gồm thông điệp thương hiệu và featured lot card.
- Card sản phẩm có ảnh lớn, countdown, current bid, badge verified/live auction.
- Grid live auctions có filter, category tab, responsive layout.
- Typography lớn, tối giản nhưng sang trọng.
- CTA rõ ràng: Browse Live Lots, How Bidding Works, Place Bid.
```
#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Mô tả rõ phần nào được sử dụng lại từ gợi ý của AI.

```text
Viết tại đây...
- Cấu trúc homepage.
- Phong cách visual luxury.
- Thiết kế hero section.
- Thiết kế auction card.
- Header/navigation.
- Notification menu.
- Responsive grid cho auction lots.  
```


#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với gợi ý ban đầu của AI.

```text
Viết tại đây...
- Điều chỉnh lại bố cục để phù hợp với project hiện tại.
- Sửa lỗi CSS/Tailwind khi giao diện ban đầu bị render như HTML mặc định.
- Kiểm tra responsive trên localhost.
- Tinh chỉnh màu sắc, spacing, font weight, hover state.
- Thêm demo data phù hợp với auction luxury.
- Điều chỉnh notification icon và menu để tương thích với hệ thống user hiện tại.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | ea07ec3 feat: redesign luxury UI and harden KYC flow |
| File liên quan | src/frontend/src/components/home/Header.tsx |
| Screenshot |  |
| Kết quả chạy/test | Chạy frontend local tại `http://localhost:3000`, kiểm tra HTTP trả `200`    |
| Link video demo |  |
| Ghi chú khác | Giao diện được kiểm tra bằng browser local và chỉnh nhiều lần theo feedback trực tiếp  |

#### 4.6. Nhận xét cá nhân/nhóm

Sinh viên/nhóm học được gì sau lần sử dụng AI này?

```text
Viết tại đây...
Qua lần sử dụng AI này, em học được cách chuyển yêu cầu UI/UX mô tả bằng ngôn ngữ tự nhiên thành layout component-based trong React. Tuy nhiên, AI chỉ đưa ra concept và code gợi ý; em vẫn phải kiểm tra giao diện thực tế, sửa lỗi Tailwind, điều chỉnh màu sắc và đảm bảo không phá logic hiện tại của project.
```

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 10/06/2026 - 15/06/2026 |
| Công cụ AI | ChatGPT / Claude / GitHub Copilot / Cursor |
| Mục đích sử dụng | Redesign dashboard và trang đăng sản phẩm  |
| Phần việc liên quan | Frontend, UX/UI, Component Design |
| Mức độ sử dụng | AI hỗ trợ nhiều, sinh viên chỉnh sửa theo project |

#### 4.1. Prompt đã sử dụng

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
Bạn là Senior UI/UX Designer + Frontend Engineer chuyên thiết kế web đấu giá cao cấp.
Hãy redesign trang /post-item của LuxeAuction dựa trên giao diện hiện tại: sidebar Collector bên trái, menu tài khoản, nút nạp tiền, khu vực chính hiển thị “Yêu cầu đăng nhập”, và nút chat nổi.

Hãy redesign toàn bộ các trang Dashboard của LuxeAuction để đồng bộ với homepage luxury và trang /post-item đã thiết kế trước đó.
Các trang cần chỉnh: Dashboard tổng quan, Phiên đấu giá của tôi, Tin nhắn, Danh sách theo dõi, Đăng sản phẩm, Ví đấu giá, Cài đặt tài khoản, Trung tâm hỗ trợ.

```

#### 4.2. Kết quả AI gợi ý

```text
Viết tại đây...
- Dashboard layout có sidebar cố định.
- Collector user card với avatar, role, badge verified.
- Menu gồm Dashboard, My Auctions, Messages, Watchlist, Post Item, Wallet, Settings.
- Card thống kê: số phiên đang tham gia, tổng giá trị bid, sản phẩm theo dõi, tin nhắn mới.
- Các component dùng chung: DashboardLayout, Sidebar, DashboardHeader, StatCard, AuctionCard, DataTable, EmptyState, LoadingSkeleton, WalletCard, MessagePanel, SettingsForm.
- Trang post-item có seller onboarding, benefit, quy trình 3 bước và gate KYC.

```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Viết tại đây...
- Ý tưởng dashboard luxury thay vì admin dashboard mặc định.
- Sidebar collector.
- Seller access required block.
- Floating support button.
- Empty state/loading state.
- Layout dashboard component-based.

```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
- Điều chỉnh menu phù hợp role Collector/Seller/Staff.
- Kết nối lại các route hiện có như `/dashboard`, `/post-item`, `/seller/apply`.
- Giữ logic KYC gate hiện tại, không cho user chưa KYC đăng sản phẩm.
- Giảm bớt các chi tiết visual quá phức tạp để tránh rối.
- Tối ưu responsive cho desktop/tablet/mobile.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan | src/frontend/src/components/dashboard/` và `src/frontend/src/app/post-item/page.tsx` |
| Screenshot |  |
| Kết quả chạy/test | Chạy `npx tsc --noEmit`, chạy local `http://localhost:3000`  |
| Link video demo |  |
| Ghi chú khác | Có kiểm tra giao diện trực tiếp qua browser local  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
Em học được cách tách một dashboard lớn thành các component nhỏ, dễ bảo trì. AI giúp gợi ý cấu trúc component và visual style, nhưng em phải tự kiểm tra route, trạng thái đăng nhập/KYC và đảm bảo giao diện không phá logic business hiện tại.
```

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 16/06/2026 - 20/06/2026  |
| Công cụ AI | ChatGPT/Codex, Cursor |
| Mục đích sử dụng | Phân tích lỗi nghiêm trọng trong phần eKYC và sửa bảo mật |
| Phần việc liên quan | Backend, Security, KYC, Debug |
| Mức độ sử dụng | AI hỗ trợ nhiều, sinh viên kiểm tra và quyết định chỉnh sửa  |

#### 4.1. Prompt đã sử dụng

```text
Dán nguyên văn prompt đã hỏi AI tại đây.
Bạn là chuyên gia phân tích dữ liệu code 20 năm kinh nghiệm hãy đọc file code trên và đưa ra những lỗi sai của phần xác minh eKYC.

Xem phần kyc đang có lỗi gì nghiêm trọng không.

Sửa lại code cho chuẩn nhất và an toàn nhất, và có thể update hoặc edit dễ dàng quản lí tốt hơn trong tương lai.

```

#### 4.2. Kết quả AI gợi ý

```text
Viết tại đây...
- Ảnh KYC cần được lưu ở vùng private, không public qua static resource.
- Cần có endpoint lấy ảnh KYC có kiểm tra quyền owner/staff/admin.
- Cần kiểm tra định dạng ảnh, dung lượng, pixel và nguy cơ file giả mạo.
- Cần tránh cho user thay thế hồ sơ đang pending/approved.
- Staff duyệt KYC cần có trạng thái approve/reject/request-info.
- Khi KYC approved cần cập nhật `Users.IdentityVerified`, `IdentityVerifiedAt`, `ProfileStatus`.
- Cần kiểm tra forensic/integrity ảnh trước khi approve.

```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Viết tại đây...
- `KycDocumentStorage` lưu ảnh private.
- `KycDocumentValidator` kiểm tra file upload.
- `ProtectedKycImage` frontend fetch ảnh qua API có auth.
- `KycController` có endpoint submit, myLatest, list, document, approve, reject, request-info.
- `KycService` xử lý business logic và update user verification.
- `KycGuard` dùng để chặn các thao tác nhạy cảm nếu chưa KYC.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Viết tại đây...
- Kiểm tra lại flow KYC bằng dữ liệu demo.
- Chỉnh lại UI trang KYC nhiều lần để phù hợp yêu cầu thực tế.
- Tách flow thành 3 trang/màn rõ ràng: scan CCCD, review OCR, chờ duyệt.
- Bỏ bước selfie cầm CCCD theo yêu cầu nghiệp vụ mới.
- Giữ staff approval để đảm bảo AI OCR không tự động xác minh hoàn toàn.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | 'ea07ec3 feat: redesign luxury UI and harden KYC flow` |
| File liên quan | `KycController.java`, `KycService.java`, `KycDocumentStorage.java`, `ProtectedKycImage.tsx`, `app/kyc/page.tsx`, `staff/kyc-review/page.tsx` |
| Screenshot |  |
| Kết quả chạy/test | `npx tsc --noEmit` pass; `.\mvnw.cmd -DskipTests compile` pass; `/kyc` trả HTTP `200` |
| Link video demo |  |
| Ghi chú khác |  |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Viết tại đây...
Em học được rằng phần eKYC không chỉ là upload ảnh mà còn liên quan đến bảo mật file, phân quyền truy cập, trạng thái hồ sơ, audit trail và quy trình staff duyệt. AI giúp chỉ ra rủi ro, nhưng em phải kiểm tra lại code, chạy compile và đảm bảo flow phù hợp với project.
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  |  | x |  |  |
| Viết user story/use case |  | x |  |  |  |
| Thiết kế database |  |  |  | x |  |
| Thiết kế kiến trúc hệ thống |  |  |  | x |  |
| Thiết kế giao diện |  |  |  | x |  |
| Code frontend |  |  |  | x |  |
| Code backend |  |  | x |  |  |
| Debug lỗi |  |  | x |  |  |
| Viết test case |  |  | x |  |  |
| Kiểm thử sản phẩm |  | x |  |  |  |
| Tối ưu code |  |  | x |  |  |
| Viết báo cáo |  | x |  |  |  |
| Làm slide thuyết trình | x |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Một số đoạn UI ban đầu quá phức tạp, nhiều hiệu ứng, không phù hợp yêu cầu “đơn giản đẹp mắt” | Kiểm tra trực tiếp trên `/kyc`, user feedback  | Thiết kế lại KYC UI tối giản hơn, bỏ background/animation nặng  |
| 2 | Text tiếng Việt trong một số file bị lỗi encoding/mojibake  | Mở file và thấy ký tự tiếng Việt bị vỡ | Viết lại file bằng UTF-8, thay text bị lỗi |
| 3 | AI gợi ý tích hợp OCR nhưng cần phân biệt demo mode và real backend  | Khi backend/database chưa chạy vẫn cần test frontend | Thêm demo OCR trong `kycService.ts`, real OCR chạy qua backend khi có `FPT_AI_API_KEY`  |

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
- Frontend TypeScript: npx tsc --noEmit -> pass.
- Backend: .\mvnw.cmd -DskipTests compile -> BUILD SUCCESS.
- Local frontend: http://localhost:3000 -> HTTP 200.
- KYC route: http://localhost:3000/kyc -> HTTP 200.
- UI được kiểm tra trực tiếp qua browser local và chỉnh theo feedback.
- Backend chưa kết nối SQL Server trong một số lần test, vì vậy frontend sử dụng demo mode để kiểm tra UX.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

Mô tả phần sinh viên tự làm, phần AI hỗ trợ và phần đã tự cải tiến.

```text
Viết tại đây...
Sinh viên Lê Phước Sang phụ trách nhiều phần liên quan đến frontend UI/UX, dashboard, KYC/eKYC, seller onboarding, staff approval và debug local. AI hỗ trợ phân tích, gợi ý giải pháp, tạo code mẫu và kiểm tra lỗi. Sinh viên tự kiểm tra, chỉnh sửa, chạy local, xử lý lỗi phát sinh, điều chỉnh giao diện theo feedback và đảm bảo code phù hợp với project hiện tại.
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
Viết tại đây...
AI hỗ trợ em trong việc phân tích yêu cầu, gợi ý giao diện, phát hiện lỗi bảo mật, thiết kế flow KYC, tạo cấu trúc component, refactor code và debug local. AI đặc biệt hữu ích khi cần rà soát code nhiều file, đề xuất cách xử lý phân quyền và thiết kế flow eKYC có OCR FPT.AI.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Viết tại đây...
Một số gợi ý UI quá phức tạp, nhiều hiệu ứng và không phù hợp với mong muốn cuối cùng là đơn giản, rõ ràng. Em đã bỏ bớt animation, background phức tạp và panel phụ. Ngoài ra, em không để OCR tự động approve KYC vì cần staff kiểm tra để đảm bảo an toàn và tránh sai sót từ AI/OCR.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Viết tại đây...
Em kiểm tra bằng cách đọc lại code, chạy TypeScript compile, chạy Maven compile, chạy local trên localhost, kiểm tra các route chính, test demo mode, quan sát UI thực tế và chỉnh theo feedback. Với phần bảo mật, em kiểm tra lại phân quyền ở controller/service và tránh public ảnh KYC.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Viết tại đây...
Phần khó khăn nhất là rà soát nhiều file để tìm lỗi bảo mật trong KYC/seller role, thiết kế flow eKYC hợp lý và redesign UI/UX đồng bộ toàn hệ thống. Nếu không có AI, thời gian phân tích, thử nghiệm layout và debug sẽ lâu hơn đáng kể.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Viết tại đây...
Em học được cách xây dựng một hệ thống web có nhiều vai trò người dùng, phân quyền rõ ràng, có workflow nghiệp vụ như đấu giá, đăng sản phẩm, xác minh KYC, duyệt seller và staff review. Em cũng hiểu hơn về cách tổ chức code theo controller/service/dto, component-based frontend và kiểm thử trước khi bàn giao.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Viết tại đây...
Em học được rằng AI chỉ nên được dùng như công cụ hỗ trợ. Không nên copy nguyên văn hoặc tin hoàn toàn vào code AI sinh ra. Cần kiểm tra lại bằng compile, chạy local, review bảo mật và hiểu rõ phần mình nộp. Đặc biệt với các phần nhạy cảm như KYC, phân quyền, API key và thông tin cá nhân, phải ưu tiên bảo mật và không hard-code dữ liệu bí mật.
```

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
| Lê Phước Sang - DE190062  | 02/07/2026  |
