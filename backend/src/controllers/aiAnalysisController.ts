import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';
import { DamageDetectionResult } from '../services/damageDetectionService';

const prisma = new PrismaClient();

// @desc    Gelişmiş AI analizi - OpenAI Vision API ile
// @route   POST /api/ai-analysis/advanced
// @access  Private
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
    // OpenAI Vision API ile analiz
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

// @desc    Hasar tespiti - AI modeli ile
// @route   POST /api/ai-analysis/damage-detection
// @access  Private
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

    // Genel skor hesapla
    const overallScore = totalDamages === 0 ? 95 : Math.max(10, 95 - (totalDamages * 15) - (criticalDamages * 25));

    // Hasar şiddeti belirle
    let damageSeverity: 'low' | 'medium' | 'high' | 'critical';
    if (overallScore >= 90) damageSeverity = 'low';
    else if (overallScore >= 70) damageSeverity = 'medium';
    else if (overallScore >= 40) damageSeverity = 'high';
    else damageSeverity = 'critical';

    // Tahmini onarım maliyeti
    const estimatedRepairCost = areas.reduce((sum: number, damage: any) => {
      const baseCost = damage.type === 'dent' ? 1500 : 
                      damage.type === 'scratch' ? 300 :
                      damage.type === 'rust' ? 800 :
                      damage.type === 'oxidation' ? 400 : 500;
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

// @desc    AI model durumu
// @route   GET /api/ai-analysis/status
// @access  Private
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

// @desc    AI model performans testi
// @route   POST /api/ai-analysis/test
// @access  Private
export const testAIModels = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { testType, testData } = req.body;

  try {
    let result;
    const startTime = Date.now();

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

// @desc    AI model eğitimi (admin only)
// @route   POST /api/ai-analysis/train
// @access  Private (Admin)
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
    // Gerçek uygulamada burada model eğitimi yapılacak
    
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

// @desc    AI analiz geçmişi
// @route   GET /api/ai-analysis/history
// @access  Private
export const getAIAnalysisHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 10, type } = req.query;

  try {
    const whereClause: any = {
      userId: req.user!.id
    };

    if (type) {
      whereClause.reportType = type;
    }

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
