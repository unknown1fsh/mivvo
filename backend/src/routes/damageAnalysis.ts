/**
 * Damage Analysis Routes (Hasar Analizi Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, hasar analizi işlemleri için route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Analiz İşlemleri:
 *    - POST /start (Hasar analizi başlat)
 *    - POST /:reportId/upload (Görsel yükle - Multer)
 *    - POST /:reportId/analyze (Analiz gerçekleştir)
 *    - GET /:reportId (Rapor getir)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Multer ile file upload (max 10 görsel)
 * - OpenAI Vision API ile hasar tespiti
 * - Memory storage (base64)
 * 
 * İş Akışı:
 * 1. /start → Rapor oluştur (PROCESSING)
 * 2. /:reportId/upload → Görselleri yükle (base64)
 * 3. /:reportId/analyze → OpenAI ile analiz
 * 4. /:reportId → Rapor getir (COMPLETED)
 */

import express from 'express';
import { DamageAnalysisController, upload } from '../controllers/damageAnalysisController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate);

// ===== DAMAGE ANALYSIS ROUTES (HASAR ANALİZİ ROTALARI) =====

/**
 * POST /damage-analysis/start
 * 
 * Hasar analizi başlat.
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
 * - message: "Hasar analizi başlatıldı"
 */
router.post('/start', DamageAnalysisController.startAnalysis);

/**
 * POST /damage-analysis/:reportId/upload
 * 
 * Hasar analizi için görselleri yükle.
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
 * 4. VehicleImage kaydı oluştur (imageType: DAMAGE)
 * 
 * Response:
 * - images: Yüklenen görseller
 * - message: "{count} resim başarıyla yüklendi"
 */
router.post('/:reportId/upload', upload.array('images', 10), DamageAnalysisController.uploadImages);

/**
 * POST /damage-analysis/:reportId/analyze
 * 
 * Hasar analizi gerçekleştir (OpenAI).
 * 
 * Params:
 * - reportId: Report ID
 * 
 * İş Akışı:
 * 1. Rapor sahiplik kontrolü
 * 2. Görselleri getir (en az 1 tane)
 * 3. Araç bilgilerini hazırla
 * 4. DamageDetectionService ile analiz (OpenAI)
 * 5. AI sonucunu kontrol et
 * 6. Raporu güncelle (COMPLETED + aiAnalysisData)
 * 
 * OpenAI Prompt:
 * - Araç bilgileri dahil
 * - Detaylı Türkçe analiz
 * - JSON formatında sonuç
 * 
 * Response:
 * - reportId: number
 * - analysisResult: AI sonucu
 * - message: "OpenAI ile hasar analizi tamamlandı"
 */
router.post('/:reportId/analyze', DamageAnalysisController.performAnalysis);

/**
 * GET /damage-analysis/:reportId
 * 
 * Hasar analizi raporunu getir.
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
 * - aiAnalysisData: AI analiz sonucu
 * - status: PROCESSING/COMPLETED/FAILED
 */
router.get('/:reportId', DamageAnalysisController.getReport);

/**
 * GET /damage-analysis/:reportId/pdf
 * 
 * Hasar analizi raporunu PDF formatında indir.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Güvenlik:
 * - Sahiplik kontrolü (userId match)
 * 
 * Response:
 * - PDF dosyası (application/pdf)
 */
router.get('/:reportId/pdf', DamageAnalysisController.downloadPDF);

export default router;
