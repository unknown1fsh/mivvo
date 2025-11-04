/**
 * Vehicle Routes (Araç Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, araç raporu yönetimi ile ilgili route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Rapor Yönetimi:
 *    - POST /reports (Rapor oluştur)
 *    - GET /reports (Raporları listele)
 *    - GET /reports/:id (Rapor detayı)
 *    - GET /reports/:id/download (Rapor indir)
 * 
 * 2. Görsel Yükleme:
 *    - POST /reports/:id/images (Görsel yükle)
 * 
 * 3. Analiz Sonuçları:
 *    - GET /reports/:id/analysis (Analiz sonuçları)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Express Validator ile input validation
 * - Async error handling
 * 
 * Validation Kuralları:
 * - reportType: FULL, PAINT_ANALYSIS, DAMAGE_ASSESSMENT, VALUE_ESTIMATION
 * - vehiclePlate: 7-8 karakter (Türk plaka formatı)
 * - vehicleYear: 1900 - (şimdiki yıl + 1)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validationHandler';
import {
  createReport,
  getReport,
  getReports,
  uploadImages,
  getAnalysisResults,
  downloadReport,
} from '../controllers/vehicleController';

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
 * Rapor Oluşturma Doğrulama
 * 
 * Yeni rapor oluşturma için input validation.
 * 
 * Kurallar:
 * - reportType: Geçerli rapor türü
 * - vehiclePlate: Opsiyonel, 7-8 karakter
 * - vehicleBrand: Opsiyonel, boş olamaz
 * - vehicleModel: Opsiyonel, boş olamaz
 * - vehicleYear: Opsiyonel, geçerli yıl aralığı
 */
const createReportValidation = [
  body('reportType').isIn(['FULL_REPORT', 'PAINT_ANALYSIS', 'DAMAGE_ASSESSMENT', 'DAMAGE_ANALYSIS', 'VALUE_ESTIMATION', 'ENGINE_SOUND_ANALYSIS', 'COMPREHENSIVE_EXPERTISE'])
    .withMessage('Geçerli bir rapor türü seçiniz'),
  body('vehiclePlate').optional().isLength({ min: 7, max: 8 })
    .withMessage('Plaka 7-8 karakter olmalıdır'),
  body('vehicleBrand').optional().notEmpty().withMessage('Marka boş olamaz'),
  body('vehicleModel').optional().notEmpty().withMessage('Model boş olamaz'),
  body('vehicleYear').optional().isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Geçerli bir yıl giriniz'),
];

// ===== REPORT MANAGEMENT ROUTES (RAPOR YÖNETİMİ) =====

/**
 * POST /vehicle/reports
 * 
 * Yeni araç raporu oluştur.
 * 
 * Middleware:
 * - createReportValidation: Input validation
 * - asyncHandler: Async error handling
 * 
 * Body:
 * - reportType: string (FULL, PAINT_ANALYSIS, DAMAGE_ASSESSMENT, VALUE_ESTIMATION)
 * - vehiclePlate: string
 * - vehicleBrand: string
 * - vehicleModel: string
 * - vehicleYear: number
 * - vehicleColor?: string
 * - mileage?: number
 * 
 * İş Akışı:
 * 1. Servis fiyatı getir
 * 2. Kredi kontrolü
 * 3. Rapor oluştur (PENDING)
 * 4. Kredi düş
 * 5. CreditTransaction oluştur
 * 
 * Response:
 * - report: Oluşturulan rapor
 */
router.post('/reports', createReportValidation, validate, asyncHandler(createReport));

/**
 * GET /vehicle/reports
 * 
 * Kullanıcının tüm raporlarını listele.
 * 
 * Query:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - status?: string (PENDING, PROCESSING, COMPLETED, FAILED)
 * 
 * Response:
 * - reports: Rapor listesi (görseller ve analiz sonuçları dahil)
 * - pagination: Sayfalama bilgisi
 */
router.get('/reports', asyncHandler(getReports));

/**
 * GET /vehicle/reports/:id
 * 
 * Belirli bir raporu getir.
 * 
 * Params:
 * - id: Report ID
 * 
 * Güvenlik:
 * - Sahiplik kontrolü (userId match)
 * 
 * Response:
 * - report: Rapor detayları
 * - vehicleImages: Görseller
 * - aiAnalysisResults: AI analiz sonuçları
 */
router.get('/reports/:id', asyncHandler(getReport));

/**
 * GET /vehicle/reports/:id/download
 * 
 * Raporu indir (PDF).
 * 
 * Params:
 * - id: Report ID
 * 
 * TODO:
 * - PDF rapor oluşturma (pdfkit, puppeteer)
 * 
 * Şu anda:
 * - JSON olarak rapor döner
 * 
 * Response:
 * - Content-Type: application/pdf (gelecekte)
 * - Content-Disposition: attachment
 */
router.get('/reports/:id/download', asyncHandler(downloadReport));

// ===== IMAGE UPLOAD ROUTES (GÖRSEL YÜKLEME) =====

/**
 * POST /vehicle/reports/:id/images
 * 
 * Rapora görsel yükle.
 * 
 * Params:
 * - id: Report ID
 * 
 * Body:
 * - images: string[] (image URL'leri)
 * 
 * TODO:
 * - Multer ile file upload
 * - Multipart/form-data desteği
 * 
 * Şu anda:
 * - Body'den URL alınıyor
 * 
 * İş Akışı:
 * 1. Rapor sahiplik kontrolü
 * 2. Her görsel için VehicleImage kaydı
 * 3. Görsel kayıtlarını döndür
 * 
 * Response:
 * - images: Yüklenen görseller
 */
router.post('/reports/:id/images', asyncHandler(uploadImages));

// ===== ANALYSIS RESULTS ROUTES (ANALİZ SONUÇLARI) =====

/**
 * GET /vehicle/reports/:id/analysis
 * 
 * Rapora ait AI analiz sonuçlarını getir.
 * 
 * Params:
 * - id: Report ID
 * 
 * Güvenlik:
 * - Sahiplik kontrolü
 * 
 * Response:
 * - analysisResults: AI analiz sonuçları
 *   - DAMAGE_DETECTION
 *   - PAINT_ANALYSIS
 *   - VALUE_ESTIMATION
 *   - ENGINE_SOUND
 *   - COMPREHENSIVE
 */
router.get('/reports/:id/analysis', asyncHandler(getAnalysisResults));

export default router;
