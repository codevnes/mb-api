#!/bin/bash

# Kiểm tra xem đã cung cấp tên miền chưa
if [ -z "$1" ]; then
    echo "Vui lòng cung cấp tên miền. Ví dụ: ./set-domain.sh example.com"
    exit 1
fi

DOMAIN=$1

# Cập nhật file .env
if [ -f "./.env" ]; then
    # Kiểm tra xem DOMAIN đã tồn tại trong file .env chưa
    if grep -q "DOMAIN=" ./.env; then
        # Thay thế giá trị DOMAIN hiện tại
        sed -i "s/DOMAIN=.*/DOMAIN=$DOMAIN/" ./.env
    else
        # Thêm DOMAIN vào đầu file
        sed -i "1s/^/DOMAIN=$DOMAIN\n\n/" ./.env
    fi
else
    # Tạo file .env mới
    echo "DOMAIN=$DOMAIN" > ./.env
    echo "" >> ./.env
    echo "# Server configuration" >> ./.env
    echo "PORT=3050" >> ./.env
    echo "NODE_ENV=development" >> ./.env
    echo "" >> ./.env
    echo "# SQLite Database configuration (Prisma)" >> ./.env
    echo "DATABASE_URL=\"file:./data/mbbank.db\"" >> ./.env
    echo "" >> ./.env
    echo "# MBBank configuration" >> ./.env
    echo "PREFER_OCR_METHOD=default" >> ./.env
    echo "SAVE_WASM=true" >> ./.env
fi

# Cập nhật file traefik/config/traefik.yml
if [ -f "./traefik/config/traefik.yml" ]; then
    # Thay thế email trong file traefik.yml
    sed -i "s/email: .*/email: admin@$DOMAIN/" ./traefik/config/traefik.yml
fi

echo "Đã thiết lập tên miền $DOMAIN thành công!"
echo "Các dịch vụ sẽ được cấu hình với các URL sau:"
echo "- API: https://api.$DOMAIN"
echo "- Traefik Dashboard: https://traefik.$DOMAIN"
echo ""
echo "Hãy đảm bảo rằng các bản ghi DNS đã được cấu hình đúng:"
echo "- api.$DOMAIN -> [IP máy chủ của bạn]"
echo "- traefik.$DOMAIN -> [IP máy chủ của bạn]"