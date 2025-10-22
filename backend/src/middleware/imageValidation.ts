/**
 * Image Validation Middleware
 * 
 * Multer sonrası görüntü kalite kontrolü middleware'i.
 * OpenAI Vision API'den maksimum verim almak için optimize edilmiştir.
 * 
 * Özellikler:
 * - Sharp ile görüntü analizi
 * - Blur detection
 * - Boyut ve format kontrolü
 * - Kalite skorlaması
 * - User-friendly hata mesajları
 * 
 * Kullanım:
 * router.post('/upload', upload.array('images'), imageValidation, controller)
 */

import { Request, Response, NextFunction } from 'express'
import { ImageOptimizer } from '../utils/imageOptimizer'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'
import { IMAGE_CONSTRAINTS } from '../constants/FileConstraints'

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
  validatedImages?: Array<{
    originalFile: MulterFile
    optimizedBuffer?: Buffer
    metadata: {
      width: number
      height: number
      format: string
      size: number
      qualityScore: number
      blurScore: number
      aspectRatio: number
    }
    warnings: string[]
  }>
}

/**
 * Görüntü Validasyon Middleware
 * 
 * Multer'dan sonra çalışır ve yüklenen görüntüleri analiz eder.
 * Kalitesiz görüntüleri reddeder, kaliteli olanları optimize eder.
 * 
 * @param req - Express request
 * @param res - Express response  
 * @param next - Next function
 */
export const imageValidation = async (
  req: ValidatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Multer dosyalarını al
    const files = req.files as MulterFile[]
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.FILE.FILE_NOT_PROVIDED,
        errors: ['Resim dosyası seçilmedi']
      })
      return
    }

    const validatedImages = []
    const allErrors: string[] = []
    const allWarnings: string[] = []

    // Her dosyayı tek tek işle
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        console.log(`📸 Resim ${i + 1}/${files.length} validasyonu başlatılıyor: ${file.originalname}`)
        
        // Görüntü validasyonu yap
        const validationResult = await ImageOptimizer.validateImage(file.buffer)
        
        if (!validationResult.isValid) {
          console.error(`❌ Resim ${i + 1} validasyon başarısız:`, validationResult.errors)
          allErrors.push(...validationResult.errors.map(error => 
            `${file.originalname}: ${error}`
          ))
          continue
        }
        
        // Optimizasyon yap (gerekirse)
        const optimizationResult = await ImageOptimizer.optimizeImage(file.buffer, {
          forceOptimization: false // Sadece gerektiğinde optimize et
        })
        
        if (!optimizationResult.success) {
          console.error(`❌ Resim ${i + 1} optimizasyon başarısız:`, optimizationResult.errors)
          allErrors.push(...optimizationResult.errors.map(error => 
            `${file.originalname}: ${error}`
          ))
          continue
        }
        
        // Uyarıları topla
        allWarnings.push(...validationResult.warnings.map(warning => 
          `${file.originalname}: ${warning}`
        ))
        allWarnings.push(...optimizationResult.warnings.map(warning => 
          `${file.originalname}: ${warning}`
        ))
        
        // Validated image ekle
        validatedImages.push({
          originalFile: file,
          optimizedBuffer: optimizationResult.optimizedBuffer,
          metadata: optimizationResult.metadata,
          warnings: [...validationResult.warnings, ...optimizationResult.warnings]
        })
        
        console.log(`✅ Resim ${i + 1} validasyon başarılı:`, {
          name: file.originalname,
          size: `${optimizationResult.metadata.width}x${optimizationResult.metadata.height}`,
          qualityScore: optimizationResult.metadata.qualityScore,
          blurScore: optimizationResult.metadata.blurScore
        })
        
      } catch (error) {
        console.error(`❌ Resim ${i + 1} işleme hatası:`, error)
        allErrors.push(`${file.originalname}: Dosya işlenirken hata oluştu`)
      }
    }
    
    // Hata varsa dur
    if (allErrors.length > 0) {
      res.status(422).json({
        success: false,
        message: 'Resim kalitesi yetersiz',
        errors: allErrors,
        warnings: allWarnings,
        suggestions: [
          'Net bir fotoğraf çekin (kamerayı sabit tutun)',
          'Doğal ışıkta çekim yapın (flaş kullanmayın)',
          'Minimum 800x600 piksel çözünürlük kullanın',
          'JPEG, PNG veya WebP formatında kaydedin'
        ]
      })
      return
    }
    
    // En az bir valid görüntü yoksa hata
    if (validatedImages.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Hiçbir resim geçerli değil',
        errors: ['Tüm resimler kalite kontrolünden geçemedi']
      })
      return
    }
    
    // Validated images'ı request'e ekle
    req.validatedImages = validatedImages
    
    // Uyarıları logla
    if (allWarnings.length > 0) {
      console.log('⚠️ Resim validasyon uyarıları:', allWarnings)
    }
    
    console.log(`✅ ${validatedImages.length}/${files.length} resim validasyon başarılı`)
    next()
    
  } catch (error) {
    console.error('❌ Resim validasyon middleware hatası:', error)
    res.status(500).json({
      success: false,
      message: 'Resim validasyon işlemi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    })
  }
}

/**
 * Tek Resim Validasyon Middleware
 * 
 * Sadece tek resim yükleme işlemleri için optimize edilmiş versiyon.
 * 
 * @param req - Express request
 * @param res - Express response
 * @param next - Next function
 */
export const singleImageValidation = async (
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
        errors: ['Resim dosyası seçilmedi']
      })
      return
    }

    console.log(`📸 Tek resim validasyonu başlatılıyor: ${file.originalname}`)
    
    // Görüntü validasyonu yap
    const validationResult = await ImageOptimizer.validateImage(file.buffer)
    
    if (!validationResult.isValid) {
      console.error(`❌ Resim validasyon başarısız:`, validationResult.errors)
      res.status(422).json({
        success: false,
        message: 'Resim kalitesi yetersiz',
        errors: validationResult.errors,
        warnings: validationResult.warnings,
        metadata: validationResult.metadata,
        suggestions: [
          'Net bir fotoğraf çekin (kamerayı sabit tutun)',
          'Doğal ışıkta çekim yapın (flaş kullanmayın)',
          'Minimum 800x600 piksel çözünürlük kullanın',
          'JPEG, PNG veya WebP formatında kaydedin'
        ]
      })
      return
    }
    
    // Optimizasyon yap (gerekirse)
    const optimizationResult = await ImageOptimizer.optimizeImage(file.buffer, {
      forceOptimization: false
    })
    
    if (!optimizationResult.success) {
      console.error(`❌ Resim optimizasyon başarısız:`, optimizationResult.errors)
      res.status(500).json({
        success: false,
        message: 'Resim işleme hatası',
        errors: optimizationResult.errors
      })
      return
    }
    
    // Validated image'ı request'e ekle
    req.validatedImages = [{
      originalFile: file,
      optimizedBuffer: optimizationResult.optimizedBuffer,
      metadata: optimizationResult.metadata,
      warnings: [...validationResult.warnings, ...optimizationResult.warnings]
    }]
    
    console.log(`✅ Resim validasyon başarılı:`, {
      name: file.originalname,
      size: `${optimizationResult.metadata.width}x${optimizationResult.metadata.height}`,
      qualityScore: optimizationResult.metadata.qualityScore,
      blurScore: optimizationResult.metadata.blurScore
    })
    
    next()
    
  } catch (error) {
    console.error('❌ Tek resim validasyon middleware hatası:', error)
    res.status(500).json({
      success: false,
      message: 'Resim validasyon işlemi başarısız',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    })
  }
}

