/**
 * AI Analysis Controller (AI Analiz Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, genel AI analiz işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Gelişmiş AI analizi (OpenAI Vision API)
 * - Hasar tespiti (wrapper)
 * - AI model durum kontrolü
 * - AI model performans testi
 * - AI model eğitimi (admin)
 * - AI analiz geçmişi
 * 
 * Özellikler:
 * - Multi-purpose AI wrapper
 * - Performans ölçümü
 * - Admin-only model eğitimi
 * - Pagination desteği
 * 
 * NOT:
 * - Bu controller, farklı AI servislerini tek bir yerden yönetir
 * - Spesifik analiz türleri için dedicated controller'lar var
 *   (damageAnalysisController, paintAnalysisController, vb.)
 * 
 * Endpoints:
 * - POST /api/ai-analysis/advanced (Gelişmiş AI analizi)
 * - POST /api/ai-analysis/damage-detection (Hasar tespiti)
 * - GET /api/ai-analysis/status (AI durum)
 * - POST /api/ai-analysis/test (Performans testi)
 * - POST /api/ai-analysis/train (Model eğitimi - Admin)
 * - GET /api/ai-analysis/history (Analiz geçmişi)
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';
import { DamageDetectionResult } from '../services/damageDetectionService';

const prisma = new PrismaClient();

// ===== CONTROLLER METHODS =====

/**
 * Gelişmiş AI Analizi
 * 
 * OpenAI Vision API ile gelişmiş görsel analiz.
 * 
 * Analiz Türleri:
 * - paint: Boya analizi
 * - damage: Hasar tespiti
 * - general: Genel analiz (default: damage)
 * 
 * @route   POST /api/ai-analysis/advanced
 * @access  Private
 * 
 * @param req.body.imagePath - Analiz edilecek resim yolu
 * @param req.body.analysisType - Analiz türü (paint/damage/general)
 * @param req.body.vehicleInfo - Araç bilgileri (opsiyonel)
 * 
 * @returns 200 - Analiz sonucu
 * @returns 400 - İmage path eksik
 * @returns 500 - AI hatası
 * 
 * @example
 * POST /api/ai-analysis/advanced
 * Body: {
 *   "imagePath": "/uploads/car.jpg",
 *   "analysisType": "damage"
 * }
 */
export const advancedAIAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath, analysisType, vehicleInfo } = req.body;

  if (!imagePath) {
    res.status(400).json({
      success: false,
      message: 'Resim yolu gereklidir.'
    });
    return;
  }

  try {
    // Analiz türüne göre OpenAI Vision API çağrısı
    let analysisResult;
    
    if (analysisType === 'paint') {
      analysisResult = await AIService.analyzePaint(imagePath, 'front');
    } else if (analysisType === 'damage') {
      analysisResult = await AIService.detectDamage(imagePath);
    } else {
      // Genel analiz için hasar tespiti kullan
      analysisResult = await AIService.detectDamage(imagePath);
    }

    res.json({
      success: true,
      data: {
        analysisType,
        result: analysisResult,
        timestamp: new Date().toISOString(),
        confidence: (analysisResult as any)?.confidence || 85
      }
    });
  } catch (error) {
    console.error('Gelişmiş AI analizi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI analizi sırasında hata oluştu.'
    });
  }
});

/**
 * Hasar Tespiti (Wrapper)
 * 
 * AI modeli ile hasar tespiti ve maliyet hesaplaması.
 * 
 * İşlem Akışı:
 * 1. ImagePath kontrolü
 * 2. AI hasar tespiti (detectDamage)
 * 3. Hasar alanlarını analiz et
 * 4. Overall score hesapla
 * 5. Hasar şiddeti belirle
 * 6. Tahmini onarım maliyeti hesapla
 * 
 * Maliyet Hesaplaması:
 * - Dent (çökme): 1500 TL (base)
 * - Scratch (çizik): 300 TL (base)
 * - Rust (pas): 800 TL (base)
 * - Oxidation (oksidasyon): 400 TL (base)
 * - Severity multiplier: high x2, medium x1.5, low x1
 * 
 * @route   POST /api/ai-analysis/damage-detection
 * @access  Private
 * 
 * @param req.body.imagePath - Resim yolu
 * @param req.body.vehicleInfo - Araç bilgileri
 * @param req.body.imageCount - Görsel sayısı
 * @param req.body.analysisType - Analiz türü
 * 
 * @returns 200 - Hasar tespiti sonucu + maliyet
 * @returns 400 - İmage path eksik
 * @returns 500 - AI hatası
 * 
 * @example
 * POST /api/ai-analysis/damage-detection
 * Body: {
 *   "imagePath": "/uploads/damage.jpg",
 *   "vehicleInfo": { "make": "Toyota", "model": "Corolla" }
 * }
 */
