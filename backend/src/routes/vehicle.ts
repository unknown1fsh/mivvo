import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createReport,
  getReport,
  getReports,
  uploadImages,
  getAnalysisResults,
  downloadReport,
} from '../controllers/vehicleController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const createReportValidation = [
  body('reportType').isIn(['FULL', 'PAINT_ANALYSIS', 'DAMAGE_ASSESSMENT', 'VALUE_ESTIMATION'])
    .withMessage('Geçerli bir rapor türü seçiniz'),
  body('vehiclePlate').optional().isLength({ min: 7, max: 8 })
    .withMessage('Plaka 7-8 karakter olmalıdır'),
  body('vehicleBrand').optional().notEmpty().withMessage('Marka boş olamaz'),
  body('vehicleModel').optional().notEmpty().withMessage('Model boş olamaz'),
  body('vehicleYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Geçerli bir yıl giriniz'),
];

// Report management
router.post('/reports', createReportValidation, asyncHandler(createReport));
router.get('/reports', asyncHandler(getReports));
router.get('/reports/:id', asyncHandler(getReport));
router.get('/reports/:id/download', asyncHandler(downloadReport));

// Image upload
router.post('/reports/:id/images', asyncHandler(uploadImages));

// Analysis results
router.get('/reports/:id/analysis', asyncHandler(getAnalysisResults));

export default router;
