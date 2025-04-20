# Hướng dẫn triển khai MB-API

## Yêu cầu hệ thống
- Docker và Docker Compose đã được cài đặt
- Máy chủ Linux (Ubuntu/Debian được khuyến nghị)
- Đã cài đặt Git

## Các bước triển khai

### 1. Clone mã nguồn về máy chủ

```bash
# Tạo thư mục cho dự án
mkdir -p /opt
cd /opt

# Clone repository
git clone https://github.com/your-repo/mb-api.git
cd mb-api
```

### 2. Cấu hình môi trường

```bash
# Tạo file .env.production từ file mẫu
cp .env .env.production

# Chỉnh sửa file .env.production với thông tin thực tế
nano .env.production
```

Cập nhật các thông tin sau trong file `.env.production`:
- `DOMAIN=yourdomain.com` (thay bằng tên miền thực tế của bạn)
- `NODE_ENV=production`
- Các thông số cấu hình khác nếu cần

### 3. Chỉnh sửa file docker-compose.yml

Đảm bảo file docker-compose.yml đã được cấu hình để kết nối với mạng Traefik hiện có:

```bash
nano docker-compose.yml
```

Kiểm tra các cấu hình sau:
- Dịch vụ mb-api được kết nối với mạng `traefik_web`
- Mạng `traefik_web` được đánh dấu là `external: true`
- Các label Traefik đã được cấu hình đúng với tên miền của bạn

### 4. Xây dựng và khởi động container

```bash
# Xây dựng image
docker-compose build

# Khởi động container
DOMAIN=pm.danhtrong.com docker-compose up -d
```

### 5. Kiểm tra trạng thái

```bash
# Kiểm tra container đã chạy chưa
docker ps

# Xem logs để kiểm tra lỗi (nếu có)
docker logs mb-api
```

### 6. Cấu hình DNS

Đảm bảo bạn đã cấu hình DNS cho tên miền của bạn, trỏ về địa chỉ IP của máy chủ:
- Tạo bản ghi A cho `api.yourdomain.com` trỏ đến IP của máy chủ

### 7. Kiểm tra hoạt động

Truy cập API thông qua URL:
```
https://api.yourdomain.com
```

## Xử lý sự cố

### Nếu container không khởi động

Kiểm tra logs:
```bash
docker logs mb-api
```

### Nếu Traefik không định tuyến đúng

Kiểm tra cấu hình Traefik:
```bash
docker logs traefik
```

### Kiểm tra kết nối mạng

```bash
# Kiểm tra mạng Docker
docker network ls

# Kiểm tra chi tiết mạng traefik_web
docker network inspect traefik_web
```

## Cập nhật ứng dụng

Khi có phiên bản mới:

```bash
# Pull code mới
git pull

# Xây dựng lại và khởi động
docker-compose down
docker-compose build
DOMAIN=yourdomain.com docker-compose up -d
```

## Sao lưu dữ liệu

Dữ liệu được lưu trong thư mục `./data`. Để sao lưu:

```bash
# Tạm dừng container
docker-compose stop mb-api

# Sao lưu thư mục data
tar -czvf mb-api-data-backup-$(date +%Y%m%d).tar.gz ./data

# Khởi động lại container
docker-compose start mb-api
```