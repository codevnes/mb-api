import { Request, Response, NextFunction } from 'express';
import { AccountModel } from '../models/account.model';
import { UnauthorizedError, BadRequestError } from '../utils/error.utils';

// Mở rộng interface của Request để thêm đối tượng account với kiểu dữ liệu rõ ràng
declare global {
  namespace Express {
    interface Request {
      account?: {
        id?: number;
        username: string;
        name?: string;
        status: string;
        token: string;
        password?: string;
        created_at?: Date;
        updated_at?: Date;
      };
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
    
    // Gắn thông tin tài khoản vào request để sử dụng ở các middleware hoặc controller tiếp theo
    req.account = account;
    
    next();
  } catch (error) {
    next(error);
  }
}; 