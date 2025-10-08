/**
 * AI Analysis Routes (AI Analiz Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, genel AI analiz işlemleri için route'ları tanımlar.
 * 
 * Route Kategorileri:
 * 1. Gelişmiş AI Analizi:
 *    - POST /advanced (OpenAI Vision API)
 *    - POST /damage-detection (Hasar tespiti wrapper)
 * 
 * 2. AI Model Yönetimi:
 *    - GET /status (AI durum)
 *    - POST /test (Performans testi)
 *    - POST /train (Model eğitimi - Admin)
 * 
 * 3. Analiz Geçmişi:
 *    - GET /history (AI analiz geçmişi)
 * 
 * Özellikler:
 * - Tüm route'lar authenticate middleware ile korumalı
 * - Multi-purpose AI wrapper
 * - Performans ölçümü
 * - Admin-only model eğitimi
 * 
 * NOT:
 * - Bu route'lar, farklı AI servislerini tek bir yerden yönetir
 * - Spesifik analiz türleri için dedicated route'lar var
 *   (damageAnalysis, paintAnalysis, vb.)
 */

import express from 'express';
import {
  advancedAIAnalysis,
  damageDetection,
  getAIStatus,
  testAIModels,
  trainAIModel,
  getAIAnalysisHistory
} from '../controllers/aiAnalysisController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ===== AUTHENTICATION MIDDLEWARE =====

/**
 * Tüm Route'lar İçin Authentication
 * 
 * JWT authentication gereklidir.
 */
router.use(authenticate);

// ===== AI ANALYSIS ROUTES (AI ANALİZ ROTALARI) =====

/**
 * POST /ai-analysis/advanced
 * 
 * Gelişmiş AI analizi (OpenAI Vision API).
 * 
 * Body:
 * - imagePath: string (analiz edilecek resim yolu)
 * - analysisType: string (paint/damage/general)
 * - vehicleInfo?: object (araç bilgileri)
 * 
 * Analiz Türleri:
 * - paint: Boya analizi
 * - damage: Hasar tespiti
 * - general: Genel analiz (default: damage)
 * 
 * Response:
 * - analysisType: string
 * - result: AI analiz sonucu
 * - timestamp: ISO string
 * - confidence: number (0-100)
 */
router.post('/advanced', advancedAIAnalysis);

/**
 * POST /ai-analysis/damage-detection
 * 
 * Hasar tespiti (wrapper) + maliyet hesaplaması.
 * 
 * Body:
 * - imagePath: string (resim yolu)
 * - vehicleInfo?: object (araç bilgileri)
 * - imageCount?: number (görsel sayısı)
 * - analysisType?: string (analiz türü)
 * 
 * İş Akışı:
 * 1. ImagePath kontrolü
 * 2. AI hasar tespiti (detectDamage)
 * 3. Hasar alanlarını analiz et
 * 4. Overall score hesapla (0-100)
 * 5. Hasar şiddeti belirle (low/medium/high/critical)
 * 6. Tahmini onarım maliyeti hesapla
 * 
 * Maliyet Hesaplaması:
 * - Dent (çökme): 1500 TL (base)
 * - Scratch (çizik): 300 TL (base)
 * - Rust (pas): 800 TL (base)
 * - Oxidation (oksidasyon): 400 TL (base)
 * - Severity multiplier: high x2, medium x1.5, low x1
 * 
 * Response:
 * - damageAreas: Hasar alanları
 * - totalDamages: Toplam hasar sayısı
 * - criticalDamages: Kritik hasar sayısı
 * - overallScore: Genel skor (0-100)
 * - damageSeverity: Hasar şiddeti
 * - estimatedRepairCost: Tahmini onarım maliyeti (TL)
 */
router.post('/damage-detection', damageDetection);

/**
 * GET /ai-analysis/status
 * 
 * AI model durumlarını kontrol eder.
 * 
 * Kontrol Edilen Modeller:
 * - Paint Analysis
 * - Damage Detection
 * - Engine Sound Analysis
 * - OpenAI Vision API
 * 
 * Response:
 * - status: active/inactive
 * - models: Model durumları
 * - timestamp: ISO string
 */
router.get('/status', getAIStatus);

/**
 * POST /ai-analysis/test
 * 
 * AI model performans testi.
 * 
 * Body:
 * - testType: string (paint/damage/engine)
 * - testData: object (test verileri)
 * 
 * Test Türleri:
 * - paint: Boya analizi performans testi
 * - damage: Hasar tespiti performans testi
 * - engine: Motor sesi analizi performans testi
 * 
 * Ölçülen Metrikler:
 * - İşlem süresi (ms)
 * - Bellek kullanımı
 * - Timestamp
 * 
 * Response:
 * - testType: string
 * - result: Test sonucu
 * - performance: Performans metrikleri
 */
router.post('/test', testAIModels);

/**
 * POST /ai-analysis/train
 * 
 * AI model eğitimi (Admin Only).
 * 
 * Body:
 * - modelType: string (paint/damage/engine)
 * - trainingData: object (eğitim verileri)
 * 
 * UYARI:
 * - Sadece ADMIN kullanıcılar erişebilir
 * - Uzun süren bir işlem
 * - Background job olarak çalışmalı
 * 
 * TODO:
 * - Background job entegrasyonu (Bull, Agenda)
 * - Training progress tracking
 * - Model versioning
 * - A/B testing
 * 
 * Response:
 * - modelType: string
 * - status: training_started
 * - estimatedTime: string
 */
router.post('/train', trainAIModel);

/**
 * GET /ai-analysis/history
 * 
 * AI analiz geçmişini listeler.
 * 
 * Query:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * - type?: string (rapor türü filtresi)
 * 
 * Response:
 * - reports: Rapor listesi
 * - pagination: Sayfalama bilgisi
 */
router.get('/history', getAIAnalysisHistory);

export default router;