/**
 * Resim Validasyon Seçenekleri
 */
export interface ImageValidationOptions {
  /**
   * Minimum kalite skoru (0-100)
   */
  minQualityScore?: number
  
  /**
   * Minimum blur skoru (0-100)
   */
  minBlurScore?: number
  
  /**
   * Maksimum dosya boyutu (bytes)
   */
  maxFileSize?: number
  
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
 * Özelleştirilmiş Resim Validasyon Middleware
 * 
 * @param options - Validasyon seçenekleri
 * @returns Middleware function
 */
export const createImageValidation = (options: ImageValidationOptions = {}) => {
  const {
    minQualityScore = IMAGE_CONSTRAINTS.MIN_QUALITY_SCORE,
    minBlurScore = 30,
    maxFileSize = IMAGE_CONSTRAINTS.MAX_SIZE_BYTES,
    forceOptimization = false,
    validationOnly = false
  } = options
  
  return async (
    req: ValidatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const files = req.files as MulterFile[]
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: ERROR_MESSAGES.FILE.FILE_NOT_PROVIDED
        })
        return
      }

      const validatedImages = []
      const allErrors: string[] = []

      for (const file of files) {
        try {
          // Özel validasyon kontrolleri
          if (file.size > maxFileSize) {
            allErrors.push(`${file.originalname}: Dosya boyutu çok büyük`)
            continue
          }
          
          const validationResult = await ImageOptimizer.validateImage(file.buffer)
          
          if (!validationResult.isValid) {
            allErrors.push(...validationResult.errors.map(error => 
              `${file.originalname}: ${error}`
            ))
            continue
          }
          
          // Özel kalite kontrolleri
          if (validationResult.metadata.qualityScore < minQualityScore) {
            allErrors.push(`${file.originalname}: Resim kalitesi yetersiz`)
            continue
          }
          
          if (validationResult.metadata.blurScore < minBlurScore) {
            allErrors.push(`${file.originalname}: Resim çok bulanık`)
            continue
          }
          
          let optimizedBuffer = file.buffer
          if (!validationOnly) {
            const optimizationResult = await ImageOptimizer.optimizeImage(file.buffer, {
              forceOptimization
            })
            optimizedBuffer = optimizationResult.optimizedBuffer || file.buffer
          }
          
          validatedImages.push({
            originalFile: file,
            optimizedBuffer,
            metadata: validationResult.metadata,
            warnings: validationResult.warnings
          })
          
        } catch (error) {
          allErrors.push(`${file.originalname}: Dosya işleme hatası`)
        }
      }
      
      if (allErrors.length > 0) {
        res.status(422).json({
          success: false,
          message: 'Resim kalitesi yetersiz',
          errors: allErrors
        })
        return
      }
      
      req.validatedImages = validatedImages
      next()
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Resim validasyon hatası'
      })
    }
  }
}
