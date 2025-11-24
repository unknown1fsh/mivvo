/**
 * Comprehensive Expertise Routes (Tam Ekspertiz Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, tam ekspertiz (kapsamlı analiz) işlemleri için route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Analiz İşlemleri:
 *    - POST /start (Tam ekspertiz başlat)
 *    - POST /:reportId/upload-images (Görsel yükle - Multer)
 *    - POST /:reportId/upload-audio (Ses yükle - Multer)
 *    - POST /:reportId/analyze (Kapsamlı analiz gerçekleştir)
 *    - GET /:reportId (Rapor getir)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Multi-modal AI (görsel + ses)
 * - Multer ile file upload (görsel: max 10, ses: max 5)
 * - OpenAI GPT-4 Vision + Audio API
 * - Memory storage (base64)
 * 
 * Kapsamlı Analiz İçeriği:
 * - Hasar tespiti
 * - Boya analizi
 * - Motor sesi analizi
 * - Değer tahmini
 * - Genel durum değerlendirmesi
 * - Yatırım kararı önerisi
 * 
 * İş Akışı:
 * 1. /start → Rapor oluştur (PROCESSING)
 * 2. /:reportId/upload-images → Görselleri yükle (base64)
 * 3. /:reportId/upload-audio → Ses dosyasını yükle (base64)
 * 4. /:reportId/analyze → OpenAI ile kapsamlı analiz
 * 5. /:reportId → Rapor getir (COMPLETED)
 */

import express from 'express'
import { ComprehensiveExpertiseController, imageUpload, audioUpload } from '../controllers/comprehensiveExpertiseController'
import { authenticate } from '../middleware/auth'

const router = express.Router()

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate)

// ===== COMPREHENSIVE EXPERTISE ROUTES (TAM EKSPERTİZ ROTALARI) =====

/**
 * POST /comprehensive-expertise/start
 * 
 * Tam ekspertiz başlat.
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
 * 3. VehicleReport kaydı oluştur (FULL_REPORT, PROCESSING)
 * 4. ReportId döndür
 * 
 * Response:
 * - reportId: number
 * - status: PROCESSING
 * - message: "Tam expertiz başlatıldı"
 */
router.post('/start', ComprehensiveExpertiseController.startAnalysis)

/**
 * POST /comprehensive-expertise/:reportId/upload-images
 * 
 * Tam ekspertiz için görselleri yükle.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Middleware:
 * - imageUpload.array('images', 10): Max 10 görsel (Multer)
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
router.post('/:reportId/upload-images', imageUpload.array('images', 10), ComprehensiveExpertiseController.uploadImages)

/**
 * POST /comprehensive-expertise/:reportId/upload-audio
 * 
 * Tam ekspertiz için ses dosyasını yükle.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Middleware:
 * - audioUpload.array('audioFiles', 5): Max 5 ses dosyası (Multer)
 * 
 * FormData:
 * - audioFiles: File[] (audio/*)
 * 
 * Multer Config:
 * - Memory storage (base64)
 * - Max dosya boyutu: 50MB
 * - Desteklenen formatlar: WAV, MP3, M4A, AAC, 3GP, OGG, WebM, vb.
 * 
 * İş Akışı:
 * 1. Rapor sahiplik kontrolü
 * 2. Dosya varlık kontrolü
 * 3. Her dosya için base64 encode
 * 4. VehicleAudio kaydı oluştur (audioType: ENGINE_SOUND)
 * 
 * Response:
 * - audios: Yüklenen ses dosyaları
 * - message: "{count} ses dosyası başarıyla yüklendi"
 */
router.post('/:reportId/upload-audio', audioUpload.array('audioFiles', 5), ComprehensiveExpertiseController.uploadAudio)

/**
 * POST /comprehensive-expertise/:reportId/analyze
 * 
 * Tam ekspertiz gerçekleştir (OpenAI).
 * 
 * Params:
 * - reportId: Report ID
 * 
 * İş Akışı:
 * 1. Rapor sahiplik kontrolü (görseller + ses dahil)
 * 2. Araç bilgilerini hazırla
 * 3. Görsel ve ses path'lerini topla
 * 4. ComprehensiveExpertiseService.generateComprehensiveReport çağır
 * 5. Raporu güncelle (COMPLETED + aiAnalysisData)
 * 
 * Kapsamlı Analiz İçeriği:
 * - Hasar tespiti (görseller)
 * - Boya analizi (görseller)
 * - Motor sesi analizi (ses)
 * - Değer tahmini (görseller + hasar bilgisi)
 * - Genel durum skoru
 * - Yatırım kararı önerisi
 * - Detaylı Türkçe rapor
 * 
 * OpenAI Prompt:
 * - Multi-modal analiz
 * - Araç bilgileri dahil
 * - Tüm alt analizlerin entegrasyonu
 * - Kapsamlı Türkçe rapor
 * 
 * Response:
 * - reportId: number
 * - analysisResult: Kapsamlı analiz sonucu
 * - message: "OpenAI ile tam expertiz tamamlandı"
 */
router.post('/:reportId/analyze', ComprehensiveExpertiseController.performAnalysis)

/**
 * GET /comprehensive-expertise/:reportId
 * 
 * Tam ekspertiz raporunu getir.
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
 * - vehicleAudios: Ses dosyaları
 * - aiAnalysisData: Kapsamlı analiz sonucu
 * - status: PROCESSING/COMPLETED/FAILED
 */
router.get('/:reportId', ComprehensiveExpertiseController.getReport)

/**
 * GET /comprehensive-expertise/:reportId/pdf
 * 
 * Kapsamlı ekspertiz raporunu PDF formatında indir.
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
router.get('/:reportId/pdf', ComprehensiveExpertiseController.downloadPDF)

export default router
