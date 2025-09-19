// Rapor ile ilgili tipler

import { VehicleInfo, PaintAnalysisResult, EngineSoundAnalysisResult } from './vehicle'

export interface Report {
  id: string
  type: string
  vehicleInfo: VehicleInfo
  createdAt: Date
  updatedAt: Date
  status: 'pending' | 'completed' | 'failed'
  data?: any
}

export interface ReportType {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  icon: string
  popular?: boolean
}

export interface AIAnalysisResults {
  reportId: string
  vehicleInfo: VehicleInfo
  reportType: string
  analysisDate: string
  paintAnalysis?: PaintAnalysisResult
  engineSoundAnalysis?: EngineSoundAnalysisResult
  uploadedImages: number
  uploadedAudios: number
  confidence: number
}
