/**
 * Value Estimation Controller (Değer Tahmini Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, araç değer tahmini işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Değer tahmini başlatma
 * - Görsel yükleme (Multer - memory storage)
 * - OpenAI ile değer tahmini
 * - Rapor getirme
 * 
 * İş Akışı:
 * 1. Analiz başlat (rapor oluştur - PROCESSING)
 * 2. Görselleri yükle (base64)
 * 3. OpenAI ile değer tahmini (görseller dahil)
 * 4. Raporu güncelle (COMPLETED + aiAnalysisData)
 * 5. Rapor getir
 * 
 * Özellikler:
 * - Multer memory storage (base64)
 * - OpenAI GPT-4 Vision API entegrasyonu
 * - Multi-image support
 * - Piyasa analizi
 * - Fiyat tahmini (min-max-ortalama)
 * 
 * Endpoints:
 * - POST /api/value-estimation/start (Analiz başlat)
 * - POST /api/value-estimation/:reportId/upload (Görsel yükle)
 * - POST /api/value-estimation/:reportId/analyze (Analiz gerçekleştir)
 * - GET /api/value-estimation/:reportId (Rapor getir)
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { ValueEstimationService } from '../services/valueEstimationService'
import { refundCreditForFailedAnalysis } from '../utils/creditRefund'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'
import { CREDIT_PRICING } from '../constants/CreditPricing'
import { InsufficientCreditsException } from '../exceptions/BusinessExceptions'
import { BaseException } from '../exceptions/BaseException'
import multer from 'multer'

const prisma = new PrismaClient()

// ===== MULTER KONFİGÜRASYONU =====

/**
 * Multer Memory Storage
 * 
 * Görseller RAM'e yüklenir, base64'e çevrilir.
 * 
 * Maksimum: 10MB
 * Format: image/*
 */
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'))
    }
  }
})

// ===== CONTROLLER CLASS =====

