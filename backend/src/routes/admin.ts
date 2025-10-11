/**
 * Admin Routes (Admin Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, admin yönetimi ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Kullanıcı Yönetimi:
 *    - GET /users (Tüm kullanıcılar)
 *    - GET /users/:id (Kullanıcı detayı)
 *    - PUT /users/:id (Kullanıcı güncelle)
 *    - DELETE /users/:id (Kullanıcı sil)
 * 
 * 2. Rapor Yönetimi:
 *    - GET /reports (Tüm raporlar)
 *    - GET /reports/:id (Rapor detayı)
 *    - PUT /reports/:id/status (Rapor durumu güncelle)
 * 
 * 3. Sistem Yönetimi:
 *    - GET /stats (Sistem istatistikleri)
 *    - GET /settings (Sistem ayarları)
 *    - PUT /settings (Sistem ayarları güncelle)
 * 
 * 4. Fiyatlandırma Yönetimi:
 *    - GET /pricing (Servis fiyatları)
 *    - PUT /pricing (Servis fiyatları güncelle)
 * 
 * Özellikler:
 * - Tüm route'lar ADMIN rolü gerektirir
 * - Authentication + Authorization middleware
 * - Async error handling
 * 
 * Güvenlik:
 * - JWT authentication zorunlu
 * - ADMIN role kontrolü (authorize middleware)
 * - Hassas işlemler için audit log (TODO)
 */

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
  addUserCredits,
  resetUserCredits,
  refundUserCredits,
  suspendUser,
  activateUser,
  hardDeleteUser,
  getDetailedStats,
  getTimelineStats,
  getReportsBreakdown,
} from '../controllers/adminController';

const router = Router();

// ===== AUTHENTICATION & AUTHORIZATION MIDDLEWARE =====

/**
 * Authentication Middleware
 * 
 * JWT token kontrolü yapar.
 */
router.use(authenticate);

/**
 * Authorization Middleware (ADMIN)
 * 
 * Kullanıcının ADMIN rolüne sahip olduğunu kontrol eder.
 * 
 * Sadece ADMIN kullanıcılar bu route'lara erişebilir.
 */
router.use(authorize('ADMIN'));

// ===== USER MANAGEMENT ROUTES (KULLANICI YÖNETİMİ) =====

/**
 * GET /admin/users
 * 
 * Tüm kullanıcıları listele.
 * 
 * Query:
 * - page?: number
 * - limit?: number
 * - role?: string (ADMIN, USER)
 * - status?: string (ACTIVE, INACTIVE, BANNED)
 * - search?: string (email/ad/soyad)
 * 
 * Response:
 * - users: Kullanıcı listesi
 * - pagination: Sayfalama bilgisi
 */
router.get('/users', asyncHandler(getAllUsers));

/**
 * GET /admin/users/:id
 * 
 * Belirli bir kullanıcının detaylarını getir.
 * 
 * Params:
 * - id: User ID
 * 
 * Response:
 * - Kullanıcı bilgileri
 * - Kredi bilgileri
 * - Rapor özeti
 * - İşlem geçmişi
 */
router.get('/users/:id', asyncHandler(getUserById));

/**
 * PUT /admin/users/:id
 * 
 * Kullanıcı bilgilerini güncelle.
 * 
 * Params:
 * - id: User ID
 * 
 * Body:
 * - role?: string (ADMIN, USER)
 * - status?: string (ACTIVE, INACTIVE, BANNED)
 * - credits?: number (kredi ekleme/çıkarma)
 * 
 * UYARI:
 * - Role değişikliği hassas işlemdir!
 * - Audit log tutulmalı
 */
router.put('/users/:id', asyncHandler(updateUser));

/**
 * DELETE /admin/users/:id
 * 
 * Kullanıcıyı sil (hard delete).
 * 
 * Params:
 * - id: User ID
 * 
 * UYARI:
 * - İlişkili tüm veriler silinir (cascade)
 * - Geri alınamaz!
 * - Audit log tutulmalı
 */
router.delete('/users/:id', asyncHandler(deleteUser));

// ===== REPORT MANAGEMENT ROUTES (RAPOR YÖNETİMİ) =====

/**
 * GET /admin/reports
 * 
 * Tüm raporları listele.
 * 
 * Query:
 * - page?: number
 * - limit?: number
 * - status?: string
 * - type?: string
 * - userId?: number (belirli kullanıcının raporları)
 * 
 * Response:
 * - reports: Rapor listesi
 * - pagination: Sayfalama bilgisi
 */
router.get('/reports', asyncHandler(getAllReports));

/**
 * GET /admin/reports/:id
 * 
 * Belirli bir raporun detaylarını getir.
 * 
 * Params:
 * - id: Report ID
 * 
 * Response:
 * - Rapor bilgileri
 * - AI analiz sonuçları
 * - Görseller
 * - Kullanıcı bilgileri
 */
router.get('/reports/:id', asyncHandler(getReportById));

/**
 * PUT /admin/reports/:id/status
 * 
 * Rapor durumunu güncelle.
 * 
 * Params:
 * - id: Report ID
 * 
 * Body:
 * - status: string (PENDING, PROCESSING, COMPLETED, FAILED)
 * - notes?: string (admin notları)
 * 
 * Kullanım:
 * - Manuel müdahale gerektiğinde
 * - Hatalı raporları düzeltmek için
 */
router.put('/reports/:id/status', asyncHandler(updateReportStatus));

// ===== SYSTEM MANAGEMENT ROUTES (SİSTEM YÖNETİMİ) =====

