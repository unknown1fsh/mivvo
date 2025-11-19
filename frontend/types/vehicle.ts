/**
 * Vehicle Types (Araç Tipleri)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, araç ile ilgili tüm TypeScript tiplerini tanımlar.
 * 
 * İçerik:
 * - VehicleInfo (Temel araç bilgileri)
 * - Vehicle (Araç)
 * - VehicleGarage (Garaj aracı)
 * - VehicleGarageImage (Araç görseli)
 * - UploadedImage (Yüklenen görsel)
 * - UploadedAudio (Yüklenen ses)
 * - PaintAnalysisResult (Boya analizi sonucu)
 * - EngineSoundAnalysisResult (Motor sesi analizi sonucu)
 * - VINLookupResult (VIN sorgulama sonucu)
 * 
 * Kullanım:
 * ```typescript
 * import { VehicleInfo, Vehicle, VehicleGarage } from '@/types'
 * 
 * const vehicleInfo: VehicleInfo = { make: 'Toyota', model: 'Corolla', ... }
 * const vehicles: VehicleGarage[] = await vehicleGarageService.getVehicleGarage()
 * ```
 */

// ===== VEHICLE INFO INTERFACE =====

/**
 * Vehicle Info (Temel Araç Bilgileri)
 * 
 * Rapor oluştururken kullanılan minimal araç bilgileri.
 * 
 * Kullanım:
 * - Rapor oluşturma
 * - AI analizi başlatma
 * - Hızlı araç tanımlama
 */
export interface VehicleInfo {
  /** Marka (örn: 'Toyota') */
  make: string
  
  /** Model (örn: 'Corolla') */
  model: string
  
  /** Yıl */
  year: number | string
  
  /** VIN numarası */
  vin: string
  
  /** Plaka */
  plate: string
}

// ===== VEHICLE INTERFACE =====

/**
 * Vehicle (Araç)
 * 
 * Basit araç bilgileri.
 * 
 * VehicleGarage'den daha basit bir versiyon.
 */
export interface Vehicle {
  /** Araç ID */
  id: string
  
  /** Plaka */
  plate: string
  
  /** Marka */
  brand: string
  
  /** Model */
  model: string
  
  /** Yıl */
  year: number
  
  /** Renk */
  color: string
  
  /** Kilometre */
  mileage?: number
  
  /** VIN numarası */
  vin?: string
  
  /** Oluşturulma tarihi */
  createdAt: Date
  
  /** Güncellenme tarihi */
  updatedAt: Date
}

// ===== VEHICLE GARAGE INTERFACE =====

/**
 * Vehicle Garage (Araç Garajı)
 * 
 * Kullanıcının garajındaki araç bilgileri.
 * 
 * Backend Prisma model'i ile eşleşir.
 * 
 * Özellikler:
 * - Detaylı araç bilgileri
 * - Görseller
 * - Varsayılan araç seçimi
 * - Rapor sayısı
 */
export interface VehicleGarage {
  /** Araç ID */
  id: number
  
  /** Kullanıcı ID */
  userId: number
  
  /** Plaka */
  plate: string
  
  /** Marka */
  brand: string
  
  /** Model */
  model: string
  
  /** Yıl */
  year: number
  
  /** Renk */
  color?: string
  
  /** Kilometre */
  mileage?: number
  
  /** VIN numarası */
  vin?: string
  
  /** Yakıt tipi (örn: 'Benzin', 'Dizel', 'Elektrik') */
  fuelType?: string
  
  /** Vites tipi (örn: 'Manuel', 'Otomatik') */
  transmission?: string
  
  /** Motor hacmi (örn: '1.6L', '2.0L') */
  engineSize?: string
  
  /** Kasa tipi (örn: 'Sedan', 'SUV', 'Hatchback') */
  bodyType?: string
  
  /** Kapı sayısı */
  doors?: number
  
  /** Koltuk sayısı */
  seats?: number
  
  /** Notlar */
  notes?: string
  
  /** Varsayılan araç mı? */
  isDefault: boolean
  
  /** Oluşturulma tarihi */
  createdAt: string
  
  /** Güncellenme tarihi */
  updatedAt: string
  
  /** Araç görselleri */
  vehicleImages: VehicleGarageImage[]
  
  /** İlişkili kayıt sayıları */
  _count?: {
    /** Rapor sayısı */
    reports: number
  }
}

// ===== VEHICLE GARAGE IMAGE INTERFACE =====

/**
 * Vehicle Garage Image (Araç Garajı Görseli)
 * 
 * Garajtaki araca ait görsel bilgileri.
 */
export interface VehicleGarageImage {
  /** Görsel ID */
  id: number
  
  /** Araç ID */
  vehicleGarageId: number
  
  /** Görsel yolu (sunucuda) */
  imagePath: string
  
  /** Görsel adı */
  imageName: string
  
  /** Görsel tipi */
  imageType: 'EXTERIOR' | 'INTERIOR' | 'ENGINE' | 'DAMAGE' | 'PAINT'
  
  /** Dosya boyutu (byte) */
  fileSize?: number
  
  /** Yüklenme tarihi */
  uploadDate: string
}

// ===== UPLOADED IMAGE INTERFACE =====

/**
 * Uploaded Image (Yüklenen Görsel)
 * 
 * Kullanıcının yüklediği görsel bilgileri (frontend state için).
 * 
 * Kullanım:
 * - File upload component
 * - Image preview
 * - Upload progress tracking
 */
export interface UploadedImage {
  /** Benzersiz ID */
  id: string
  
  /** File objesi */
  file: File
  
  /** Preview URL (Base64 veya Blob URL) */
  preview: string
  
