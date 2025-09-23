import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';

// @desc    AI servis testi
// @route   GET /api/ai-test/status
// @access  Private
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

// @desc    Boya analizi testi
// @route   POST /api/ai-test/paint
// @access  Private
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

// @desc    Hasar tespiti testi
// @route   POST /api/ai-test/damage
// @access  Private
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

// @desc    Motor sesi analizi testi
// @route   POST /api/ai-test/engine
// @access  Private
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

// @desc    OpenAI Vision API testi
// @route   POST /api/ai-test/openai
// @access  Private
export const testOpenAIVision = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { imagePath, analysisType } = req.body;

  if (!imagePath) {
    res.status(400).json({
      success: false,
      message: 'Resim yolu gereklidir'
    });
    return;
  }

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

// @desc    Kapsamlı AI testi
// @route   POST /api/ai-test/comprehensive
// @access  Private
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

    // Boya analizi
    try {
      results.paintAnalysis = await AIService.analyzePaint(imagePath, 'front');
    } catch (error) {
      results.paintAnalysis = { error: 'Boya analizi başarısız' };
    }

    // Hasar tespiti
    try {
      results.damageDetection = await AIService.detectDamage(imagePath);
    } catch (error) {
      results.damageDetection = { error: 'Hasar tespiti başarısız' };
    }

    // Motor sesi analizi (eğer ses dosyası varsa)
    if (audioPath) {
      try {
        results.engineSoundAnalysis = await AIService.analyzeEngineSound(audioPath, vehicleInfo || {});
      } catch (error) {
        results.engineSoundAnalysis = { error: 'Motor sesi analizi başarısız' };
      }
    }

    // OpenAI Vision API (eğer API key varsa)
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
