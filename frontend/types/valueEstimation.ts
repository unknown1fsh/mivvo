/**
 * Değer Tahmini Types (Value Estimation Types)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, araç değer tahmini ile ilgili tüm TypeScript tiplerini tanımlar.
 * Backend ValueEstimationService'den gelen tam analiz sonucu ile %100 uyumlu.
 * 
 * İçerik:
 * - ValueEstimationResult (Değer Tahmini Sonucu)
 * - MarketAnalysis (Pazar Analizi)
 * - VehicleCondition (Araç Durumu)
 * - PriceBreakdown (Fiyat Kırılımı)
 * - MarketPosition (Pazar Konumu)
 * - InvestmentAnalysis (Yatırım Analizi)
 * - Recommendations (Öneriler)
 * - ComparableVehicles (Karşılaştırılabilir Araçlar)
 * 
 * Kullanım:
 * ```typescript
 * import { ValueEstimationResult } from '@/types/valueEstimation'
 * 
 * const result: ValueEstimationResult = await valueEstimationService.getReport('123')
 * ```
 */

// ===== DEĞER TAHMİNİ SONUCU =====

/**
 * Değer Tahmini Sonucu Interface
 * 
 * Backend ValueEstimationService'den gelen tam analiz sonucu
 */
export interface ValueEstimationResult {
  /** Tahmini değer (TL) */
  estimatedValue: number
  
  /** Pazar analizi */
  marketAnalysis: MarketAnalysis
  
  /** Araç durumu değerlendirmesi */
  vehicleCondition: VehicleCondition
  
  /** Fiyat kırılımı (detaylı) */
  priceBreakdown: PriceBreakdown
  
  /** Pazar konumu */
  marketPosition: MarketPosition
  
  /** Yatırım analizi */
  investmentAnalysis: InvestmentAnalysis
  
  /** Öneriler */
  recommendations: Recommendations
  
  /** Karşılaştırılabilir araçlar */
  comparableVehicles: ComparableVehicle[]
  
  /** AI sağlayıcı */
  aiProvider: string
  
  /** AI model */
  model: string
  
  /** Güven seviyesi (0-100) */
  confidence: number
  
  /** Analiz zamanı (ISO) */
  analysisTimestamp: string
}

// ===== PAZAR ANALİZİ =====

/**
 * Pazar Analizi Interface
 * 
 * Piyasa durumu ve trend analizi
 */
export interface MarketAnalysis {
  /** Güncel pazar değeri (TL) */
  currentMarketValue: number
  
  /** Pazar trendi */
  marketTrend: string
  
  /** Talep seviyesi */
  demandLevel: string
  
  /** Arz seviyesi */
  supplyLevel: string
  
  /** Fiyat aralığı */
  priceRange: {
    /** Minimum fiyat (TL) */
    min: number
    /** Maksimum fiyat (TL) */
    max: number
    /** Ortalama fiyat (TL) */
    average: number
  }
  
  /** Bölgesel fark */
  regionalVariation: string
  
  /** Mevsimsel etki */
  seasonalImpact: string
  
  /** Pazar içgörüleri */
  marketInsights: string[]
}

// ===== ARAÇ DURUMU =====

/**
 * Araç Durumu Interface
 * 
 * Araç durumu değerlendirmesi
 */
export interface VehicleCondition {
  /** Genel durum */
  overallCondition: string
  
  /** Durum skoru (0-100) */
  conditionScore: number
  
  /** Kilometre etkisi */
  mileageImpact: string
  
  /** Yaş etkisi */
  ageImpact: string
  
  /** Bakım etkisi */
  maintenanceImpact: string
  
  /** Kaza geçmişi */
  accidentHistory: boolean
  
  /** Sahiplik geçmişi */
  ownershipHistory: string
  
  /** Servis kayıtları */
  serviceRecords: boolean
  
  /** Modifikasyonlar */
  modifications: string[]
  
  /** Durum notları */
  conditionNotes: string[]
}

// ===== FİYAT KIRILIMI =====

/**
 * Fiyat Kırılımı Interface
 * 
 * Detaylı fiyat hesaplama
 */
export interface PriceBreakdown {
  /** Temel değer (TL) */
  baseValue: number
  
  /** Kilometre ayarlaması (TL) */
  mileageAdjustment: number
  
  /** Durum ayarlaması (TL) */
  conditionAdjustment: number
  
  /** Özellik ayarlaması (TL) */
  featuresAdjustment: number
  
  /** Pazar ayarlaması (TL) */
  marketAdjustment: number
  
  /** Bölgesel ayarlama (TL) */
  regionalAdjustment: number
  
  /** Mevsimsel ayarlama (TL) */
  seasonalAdjustment: number
  
  /** Hasar tamir maliyeti (TL) */
  damageRepairCost?: number
  
  /** Hasar geçmişi cezası (TL) */
  damageHistoryPenalty?: number
  
  /** Yapısal hasar cezası (TL) */
  structuralDamagePenalty?: number
  
  /** Güvenlik riski cezası (TL) */
  safetyRiskPenalty?: number
  
  /** Final değer (TL) */
  finalValue: number
  
  /** Detaylı kırılım */
  breakdown: {
    /** Faktör */
    factor: string
    /** Etki (TL) */
    impact: number
    /** Açıklama */
    description: string
  }[]
}

