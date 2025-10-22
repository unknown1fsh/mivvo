/**
 * Ses Analizi Types (Audio Analysis Types)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, motor ses analizi ile ilgili tüm TypeScript tiplerini tanımlar.
 * Backend AudioAnalysisService'den gelen tam analiz sonucu ile %100 uyumlu.
 * 
 * İçerik:
 * - AudioAnalysisResult (Ses Analizi Sonucu)
 * - EngineIssue (Motor Arızası)
 * - RpmAnalysis (RPM Analizi)
 * - SoundQuality (Ses Kalitesi)
 * - PerformanceMetrics (Performans Metrikleri)
 * - Recommendations (Öneriler)
 * - CostEstimate (Maliyet Tahmini)
 * 
 * Kullanım:
 * ```typescript
 * import { AudioAnalysisResult } from '@/types/audioAnalysis'
 * 
 * const result: AudioAnalysisResult = await audioAnalysisService.getReport('123')
 * ```
 */

// ===== SES ANALİZİ SONUCU =====

/**
 * Ses Analizi Sonucu Interface
 * 
 * Backend AudioAnalysisService'den gelen tam analiz sonucu
 */
export interface AudioAnalysisResult {
  /** Genel puan (0-100) */
  overallScore: number
  
  /** Motor sağlığı */
  engineHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  
  /** RPM analizi */
  rpmAnalysis: RpmAnalysis
  
  /** Ses kalitesi */
  soundQuality: SoundQuality
  
  /** Tespit edilen sorunlar */
  detectedIssues: EngineIssue[]
  
  /** Performans metrikleri */
  performanceMetrics: PerformanceMetrics
  
  /** Öneriler */
  recommendations: Recommendations
  
  /** Maliyet tahmini */
  costEstimate: CostEstimate
  
  /** AI sağlayıcı */
  aiProvider: string
  
  /** AI model */
  model: string
  
  /** Güven seviyesi (0-100) */
  confidence: number
  
  /** Analiz zamanı (ISO) */
  analysisTimestamp: string
}

// ===== RPM ANALİZİ =====

/**
 * RPM Analizi Interface
 * 
 * Motor devir analizi
 */
export interface RpmAnalysis {
  /** Rölanti devri */
  idleRpm: number
  
  /** Maximum devir */
  maxRpm: number
  
  /** Devir stabilitesi (%) */
  rpmStability: number
  
  /** Devir tepkisi (%) */
  rpmResponse: number
  
  /** Rölanti kalitesi açıklaması */
  idleQuality: string
}

// ===== SES KALİTESİ =====

/**
 * Ses Kalitesi Interface
 * 
 * Motor ses kalitesi metrikleri
 */
export interface SoundQuality {
  /** Genel kalite (0-100) */
  overallQuality: number
  
  /** Netlik (0-100) */
  clarity: number
  
  /** Pürüzsüzlük (0-100) */
  smoothness: number
  
  /** Tutarlılık (0-100) */
  consistency: number
  
  /** Ses imzası açıklaması */
  soundSignature: string
}

// ===== MOTOR ARIZASI =====

/**
 * Motor Arızası Interface
 * 
 * Tespit edilen her arıza için detaylı bilgi
 */
export interface EngineIssue {
  /** Benzersiz arıza ID'si */
  id: string
  
  /** Arıza tipi */
  type: string
  
  /** Şiddet seviyesi */
  severity: 'minimal' | 'low' | 'medium' | 'high' | 'critical'
  
  /** Güven seviyesi (0-100) */
  confidence: number
  
  /** Detaylı açıklama */
  description: string
  
  /** Semptomlar listesi */
  symptoms: string[]
  
  /** Olası nedenler */
  possibleCauses: string[]
  
  /** Aciliyet */
  urgency: 'immediate' | 'urgent' | 'normal' | 'low'
  
  /** Tahmini onarım maliyeti (TL) */
  estimatedRepairCost: number
  
  /** Tahmini onarım süresi (saat) */
  estimatedRepairTime: number
  
  /** Önerilen aksiyonlar */
  recommendedActions: string[]
}

// ===== PERFORMANS METRİKLERİ =====

/**
 * Performans Metrikleri Interface
 * 
 * Motor performans değerlendirmesi
 */
export interface PerformanceMetrics {
  /** Motor verimliliği (%) */
  engineEfficiency: number
  
  /** Yakıt verimliliği (%) */
  fuelEfficiency: number
  
  /** Genel performans (%) */
  overallPerformance: number
  
  /** Performans notu */
  performanceGrade: string
}

// ===== ÖNERİLER =====

/**
 * Öneriler Interface
 * 
 * Bakım ve iyileştirme önerileri
 */
export interface Recommendations {
  /** Acil öneriler */
  immediate: string[]
  
  /** Kısa vadeli öneriler */
  shortTerm: string[]
  
  /** Uzun vadeli öneriler */
  longTerm: string[]
  
  /** Bakım önerileri */
  maintenance: string[]
}

// ===== MALİYET TAHMİNİ =====

/**
 * Maliyet Tahmini Interface
 * 
 * Onarım maliyetleri
 */
export interface CostEstimate {
  /** Toplam maliyet (TL) */
  totalCost: number
  
  /** Maliyet detayı */
  breakdown: {
    /** Kategori */
    category: string
    /** Maliyet (TL) */
    cost: number
    /** Açıklama */
    description: string
  }[]
}

