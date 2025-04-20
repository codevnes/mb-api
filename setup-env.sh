#!/bin/bash

# Tạo các thư mục cần thiết
echo "Tạo các thư mục cần thiết..."
mkdir -p ./data
mkdir -p ./traefik/data
mkdir -p ./traefik/certs
mkdir -p ./traefik/config

# Tạo file acme.json cho Let's Encrypt và thiết lập quyền
touch ./traefik/data/acme.json
chmod 600 ./traefik/data/acme.json

# Kiểm tra xem các file cấu hình Traefik đã tồn tại chưa
if [ ! -f "./traefik/config/traefik.yml" ]; then
    echo "Tạo file cấu hình Traefik..."
    cat > ./traefik/config/traefik.yml << 'EOL'
api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https

  websecure:
    address: ":443"

serversTransport:
  insecureSkipVerify: true

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
  file:
    filename: /config.yml

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /data/acme.json
      httpChallenge:
        entryPoint: web

log:
  level: INFO

accessLog: {}
EOL
fi

if [ ! -f "./traefik/config/config.yml" ]; then
    echo "Tạo file cấu hình bổ sung cho Traefik..."
    cat > ./traefik/config/config.yml << 'EOL'
http:
  middlewares:
    secureHeaders:
      headers:
        frameDeny: true
        sslRedirect: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
        customFrameOptionsValue: "SAMEORIGIN"
        customRequestHeaders:
          X-Forwarded-Proto: "https"

    compression:
      compress: {}

tls:
  options:
    default:
      minVersion: VersionTLS12
      sniStrict: true
      cipherSuites:
        - TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
        - TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
        - TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305
        - TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305
EOL
fi

# Kiểm tra xem file .env.production đã tồn tại chưa
if [ ! -f "./.env.production" ]; then
    echo "Tạo file .env.production..."
    cat > ./.env.production << 'EOL'
# Cấu hình cơ sở dữ liệu
DATABASE_URL="file:/app/data/mbbank.db"

# Cấu hình ứng dụng
PORT=3000
NODE_ENV=production

# Cấu hình MB Bank
PREFER_OCR_METHOD=default
SAVE_WASM=true

# Cấu hình JWT (thay thế bằng khóa bí mật của bạn)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
EOL
fi

echo "Môi trường đã được thiết lập thành công!"
echo "Bạn có thể chỉnh sửa các file cấu hình trong thư mục ./traefik/config và file .env.production trước khi khởi động dịch vụ."
echo "Để khởi động dịch vụ, chạy lệnh: ./start.sh"