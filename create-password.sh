#!/bin/bash

# Kiểm tra xem đã cài đặt htpasswd chưa
if ! command -v htpasswd &> /dev/null; then
    echo "htpasswd không được tìm thấy. Đang cài đặt..."
    
    # Kiểm tra hệ điều hành
    if [ -f /etc/debian_version ]; then
        # Debian/Ubuntu
        sudo apt-get update
        sudo apt-get install -y apache2-utils
    elif [ -f /etc/redhat-release ]; then
        # CentOS/RHEL
        sudo yum install -y httpd-tools
    elif [ -f /etc/alpine-release ]; then
        # Alpine
        apk add --no-cache apache2-utils
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install httpd
    else
        echo "Không thể xác định hệ điều hành. Vui lòng cài đặt apache2-utils hoặc httpd-tools thủ công."
        exit 1
    fi
fi

# Yêu cầu tên người dùng
read -p "Nhập tên người dùng: " username

# Yêu cầu mật khẩu
read -s -p "Nhập mật khẩu: " password
echo ""

# Tạo mật khẩu mã hóa
encrypted_password=$(htpasswd -nbB "$username" "$password")

# Escape các ký tự đặc biệt cho Docker Compose
docker_escaped=$(echo "$encrypted_password" | sed -e 's/\$/\$\$/g')

echo ""
echo "Mật khẩu đã được mã hóa:"
echo "$encrypted_password"
echo ""
echo "Mật khẩu đã được escape cho Docker Compose:"
echo "$docker_escaped"
echo ""
echo "Sử dụng chuỗi này trong file docker-compose.yml cho middleware basicauth."