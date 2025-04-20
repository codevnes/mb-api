FROM node:18-alpine

# Cài đặt các phụ thuộc cần thiết
RUN apk add --no-cache python3 make g++ libc6-compat

# Tạo thư mục ứng dụng
WORKDIR /app

# Cài đặt pnpm
RUN npm install -g pnpm

# Sao chép package.json và pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Cài đặt các phụ thuộc
RUN pnpm install --frozen-lockfile

# Sao chép mã nguồn
COPY . .

# Biên dịch TypeScript
RUN pnpm build

# Tạo thư mục data
RUN mkdir -p /app/data

# Thiết lập quyền
RUN chmod -R 755 /app/data

# Mở cổng
EXPOSE 3000

# Khởi động ứng dụng
CMD ["pnpm", "start"]