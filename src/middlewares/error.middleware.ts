import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  body?: any;
}

// Middleware xử lý lỗi chung
export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Xử lý lỗi JSON parsing
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu JSON không hợp lệ',
      error: 'invalid_json_format'
    });
  }
  
  // Xử lý các lỗi khác
  const statusCode = err.statusCode || 500;
  
  console.error(err.stack);
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Hàm trợ giúp để đăng ký middleware xử lý lỗi
export const registerErrorHandlers = (app: any) => {
  app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
    errorHandler(err, req, res, next);
  });
};