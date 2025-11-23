/**
 * Engine Sound Analysis Controller (Motor Sesi Analizi Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, motor sesi analizi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Motor sesi analizi başlatma
 * - Ses dosyası yükleme (Multer - disk storage)
 * - OpenAI Whisper/GPT-4 Audio ile analiz
 * - Analiz sonucu getirme
 * - Analiz geçmişi
 * - Rapor indirme
 * 
 * İş Akışı:
 * 1. Analiz başlat (kredi kontrolü + rapor oluştur)
 * 2. Ses dosyalarını yükle (disk storage)
 * 3. AI analizi simüle et/gerçekleştir (background job)
 * 4. Rapor durumu sorgula
 * 5. Rapor getir/indir
 * 
 * Özellikler:
 * - Multer disk storage (ses dosyaları)
 * - Geniş format desteği (WAV, MP3, M4A, AAC, 3GP, vb.)
 * - OpenAI Audio API entegrasyonu
 * - Kredi yönetimi
 * - Background job simulation
 * 
 * Desteklenen Formatlar:
 * - Standart: WAV, MP3, OGG, WebM
 * - iPhone: M4A, AAC, CAF
 * - Android: 3GP, AMR
 * - Web: Opus, FLAC
 * 
 * Endpoints:
 * - POST /api/engine-sound-analysis/analyze (Analiz başlat)
 * - GET /api/engine-sound-analysis/:reportId (Sonuç getir)
 * - GET /api/engine-sound-analysis/history (Geçmiş)
 * - GET /api/engine-sound-analysis/:reportId/download (Rapor indir)
 * - GET /api/engine-sound-analysis/:reportId/status (Durum)
 */

import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AudioAnalysisService } from '../services/audioAnalysisService';
import { refundCreditForFailedAnalysis } from '../utils/creditRefund';
import { ERROR_MESSAGES } from '../constants/ErrorMessages';
import { CREDIT_PRICING } from '../constants/CreditPricing';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// ===== MULTER KONFİGÜRASYONU =====

/**
 * Multer Disk Storage - Ses Dosyaları
 * 
 * Ses dosyaları disk'e kaydedilir.
 * 
 * Yükleme Dizini: uploads/audio/
 * Dosya Adı: engine-sound-{timestamp}-{random}.{ext}
 * Maksimum Boyut: 50MB
 * 
 * Disk kullanımı sebebi:
 * - Ses dosyaları büyük olabilir (50MB)
 * - RAM'de tutmak maliyetli
 * - AI API'ye dosya yolu ile gönderilecek
 */
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Upload dizini
    const uploadDir = path.join(process.cwd(), 'uploads/audio');
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

/**
 * Multer Upload Instance - Audio
 * 
 * Desteklenen formatlar (geniş cep telefonu desteği):
 * - Standart: WAV, MP3, OGG, WebM
 * - iPhone: M4A, AAC, CAF
 * - Android: 3GP, 3GP2, AMR
 * - Web: Opus, FLAC
 * 
 * MIME type veya uzantı kontrolü yapılır.
 */
