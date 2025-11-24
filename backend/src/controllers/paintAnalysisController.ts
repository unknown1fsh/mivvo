/**
 * Paint Analysis Controller (Boya Analizi Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, boya analizi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Boya analizi başlatma
 * - Görsel yükleme (Multer - memory storage)
 * - OpenAI Vision API ile analiz
 * - Rapor getirme
 * 
 * İş Akışı:
 * 1. Analiz başlat (rapor oluştur - PROCESSING)
 * 2. Görselleri yükle (base64 olarak kaydet)
 * 3. OpenAI Vision API ile analiz gerçekleştir
 * 4. Raporu güncelle (COMPLETED + aiAnalysisData)
 * 5. Rapor getir
 * 
 * Özellikler:
 * - Multer memory storage (base64)
 * - OpenAI Vision API entegrasyonu
 * - Detaylı logging
 * - Hata yönetimi
 * 
 * Endpoints:
 * - POST /api/paint-analysis/start (Analiz başlat)
 * - POST /api/paint-analysis/:reportId/upload (Görsel yükle)
 * - POST /api/paint-analysis/:reportId/analyze (Analiz gerçekleştir)
 * - GET /api/paint-analysis/:reportId (Rapor getir)
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { PaintAnalysisService } from '../services/paintAnalysisService'
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
 * Avantajlar:
 * - Dosya sistemi I/O yok
 * - Doğrudan base64 encode
 * - OpenAI API için uygun
 * 
 * Dezavantajlar:
 * - RAM kullanımı (10MB limit)
 */
const storage = multer.memoryStorage()
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'))
    }
  }
})

// ===== CONTROLLER CLASS =====

export class PaintAnalysisController {
  /**
   * Boya Analizi Başlat
   * 
   * Yeni bir boya analizi raporu oluşturur.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Araç bilgileri kontrolü (plaka zorunlu)
   * 3. VehicleReport kaydı oluştur (PROCESSING)
   * 4. ReportId döndür
   * 
   * @route   POST /api/paint-analysis/start
   * @access  Private
   * 
   * @param req.body.vehicleInfo - Araç bilgileri (plate, make, model, year)
   * 
   * @returns 200 - ReportId + status
   * @returns 400 - Araç bilgileri eksik
   * @returns 401 - Yetkisiz
   * @returns 500 - Sunucu hatası
   * 
   * @example
   * POST /api/paint-analysis/start
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

      // Araç bilgileri kontrolü
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
        const requiredAmount = CREDIT_PRICING.PAINT_ANALYSIS
        const userCredits = await prisma.userCredits.findUnique({
          where: { userId }
        })

        if (!userCredits || userCredits.balance.toNumber() < requiredAmount) {
          throw new InsufficientCreditsException(
            `Yetersiz kredi. Gerekli: ${requiredAmount} TL, Mevcut: ${userCredits?.balance.toNumber() || 0} TL`
          )
        }
      }

      // Rapor oluştur (PROCESSING)
      const report = await prisma.vehicleReport.create({
        data: {
          userId,
          vehiclePlate: vehicleInfo.plate || 'Belirtilmemiş',
          vehicleBrand: vehicleInfo.make || vehicleInfo.brand || 'Belirtilmemiş',
          vehicleModel: vehicleInfo.model || 'Belirtilmemiş',
          vehicleYear: vehicleInfo.year || new Date().getFullYear(),
          reportType: 'PAINT_ANALYSIS',
          status: 'PROCESSING',
          totalCost: CREDIT_PRICING.PAINT_ANALYSIS,
          aiAnalysisData: {}
        }
      })

      res.json({
        success: true,
        data: {
          reportId: report.id,
          status: 'PROCESSING',
          message: 'Boya analizi başlatıldı'
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

      console.error('❌ Boya analizi başlatma hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Boya analizi başlatılamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Görsel Yükleme
   * 
   * Boya analizi için görselleri yükler.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü
   * 3. Dosya varlık kontrolü
   * 4. Her dosya için:
   *    - Base64 encode
   *    - VehicleImage kaydı oluştur (imageType: PAINT)
   * 
   * Base64 Format:
   * data:image/jpeg;base64,/9j/4AAQSkZJRg...
   * 
   * @route   POST /api/paint-analysis/:reportId/upload
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * @param req.files - Multer ile yüklenen dosyalar (memory)
   * 
   * @returns 200 - Yüklenen görseller
   * @returns 400 - Dosya bulunamadı
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - Sunucu hatası
   * 
   * @example
   * POST /api/paint-analysis/123/upload
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

      // Rapor sahiplik kontrolü
      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      const files = req.files as Express.Multer.File[]
      console.log(`📤 Rapor ${reportId} için ${files?.length || 0} dosya yüklenmeye çalışılıyor`)
      
      // Dosya varlık kontrolü
      if (!files || files.length === 0) {
        console.error(`❌ Rapor ${reportId} için dosya bulunamadı`)
        res.status(400).json({ 
          success: false, 
          message: 'Resim dosyası gerekli',
          details: {
            reportId: parseInt(reportId),
            receivedFiles: files?.length || 0,
            suggestion: 'Lütfen en az bir resim dosyası seçin'
          }
        })
        return
      }

      // Her dosya için VehicleImage kaydı oluştur
      const imageRecords = await Promise.all(
        files.map(async (file, index) => {
          console.log(`📸 Resim ${index + 1} işleniyor: ${file.originalname} (${file.size} bytes)`)
          
          // Base64 encode
          const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
          
          const imageRecord = await prisma.vehicleImage.create({
            data: {
              reportId: parseInt(reportId),
              imageUrl: base64Image,
              imageType: 'PAINT',
              fileSize: file.size
            }
          })
          
          console.log(`✅ Resim ${index + 1} veritabanına kaydedildi: ID ${imageRecord.id}`)
          return imageRecord
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
   * Boya Analizi Gerçekleştir
   * 
   * OpenAI Vision API ile boya analizi yapar.
   * 
   * İşlem Akışı:
   * 1. Kullanıcı yetkisi kontrolü
   * 2. Rapor sahiplik kontrolü
   * 3. Görselleri getir (en az 1 tane)
   * 4. Araç bilgilerini hazırla
   * 5. PaintAnalysisService.analyzePaint çağır (OpenAI)
   * 6. AI sonucunu kontrol et
   * 7. Raporu güncelle (COMPLETED + aiAnalysisData)
   * 
   * OpenAI Prompt:
   * - Araç bilgileri dahil edilir
   * - Detaylı Türkçe analiz istenir
   * - JSON formatında sonuç beklenir
   * 
   * @route   POST /api/paint-analysis/:reportId/analyze
   * @access  Private
   * 
   * @param req.params.reportId - Rapor ID
   * 
   * @returns 200 - Analiz sonucu
   * @returns 400 - Görsel bulunamadı
   * @returns 401 - Yetkisiz
   * @returns 404 - Rapor bulunamadı
   * @returns 500 - AI hatası
   * 
   * @example
   * POST /api/paint-analysis/123/analyze
   */
  static async performAnalysis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { reportId } = req.params

      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      // Rapor sahiplik kontrolü
      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      // Görselleri getir
      const images = await prisma.vehicleImage.findMany({
        where: { reportId: parseInt(reportId) }
      })

