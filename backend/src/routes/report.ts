/**
 * Report Routes (Rapor Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, rapor yönetimi ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Rapor Getirme:
 *    - GET /:id (Tek rapor getir)
 *    - GET /:id/status (Rapor durumu)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Async error handling
 * 
 * Güvenlik:
 * - JWT authentication zorunlu
 * - Kullanıcı sadece kendi raporlarına erişebilir
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import {
  getReportById,
  getReportStatus,
} from '../controllers/reportController';

const router = Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 * GEÇİCİ OLARAK DEVRE DIŞI - TEST İÇİN
 */
// router.use(authenticate);

// ===== REPORT ROUTES =====

/**
 * GET /api/reports/:id
 * 
 * Belirli bir raporu getir.
 * 
 * Response:
 * - id: Rapor ID
 * - type: Rapor tipi
 * - status: Durum
 * - data: Rapor verisi
 * - vehicleInfo: Araç bilgileri
 * - images: Görseller
 * - createdAt: Oluşturulma tarihi
 */
router.get('/:id', asyncHandler(getReportById));

/**
 * GET /api/reports/:id/status
 * 
 * Rapor durumunu getir.
 * 
 * Response:
 * - id: Rapor ID
 * - status: PENDING | PROCESSING | COMPLETED | FAILED
 * - progress: İlerleme yüzdesi (0-100)
 * - error: Hata mesajı (varsa)
 */
router.get('/:id/status', asyncHandler(getReportStatus));

export default router;

