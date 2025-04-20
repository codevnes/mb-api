import prisma from './prisma';
import dotenv from 'dotenv';

dotenv.config();

// Hàm kiểm tra kết nối database
export const testConnection = async (): Promise<void> => {
  try {
    // Thực hiện một truy vấn đơn giản để kiểm tra kết nối
    await prisma.$queryRaw`SELECT 1`;
    console.log('Kết nối SQLite thành công!');
  } catch (error) {
    console.error('Lỗi kết nối SQLite:', error);
    throw error;
  }
};

// Khởi tạo cơ sở dữ liệu
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Prisma tự động tạo bảng dựa trên schema đã định nghĩa
    // Không cần thực hiện thêm thao tác nào ở đây
    console.log('Khởi tạo cơ sở dữ liệu thành công');
  } catch (error) {
    console.error('Lỗi khởi tạo cơ sở dữ liệu:', error);
    throw error;
  }
};

export default prisma; 