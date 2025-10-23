/**
 * Auth Routes (Kimlik Doğrulama Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, kimlik doğrulama ile ilgili tüm route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Public Routes (Açık Rotalar):
 *    - POST /register (Kayıt ol)
 *    - POST /login (Giriş yap)
 *    - POST /forgot-password (Şifre sıfırlama talebi)
 *    - POST /reset-password (Şifre sıfırla)
 *    - GET /verify-email/:token (Email doğrula)
 * 
 * 2. Protected Routes (Korumalı Rotalar):
 *    - POST /logout (Çıkış yap)
 *    - GET /profile (Profil getir)
 *    - PUT /profile (Profil güncelle)
 *    - PUT /change-password (Şifre değiştir)
 * 
 * Özellikler:
 * - Express Validator ile input validation
 * - Async error handling (asyncHandler)
 * - JWT-based authentication (authenticate middleware)
 * - Türkçe hata mesajları
 * 
 * Validation Kuralları:
 * - Email: Geçerli email formatı, normalize edilmiş
 * - Şifre: Min 6 karakter
 * - Ad/Soyad: Boş olamaz
 * - Telefon: Türk telefon numarası formatı (tr-TR)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { createRateLimit } from '../utils/rateLimit';
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
  resendVerification,
  oauthLogin,
} from '../controllers/authController';

const router = Router();

// ===== RATE LIMITING MIDDLEWARE =====

// Login için özel rate limiting (veritabanı kotasını korumak için)
const loginRateLimit = createRateLimit(5, 15 * 60 * 1000); // 15 dakikada 5 login denemesi
const registerRateLimit = createRateLimit(3, 60 * 60 * 1000); // 1 saatte 3 kayıt
const passwordResetRateLimit = createRateLimit(3, 60 * 60 * 1000); // 1 saatte 3 şifre sıfırlama
const generalRateLimit = createRateLimit(100, 15 * 60 * 1000); // 15 dakikada 100 istek

// ===== VALIDATION MIDDLEWARE =====

/**
 * Kayıt Doğrulama
 * 
 * Yeni kullanıcı kaydı için input validation.
 * 
 * Kurallar:
 * - email: Geçerli email formatı + normalize
 * - password: Min 6 karakter
 * - firstName: Zorunlu
 * - lastName: Zorunlu
 */
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalıdır'),
  body('firstName').notEmpty().withMessage('Ad alanı zorunludur'),
  body('lastName').notEmpty().withMessage('Soyad alanı zorunludur'),
];

/**
 * Giriş Doğrulama
 * 
 * Kullanıcı girişi için input validation.
 * 
 * Kurallar:
 * - email: Geçerli email formatı + normalize
 * - password: Zorunlu
 */
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir email adresi giriniz'),
  body('password').notEmpty().withMessage('Şifre alanı zorunludur'),
];

/**
 * Şifre Değiştirme Doğrulama
 * 
 * Mevcut kullanıcının şifre değişimi için validation.
 * 
 * Kurallar:
 * - currentPassword: Zorunlu (mevcut şifre kontrolü için)
 * - newPassword: Min 6 karakter
 */
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Mevcut şifre zorunludur'),
  body('newPassword').isLength({ min: 6 }).withMessage('Yeni şifre en az 6 karakter olmalıdır'),
];

/**
 * Profil Güncelleme Doğrulama
 * 
 * Kullanıcı profil bilgileri için validation.
 * 
 * Kurallar:
 * - firstName: Opsiyonel, boş olamaz
 * - lastName: Opsiyonel, boş olamaz
 * - phone: Opsiyonel, Türk telefon formatı (tr-TR)
 */
const updateProfileValidation = [
  body('firstName').optional().notEmpty().withMessage('Ad boş olamaz'),
  body('lastName').optional().notEmpty().withMessage('Soyad boş olamaz'),
  body('phone').optional().isMobilePhone('tr-TR').withMessage('Geçerli bir telefon numarası giriniz'),
];

// ===== PUBLIC ROUTES (AÇIK ROTALAR) =====

/**
 * POST /auth/register
 * 
 * Yeni kullanıcı kaydı.
 * 
 * Middleware:
 * - registerRateLimit: Rate limiting (1 saatte 3 kayıt)
 * - registerValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Body:
 * - email: string
 * - password: string
 * - firstName: string
 * - lastName: string
 * - phone?: string
 */
router.post('/register', registerRateLimit, registerValidation, asyncHandler(register));

/**
 * POST /auth/login
 * 
 * Kullanıcı girişi.
 * 
 * Middleware:
 * - loginRateLimit: Rate limiting (15 dakikada 5 login denemesi)
 * - loginValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Body:
 * - email: string
 * - password: string
 * 
 * Response:
 * - token: JWT token
 * - user: Kullanıcı bilgileri
 */
