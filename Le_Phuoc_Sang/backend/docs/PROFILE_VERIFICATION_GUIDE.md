# Hướng đi triển khai trang Profile cá nhân cho xác minh CCCD và Verify Gmail

## 1. Mục tiêu của trang Profile

Trang `Profile` cá nhân là nơi người dùng sau khi đăng ký/đăng nhập có thể:

- Xem và cập nhật thông tin cá nhân cơ bản.
- Xác minh danh tính bằng CCCD/CC/Hộ chiếu.
- Xác minh email Gmail để tăng độ tin cậy tài khoản.
- Quản lý trạng thái xác minh của tài khoản trước khi tham gia đấu giá.

Mục tiêu chính là:

1. Tăng độ tin cậy người dùng tham gia đấu giá.
2. Giảm gian lận tài khoản giả.
3. Tạo nền tảng cho các bước bảo mật cao hơn sau này.
4. Dễ bảo trì, dễ sửa lỗi, dễ mở rộng.

---

## 2. Nguyên tắc triển khai tốt nhất

### 2.1. Đi theo kiến trúc rõ ràng

Nên tách thành các lớp sau:

- `Servlet` hoặc `Controller`: nhận request, trả response.
- `Service`: xử lý logic xác minh.
- `DAO/Repository`: thao tác database.
- `Entity`: ánh xạ bảng dữ liệu.
- `Util`: xử lý mail, hash, upload file, OTP.

### 2.2. Không hardcode logic nhạy cảm

Không nên đặt trực tiếp:

- SMTP credentials
- secret keys
- OTP policy
- DB credentials
- trạng thái xác minh

trong code nguồn. Nên đưa vào cấu hình ngoài hoặc biến môi trường.

### 2.3. Xác minh theo từng bước

Không nên bắt người dùng làm tất cả trong một form dài. Nên chia thành:

- Bước 1: cập nhật profile cơ bản
- Bước 2: verify Gmail
- Bước 3: xác minh CCCD
- Bước 4: duyệt trạng thái tài khoản

Điều này giúp UX tốt hơn và dễ debug hơn.

---

## 3. Cấu trúc dữ liệu đề xuất

### 3.1. Bảng `Users`

Nên bổ sung thêm các trường sau:

- `EmailVerified` bit
- `EmailVerifiedAt` datetime2 null
- `IdentityVerified` bit
- `IdentityVerifiedAt` datetime2 null
- `ProfileStatus` varchar hoặc tinyint
- `VerificationLevel` tinyint
- `UpdatedAt` datetime2

### 3.2. Bảng `VerificationTokens`

Dùng để lưu token verify email hoặc token xác minh khác.

Trường đề xuất:

- `TokenId`
- `UserId`
- `TokenHash`
- `TokenType`
- `ExpiresAt`
- `UsedAt`
- `CreatedAt`

### 3.3. Bảng `IdentityDocuments`

Dùng để quản lý hồ sơ CCCD/CC/Hộ chiếu.

Trường đề xuất:

- `DocumentId`
- `UserId`
- `DocumentType`
- `DocumentNumber`
- `FullName`
- `DateOfBirth`
- `FrontImagePath`
- `BackImagePath`
- `SelfieImagePath`
- `Status`
- `ReviewedBy`
- `ReviewedAt`
- `CreatedAt`

### 3.4. Bảng `AuditLogs`

Tiếp tục dùng bảng audit log hiện tại để truy vết:

- đăng ký
- đăng nhập
- gửi email verify
- xác minh thành công/thất bại
- thay đổi hồ sơ
- duyệt CCCD

---

## 4. Quy trình Verify Gmail tốt nhất

### 4.1. Luồng đề xuất

1. Người dùng bấm `Verify Gmail` trong trang Profile.
2. Hệ thống tạo một token ngẫu nhiên ngắn hạn.
3. Lưu **hash của token** vào database, không lưu token plain text.
4. Gửi email chứa link xác minh.
5. User bấm vào link.
6. Backend đối chiếu token hash với database.
7. Nếu hợp lệ và chưa hết hạn, đánh dấu `EmailVerified = true`.
8. Ghi audit log.

### 4.2. Yêu cầu bảo mật

- Token chỉ dùng một lần.
- Token hết hạn sau 10–30 phút.
- Link verify phải là HTTPS.
- Không hiển thị token trong UI.
- Không lưu token plain text trong log.

### 4.3. Gợi ý email template

Nên có nội dung:

- Tên người dùng
- Mục đích xác minh
- Thời hạn hiệu lực
- Link xác minh
- Cảnh báo nếu không thực hiện yêu cầu

---

## 5. Quy trình xác minh CCCD tốt nhất

### 5.1. Mức độ xác minh

Có thể triển khai theo 2 mức:

#### Mức 1 — Xác minh thủ công

Người dùng upload:

- ảnh mặt trước CCCD
- ảnh mặt sau CCCD
- ảnh selfie cầm giấy tờ hoặc chụp khuôn mặt

Admin hoặc hệ thống duyệt thủ công.

#### Mức 2 — Xác minh bán tự động

- OCR đọc số CCCD
- so khớp tên, ngày sinh
- đối chiếu selfie nếu có
- admin duyệt cuối cùng

### 5.2. Dữ liệu nên lưu

- Loại giấy tờ
- Số giấy tờ
- Họ tên
- Ngày sinh
- Trạng thái duyệt
- File ảnh
- Người duyệt
- Thời gian duyệt

### 5.3. Bảo mật ảnh và dữ liệu giấy tờ