// ===== FREKANS ANALİZİ =====

/**
 * Frekans Analizi Interface
 * 
 * Ses frekans analizi (backend'den gelen ek veriler)
 */
export interface FrequencyAnalysis {
  /** Baskın frekanslar (Hz) */
  dominantFrequencies: number[]
  
  /** Harmonik distorsiyon (%) */
  harmonicDistortion: number
  
  /** Gürültü seviyesi (dB) */
  noiseLevel: number
}

/**
 * Akustik Özellikler Interface
 * 
 * Ses dosyası akustik özellikleri
 */
export interface AcousticFeatures {
  /** Süre (saniye) */
  durationSec: number
  
  /** RMS değeri */
  rms: number
  
  /** Sıfır geçiş oranı */
  zeroCrossingRate: number
  
  /** Baskın frekans (Hz) */
  dominantFrequencyHz: number
}

// ===== ENUMS VE CONSTANTS =====

/**
 * Motor Sağlığı Enum
 */
export enum EngineHealth {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical'
}

/**
 * Motor Sağlığı Açıklamaları
 */
export const EngineHealthDescriptions: Record<EngineHealth, string> = {
  [EngineHealth.EXCELLENT]: 'Mükemmel',
  [EngineHealth.GOOD]: 'İyi',
  [EngineHealth.FAIR]: 'Orta',
  [EngineHealth.POOR]: 'Kötü',
  [EngineHealth.CRITICAL]: 'Kritik'
}

/**
 * Motor Sağlığı Renkleri
 */
export const EngineHealthColors: Record<EngineHealth, string> = {
  [EngineHealth.EXCELLENT]: 'text-green-600',
  [EngineHealth.GOOD]: 'text-blue-600',
  [EngineHealth.FAIR]: 'text-yellow-600',
  [EngineHealth.POOR]: 'text-orange-600',
  [EngineHealth.CRITICAL]: 'text-red-600'
}

/**
 * Motor Sağlığı Arka Plan Renkleri
 */
export const EngineHealthBgColors: Record<EngineHealth, string> = {
  [EngineHealth.EXCELLENT]: 'bg-green-100',
  [EngineHealth.GOOD]: 'bg-blue-100',
  [EngineHealth.FAIR]: 'bg-yellow-100',
  [EngineHealth.POOR]: 'bg-orange-100',
  [EngineHealth.CRITICAL]: 'bg-red-100'
}

/**
 * Arıza Şiddeti Enum
 */
export enum IssueSeverity {
  MINIMAL = 'minimal',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Arıza Şiddeti Açıklamaları
 */
export const IssueSeverityDescriptions: Record<IssueSeverity, string> = {
  [IssueSeverity.MINIMAL]: 'Minimal',
  [IssueSeverity.LOW]: 'Düşük',
  [IssueSeverity.MEDIUM]: 'Orta',
  [IssueSeverity.HIGH]: 'Yüksek',
  [IssueSeverity.CRITICAL]: 'Kritik'
}

/**
 * Arıza Şiddeti Renkleri
 */
export const IssueSeverityColors: Record<IssueSeverity, string> = {
  [IssueSeverity.MINIMAL]: 'text-gray-600',
  [IssueSeverity.LOW]: 'text-blue-600',
  [IssueSeverity.MEDIUM]: 'text-yellow-600',
  [IssueSeverity.HIGH]: 'text-orange-600',
  [IssueSeverity.CRITICAL]: 'text-red-600'
}

/**
 * Aciliyet Enum
 */
export enum Urgency {
  IMMEDIATE = 'immediate',
  URGENT = 'urgent',
  NORMAL = 'normal',
  LOW = 'low'
}

/**
 * Aciliyet Açıklamaları
 */
export const UrgencyDescriptions: Record<Urgency, string> = {
  [Urgency.IMMEDIATE]: 'Acil',
  [Urgency.URGENT]: 'Acil',
  [Urgency.NORMAL]: 'Normal',
  [Urgency.LOW]: 'Düşük'
}

/**
 * Aciliyet Renkleri
 */
export const UrgencyColors: Record<Urgency, string> = {
  [Urgency.IMMEDIATE]: 'text-red-600',
  [Urgency.URGENT]: 'text-red-600',
  [Urgency.NORMAL]: 'text-blue-600',
  [Urgency.LOW]: 'text-gray-600'
}

// ===== UTILITY FUNCTIONS =====

/**
 * RPM değerini kategoriye çevirir
 */
export function getRpmCategory(rpm: number): string {
  if (rpm < 600) return 'Çok Düşük'
  if (rpm < 800) return 'Düşük'
  if (rpm < 1000) return 'Normal'
  if (rpm < 1200) return 'Yüksek'
  return 'Çok Yüksek'
}

/**
 * Ses kalitesi skorunu kategoriye çevirir
 */
export function getSoundQualityCategory(score: number): string {
  if (score >= 90) return 'Mükemmel'
  if (score >= 80) return 'İyi'
  if (score >= 70) return 'Orta'
  if (score >= 60) return 'Kötü'
  return 'Çok Kötü'
}

/**
 * Performans skorunu kategoriye çevirir
 */
export function getPerformanceCategory(score: number): string {
  if (score >= 90) return 'Mükemmel'
  if (score >= 80) return 'İyi'
  if (score >= 70) return 'Orta'
  if (score >= 60) return 'Kötü'
  return 'Çok Kötü'
}
