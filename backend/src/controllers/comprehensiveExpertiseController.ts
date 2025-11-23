/**
 * Comprehensive Expertise Controller (Tam Ekspertiz Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, tam ekspertiz (kapsamlı analiz) işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Tam ekspertiz başlatma
 * - Görsel yükleme (Multer - memory)
 * - Ses dosyası yükleme (Multer - memory)
 * - OpenAI ile kapsamlı analiz
 * - Rapor getirme
 * 
 * İş Akışı:
 * 1. Analiz başlat (rapor oluştur - PROCESSING)
 * 2. Görselleri yükle (base64)
 * 3. Ses dosyasını yükle (base64)
 * 4. OpenAI ile kapsamlı analiz (tüm veriler dahil)
 * 5. Raporu güncelle (COMPLETED + aiAnalysisData)
 * 6. Rapor getir
 * 
 * Kapsamlı Analiz İçeriği:
 * - Hasar tespiti
 * - Boya analizi
 * - Motor sesi analizi
 * - Değer tahmini
 * - Genel durum değerlendirmesi
 * - Yatırım kararı önerisi
 * 
 * Özellikler:
 * - Multi-modal AI (görsel + ses)
 * - Multer memory storage (görsel ve ses)
 * - OpenAI GPT-4 Vision + Audio API
 * - Kapsamlı Türkçe rapor
 * 
 * Endpoints:
 * - POST /api/comprehensive-expertise/start (Analiz başlat)
 * - POST /api/comprehensive-expertise/:reportId/upload-images (Görsel yükle)
 * - POST /api/comprehensive-expertise/:reportId/upload-audio (Ses yükle)
 * - POST /api/comprehensive-expertise/:reportId/analyze (Analiz gerçekleştir)
 * - GET /api/comprehensive-expertise/:reportId (Rapor getir)
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { ComprehensiveExpertiseService } from '../services/comprehensiveExpertiseService'
import { refundCreditForFailedAnalysis } from '../utils/creditRefund'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'
import { CREDIT_PRICING } from '../constants/CreditPricing'
import { InsufficientCreditsException } from '../exceptions/BusinessExceptions'
import { BaseException } from '../exceptions/BaseException'
import multer from 'multer'

const prisma = new PrismaClient()

// ===== MULTER KONFİGÜRASYONU =====

/**
 * Multer Memory Storage - Görsel Dosyaları
 * 
 * Görseller RAM'e yüklenir, base64'e çevrilir.
 * 
 * Maksimum: 10MB
 * Format: image/*
 */
const imageStorage = multer.memoryStorage()
const imageUpload = multer({ 
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'))
    }
  }
})

/**
 * Multer Memory Storage - Ses Dosyaları
 * 
 * Ses dosyaları RAM'e yüklenir, base64'e çevrilir.
 * 
 * Maksimum: 50MB
 * Format: audio/* (geniş format desteği)
 */
const audioStorage = multer.memoryStorage()
const audioUpload = multer({ 
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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
    ]
    
    // Uzantı kontrolü
    const allowedExtensions = ['.wav', '.mp3', '.ogg', '.webm', '.m4a', '.aac', '.3gp', '.amr', '.opus', '.flac', '.caf']
    const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'))
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error(`Desteklenmeyen ses formatı: ${file.mimetype}. Lütfen WAV, MP3, M4A, AAC, 3GP, OGG veya WebM formatında kayıt yapın.`))
    }
  }
})

// ===== CONTROLLER CLASS =====

export class ComprehensiveExpertiseController {
  /**
   * Tam Ekspertiz Başlat
   * 
   * Yeni bir tam ekspertiz raporu oluşturur.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Araç bilgileri kontrolü (plaka zorunlu)
   * 3. VehicleReport kaydı oluştur (FULL_REPORT, PROCESSING)
   * 4. ReportId döndür
   * 
   * @route   POST /api/comprehensive-expertise/start
   * @access  Private
   * 
   * @param req.body.vehicleInfo - Araç bilgileri
   * 
   * @returns 200 - ReportId + status
   * @returns 400 - Araç bilgileri eksik
   * @returns 401 - Yetkisiz
   * @returns 500 - Sunucu hatası
   * 
   * @example
   * POST /api/comprehensive-expertise/start
   * Body: {
   *   "vehicleInfo": {
   *     "plate": "34ABC123",
   *     "make": "Toyota",
   *     "model": "Corolla",
   *     "year": 2020
   *   }
   * }
   */
  static async startAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      const { vehicleInfo } = req.body

