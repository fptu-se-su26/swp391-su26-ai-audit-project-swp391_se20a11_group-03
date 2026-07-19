# Runbook deploy BidZone — bidzone.io.vn

Giá trị đã chốt cho lần deploy này:

- VPS IP: `43.156.57.203`
- Domain frontend: `bidzone.io.vn` (Vercel)
- Subdomain backend: `api.bidzone.io.vn` (VPS, Nginx + Certbot)

Làm theo đúng thứ tự 3 phần. Phần 1 làm trên trang quản trị DNS iNET, Phần 2 chạy trên VPS (SSH), Phần 3 làm trên vercel.com.

---

## Phần 1 — Trỏ DNS (làm ở iNET)

Vào trang quản trị DNS của `bidzone.io.vn` tại iNET, tạo bản ghi:

| Loại | Host/Name | Value | TTL |
|------|-----------|-------|-----|
| A    | `api`     | `43.156.57.203` | 300 (hoặc mặc định) |

Chờ vài phút rồi kiểm tra đã lan truyền chưa:

```bash
nslookup api.bidzone.io.vn
# hoặc
ping api.bidzone.io.vn
```

Phải thấy trả về đúng `43.156.57.203` trước khi qua Phần 2 (Certbot cần DNS đã trỏ đúng thì mới xin được chứng chỉ).

---

## Phần 2 — Backend trên VPS (chạy qua SSH)

SSH vào VPS trước:

```bash
ssh <user>@43.156.57.203
```

### 2.1 Kiểm tra công cụ đã cài

```bash
docker --version
docker compose version
nginx -v
certbot --version
```

Nếu thiếu Certbot, cài kèm plugin Nginx:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 2.2 Clone code (nếu VPS chưa có) và tạo file env

```bash
git clone <URL_GITHUB_REPO_CUA_BAN> bidzone
cd bidzone
cp deploy/vps/backend.env.example deploy/vps/backend.env
nano deploy/vps/backend.env
```

Trong file `backend.env`, điền các giá trị sau (thay `CHANGE_ME`):

```text
SUPABASE_DB_URL=jdbc:postgresql://aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
SUPABASE_DB_USER=postgres.kbkbfkjwhovqobypijrb
SUPABASE_DB_PASSWORD=<mật khẩu Supabase của bạn>
APP_JWT_SECRET=<chuỗi random ít nhất 32 ký tự, xem lệnh gen bên dưới>

APP_CORS_ALLOWED_ORIGINS=https://bidzone.io.vn,https://www.bidzone.io.vn
APP_CORS_ALLOWED_ORIGIN_PATTERNS=
APP_FRONTEND_BASE_URL=https://bidzone.io.vn
APP_FRAUD_DEVICE_HASH_SALT=<chuỗi random khác>

GOOGLE_CLIENT_ID=722496917683-ff6vgr1m0m84k8abuo0ejtssthfmviu2.apps.googleusercontent.com

MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_USERNAME=<email gmail dùng gửi mail>
MAIL_PASSWORD=<app password gmail, không phải mật khẩu đăng nhập>
MAIL_FROM=<thường trùng MAIL_USERNAME>

GROQ_API_KEY=<key Groq của bạn>
CLOUDINARY_CLOUD_NAME=<...>
CLOUDINARY_API_KEY=<...>
CLOUDINARY_API_SECRET=<...>

SEPAY_BANK_ID=<...>
SEPAY_BANK_ACCOUNT=<...>
SEPAY_ACCOUNT_NAME=<...>
SEPAY_WEBHOOK_API_KEY=<...>
```

Lệnh tạo nhanh 2 chuỗi random cho `APP_JWT_SECRET` và `APP_FRAUD_DEVICE_HASH_SALT`:

```bash
openssl rand -base64 48
openssl rand -base64 32
```

Lưu file (Ctrl+O, Enter, Ctrl+X trong nano). **Không commit file này.**

### 2.3 Build & chạy backend

```bash
docker compose -f deploy/vps/docker-compose.yml up -d --build
docker compose -f deploy/vps/docker-compose.yml logs -f backend
```

Nhấn Ctrl+C để thoát xem log khi thấy backend đã start xong (Tomcat/Spring Boot khởi động thành công, không có exception).

Kiểm tra backend chỉ nghe ở loopback:

```bash
curl -i http://127.0.0.1:8096/api/products
```

Phải trả về JSON (200), không lỗi connection refused.

