import prisma from '../config/prisma';
import { Account as PrismaAccount } from '@prisma/client';

// Định nghĩa interface cho Account
export interface Account {
  id?: number;
  username: string;
  password: string;
  name?: string;
  status?: 'active' | 'inactive' | 'locked';
  token?: string;
  created_at?: Date;
  updated_at?: Date;
}

// Hàm chuyển đổi từ Prisma Account sang Account interface
const mapPrismaAccountToAccount = (prismaAccount: PrismaAccount): Account => {
  return {
    id: prismaAccount.id,
    username: prismaAccount.username,
    password: prismaAccount.password,
    name: prismaAccount.name || undefined,
    status: prismaAccount.status as 'active' | 'inactive' | 'locked',
    token: prismaAccount.token || undefined,
    created_at: prismaAccount.createdAt,
    updated_at: prismaAccount.updatedAt
  };
};

// Class quản lý Account
export class AccountModel {
  // Lấy tất cả tài khoản
  static async getAllAccounts(): Promise<Account[]> {
    const accounts = await prisma.account.findMany();
    return accounts.map(mapPrismaAccountToAccount);
  }

  // Lấy account theo username
  static async getAccountByUsername(username: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { username }
    });
    
    if (!account) {
      return null;
    }
    
    return mapPrismaAccountToAccount(account);
  }

  // Lấy account theo id
  static async getAccountById(id: number): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id }
    });
    
    if (!account) {
      return null;
    }
    
    return mapPrismaAccountToAccount(account);
  }

  // Thêm account mới
  static async createAccount(account: Account): Promise<number> {
    const { username, password, name, status } = account;
    
    const newAccount = await prisma.account.create({
      data: {
        username,
        password,
        name: name || null,
        status: status || 'active'
      }
    });
    
    return newAccount.id;
  }

  // Cập nhật account
  static async updateAccount(id: number, account: Partial<Account>): Promise<boolean> {
    const updateData: any = {};
    
    // Xây dựng dữ liệu cần cập nhật
    Object.entries(account).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        updateData[key] = value;
      }
    });
    
    if (Object.keys(updateData).length === 0) {
      return false;
    }
    
    try {
      await prisma.account.update({
        where: { id },
        data: updateData
      });
      
      return true;
    } catch (error) {
      console.error('Lỗi cập nhật account:', error);
      return false;
    }
  }

  // Xóa account
  static async deleteAccount(id: number): Promise<boolean> {
    try {
      await prisma.account.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error('Lỗi xóa account:', error);
      return false;
    }
  }

  // Cập nhật trạng thái account
  static async updateStatus(id: number, status: 'active' | 'inactive' | 'locked'): Promise<boolean> {
    try {
      await prisma.account.update({
        where: { id },
        data: { status }
      });
      
      return true;
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái account:', error);
      return false;
    }
  }

  // Cập nhật token cho tài khoản
  static async updateToken(id: number, token: string): Promise<boolean> {
    try {
      await prisma.account.update({
        where: { id },
        data: { token }
      });
      
      return true;
    } catch (error) {
      console.error('Lỗi cập nhật token account:', error);
      return false;
    }
  }

  // Lấy account theo token
  static async getAccountByToken(token: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { token }
    });
    
    if (!account) {
      return null;
    }
    
    return mapPrismaAccountToAccount(account);
  }
} 