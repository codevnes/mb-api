#!/bin/bash

# Dừng các dịch vụ
echo "Đang dừng các dịch vụ..."
docker-compose down

# Khởi động lại các dịch vụ
echo "Đang khởi động lại các dịch vụ..."
docker-compose up -d

# Hiển thị trạng thái
echo "Trạng thái các dịch vụ:"
docker-compose ps

# Hiển thị logs
echo "Hiển thị logs (Nhấn Ctrl+C để thoát):"
docker-compose logs -f