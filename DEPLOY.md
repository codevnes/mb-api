# Hướng dẫn triển khai MB Bank API với Docker và Traefik

Tài liệu này hướng dẫn cách triển khai MB Bank API sử dụng Docker và Traefik với SSL tự động.

## Yêu cầu

- Docker và Docker Compose
- Tên miền đã trỏ về máy chủ của bạn
- Cổng 80 và 443 mở trên tường lửa

## Các bước triển khai

### 1. Chuẩn bị môi trường

Trước khi triển khai, bạn cần cập nhật một số thông tin trong các file cấu hình:

#### Trong file `docker-compose.yml`:

- Thay đổi `traefik.yourdomain.com` thành tên miền bạn muốn sử dụng cho dashboard Traefik
- Thay đổi `api.yourdomain.com` thành tên miền bạn muốn sử dụng cho API
- Cập nhật thông tin xác thực (nếu cần)

#### Trong file `traefik/config/traefik.yml`:

- Thay đổi `your-email@example.com` thành địa chỉ email của bạn (dùng cho Let's Encrypt)

### 2. Thiết lập quyền cho file acme.json

```bash
# Tạo thư mục data nếu chưa tồn tại
mkdir -p ./data

# Tạo file acme.json cho Let's Encrypt và thiết lập quyền
touch ./traefik/data/acme.json
chmod 600 ./traefik/data/acme.json
```

### 3. Cấp quyền thực thi cho script khởi động

```bash
chmod +x start.sh
```

### 4. Khởi động dịch vụ

```bash
./start.sh
```

Hoặc sử dụng Docker Compose trực tiếp:

```bash
docker-compose up -d
```

### 5. Kiểm tra trạng thái

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
docker-compose restart
```

### Cập nhật dịch vụ

```bash
git pull
docker-compose down
docker-compose up -d --build
```

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

2. Đảm bảo cơ sở dữ liệu đã được khởi tạo đúng cách
3. Kiểm tra các biến môi trường trong file `.env.production`