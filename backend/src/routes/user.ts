/**
 * User Routes (Kullanıcı Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, kullanıcı yönetimi ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Kredi Yönetimi:
 *    - GET /credits (Kredi bakiyesi)
 *    - POST /credits/purchase (Kredi satın al)
 *    - GET /credits/history (Kredi geçmişi)
 * 
 * 2. Rapor Yönetimi:
 *    - GET /reports (Kullanıcı raporları)
 * 
 * 3. Hesap Yönetimi:
 *    - DELETE /account (Hesap silme)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Async error handling (asyncHandler)
 * - User-specific data (req.user.id kullanılır)
 * 
 * Güvenlik:
 * - JWT authentication zorunlu
 * - Kullanıcı sadece kendi verilerine erişebilir
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getUserCredits,
  purchaseCredits,
  getCreditHistory,
  getCreditTransactions,
  getUserReports,
  deleteAccount,
} from '../controllers/userController';

const router = Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * Bu dosyadaki tüm endpoint'ler JWT authentication gerektirir.
 * 
 * authenticate middleware:
 * - JWT token kontrolü
 * - req.user'a kullanıcı bilgileri eklenir
 */
router.use(authenticate);

// ===== CREDIT MANAGEMENT ROUTES (KREDİ YÖNETİMİ) =====

/**
 * GET /user/credits
 * 
 * Kullanıcının kredi bakiyesini getir.
 * 
 * Response:
 * - balance: Mevcut bakiye
 * - totalPurchased: Toplam satın alınan
 * - totalUsed: Toplam kullanılan
 */
router.get('/credits', asyncHandler(getUserCredits));

/**
 * POST /user/credits/purchase
 * 
 * Kredi satın alma.
 * 
 * Body:
 * - amount: number (satın alınacak kredi miktarı)
 * - paymentMethod?: string
 * 
 * İş Akışı:
 * 1. Ödeme işlemi
 * 2. Kredi ekleme
 * 3. Transaction kaydı
 */
router.post('/credits/purchase', asyncHandler(purchaseCredits));

/**
 * GET /user/credits/history
 * 
 * Kredi işlem geçmişi.
 * 
 * Query:
 * - page?: number
 * - limit?: number
 * 
 * Response:
 * - transactions: Kredi işlemleri (PURCHASE, USAGE, REFUND)
 * - pagination: Sayfalama bilgisi
 */
router.get('/credits/history', asyncHandler(getCreditHistory));

/**
 * GET /user/credits/transactions
 * 
 * Kredi işlem geçmişi (detaylı).
 * 
 * Query:
 * - page?: number
 * - limit?: number
 * 
 * Response:
 * - transactions: Kredi işlemleri detayları
 * - pagination: Sayfalama bilgisi
 */
router.get('/credits/transactions', asyncHandler(getCreditTransactions));

// ===== USER REPORTS ROUTES (KULLANICI RAPORLARI) =====

/**
 * GET /user/reports
 * 
 * Kullanıcının tüm raporlarını getir.
 * 
 * Query:
 * - page?: number
 * - limit?: number
 * - status?: string (PENDING, PROCESSING, COMPLETED, FAILED)
 * - type?: string (DAMAGE_ASSESSMENT, PAINT_ANALYSIS, vb.)
 * 
 * Response:
 * - reports: Rapor listesi
 * - pagination: Sayfalama bilgisi
 */
router.get('/reports', asyncHandler(getUserReports));

// ===== ACCOUNT MANAGEMENT ROUTES (HESAP YÖNETİMİ) =====

/**
 * DELETE /user/account
 * 
 * Kullanıcı hesabını sil (soft delete veya hard delete).
 * 
 * UYARI:
 * - Bu işlem geri alınamaz!
 * - Tüm kullanıcı verileri silinir:
 *   - Raporlar
 *   - Görseller
 *   - Krediler
 *   - Araçlar
 * 
 * İş Akışı:
 * 1. Onay kontrolü (şifre veya email doğrulama)
 * 2. İlişkili verileri sil (cascade)
 * 3. Kullanıcı kaydını sil
 * 4. JWT token'ı invalidate et
 * 
 * Body:
 * - password: string (onay için)
 * - reason?: string (silme sebebi)
 */
router.delete('/account', asyncHandler(deleteAccount));

export default router;
