import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  createPayment,
  getPaymentMethods,
  processPayment,
  getPaymentHistory,
  refundPayment,
} from '../controllers/paymentController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const createPaymentValidation = [
  body('amount').isFloat({ min: 50, max: 5000 })
    .withMessage('Ödeme tutarı 50-5000 TL arasında olmalıdır'),
  body('paymentMethod').isIn(['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'])
    .withMessage('Geçerli bir ödeme yöntemi seçiniz'),
];

const refundValidation = [
  body('paymentId').isInt().withMessage('Geçerli bir ödeme ID giriniz'),
  body('reason').notEmpty().withMessage('İade sebebi zorunludur'),
];

// Payment management
router.get('/methods', asyncHandler(getPaymentMethods));
router.post('/create', createPaymentValidation, asyncHandler(createPayment));
router.post('/process', asyncHandler(processPayment));
router.get('/history', asyncHandler(getPaymentHistory));
router.post('/refund', refundValidation, asyncHandler(refundPayment));

export default router;
