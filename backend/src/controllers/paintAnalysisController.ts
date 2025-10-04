import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { PaintAnalysisService } from '../services/paintAnalysisService'
import multer from 'multer'

const prisma = new PrismaClient()

// Multer konfigürasyonu
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

export class PaintAnalysisController {
  /**
   * Boya analizi başlat
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

      // Rapor oluştur
      const report = await prisma.vehicleReport.create({
        data: {
          userId,
          vehiclePlate: vehicleInfo.plate || 'Belirtilmemiş',
          vehicleBrand: vehicleInfo.make || vehicleInfo.brand || 'Belirtilmemiş',
          vehicleModel: vehicleInfo.model || 'Belirtilmemiş',
          vehicleYear: vehicleInfo.year || new Date().getFullYear(),
          reportType: 'PAINT_ANALYSIS',
          status: 'PROCESSING',
          totalCost: 25,
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
      console.error('❌ Boya analizi başlatma hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Boya analizi başlatılamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Resim yükleme
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
      console.log(`📤 Rapor ${reportId} için ${files?.length || 0} dosya yüklenmeye çalışılıyor`)
      
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

      const imageRecords = await Promise.all(
        files.map(async (file, index) => {
          console.log(`📸 Resim ${index + 1} işleniyor: ${file.originalname} (${file.size} bytes)`)
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
   * Boya analizi gerçekleştir
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
        where: { id: parseInt(reportId), userId }
      })

      if (!report) {
        res.status(404).json({ success: false, message: 'Rapor bulunamadı' })
        return
      }

      const images = await prisma.vehicleImage.findMany({
        where: { reportId: parseInt(reportId) }
      })

      console.log(`🔍 Rapor ${reportId} için ${images.length} resim bulundu`)

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
      console.log('📸 İlk resim URL:', images[0].imageUrl)

      // Araç bilgilerini hazırla
      const vehicleInfo = {
        make: report.vehicleBrand,
        model: report.vehicleModel,
        year: report.vehicleYear,
        plate: report.vehiclePlate
      }

      console.log('🚗 Araç bilgileri prompt\'a dahil ediliyor:', vehicleInfo)

      // AI analizi gerçekleştir
      console.log('🤖 PaintAnalysisService.analyzePaint çağrılıyor...')
      const paintResult = await PaintAnalysisService.analyzePaint(images[0].imageUrl, vehicleInfo)

      console.log('✅ Boya analizi tamamlandı')
      console.log('📊 AI Analiz Sonucu:', JSON.stringify(paintResult, null, 2))
      
      // AI sonucunu kontrol et
      if (!paintResult || Object.keys(paintResult).length === 0) {
        throw new Error('AI analizi boş sonuç döndü')
      }

      // Raporu güncelle
      await prisma.vehicleReport.update({
        where: { id: parseInt(reportId) },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: paintResult as any
        }
      })

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
      res.status(500).json({
        success: false,
        message: 'Boya analizi gerçekleştirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Boya analizi raporu getir
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
}

export { upload }
