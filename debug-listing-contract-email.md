[OPEN] Debug session: listing-contract-email

# Muc tieu
- Xac dinh vi sao mail listing contract khong den duoc 2 dia chi da cau hinh.

# Trieu chung
- User approve/reject thanh cong tren giao dien.
- User khong nhan duoc mail listing contract.

# Gia thuyet
- SMTP auth that bai hoac Gmail chan dang nhap.
- PDF contract generate loi truoc khi gui mail.
- Email send bi exception nhung dang chi log warning.
- Thu duoc gui nhung roi vao spam/bi chan boi nha cung cap.
- Luong approve khong di den doan gui contract do loi du lieu/runtime.

# Ke hoach
- Doc cau hinh va them instrumentation log toi thieu quanh luong tao PDF va gui email.
- Chay reproduce co thu thap log runtime.
- Xac nhan gia thuyet nao dung roi moi sua logic toi thieu.

# Bang chung
- Process dang giu cong 8080 la `java.exe` chay `com.swp391.Swp391Application` voi classpath tro toi `Pham_Manh_Thang\\target\\classes`.
- `src/main/resources/application.properties` va `target/classes/application.properties` deu dang dat:
  - `spring.mail.username=your-email@gmail.com`
  - `spring.mail.password=your-app-password`
- Endpoint `http://localhost:8080/admin/products/pending` tra ve 200, nen instance dang test la app cua project hien tai.

# Danh gia gia thuyet
- SMTP auth that bai hoac Gmail chan dang nhap: rat co kha nang dung.
- PDF contract generate loi truoc khi gui mail: chua co bang chung xac nhan.
- Email send bi exception nhung dang chi log warning: co kha nang dung, phu hop voi code hien tai.
- Thu duoc gui nhung roi vao spam/bi chan boi nha cung cap: it kha nang hon vi sender credentials dang la placeholder.
- Luong approve khong di den doan gui contract do loi du lieu/runtime: chua co bang chung xac nhan.
