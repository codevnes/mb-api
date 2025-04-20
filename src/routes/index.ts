import { Router } from 'express';
import accountRoutes from './account.routes';
import mbbankRoutes from './mbbank.routes';

const router = Router();

// Định tuyến cho quản lý tài khoản
router.use('/accounts', accountRoutes);

// Định tuyến cho hoạt động MB Bank
router.use('/mbbank', mbbankRoutes);

export default router;