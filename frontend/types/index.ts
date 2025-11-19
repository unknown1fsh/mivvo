/**
 * Types Index (Tipler İndeksi)
 * 
 * Clean Architecture - Type Layer (Tip Katmanı)
 * 
 * Bu dosya, tüm TypeScript tiplerini merkezileştirir.
 * 
 * Özellikler:
 * - Tüm tipleri tek yerden export eder
 * - Named export kullanır
 * - Clean import structure sağlar
 * - Type organization (kategorilere göre)
 * 
 * Kullanım:
 * ```typescript
 * // Tekli import
 * import { User, Vehicle } from '@/types'
 * 
 * // Çoklu import
 * import {
 *   LoginCredentials,
 *   RegisterData,
 *   VehicleInfo,
 *   Report
 * } from '@/types'
 * 
 * // Tüm kategoriden import
 * import * as Types from '@/types'
 * ```
 * 
 * Tip Kategorileri:
 * - common: Ortak tipler (Step, ApiResponse, LoadingState, FormField)
 * - user: Kullanıcı tipleri (User, LoginCredentials, RegisterData, UserSettings, UserProfile)
 * - vehicle: Araç tipleri (Vehicle, VehicleInfo, VehicleGarage, UploadedImage, UploadedAudio, etc.)
 * - report: Rapor tipleri (Report, ReportType, AIAnalysisResults)
 * - damageAnalysis: Hasar analizi tipleri (DamageAnalysisReportData, DamageSeverityLevel, etc.)
 */

// ===== REPORT TYPES =====

/**
 * Rapor Tipleri
 * 
 * Rapor ile ilgili tüm tipler.
 */
export * from './report'

// ===== VEHICLE TYPES =====

/**
 * Araç Tipleri
 * 
 * Araç, garaj, görseller, sesler, analizler ile ilgili tüm tipler.
 */
export * from './vehicle'

// ===== USER TYPES =====

/**
 * Kullanıcı Tipleri
 * 
 * Kullanıcı, giriş, kayıt, profil, ayarlar ile ilgili tüm tipler.
 */
export * from './user'

// ===== COMMON TYPES =====

/**
 * Ortak Tipler
 * 
 * Uygulama genelinde kullanılan ortak tipler.
 */
export * from './common'

// ===== DAMAGE ANALYSIS TYPES =====

/**
 * Hasar Analizi Tipleri
 * 
 * Hasar analizi raporları ile ilgili tüm tipler.
 */
export * from './damageAnalysis'

// ===== PAINT ANALYSIS TYPES =====

/**
 * Boya Analizi Tipleri
 * 
 * Boya analizi raporları ile ilgili tüm tipler.
 */
export * from './paintAnalysis'
// Note: PaintAnalysisResult is also exported from './vehicle' - using the one from paintAnalysis

// ===== AUDIO ANALYSIS TYPES =====

/**
 * Ses Analizi Tipleri
 * 
 * Ses analizi raporları ile ilgili tüm tipler.
 */
export * from './audioAnalysis'

// ===== VALUE ESTIMATION TYPES =====

/**
 * Değer Tahmini Tipleri
 * 
 * Değer tahmini raporları ile ilgili tüm tipler.
 */
export * from './valueEstimation'

// ===== COMPREHENSIVE EXPERTISE TYPES =====

/**
 * Kapsamlı Ekspertiz Tipleri
 * 
 * Kapsamlı ekspertiz raporları ile ilgili tüm tipler.
 * Note: getLiquidityCategory is exported from valueEstimation, not from comprehensiveExpertise
 */
export {
  ExpertiseGrade,
  ExpertRecommendation,
  InvestmentDecisionType,
  ExpertiseGradeDescriptions,
  ExpertiseGradeColors,
  ExpertiseGradeBgColors,
  ExpertRecommendationDescriptions,
  ExpertRecommendationColors,
  InvestmentDecisionDescriptions,
  InvestmentDecisionColors,
  getOverallScoreCategory,
  getROICategory,
  getComprehensiveLiquidityCategory,
  // Don't export getLiquidityCategory to avoid conflict with valueEstimation
} from './comprehensiveExpertise'
export type {
  ComprehensiveExpertiseResult,
  ComprehensiveSummary,
  ExpertOpinion,
  FinalRecommendations,
  InvestmentDecision,
} from './comprehensiveExpertise'