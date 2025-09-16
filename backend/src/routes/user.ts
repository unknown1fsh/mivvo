import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getUserCredits,
  purchaseCredits,
  getCreditHistory,
  getUserReports,
  deleteAccount,
} from '../controllers/userController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Credit management
router.get('/credits', asyncHandler(getUserCredits));
router.post('/credits/purchase', asyncHandler(purchaseCredits));
router.get('/credits/history', asyncHandler(getCreditHistory));

// User reports
router.get('/reports', asyncHandler(getUserReports));

// Account management
router.delete('/account', asyncHandler(deleteAccount));

export default router;
