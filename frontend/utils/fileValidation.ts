/**
 * Client-Side File Validation Utilities
 * 
 * Dosya yükleme işlemlerinde client-side validasyon için yardımcı fonksiyonlar.
 * Backend validasyonu ile uyumlu olacak şekilde tasarlanmıştır.
 * 
 * Özellikler:
 * - Resim dosyası validasyonu
 * - Ses dosyası validasyonu
 * - Dosya boyutu ve format kontrolü
 * - User-friendly hata mesajları
 * - TypeScript tip güvenliği
 */

// ===== TİP TANIMLARI =====

/**
 * Validasyon sonucu
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Dosya metadata bilgisi
 */
export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
}

/**
 * Resim dosyası metadata bilgisi
 */
export interface ImageMetadata extends FileMetadata {
  width?: number
  height?: number
  aspectRatio?: number
}

/**
 * Ses dosyası metadata bilgisi
 */
export interface AudioMetadata extends FileMetadata {
  duration?: number
}

// ===== SABİTLER =====

/**
 * Desteklenen resim formatları
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
] as const

/**
 * Desteklenen ses formatları
 */
export const SUPPORTED_AUDIO_TYPES = [
  'audio/wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/m4a',
  'audio/aac',
  'audio/3gpp',
  'audio/3gpp2',
  'audio/amr',
  'audio/ogg',
  'audio/webm',
  'audio/opus',
  'audio/flac'
] as const

/**
 * Dosya boyutu limitleri (bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE_MAX: 10 * 1024 * 1024, // 10MB
  IMAGE_MIN: 50 * 1024,        // 50KB
  AUDIO_MAX: 50 * 1024 * 1024, // 50MB
  AUDIO_MIN: 100 * 1024        // 100KB
} as const

/**
 * Resim boyut limitleri (piksel)
 */
export const IMAGE_SIZE_LIMITS = {
  MIN_WIDTH: 800,
  MIN_HEIGHT: 600,
  MAX_WIDTH: 4096,
  MAX_HEIGHT: 4096
} as const

/**
 * Ses süre limitleri (saniye)
 */
export const AUDIO_DURATION_LIMITS = {
  MIN: 10,
  MAX: 60
} as const

// ===== HATA MESAJLARI =====

export const VALIDATION_ERRORS = {
  // Genel hatalar
  FILE_NOT_PROVIDED: 'Dosya seçilmedi',
  FILE_TOO_LARGE: 'Dosya boyutu çok büyük',
  FILE_TOO_SMALL: 'Dosya boyutu çok küçük',
  UNSUPPORTED_FORMAT: 'Desteklenmeyen dosya formatı',
  FILE_CORRUPTED: 'Dosya bozuk veya okunamıyor',
  
  // Resim hataları
  IMAGE_TOO_SMALL: 'Resim çözünürlüğü çok düşük. Minimum 800x600 piksel gerekli.',
  IMAGE_TOO_LARGE: 'Resim çok büyük. Maksimum 4096x4096 piksel.',
  IMAGE_INVALID_ASPECT_RATIO: 'Resim oranı uygun değil.',
  
  // Ses hataları
  AUDIO_TOO_SHORT: 'Ses kaydı çok kısa. Minimum 10 saniye gerekli.',
  AUDIO_TOO_LONG: 'Ses kaydı çok uzun. Maksimum 60 saniye.',
  AUDIO_INVALID_FORMAT: 'Desteklenmeyen ses formatı.',
  
  // Uyarılar
  WARNING_LARGE_FILE: 'Dosya boyutu büyük, yükleme uzun sürebilir.',
  WARNING_SMALL_IMAGE: 'Resim boyutu küçük, kalite düşük olabilir.',
  WARNING_LONG_AUDIO: 'Ses kaydı uzun, analiz zaman alabilir.'
} as const

// ===== YARDIMCI FONKSİYONLAR =====

/**
 * Dosya boyutunu formatla
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Dosya uzantısını al
 */
export const getFileExtension = (filename: string): string => {
  return filename.toLowerCase().substring(filename.lastIndexOf('.'))
}

/**
 * MIME type'ı kontrol et
 */
export const isSupportedImageType = (mimeType: string): boolean => {
  return SUPPORTED_IMAGE_TYPES.includes(mimeType as any)
}

export const isSupportedAudioType = (mimeType: string): boolean => {
  return SUPPORTED_AUDIO_TYPES.includes(mimeType as any)
}

// ===== RESİM VALİDASYONU =====

/**
 * Resim dosyası validasyonu
 * 
 * @param file - Dosya objesi
 * @param options - Validasyon seçenekleri
 * @returns Promise<ValidationResult>
 */