      if (!vehicleInfo || !vehicleInfo.plate) {
        res.status(400).json({
          success: false,
          message: 'Araç bilgileri eksik. Plaka bilgisi gerekli.'
        })
        return
      }

      // Bakiye kontrolü (Test modunda atlanır)
      const isTestMode = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true'
      if (!isTestMode) {
        const requiredAmount = CREDIT_PRICING.COMPREHENSIVE_EXPERTISE
        const userCredits = await prisma.userCredits.findUnique({
          where: { userId }
        })

        if (!userCredits || userCredits.balance.toNumber() < requiredAmount) {
          throw new InsufficientCreditsException(
            `Yetersiz kredi. Gerekli: ${requiredAmount} TL, Mevcut: ${userCredits?.balance.toNumber() || 0} TL`
          )
        }
      }

      // Rapor oluştur
      const report = await prisma.vehicleReport.create({
        data: {
          userId,
          vehiclePlate: vehicleInfo.plate || 'Belirtilmemiş',
          vehicleBrand: vehicleInfo.make || vehicleInfo.brand || 'Belirtilmemiş',
          vehicleModel: vehicleInfo.model || 'Belirtilmemiş',
          vehicleYear: vehicleInfo.year || new Date().getFullYear(),
          reportType: 'FULL_REPORT' as any,
          status: 'PROCESSING',
          totalCost: CREDIT_PRICING.COMPREHENSIVE_EXPERTISE,
          aiAnalysisData: {}
        }
      })

