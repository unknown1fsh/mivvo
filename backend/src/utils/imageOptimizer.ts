/**
 * Image Optimizer Utility
 * 
 * Sharp kütüphanesi ile görüntü optimizasyonu ve validasyonu.
 * OpenAI Vision API'den maksimum verim almak için optimize edilmiştir.
 * 
 * Özellikler:
 * - Görüntü boyut kontrolü ve resize
 * - Blur detection (Laplacian variance)
 * - Format dönüşümü ve sıkıştırma
 * - Aspect ratio kontrolü
 * - Kalite skorlaması
 * 
 * Sharp Dependency:
 * npm install sharp
 * npm install @types/sharp
 */

import sharp from 'sharp'
import { IMAGE_CONSTRAINTS, FileSizeHelpers } from '../constants/FileConstraints'
import { ERROR_MESSAGES } from '../constants/ErrorMessages'

/**
 * Görüntü Optimizasyon Sonucu Interface
 */
export interface ImageOptimizationResult {
  success: boolean
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
  errors: string[]
  warnings: string[]
}

/**
 * Görüntü Validasyon Sonucu Interface
 */
export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    width: number
    height: number
    format: string
    size: number
    qualityScore: number
    blurScore: number
    aspectRatio: number
  }
}

/**
 * Görüntü Optimizasyon Sınıfı
 */
