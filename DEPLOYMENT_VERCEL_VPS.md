# Deploy BidZone: Vercel frontend + VPS backend không dùng domain

## Kiến trúc

- `https://example.vn` và `https://www.example.vn`: frontend Next.js trên Vercel.
- `https://YOUR_VPS_PUBLIC_IP`: Nginx trên VPS, không cần domain backend.
- `127.0.0.1:8096`: container Spring Boot, chỉ Nginx trên VPS truy cập được.
- Frontend gọi API tại `https://YOUR_VPS_PUBLIC_IP/api` và realtime tại
  `https://YOUR_VPS_PUBLIC_IP/ws/chat`.

Không dùng `http://YOUR_VPS_PUBLIC_IP` cho backend. Trang Vercel chạy HTTPS sẽ bị
trình duyệt chặn khi gọi HTTP hoặc WebSocket không mã hóa.

## 1. Chuẩn bị VPS

Yêu cầu:

- Ubuntu VPS có IPv4 public tĩnh.
- Mở inbound TCP `22`, `80`, `443`; không mở `8096` ra Internet.
- Đã cài Docker Engine, Docker Compose plugin, Nginx và Certbot `5.4+`.

Kiểm tra phiên bản:

```bash
docker --version
docker compose version
nginx -v
certbot --version
```

Clone repository vào VPS và đứng tại thư mục gốc repository. Sau đó tạo file biến
môi trường:

```bash
cp deploy/vps/backend.env.example deploy/vps/backend.env
nano deploy/vps/backend.env
```

Thay toàn bộ `CHANGE_ME`, đồng thời thay `example.vn` bằng domain thật. Không commit
file `backend.env`.

Khởi động backend:

```bash
docker compose -f deploy/vps/docker-compose.yml up -d --build
docker compose -f deploy/vps/docker-compose.yml logs -f backend
```

Backend chỉ được bind vào loopback. Kiểm tra trên VPS:

```bash
curl -i http://127.0.0.1:8096/api/products
```

## 2. Cấp HTTPS trực tiếp cho IP VPS

Let's Encrypt yêu cầu IP certificate thuộc profile `shortlived` và Certbot `5.4+`
khi dùng webroot. Chứng chỉ chỉ có hiệu lực khoảng 6 ngày nên auto-renew là bắt buộc.

Tạo webroot và bật cấu hình HTTP tạm:

```bash
sudo mkdir -p /var/www/letsencrypt/.well-known/acme-challenge
sudo cp deploy/vps/nginx-http-bootstrap.conf /etc/nginx/sites-available/bidzone-api
sudo ln -sfn /etc/nginx/sites-available/bidzone-api /etc/nginx/sites-enabled/bidzone-api
sudo nginx -t
sudo systemctl reload nginx
```

Đặt IP public vào biến và thử với môi trường staging trước:

```bash
VPS_IP="YOUR_VPS_PUBLIC_IP"
sudo certbot certonly --staging \
  --preferred-profile shortlived \
  --webroot \
  --webroot-path /var/www/letsencrypt \
  --ip-address "$VPS_IP"
```

Khi staging thành công, xóa `--staging` để xin chứng chỉ thật:

```bash
sudo certbot certonly \
  --preferred-profile shortlived \
  --webroot \
  --webroot-path /var/www/letsencrypt \
  --ip-address "$VPS_IP"
```

Bật reverse proxy HTTPS:

```bash
sed "s/YOUR_VPS_PUBLIC_IP/$VPS_IP/g" deploy/vps/nginx-https-ip.conf.template \
  | sudo tee /etc/nginx/sites-available/bidzone-api >/dev/null
sudo nginx -t
sudo systemctl reload nginx
```

Tạo deploy hook để Nginx nạp chứng chỉ mới sau mỗi lần gia hạn:

```bash
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
printf '#!/bin/sh\nsystemctl reload nginx\n' \
  | sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx >/dev/null
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx
sudo systemctl enable --now snap.certbot.renew.timer
sudo certbot renew --dry-run
```

Nếu Certbot được cài bằng package khác Snap, timer có thể có tên khác. Xác nhận bằng
`systemctl list-timers | grep certbot`; phải có lịch chạy tự động nhiều lần mỗi ngày.

Kiểm tra public API:

```bash
curl -i "https://$VPS_IP/api/products"
```

## 3. Deploy frontend lên Vercel

1. Trong Vercel chọn **Add New > Project** và import repository GitHub này.
2. Chọn branch production là `main`.
3. Đặt **Root Directory** là `src/frontend`.
4. Framework Preset là **Next.js**; để Vercel tự nhận install/build/output command.
5. Tại **Settings > Environment Variables**, thêm:

```text
NEXT_PUBLIC_API_URL=https://YOUR_VPS_PUBLIC_IP/api
BACKEND_ORIGIN=https://YOUR_VPS_PUBLIC_IP
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
NEXT_PUBLIC_DEMO_MODE=false
```

Áp dụng các biến trên cho Production. Nếu dùng Preview deployment, áp dụng thêm cho
Preview và thêm chính xác URL preview Vercel vào `APP_CORS_ALLOWED_ORIGINS` của
backend, rồi restart container:

```bash
docker compose -f deploy/vps/docker-compose.yml up -d --force-recreate backend
```

Không đưa khóa database, JWT, Groq hoặc Cloudinary secret lên Vercel frontend.

## 4. Trỏ domain mua tại iNET vào Vercel

1. Vào Vercel **Project > Settings > Domains**, thêm `example.vn` và
   `www.example.vn`.
2. Vercel sẽ hiển thị bản ghi DNS chính xác cho project.
3. Vào trang quản trị DNS iNET và tạo đúng các bản ghi Vercel yêu cầu:
   apex thường là bản ghi `A`, còn `www` thường là `CNAME`.
4. Chọn một domain làm chính và redirect domain còn lại trong Vercel.
5. Chờ Vercel báo **Valid Configuration** và cấp SSL.

Không tạo bản ghi `api.example.vn`: backend vẫn dùng trực tiếp IP VPS như yêu cầu.

Sau khi có domain thật, cập nhật backend:

```text
APP_CORS_ALLOWED_ORIGINS=https://example.vn,https://www.example.vn
APP_FRONTEND_BASE_URL=https://example.vn
```

Đồng thời thêm domain vào **Authorized JavaScript origins** của Google OAuth.

## 5. Kiểm tra sau deploy

- Mở frontend bằng domain thật, đăng nhập và gọi một API.
- Trong DevTools > Network, request API phải đi tới
  `https://YOUR_VPS_PUBLIC_IP/api/...`, không có lỗi Mixed Content hoặc CORS.
- Kiểm tra chat/realtime kết nối qua `/ws/chat`.
- Upload ảnh và xác nhận `/uploads/...` tải được.
- Reboot VPS một lần để kiểm tra Docker, Nginx và Certbot timer tự khởi động.

## Cập nhật phiên bản

```bash
git pull --ff-only
docker compose -f deploy/vps/docker-compose.yml up -d --build
docker image prune -f
```
