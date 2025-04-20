#!/bin/bash

# Tạo thư mục data nếu chưa tồn tại
mkdir -p ./data

# Tạo file acme.json cho Let's Encrypt và thiết lập quyền
touch ./traefik/data/acme.json
chmod 600 ./traefik/data/acme.json

# Khởi động Docker Compose
docker-compose up -d

# Hiển thị logs
docker-compose logs -f