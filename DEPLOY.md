# Hướng dẫn triển khai MB Bank API với Docker và Traefik

Tài liệu này hướng dẫn cách triển khai MB Bank API sử dụng Docker và Traefik với SSL tự động.

## Yêu cầu

- Docker và Docker Compose
- Tên miền đã trỏ về máy chủ của bạn
- Cổng 80 và 443 mở trên tường lửa

## Các bước triển khai

### 1. Thiết lập môi trường

Chạy script thiết lập môi trường để tạo các thư mục và file cấu hình cần thiết:

```bash
chmod +x setup-env.sh
./setup-env.sh
```

### 2. Thiết lập tên miền

Sử dụng script `set-domain.sh` để cấu hình tên miền cho dịch vụ:

```bash
chmod +x set-domain.sh
./set-domain.sh yourdomain.com
```

Thay `yourdomain.com` bằng tên miền thực tế của bạn.

### 3. Cập nhật thông tin email trong file cấu hình Traefik

Mở file `traefik/config/traefik.yml` và cập nhật địa chỉ email cho Let's Encrypt:

```yaml
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com  # Thay đổi thành email của bạn
```

### 4. Khởi tạo cơ sở dữ liệu (nếu cần)

```bash
chmod +x init-db.sh
./init-db.sh
```

### 5. Khởi động dịch vụ

```bash
chmod +x start.sh
./start.sh
```

### 6. Kiểm tra trạng thái

```bash
docker-compose ps
```

## Quản lý dịch vụ

### Xem logs

```bash
docker-compose logs -f
```

### Dừng dịch vụ

```bash
docker-compose down
```

### Khởi động lại dịch vụ

```bash
chmod +x restart.sh
./restart.sh
```

### Cập nhật dịch vụ

```bash
chmod +x update.sh
./update.sh
```

## Tạo mật khẩu cho Basic Auth

Để bảo vệ API hoặc Traefik Dashboard, bạn có thể tạo mật khẩu mã hóa:

```bash
chmod +x create-password.sh
./create-password.sh
```

Sau đó, cập nhật mật khẩu trong file `docker-compose.yml`.

## Truy cập dịch vụ

- API: `https://api.yourdomain.com`
- Traefik Dashboard: `https://traefik.yourdomain.com`

## Bảo mật

- Đảm bảo thay đổi mật khẩu mặc định trong file `docker-compose.yml`
- Xem xét sử dụng mạng riêng cho các dịch vụ nội bộ
- Cân nhắc sử dụng tường lửa để giới hạn truy cập

## Khắc phục sự cố

### Vấn đề với SSL

Nếu chứng chỉ SSL không được cấp:

1. Kiểm tra logs của Traefik:
   ```bash
   docker-compose logs traefik
   ```

2. Đảm bảo tên miền đã trỏ đúng về IP của máy chủ
3. Kiểm tra cổng 80 và 443 đã được mở

### Vấn đề với API

Nếu API không hoạt động:

1. Kiểm tra logs của API:
   ```bash
   docker-compose logs mb-api
   ```

2. Đảm bảo cơ sở dữ liệu đã được khởi tạo đúng cách:
   ```bash
   ./init-db.sh
   ```

3. Kiểm tra các biến môi trường trong file `.env.production`

### Vấn đề với Docker build

Nếu gặp lỗi khi build Docker image:

1. Xóa file pnpm-lock.yaml nếu có:
   ```bash
   rm -f pnpm-lock.yaml
   ```

2. Xây dựng lại image:
   ```bash
   docker-compose build --no-cache mb-api
   ```