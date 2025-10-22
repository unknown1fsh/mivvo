/**
 * Kapsamlı Ekspertiz Types (Comprehensive Expertise Types)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, kapsamlı ekspertiz ile ilgili tüm TypeScript tiplerini tanımlar.
 * Backend ComprehensiveExpertiseService'den gelen tam analiz sonucu ile %100 uyumlu.
 * 
 * İçerik:
 * - ComprehensiveExpertiseResult (Kapsamlı Ekspertiz Sonucu)
 * - ComprehensiveSummary (Kapsamlı Özet)
 * - ExpertOpinion (Uzman Görüşü)
 * - FinalRecommendations (Nihai Öneriler)
 * - InvestmentDecision (Yatırım Kararı)
 * 
 * Kullanım:
 * ```typescript
 * import { ComprehensiveExpertiseResult } from '@/types/comprehensiveExpertise'
 * 
 * const result: ComprehensiveExpertiseResult = await comprehensiveExpertiseService.getReport('123')
 * ```
 */

import { DamageAnalysisResult } from './damageAnalysis'
import { PaintAnalysisResult } from './paintAnalysis'
import { AudioAnalysisResult } from './audioAnalysis'
import { ValueEstimationResult } from './valueEstimation'

// ===== KAPSAMLI EKSPERTİZ SONUCU =====

/**
 * Kapsamlı Ekspertiz Sonucu Interface
 * 
 * Backend ComprehensiveExpertiseService'den gelen tam analiz sonucu
 */
export interface ComprehensiveExpertiseResult {
  /** Genel puan (0-100) */
  overallScore: number
  
  /** Ekspertiz notu */
  expertiseGrade: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  
  /** Error durumu (opsiyonel) */
  error?: string
  
  /** Hasar analizi sonucu */
  damageAnalysis: DamageAnalysisResult | null
  
  /** Boya analizi sonucu */
  paintAnalysis: PaintAnalysisResult | null
  
  /** Ses analizi sonucu */
  audioAnalysis: AudioAnalysisResult | null
  
  /** Değer tahmini sonucu */
  valueEstimation: ValueEstimationResult | null
  
  /** Kapsamlı özet */
  comprehensiveSummary: ComprehensiveSummary
  
  /** Uzman görüşü */
  expertOpinion: ExpertOpinion
  
  /** Nihai öneriler */
  finalRecommendations: FinalRecommendations
  
  /** Yatırım kararı */
  investmentDecision: InvestmentDecision
  
  /** AI sağlayıcı */
  aiProvider: string
  
  /** AI model */
  model: string
  
  /** Güven seviyesi (0-100) */
  confidence: number
  
  /** Analiz zamanı (ISO) */
  analysisTimestamp: string
}

// ===== KAPSAMLI ÖZET =====

/**
 * Kapsamlı Özet Interface
 * 
 * Tüm analizlerin birleştirilmiş özeti
 */
export interface ComprehensiveSummary {
  /** Araç genel bakışı */
  vehicleOverview: string
  
  /** Detaylı açıklama (opsiyonel) */
  detailedDescription?: string
  
  /** Anahtar bulgular */
  keyFindings: string[]
  
  /** Kritik sorunlar */
  criticalIssues: string[]
  
  /** Güçlü yönler */
  strengths: string[]
  
  /** Zayıf yönler */
  weaknesses: string[]
  
  /** Genel durum */
  overallCondition: string
  
  /** Pazar konumu */
  marketPosition: string
  
  /** Yatırım potansiyeli */
  investmentPotential: string
  
  /** Araç özellikleri tablosu (opsiyonel) */
  vehicleSpecsTable?: {
    /** Marka/Model */
    makeModel: string
    /** Yıl */
    year: string
    /** Motor tipi */
    engineType: string
    /** Şanzıman */
    transmission: string
    /** Çekiş tipi */
    driveType: string
    /** Renk */
    color: string
    /** Plaka */
    plate: string
  }
  
  /** Dış durum tablosu (opsiyonel) */
  exteriorConditionTable?: {
    /** Kaporta */
    bodywork: { status: string; note: string }
    /** Boya */
    paint: { status: string; note: string }
    /** Camlar */
    windows: { status: string; note: string }
    /** Işıklar */
    lights: { status: string; note: string }
    /** Aynalar */
    mirrors: { status: string; note: string }
  }
  
  /** Mekanik analiz tablosu (opsiyonel) */
  mechanicalAnalysisTable?: {
    /** Motor */
    engine: { status: string; note: string }
    /** Şanzıman */
    transmission: { status: string; note: string }
    /** Süspansiyon */
    suspension: { status: string; note: string }
    /** Frenler */
    brakes: { status: string; note: string }
    /** Elektrik */
    electrical: { status: string; note: string }
  }
  
