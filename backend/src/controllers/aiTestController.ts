/**
 * AI Test Controller (AI Test Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, AI servislerini test etmek için kullanılır.
 * 
 * Sorumluluklar:
 * - AI servisleri durum kontrolü
 * - Boya analizi testi
 * - Hasar tespiti testi
 * - Motor sesi analizi testi
 * - OpenAI Vision API testi
 * - Kapsamlı AI test
 * 
 * Kullanım:
 * - Development/staging ortamında
 * - AI model performans testi
 * - OpenAI API key doğrulama
 * - Hata ayıklama
 * 
 * Özellikler:
 * - İşlem süresi ölçümü (performance)
 * - Hata toleranslı testler
 * - Detaylı loglama
 * - Model durum kontrolü
 * 
 * UYARI:
 * - Production'da bu endpoint'ler kapalı olmalı!
 * - Veya admin-only access
 * - API key bilgileri loglanmamalı
 * 
 * Endpoints:
 * - GET /api/ai-test/status (AI durum)
 * - POST /api/ai-test/paint (Boya testi)
 * - POST /api/ai-test/damage (Hasar testi)
 * - POST /api/ai-test/engine (Motor sesi testi)
 * - POST /api/ai-test/openai (OpenAI testi)
 * - POST /api/ai-test/comprehensive (Kapsamlı test)
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';

// ===== CONTROLLER METHODS =====

/**
 * AI Servis Durum Kontrolü
 * 
 * AI servislerinin durumunu kontrol eder.
 * 
 * Kontrol Edilen Servisler:
 * - Paint Analysis Model
 * - Damage Detection Model
 * - Engine Sound Analysis Model
 * - OpenAI Vision API (key kontrolü)
 * 
 * @route   GET /api/ai-test/status
 * @access  Private (Admin)
 * 
 * @returns 200 - AI servis durumu
 * @returns 500 - AI servis hatası
 * 
 * @example
 * GET /api/ai-test/status
 * Response: {
 *   "success": true,
 *   "data": {
 *     "status": "active",
 *     "models": {
 *       "paintAnalysis": "ready",
 *       "damageDetection": "ready",
 *       "openaiVision": "configured"
 *     }
 *   }
 * }
 */
