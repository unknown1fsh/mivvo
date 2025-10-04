import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth'
import { ComprehensiveExpertiseService } from '../services/comprehensiveExpertiseService'
import multer from 'multer'

const prisma = new PrismaClient()

// Multer konfigürasyonu - resimler için
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

// Multer konfigürasyonu - ses dosyaları için
const audioStorage = multer.memoryStorage()
const audioUpload = multer({ 
  storage: audioStorage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Desteklenmeyen ses formatı'))
    }
  }
})

export class ComprehensiveExpertiseController {
  /**
   * Tam expertiz başlat
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
          reportType: 'FULL_REPORT' as any,
          status: 'PROCESSING',
          totalCost: 85,
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
      console.error('❌ Tam expertiz başlatma hatası:', error)
      res.status(500).json({
        success: false,
        message: 'Tam expertiz başlatılamadı',
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
   * Ses dosyası yükleme
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
   * Tam expertiz gerçekleştir
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

      // AI analizi gerçekleştir
      const imagePaths = report.vehicleImages.map(img => img.imageUrl)
      const audioPath = report.vehicleAudios.length > 0 ? report.vehicleAudios[0].audioPath : undefined
      
      const expertiseResult = await ComprehensiveExpertiseService.generateComprehensiveReport(
        vehicleInfo,
        imagePaths,
        audioPath
      )

      console.log('✅ Tam expertiz tamamlandı')

      // Raporu güncelle
      await prisma.vehicleReport.update({
        where: { id: parseInt(reportId) },
        data: {
          status: 'COMPLETED',
          aiAnalysisData: expertiseResult as any
        }
      })

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
      res.status(500).json({
        success: false,
        message: 'Tam expertiz gerçekleştirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      })
    }
  }

  /**
   * Tam expertiz raporu getir
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

export { imageUpload, audioUpload }