  /** Ekspertiz skor tablosu (opsiyonel) */
  expertiseScoreTable?: {
    /** Kaporta/Boya */
    bodyPaint: { score: number; status: string; note: string }
    /** Şase */
    chassis: { score: number; status: string; note: string }
    /** Mekanik */
    mechanical: { score: number; status: string; note: string }
    /** Elektrik */
    electrical: { score: number; status: string; note: string }
    /** Lastikler */
    tires: { score: number; status: string; note: string }
    /** Jantlar */
    wheels: { score: number; status: string; note: string }
    /** İç mekan */
    interior: { score: number; status: string; note: string }
    /** Genel */
    overall: { score: number; status: string; note: string }
  }
  
  /** Pazar değeri tablosu (opsiyonel) */
  marketValueTable?: {
    /** Şu anki hali */
    asIs: { min: number; max: number; note: string }
    /** Tamir sonrası */
    afterRepair: { min: number; max: number; note: string }
    /** Restore sonrası */
    restored: { min: number; max: number; note: string }
  }
}

// ===== UZMAN GÖRÜŞÜ =====

/**
 * Uzman Görüşü Interface
 * 
 * Uzman değerlendirmesi ve önerileri
 */
export interface ExpertOpinion {
  /** Öneri */
  recommendation: 'strongly_buy' | 'buy' | 'neutral' | 'avoid' | 'strongly_avoid'
  
  /** Gerekçeler */
  reasoning: string[]
  
  /** Risk değerlendirmesi */
  riskAssessment: {
    /** Risk seviyesi */
    level: 'low' | 'medium' | 'high' | 'very_high'
    /** Risk faktörleri */
    factors: string[]
  }
  
  /** Fırsat değerlendirmesi */
  opportunityAssessment: {
    /** Fırsat seviyesi */
    level: 'excellent' | 'good' | 'fair' | 'poor'
    /** Fırsat faktörleri */
    factors: string[]
  }
  
  /** Uzman notları */
  expertNotes: string[]
}

// ===== NİHAİ ÖNERİLER =====

/**
 * Nihai Öneriler Interface
 * 
 * Detaylı öneriler ve aksiyon planı
 */
export interface FinalRecommendations {
  /** Acil öneriler */
  immediate: Array<{
    /** Öncelik */
    priority: string
    /** Aksiyon */
    action: string
    /** Maliyet (TL) */
    cost: number
    /** Fayda */
    benefit: string
  }>
  
  /** Kısa vadeli öneriler */
  shortTerm: Array<{
    /** Öncelik */
    priority: string
    /** Aksiyon */
    action: string
    /** Maliyet (TL) */
    cost: number
    /** Fayda */
    benefit: string
  }>
  
  /** Uzun vadeli öneriler */
  longTerm: Array<{
    /** Öncelik */
    priority: string
    /** Aksiyon */
    action: string
    /** Maliyet (TL) */
    cost: number
    /** Fayda */
    benefit: string
  }>
  
  /** Bakım önerileri */
  maintenance: Array<{
    /** Sıklık */
    frequency: string
    /** Aksiyon */
    action: string
    /** Maliyet (TL) */
    cost: number
  }>
}

// ===== YATIRIM KARARI =====

/**
 * Yatırım Kararı Interface
 * 
 * Yatırım değerlendirmesi ve finansal analiz
 */
export interface InvestmentDecision {
  /** Yatırım kararı */
  decision: 'excellent_investment' | 'good_investment' | 'fair_investment' | 'poor_investment' | 'avoid'
  
  /** Beklenen getiri (%) */
  expectedReturn: number
  
  /** Geri ödeme süresi */
  paybackPeriod: string
  
  /** Risk seviyesi */
  riskLevel: 'low' | 'medium' | 'high'
  
  /** Likidite skoru (0-100) */
  liquidityScore: number
  
  /** Pazar zamanlaması */
  marketTiming: string
  
  /** Finansal özet */
  financialSummary: {
    /** Satın alma fiyatı (TL) */
    purchasePrice: number
    /** Acil onarımlar (TL) */
    immediateRepairs: number
    /** Aylık bakım (TL) */
    monthlyMaintenance: number
    /** Tahmini satış değeri (TL) */
    estimatedResaleValue: number
    /** Toplam yatırım (TL) */
    totalInvestment: number
    /** Beklenen kar (TL) */
    expectedProfit: number
    /** ROI (%) */
    roi: number
  }
}

// ===== ENUMS VE CONSTANTS =====

/**
 * Ekspertiz Notu Enum
 */
export enum ExpertiseGrade {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical'
}

/**
 * Ekspertiz Notu Açıklamaları
 */
export const ExpertiseGradeDescriptions: Record<ExpertiseGrade, string> = {
  [ExpertiseGrade.EXCELLENT]: 'Mükemmel',
  [ExpertiseGrade.GOOD]: 'İyi',
  [ExpertiseGrade.FAIR]: 'Orta',
  [ExpertiseGrade.POOR]: 'Kötü',
  [ExpertiseGrade.CRITICAL]: 'Kritik'
}

