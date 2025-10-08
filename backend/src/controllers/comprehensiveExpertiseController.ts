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
