/**
 * Engine Sound Analysis Routes (Motor Sesi Analizi Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, motor sesi analizi işlemleri için route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Analiz İşlemleri:
 *    - POST /analyze (Motor sesi analizi başlat + ses yükle)
 *    - GET /:reportId (Analiz sonucu getir)
 * 
 * 2. Geçmiş ve İndirme:
 *    - GET /history (Analiz geçmişi)
 *    - GET /:reportId/download (Rapor indir)
 *    - GET /:reportId/status (Durum kontrolü)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Multer ile audio file upload (max 5 dosya, max 50MB)
 * - Geniş format desteği (WAV, MP3, M4A, AAC, 3GP, vb.)
 * - OpenAI Audio API ile analiz
 * - Background job simulation
 * 
 * İş Akışı:
 * 1. /analyze → Kredi kontrolü + rapor oluştur + ses yükle + analiz başlat
 * 2. /:reportId/status → Durum sorgula (PROCESSING/COMPLETED)
 * 3. /:reportId → Analiz sonucu getir
 * 4. /:reportId/download → Rapor indir (JSON - TODO: PDF)
 */

import express from 'express';
import {
  startEngineSoundAnalysis,
  getEngineSoundAnalysisResult,
  getEngineSoundAnalysisHistory,
  downloadEngineSoundAnalysisReport,
  checkEngineSoundAnalysisStatus,
  downloadPDF,
  audioUpload
} from '../controllers/engineSoundAnalysisController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate);

// ===== ENGINE SOUND ANALYSIS ROUTES (MOTOR SESİ ANALİZİ ROTALARI) =====

/**
 * POST /engine-sound-analysis/analyze
 * 
 * Motor sesi analizi başlat.
 * 
 * Middleware:
 * - audioUpload.array('audioFiles', 5): Max 5 ses dosyası (Multer)
 * 
 * FormData:
 * - vehicleInfo: object (JSON string)
 *   - plate: string
 *   - make: string
 *   - model: string
 *   - year: number
 * - analysisType?: string
 * - audioFiles: File[] (audio/*)
 * 
 * Multer Config:
 * - Disk storage (uploads/audio/)
 * - Max dosya boyutu: 50MB
 * - Desteklenen formatlar:
 *   - Standart: WAV, MP3, OGG, WebM
 *   - iPhone: M4A, AAC, CAF
 *   - Android: 3GP, AMR
 *   - Web: Opus, FLAC
 * 
 * İş Akışı:
 * 1. Araç bilgileri kontrolü
 * 2. Ses dosyası kontrolü
 * 3. Kredi kontrolü (ServicePricing)
 * 4. Rapor oluştur (PROCESSING)
 * 5. Ses dosyalarını kaydet (VehicleAudio)
 * 6. Kredi düş
 * 7. CreditTransaction oluştur
 * 8. Background job başlat (setTimeout - 5 saniye)
 * 
 * Response:
 * - referenceId: Report ID (string)
 * - status: PROCESSING
 * - message: "Motor sesi analizi başlatıldı. Analiz tamamlandığında bildirim alacaksınız."
 */
router.post('/analyze', audioUpload.array('audioFiles', 5), startEngineSoundAnalysis);

/**
 * GET /engine-sound-analysis/history
 * 
 * Motor sesi analiz geçmişini listele.
 * 
 * Kullanıcının son 20 motor sesi analizini getir.
 * 
 * Response:
 * - data: Analiz geçmişi listesi
 *   - id: Report ID
 *   - vehicleInfo: Araç bilgileri
 *   - analysisDate: Analiz tarihi
 *   - overallScore: Genel skor (0-100)
 *   - engineHealth: Motor sağlığı (İyi, Orta, Kötü)
 *   - referenceId: Report ID (string)
 *   - status: PROCESSING/COMPLETED/FAILED
 */
router.get('/history', getEngineSoundAnalysisHistory);

/**
 * GET /engine-sound-analysis/:reportId
 * 
 * Motor sesi analiz sonucunu getir.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Güvenlik:
 * - Sahiplik kontrolü (userId match)
 * 
 * Response:
 * - id: Report ID
 * - vehicleInfo: Araç bilgileri
 * - overallScore: Genel skor (0-100)
 * - engineHealth: Motor sağlığı
 * - rpmAnalysis: RPM analizi
 *   - idleRpm: Rölanti RPM
 *   - maxRpm: Max RPM
 *   - rpmStability: RPM kararlılığı (%)
 * - frequencyAnalysis: Frekans analizi
 *   - dominantFrequencies: Dominant frekanslar
 *   - harmonicDistortion: Harmonik bozulma
 *   - noiseLevel: Gürültü seviyesi
 * - detectedIssues: Tespit edilen sorunlar
 *   - issue: Sorun adı
 *   - severity: Şiddet (low/medium/high)
 *   - confidence: Güven skoru (%)
 *   - description: Açıklama
 *   - recommendation: Öneri
 * - performanceMetrics: Performans metrikleri
 *   - engineEfficiency: Motor verimliliği (%)
 *   - vibrationLevel: Titreşim seviyesi
 *   - acousticQuality: Akustik kalite
 * - recommendations: Öneriler
 * - status: PROCESSING/COMPLETED/FAILED
 * - audioFiles: Ses dosyaları
 */
router.get('/:reportId', getEngineSoundAnalysisResult);

/**
 * GET /engine-sound-analysis/:reportId/download
 * 
 * Motor sesi analiz raporunu indir.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * TODO:
 * - PDF rapor oluşturma (pdfkit, puppeteer)
 * 
 * Şu anda:
 * - JSON rapor döner
 * 
 * Response:
 * - Content-Type: application/json
 * - Content-Disposition: attachment
 * - Dosya adı: motor-sesi-analizi-{reportId}.json
 */
router.get('/:reportId/download', downloadEngineSoundAnalysisReport);

/**
 * GET /engine-sound-analysis/:reportId/pdf
 * 
 * Motor sesi analiz raporunu PDF formatında indir.
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
router.get('/:reportId/pdf', downloadPDF);

/**
 * GET /engine-sound-analysis/:reportId/status
 * 
 * Motor sesi analiz durumunu kontrol et.
 * 
 * Params:
 * - reportId: Report ID
 * 
 * Durumlar:
 * - PENDING: Sırada bekliyor (progress: 0%)
 * - PROCESSING: İşleniyor (progress: 75%, estimatedTime: 30s)
 * - COMPLETED: Tamamlandı (progress: 100%)
 * - FAILED: Başarısız (progress: 0%)
 * 
 * Response:
 * - status: pending/processing/completed/failed
 * - progress: number (0-100)
 * - estimatedTime?: number (saniye)
 */
router.get('/:reportId/status', checkEngineSoundAnalysisStatus);

export default router;