router.post('/login', loginRateLimit, loginValidation, asyncHandler(login));

/**
 * POST /auth/forgot-password
 * 
 * Şifre sıfırlama talebi.
 * 
 * Middleware:
 * - passwordResetRateLimit: Rate limiting (1 saatte 3 şifre sıfırlama)
 * - asyncHandler: Async error handling
 * 
 * Email ile şifre sıfırlama linki gönderilir.
 * 
 * Body:
 * - email: string
 */
router.post('/forgot-password', passwordResetRateLimit, asyncHandler(forgotPassword));

/**
 * POST /auth/reset-password
 * 
 * Şifre sıfırlama (token ile).
 * 
 * Middleware:
 * - passwordResetRateLimit: Rate limiting
 * - asyncHandler: Async error handling
 * 
 * Forgot-password ile gönderilen token kullanılır.
 * 
 * Body:
 * - token: string
 * - newPassword: string
 */
router.post('/reset-password', passwordResetRateLimit, asyncHandler(resetPassword));

/**
 * GET /auth/verify-email/:token
 * 
 * Email adresi doğrulama.
 * 
 * Middleware:
 * - generalRateLimit: Rate limiting
 * - asyncHandler: Async error handling
 * 
 * Kayıt sonrası gönderilen email link'i ile doğrulama.
 * 
 * Params:
 * - token: Email verification token
 */
router.get('/verify-email/:token', generalRateLimit, asyncHandler(verifyEmail));

/**
 * POST /auth/resend-verification
 * 
 * Email doğrulama token'ını yeniden gönder.
 * 
 * Middleware:
 * - passwordResetRateLimit: Rate limiting
 * - asyncHandler: Async error handling
 * 
 * Email doğrulama linkini tekrar gönderir.
 * 
 * Body:
 * - email: string
 */
router.post('/resend-verification', passwordResetRateLimit, asyncHandler(resendVerification));

/**
 * POST /auth/oauth
 * 
 * OAuth ile giriş (Google, Facebook).
 * 
 * Middleware:
 * - loginRateLimit: Rate limiting
 * - asyncHandler: Async error handling
 * 
 * OAuth provider'lar ile giriş yapar.
 * 
 * Body:
 * - provider: string (google, facebook)
 * - providerId: string
 * - email: string
 * - name: string
 * - image?: string
 * - accessToken?: string
 */
router.post('/oauth', loginRateLimit, asyncHandler(oauthLogin));

// ===== PROTECTED ROUTES (KORUMALІ ROTALAR) =====

/**
 * Authentication Middleware
 * 
 * Aşağıdaki tüm route'lar için JWT authentication gereklidir.
 * 
 * authenticate middleware:
 * - JWT token kontrolü
 * - Token geçerliliği
 * - User bilgilerini req.user'a ekler
 */
router.use(authenticate); // All routes below require authentication

/**
 * POST /auth/logout
 * 
 * Kullanıcı çıkışı.
 * 
 * Middleware:
 * - generalRateLimit: Rate limiting
 * - asyncHandler: Async error handling
 * 
 * JWT token invalidate edilir (blacklist'e eklenir).
 * 
 * Headers:
 * - Authorization: Bearer {token}
 */
router.post('/logout', generalRateLimit, asyncHandler(logout));

/**
 * GET /auth/profile
 * 
 * Kullanıcı profil bilgilerini getir.
 * 
 * Middleware:
 * - generalRateLimit: Rate limiting
 * - asyncHandler: Async error handling
 * 
 * JWT token'dan user ID alınır ve profil döndürülür.
 * 
 * Headers:
 * - Authorization: Bearer {token}
 * 
 * Response:
 * - id, email, firstName, lastName, phone, role, credits, vb.
 */
router.get('/profile', generalRateLimit, asyncHandler(getProfile));

/**
 * PUT /auth/profile
 * 
 * Kullanıcı profil bilgilerini güncelle.
 * 
 * Middleware:
 * - generalRateLimit: Rate limiting
 * - updateProfileValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Headers:
 * - Authorization: Bearer {token}
 * 
 * Body:
 * - firstName?: string
 * - lastName?: string
 * - phone?: string
 */
router.put('/profile', generalRateLimit, updateProfileValidation, asyncHandler(updateProfile));

/**
 * PUT /auth/change-password
 * 
 * Kullanıcı şifresini değiştir.
 * 
 * Middleware:
 * - generalRateLimit: Rate limiting
 * - changePasswordValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Headers:
 * - Authorization: Bearer {token}
 * 
 * Body:
 * - currentPassword: string (mevcut şifre)
 * - newPassword: string (yeni şifre)
 */
router.put('/change-password', generalRateLimit, changePasswordValidation, asyncHandler(changePassword));

export default router;
