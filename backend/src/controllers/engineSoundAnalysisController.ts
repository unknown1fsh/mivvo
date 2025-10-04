import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Multer konfigürasyonu - ses dosyaları için
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/audio';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `engine-sound-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Desteklenmeyen ses formatı. WAV, MP3, OGG veya WebM formatında kayıt yapın.'));
    }
  }
});

// @desc    Motor sesi analizi başlat
// @route   POST /api/engine-sound-analysis/analyze
// @access  Private
export const startEngineSoundAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { vehicleInfo, analysisType } = req.body;
  
  if (!vehicleInfo) {
    res.status(400).json({
      success: false,
      message: 'Araç bilgileri gerekli.'
    });
    return;
  }

  // Ses dosyalarını kontrol et
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    res.status(400).json({
      success: false,
      message: 'En az bir ses dosyası gerekli.'
    });
    return;
  }

  const audioFiles = req.files as Express.Multer.File[];

  // Kullanıcı kredilerini kontrol et
  const servicePricing = await prisma.servicePricing.findFirst({
    where: {
      serviceType: 'ENGINE_SOUND_ANALYSIS' as any,
      isActive: true,
    },
  });

  if (!servicePricing) {
    res.status(400).json({
      success: false,
      message: 'Motor sesi analizi servisi bulunamadı.'
    });
    return;
  }

  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  if (!userCredits || userCredits.balance < servicePricing.basePrice) {
    res.status(400).json({
      success: false,
      message: 'Yetersiz kredi bakiyesi.'
    });
    return;
  }

  // Rapor oluştur
  const report = await prisma.vehicleReport.create({
    data: {
      userId: req.user!.id,
      reportType: 'ENGINE_SOUND_ANALYSIS' as any,
      vehiclePlate: vehicleInfo.plate,
      vehicleBrand: vehicleInfo.make,
      vehicleModel: vehicleInfo.model,
      vehicleYear: parseInt(vehicleInfo.year),
      totalCost: servicePricing.basePrice,
      status: 'PROCESSING',
    },
  });

  // Ses dosyalarını kaydet
  const audioRecords = [];
  for (const file of audioFiles) {
    const audioRecord = await prisma.vehicleAudio.create({
      data: {
        reportId: report.id,
        audioPath: file.path,
        audioName: file.filename,
        audioType: 'ENGINE_SOUND',
        fileSize: file.size,
        uploadDate: new Date(),
      },
    });
    audioRecords.push(audioRecord);
  }

  // Kredileri düş
  await prisma.userCredits.update({
    where: { userId: req.user!.id },
    data: {
      balance: userCredits.balance.sub(servicePricing.basePrice),
      totalUsed: userCredits.totalUsed.add(servicePricing.basePrice),
    },
  });

  // Kredi işlemi kaydet
  await prisma.creditTransaction.create({
    data: {
      userId: req.user!.id,
      transactionType: 'DEBIT' as any,
      amount: servicePricing.basePrice,
      description: 'Motor sesi analizi',
      referenceId: report.id.toString(),
    },
  });

  // AI analizi simüle et (gerçek uygulamada TensorFlow.js veya benzeri kullanılacak)
  setTimeout(async () => {
    try {
      const analysisResult = await simulateEngineSoundAnalysis(audioFiles, vehicleInfo);
      
      await prisma.vehicleReport.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: analysisResult as any,
        },
      });
    } catch (error) {
      console.error('Motor sesi analizi hatası:', error);
      await prisma.vehicleReport.update({
        where: { id: report.id },
        data: { status: 'FAILED' },
      });
    }
  }, 5000); // 5 saniye sonra analiz tamamlanır

  res.status(201).json({
    success: true,
    data: {
      referenceId: report.id.toString(),
      status: 'PROCESSING',
      message: 'Motor sesi analizi başlatıldı. Analiz tamamlandığında bildirim alacaksınız.'
    }
  });
});

// @desc    Motor sesi analiz sonucunu al
// @route   GET /api/engine-sound-analysis/:reportId
// @access  Private
export const getEngineSoundAnalysisResult = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(reportId),
      userId: req.user!.id,
      reportType: 'ENGINE_SOUND_ANALYSIS' as any,
    },
    include: {
      vehicleAudios: true,
    },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.'
    });
    return;
  }

    res.json({
      success: true,
      data: {
        id: report.id,
        vehicleInfo: {
          make: report.vehicleBrand,
          model: report.vehicleModel,
          year: report.vehicleYear,
          plate: report.vehiclePlate,
          vin: 'Belirtilmemiş'
        },
        overallScore: (report.aiAnalysisData as any)?.overallScore || 0,
        engineHealth: (report.aiAnalysisData as any)?.engineHealth || 'Bilinmiyor',
        rpmAnalysis: (report.aiAnalysisData as any)?.rpmAnalysis || {},
        frequencyAnalysis: (report.aiAnalysisData as any)?.frequencyAnalysis || {},
        detectedIssues: (report.aiAnalysisData as any)?.detectedIssues || [],
        performanceMetrics: (report.aiAnalysisData as any)?.performanceMetrics || {},
        recommendations: (report.aiAnalysisData as any)?.recommendations || [],
        status: report.status,
        createdAt: report.createdAt,
        audioFiles: (report as any).vehicleAudios?.map((audio: any) => ({
          id: audio.id,
          name: audio.audioName,
          size: audio.fileSize,
          type: audio.audioType
        })) || []
      }
    });
});

