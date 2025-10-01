import { DamageDetectionService, DamageDetectionResult } from './damageDetectionService'
import { PaintAnalysisService, PaintAnalysisResult as AdvancedPaintAnalysisResult } from './paintAnalysisService'
import { AudioAnalysisService, AudioAnalysisResult } from './audioAnalysisService'
import { SimpleFallbackService } from './simpleFallbackService';

// Legacy arayüzler - frontend ve mevcut controller kodları bu yapıları bekliyor
export interface PaintAnalysisResult {
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor'
  paintThickness: number
  colorMatch: number
  scratches: number
  dents: number
  rust: boolean
  oxidation: number
  glossLevel: number
  overallScore: number
  recommendations: string[]
  confidence: number
  technicalDetails: {
    paintSystem: string
    primerType: string
    baseCoat: string
    clearCoat: string
    totalThickness: number
    colorCode: string
  }
  damageAreas?: {
    x: number
    y: number
    width: number
    height: number
    type: 'scratch' | 'dent' | 'rust' | 'oxidation'
    severity: 'low' | 'medium' | 'high'
    confidence: number
    overallAssessment?: any
  }[]
}

export interface EngineSoundAnalysisResult {
  overallScore: number
  engineHealth: string
  rpmAnalysis: {
    idleRpm: number
    maxRpm: number
    rpmStability: number
  }
  frequencyAnalysis: {
    dominantFrequencies: number[]
    harmonicDistortion: number
    noiseLevel: number
  }
  detectedIssues: {
    issue: string
    severity: 'low' | 'medium' | 'high'
    confidence: number
    description: string
    recommendation: string
  }[]
  performanceMetrics: {
    engineEfficiency: number
    vibrationLevel: number
    acousticQuality: number
  }
  recommendations: string[]
}

export class AIService {
  private static isInitialized = false

  /**
   * Tüm AI servislerini tek seferlik hazırlar
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('[AI] Servisler başlatılıyor...')
      await Promise.all([
        DamageDetectionService.initialize(),
        PaintAnalysisService.initialize(),
        AudioAnalysisService.initialize()
      ])
      this.isInitialized = true
      console.log('[AI] Servisler hazır.')
    } catch (error) {
      console.error('[AI] Servisler başlatılırken hata:', error)
      this.isInitialized = true // Yine de fallback ile devam etmeye çalış
    }
  }

  /**
   * Boya analizi - önce gerçek AI, hata durumunda simple fallback
   */
  static async analyzePaint(imagePath: string, angle: string): Promise<PaintAnalysisResult> {
    await this.initialize()

    try {
      console.log('[AI] Gelişmiş boya analizi başlatılıyor...')
      const advancedResult = await PaintAnalysisService.analyzePaint(imagePath)
      const mapped = this.mapPaintAnalysisResult(advancedResult)
      console.log('[AI] Boya analizi tamamlandı:', {
        provider: advancedResult.aiProvider,
        model: advancedResult.model,
        overallScore: mapped.overallScore
      })
      return mapped
    } catch (error) {
      console.error('[AI] Gelişmiş boya analizi başarısız, fallback devrede:', error)
      return await SimpleFallbackService.analyzePaint(imagePath, angle)
    }
  }

  /**
   * Hasar tespiti - önce gerçek AI, hata durumunda simple fallback
   */
  static async detectDamage(imagePath: string): Promise<DamageDetectionResult> {
    await this.initialize()

    try {
      console.log('[AI] Gelişmiş hasar analizi başlatılıyor...')
      const advancedResult = await DamageDetectionService.detectDamage(imagePath)
      const normalizedAreas = advancedResult.damageAreas.map((area) => ({
        ...area,
        severity: this.normalizeDamageSeverity(area.severity)
      })) as DamageDetectionResult['damageAreas']

      const result: DamageDetectionResult = {
        ...advancedResult,
        damageAreas: normalizedAreas
      }

      console.log('[AI] Hasar analizi tamamlandı:', {
        provider: result.aiProvider,
        model: result.model,
        damageCount: result.damageAreas.length
      })

      return result
    } catch (error) {
      console.error('[AI] Hasar analizi beklenmedik bir hatayla sonuçlandı:', error)
      throw error
    }
  }