// ===== PAZAR KONUMU =====

/**
 * Pazar Konumu Interface
 * 
 * Piyasadaki konum analizi
 */
export interface MarketPosition {
  /** Yüzdelik dilim */
  percentile: number
  
  /** Rekabetçi konum */
  competitivePosition: string
  
  /** Fiyatlandırma stratejisi */
  pricingStrategy: string
  
  /** Pazar avantajları */
  marketAdvantages: string[]
  
  /** Pazar dezavantajları */
  marketDisadvantages: string[]
  
  /** Hedef alıcılar */
  targetBuyers: string[]
}

// ===== YATIRIM ANALİZİ =====

/**
 * Yatırım Analizi Interface
 * 
 * Yatırım değerlendirmesi
 */
export interface InvestmentAnalysis {
  /** Yatırım notu */
  investmentGrade: string
  
  /** Değer artış potansiyeli */
  appreciationPotential: string
  
  /** Değer kaybı oranı */
  depreciationRate: string
  
  /** Aylık tutma maliyeti (TL) */
  holdingCostPerMonth: string
  
  /** Likidite skoru (0-100) */
  liquidityScore: number
  
  /** Risk seviyesi */
  riskLevel: 'low' | 'medium' | 'high'
  
  /** Yatırım ufku */
  investmentHorizon: string
  
  /** Yatırım notları */
  investmentNotes: string[]
}

// ===== ÖNERİLER =====

/**
 * Öneriler Interface
 * 
 * Satış ve satın alma önerileri
 */
export interface Recommendations {
  /** Satış fiyatları */
  sellingPrice: {
    /** Minimum fiyat (TL) */
    min: number
    /** Optimal fiyat (TL) */
    optimal: number
    /** Maksimum fiyat (TL) */
    max: number
  }
  
  /** Satın alma fiyatları */
  buyingPrice: {
    /** Minimum fiyat (TL) */
    min: number
    /** Optimal fiyat (TL) */
    optimal: number
    /** Maksimum fiyat (TL) */
    max: number
  }
  
  /** Pazarlık ipuçları */
  negotiationTips: string[]
  
  /** Zamanlama tavsiyeleri */
  timingAdvice: string[]
  
  /** İyileştirme önerileri */
  improvementSuggestions: {
    /** Aksiyon */
    action: string
    /** Maliyet (TL) */
    cost: number
    /** Değer artışı (TL) */
    valueIncrease: number
    /** Açıklama */
    description: string
  }[]
}

// ===== KARŞILAŞTIRILABİLİR ARAÇLAR =====

/**
 * Karşılaştırılabilir Araç Interface
 * 
 * Benzer araçların karşılaştırması
 */
export interface ComparableVehicle {
  /** Marka */
  make: string
  
  /** Model */
  model: string
  
  /** Yıl */
  year: number
  
  /** Kilometre */
  mileage: number
  
  /** Fiyat (TL) */
  price: number
  
  /** Durum */
  condition: string
  
  /** Konum */
  location: string
  
  /** Piyasada geçen gün sayısı */
  daysOnMarket: number
  
  /** Benzerlik yüzdesi */
  similarity: number
}

// ===== ENUMS VE CONSTANTS =====

/**
 * Risk Seviyesi Enum
 */
export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

/**
 * Risk Seviyesi Açıklamaları
 */
export const RiskLevelDescriptions: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'Düşük Risk',
  [RiskLevel.MEDIUM]: 'Orta Risk',
  [RiskLevel.HIGH]: 'Yüksek Risk'
}

/**
 * Risk Seviyesi Renkleri
 */
export const RiskLevelColors: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'text-green-600',
  [RiskLevel.MEDIUM]: 'text-yellow-600',
  [RiskLevel.HIGH]: 'text-red-600'
}

/**
 * Risk Seviyesi Arka Plan Renkleri
 */
export const RiskLevelBgColors: Record<RiskLevel, string> = {
  [RiskLevel.LOW]: 'bg-green-100',
  [RiskLevel.MEDIUM]: 'bg-yellow-100',
  [RiskLevel.HIGH]: 'bg-red-100'
}

// ===== UTILITY FUNCTIONS =====

/**
 * Değer aralığını kategoriye çevirir
 */
export function getValueRangeCategory(value: number, min: number, max: number): string {
  const percentage = ((value - min) / (max - min)) * 100
  
  if (percentage >= 90) return 'Çok Yüksek'
  if (percentage >= 75) return 'Yüksek'
  if (percentage >= 50) return 'Orta'
  if (percentage >= 25) return 'Düşük'
  return 'Çok Düşük'
}

/**
 * Likidite skorunu kategoriye çevirir
 */
export function getLiquidityCategory(score: number): string {
  if (score >= 90) return 'Mükemmel'
  if (score >= 80) return 'İyi'
  if (score >= 70) return 'Orta'
  if (score >= 60) return 'Kötü'
  return 'Çok Kötü'
}

/**
 * Durum skorunu kategoriye çevirir
 */
export function getConditionCategory(score: number): string {
  if (score >= 90) return 'Mükemmel'
  if (score >= 80) return 'İyi'
  if (score >= 70) return 'Orta'
  if (score >= 60) return 'Kötü'
  return 'Çok Kötü'
}

/**
 * Fiyatı formatlar
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Yüzdeyi formatlar
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}
