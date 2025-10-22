/**
 * Audio Validation Middleware
 * 
 * Multer sonrası ses kalite kontrolü middleware'i.
 * OpenAI Audio API'den maksimum verim almak için optimize edilmiştir.
 * 
 * Özellikler:
 * - FFmpeg ile ses analizi
 * - Ses seviyesi analizi
 * - Silence detection
 * - Noise level analizi
 * - Süre ve format kontrolü
 * - User-friendly hata mesajları
 * 
 * Kullanım:
 * router.post('/upload', upload.single('audio'), audioValidation, controller)
 */

import { Request, Response, NextFunction } from 'express'
import { AudioOptimizer } from '../utils/audioOptimizer'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'
import { AUDIO_CONSTRAINTS } from '../constants/FileConstraints'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

/**
 * Multer dosya tipi genişletmesi
 */
interface MulterFile extends Express.Multer.File {
  buffer: Buffer
}

/**
 * Request tipi genişletmesi
 */
interface ValidatedRequest extends Request {
  validatedAudio?: {
    originalFile: MulterFile
    optimizedPath?: string
    metadata: {
      duration: number
      format: string
      bitrate: number
      sampleRate: number
      channels: number
      size: number
      volumeLevel: number
      silenceRatio: number
      noiseLevel: number
    }
    warnings: string[]
  }
}

/**
 * Ses Validasyon Middleware
 * 
 * Multer'dan sonra çalışır ve yüklenen ses dosyasını analiz eder.
 * Kalitesiz ses dosyalarını reddeder, kaliteli olanları optimize eder.
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Next function
 */
export const audioValidation = async (
  req: ValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const file = req.file as MulterFile
    
    if (!file) {
      res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.FILE.FILE_NOT_PROVIDED,
        errors: ['Ses dosyası seçilmedi']
      })
      return
    }

    console.log(`🎵 Ses dosyası validasyonu başlatılıyor: ${file.originalname}`)
    
    // Geçici dosya oluştur (FFmpeg için)
    const tempDir = path.join(process.cwd(), 'uploads', 'temp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempInputPath = path.join(tempDir, `temp_input_${Date.now()}_${file.originalname}`)
    const tempOutputPath = path.join(tempDir, `temp_output_${Date.now()}_${file.originalname}`)
    
    try {
      // Buffer'ı geçici dosyaya yaz
      await promisify(fs.writeFile)(tempInputPath, file.buffer)
      
      // Ses validasyonu yap
      const validationResult = await AudioOptimizer.validateAudio(tempInputPath)
      
      if (!validationResult.isValid) {
        console.error(`❌ Ses dosyası validasyon başarısız:`, validationResult.errors)
        
        // Geçici dosyaları temizle
        await cleanupTempFiles([tempInputPath, tempOutputPath])
        
        res.status(422).json({
          success: false,
          message: 'Ses dosyası kalitesi yetersiz',
          errors: validationResult.errors,
          warnings: validationResult.warnings,
          metadata: validationResult.metadata,
          suggestions: [
            'Motor çalışırken kayıt yapın',
            'Telefonu motor bölgesine yakın tutun',
            'Minimum 10 saniye kayıt yapın',
            'Sessiz ortamda kayıt yapın',
            'WAV, MP3 veya M4A formatında kaydedin'
          ]
        })
        return
      }
      
      // Optimizasyon yap (gerekirse)
      const optimizationResult = await AudioOptimizer.optimizeAudio(
        tempInputPath,
        tempOutputPath,
        {
          forceOptimization: false
        }
      )
      
      if (!optimizationResult.success) {
        console.error(`❌ Ses dosyası optimizasyon başarısız:`, optimizationResult.errors)
        
        // Geçici dosyaları temizle
        await cleanupTempFiles([tempInputPath, tempOutputPath])
        
        res.status(500).json({
          success: false,
          message: 'Ses dosyası işleme hatası',
          errors: optimizationResult.errors
        })
        return
      }
      
      // Optimize edilmiş dosyayı oku (varsa)
      let optimizedBuffer = file.buffer
      if (optimizationResult.optimizedPath && fs.existsSync(optimizationResult.optimizedPath)) {
        optimizedBuffer = await promisify(fs.readFile)(optimizationResult.optimizedPath)
      }
      
      // Validated audio'yu request'e ekle
      req.validatedAudio = {
        originalFile: file,
        optimizedPath: optimizationResult.optimizedPath,
        metadata: optimizationResult.metadata,
        warnings: [...validationResult.warnings, ...optimizationResult.warnings]
      }
      
      console.log(`✅ Ses dosyası validasyon başarılı:`, {
        name: file.originalname,
        duration: `${optimizationResult.metadata.duration.toFixed(1)}s`,
        bitrate: `${optimizationResult.metadata.bitrate}kbps`,
        volumeLevel: optimizationResult.metadata.volumeLevel,
        silenceRatio: optimizationResult.metadata.silenceRatio
      })
      
      // Uyarıları logla
      if (validationResult.warnings.length > 0 || optimizationResult.warnings.length > 0) {
        console.log('⚠️ Ses validasyon uyarıları:', [
          ...validationResult.warnings,
          ...optimizationResult.warnings
        ])
      }
      
      next()
      
    } finally {
      // Geçici dosyaları temizle
      await cleanupTempFiles([tempInputPath, tempOutputPath])
    }
    
  } catch (error) {
    console.error('❌ Ses validasyon middleware hatası:', error)
    res.status(500).json({
      success: false,
      message: 'Ses validasyon işlemi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    })
  }
}

/**
 * Geçici dosyaları temizle
 * 
 * @param filePaths - Temizlenecek dosya yolları
 */
async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        await promisify(fs.unlink)(filePath)
      }
    } catch (error) {
      console.warn(`Geçici dosya silinemedi: ${filePath}`, error)
    }
  }
}