  /**
   * Motor sesi analizi - önce gerçek AI, hata durumunda simple fallback
   */
  static async analyzeEngineSound(audioPath: string, vehicleInfo: any): Promise<AudioAnalysisResult> {
    await this.initialize()

    try {
      console.log('[AI] Gelişmiş motor sesi analizi başlatılıyor...')
      const result = await AudioAnalysisService.analyzeEngineSound(audioPath, vehicleInfo)
      console.log('[AI] Motor sesi analizi tamamlandı:', {
        provider: result.aiProvider,
        model: result.model,
        overallScore: result.overallScore
      })
      return result
    } catch (error) {
      console.error('[AI] Gelişmiş motor sesi analizi başarısız, fallback devrede:', error)
      return await SimpleFallbackService.analyzeEngineSound(audioPath, vehicleInfo)
    }
  }

  // --- Yardımcı metotlar ---

  private static mapPaintAnalysisResult(result: AdvancedPaintAnalysisResult): PaintAnalysisResult {
    const recommendations = this.collectPaintRecommendations(result.recommendations)

    return {
      paintCondition: this.mapPaintCondition(result.paintCondition),
      paintThickness: result.surfaceAnalysis?.totalThickness ?? result.surfaceAnalysis?.paintThickness ?? 0,
      colorMatch: result.colorAnalysis?.colorMatch ?? 0,
      scratches: result.damageAssessment?.scratches?.length ?? 0,
      dents: result.damageAssessment?.dents?.length ?? 0,
      rust: (result.damageAssessment?.rust?.length ?? 0) > 0,
      oxidation: this.calculateAverageSeverity(result.damageAssessment?.oxidation),
      glossLevel: result.paintQuality?.glossLevel ?? 0,
      overallScore: result.paintQuality?.overallScore ?? 0,
      recommendations: recommendations.length > 0 ? recommendations : ['Detaylı boya bakımı önerilir'],
      confidence: result.confidence ?? 0,
      technicalDetails: {
        paintSystem: result.technicalDetails?.paintSystem ?? 'Belirtilmedi',
        primerType: result.technicalDetails?.primerType ?? 'Belirtilmedi',
        baseCoat: result.technicalDetails?.baseCoat ?? 'Belirtilmedi',
        clearCoat: result.technicalDetails?.clearCoat ?? 'Belirtilmedi',
        totalThickness: result.surfaceAnalysis?.totalThickness ?? 0,
        colorCode: result.colorAnalysis?.colorCode ?? 'Belirtilmedi'
      }
    }
  }

  private static collectPaintRecommendations(recommendations?: AdvancedPaintAnalysisResult['recommendations']): string[] {
    if (!recommendations) return []

    const groups = [
      recommendations.immediate,
      recommendations.shortTerm,
      recommendations.longTerm,
      recommendations.maintenance,
      recommendations.protection,
      recommendations.restoration,
      recommendations.prevention
    ]

    const flattened = groups
      .filter(Array.isArray)
      .flat()
      .filter((item): item is string => Boolean(item))

    return Array.from(new Set(flattened)).slice(0, 12)
  }

  private static mapPaintCondition(condition: AdvancedPaintAnalysisResult['paintCondition'] | undefined): PaintAnalysisResult['paintCondition'] {
    switch (condition) {
      case 'excellent':
        return 'excellent'
      case 'good':
        return 'good'
      case 'fair':
        return 'fair'
      case 'poor':
      case 'critical':
        return 'poor'
      default:
        return 'good'
    }
  }

  private static calculateAverageSeverity(items?: Array<{ severity: string }>): number {
    if (!items || items.length === 0) return 0

    const severityWeights: Record<string, number> = {
      minimal: 15,
      low: 30,
      medium: 55,
      high: 80,
      critical: 95
    }

    const total = items.reduce((sum, item) => sum + (severityWeights[item.severity] ?? 40), 0)
    return Math.min(100, Math.round(total / items.length))
  }

  private static normalizeDamageSeverity(severity: string | undefined): DamageDetectionResult['damageAreas'][number]['severity'] {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'high'
      case 'medium':
        return 'medium'
      case 'minimal':
      case 'low':
      default:
        return 'low'
    }
  }
}