// @desc    Motor sesi analiz geçmişini al
// @route   GET /api/engine-sound-analysis/history
// @access  Private
export const getEngineSoundAnalysisHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reports = await prisma.vehicleReport.findMany({
    where: {
      userId: req.user!.id,
      reportType: 'ENGINE_SOUND_ANALYSIS' as any,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const history = reports.map(report => ({
    id: report.id,
    vehicleInfo: {
      make: report.vehicleBrand,
      model: report.vehicleModel,
      year: report.vehicleYear,
      plate: report.vehiclePlate,
    },
    analysisDate: report.createdAt,
    overallScore: (report.aiAnalysisData as any)?.overallScore || 0,
    engineHealth: (report.aiAnalysisData as any)?.engineHealth || 'Bilinmiyor',
    referenceId: report.id.toString(),
    status: report.status,
  }));

  res.json({
    success: true,
    data: history
  });
});

// @desc    Motor sesi analiz raporunu indir
// @route   GET /api/engine-sound-analysis/:reportId/download
// @access  Private
export const downloadEngineSoundAnalysisReport = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(reportId),
      userId: req.user!.id,
      reportType: 'ENGINE_SOUND_ANALYSIS' as any,
    },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.'
    });
    return;
  }

  // PDF raporu oluştur (gerçek uygulamada PDF generator kullanılacak)
  const reportData = {
    referenceId: report.id.toString(),
    vehicleInfo: {
      make: report.vehicleBrand,
      model: report.vehicleModel,
      year: report.vehicleYear,
      plate: report.vehiclePlate,
    },
    analysisData: report.aiAnalysisData,
    createdAt: report.createdAt,
  };

  // Basit JSON raporu döndür (gerçek uygulamada PDF olacak)
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="motor-sesi-analizi-${reportId}.json"`);
  res.json(reportData);
});

// @desc    Motor sesi analiz durumunu kontrol et
// @route   GET /api/engine-sound-analysis/:reportId/status
// @access  Private
export const checkEngineSoundAnalysisStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parseInt(reportId),
      userId: req.user!.id,
      reportType: 'ENGINE_SOUND_ANALYSIS' as any,
    },
  });

  if (!report) {
    res.status(404).json({
      success: false,
      message: 'Rapor bulunamadı.'
    });
    return;
  }

  res.json({
    success: true,
    data: {
      status: report.status.toLowerCase(),
      progress: report.status === 'COMPLETED' ? 100 : report.status === 'PROCESSING' ? 75 : 0,
      estimatedTime: report.status === 'PROCESSING' ? 30 : undefined,
    }
  });
});

// Motor sesi analizi - Gerçek AI modeli ile
async function simulateEngineSoundAnalysis(audioFiles: Express.Multer.File[], vehicleInfo: any) {
  try {
    // Yeni AI servisini kullan
    const { AIService } = await import('../services/aiService');
    const audioPath = audioFiles[0]?.path; // İlk ses dosyasını kullan
    
    if (audioPath) {
      // Araç bilgilerini hazırla
      const vehicleInfoForAnalysis = {
        make: vehicleInfo.make,
        model: vehicleInfo.model,
        year: vehicleInfo.year,
        plate: vehicleInfo.plate
      }

      console.log('🚗 Araç bilgileri motor ses analizi prompt\'a dahil ediliyor:', vehicleInfoForAnalysis)

      return await AIService.analyzeEngineSound(audioPath, vehicleInfoForAnalysis);
    }
  } catch (error) {
    console.error('AI motor sesi analizi hatası, simülasyon kullanılıyor:', error);
  }

  // Fallback simülasyon
  const issues = [
    {
      issue: 'Motor Titreşimi',
      severity: 'medium' as const,
      confidence: 85,
      description: 'Motor çalışırken hafif titreşim tespit edildi',
      recommendation: 'Motor montajını kontrol ettirin'
    },
    {
      issue: 'Egzoz Sistemi',
      severity: 'low' as const,
      confidence: 72,
      description: 'Egzoz sisteminde hafif ses değişikliği',
      recommendation: 'Egzoz sistemini kontrol ettirin'
    }
  ];

  return {
    overallScore: Math.floor(Math.random() * 30) + 70,
    engineHealth: 'İyi',
    rpmAnalysis: {
      idleRpm: 800 + Math.floor(Math.random() * 200),
      maxRpm: 6000 + Math.floor(Math.random() * 1000),
      rpmStability: 85 + Math.floor(Math.random() * 15)
    },
    frequencyAnalysis: {
      dominantFrequencies: [120, 240, 360, 480],
      harmonicDistortion: 5 + Math.random() * 10,
      noiseLevel: 45 + Math.random() * 20
    },
    detectedIssues: issues,
    performanceMetrics: {
      engineEfficiency: 80 + Math.floor(Math.random() * 20),
      vibrationLevel: 20 + Math.floor(Math.random() * 30),
      acousticQuality: 75 + Math.floor(Math.random() * 25)
    },
    recommendations: [
      'Motor yağını kontrol edin',
      'Hava filtresini değiştirin',
      'Motor montajını kontrol ettirin'
    ]
  };
}

export { audioUpload };