export class ImageOptimizer {
  /**
   * Görüntüyü optimize et ve validasyon yap
   * 
   * İş Akışı:
   * 1. Sharp ile metadata al
   * 2. Validasyon kontrolleri yap
   * 3. Gerekirse resize/compress et
   * 4. Blur detection yap
   * 5. Sonuç döndür
   * 
   * @param inputBuffer - Giriş görüntü buffer'ı
   * @param options - Optimizasyon seçenekleri
   * @returns ImageOptimizationResult
   */
  static async optimizeImage(
    inputBuffer: Buffer,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'png' | 'webp'
      forceOptimization?: boolean
    } = {}
  ): Promise<ImageOptimizationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      // Sharp instance oluştur
      let sharpInstance = sharp(inputBuffer)
      
      // Metadata al
      const metadata = await sharpInstance.metadata()
      const { width = 0, height = 0, format = 'unknown', size = 0 } = metadata
      
      // Aspect ratio hesapla
      const aspectRatio = width / height
      
      // Validasyon kontrolleri
      const validationResult = await this.validateImage(inputBuffer)
      if (!validationResult.isValid) {
        errors.push(...validationResult.errors)
      }
      warnings.push(...validationResult.warnings)
      
      // Blur detection
      const blurScore = await this.detectBlur(sharpInstance)
      
      // Kalite skoru hesapla
      const qualityScore = this.calculateQualityScore({
        width,
        height,
        blurScore,
        aspectRatio,
        size
      })
      
      // Optimizasyon gerekiyor mu?
      const needsOptimization = this.needsOptimization({
        width,
        height,
        format: format as string,
        size,
        blurScore,
        qualityScore
      })
      
      let optimizedBuffer = inputBuffer
      
      if (needsOptimization || options.forceOptimization) {
        optimizedBuffer = await this.performOptimization(sharpInstance, options)
        warnings.push('Görüntü optimizasyonu uygulandı')
      }
      
      return {
        success: errors.length === 0,
        optimizedBuffer,
        metadata: {
          width,
          height,
          format: format as string,
          size: optimizedBuffer.length,
          qualityScore,
          blurScore,
          aspectRatio
        },
        errors,
        warnings
      }
      
    } catch (error) {
      console.error('Görüntü optimizasyon hatası:', error)
      return {
        success: false,
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          size: 0,
          qualityScore: 0,
          blurScore: 0,
          aspectRatio: 0
        },
        errors: ['Görüntü işlenirken hata oluştu'],
        warnings: []
      }
    }
  }
  
  /**
   * Görüntü validasyonu yap
   * 
   * @param inputBuffer - Giriş görüntü buffer'ı
   * @returns ImageValidationResult
   */
  static async validateImage(inputBuffer: Buffer): Promise<ImageValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []
    
    try {
      const metadata = await sharp(inputBuffer).metadata()
      const { width = 0, height = 0, format = 'unknown', size = 0 } = metadata
      
      // Boyut kontrolleri
      if (width < IMAGE_CONSTRAINTS.MIN_WIDTH || height < IMAGE_CONSTRAINTS.MIN_HEIGHT) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.IMAGE_TOO_SMALL)
      }
      
      if (width > IMAGE_CONSTRAINTS.MAX_WIDTH || height > IMAGE_CONSTRAINTS.MAX_HEIGHT) {
        warnings.push('Görüntü çok büyük, otomatik olarak yeniden boyutlandırılacak')
      }
      
      // Dosya boyutu kontrolü
      if (size > IMAGE_CONSTRAINTS.MAX_SIZE_BYTES) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.IMAGE_TOO_LARGE)
      }
      
      if (size < IMAGE_CONSTRAINTS.MIN_SIZE_BYTES) {
        warnings.push('Dosya boyutu çok küçük olabilir')
      }
      
      // Format kontrolü
      if (!IMAGE_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(`image/${format}` as any)) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.UNSUPPORTED_FORMAT)
      }
      
      // Aspect ratio kontrolü
      const aspectRatio = width / height
      if (aspectRatio < IMAGE_CONSTRAINTS.MIN_ASPECT_RATIO || aspectRatio > IMAGE_CONSTRAINTS.MAX_ASPECT_RATIO) {
        warnings.push(ERROR_MESSAGES.FILE_QUALITY.IMAGE_ASPECT_RATIO_INVALID)
      }
      
      // Blur detection
      const sharpInstance = sharp(inputBuffer)
      const blurScore = await this.detectBlur(sharpInstance)
      
      if (blurScore < IMAGE_CONSTRAINTS.MIN_QUALITY_SCORE) {
        errors.push(ERROR_MESSAGES.FILE_QUALITY.IMAGE_TOO_BLURRY)
      }
      
      // Kalite skoru hesapla
      const qualityScore = this.calculateQualityScore({
        width,
        height,
        blurScore,
        aspectRatio,
        size
      })
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          width,
          height,
          format: format as string,
          size,
          qualityScore,
          blurScore,
          aspectRatio
        }
      }
      
    } catch (error) {
      console.error('Görüntü validasyon hatası:', error)
      return {
        isValid: false,
        errors: ['Görüntü okunamadı'],
        warnings: [],
        metadata: {
          width: 0,
          height: 0,
          format: 'unknown',
          size: 0,
          qualityScore: 0,
          blurScore: 0,
          aspectRatio: 0
        }
      }
    }
  }
  
  /**
   * Blur detection (Laplacian variance)
   * 
   * Sharp ile Laplacian kernel uygulayarak blur tespiti yapar.
   * Düşük variance = bulanık görüntü
   * 
   * @param sharpInstance - Sharp instance
   * @returns Blur skoru (0-100, yüksek = net)
   */
  private static async detectBlur(sharpInstance: sharp.Sharp): Promise<number> {
    try {
      // Gri tonlamaya çevir
      const grayscale = sharpInstance.clone().grayscale()
      
      // Laplacian kernel uygula (blur detection için)
      const laplacianKernel = [
        [0, -1, 0],
        [-1, 4, -1],
        [0, -1, 0]
      ]
      
      // Convolve işlemi (Sharp'ta built-in yok, alternatif yöntem)
      const { data, info } = await grayscale
        .convolve({
          width: 3,
          height: 3,
          kernel: laplacianKernel.flat()
        })
        .raw()
        .toBuffer({ resolveWithObject: true })
      
      // Variance hesapla
      const variance = this.calculateVariance(data)
      
      // Blur skoruna çevir (0-100)
      // Yüksek variance = net görüntü
      const blurScore = Math.min(100, Math.max(0, Math.sqrt(variance) * 2))
      
      return blurScore
      
    } catch (error) {
      console.error('Blur detection hatası:', error)
      // Fallback: ortalama skor
      return 50
    }
  }
  
  /**
   * Kalite skoru hesapla
   * 
   * @param params - Kalite parametreleri
   * @returns Kalite skoru (0-100)
   */
  private static calculateQualityScore(params: {
    width: number
    height: number
    blurScore: number
    aspectRatio: number
    size: number
  }): number {
    const { width, height, blurScore, aspectRatio, size } = params
    
    let score = 0
    
    // Boyut skoru (30 puan)
    const pixelCount = width * height
    if (pixelCount >= 1920 * 1080) score += 30
    else if (pixelCount >= 1280 * 720) score += 25
    else if (pixelCount >= 800 * 600) score += 20
    else score += 10
    
    // Blur skoru (40 puan)
    score += Math.round((blurScore / 100) * 40)
    
    // Aspect ratio skoru (20 puan)
    if (aspectRatio >= 0.8 && aspectRatio <= 1.5) score += 20
    else if (aspectRatio >= 0.6 && aspectRatio <= 2.0) score += 15
    else score += 10
    
    // Dosya boyutu skoru (10 puan)
    const sizeMB = FileSizeHelpers.bytesToMB(size)
    if (sizeMB >= 0.5 && sizeMB <= 5) score += 10
    else if (sizeMB >= 0.1 && sizeMB <= 10) score += 8
    else score += 5
    
    return Math.min(100, score)
  }
  
  /**
   * Optimizasyon gerekip gerekmediğini kontrol et
   * 
   * @param params - Kontrol parametreleri
   * @returns Optimizasyon gerekli mi?
   */
  private static needsOptimization(params: {
    width: number
    height: number
    format: string
    size: number
    blurScore: number
    qualityScore: number
  }): boolean {
    const { width, height, format, size, blurScore, qualityScore } = params
    
    // Çok büyük boyut
    if (width > IMAGE_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_WIDTH || 
        height > IMAGE_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_HEIGHT) {
      return true
    }
    
    // Çok büyük dosya boyutu
    if (size > 2 * 1024 * 1024) { // 2MB
      return true
    }
    
    // Düşük kalite skoru
    if (qualityScore < 60) {
      return true
    }
    
    // Desteklenmeyen format
    if (!['jpeg', 'jpg', 'png'].includes(format.toLowerCase())) {
      return true
    }
    
    return false
  }
  
  /**
   * Optimizasyon işlemini gerçekleştir
   * 
   * @param sharpInstance - Sharp instance
   * @param options - Optimizasyon seçenekleri
   * @returns Optimize edilmiş buffer
   */
  private static async performOptimization(
    sharpInstance: sharp.Sharp,
    options: {
      maxWidth?: number
      maxHeight?: number
      quality?: number
      format?: 'jpeg' | 'png' | 'webp'
    }
  ): Promise<Buffer> {
    const {
      maxWidth = IMAGE_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_WIDTH,
      maxHeight = IMAGE_CONSTRAINTS.OPTIMIZE_FOR_AI.TARGET_HEIGHT,
      quality = IMAGE_CONSTRAINTS.OPTIMIZE_FOR_AI.QUALITY_PERCENTAGE,
      format = 'jpeg'
    } = options
    
    let pipeline = sharpInstance
      .resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
    
    // Format'a göre optimize et
    switch (format) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality })
        break
      case 'png':
        pipeline = pipeline.png({ compressionLevel: IMAGE_CONSTRAINTS.OPTIMIZE_FOR_AI.COMPRESSION_LEVEL })
        break
      case 'webp':
        pipeline = pipeline.webp({ quality })
        break
    }
    
    return await pipeline.toBuffer()
  }
  
  /**
   * Variance hesapla (blur detection için)
   * 
   * @param data - Pixel data
   * @returns Variance değeri
   */
  private static calculateVariance(data: Buffer): number {
    if (data.length === 0) return 0
    
    // Ortalama hesapla
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i]
    }
    const mean = sum / data.length
    
    // Variance hesapla
    let varianceSum = 0
    for (let i = 0; i < data.length; i++) {
      varianceSum += Math.pow(data[i] - mean, 2)
    }
    
    return varianceSum / data.length
  }
  
  /**
   * Görüntü formatını tespit et
   * 
   * @param buffer - Görüntü buffer'ı
   * @returns Format bilgisi
   */
  static async detectFormat(buffer: Buffer): Promise<string> {
    try {
      const metadata = await sharp(buffer).metadata()
      return metadata.format || 'unknown'
    } catch (error) {
      return 'unknown'
    }
  }
  
  /**
   * Görüntü boyutlarını al
   * 
   * @param buffer - Görüntü buffer'ı
   * @returns Boyut bilgisi
   */
  static async getDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata()
      return {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    } catch (error) {
      return { width: 0, height: 0 }
    }
  }
}

/**
 * Utility fonksiyonları
 */
export const ImageUtils = {
  /**
   * Base64'ü buffer'a çevir
   * 
   * @param base64 - Base64 string
   * @returns Buffer
   */
  base64ToBuffer: (base64: string): Buffer => {
    const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '')
    return Buffer.from(base64Data, 'base64')
  },
  
  /**
   * Buffer'ı base64'e çevir
   * 
   * @param buffer - Buffer
   * @param mimeType - MIME type
   * @returns Base64 string
   */
  bufferToBase64: (buffer: Buffer, mimeType: string = 'image/jpeg'): string => {
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  },
  
  /**
   * Dosya uzantısından MIME type'a çevir
   * 
   * @param extension - Dosya uzantısı
   * @returns MIME type
   */
  extensionToMimeType: (extension: string): string => {
    const mapping: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.heic': 'image/heic',
      '.heif': 'image/heif'
    }
    
    return mapping[extension.toLowerCase()] || 'image/jpeg'
  }
}
