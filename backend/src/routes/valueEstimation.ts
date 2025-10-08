/**
 * Value Estimation Routes (Değer Tahmini Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, araç değer tahmini işlemleri için route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Analiz İşlemleri:
 *    - POST /start (Değer tahmini başlat)
 *    - POST /:reportId/upload (Görsel yükle - Multer)
 *    - POST /:reportId/analyze (Analiz gerçekleştir)
 *    - GET /:reportId (Rapor getir)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Multer ile file upload (max 10 görsel)
 * - OpenAI GPT-4 Vision API ile değer tahmini
 * - Memory storage (base64)
 * - Multi-image support
 * 
 * İş Akışı:
 * 1. /start → Rapor oluştur (PROCESSING)
 * 2. /:reportId/upload → Görselleri yükle (base64)
 * 3. /:reportId/analyze → OpenAI ile değer tahmini
 * 4. /:reportId → Rapor getir (COMPLETED)
 */

import express from 'express'
import { ValueEstimationController, upload } from '../controllers/valueEstimationController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate)

// ===== VALUE ESTIMATION ROUTES (DEĞER TAHMİNİ ROTALARI) =====

/**
 * POST /value-estimation/start
 * 
 * Değer tahmini başlat.
 * 
 * Body:
 * - vehicleInfo: object
 *   - plate: string (zorunlu)
 *   - make: string
 *   - model: string
 *   - year: number
 * 
 * İş Akışı:
 * 1. Kullanıcı yetkisi kontrolü
 * 2. Araç bilgileri kontrolü (plaka zorunlu)
 * 3. VehicleReport kaydı oluştur (PROCESSING)
 * 4. ReportId döndür
 * 
 * Response:
 * - reportId: number
 * - status: PROCESSING
 * - message: "Değer tahmini başlatıldı"
 */
router.post('/start', ValueEstimationController.startAnalysis)

/**
 * POST /value-estimation/:reportId/upload
 * 
 * Değer tahmini için görselleri yükle.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Middleware:
 * - upload.array('images', 10): Max 10 görsel (Multer)
 * 
 * FormData:
 * - images: File[] (image/*)
 * 
 * Multer Config:
 * - Memory storage (base64)
 * - Max dosya boyutu: 10MB
 * - İzin verilen tipler: image/*
 * 
 * İş Akışı:
 * 1. Rapor sahiplik kontrolü
 * 2. Dosya varlık kontrolü
 * 3. Her dosya için base64 encode
 * 4. VehicleImage kaydı oluştur (imageType: EXTERIOR)
 * 
 * Response:
 * - images: Yüklenen görseller
 * - message: "{count} resim başarıyla yüklendi"
 */
router.post('/:reportId/upload', upload.array('images', 10), ValueEstimationController.uploadImages)

/**
 * POST /value-estimation/:reportId/analyze
 * 
 * Değer tahmini gerçekleştir (OpenAI).
 * 
 * Params:
 * - reportId: Report ID
 * 
 * İş Akışı:
 * 1. Rapor sahiplik kontrolü (görseller dahil)
 * 2. Araç bilgilerini hazırla
 * 3. Görsel path'lerini topla
 * 4. ValueEstimationService.estimateValue çağır (OpenAI)
 * 5. Raporu güncelle (COMPLETED + aiAnalysisData)
 * 
 * OpenAI Prompt:
 * - Araç bilgileri dahil
 * - Multi-image analiz
 * - Piyasa araştırması
 * - Fiyat tahmini (min, max, ortalama)
 * - Detaylı Türkçe rapor
 * 
 * Response:
 * - reportId: number
 * - analysisResult: AI sonucu
 * - message: "OpenAI ile değer tahmini tamamlandı"
 */
router.post('/:reportId/analyze', ValueEstimationController.performAnalysis)

/**
 * GET /value-estimation/:reportId
 * 
 * Değer tahmini raporunu getir.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Güvenlik:
 * - Sahiplik kontrolü (userId match)
 * 
 * Response:
 * - report: Rapor detayları
 * - vehicleImages: Görseller
 * - aiAnalysisData: AI değer tahmini sonucu
 * - status: PROCESSING/COMPLETED/FAILED
 */
router.get('/:reportId', ValueEstimationController.getReport)

export default router