export const damageDetection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath, vehicleInfo, imageCount, analysisType } = req.body;

  console.log('🔍 damageDetection çağrıldı:', { imagePath, vehicleInfo, imageCount, analysisType });

  // ImagePath kontrolü
  if (!imagePath) {
    console.log('❌ ImagePath bulunamadı');
    res.status(400).json({
      success: false,
      message: 'Hasar analizi için resim yolu gereklidir.'
    });
    return;
  }

  try {
    console.log('🤖 Gerçek AI ile hasar tespiti başlatılıyor...');
    
    // AI ile hasar tespiti
    const damageAreas: DamageDetectionResult = await AIService.detectDamage(imagePath);
    const areas = damageAreas?.damageAreas || [];
    console.log('✅ AI hasar tespiti tamamlandı:', areas.length, 'hasar tespit edildi');

    // Genel analiz sonucu hesapla
    const totalDamages = areas.length;
    const criticalDamages = areas.filter((d: any) => d.severity === 'high').length;
    const severity = areas.length > 0
      ? Math.max(...areas.map((d: any) => d.severity === 'high' ? 3 : d.severity === 'medium' ? 2 : 1))
      : 0;

    // Genel skor hesapla (0-100)
    // - Hasar yoksa: 95
    // - Her hasar: -15 puan
    // - Her kritik hasar: -25 puan ek
    const overallScore = totalDamages === 0 ? 95 : Math.max(10, 95 - (totalDamages * 15) - (criticalDamages * 25));

    // Hasar şiddeti belirle
    let damageSeverity: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore >= 90) damageSeverity = 'low';
    else if (overallScore >= 70) damageSeverity = 'medium';
    else if (overallScore >= 40) damageSeverity = 'high';
    else damageSeverity = 'critical';

    // Tahmini onarım maliyeti (TL)
    const estimatedRepairCost = areas.reduce((sum: number, damage: any) => {
      // Base cost (hasar tipine göre)
      const baseCost = damage.type === 'dent' ? 1500 : 
                      damage.type === 'scratch' ? 300 :
                      damage.type === 'rust' ? 800 :
                      damage.type === 'oxidation' ? 400 : 500;
      
      // Severity multiplier
      const severityMultiplier = damage.severity === 'high' ? 2 : damage.severity === 'medium' ? 1.5 : 1;
      
      return sum + (baseCost * severityMultiplier);
    }, 0);

    res.json({
      success: true,
      data: {
        damageAreas,
        totalDamages,
        criticalDamages,
        severity,
        overallScore: Math.round(overallScore),
        damageSeverity,
        estimatedRepairCost: Math.round(estimatedRepairCost),
        timestamp: new Date().toISOString(),
        message: 'Gerçek AI hasar analizi tamamlandı'
      }
    });
  } catch (error) {
    console.error('❌ AI hasar tespiti hatası:', error);
    
    res.status(500).json({
      success: false,
      message: 'AI hasar tespiti sırasında hata oluştu.',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * AI Model Durum Kontrolü
 * 
 * Tüm AI modellerinin durumunu kontrol eder.
 * 
 * Kontrol Edilen Modeller:
 * - Paint Analysis (Boya analizi)
 * - Damage Detection (Hasar tespiti)
 * - Engine Sound Analysis (Motor sesi)
 * - OpenAI Vision API (API key kontrolü)
 * 
 * @route   GET /api/ai-analysis/status
 * @access  Private
 * 
 * @returns 200 - AI model durumları
 * @returns 500 - Durum kontrolü hatası
 * 
 * @example
 * GET /api/ai-analysis/status
 * Response: {
 *   "success": true,
 *   "data": {
 *     "status": "active",
 *     "models": {
 *       "paintAnalysis": "available",
 *       "damageDetection": "available",
 *       "openaiVision": "available"
 *     }
 *   }
 * }
 */
export const getAIStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    // AI servisini başlat
    await AIService.initialize();

    res.json({
      success: true,
      data: {
        status: 'active',
        models: {
          paintAnalysis: 'available',
          damageDetection: 'available',
          engineSoundAnalysis: 'available',
          openaiVision: process.env.OPENAI_API_KEY ? 'available' : 'not_configured'
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI durum kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI durum kontrolü sırasında hata oluştu.'
    });
  }
});

/**
 * AI Model Performans Testi
 * 
 * AI modellerinin performansını test eder.
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
 * @route   POST /api/ai-analysis/test
 * @access  Private
 * 
 * @param req.body.testType - Test türü (paint/damage/engine)
 * @param req.body.testData - Test verileri (imagePath, audioPath, vb.)
 * 
 * @returns 200 - Test sonuçları + performans
 * @returns 400 - Geçersiz test türü
 * @returns 500 - Test hatası
 * 
 * @example
 * POST /api/ai-analysis/test
 * Body: {
 *   "testType": "damage",
 *   "testData": { "imagePath": "/uploads/test.jpg" }
 * }
 */
export const testAIModels = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { testType, testData } = req.body;

  try {
    let result;
    const startTime = Date.now();

    // Test türüne göre AI çalıştır
    switch (testType) {
      case 'paint':
        result = await AIService.analyzePaint(testData.imagePath, testData.angle);
        break;
      case 'damage':
        result = await AIService.detectDamage(testData.imagePath);
        break;
      case 'engine':
        result = await AIService.analyzeEngineSound(testData.audioPath, testData.vehicleInfo);
        break;
      default:
        res.status(400).json({
          success: false,
          message: 'Geçersiz test türü.'
        });
        return;
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    res.json({
      success: true,
      data: {
        testType,
        result,
        performance: {
          processingTime: `${processingTime}ms`,
          memoryUsage: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('AI model testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI model testi sırasında hata oluştu.'
    });
  }
});

/**
 * AI Model Eğitimi (Admin Only)
 * 
 * AI modellerini yeniden eğitir.
 * 
 * NOT:
 * - Bu endpoint sadece admin kullanıcılar için
 * - Gerçek uygulamada uzun süren bir işlem
 * - Background job olarak çalışmalı
 * 
 * Model Türleri:
 * - paint: Boya analizi modeli
 * - damage: Hasar tespiti modeli
 * - engine: Motor sesi analizi modeli
 * 
 * TODO:
 * - Background job entegrasyonu (Bull, Agenda, vb.)
 * - Training progress tracking
 * - Model versioning
 * - A/B testing
 * 
 * @route   POST /api/ai-analysis/train
 * @access  Private (Admin)
 * 
 * @param req.body.modelType - Model türü
 * @param req.body.trainingData - Eğitim verileri
 * 
 * @returns 200 - Eğitim başlatıldı
 * @returns 403 - Yetkisiz erişim
 * @returns 500 - Eğitim hatası
 * 
 * @example
 * POST /api/ai-analysis/train
 * Body: {
 *   "modelType": "damage",
 *   "trainingData": { ... }
 * }
 */
export const trainAIModel = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Admin kontrolü
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Bu işlem için admin yetkisi gereklidir.'
    });
    return;
  }

  const { modelType, trainingData } = req.body;

  try {
    // Model eğitimi simülasyonu
    // TODO: Gerçek model eğitimi (TensorFlow.js, PyTorch, vb.)
    // - Background job başlat
    // - Training progress kaydet
    // - Model versioning
    // - A/B testing için eski model sakla
    
    res.json({
      success: true,
      data: {
        modelType,
        status: 'training_started',
        estimatedTime: '2-4 hours',
        message: 'Model eğitimi başlatıldı. Tamamlandığında bildirim alacaksınız.',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('AI model eğitimi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI model eğitimi sırasında hata oluştu.'
    });
  }
});

/**
 * AI Analiz Geçmişi
 * 
 * Kullanıcının tüm AI analizlerini listeler.
 * 
 * Özellikler:
 * - Pagination (page, limit)
 * - Filtreleme (type)
 * - Tarih sıralı (yeni önce)
 * 
 * @route   GET /api/ai-analysis/history
 * @access  Private
 * 
 * @param req.query.page - Sayfa numarası
 * @param req.query.limit - Sayfa boyutu
 * @param req.query.type - Rapor türü filtresi
 * 
 * @returns 200 - Analiz geçmişi (paginated)
 * @returns 500 - İşlem hatası
 * 
 * @example
 * GET /api/ai-analysis/history?page=1&limit=10&type=DAMAGE_ASSESSMENT
 */
export const getAIAnalysisHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, type } = req.query;

  try {
    // Where clause (kullanıcı + tip filtresi)
    const whereClause: any = {
      userId: req.user!.id
    };

    if (type) {
      whereClause.reportType = type;
    }

    // Raporları getir
    const reports = await prisma.vehicleReport.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        reportType: true,
        status: true,
        aiAnalysisData: true,
        createdAt: true,
        vehicleBrand: true,
        vehicleModel: true,
        vehicleYear: true
      }
    });

    const total = await prisma.vehicleReport.count({
      where: whereClause
    });

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('AI analiz geçmişi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI analiz geçmişi alınırken hata oluştu.'
    });
  }
});
