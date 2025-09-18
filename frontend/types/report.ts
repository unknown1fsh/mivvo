// Rapor ile ilgili tipler

export interface ReportType {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  icon: string
  popular?: boolean
}

export interface PaintAnalysisResult {
  overallScore: number
  paintCondition: 'Mükemmel' | 'İyi' | 'Orta' | 'Kötü'
  colorMatch: number
  paintThickness: number
  scratches: number
  dents: number
  rust: boolean
  oxidation: number
  glossLevel: number
  recommendations: string[]
  technicalDetails: {
    primerType: string
    baseCoatType: string
    clearCoatType: string
    uvProtection: boolean
    applicationMethod: string
  }
}

export interface AIAnalysisResults {
  reportId: string
  vehicleInfo: VehicleInfo
  reportType: string
  analysisDate: string
  paintAnalysis: PaintAnalysisResult
  uploadedImages: number
  confidence: number
}

export interface VehicleInfo {
  plate: string
  brand: string
  model: string
  year: number | string
  color: string
  mileage: number | string
}
