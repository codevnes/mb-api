#!/bin/bash

# Tạo thư mục data nếu chưa tồn tại
mkdir -p ./data

# Kiểm tra xem cơ sở dữ liệu đã tồn tại chưa
if [ ! -f "./data/mbbank.db" ]; then
    echo "Khởi tạo cơ sở dữ liệu..."
    
    # Chạy container tạm thời để khởi tạo cơ sở dữ liệu
    docker run --rm \
        -v "$(pwd)/data:/app/data" \
        -v "$(pwd)/prisma:/app/prisma" \
        -e DATABASE_URL="file:/app/data/mbbank.db" \
        node:18-alpine \
        sh -c "cd /app && \
               apk add --no-cache python3 make g++ libc6-compat && \
               npm install -g pnpm && \
               pnpm add prisma @prisma/client better-sqlite3 sqlite3 && \
               npx prisma generate && \
               npx prisma migrate deploy"
    
    echo "Cơ sở dữ liệu đã được khởi tạo thành công!"
else
    echo "Cơ sở dữ liệu đã tồn tại. Bỏ qua bước khởi tạo."
fi