FROM node:18-alpine

# Cài đặt các phụ thuộc cần thiết
RUN apk add --no-cache python3 make g++ libc6-compat

# Tạo thư mục ứng dụng
WORKDIR /app

# Cài đặt pnpm
RUN npm install -g pnpm

# Sao chép package.json và pnpm-lock.yaml
COPY package.json ./

# Cài đặt các phụ thuộc
RUN pnpm install

# Sao chép mã nguồn
COPY . .

# Cài đặt Prisma và các phụ thuộc khác
RUN pnpm add prisma @prisma/client better-sqlite3 sqlite3

# Biên dịch TypeScript (bỏ qua lỗi)
RUN pnpm prisma generate && tsc --skipLibCheck

# Tạo thư mục data
RUN mkdir -p /app/data

# Thiết lập quyền
RUN chmod -R 755 /app/data

# Mở cổng
EXPOSE 3000

# Khởi động ứng dụng
CMD ["pnpm", "start"]