      res.json({
        success: true,
        data: {
          reportId: report.id,
          status: 'PROCESSING',
          message: 'Tam expertiz başlatıldı'
        }
      })

    } catch (error) {
      // BaseException (InsufficientCreditsException vb.) kontrolü
      if (error instanceof BaseException) {
        res.status(error.statusCode).json({
          success: false,
          error: error.name,
          message: error.message,
          statusCode: error.statusCode
        })
        return
      }

      console.error('❌ Tam expertiz başlatma hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Tam expertiz başlatılamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Görsel Yükleme
   * 
   * Tam ekspertiz için görselleri yükler.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü
   * 3. Dosya varlık kontrolü
   * 4. Her dosya için base64 encode + VehicleImage kaydı
   * 
   * @route   POST /api/comprehensive-expertise/:reportId/upload-images
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * @param req.files - Multer ile yüklenen dosyalar
   * 
   * @returns 200 - Yüklenen görseller
   * @returns 400 - Dosya bulunamadı
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - Sunucu hatası
   * 
   * @example
   * POST /api/comprehensive-expertise/123/upload-images
   * FormData: { files: [image1.jpg, image2.jpg] }
   */
  static async uploadImages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { reportId } = req.params

      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'Resim dosyası gerekli' })
        return
      }

      const imageRecords = await Promise.all(
        files.map(async (file) => {
          const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          
          return prisma.vehicleImage.create({
            data: {
              reportId: parseInt(reportId),
              imageUrl: base64Image,
              imageType: 'EXTERIOR',
              fileSize: file.size
            }
          })
        })
      )

      res.json({
        success: true,
        data: {
          images: imageRecords,
          message: `${files.length} resim başarıyla yüklendi`
        }
      })

    } catch (error) {
      console.error('Resim yükleme hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Resimler yüklenemedi'
      })
    }
  }

  /**
   * Ses Dosyası Yükleme
   * 
   * Tam ekspertiz için ses dosyasını yükler.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü
   * 3. Dosya varlık kontrolü
   * 4. Her dosya için base64 encode + VehicleAudio kaydı
   * 
   * @route   POST /api/comprehensive-expertise/:reportId/upload-audio
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * @param req.files - Multer ile yüklenen ses dosyaları
   * 
   * @returns 200 - Yüklenen ses dosyaları
   * @returns 400 - Dosya bulunamadı
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - Sunucu hatası
   * 
   * @example
   * POST /api/comprehensive-expertise/123/upload-audio
   * FormData: { files: [engine.wav] }
   */
  static async uploadAudio(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { reportId } = req.params

      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      const files = req.files as Express.Multer.File[]
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'Ses dosyası gerekli' })
        return
      }

      const audioRecords = await Promise.all(
        files.map(async (file) => {
          const base64Audio = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          
          return prisma.vehicleAudio.create({
            data: {
              reportId: parseInt(reportId),
              audioPath: base64Audio,
              audioName: file.originalname,
              audioType: 'ENGINE_SOUND',
              fileSize: file.size,
              uploadDate: new Date()
            }
          })
        })
      )

      res.json({
        success: true,
        data: {
          audios: audioRecords,
          message: `${files.length} ses dosyası başarıyla yüklendi`
        }
      })

    } catch (error) {
      console.error('Ses dosyası yükleme hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Ses dosyaları yüklenemedi'
      })
    }
  }

  /**
   * Tam Ekspertiz Gerçekleştir
   * 
   * OpenAI ile kapsamlı araç analizi yapar.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü (görseller + ses dahil)
   * 3. Araç bilgilerini hazırla
   * 4. Görsel ve ses path'lerini topla
   * 5. ComprehensiveExpertiseService.generateComprehensiveReport çağır
   * 6. Raporu güncelle (COMPLETED + aiAnalysisData)
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
   * @route   POST /api/comprehensive-expertise/:reportId/analyze
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * 
   * @returns 200 - Kapsamlı analiz sonucu
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - AI hatası
   * 
   * @example
   * POST /api/comprehensive-expertise/123/analyze
   */
  static async performAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { reportId } = req.params

      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId },
        include: { 
          vehicleImages: true,
          vehicleAudios: true
        }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      console.log('📋 OpenAI ile tam expertiz başlatılıyor...')

      // Araç bilgilerini hazırla
      const vehicleInfo = {
        make: report.vehicleBrand,
        model: report.vehicleModel,
        year: report.vehicleYear,
        plate: report.vehiclePlate
      }

      console.log('🚗 Araç bilgileri kapsamlı expertiz prompt\'a dahil ediliyor:', vehicleInfo)

      // Retry mekanizması: Maksimum 2 deneme
      let expertiseResult: any = null
      let lastError: any = null
      const maxRetries = 2
      
      // AI analizi gerçekleştir
      const imagePaths = report.vehicleImages.map(img => img.imageUrl)
      const audioPath = report.vehicleAudios.length > 0 ? report.vehicleAudios[0].audioPath : undefined
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`🔄 Kapsamlı ekspertiz tekrar deneniyor... (Deneme ${attempt}/${maxRetries})`)
            // Retry arasında kısa bir bekleme
            await new Promise(resolve => setTimeout(resolve, 2000))
          } else {
            console.log('📋 OpenAI ile tam expertiz başlatılıyor...')
          }

          expertiseResult = await ComprehensiveExpertiseService.generateComprehensiveReport(
            vehicleInfo,
            imagePaths,
            audioPath
          )
          
          // Başarılı oldu, döngüden çık
          break
        } catch (error) {
          lastError = error
          console.error(`❌ Kapsamlı ekspertiz hatası (Deneme ${attempt}/${maxRetries}):`, error)
          
          // Son deneme ise hatayı fırlat
          if (attempt === maxRetries) {
            throw lastError
          }
          // Değilse bir sonraki denemeye geç
        }
      }

      console.log('✅ Tam expertiz tamamlandı')
      
      // Debug: AI sonucunu detaylı logla
      console.log('📊 Comprehensive Expertise - AI Sonucu Detayları:', {
        hasExpertiseResult: !!expertiseResult,
        expertiseResultKeys: expertiseResult ? Object.keys(expertiseResult) : [],
        hasOverallScore: !!(expertiseResult?.overallScore),
        hasExpertiseGrade: !!(expertiseResult?.expertiseGrade),
        hasComprehensiveSummary: !!(expertiseResult?.comprehensiveSummary),
        hasExpertOpinion: !!(expertiseResult?.expertOpinion),
        hasFinalRecommendations: !!(expertiseResult?.finalRecommendations),
        hasInvestmentDecision: !!(expertiseResult?.investmentDecision),
        overallScore: expertiseResult?.overallScore,
        expertiseGrade: expertiseResult?.expertiseGrade
      });
      
      // SIKI VALİDASYON: AI sonucu boş mu kontrol et
      if (!expertiseResult || Object.keys(expertiseResult).length === 0) {
        console.error('❌ Comprehensive Expertise - AI analizi boş sonuç döndü')
        throw new Error('AI analizi boş sonuç döndü. Kapsamlı ekspertiz yapılamadı.')
      }
      
      // SIKI VALİDASYON: Zorunlu alanlar kontrolü
      if (!expertiseResult.overallScore) {
        console.error('❌ Comprehensive Expertise - overallScore eksik')
        throw new Error('AI analiz sonucu eksik. Genel puan bilgisi alınamadı.')
      }

      if (!expertiseResult.expertiseGrade) {
        console.error('❌ Comprehensive Expertise - expertiseGrade eksik')
        throw new Error('AI analiz sonucu eksik. Ekspertiz notu bilgisi alınamadı.')
      }

      if (!expertiseResult.comprehensiveSummary) {
        console.error('❌ Comprehensive Expertise - comprehensiveSummary eksik')
        throw new Error('AI analiz sonucu eksik. Kapsamlı özet bilgisi alınamadı.')
      }

      // Raporu güncelle
      await prisma.vehicleReport.update({
        where: { id: parseInt(reportId) },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: expertiseResult as any
        }
      })
      
      console.log('💾 Comprehensive Expertise - Rapor veritabanına kaydedildi:', {
        reportId: parseInt(reportId),
        hasAiAnalysisData: true,
        dataKeys: Object.keys(expertiseResult)
      });

      res.json({
        success: true,
        data: {
          reportId,
          analysisResult: expertiseResult,
          message: 'OpenAI ile tam expertiz tamamlandı'
        }
      })

    } catch (error) {
      console.error('❌ Tam expertiz hatası:', error)
      
      // Analiz başarısız oldu - Krediyi iade et (GARANTİLİ)
      let creditRefunded = false
      let refundError: any = null
      
      try {
        const userId = req.user!.id
        const serviceCost = CREDIT_PRICING.COMPREHENSIVE_EXPERTISE
        
        await refundCreditForFailedAnalysis(
          userId,
          parseInt(req.params.reportId),
          serviceCost,
          'Kapsamlı ekspertiz AI servisi başarısız - Kredi otomatik iade edildi'
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
          where: { id: parseInt(req.params.reportId) },
          data: {
            status: 'FAILED',
            expertNotes: creditRefunded 
              ? 'Kapsamlı ekspertiz başarısız oldu. AI servisinden veri alınamadı. Kredi otomatik iade edildi.'
              : 'Kapsamlı ekspertiz başarısız oldu. AI servisinden veri alınamadı. Kredi iade işlemi başarısız oldu - lütfen destek ile iletişime geçin.'
          }
        })
        console.log('✅ Rapor FAILED durumuna geçirildi')
      } catch (updateError) {
        console.error('❌ Rapor güncelleme hatası:', updateError)
        // Rapor güncelleme hatası olsa bile hata fırlat
      }
      
      // Kullanıcıya net hata mesajı ver
      const errorMessage = creditRefunded
        ? ERROR_MESSAGES.ANALYSIS.AI_FAILED_WITH_REFUND || 'AI analizi tamamlanamadı. Krediniz otomatik olarak iade edildi. Lütfen daha sonra tekrar deneyin.'
        : 'AI analizi tamamlanamadı. Kredi iade işlemi sırasında bir sorun oluştu. Lütfen destek ile iletişime geçin.'
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        creditRefunded,
        refundedAmount: creditRefunded ? CREDIT_PRICING.COMPREHENSIVE_EXPERTISE : undefined,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Tam Ekspertiz Raporunu Getir
   * 
   * Tamamlanmış raporu döndürür.
   * 
   * İçerik:
   * - Rapor bilgileri
   * - Araç bilgileri
   * - Görseller
   * - Ses dosyaları
   * - AI analiz sonucu (tam ekspertiz)
   * 
   * @route   GET /api/comprehensive-expertise/:reportId
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * 
   * @returns 200 - Rapor detayları
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - Sunucu hatası
   * 
   * @example
   * GET /api/comprehensive-expertise/123
   */
  static async getReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { reportId } = req.params

      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId },
        include: { 
          vehicleImages: true,
          vehicleAudios: true
        }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      res.json({
        success: true,
        data: report
      })

    } catch (error) {
      console.error('Rapor getirme hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Rapor getirilemedi'
      })
    }
  }
}

/**
 * Multer Upload Instances Export
 * 
 * Route'larda middleware olarak kullanılır.
 * 
 * Kullanım:
 * - Görsel: router.post('/:reportId/upload-images', imageUpload.array('files'), uploadImages)
 * - Ses: router.post('/:reportId/upload-audio', audioUpload.array('files'), uploadAudio)
 */
export { imageUpload, audioUpload }