/**
 * GET /admin/stats
 * 
 * Sistem istatistiklerini getir.
 * 
 * Response:
 * - totalUsers: Toplam kullanıcı sayısı
 * - activeUsers: Aktif kullanıcı sayısı
 * - totalReports: Toplam rapor sayısı
 * - reportsToday: Bugünkü rapor sayısı
 * - totalRevenue: Toplam gelir
 * - popularServices: Popüler servisler
 * - systemHealth: Sistem sağlığı
 */
router.get('/stats', asyncHandler(getSystemStats));

/**
 * GET /admin/settings
 * 
 * Sistem ayarlarını getir.
 * 
 * Response:
 * - maintenance: Bakım modu
 * - emailSettings: Email ayarları
 * - aiSettings: AI konfigürasyonu
 * - securitySettings: Güvenlik ayarları
 */
router.get('/settings', asyncHandler(getSystemSettings));

/**
 * PUT /admin/settings
 * 
 * Sistem ayarlarını güncelle.
 * 
 * Body:
 * - maintenance?: boolean
 * - emailSettings?: object
 * - aiSettings?: object
 * - securitySettings?: object
 * 
 * UYARI:
 * - Kritik ayarlar değiştirilebilir!
 * - Audit log tutulmalı
 */
router.put('/settings', asyncHandler(updateSystemSettings));

// ===== PRICING MANAGEMENT ROUTES (FİYATLANDIRMA YÖNETİMİ) =====

/**
 * GET /admin/pricing
 * 
 * Tüm servis fiyatlarını getir.
 * 
 * Response:
 * - services: Servis listesi ve fiyatları
 *   - DAMAGE_ASSESSMENT
 *   - PAINT_ANALYSIS
 *   - VALUE_ESTIMATION
 *   - ENGINE_SOUND_ANALYSIS
 *   - FULL_REPORT
 */
router.get('/pricing', asyncHandler(getServicePricing));

/**
 * PUT /admin/pricing
 * 
 * Servis fiyatlarını güncelle.
 * 
 * Body:
 * - serviceType: string
 * - basePrice: number
 * - isActive: boolean
 * 
 * UYARI:
 * - Fiyat değişiklikleri mevcut raporları etkilemez
 * - Sadece yeni raporlar için geçerli
 * - Audit log tutulmalı
 */
router.put('/pricing', asyncHandler(updateServicePricing));

// ===== CREDIT MANAGEMENT ROUTES (KREDİ YÖNETİMİ) =====

/**
 * POST /admin/users/:id/credits/add
 * 
 * Kullanıcıya kredi ekle.
 * 
 * Body:
 * - amount: number (eklenecek kredi)
 * - description?: string (işlem açıklaması)
 */
router.post('/users/:id/credits/add', asyncHandler(addUserCredits));

/**
 * POST /admin/users/:id/credits/reset
 * 
 * Kullanıcı kredilerini sıfırla.
 * 
 * Body:
 * - reason?: string (sıfırlama sebebi)
 */
router.post('/users/:id/credits/reset', asyncHandler(resetUserCredits));

/**
 * POST /admin/users/:id/credits/refund
 * 
 * Kullanıcıya kredi iadesi yap.
 * 
 * Body:
 * - amount: number (iade miktarı)
 * - reason?: string (iade sebebi)
 */
router.post('/users/:id/credits/refund', asyncHandler(refundUserCredits));

// ===== USER STATUS MANAGEMENT ROUTES (KULLANICI DURUM YÖNETİMİ) =====

/**
 * POST /admin/users/:id/suspend
 * 
 * Kullanıcıyı dondur (deaktive et).
 * 
 * Body:
 * - reason?: string (dondurma sebebi)
 */
router.post('/users/:id/suspend', asyncHandler(suspendUser));

/**
 * POST /admin/users/:id/activate
 * 
 * Kullanıcıyı aktifleştir.
 */
router.post('/users/:id/activate', asyncHandler(activateUser));

/**
 * DELETE /admin/users/:id/hard-delete
 * 
 * Kullanıcıyı kalıcı olarak sil (hard delete).
 * 
 * Body:
 * - confirm: boolean (true olmalı)
 * 
 * UYARI:
 * - Bu işlem geri alınamaz!
 * - Tüm ilişkili veriler silinir
 */
router.delete('/users/:id/hard-delete', asyncHandler(hardDeleteUser));

// ===== DETAILED ANALYTICS ROUTES (DETAYLI ANALİTİKS) =====

/**
 * GET /admin/stats/detailed
 * 
 * Detaylı sistem istatistiklerini getir.
 * 
 * Response:
 * - Kullanıcı istatistikleri (toplam, aktif, yeni)
 * - Rapor istatistikleri (toplam, durum dağılımı)
 * - Gelir bilgileri
 * - Kredi dolaşımı
 */
router.get('/stats/detailed', asyncHandler(getDetailedStats));

/**
 * GET /admin/stats/timeline
 * 
 * Zaman serisi istatistiklerini getir (trend analizi).
 * 
 * Query:
 * - days?: number (default: 30)
 * 
 * Response:
 * - Günlük kullanıcı, rapor ve gelir verileri
 */
router.get('/stats/timeline', asyncHandler(getTimelineStats));

/**
 * GET /admin/stats/reports-breakdown
 * 
 * Rapor tip dağılımını getir.
 * 
 * Response:
 * - Rapor tiplerine göre sayı ve gelir dağılımı
 */
router.get('/stats/reports-breakdown', asyncHandler(getReportsBreakdown));

export default router;
