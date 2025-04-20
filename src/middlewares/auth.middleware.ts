import { Request, Response, NextFunction } from 'express';
import { AccountModel } from '../models/account.model';
import { UnauthorizedError, BadRequestError } from '../utils/error.utils';

import { Account } from '../models/account.model';

// Mở rộng interface của Request để thêm đối tượng account với kiểu dữ liệu rõ ràng
declare global {
  namespace Express {
    interface Request {
      account?: Account;
    }
  }
}

/**
 * Đọc token từ các header khác nhau
 * @param req Request object
 * @returns Token nếu tìm thấy, null nếu không
 */
export const extractToken = (req: Request): string | null => {
  try {
    // Kiểm tra Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]?.trim();
      if (token && token.length > 0) {
        return token;
      }
    }
    
    // Kiểm tra X-API-Key header
    const apiKey = req.headers['x-api-key'];
    if (apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0) {
      return apiKey.trim();
    }
    
    // Kiểm tra token trong query parameter
    if (req.query && req.query.token && typeof req.query.token === 'string' && req.query.token.trim().length > 0) {
      return req.query.token.trim();
    }
    
    return null;
  } catch (error) {
    console.error('Lỗi khi trích xuất token:', error);
    return null;
  }
};

/**
 * Middleware xác thực token từ header
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Lấy token từ header hoặc query string
    const token = extractToken(req);
    
    if (!token) {
      throw new UnauthorizedError('Không tìm thấy token xác thực');
    }
    
    // Kiểm tra định dạng token
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(token)) {
      throw new BadRequestError('Token chứa ký tự không hợp lệ');
    }
    
    // Tìm tài khoản với token này
    const account = await AccountModel.getAccountByToken(token);
    
    if (!account) {
      throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn');
    }
    
    // Kiểm tra trạng thái tài khoản
    if (account.status !== 'active') {
      throw new UnauthorizedError(`Tài khoản ${account.status === 'locked' ? 'đã bị khóa' : 'không hoạt động'}`);
    }
    
    // Đảm bảo status luôn là string không phải undefined
    const accountWithStatus: Account = {
      ...account,
      status: account.status || 'active'
    };
    
    // Gắn thông tin tài khoản vào request để sử dụng ở các middleware hoặc controller tiếp theo
    req.account = accountWithStatus;
    
    next();
  } catch (error) {
    next(error);
  }
}; 