  /** Dosya adı */
  name: string
  
  /** Dosya boyutu (byte) */
  size: number
  
  /** Yükleme durumu */
  status: 'uploading' | 'uploaded' | 'error'
  
  /** Görsel tipi */
  type?: 'exterior' | 'interior' | 'engine' | 'damage' | 'paint'
  
  /** Analiz sonucu (AI ile) */
  analysis?: {
    /** Boya durumu */
    paintCondition: string
    
    /** Hasar tespit edildi mi? */
    damageDetected: boolean
    
    /** Güven skoru */
    confidence: number
  }
}

// ===== UPLOADED AUDIO INTERFACE =====

/**
 * Uploaded Audio (Yüklenen Ses)
 * 
 * Kullanıcının yüklediği ses dosyası bilgileri (frontend state için).
 * 
 * Kullanım:
 * - Audio upload component
 * - Audio recorder
 * - Upload progress tracking
 */
export interface UploadedAudio {
  /** Benzersiz ID */
  id: string
  
  /** File objesi */
  file: File
  
  /** Ses süresi (saniye) */
  duration: number
  
  /** Dosya adı */
  name: string
  
  /** Dosya boyutu (byte) */
  size: number
  
  /** Yükleme durumu */
  status: 'uploading' | 'uploaded' | 'error'
  
  /** Ses tipi */
  type: 'engine_sound' | 'exhaust_sound' | 'mechanical_sound'
  
  /** Analiz sonucu (AI ile) */
  analysis?: {
    /** Motor sağlığı */
    engineHealth: string
    
    /** Tespit edilen sorunlar */
    issuesDetected: string[]
    
    /** Güven skoru */
    confidence: number
  }
}

// ===== PAINT ANALYSIS RESULT INTERFACE =====
// Note: PaintAnalysisResult is now exported from './paintAnalysis' to avoid duplicate exports
// Use: import { PaintAnalysisResult } from './paintAnalysis'

// ===== ENGINE SOUND ANALYSIS RESULT INTERFACE =====

/**
 * Engine Sound Analysis Result (Motor Sesi Analizi Sonucu)
 * 
 * AI motor sesi analizi sonuçları.
 * 
 * OpenAI Whisper API'den dönen analiz sonuçları.
 */
export interface EngineSoundAnalysisResult {
  /** Rapor ID */
  id: string
  
  /** Araç bilgileri */
  vehicleInfo: VehicleInfo
  
  /** Genel skor (0-100) */
  overallScore: number
  
  /** Motor sağlığı (örn: 'Mükemmel', 'İyi', 'Orta', 'Kötü') */
  engineHealth: string
  
  /** RPM analizi */
  rpmAnalysis: {
    /** Rölanti RPM */
    idleRpm: number
    
    /** Maksimum RPM */
    maxRpm: number
    
    /** RPM kararlılığı (0-100) */
    rpmStability: number
  }
  
  /** Frekans analizi */
  frequencyAnalysis: {
    /** Dominant frekanslar (Hz) */
    dominantFrequencies: number[]
    
    /** Harmonik bozulma (0-100) */
    harmonicDistortion: number
    
    /** Gürültü seviyesi (dB) */
    noiseLevel: number
  }
  
  /** Tespit edilen sorunlar */
  detectedIssues: {
    /** Sorun adı */
    issue: string
    
    /** Şiddet seviyesi */
    severity: 'low' | 'medium' | 'high' | 'critical'
    
    /** Güven skoru (0-100) */
    confidence: number
    
    /** Açıklama */
    description: string
    
    /** Tamir önerisi */
    recommendation: string
  }[]
  
  /** Performans metrikleri */
  performanceMetrics: {
    /** Motor verimliliği (0-100) */
    engineEfficiency: number
    
    /** Titreşim seviyesi (0-100) */
    vibrationLevel: number
    
    /** Akustik kalite (0-100) */
    acousticQuality: number
  }
  
  /** Genel öneriler */
  recommendations: string[]
  
  /** Analiz tarihi */
  createdAt: Date
}

// ===== VIN LOOKUP RESULT INTERFACE =====

/**
 * VIN Lookup Result (VIN Sorgulama Sonucu)
 * 
 * NHTSA API'den dönen VIN bilgileri.
 * 
 * Kullanım:
 * ```typescript
 * const result: VINLookupResult = await vinService.lookupVIN('1HGBH41JXMN109186')
 * ```
 */
export interface VINLookupResult {
  /** VIN numarası */
  vin: string
  
  /** Marka */
  make: string
  
  /** Model */
  model: string
  
  /** Yıl */
  year: number
  
  /** Motor */
  engine: string
  
  /** Yakıt tipi */
  fuelType: string
  
  /** Vites tipi */
  transmission: string
  
  /** Çekiş tipi (örn: 'FWD', 'RWD', 'AWD') */
  driveType: string
  
  /** Kasa tipi */
  bodyStyle: string
  
  /** Kapı sayısı */
  doors: number
  
  /** Silindir sayısı */
  cylinders: number
  
  /** Motor hacmi */
  displacement: string
  
  /** Üretici firma */
  manufacturer: string
  
  /** Üretim yeri - Ülke */
  plantCountry: string
  
  /** Üretim yeri - Şehir */
  plantCity: string
  
  /** Üretim yeri - Eyalet */
  plantState: string
  
  /** Üretim yeri - Firma adı */
  plantCompanyName: string
  
  /** Hata kodu (varsa) */
  errorCode?: string
  
  /** Hata metni (varsa) */
  errorText?: string
  
  /** Cache'den mi geldi? */
  cached?: boolean
}