export const validateImageFile = async (
  file: File,
  options: {
    strictMode?: boolean
    allowLargeFiles?: boolean
  } = {}
): Promise<ValidationResult> => {
  const { strictMode = true, allowLargeFiles = false } = options
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Temel dosya kontrolü
    if (!file) {
      errors.push(VALIDATION_ERRORS.FILE_NOT_PROVIDED)
      return { isValid: false, errors, warnings }
    }

    // Dosya boyutu kontrolü
    if (file.size > FILE_SIZE_LIMITS.IMAGE_MAX) {
      if (allowLargeFiles) {
        warnings.push(VALIDATION_ERRORS.WARNING_LARGE_FILE)
      } else {
        errors.push(VALIDATION_ERRORS.FILE_TOO_LARGE)
      }
    }

    if (file.size < FILE_SIZE_LIMITS.IMAGE_MIN) {
      errors.push(VALIDATION_ERRORS.FILE_TOO_SMALL)
    }

    // Format kontrolü
    if (!isSupportedImageType(file.type)) {
      errors.push(VALIDATION_ERRORS.UNSUPPORTED_FORMAT)
    }

    // Resim boyutları kontrolü (sadece strict mode'da)
    if (strictMode && isSupportedImageType(file.type)) {
      try {
        const dimensions = await getImageDimensions(file)
        
        if (dimensions.width < IMAGE_SIZE_LIMITS.MIN_WIDTH || 
            dimensions.height < IMAGE_SIZE_LIMITS.MIN_HEIGHT) {
          errors.push(VALIDATION_ERRORS.IMAGE_TOO_SMALL)
        }

        if (dimensions.width > IMAGE_SIZE_LIMITS.MAX_WIDTH || 
            dimensions.height > IMAGE_SIZE_LIMITS.MAX_HEIGHT) {
          errors.push(VALIDATION_ERRORS.IMAGE_TOO_LARGE)
        }

        // Aspect ratio kontrolü
        const aspectRatio = dimensions.width / dimensions.height
        if (aspectRatio < 0.5 || aspectRatio > 3.0) {
          errors.push(VALIDATION_ERRORS.IMAGE_INVALID_ASPECT_RATIO)
        }

        // Küçük resim uyarısı
        if (dimensions.width < 1200 || dimensions.height < 800) {
          warnings.push(VALIDATION_ERRORS.WARNING_SMALL_IMAGE)
        }

      } catch (error) {
        console.error('Resim boyutları alınamadı:', error)
        errors.push(VALIDATION_ERRORS.FILE_CORRUPTED)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }

  } catch (error) {
    console.error('Resim validasyon hatası:', error)
    return {
      isValid: false,
      errors: [VALIDATION_ERRORS.FILE_CORRUPTED],
      warnings
    }
  }
}

/**
 * Resim boyutlarını al
 * 
 * @param file - Dosya objesi
 * @returns Promise<{width: number, height: number}>
 */
export const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Resim yüklenemedi'))
    }
    
    img.src = url
  })
}

// ===== SES VALİDASYONU =====

/**
 * Ses dosyası validasyonu
 * 
 * @param file - Dosya objesi
 * @param options - Validasyon seçenekleri
 * @returns Promise<ValidationResult>
 */
export const validateAudioFile = async (
  file: File,
  options: {
    strictMode?: boolean
    allowLongFiles?: boolean
  } = {}
): Promise<ValidationResult> => {
  const { strictMode = true, allowLongFiles = false } = options
  const errors: string[] = []
  const warnings: string[] = []

  try {
    // Temel dosya kontrolü
    if (!file) {
      errors.push(VALIDATION_ERRORS.FILE_NOT_PROVIDED)
      return { isValid: false, errors, warnings }
    }

    // Dosya boyutu kontrolü
    if (file.size > FILE_SIZE_LIMITS.AUDIO_MAX) {
      errors.push(VALIDATION_ERRORS.FILE_TOO_LARGE)
    }

    if (file.size < FILE_SIZE_LIMITS.AUDIO_MIN) {
      errors.push(VALIDATION_ERRORS.FILE_TOO_SMALL)
    }

    // Format kontrolü
    if (!isSupportedAudioType(file.type)) {
      errors.push(VALIDATION_ERRORS.AUDIO_INVALID_FORMAT)
    }

    // Ses süresi kontrolü (sadece strict mode'da)
    if (strictMode && isSupportedAudioType(file.type)) {
      try {
        const duration = await getAudioDuration(file)
        
        if (duration < AUDIO_DURATION_LIMITS.MIN) {
          errors.push(VALIDATION_ERRORS.AUDIO_TOO_SHORT)
        }

        if (duration > AUDIO_DURATION_LIMITS.MAX) {
          if (allowLongFiles) {
            warnings.push(VALIDATION_ERRORS.WARNING_LONG_AUDIO)
          } else {
            errors.push(VALIDATION_ERRORS.AUDIO_TOO_LONG)
          }
        }

      } catch (error) {
        console.error('Ses süresi alınamadı:', error)
        errors.push(VALIDATION_ERRORS.FILE_CORRUPTED)
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }

  } catch (error) {
    console.error('Ses validasyon hatası:', error)
    return {
      isValid: false,
      errors: [VALIDATION_ERRORS.FILE_CORRUPTED],
      warnings
    }
  }
}

/**
 * Ses dosyası süresini al
 * 
 * @param file - Dosya objesi
 * @returns Promise<number> - Süre (saniye)
 */
export const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    }
    
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Ses dosyası yüklenemedi'))
    }
    
    audio.src = url
  })
}

