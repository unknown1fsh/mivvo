import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllReports,
  getReportById,
  updateReportStatus,
  getSystemStats,
  updateServicePricing,
  getServicePricing,
  updateSystemSettings,
  getSystemSettings,
} from '../controllers/adminController';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('ADMIN'));

// User management
router.get('/users', asyncHandler(getAllUsers));
router.get('/users/:id', asyncHandler(getUserById));
router.put('/users/:id', asyncHandler(updateUser));
router.delete('/users/:id', asyncHandler(deleteUser));

// Report management
router.get('/reports', asyncHandler(getAllReports));
router.get('/reports/:id', asyncHandler(getReportById));
router.put('/reports/:id/status', asyncHandler(updateReportStatus));

// System management
router.get('/stats', asyncHandler(getSystemStats));
router.get('/settings', asyncHandler(getSystemSettings));
router.put('/settings', asyncHandler(updateSystemSettings));

// Pricing management
router.get('/pricing', asyncHandler(getServicePricing));
router.put('/pricing', asyncHandler(updateServicePricing));

export default router;