export const testAIStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    // AI servisini başlat
    await AIService.initialize();

    res.json({
      success: true,
      message: 'AI servisi başarıyla başlatıldı',
      data: {
        status: 'active',
        timestamp: new Date().toISOString(),
        models: {
          paintAnalysis: 'ready',
          damageDetection: 'ready', 
          engineSoundAnalysis: 'ready',
          openaiVision: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured'
        }
      }
    });
  } catch (error) {
    console.error('AI servis testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'AI servis testi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Boya Analizi Testi
 * 
 * Boya analizi AI modelini test eder.
 * 
 * İşlem Akışı:
 * 1. İmage path kontrolü
 * 2. AI boya analizi çalıştır
 * 3. İşlem süresi ölç
 * 4. Sonuç döndür
 * 
 * @route   POST /api/ai-test/paint
 * @access  Private (Admin)
 * 
 * @param req.body.imagePath - Test edilecek resim yolu
 * @param req.body.angle - Resim açısı (front, side, rear)
 * 
 * @returns 200 - Boya analizi sonucu + performans
 * @returns 400 - İmage path eksik
 * @returns 500 - Test hatası
 * 
 * @example
 * POST /api/ai-test/paint
 * Body: {
 *   "imagePath": "/uploads/test.jpg",
 *   "angle": "front"
 * }
 */
export const testPaintAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath, angle } = req.body;

  if (!imagePath) {
    res.status(400).json({
      success: false,
      message: 'Resim yolu gereklidir'
    });
    return;
  }

  try {
    const startTime = Date.now();
    const result = await AIService.analyzePaint(imagePath, angle || 'front');
    const endTime = Date.now();

    res.json({
      success: true,
      message: 'Boya analizi testi başarılı',
      data: {
        result,
        performance: {
          processingTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Boya analizi testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Boya analizi testi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Hasar Tespiti Testi
 * 
 * Hasar tespiti AI modelini test eder.
 * 
 * İşlem Akışı:
 * 1. İmage path kontrolü
 * 2. AI hasar tespiti çalıştır
 * 3. İşlem süresi ölç
 * 4. Sonuç döndür
 * 
 * @route   POST /api/ai-test/damage
 * @access  Private (Admin)
 * 
 * @param req.body.imagePath - Test edilecek resim yolu
 * 
 * @returns 200 - Hasar tespiti sonucu + performans
 * @returns 400 - İmage path eksik
 * @returns 500 - Test hatası
 * 
 * @example
 * POST /api/ai-test/damage
 * Body: { "imagePath": "/uploads/damage.jpg" }
 */
export const testDamageDetection = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath } = req.body;

  if (!imagePath) {
    res.status(400).json({
      success: false,
      message: 'Resim yolu gereklidir'
    });
    return;
  }

  try {
    const startTime = Date.now();
    const result = await AIService.detectDamage(imagePath);
    const endTime = Date.now();

    res.json({
      success: true,
      message: 'Hasar tespiti testi başarılı',
      data: {
        result,
        performance: {
          processingTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Hasar tespiti testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Hasar tespiti testi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Motor Sesi Analizi Testi
 * 
 * Motor sesi analizi AI modelini test eder.
 * 
 * İşlem Akışı:
 * 1. Audio path kontrolü
 * 2. AI motor sesi analizi çalıştır
 * 3. İşlem süresi ölç
 * 4. Sonuç döndür
 * 
 * @route   POST /api/ai-test/engine
 * @access  Private (Admin)
 * 
 * @param req.body.audioPath - Test edilecek ses dosyası yolu
 * @param req.body.vehicleInfo - Araç bilgileri (opsiyonel)
 * 
 * @returns 200 - Motor sesi analizi sonucu + performans
 * @returns 400 - Audio path eksik
 * @returns 500 - Test hatası
 * 
 * @example
 * POST /api/ai-test/engine
 * Body: {
 *   "audioPath": "/uploads/engine.wav",
 *   "vehicleInfo": { "brand": "Toyota", "model": "Corolla" }
 * }
 */
export const testEngineSoundAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { audioPath, vehicleInfo } = req.body;

  if (!audioPath) {
    res.status(400).json({
      success: false,
      message: 'Ses dosyası yolu gereklidir'
    });
    return;
  }

  try {
    const startTime = Date.now();
    const result = await AIService.analyzeEngineSound(audioPath, vehicleInfo || {});
    const endTime = Date.now();

    res.json({
      success: true,
      message: 'Motor sesi analizi testi başarılı',
      data: {
        result,
        performance: {
          processingTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Motor sesi analizi testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Motor sesi analizi testi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * OpenAI Vision API Testi
 * 
 * OpenAI Vision API'yi test eder.
 * 
 * İşlem Akışı:
 * 1. İmage path kontrolü
 * 2. OpenAI API key kontrolü
 * 3. Analiz türüne göre AI çalıştır
 * 4. İşlem süresi ölç
 * 5. Sonuç döndür
 * 
 * @route   POST /api/ai-test/openai
 * @access  Private (Admin)
 * 
 * @param req.body.imagePath - Test edilecek resim yolu
 * @param req.body.analysisType - Analiz türü (paint, damage, general)
 * 
 * @returns 200 - OpenAI Vision API sonucu + performans
 * @returns 400 - İmage path eksik veya API key yok
 * @returns 500 - Test hatası
 * 
 * @example
 * POST /api/ai-test/openai
 * Body: {
 *   "imagePath": "/uploads/test.jpg",
 *   "analysisType": "damage"
 * }
 */
export const testOpenAIVision = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath, analysisType } = req.body;

  if (!imagePath) {
    res.status(400).json({
      success: false,
      message: 'Resim yolu gereklidir'
    });
    return;
  }

  // OpenAI API key kontrolü
  if (!process.env.OPENAI_API_KEY) {
    res.status(400).json({
      success: false,
      message: 'OpenAI API key yapılandırılmamış'
    });
    return;
  }

  try {
    const startTime = Date.now();
    let result;
    
    // Analiz türüne göre AI çalıştır
    if (analysisType === 'paint') {
      result = await AIService.analyzePaint(imagePath, 'front');
    } else if (analysisType === 'damage') {
      result = await AIService.detectDamage(imagePath);
    } else {
      // Genel analiz için hasar tespiti kullan
      result = await AIService.detectDamage(imagePath);
    }
    
    const endTime = Date.now();

    res.json({
      success: true,
      message: 'OpenAI Vision API testi başarılı',
      data: {
        result,
        performance: {
          processingTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('OpenAI Vision API testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'OpenAI Vision API testi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

/**
 * Kapsamlı AI Testi
 * 
 * Tüm AI servislerini sırayla test eder.
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
 * @route   POST /api/ai-test/comprehensive
 * @access  Private (Admin)
 * 
 * @param req.body.imagePath - Test edilecek resim yolu (zorunlu)
 * @param req.body.audioPath - Test edilecek ses dosyası yolu (opsiyonel)
 * @param req.body.vehicleInfo - Araç bilgileri (opsiyonel)
 * 
 * @returns 200 - Kapsamlı test sonuçları + performans
 * @returns 400 - İmage path eksik
 * @returns 500 - Test hatası
 * 
 * @example
 * POST /api/ai-test/comprehensive
 * Body: {
 *   "imagePath": "/uploads/test.jpg",
 *   "audioPath": "/uploads/engine.wav",
 *   "vehicleInfo": { "brand": "Toyota" }
 * }
 */
export const comprehensiveAITest = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath, audioPath, vehicleInfo } = req.body;

  if (!imagePath) {
    res.status(400).json({
      success: false,
      message: 'Resim yolu gereklidir'
    });
    return;
  }

  try {
    const startTime = Date.now();
    const results: any = {};

    // 1. Boya analizi testi (hata toleranslı)
    try {
      results.paintAnalysis = await AIService.analyzePaint(imagePath, 'front');
    } catch (error) {
      results.paintAnalysis = { error: 'Boya analizi başarısız' };
    }

    // 2. Hasar tespiti testi (hata toleranslı)
    try {
      results.damageDetection = await AIService.detectDamage(imagePath);
    } catch (error) {
      results.damageDetection = { error: 'Hasar tespiti başarısız' };
    }

    // 3. Motor sesi analizi testi (eğer ses dosyası varsa)
    if (audioPath) {
      try {
        results.engineSoundAnalysis = await AIService.analyzeEngineSound(audioPath, vehicleInfo || {});
      } catch (error) {
        results.engineSoundAnalysis = { error: 'Motor sesi analizi başarısız' };
      }
    }

    // 4. OpenAI Vision API testi (eğer API key varsa)
    if (process.env.OPENAI_API_KEY) {
      try {
        results.openaiVision = await AIService.detectDamage(imagePath);
      } catch (error) {
        results.openaiVision = { error: 'OpenAI Vision API başarısız' };
      }
    }

    const endTime = Date.now();

    res.json({
      success: true,
      message: 'Kapsamlı AI testi tamamlandı',
      data: {
        results,
        performance: {
          totalProcessingTime: `${endTime - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('Kapsamlı AI testi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kapsamlı AI testi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});