// ===== GENEL VALİDASYON =====

/**
 * Dosya tipine göre otomatik validasyon
 * 
 * @param file - Dosya objesi
 * @param options - Validasyon seçenekleri
 * @returns Promise<ValidationResult>
 */
export const validateFile = async (
  file: File,
  options: {
    fileType?: 'image' | 'audio' | 'auto'
    strictMode?: boolean
    allowLargeFiles?: boolean
    allowLongFiles?: boolean
  } = {}
): Promise<ValidationResult> => {
  const { fileType = 'auto', strictMode = true, allowLargeFiles = false, allowLongFiles = false } = options

  // Dosya tipini otomatik tespit et
  let detectedType: 'image' | 'audio' | 'unknown' = 'unknown'
  
  if (fileType === 'auto') {
    if (isSupportedImageType(file.type)) {
      detectedType = 'image'
    } else if (isSupportedAudioType(file.type)) {
      detectedType = 'audio'
    }
  } else {
    detectedType = fileType
  }

  // Tip'e göre validasyon yap
  switch (detectedType) {
    case 'image':
      return await validateImageFile(file, { strictMode, allowLargeFiles })
    
    case 'audio':
      return await validateAudioFile(file, { strictMode, allowLongFiles })
    
    default:
      return {
        isValid: false,
        errors: [VALIDATION_ERRORS.UNSUPPORTED_FORMAT],
        warnings: []
      }
  }
}

// ===== ÇOKLU DOSYA VALİDASYONU =====

/**
 * Birden fazla dosya validasyonu
 * 
 * @param files - Dosya listesi
 * @param options - Validasyon seçenekleri
 * @returns Promise<ValidationResult[]>
 */
export const validateMultipleFiles = async (
  files: FileList | File[],
  options: {
    fileType?: 'image' | 'audio' | 'auto'
    strictMode?: boolean
    allowLargeFiles?: boolean
    allowLongFiles?: boolean
  } = {}
): Promise<ValidationResult[]> => {
  const fileArray = Array.from(files)
  const results: ValidationResult[] = []

  for (const file of fileArray) {
    const result = await validateFile(file, options)
    results.push(result)
  }

  return results
}

// ===== VALİDASYON YARDIMCI FONKSİYONLARI =====

/**
 * Validasyon sonuçlarını birleştir
 * 
 * @param results - Validasyon sonuçları
 * @returns Birleştirilmiş sonuç
 */
export const mergeValidationResults = (results: ValidationResult[]): ValidationResult => {
  const allErrors = results.flatMap(result => result.errors)
  const allWarnings = results.flatMap(result => result.warnings)
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  }
}

/**
 * Validasyon hatalarını user-friendly formata çevir
 * 
 * @param errors - Hata listesi
 * @returns Formatlanmış hata mesajları
 */
export const formatValidationErrors = (errors: string[]): string[] => {
  return errors.map(error => {
    // Hata mesajlarını daha anlaşılır hale getir
    switch (error) {
      case VALIDATION_ERRORS.FILE_TOO_LARGE:
        return 'Dosya boyutu çok büyük. Lütfen daha küçük bir dosya seçin.'
      case VALIDATION_ERRORS.IMAGE_TOO_SMALL:
        return 'Resim çözünürlüğü çok düşük. Daha yüksek çözünürlükte bir fotoğraf çekin.'
      case VALIDATION_ERRORS.AUDIO_TOO_SHORT:
        return 'Ses kaydı çok kısa. En az 10 saniye kayıt yapın.'
      case VALIDATION_ERRORS.UNSUPPORTED_FORMAT:
        return 'Desteklenmeyen dosya formatı. Lütfen desteklenen formatlardan birini seçin.'
      default:
        return error
    }
  })
}