      console.log(`🔍 Rapor ${reportId} için ${images.length} resim bulundu`)

      // Görsel varlık kontrolü
      if (!images || images.length === 0) {
        console.error(`❌ Rapor ${reportId} için resim bulunamadı`)
        res.status(400).json({ 
          success: false, 
          message: 'Analiz için resim gerekli. Lütfen önce resim yükleyin.',
          details: {
            reportId: parseInt(reportId),
            imageCount: 0,
            suggestion: 'Resim yükleme adımını tamamladığınızdan emin olun'
          }
        })
        return
      }

      console.log('🎨 OpenAI Vision API ile boya analizi başlatılıyor...')
      console.log('📸 İlk resim URL:', images[0].imageUrl.substring(0, 50) + '...')

      // Araç bilgilerini hazırla
      const vehicleInfo = {
        make: report.vehicleBrand,
        model: report.vehicleModel,
        year: report.vehicleYear,
        plate: report.vehiclePlate
      }

      console.log('🚗 Araç bilgileri prompt\'a dahil ediliyor:', vehicleInfo)

      // Retry mekanizması: Maksimum 2 deneme
      let paintResult: any = null
      let lastError: any = null
      const maxRetries = 2
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 1) {
            console.log(`🔄 Boya analizi tekrar deneniyor... (Deneme ${attempt}/${maxRetries})`)
            // Retry arasında kısa bir bekleme
            await new Promise(resolve => setTimeout(resolve, 2000))
          } else {
            console.log('🤖 PaintAnalysisService.analyzePaint çağrılıyor...')
          }

          paintResult = await PaintAnalysisService.analyzePaint(images[0].imageUrl, vehicleInfo)
          
          // Başarılı oldu, döngüden çık
          break
        } catch (error) {
          lastError = error
          console.error(`❌ Boya analizi hatası (Deneme ${attempt}/${maxRetries}):`, error)
          
          // Son deneme ise hatayı fırlat
          if (attempt === maxRetries) {
            throw lastError
          }
          // Değilse bir sonraki denemeye geç
        }
      }

      console.log('✅ Boya analizi tamamlandı')
      
      // Debug: AI sonucunu detaylı logla
      console.log('📊 Paint Analysis - AI Sonucu Detayları:', {
        hasPaintResult: !!paintResult,
        paintResultKeys: paintResult ? Object.keys(paintResult) : [],
        hasBoyaKalitesi: !!(paintResult?.boyaKalitesi),
        hasRenkAnalizi: !!(paintResult?.renkAnalizi),
        hasYüzeyAnalizi: !!(paintResult?.yüzeyAnalizi),
        boyaDurumu: paintResult?.boyaDurumu,
        genelPuan: paintResult?.boyaKalitesi?.genelPuan
      });
      
      // SIKI VALİDASYON: AI sonucu boş mu kontrol et
      if (!paintResult || Object.keys(paintResult).length === 0) {
        console.error('❌ Paint Analysis - AI analizi boş sonuç döndü')
        throw new Error('AI analizi boş sonuç döndü. Boya analizi yapılamadı.')
      }
      
      // SIKI VALİDASYON: Zorunlu alanlar kontrolü
      if (!paintResult.boyaKalitesi) {
        console.error('❌ Paint Analysis - boyaKalitesi eksik')
        throw new Error('AI analiz sonucu eksik. Boya kalitesi bilgisi alınamadı.')
      }

      if (!paintResult.renkAnalizi) {
        console.error('❌ Paint Analysis - renkAnalizi eksik')
        throw new Error('AI analiz sonucu eksik. Renk analizi bilgisi alınamadı.')
      }

      if (!paintResult.yüzeyAnalizi) {
        console.error('❌ Paint Analysis - yüzeyAnalizi eksik')
        throw new Error('AI analiz sonucu eksik. Yüzey analizi bilgisi alınamadı.')
      }

      // Raporu güncelle (COMPLETED)
      await prisma.vehicleReport.update({
        where: { id: parseInt(reportId) },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: paintResult as any
        }
      })
      
      console.log('💾 Paint Analysis - Rapor veritabanına kaydedildi:', {
        reportId: parseInt(reportId),
        hasAiAnalysisData: true,
        dataKeys: Object.keys(paintResult)
      });

      res.json({
        success: true,
        data: {
          reportId,
          analysisResult: paintResult,
          aiAnalysisData: paintResult,
          message: 'OpenAI Vision API ile boya analizi tamamlandı'
        }
      })

    } catch (error) {
      console.error('❌ Boya analizi hatası:', error)
      
      // Analiz başarısız oldu - Krediyi iade et (GARANTİLİ)
      let creditRefunded = false
      let refundError: any = null
      
      try {
        const userId = req.user!.id
        const serviceCost = CREDIT_PRICING.PAINT_ANALYSIS
        
        await refundCreditForFailedAnalysis(
          userId,
          parseInt(req.params.reportId),
          serviceCost,
          'Boya analizi AI servisi başarısız - Kredi otomatik iade edildi'
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
              ? 'Boya analizi başarısız oldu. AI servisinden veri alınamadı. Kredi otomatik iade edildi.'
              : 'Boya analizi başarısız oldu. AI servisinden veri alınamadı. Kredi iade işlemi başarısız oldu - lütfen destek ile iletişime geçin.'
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
        refundedAmount: creditRefunded ? CREDIT_PRICING.PAINT_ANALYSIS : undefined,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Boya Analizi Raporunu Getir
   * 
   * Tamamlanmış raporu döndürür.
   * 
   * İçerik:
   * - Rapor bilgileri
   * - Araç bilgileri
   * - Görseller
   * - AI analiz sonucu
   * 
   * @route   GET /api/paint-analysis/:reportId
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
   * GET /api/paint-analysis/123
   */
  static async getReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id
      const { reportId } = req.params

      if (!userId) {
        res.status(401).json({ success: false, message: 'Yetkilendirme gerekli' })
        return
      }

      // Rapor sahiplik kontrolü (görseller dahil)
      const report = await prisma.vehicleReport.findFirst({
        where: { id: parseInt(reportId), userId },
        include: { vehicleImages: true }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      // Detaylı logging
      console.log('📋 Rapor getirildi:', {
        id: report.id,
        status: report.status,
        hasAiAnalysisData: !!report.aiAnalysisData,
        aiAnalysisDataKeys: report.aiAnalysisData ? Object.keys(report.aiAnalysisData) : [],
        aiAnalysisDataContent: report.aiAnalysisData ? 'Data exists' : 'No data',
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      })
      

      res.json({
        success: true,
        data: {
          ...report,
          status: report.status || 'PROCESSING',
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

  /**
   * GET /api/paint-analysis/:reportId/pdf
   * Boya analizi raporunu PDF formatında indir
   */
  static downloadPDF = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const reportId = parseInt(req.params.reportId);

    try {
      const { generatePDFReport } = require('../services/pdfReportService');
      const pdfBuffer = await generatePDFReport({
        reportId,
        userId,
        includeImages: true,
        includeCharts: true,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="mivvo-boya-analizi-${reportId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);
    } catch (error: any) {
      console.error('PDF oluşturma hatası:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'PDF rapor oluşturulamadı'
      });
    }
  });
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
