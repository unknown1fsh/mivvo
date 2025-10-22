/**
 * File Constraints and Quality Requirements
 * 
 * Bu dosya, tüm dosya yükleme işlemlerinde kullanılacak
 * kısıtlamaları ve kalite gereksinimlerini tanımlar.
 * 
 * OpenAI'dan maksimum verim almak için optimize edilmiştir.
 */

/**
 * Görüntü Dosyası Kısıtlamaları
 * 
 * OpenAI Vision API için optimize edilmiş değerler:
 * - Minimum çözünürlük: AI analizi için yeterli detay
 * - Maksimum çözünürlük: API limiti ve performans dengesi
 * - Desteklenen formatlar: En yaygın ve optimize formatlar
 */
export const IMAGE_CONSTRAINTS = {
  // Boyut kısıtlamaları (piksel)
  MIN_WIDTH: 800,                    // Minimum genişlik
  MIN_HEIGHT: 600,                   // Minimum yükseklik
  MAX_WIDTH: 4096,                   // Maksimum genişlik (OpenAI limit)
  MAX_HEIGHT: 4096,                  // Maksimum yükseklik (OpenAI limit)
  
  // Dosya boyutu (bytes)
  MAX_SIZE_BYTES: 10 * 1024 * 1024,  // 10MB maksimum
  MIN_SIZE_BYTES: 50 * 1024,         // 50KB minimum (çok küçük dosyalar için)
  
  // Desteklenen formatlar (MIME types)
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ],
  
  // Desteklenen dosya uzantıları
  ALLOWED_EXTENSIONS: [
    '.jpg',
    '.jpeg',
    '.png', 
    '.webp',
    '.heic',
    '.heif'
  ],
  
  // Kalite kısıtlamaları
  MIN_QUALITY_SCORE: 50,             // Blur detection threshold (0-100)
  MIN_ASPECT_RATIO: 0.5,             // Minimum aspect ratio (width/height)
  MAX_ASPECT_RATIO: 3.0,             // Maksimum aspect ratio
  
  // AI optimizasyon ayarları
  OPTIMIZE_FOR_AI: {
    TARGET_WIDTH: 1920,              // AI için optimize genişlik
    TARGET_HEIGHT: 1080,             // AI için optimize yükseklik
    QUALITY_PERCENTAGE: 85,          // JPEG kalite yüzdesi
    COMPRESSION_LEVEL: 6             // PNG sıkıştırma seviyesi (0-9)
  }
} as const

/**
 * Ses Dosyası Kısıtlamaları
 * 
 * OpenAI Audio API için optimize edilmiş değerler:
 * - Ses kalitesi: Motor analizi için yeterli frekans aralığı
 * - Süre: AI analizi için optimal süre
 * - Format: En yaygın ses formatları
 */
export const AUDIO_CONSTRAINTS = {
  // Süre kısıtlamaları (saniye)
  MIN_DURATION_SECONDS: 10,          // Minimum kayıt süresi
  MAX_DURATION_SECONDS: 60,          // Maksimum kayıt süresi
  
  // Dosya boyutu (bytes)
  MAX_SIZE_BYTES: 50 * 1024 * 1024,  // 50MB maksimum
  MIN_SIZE_BYTES: 100 * 1024,        // 100KB minimum
  
  // Desteklenen formatlar (MIME types)
  ALLOWED_MIME_TYPES: [
    'audio/wav',
    'audio/mp3',
    'audio/mpeg',
    'audio/m4a',
    'audio/mp4',
    'audio/aac',
    'audio/3gpp',
    'audio/3gpp2',
    'audio/amr',
    'audio/ogg',
    'audio/webm',
    'audio/opus',
    'audio/flac'
  ],
  
  // Desteklenen dosya uzantıları
  ALLOWED_EXTENSIONS: [
    '.wav',
    '.mp3',
    '.m4a',
    '.aac',
    '.3gp',
    '.3gp2',
    '.amr',
    '.ogg',
    '.webm',
    '.opus',
    '.flac',
    '.caf'
  ],
  
  // Ses kalitesi kısıtlamaları
  MIN_BITRATE_KBPS: 32,              // Minimum bitrate (kbps)
  MAX_BITRATE_KBPS: 320,             // Maksimum bitrate (kbps)
  MIN_SAMPLE_RATE_HZ: 8000,          // Minimum sample rate
  MAX_SAMPLE_RATE_HZ: 48000,         // Maksimum sample rate
  
  // AI optimizasyon ayarları
  OPTIMIZE_FOR_AI: {
    TARGET_SAMPLE_RATE: 16000,       // AI için optimize sample rate
    TARGET_BITRATE: 128,             // AI için optimize bitrate (kbps)
    TARGET_CHANNELS: 1,              // Mono (tek kanal)
    NORMALIZE_LEVEL: 0.8             // Ses seviyesi normalizasyonu
  },
  
  // Ses içerik kısıtlamaları
  MIN_VOLUME_THRESHOLD: 0.01,        // Minimum ses seviyesi (0-1)
  MAX_SILENCE_RATIO: 0.3,            // Maksimum sessizlik oranı (%30)
  MIN_ACTIVE_AUDIO_RATIO: 0.7        // Minimum aktif ses oranı (%70)
} as const

