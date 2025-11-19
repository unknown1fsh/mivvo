/**
 * Payment Routes (Ödeme Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, ödeme işlemleri ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Ödeme İşlemleri:
 *    - GET /methods (Ödeme yöntemleri)
 *    - POST /create (Ödeme oluştur)
 *    - POST /process (Ödeme işle)
 * 
 * 2. Ödeme Geçmişi:
 *    - GET /history (Ödeme geçmişi)
 * 
 * 3. İade İşlemleri:
 *    - POST /refund (İade)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Express Validator ile input validation
 * - Async error handling
 * 
 * Ödeme Yöntemleri:
 * - CREDIT_CARD: Kredi kartı
 * - BANK_TRANSFER: Banka havalesi
 * - DIGITAL_WALLET: Dijital cüzdan
 * 
 * TODO:
 * - Iyzico API entegrasyonu
 * - Webhook endpoint
 * - 3D Secure desteği
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  initiatePayment,
  verifyPayment,
  refundPayment,
} from '../controllers/paymentController';
import { handleIyzicoWebhook } from '../controllers/paymentWebhookController';

const router = Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate);

// ===== VALIDATION MIDDLEWARE =====

/**
 * Ödeme Oluşturma Doğrulama
 * 
 * Yeni ödeme kaydı için input validation.
 * 
 * Kurallar:
 * - amount: 50-5000 TL arası (float)
 * - paymentMethod: Geçerli ödeme yöntemi
 */
const createPaymentValidation = [
  body('amount').isFloat({ min: 50, max: 5000 })
    .withMessage('Ödeme tutarı 50-5000 TL arasında olmalıdır'),
  body('paymentMethod').isIn(['CREDIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET'])
    .withMessage('Geçerli bir ödeme yöntemi seçiniz'),
];

/**
 * İade Doğrulama
 * 
 * İade işlemi için input validation.
 * 
 * Kurallar:
 * - paymentId: Integer (ödeme ID)
 * - reason: Zorunlu (iade sebebi)
 */
const refundValidation = [
  body('paymentId').isInt().withMessage('Geçerli bir ödeme ID giriniz'),
  body('reason').notEmpty().withMessage('İade sebebi zorunludur'),
];

// ===== PAYMENT MANAGEMENT ROUTES (ÖDEME YÖNETİMİ) =====

/**
 * GET /payment/methods
 * 
 * Mevcut ödeme yöntemlerini listele.
 * 
 * Response:
 * - paymentMethods: Ödeme yöntemleri
 *   - CREDIT_CARD: Kredi kartı (💳)
 *   - BANK_TRANSFER: Banka havalesi (🏦)
 *   - DIGITAL_WALLET: Dijital cüzdan (📱)
 */
// router.get('/methods', asyncHandler(getPaymentMethods)); // Removed deprecated endpoint

/**
 * POST /payment/create
 * 
 * Yeni ödeme kaydı oluştur.
 * 
 * Middleware:
 * - createPaymentValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Body:
 * - amount: number (50-5000 TL)
 * - paymentMethod: string
 * 
 * İş Akışı:
 * 1. Tutar kontrolü (min-max)
 * 2. Payment kaydı oluştur (PENDING)
 * 3. Reference number oluştur (PAY_timestamp)
 * 4. Kullanıcıya döndür
 * 
 * Sonraki Adım:
 * - Frontend: Payment gateway'e yönlendir
 * - Backend: processPayment ile tamamla
 * 
 * Response:
 * - payment: Oluşturulan ödeme kaydı
 */
// router.post('/create', createPaymentValidation, asyncHandler(createPayment)); // Removed deprecated endpoint

/**
 * POST /payment/process
 * 
 * Ödemeyi işle ve sonucu güncelle.
 * 
 * Body:
 * - paymentId: number
 * - paymentData: object (kart bilgisi vb. - TODO: Iyzico)
 * 
 * İş Akışı:
 * 1. Payment kaydı kontrolü (PENDING mi?)
 * 2. Payment gateway'e istek (Iyzico - TODO)
 * 3. Başarılıysa:
 *    - Payment status: COMPLETED
 *    - TransactionId güncelle
 *    - Kredi ekle
 *    - CreditTransaction oluştur
 * 4. Başarısızsa: Payment status: FAILED
 * 
 * TODO:
 * - Iyzico API entegrasyonu
 * - 3D Secure callback
 * 
 * Şu anda:
 * - Simülasyon (90% başarı)
 * 
 * Response:
 * - payment: Güncellenmiş ödeme
 */
// router.post('/process', asyncHandler(processPayment)); // Removed deprecated endpoint

/**
 * GET /payment/history
 * 
 * Kullanıcının ödeme geçmişini listele.
 * 
 * Query:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - status?: string (PENDING, COMPLETED, FAILED, REFUNDED)
 * 
 * Response:
 * - payments: Ödeme listesi
 * - pagination: Sayfalama bilgisi
 */
// router.get('/history', asyncHandler(getPaymentHistory)); // Removed deprecated endpoint

/**
 * POST /payment/refund
 * 
 * Ödeme iadesi.
 * 
 * Middleware:
 * - refundValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Body:
 * - paymentId: number
 * - reason: string (iade sebebi)
 * 
 * İş Akışı:
 * 1. Payment kontrolü (COMPLETED olmalı)
 * 2. İade işlemi (payment gateway - TODO)
 * 3. Payment status: REFUNDED
 * 4. Kullanıcıdan kredi düş
 * 5. CreditTransaction oluştur (REFUND)
 * 
 * TODO:
 * - Iyzico refund API
 * - Kısmi iade desteği
 * - İade süresi kontrolü (30 gün)
 * 
 * Response:
 * - payment: Güncellenmiş ödeme (REFUNDED)
 */
router.post('/refund', refundValidation, asyncHandler(refundPayment));

// ===== WEBHOOK ROUTES =====

/**
 * POST /payment/webhook/iyzico
 * 
 * İyzico webhook endpoint'i.
 * 
 * Authentication: Yok (İyzico'dan gelen istekler)
 * Validation: Webhook signature doğrulama
 */
router.post('/webhook/iyzico', asyncHandler(handleIyzicoWebhook));

// ===== PAYMENT INITIATE AND VERIFY ROUTES =====

/**
 * POST /payment/initiate
 * 
 * Ödeme başlatma endpoint'i.
 */
router.post('/initiate', asyncHandler(initiatePayment));

/**
 * POST /payment/verify
 * 
 * Ödeme doğrulama endpoint'i.
 */
router.post('/verify', asyncHandler(verifyPayment));

export default router;