const audioUpload = multer({
  storage: audioStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Cep telefonu ve web ses formatları
    const allowedTypes = [
      // Standart formatlar
      'audio/wav',           // WAV
      'audio/mp3',           // MP3
      'audio/mpeg',          // MP3 (alternatif)
      'audio/ogg',           // OGG
      'audio/webm',          // WebM
      // iPhone formatları
      'audio/m4a',           // M4A (iPhone)
      'audio/x-m4a',         // M4A (alternatif)
      'audio/mp4',           // M4A (bazen bu şekilde gelir)
      'audio/aac',           // AAC (iPhone/Android)
      'audio/x-caf',         // CAF (iPhone)
      // Android formatları
      'audio/3gpp',          // 3GP (Android)
      'audio/3gpp2',         // 3GP2 (Android)
      'audio/amr',           // AMR (Android)
      'audio/x-amr',         // AMR (alternatif)
      // Web formatları
      'audio/opus',          // Opus
      'audio/flac',          // FLAC
      'audio/x-flac'         // FLAC (alternatif)
    ];
    
    // Uzantı kontrolü (bazı tarayıcılar yanlış MIME type gönderir)
    const allowedExtensions = ['.wav', '.mp3', '.ogg', '.webm', '.m4a', '.aac', '.3gp', '.amr', '.opus', '.flac', '.caf'];
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Desteklenmeyen ses formatı: ${file.mimetype}. Lütfen cep telefonunuzla kayıt yapın (M4A, AAC, 3GP) veya WAV, MP3, OGG formatı kullanın.`));
    }
  }
});

// ===== CONTROLLER METHODS =====

/**
 * Motor Sesi Analizi Başlat
 * 
 * Yeni bir motor sesi analizi başlatır.
 * 
 * İşlem Akışı:
 * 1. Araç bilgileri kontrolü
 * 2. Ses dosyası kontrolü (Multer ile yüklenmiş olmalı)
 * 3. Kredi kontrolü (ServicePricing)
 * 4. Rapor oluştur (PROCESSING)
 * 5. Ses dosyalarını kaydet (VehicleAudio)
 * 6. Kredi düş
 * 7. CreditTransaction oluştur
 * 8. Background job başlat (setTimeout simülasyonu - 5 saniye)
 * 
 * Kredi Yönetimi:
 * - ServicePricing'den fiyat al
 * - Kullanıcı bakiyesi kontrol et
 * - Kredi düş (balance, totalUsed)
 * - Audit trail (CreditTransaction)
 * 
 * @route   POST /api/engine-sound-analysis/analyze
 * @access  Private
 * 
 * @param req.body.vehicleInfo - Araç bilgileri
 * @param req.body.analysisType - Analiz türü (opsiyonel)
 * @param req.files - Multer ile yüklenen ses dosyaları
 * 
 * @returns 201 - ReferenceId + status
 * @returns 400 - Geçersiz istek (araç bilgisi/ses dosyası eksik, yetersiz kredi)
 * @returns 500 - Sunucu hatası
 * 
 * @example
 * POST /api/engine-sound-analysis/analyze
 * FormData: {
 *   vehicleInfo: { plate: "34ABC123", make: "Toyota", model: "Corolla", year: 2020 },
 *   files: [engine1.wav, engine2.m4a]
 * }
 */
export const startEngineSoundAnalysis = asyncHandler(async (req: AuthRequest, res: Response) => {
  const BYPASS_CREDITS = process.env.BYPASS_CREDITS === 'true' || process.env.NODE_ENV === 'development'
  // vehicleInfo JSON string olarak gelir, parse et
  let vehicleInfo;
  try {
    vehicleInfo = typeof req.body.vehicleInfo === 'string' 
      ? JSON.parse(req.body.vehicleInfo) 
      : req.body.vehicleInfo;
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Geçersiz araç bilgileri formatı.'
    });
    return;
  }
  
  const { analysisType } = req.body;
  
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

  // Servis fiyatını getir (yoksa oluştur)
  let servicePricing = await prisma.servicePricing.findFirst({
    where: {
      serviceType: 'ENGINE_SOUND_ANALYSIS' as any,
      isActive: true,
    },
  });

  if (!servicePricing) {
    try {
      servicePricing = await prisma.servicePricing.create({
        data: {
          serviceName: 'Motor Sesi Analizi',
          serviceType: 'ENGINE_SOUND_ANALYSIS' as any,
          basePrice: new Prisma.Decimal(20),
          isActive: true,
        },
      });
      console.warn('⚠️ ServicePricing ENGINE_SOUND_ANALYSIS bulunamadı, varsayılan oluşturuldu.');
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Motor sesi analizi servisi bulunamadı (oluşturma başarısız).'
      });
      return;
    }
  }

  // Kullanıcı kredilerini kontrol et (geliştirme bypass desteği)
  const userCredits = await prisma.userCredits.findUnique({
    where: { userId: req.user!.id },
  });

  if (!BYPASS_CREDITS) {
    if (!userCredits || userCredits.balance < servicePricing.basePrice) {
      res.status(400).json({
        success: false,
        message: 'Yetersiz kredi bakiyesi.'
      });
      return;
    }
  }

  // Rapor oluştur
  // Yıl değerini güvenli parse et
  const parsedYear = typeof vehicleInfo.year === 'string' ? parseInt(vehicleInfo.year) : vehicleInfo.year;

  const report = await prisma.vehicleReport.create({
    data: {
      userId: req.user!.id,
      reportType: 'ENGINE_SOUND_ANALYSIS' as any,
      vehiclePlate: vehicleInfo.plate,
      vehicleBrand: vehicleInfo.make,
      vehicleModel: vehicleInfo.model,
      vehicleYear: Number.isFinite(parsedYear) ? parsedYear : null,
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

  // Kredileri düş (bypass değilse) - Atomik işlem
  if (!BYPASS_CREDITS && userCredits) {
    await prisma.$transaction(async (tx) => {
      // 1. Kredi düş
      await tx.userCredits.update({
        where: { userId: req.user!.id },
        data: {
          balance: { decrement: servicePricing.basePrice },
          totalUsed: { increment: servicePricing.basePrice },
        },
      });

      // 2. Transaction kaydet
      await tx.creditTransaction.create({
        data: {
          userId: req.user!.id,
          transactionType: 'USAGE',
          amount: servicePricing.basePrice,
          description: 'Motor sesi analizi',
          referenceId: report.id.toString(),
          status: 'COMPLETED',
        },
      });
    });
  }

  // AI analizi simüle et (background job - 5 saniye)
  // TODO: Gerçek uygulamada Bull/Agenda gibi queue kullanılmalı
  setTimeout(async () => {
    // Retry mekanizması: Maksimum 2 deneme
    let analysisResult: any = null
    let lastError: any = null
    const maxRetries = 2
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 Motor sesi analizi tekrar deneniyor... (Deneme ${attempt}/${maxRetries})`)
          // Retry arasında kısa bir bekleme
          await new Promise(resolve => setTimeout(resolve, 2000))
        } else {
          console.log('🔊 Engine Sound Analysis - AI analizi başlatılıyor...')
        }

        analysisResult = await simulateEngineSoundAnalysis(audioFiles, vehicleInfo)
        
        // Başarılı oldu, döngüden çık
        break
      } catch (error) {
        lastError = error
        console.error(`❌ Motor sesi analizi hatası (Deneme ${attempt}/${maxRetries}):`, error)
        
        // Son deneme ise hatayı fırlat
        if (attempt === maxRetries) {
          throw lastError
        }
        // Değilse bir sonraki denemeye geç
      }
    }

    try {
      // Debug: AI sonucunu detaylı logla
      console.log('📊 Engine Sound Analysis - AI Sonucu Detayları:', {
        hasAnalysisResult: !!analysisResult,
        analysisResultKeys: analysisResult ? Object.keys(analysisResult) : [],
        hasOverallScore: !!(analysisResult?.overallScore),
        hasEngineHealth: !!(analysisResult?.engineHealth),
        hasRpmAnalysis: !!(analysisResult?.rpmAnalysis),
        hasSoundQuality: !!(analysisResult?.soundQuality),
        hasDetectedIssues: !!(analysisResult?.detectedIssues),
        overallScore: analysisResult?.overallScore,
        engineHealth: analysisResult?.engineHealth
      });
      
      // SIKI VALİDASYON: AI sonucu boş mu kontrol et
      if (!analysisResult || Object.keys(analysisResult).length === 0) {
        console.error('❌ Engine Sound Analysis - AI analizi boş sonuç döndü')
        throw new Error('AI analizi boş sonuç döndü. Motor sesi analizi yapılamadı.')
      }
      
      // SIKI VALİDASYON: Zorunlu alanlar kontrolü
      if (!analysisResult.overallScore) {
        console.error('❌ Engine Sound Analysis - overallScore eksik')
        throw new Error('AI analiz sonucu eksik. Genel puan bilgisi alınamadı.')
      }

      if (!analysisResult.engineHealth) {
        console.error('❌ Engine Sound Analysis - engineHealth eksik')
        throw new Error('AI analiz sonucu eksik. Motor sağlığı bilgisi alınamadı.')
      }

      if (!analysisResult.rpmAnalysis) {
        console.error('❌ Engine Sound Analysis - rpmAnalysis eksik')
        throw new Error('AI analiz sonucu eksik. RPM analizi bilgisi alınamadı.')
      }
      
      await prisma.vehicleReport.update({
        where: { id: report.id },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: analysisResult as any,
        },
      });
      
      console.log('💾 Engine Sound Analysis - Rapor veritabanına kaydedildi:', {
        reportId: report.id,
        hasAiAnalysisData: true,
        dataKeys: Object.keys(analysisResult)
      });
    } catch (error) {
      console.error('❌ Motor sesi analizi hatası:', error);
      
      // Analiz başarısız oldu - Krediyi iade et (GARANTİLİ)
      let creditRefunded = false
      let refundError: any = null
      
      try {
        const userId = req.user!.id
        const serviceCost = CREDIT_PRICING.ENGINE_SOUND_ANALYSIS
        
        await refundCreditForFailedAnalysis(
          userId,
          report.id,
          serviceCost,
          'Motor sesi analizi AI servisi başarısız - Kredi otomatik iade edildi'
        )
        
        creditRefunded = true
        console.log(`✅ Kredi iade edildi: ${serviceCost} TL`)
      } catch (refundErr) {
        refundError = refundErr
        console.error('❌ Kredi iade hatası:', refundErr)
        // Kredi iade hatası olsa bile raporu FAILED olarak işaretle
      }
      
      // Raporu MUTLAKA FAILED olarak işaretle (kredi iade başarılı olsa da olmasa da)
      try {
        await prisma.vehicleReport.update({
          where: { id: report.id },
          data: { 
            status: 'FAILED',
            expertNotes: creditRefunded 
              ? 'Motor sesi analizi başarısız oldu. AI servisinden veri alınamadı. Kredi otomatik iade edildi.'
              : 'Motor sesi analizi başarısız oldu. AI servisinden veri alınamadı. Kredi iade işlemi başarısız oldu - lütfen destek ile iletişime geçin.'
          },
        })
        console.log('✅ Rapor FAILED durumuna geçirildi')
      } catch (updateError) {
        console.error('❌ Rapor güncelleme hatası:', updateError)
        // Rapor güncelleme hatası olsa bile hata fırlat
      }
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

/**
 * Motor Sesi Analiz Sonucunu Getir
 * 
 * Tamamlanmış motor sesi analizi raporunu döndürür.
 * 
 * İçerik:
 * - Araç bilgileri
 * - Overall score (0-100)
 * - Engine health (İyi, Orta, Kötü)
 * - RPM analizi
 * - Frekans analizi
 * - Tespit edilen sorunlar
 * - Performans metrikleri
 * - Öneriler
 * - Ses dosyaları
 * 
 * @route   GET /api/engine-sound-analysis/:reportId
 * @access  Private
 * 
 * @param req.params.reportId - Rapor ID
 * 
 * @returns 200 - Analiz sonucu
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/engine-sound-analysis/123
 */
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

/**
 * Motor Sesi Analiz Geçmişi
 * 
 * Kullanıcının tüm motor sesi analizlerini listeler.
 * 
 * @route   GET /api/engine-sound-analysis/history
 * @access  Private
 * 
 * @returns 200 - Analiz geçmişi (son 20)
 * 
 * @example
 * GET /api/engine-sound-analysis/history
 */
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

/**
 * Motor Sesi Analiz Raporunu İndir
 * 
 * Raporu JSON formatında indirir.
 * 
 * TODO: PDF rapor oluşturma
 * 
 * @route   GET /api/engine-sound-analysis/:reportId/download
 * @access  Private
 * 
 * @param req.params.reportId - Rapor ID
 * 
 * @returns 200 - JSON rapor dosyası
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/engine-sound-analysis/123/download
 */
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

  // JSON raporu oluştur
  // TODO: PDF generator kullanılacak (pdfkit, puppeteer)
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

  // JSON dosyası olarak döndür
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="motor-sesi-analizi-${reportId}.json"`);
  res.json(reportData);
});

/**
 * Motor Sesi Analiz Durumu Kontrolü
 * 
 * Analiz işleminin durumunu sorgular.
 * 
 * Durumlar:
 * - PENDING: Sırada bekliyor (progress: 0%)
 * - PROCESSING: İşleniyor (progress: 75%)
 * - COMPLETED: Tamamlandı (progress: 100%)
 * - FAILED: Başarısız (progress: 0%)
 * 
 * @route   GET /api/engine-sound-analysis/:reportId/status
 * @access  Private
 * 
 * @param req.params.reportId - Rapor ID
 * 
 * @returns 200 - Durum + progress
 * @returns 404 - Rapor bulunamadı
 * 
 * @example
 * GET /api/engine-sound-analysis/123/status
 */
export const checkEngineSoundAnalysisStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId } = req.params;

  const parsedId = Number.parseInt(reportId as any);
  if (!Number.isFinite(parsedId)) {
    res.status(400).json({
      success: false,
      message: 'Geçersiz reportId.'
    });
    return;
  }

  const report = await prisma.vehicleReport.findFirst({
    where: {
      id: parsedId,
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

// ===== HELPER FUNCTIONS =====

/**
 * Motor Sesi Analizi Simülasyonu
 * 
 * Gerçek AI modeli yerine simülasyon sonucu döndürür.
 * 
 * İşlem:
 * 1. Önce gerçek AIService.analyzeEngineSound dene
 * 2. Hata varsa fallback simülasyon kullan
 * 
 * Simülasyon Sonucu:
 * - Overall score: 70-100 arası random
 * - Engine health: "İyi"
 * - RPM analizi (idle, max, stability)
 * - Frekans analizi (dominant frequencies, harmonic distortion, noise level)
 * - Detected issues (motor titreşimi, egzoz sistemi)
 * - Performance metrics (efficiency, vibration, acoustic quality)
 * - Recommendations (motor yağı, hava filtresi, motor montajı)
 * 
 * @param audioFiles - Yüklenen ses dosyaları
 * @param vehicleInfo - Araç bilgileri
 * @returns Motor sesi analiz sonucu
 */
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
    // audioPath yoksa hata
    throw new Error('Ses dosyası yolu bulunamadı')
  } catch (error) {
    console.error('AI motor sesi analizi hatası:', error);
    // Fallback simülasyon KAPALI: gerçek AI başarısızsa hata fırlat
    throw error instanceof Error ? error : new Error('AI motor sesi analizi başarısız');
  }
}

/**
 * Multer Upload Instance Export
 * 
 * Route'larda middleware olarak kullanılır.
 * 
 * Kullanım:
 * router.post('/analyze', audioUpload.array('files'), startEngineSoundAnalysis)
 */
export { audioUpload };