/**
 * Dosya Validasyon Hata Mesajları
 */
export const FILE_VALIDATION_ERRORS = {
  // Görüntü hataları
  IMAGE_TOO_SMALL: 'Resim çözünürlüğü çok düşük. Minimum 800x600 piksel gerekli.',
  IMAGE_TOO_LARGE: 'Resim boyutu 10MB üzerinde. Lütfen dosyayı sıkıştırın.',
  IMAGE_WRONG_FORMAT: 'Desteklenmeyen resim formatı. JPEG, PNG, WebP veya HEIC kullanın.',
  IMAGE_TOO_BLURRY: 'Resim çok bulanık. Lütfen net bir fotoğraf çekin.',
  IMAGE_ASPECT_RATIO_INVALID: 'Resim oranı uygun değil. Normal bir perspektiften çekin.',
  
  // Ses hataları
  AUDIO_TOO_SHORT: 'Ses kaydı çok kısa. Minimum 10 saniye gerekli.',
  AUDIO_TOO_LONG: 'Ses kaydı çok uzun. Maksimum 60 saniye gerekli.',
  AUDIO_WRONG_FORMAT: 'Desteklenmeyen ses formatı. WAV, MP3, M4A veya AAC kullanın.',
  AUDIO_TOO_QUIET: 'Ses seviyesi çok düşük. Motora daha yakın kayıt yapın.',
  AUDIO_TOO_NOISY: 'Çok fazla arka plan gürültüsü. Sessiz ortamda kayıt yapın.',
  AUDIO_TOO_SILENT: 'Kayıt çok sessiz. Motor sesini net duyacak şekilde kayıt yapın.',
  
  // Genel hatalar
  FILE_NOT_PROVIDED: 'Dosya seçilmedi. Lütfen bir dosya seçin.',
  MULTIPLE_FILES: 'Birden fazla dosya seçildi. Tek seferde bir dosya yükleyin.',
  FILE_CORRUPTED: 'Dosya bozuk. Lütfen başka bir dosya deneyin.',
  UPLOAD_FAILED: 'Dosya yüklenemedi. Lütfen tekrar deneyin.'
} as const

/**
 * AI Analiz Optimizasyon İpuçları
 */
export const AI_OPTIMIZATION_TIPS = {
  // Görüntü için ipuçları
  IMAGE_TIPS: [
    'Doğal ışıkta çekim yapın - flaş kullanmayın',
    'Aracı yakından çekin - hasar detayları net görünsün',
    'Kamera sabit tutun - bulanık çekim yapmayın',
    'Hasar alanını tam kareye alın',
    'Gölge ve yansımaları minimize edin'
  ],
  
  // Ses için ipuçları
  AUDIO_TIPS: [
    'Motor rölantide iken kayıt başlatın',
    '10-15 saniye rölanti, sonra gaz verin',
    'Çevresel gürültüyü minimize edin',
    'Telefonu motor bölgesine yakın tutun',
    'Hareket halindeyken kayıt yapmayın'
  ]
} as const

/**
 * Dosya Boyutu Yardımcı Fonksiyonları
 */
export const FileSizeHelpers = {
  /**
   * Byte'ı MB'ye çevir
   */
  bytesToMB: (bytes: number): number => {
    return bytes / (1024 * 1024)
  },
  
  /**
   * MB'yi byte'a çevir
   */
  mbToBytes: (mb: number): number => {
    return mb * 1024 * 1024
  },
  
  /**
   * Dosya boyutunu insan okunabilir formata çevir
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
} as const

/**
 * Dosya Uzantısı Yardımcı Fonksiyonları
 */
export const FileExtensionHelpers = {
  /**
   * Dosya uzantısını al
   */
  getExtension: (filename: string): string => {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'))
  },
  
  /**
   * MIME type'ı uzantıya çevir
   */
  mimeTypeToExtension: (mimeType: string): string => {
    const mapping: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/heic': '.heic',
      'image/heif': '.heif',
      'audio/wav': '.wav',
      'audio/mp3': '.mp3',
      'audio/mpeg': '.mp3',
      'audio/m4a': '.m4a',
      'audio/aac': '.aac',
      'audio/3gpp': '.3gp',
      'audio/ogg': '.ogg',
      'audio/webm': '.webm',
      'audio/flac': '.flac'
    }
    
    return mapping[mimeType] || ''
  }
} as const
