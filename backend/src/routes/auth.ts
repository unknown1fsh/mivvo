import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from '../controllers/authController';

const router = Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('firstName').notEmpty().withMessage('Ad alanı zorunludur'),
  body('lastName').notEmpty().withMessage('Soyad alanı zorunludur'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre alanı zorunludur'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mevcut şifre zorunludur'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır'),
];

const updateProfileValidation = [
  body('firstName').optional().notEmpty().withMessage('Ad boş olamaz'),
  body('lastName').optional().notEmpty().withMessage('Soyad boş olamaz'),
  body('phone').optional().isMobilePhone('tr-TR').withMessage('Geçerli bir telefon numarası giriniz'),
];

// Public routes
router.post('/register', registerValidation, asyncHandler(register));
router.post('/login', loginValidation, asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/verify-email/:token', asyncHandler(verifyEmail));

// Protected routes
router.use(authenticate); // All routes below require authentication

router.post('/logout', asyncHandler(logout));
router.get('/profile', asyncHandler(getProfile));
router.put('/profile', updateProfileValidation, asyncHandler(updateProfile));
router.put('/change-password', changePasswordValidation, asyncHandler(changePassword));

export default router;