/**
 * Ses Validasyon Seçenekleri
 */
export interface AudioValidationOptions {
  /**
   * Minimum süre (saniye)
   */
  minDuration?: number
  
  /**
   * Maksimum süre (saniye)
   */
  maxDuration?: number
  
  /**
   * Minimum ses seviyesi (0-1)
   */
  minVolumeLevel?: number
  
  /**
   * Maksimum silence oranı (0-1)
   */
  maxSilenceRatio?: number
  
  /**
   * Maksimum noise oranı (0-1)
   */
  maxNoiseLevel?: number
  
  /**
   * Zorla optimizasyon yap
   */
  forceOptimization?: boolean
  
  /**
   * Sadece validasyon yap, optimizasyon yapma
   */
  validationOnly?: boolean
}

/**
 * Özelleştirilmiş Ses Validasyon Middleware
 * 
 * @param options - Validasyon seçenekleri
 * @returns Middleware function
 */
export const createAudioValidation = (options: AudioValidationOptions = {}) => {
  const {
    minDuration = AUDIO_CONSTRAINTS.MIN_DURATION_SECONDS,
    maxDuration = AUDIO_CONSTRAINTS.MAX_DURATION_SECONDS,
    minVolumeLevel = AUDIO_CONSTRAINTS.MIN_VOLUME_THRESHOLD,
    maxSilenceRatio = AUDIO_CONSTRAINTS.MAX_SILENCE_RATIO,
    maxNoiseLevel = 0.7,
    forceOptimization = false,
    validationOnly = false
  } = options
  
  return async (
    req: ValidatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const file = req.file as MulterFile
      
      if (!file) {
        res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.FILE.FILE_NOT_PROVIDED
        })
        return
      }

      // Geçici dosya oluştur
      const tempDir = path.join(process.cwd(), 'uploads', 'temp')
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
      
      const tempInputPath = path.join(tempDir, `temp_input_${Date.now()}_${file.originalname}`)
      const tempOutputPath = path.join(tempDir, `temp_output_${Date.now()}_${file.originalname}`)
      
      try {
        // Buffer'ı geçici dosyaya yaz
        await promisify(fs.writeFile)(tempInputPath, file.buffer)
        
        // Validasyon yap
        const validationResult = await AudioOptimizer.validateAudio(tempInputPath)
        
        if (!validationResult.isValid) {
          await cleanupTempFiles([tempInputPath, tempOutputPath])
          
          res.status(422).json({
            success: false,
            message: 'Ses dosyası kalitesi yetersiz',
            errors: validationResult.errors
          })
          return
        }
        
        // Özel kontroller
        const metadata = validationResult.metadata
        
        if (metadata.duration < minDuration) {
          await cleanupTempFiles([tempInputPath, tempOutputPath])
          res.status(422).json({
            success: false,
            message: 'Ses kaydı çok kısa',
            errors: [`Minimum ${minDuration} saniye gerekli`]
          })
          return
        }
        
        if (metadata.duration > maxDuration) {
          await cleanupTempFiles([tempInputPath, tempOutputPath])
          res.status(422).json({
            success: false,
            message: 'Ses kaydı çok uzun',
            errors: [`Maksimum ${maxDuration} saniye gerekli`]
          })
          return
        }
        
        if (metadata.volumeLevel < minVolumeLevel) {
          await cleanupTempFiles([tempInputPath, tempOutputPath])
          res.status(422).json({
            success: false,
            message: 'Ses seviyesi çok düşük',
            errors: ['Motora daha yakın kayıt yapın']
          })
          return
        }
        
        if (metadata.silenceRatio > maxSilenceRatio) {
          await cleanupTempFiles([tempInputPath, tempOutputPath])
          res.status(422).json({
            success: false,
            message: 'Kayıt çok sessiz',
            errors: ['Motor sesini net duyacak şekilde kayıt yapın']
          })
          return
        }
        
        if (metadata.noiseLevel > maxNoiseLevel) {
          await cleanupTempFiles([tempInputPath, tempOutputPath])
          res.status(422).json({
            success: false,
            message: 'Çok fazla gürültü',
            errors: ['Sessiz ortamda kayıt yapın']
          })
          return
        }
        
        // Optimizasyon yap (gerekirse)
        let optimizedPath = tempInputPath
        if (!validationOnly) {
          const optimizationResult = await AudioOptimizer.optimizeAudio(
            tempInputPath,
            tempOutputPath,
            { forceOptimization }
          )
          
          if (optimizationResult.success && optimizationResult.optimizedPath) {
            optimizedPath = optimizationResult.optimizedPath
          }
        }
        
        // Validated audio'yu request'e ekle
        req.validatedAudio = {
          originalFile: file,
          optimizedPath,
          metadata,
          warnings: validationResult.warnings
        }
        
        next()
        
      } finally {
        await cleanupTempFiles([tempInputPath, tempOutputPath])
      }
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Ses validasyon hatası'
      })
    }
  }
}

/**
 * Motor Ses Analizi İçin Özel Validasyon
 * 
 * Motor ses analizi için optimize edilmiş validasyon.
 * Daha sıkı kriterler uygular.
 */
export const motorAudioValidation = createAudioValidation({
  minDuration: 15, // Motor analizi için minimum 15 saniye
  maxDuration: 45, // Maksimum 45 saniye
  minVolumeLevel: 0.05, // Daha yüksek ses seviyesi gerekli
  maxSilenceRatio: 0.2, // Maksimum %20 sessizlik
  maxNoiseLevel: 0.5, // Daha az gürültü
  forceOptimization: true // Her zaman optimize et
})

/**
 * Genel Ses Kaydı İçin Validasyon
 * 
 * Genel ses kayıtları için daha esnek kriterler.
 */
export const generalAudioValidation = createAudioValidation({
  minDuration: 10, // Minimum 10 saniye
  maxDuration: 60, // Maksimum 60 saniye
  minVolumeLevel: 0.01, // Daha düşük ses seviyesi kabul edilir
  maxSilenceRatio: 0.3, // Maksimum %30 sessizlik
  maxNoiseLevel: 0.7, // Daha fazla gürültü kabul edilir
  forceOptimization: false // Gerekirse optimize et
})