### 2.4 Bật HTTP tạm cho subdomain (để Certbot xác minh)

```bash
sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
sudo cp deploy/vps/nginx-http-bootstrap.conf /etc/nginx/sites-available/bidzone-api
sudo ln -sfn /etc/nginx/sites-available/bidzone-api /etc/nginx/sites-enabled/bidzone-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 2.5 Xin chứng chỉ Let's Encrypt cho api.bidzone.io.vn

```bash
sudo certbot certonly --webroot \
  --webroot-path /var/www/letsencrypt \
  -d api.bidzone.io.vn
```

Nếu thành công, chứng chỉ nằm ở `/etc/letsencrypt/live/api.bidzone.io.vn/`.

### 2.6 Bật Nginx HTTPS reverse proxy

```bash
sed "s/API_DOMAIN/api.bidzone.io.vn/g" deploy/vps/nginx-https-domain.conf.template \
  | sudo tee /etc/nginx/sites-available/bidzone-api >/dev/null
sudo nginx -t
sudo systemctl reload nginx
```

### 2.7 Bật auto-renew (chứng chỉ thường 90 ngày, renew tự động khi còn ~30 ngày)

```bash
sudo systemctl enable --now certbot.timer
sudo certbot renew --dry-run
```

(Nếu hệ thống cài Certbot qua Snap thì timer tên `snap.certbot.renew.timer` — kiểm tra bằng `systemctl list-timers | grep certbot`.)

### 2.8 Kiểm tra public API

```bash
curl -i https://api.bidzone.io.vn/api/products
```

Phải trả 200 JSON, chứng chỉ hợp lệ (không cần `-k`).

---

## Phần 3 — Frontend trên Vercel

1. Vào https://vercel.com → **Add New > Project** → import repo GitHub `bidzone`.
2. **Root Directory**: `src/frontend`.
3. Framework Preset: **Next.js** (Vercel tự nhận build/output command).
4. Trước khi bấm Deploy, vào **Environment Variables**, thêm (áp dụng cho Production):

```text
NEXT_PUBLIC_API_URL=https://api.bidzone.io.vn/api
BACKEND_ORIGIN=https://api.bidzone.io.vn
NEXT_PUBLIC_GOOGLE_CLIENT_ID=722496917683-ff6vgr1m0m84k8abuo0ejtssthfmviu2.apps.googleusercontent.com
NEXT_PUBLIC_DEMO_MODE=false
```

5. Bấm **Deploy**, chờ build xong.
6. Vào **Project > Settings > Domains**, thêm `bidzone.io.vn` và `www.bidzone.io.vn`.
7. Vercel hiển thị bản ghi DNS cần tạo (thường: apex `A` → `76.76.21.21`, `www` → `CNAME cname.vercel-dns.com` — lấy đúng giá trị Vercel hiển thị, không copy từ đây). Vào trang quản trị DNS iNET tạo đúng các bản ghi đó.
8. Chờ Vercel hiện **Valid Configuration** và tự cấp SSL cho domain.
9. Vào Google Cloud Console → OAuth Client → **Authorized JavaScript origins**, thêm `https://bidzone.io.vn` và `https://www.bidzone.io.vn`.

---

## Kiểm tra sau deploy (checklist)

- [ ] Mở `https://bidzone.io.vn`, trang load được, không lỗi Mixed Content/CORS trong DevTools > Network.
- [ ] Đăng nhập bằng tài khoản demo (`collector/seller/staff/admin@bidzone.demo`, mật khẩu `Demo@123`) hoặc Google Sign-In.
- [ ] Gọi thử một API cần auth (vd. xem sản phẩm, ví).
- [ ] Chat/realtime qua `/ws/chat` kết nối được (không rơi về polling lỗi).
- [ ] Upload ảnh, ảnh tải lại được qua `/uploads/...` hoặc Cloudinary.
- [ ] `sudo certbot renew --dry-run` chạy sạch, không lỗi.
- [ ] Reboot VPS một lần (`sudo reboot`), sau khi lên lại kiểm tra Docker container, Nginx, Certbot timer tự chạy (`docker ps`, `systemctl status nginx`, `systemctl list-timers | grep certbot`).

## Cập nhật phiên bản sau này

```bash
cd bidzone
git pull --ff-only
docker compose -f deploy/vps/docker-compose.yml up -d --build
docker image prune -f
```

Frontend trên Vercel tự động build lại mỗi khi push lên nhánh `main` (nếu bạn để production branch là `main`).
