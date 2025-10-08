/**
 * AI Test Routes (AI Test Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, AI servislerini test etmek için route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Durum Kontrolü:
 *    - GET /status (AI servis durumu)
 * 
 * 2. Model Testleri:
 *    - POST /paint (Boya analizi testi)
 *    - POST /damage (Hasar tespiti testi)
 *    - POST /engine (Motor sesi analizi testi)
 *    - POST /openai (OpenAI Vision API testi)
 *    - POST /comprehensive (Kapsamlı AI testi)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - İşlem süresi ölçümü (performance)
 * - Hata toleranslı testler
 * - Detaylı loglama
 * 
 * UYARI:
 * - Production'da bu endpoint'ler kapalı olmalı!
 * - Veya admin-only access
 * - API key bilgileri loglanmamalı
 * 
 * Kullanım:
 * - Development/staging ortamında
 * - AI model performans testi
 * - OpenAI API key doğrulama
 * - Hata ayıklama
 */

import express from 'express';
import {
  testAIStatus,
  testPaintAnalysis,
  testDamageDetection,
  testEngineSoundAnalysis,
  testOpenAIVision,
  comprehensiveAITest
} from '../controllers/aiTestController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 * 
 * TODO: Admin-only access
 * - authorize('ADMIN') middleware eklenebilir
 */
router.use(authenticate);

// ===== AI TEST ROUTES (AI TEST ROTALARI) =====

/**
 * GET /ai-test/status
 * 
 * AI servislerinin durumunu kontrol eder.
 * 
 * Kontrol Edilen Servisler:
 * - Paint Analysis Model
 * - Damage Detection Model
 * - Engine Sound Analysis Model
 * - OpenAI Vision API (key kontrolü)
 * 
 * Response:
 * - status: active/inactive
 * - timestamp: ISO string
 * - models: Model durumları
 *   - paintAnalysis: ready/not_ready
 *   - damageDetection: ready/not_ready
 *   - engineSoundAnalysis: ready/not_ready
 *   - openaiVision: configured/not_configured
 */
router.get('/status', testAIStatus);

/**
 * POST /ai-test/paint
 * 
 * Boya analizi AI modelini test eder.
 * 
 * Body:
 * - imagePath: string (test edilecek resim yolu)
 * - angle?: string (front/side/rear)
 * 
 * Response:
 * - result: Boya analizi sonucu
 * - performance: İşlem süresi (ms)
 */
router.post('/paint', testPaintAnalysis);

/**
 * POST /ai-test/damage
 * 
 * Hasar tespiti AI modelini test eder.
 * 
 * Body:
 * - imagePath: string (test edilecek resim yolu)
 * 
 * Response:
 * - result: Hasar tespiti sonucu
 * - performance: İşlem süresi (ms)
 */
router.post('/damage', testDamageDetection);

/**
 * POST /ai-test/engine
 * 
 * Motor sesi analizi AI modelini test eder.
 * 
 * Body:
 * - audioPath: string (test edilecek ses dosyası yolu)
 * - vehicleInfo?: object (araç bilgileri)
 * 
 * Response:
 * - result: Motor sesi analizi sonucu
 * - performance: İşlem süresi (ms)
 */
router.post('/engine', testEngineSoundAnalysis);

/**
 * POST /ai-test/openai
 * 
 * OpenAI Vision API'yi test eder.
 * 
 * Body:
 * - imagePath: string (test edilecek resim yolu)
 * - analysisType?: string (paint/damage/general)
 * 
 * OpenAI API key kontrolü yapar.
 * 
 * Response:
 * - result: OpenAI Vision API sonucu
 * - performance: İşlem süresi (ms)
 */
router.post('/openai', testOpenAIVision);

/**
 * POST /ai-test/comprehensive
 * 
 * Tüm AI servislerini sırayla test eder.
 * 
 * Body:
 * - imagePath: string (test edilecek resim yolu - zorunlu)
 * - audioPath?: string (test edilecek ses dosyası yolu - opsiyonel)
 * - vehicleInfo?: object (araç bilgileri - opsiyonel)
 * 
 * Test Edilen Servisler:
 * 1. Boya analizi
 * 2. Hasar tespiti
 * 3. Motor sesi analizi (audio varsa)
 * 4. OpenAI Vision API (key varsa)
 * 
 * Özellikler:
 * - Hata toleranslı (bir test başarısız olsa devam eder)
 * - Toplam işlem süresi
 * - Her servis için ayrı sonuç
 * 
 * Response:
 * - results: Tüm test sonuçları
 *   - paintAnalysis: result veya error
 *   - damageDetection: result veya error
 *   - engineSoundAnalysis: result veya error (audio varsa)
 *   - openaiVision: result veya error (key varsa)
 * - performance: Toplam işlem süresi (ms)
 */
router.post('/comprehensive', comprehensiveAITest);

export default router;
