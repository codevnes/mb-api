import { Request, Response } from 'express';
import { MBBankService, TransactionHistoryParams } from '../services/mbbank.service';
import { AccountModel } from '../models/account.model';
import { NotFoundError } from '../utils/error.utils';

export class MBBankController {
  // Đăng nhập vào tài khoản MB Bank
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      
      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Thực hiện đăng nhập
      const loginResult = await MBBankService.login(account);
      
      // Phản hồi kết quả
      if (loginResult.success) {
        res.status(200).json(loginResult);
      } else {
        res.status(401).json(loginResult);
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi đăng nhập: ${error.message}`
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập
  static async checkLoginStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      
      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Kiểm tra trạng thái đăng nhập
      const statusResult = await MBBankService.checkLoginStatus(account);
      
      // Phản hồi kết quả
      if (statusResult.success) {
        res.status(200).json(statusResult);
      } else {
        // Xử lý theo loại lỗi
        if (statusResult.error_type === 'invalid_credentials') {
          res.status(401).json({
            success: false,
            message: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng cập nhật thông tin đăng nhập.',
            error_type: statusResult.error_type
          });
        } else {
          res.status(401).json(statusResult);
        }
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi kiểm tra trạng thái đăng nhập: ${error.message}`
      });
    }
  }

  // Lấy số dư tài khoản
  static async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      
      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Lấy số dư tài khoản
      const balanceResult = await MBBankService.getBalance(account);
      
      res.status(200).json({
        success: true,
        data: balanceResult
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy số dư tài khoản: ${error.message}`
      });
    }
  }

  // Lấy lịch sử giao dịch
  static async getTransactionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      
      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Lấy thông tin từ query params
      const { accountNumber, fromDate, toDate } = req.query;
      
      // Kiểm tra các thông tin bắt buộc
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber là bắt buộc'
        });
        return;
      }
      
      // Khai báo biến params
      let params: TransactionHistoryParams;
      
      // Kiểm tra fromDate và toDate
      if (!fromDate || !toDate) {
        console.error('Missing fromDate or toDate in controller. Calculating them now...');
        
        // Kiểm tra xem có tham số days không
        const pathParts = req.path.split('/');
        const isUsingDaysRoute = pathParts[pathParts.length - 1] === 'days';
        
        if (isUsingDaysRoute) {
          // Tính toán lại ngày nếu chúng bị thiếu
          const days = req.query.days ? Number(req.query.days) : 7; // Mặc định 7 ngày nếu không có
          
          // Tính toán ngày
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const fromDateObj = new Date(today);
          fromDateObj.setDate(today.getDate() - (days - 1));
          
          // Định dạng ngày
          const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };
          
          // Chuẩn bị dữ liệu cho API với ngày đã tính toán lại
          params = {
            accountNumber: accountNumber as string,
            fromDate: formatDate(fromDateObj),
            toDate: formatDate(today)
          };
          
          console.log('Recalculated dates in controller:', params);
        } else {
          // Nếu không phải route days, yêu cầu cung cấp fromDate và toDate
          res.status(400).json({
            success: false,
            message: 'Thiếu thông tin: fromDate và toDate là bắt buộc'
          });
          return;
        }
      } else {
        // Chuẩn bị dữ liệu cho API với ngày từ middleware
        params = {
          accountNumber: accountNumber as string,
          fromDate: fromDate as string,
          toDate: toDate as string
        };
        
        // Log để debug
        console.log('Using transaction params from request:', params);
      }
      
      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(account, params);
      
      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch: ${error.message}`
      });
    }
  }

  // Đăng xuất tài khoản
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const accountId = parseInt(id);
      
      if (isNaN(accountId)) {
        res.status(400).json({
          success: false,
          message: 'ID tài khoản không hợp lệ'
        });
        return;
      }
      
      // Lấy thông tin tài khoản từ cơ sở dữ liệu
      const account = await AccountModel.getAccountById(accountId);
      
      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài khoản'
        });
        return;
      }
      
      // Thực hiện đăng xuất
      MBBankService.logout(account.username);
      
      res.status(200).json({
        success: true,
        message: 'Đăng xuất thành công'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: `Lỗi khi đăng xuất: ${error.message}`
      });
    }
  }

  // Lấy số dư tài khoản sử dụng token
  static async getBalanceWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account;
      
      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }
      
      // Tạo một đối tượng mới với kiểu Account rõ ràng
      const mbAccount = {
        id: account.id,
        username: account.username,
        password: account.password || '', // Đảm bảo password luôn là string
        name: account.name,
        status: account.status as 'active' | 'inactive' | 'locked',
        token: account.token,
        created_at: account.created_at,
        updated_at: account.updated_at
      };
      
      // Lấy số dư tài khoản
      const balanceResult = await MBBankService.getBalance(mbAccount);
      
      res.status(200).json({
        success: true,
        data: balanceResult
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi lấy số dư tài khoản: ${error.message}`
      });
    }
  }

  // Lấy lịch sử giao dịch sử dụng token
  static async getTransactionHistoryWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account;
      
      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }
      
      // Tạo một đối tượng mới với kiểu Account rõ ràng
      const mbAccount = {
        id: account.id,
        username: account.username,
        password: account.password || '', // Đảm bảo password luôn là string
        name: account.name,
        status: account.status as 'active' | 'inactive' | 'locked',
        token: account.token,
        created_at: account.created_at,
        updated_at: account.updated_at
      };
      
      // Log để debug
      console.log('Query params:', req.query);
      
      // Lấy thông tin từ query params
      const { accountNumber, fromDate, toDate } = req.query;
      
      // Kiểm tra số tài khoản
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber là bắt buộc'
        });
        return;
      }
      
      // Khai báo biến params
      let params: TransactionHistoryParams;
      
      // Kiểm tra fromDate và toDate
      if (!fromDate || !toDate) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: fromDate và toDate là bắt buộc'
        });
        return;
      } else {
        // Chuẩn bị dữ liệu cho API với ngày từ request
        params = {
          accountNumber: accountNumber as string,
          fromDate: fromDate as string,
          toDate: toDate as string
        };
        
        // Log để debug
        console.log('Using transaction params from request:', params);
      }
      
      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(mbAccount, params);
      
      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch: ${error.message}`
      });
    }
  }
  
  // Lấy lịch sử giao dịch theo số ngày sử dụng token
  static async getTransactionHistoryByDaysWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account;
      
      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }
      
      // Tạo một đối tượng mới với kiểu Account rõ ràng
      const mbAccount = {
        id: account.id,
        username: account.username,
        password: account.password || '', // Đảm bảo password luôn là string
        name: account.name,
        status: account.status as 'active' | 'inactive' | 'locked',
        token: account.token,
        created_at: account.created_at,
        updated_at: account.updated_at
      };
      
      // Log để debug
      console.log('Query params for days:', req.query);
      
      // Lấy thông tin từ query params
      // Lưu ý: validateDaysParam middleware đã tự động thêm fromDate và toDate vào req.query
      const { accountNumber, fromDate, toDate } = req.query;
      
      // Kiểm tra các thông tin bắt buộc
      if (!accountNumber) {
        res.status(400).json({
          success: false,
          message: 'Thiếu thông tin: accountNumber là bắt buộc'
        });
        return;
      }
      
      // Khai báo biến params
      let params: TransactionHistoryParams;
      
      // Kiểm tra fromDate và toDate
      if (!fromDate || !toDate) {
        console.error('Missing fromDate or toDate in controller. Calculating them now...');
        
        // Kiểm tra xem có tham số days không
        const pathParts = req.path.split('/');
        const isUsingDaysRoute = pathParts[pathParts.length - 1] === 'days';
        
        if (isUsingDaysRoute) {
          // Tính toán lại ngày nếu chúng bị thiếu
          const days = req.query.days ? Number(req.query.days) : 7; // Mặc định 7 ngày nếu không có
          
          // Tính toán ngày
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const fromDateObj = new Date(today);
          fromDateObj.setDate(today.getDate() - (days - 1));
          
          // Định dạng ngày
          const formatDate = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };
          
          // Chuẩn bị dữ liệu cho API với ngày đã tính toán lại
          params = {
            accountNumber: accountNumber as string,
            fromDate: formatDate(fromDateObj),
            toDate: formatDate(today)
          };
          
          console.log('Recalculated dates in controller:', params);
        } else {
          // Nếu không phải route days, yêu cầu cung cấp fromDate và toDate
          res.status(400).json({
            success: false,
            message: 'Thiếu thông tin: fromDate và toDate là bắt buộc'
          });
          return;
        }
      } else {
        // Chuẩn bị dữ liệu cho API với ngày từ middleware
        params = {
          accountNumber: accountNumber as string,
          fromDate: fromDate as string,
          toDate: toDate as string
        };
        
        // Log để debug
        console.log('Using transaction params from request:', params);
      }
      
      // Lấy lịch sử giao dịch
      const transactionResult = await MBBankService.getTransactionHistory(mbAccount, params);
      
      res.status(200).json({
        success: true,
        data: transactionResult
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi lấy lịch sử giao dịch theo số ngày: ${error.message}`
      });
    }
  }

  // Kiểm tra trạng thái đăng nhập sử dụng token
  static async checkLoginStatusWithToken(req: Request, res: Response): Promise<void> {
    try {
      // Lấy thông tin tài khoản từ req.account đã được thiết lập bởi middleware
      const account = req.account;
      
      if (!account) {
        throw new NotFoundError('Không tìm thấy thông tin tài khoản');
      }
      
      // Tạo một đối tượng mới với kiểu Account rõ ràng
      const mbAccount = {
        id: account.id,
        username: account.username,
        password: account.password || '', // Đảm bảo password luôn là string
        name: account.name,
        status: account.status as 'active' | 'inactive' | 'locked',
        token: account.token,
        created_at: account.created_at,
        updated_at: account.updated_at
      };
      
      // Kiểm tra trạng thái đăng nhập
      const statusResult = await MBBankService.checkLoginStatus(mbAccount);
      
      // Phản hồi kết quả
      if (statusResult.success) {
        res.status(200).json(statusResult);
      } else {
        // Xử lý theo loại lỗi
        if (statusResult.error_type === 'invalid_credentials') {
          res.status(401).json({
            success: false,
            message: 'Sai tên đăng nhập hoặc mật khẩu. Vui lòng cập nhật thông tin đăng nhập.',
            error_type: statusResult.error_type
          });
        } else {
          res.status(401).json(statusResult);
        }
      }
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: `Lỗi khi kiểm tra trạng thái đăng nhập: ${error.message}`
      });
    }
  }
} 