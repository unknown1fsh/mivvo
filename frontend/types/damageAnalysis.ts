/**
 * Damage Analysis Types (Hasar Analizi Tipleri)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, hasar analizi ile ilgili tüm TypeScript tiplerini tanımlar.
 * 
 * İçerik:
 * - DamageSeverityLevel (Hasar şiddeti)
 * - DamageAnalysisImageArea (Hasar alanı)
 * - DamageAnalysisImage (Analiz edilen görsel)
 * - DamageAnalysisSummary (Özet)
 * - DamageAnalysisTechnicalDetails (Teknik detaylar)
 * - DamageAnalysisReportData (Rapor verisi)
 * 
 * Kullanım:
 * ```typescript
 * import { DamageAnalysisReportData, DamageSeverityLevel } from '@/types'
 * 
 * const report: DamageAnalysisReportData = await damageAnalysisService.getById(123)
 * const severity: DamageSeverityLevel = report.damageSeverity
 * ```
 */

// ===== DAMAGE SEVERITY LEVEL TYPE =====

/**
 * Damage Severity Level (Hasar Şiddet Seviyesi)
 * 
 * Hasar şiddeti için olası değerler.
 * 
 * - low: Düşük (kozmetik hasarlar)
 * - medium: Orta (küçük onarım gerektirir)
 * - high: Yüksek (büyük onarım gerektirir)
 * - critical: Kritik (güvenlik riski)
 */
export type DamageSeverityLevel = 'low' | 'medium' | 'high' | 'critical'

// ===== DAMAGE ANALYSIS IMAGE AREA INTERFACE =====

/**
 * Damage Analysis Image Area (Hasar Alanı)
 * 
 * Görselde tespit edilen tek bir hasar alanı.
 * 
 * Kullanım:
 * - Hasar işaretleme (image overlay)
 * - Hasar listesi
 * - Maliyet hesaplama
 */
export interface DamageAnalysisImageArea {
  /** Alan ID (opsiyonel, frontend için) */
  id?: string
  
  /** X koordinatı (görsel üzerinde) */
  x: number
  
  /** Y koordinatı (görsel üzerinde) */
  y: number
  
  /** Genişlik (px) */
  width: number
  
  /** Yükseklik (px) */
  height: number
  
  /** Hasar tipi */
  type: 'scratch' | 'dent' | 'rust' | 'oxidation' | 'crack' | 'break'
  
  /** Şiddet seviyesi */
  severity: 'low' | 'medium' | 'high'
  
  /** Güven skoru (0-100) */
  confidence: number
  
  /** Açıklama */
  description: string
  
  /** Tahmini onarım maliyeti (TL) */
  estimatedRepairCost: number
  
  /** Gerçek onarım maliyeti (kullanıcı girişi, opsiyonel) */
  repairCost?: number
  
  /** Etkilenen parçalar */
  partsAffected?: string[]
}

// ===== DAMAGE ANALYSIS IMAGE INTERFACE =====

/**
 * Damage Analysis Image (Analiz Edilen Görsel)
 * 
 * Tek bir görselin analiz sonuçları.
 * 
 * Birden fazla hasar alanı içerebilir.
 */
export interface DamageAnalysisImage {
  /** Görsel açısı (örn: 'front', 'rear', 'left', 'right') */
  angle: string
  
  /** Tespit edilen hasar alanları */
  damageAreas: DamageAnalysisImageArea[]
  
  /** Toplam hasar skoru (0-100) */
  totalDamageScore: number
  
  /** Tamir önerileri */
  recommendations: string[]
}

// ===== DAMAGE ANALYSIS SUMMARY INTERFACE =====

/**
 * Damage Analysis Summary (Hasar Analizi Özeti)
 * 
 * Genel hasar değerlendirmesi.
 * 
 * Tüm görsellerin birleştirilmiş sonuçları.
 */
export interface DamageAnalysisSummary {
  /** Toplam hasar sayısı */
  totalDamages: number
  
  /** Kritik hasar sayısı */
  criticalDamages: number
  
  /** Tahmini toplam onarım maliyeti (TL) */
  estimatedRepairCost: number
  
  /** Sigorta etkisi (örn: 'Prim artışı beklenmiyor', 'Prim artışı olabilir') */
  insuranceImpact: string
  
  /** Güvenlik endişeleri */
  safetyConcerns: string[]
  
  /** Güçlü yönler */
  strengths: string[]
  
  /** Zayıf yönler */
  weaknesses: string[]
  
  /** Genel öneriler */
  recommendations: string[]
  
  /** Piyasa değeri etkisi (%) */
  marketValueImpact: number
}

// ===== DAMAGE ANALYSIS TECHNICAL DETAILS INTERFACE =====

/**
 * Damage Analysis Technical Details (Teknik Detaylar)
 * 
 * Analiz süreci hakkında teknik bilgiler.
 * 
 * Kullanım:
 * - Rapor güvenilirliği
 * - AI model versiyonu
 * - Performans metrikleri
 */
export interface DamageAnalysisTechnicalDetails {
  /** Analiz yöntemi (örn: 'OpenAI Vision API') */
  analysisMethod: string
  
  /** AI model (örn: 'gpt-4-vision-preview') */
  aiModel: string
  
  /** Genel güven skoru (0-100) */
  confidence: number
  
  /** İşlem süresi (örn: '2.5s') */
  processingTime: string
  
  /** Görsel kalitesi (örn: 'Yüksek', 'Orta', 'Düşük') */
  imageQuality: string
}

// ===== DAMAGE ANALYSIS REPORT DATA INTERFACE =====

/**
 * Damage Analysis Report Data (Hasar Analizi Rapor Verisi)
 * 
 * Tam hasar analizi raporu.
 * 
 * Backend'den dönen ve PDF'de gösterilen ana veri yapısı.
 * 
 * Kullanım:
 * ```typescript
 * const report: DamageAnalysisReportData = await damageAnalysisService.analyze({
 *   image: file,
 *   vehicleInfo: { ... }
 * })
 * 
 * // PDF oluştur
 * await generateDamageAnalysisPDF(report)
 * ```
 */
export interface DamageAnalysisReportData {
  /** Rapor ID */
  id: string
  
  /** Araç bilgileri */
  vehicleInfo: {
    /** Marka */
    make: string
    
    /** Model */
    model: string
    
    /** Yıl */
    year: number
    
    /** VIN numarası */
    vin: string
    
    /** Plaka */
    plate: string
  }
  
  /** Genel skor (0-100) */
  overallScore: number
  
  /** Hasar şiddeti */
  damageSeverity: DamageSeverityLevel
  
  /** Analiz tarihi */
  analysisDate: string
  
  /** Analiz edilen görseller */
  images: DamageAnalysisImage[]
  
  /** Özet */
  summary: DamageAnalysisSummary
  
  /** Teknik detaylar */
  technicalDetails: DamageAnalysisTechnicalDetails
}
