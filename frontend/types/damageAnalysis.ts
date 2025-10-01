export type DamageSeverityLevel = 'low' | 'medium' | 'high' | 'critical'

export interface DamageAnalysisImageArea {
  x: number
  y: number
  width: number
  height: number
  type: 'scratch' | 'dent' | 'rust' | 'oxidation' | 'crack' | 'break'
  severity: 'low' | 'medium' | 'high'
  confidence: number
  description: string
  estimatedRepairCost: number
}

export interface DamageAnalysisImage {
  angle: string
  damageAreas: DamageAnalysisImageArea[]
  totalDamageScore: number
  recommendations: string[]
}

export interface DamageAnalysisSummary {
  totalDamages: number
  criticalDamages: number
  estimatedRepairCost: number
  insuranceImpact: string
  safetyConcerns: string[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  marketValueImpact: number
}

export interface DamageAnalysisTechnicalDetails {
  analysisMethod: string
  aiModel: string
  confidence: number
  processingTime: string
  imageQuality: string
}

export interface DamageAnalysisReportData {
  id: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    plate: string
  }
  overallScore: number
  damageSeverity: DamageSeverityLevel
  analysisDate: string
  images: DamageAnalysisImage[]
  summary: DamageAnalysisSummary
  technicalDetails: DamageAnalysisTechnicalDetails
}