export class ValueEstimationController {
  /**
   * Değer Tahmini Başlat
   * 
   * Yeni bir değer tahmini raporu oluşturur.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Araç bilgileri kontrolü (plaka zorunlu)
   * 3. VehicleReport kaydı oluştur (PROCESSING)
   * 4. ReportId döndür
   * 
   * @route   POST /api/value-estimation/start
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
   * POST /api/value-estimation/start
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
        const requiredAmount = CREDIT_PRICING.VALUE_ESTIMATION
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
          reportType: 'VALUE_ESTIMATION',
          status: 'PROCESSING',
          totalCost: CREDIT_PRICING.VALUE_ESTIMATION,
          aiAnalysisData: {}
        }
      })

      res.json({
        success: true,
        data: {
          reportId: report.id,
          status: 'PROCESSING',
          message: 'Değer tahmini başlatıldı'
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

      console.error('❌ Değer tahmini başlatma hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Değer tahmini başlatılamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Görsel Yükleme
   * 
   * Değer tahmini için görselleri yükler.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü
   * 3. Dosya varlık kontrolü
   * 4. Her dosya için base64 encode + VehicleImage kaydı
   * 
   * @route   POST /api/value-estimation/:reportId/upload
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
   * POST /api/value-estimation/123/upload
   * FormData: { files: [car1.jpg, car2.jpg] }
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
   * Değer Tahmini Gerçekleştir
   * 
   * OpenAI ile araç değer tahmini yapar.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü (görseller dahil)
   * 3. Araç bilgilerini hazırla
   * 4. Görsel path'lerini topla
   * 5. ValueEstimationService.estimateValue çağır (OpenAI)
   * 6. Raporu güncelle (COMPLETED + aiAnalysisData)
   * 
   * OpenAI Prompt:
   * - Araç bilgileri dahil
   * - Multi-image analiz
   * - Piyasa araştırması
   * - Fiyat tahmini (min, max, ortalama)
   * - Türkçe rapor
   * 
   * @route   POST /api/value-estimation/:reportId/analyze
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * 
   * @returns 200 - Değer tahmini sonucu
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - AI hatası
   * 
   * @example
   * POST /api/value-estimation/123/analyze
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
        include: { vehicleImages: true }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      console.log('💰 OpenAI ile değer tahmini başlatılıyor...')

      // Araç bilgilerini hazırla
      const vehicleInfo = {
        make: report.vehicleBrand,
        model: report.vehicleModel,
        year: report.vehicleYear,
        plate: report.vehiclePlate
      }

      console.log('🚗 Araç bilgileri değer tahmini prompt\'a dahil ediliyor:', vehicleInfo)

      // Retry mekanizması: Maksimum 2 deneme
      let valueResult: any = null
      let lastError: any = null
      const maxRetries = 2
      
      // AI analizi gerçekleştir - Resimleri de gönder
      const imagePaths = report.vehicleImages.map(img => img.imageUrl)
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`🔄 Değer tahmini tekrar deneniyor... (Deneme ${attempt}/${maxRetries})`)
            // Retry arasında kısa bir bekleme
            await new Promise(resolve => setTimeout(resolve, 2000))
          } else {
            console.log('💰 OpenAI ile değer tahmini başlatılıyor...')
          }

          valueResult = await ValueEstimationService.estimateValue(vehicleInfo, imagePaths)
          
          // Başarılı oldu, döngüden çık
          break
        } catch (error) {
          lastError = error
          console.error(`❌ Değer tahmini hatası (Deneme ${attempt}/${maxRetries}):`, error)
          
          // Son deneme ise hatayı fırlat
          if (attempt === maxRetries) {
            throw lastError
          }
          // Değilse bir sonraki denemeye geç
        }
      }

      console.log('✅ Değer tahmini tamamlandı')
      
      // Debug: AI sonucunu detaylı logla
      console.log('📊 Value Estimation - AI Sonucu Detayları:', {
        hasValueResult: !!valueResult,
        valueResultKeys: valueResult ? Object.keys(valueResult) : [],
        hasEstimatedValue: !!(valueResult?.estimatedValue),
        hasMarketAnalysis: !!(valueResult?.marketAnalysis),
        hasVehicleCondition: !!(valueResult?.vehicleCondition),
        hasPriceBreakdown: !!(valueResult?.priceBreakdown),
        estimatedValue: valueResult?.estimatedValue,
        confidence: valueResult?.confidence
      });
      
      // SIKI VALİDASYON: AI sonucu boş mu kontrol et
      if (!valueResult || Object.keys(valueResult).length === 0) {
        console.error('❌ Value Estimation - AI analizi boş sonuç döndü')
        throw new Error('AI analizi boş sonuç döndü. Değer tahmini yapılamadı.')
      }
      
      // SIKI VALİDASYON: Zorunlu alanlar kontrolü
      if (!valueResult.estimatedValue && valueResult.estimatedValue !== 0) {
        console.error('❌ Value Estimation - estimatedValue eksik')
        throw new Error('AI analiz sonucu eksik. Tahmini değer bilgisi alınamadı.')
      }

      if (!valueResult.marketAnalysis && !valueResult.market_analysis) {
        console.error('❌ Value Estimation - marketAnalysis eksik')
        throw new Error('AI analiz sonucu eksik. Piyasa analizi bilgisi alınamadı.')
      }

      // Raporu güncelle
      await prisma.vehicleReport.update({
        where: { id: parseInt(reportId) },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: valueResult as any
        }
      })
      
      console.log('💾 Value Estimation - Rapor veritabanına kaydedildi:', {
        reportId: parseInt(reportId),
        hasAiAnalysisData: true,
        dataKeys: Object.keys(valueResult)
      });

      res.json({
        success: true,
        data: {
          reportId,
          analysisResult: valueResult,
          message: 'OpenAI ile değer tahmini tamamlandı'
        }
      })

    } catch (error) {
      console.error('❌ Değer tahmini hatası:', error)
      
      // Analiz başarısız oldu - Krediyi iade et (GARANTİLİ)
      let creditRefunded = false
      let refundError: any = null
      
      try {
        const userId = req.user!.id
        const serviceCost = CREDIT_PRICING.VALUE_ESTIMATION
        
        await refundCreditForFailedAnalysis(
          userId,
          parseInt(req.params.reportId),
          serviceCost,
          'Değer tahmini AI servisi başarısız - Kredi otomatik iade edildi'
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
              ? 'Değer tahmini başarısız oldu. AI servisinden veri alınamadı. Kredi otomatik iade edildi.'
              : 'Değer tahmini başarısız oldu. AI servisinden veri alınamadı. Kredi iade işlemi başarısız oldu - lütfen destek ile iletişime geçin.'
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
        refundedAmount: creditRefunded ? CREDIT_PRICING.VALUE_ESTIMATION : undefined,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Değer Tahmini Raporunu Getir
   * 
   * Tamamlanmış raporu döndürür.
   * 
   * İçerik:
   * - Rapor bilgileri
   * - Araç bilgileri
   * - Görseller
   * - AI analiz sonucu (değer tahmini)
   * 
   * @route   GET /api/value-estimation/:reportId
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
   * GET /api/value-estimation/123
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
        include: { vehicleImages: true }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      res.json({
        success: true,
        data: {
          ...report,
          aiAnalysisData: report.aiAnalysisData || {}
        }
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
 * Multer Upload Instance Export
 * 
 * Route'larda middleware olarak kullanılır.
 * 
 * Kullanım:
 * router.post('/:reportId/upload', upload.array('files'), uploadImages)
 */
export { upload }