/**
 * Ekspertiz Notu Renkleri
 */
export const ExpertiseGradeColors: Record<ExpertiseGrade, string> = {
  [ExpertiseGrade.EXCELLENT]: 'text-green-600',
  [ExpertiseGrade.GOOD]: 'text-blue-600',
  [ExpertiseGrade.FAIR]: 'text-yellow-600',
  [ExpertiseGrade.POOR]: 'text-orange-600',
  [ExpertiseGrade.CRITICAL]: 'text-red-600'
}

/**
 * Ekspertiz Notu Arka Plan Renkleri
 */
export const ExpertiseGradeBgColors: Record<ExpertiseGrade, string> = {
  [ExpertiseGrade.EXCELLENT]: 'bg-green-100',
  [ExpertiseGrade.GOOD]: 'bg-blue-100',
  [ExpertiseGrade.FAIR]: 'bg-yellow-100',
  [ExpertiseGrade.POOR]: 'bg-orange-100',
  [ExpertiseGrade.CRITICAL]: 'bg-red-100'
}

/**
 * Uzman Önerisi Enum
 */
export enum ExpertRecommendation {
  STRONGLY_BUY = 'strongly_buy',
  BUY = 'buy',
  NEUTRAL = 'neutral',
  AVOID = 'avoid',
  STRONGLY_AVOID = 'strongly_avoid'
}

/**
 * Uzman Önerisi Açıklamaları
 */
export const ExpertRecommendationDescriptions: Record<ExpertRecommendation, string> = {
  [ExpertRecommendation.STRONGLY_BUY]: 'Kesinlikle Al',
  [ExpertRecommendation.BUY]: 'Al',
  [ExpertRecommendation.NEUTRAL]: 'Nötr',
  [ExpertRecommendation.AVOID]: 'Kaçın',
  [ExpertRecommendation.STRONGLY_AVOID]: 'Kesinlikle Kaçın'
}

/**
 * Uzman Önerisi Renkleri
 */
export const ExpertRecommendationColors: Record<ExpertRecommendation, string> = {
  [ExpertRecommendation.STRONGLY_BUY]: 'text-green-600',
  [ExpertRecommendation.BUY]: 'text-blue-600',
  [ExpertRecommendation.NEUTRAL]: 'text-gray-600',
  [ExpertRecommendation.AVOID]: 'text-orange-600',
  [ExpertRecommendation.STRONGLY_AVOID]: 'text-red-600'
}

/**
 * Yatırım Kararı Enum
 */
export enum InvestmentDecisionType {
  EXCELLENT_INVESTMENT = 'excellent_investment',
  GOOD_INVESTMENT = 'good_investment',
  FAIR_INVESTMENT = 'fair_investment',
  POOR_INVESTMENT = 'poor_investment',
  AVOID = 'avoid'
}

/**
 * Yatırım Kararı Açıklamaları
 */
export const InvestmentDecisionDescriptions: Record<InvestmentDecisionType, string> = {
  [InvestmentDecisionType.EXCELLENT_INVESTMENT]: 'Mükemmel Yatırım',
  [InvestmentDecisionType.GOOD_INVESTMENT]: 'İyi Yatırım',
  [InvestmentDecisionType.FAIR_INVESTMENT]: 'Orta Yatırım',
  [InvestmentDecisionType.POOR_INVESTMENT]: 'Kötü Yatırım',
  [InvestmentDecisionType.AVOID]: 'Kaçınılmalı'
}

/**
 * Yatırım Kararı Renkleri
 */
export const InvestmentDecisionColors: Record<InvestmentDecisionType, string> = {
  [InvestmentDecisionType.EXCELLENT_INVESTMENT]: 'text-green-600',
  [InvestmentDecisionType.GOOD_INVESTMENT]: 'text-blue-600',
  [InvestmentDecisionType.FAIR_INVESTMENT]: 'text-yellow-600',
  [InvestmentDecisionType.POOR_INVESTMENT]: 'text-orange-600',
  [InvestmentDecisionType.AVOID]: 'text-red-600'
}

// ===== UTILITY FUNCTIONS =====

/**
 * Genel skoru kategoriye çevirir
 */
export function getOverallScoreCategory(score: number): string {
  if (score >= 90) return 'Mükemmel'
  if (score >= 80) return 'İyi'
  if (score >= 70) return 'Orta'
  if (score >= 60) return 'Kötü'
  return 'Çok Kötü'
}

/**
 * ROI'yi kategoriye çevirir
 */
export function getROICategory(roi: number): string {
  if (roi >= 15) return 'Mükemmel'
  if (roi >= 10) return 'İyi'
  if (roi >= 5) return 'Orta'
  if (roi >= 0) return 'Kötü'
  return 'Zarar'
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