Đây là dữ liệu rất nhạy cảm, nên:

- lưu file ngoài public web root
- đặt tên file ngẫu nhiên
- giới hạn kích thước upload
- chỉ cho phép các định dạng an toàn
- kiểm tra MIME type thực tế
- không cho truy cập trực tiếp bằng URL công khai nếu chưa xác thực
- mã hóa/che mask phần số CCCD trong UI khi hiển thị

---

## 6. Trạng thái tài khoản đề xuất

Nên có trạng thái rõ ràng để xử lý logic dễ hơn:

- `PENDING_PROFILE`
- `PENDING_EMAIL_VERIFY`
- `PENDING_IDENTITY_VERIFY`
- `ACTIVE`
- `LOCKED`
- `REJECTED`

### Ý nghĩa

- `PENDING_PROFILE`: mới tạo, chưa hoàn thiện hồ sơ.
- `PENDING_EMAIL_VERIFY`: đã có tài khoản nhưng chưa verify Gmail.
- `PENDING_IDENTITY_VERIFY`: đã verify email nhưng chưa xác minh CCCD.
- `ACTIVE`: đủ điều kiện tham gia đấu giá.
- `LOCKED`: bị khóa do rủi ro hoặc vi phạm.
- `REJECTED`: hồ sơ CCCD không đạt.

---

## 7. Thiết kế Profile page nên có gì

Trang Profile nên có các khối sau:

### 7.1. Thông tin cơ bản

- Họ và tên
- Email
- Số điện thoại
- Ảnh đại diện
- Trạng thái tài khoản

### 7.2. Khối Gmail Verify

- trạng thái email
- nút gửi lại email verify
- thời gian gửi gần nhất
- cảnh báo token hết hạn

### 7.3. Khối CCCD Verify

- trạng thái xác minh
- form upload ảnh giấy tờ
- số CCCD/CC/Hộ chiếu
- ngày sinh
- nút gửi duyệt

### 7.4. Khối bảo mật

- đổi mật khẩu
- đăng xuất khỏi tất cả thiết bị
- lịch sử đăng nhập gần nhất
- cảnh báo đăng nhập bất thường

### 7.5. Khối audit

- lịch sử xác minh
- lịch sử thay đổi thông tin
- trạng thái duyệt gần nhất

---

## 8. Cách làm để sau này sửa lỗi dễ

### 8.1. Tách module rõ ràng

Nên tách:

- `ProfileServlet`
- `EmailVerificationServlet`
- `IdentityVerificationServlet`
- `ProfileService`
- `VerificationService`
- `EmailService`
- `FileStorageService`
- `ProfileRepository`

### 8.2. Dùng DTO riêng

Không nên dùng entity trực tiếp cho form. Nên có:

- `ProfileUpdateRequest`
- `VerifyEmailRequest`
- `IdentityVerificationRequest`

### 8.3. Dùng enum cho trạng thái

Tránh dùng string tự do dễ sai chính tả.

### 8.4. Validate ở service

Không nhồi validation vào JSP.

### 8.5. Audit mọi thay đổi

Mọi hành động nhạy cảm phải được ghi lại.

---

## 9. Thứ tự triển khai khuyến nghị

### Giai đoạn 1

- Hoàn thiện `Profile` page
- Hiển thị thông tin cá nhân
- Cho phép sửa thông tin cơ bản
- Thêm trạng thái email verify và identity verify

### Giai đoạn 2

- Tạo flow verify Gmail bằng token
- Lưu token hash vào DB
- Gửi mail qua SMTP

### Giai đoạn 3

- Upload CCCD an toàn
- Duyệt thủ công hồ sơ
- Audit log đầy đủ

### Giai đoạn 4

- Tích hợp OCR hoặc verify nâng cao
- Khóa tài khoản khi có rủi ro
- Thêm thông báo email khi trạng thái đổi

---

## 10. Đề xuất kỹ thuật để tránh lỗi sau này

- Dùng `Service` trung gian để xử lý nghiệp vụ.
- Không gọi email hoặc file upload trực tiếp từ servlet.
- Tách cấu hình SMTP ra ngoài source code.
- Tách đường dẫn lưu file upload ra ngoài code.
- Viết test cho các case:
  - email verify hợp lệ
  - token hết hạn
  - token đã dùng
  - upload file sai định dạng
  - số CCCD trùng

---

## 11. Kết luận

Nếu mục tiêu của bạn là một trang đấu giá online có độ tin cậy cao, thì `Profile` không chỉ là trang hiển thị thông tin mà phải là trung tâm của:

- xác minh danh tính
- xác minh email
- kiểm soát trạng thái tài khoản
- audit và bảo mật

Hướng đi tốt nhất là làm theo thứ tự:

1. Cấu trúc dữ liệu chuẩn
2. Profile cơ bản
3. Verify Gmail
4. Xác minh CCCD
5. Audit log và trạng thái tài khoản
6. Tối ưu bảo mật và khả năng bảo trì

---

## 12. Gợi ý bước tiếp theo

Khi bắt đầu code, nên làm file theo thứ tự:

1. `Profile.jsp`
2. `ProfileServlet.java`
3. `ProfileService.java`
4. `VerificationToken.java`
5. `VerificationTokenDAO.java`
6. `EmailService.java`
7. `IdentityDocument.java`
8. SQL script cập nhật bảng `Users`

Nếu cần, tôi có thể tiếp tục giúp bạn tạo luôn **bản thiết kế chi tiết + cấu trúc file Java/JSP/SQL** cho trang Profile này.
