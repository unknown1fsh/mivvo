// Boya analizi servisi

import { apiClient } from './apiClient'
import { PaintAnalysisResult, VehicleInfo, UploadedImage } from '@/types'

export interface PaintAnalysisRequest {
  vehicleInfo: VehicleInfo
  images: UploadedImage[]
  analysisType?: 'basic' | 'detailed' | 'professional'
}

export interface PaintAnalysisResponse {
  success: boolean
  data?: PaintAnalysisResult
  error?: string
  reportId?: string
}

export interface AnalysisHistoryItem {
  id: string
  vehicleInfo: VehicleInfo
  analysisDate: string
  overallScore: number
  paintCondition: string
  reportId: string
}

class PaintAnalysisService {
  // Boya analizi başlat
  async startAnalysis(request: PaintAnalysisRequest): Promise<PaintAnalysisResponse> {
    const formData = new FormData()
    
    // Araç bilgilerini ekle
    formData.append('vehicleInfo', JSON.stringify(request.vehicleInfo))
    formData.append('analysisType', request.analysisType || 'detailed')
    
    // Resimleri ekle
    request.images.forEach((image, index) => {
      if (image.file) {
        formData.append(`images`, image.file)
      }
    })

    const response = await apiClient.post<PaintAnalysisResult>('/paint-analysis/analyze', formData, {
      'Content-Type': 'multipart/form-data'
    })
    
    return {
      success: response.success,
      data: response.data,
      error: response.error
    }
  }

  // Analiz sonucunu al
  async getAnalysisResult(reportId: string): Promise<PaintAnalysisResult | null> {
    const response = await apiClient.get<PaintAnalysisResult>(`/paint-analysis/${reportId}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Analiz geçmişini al
  async getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
    const response = await apiClient.get<AnalysisHistoryItem[]>('/paint-analysis/history')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Analiz raporunu indir
  async downloadReport(reportId: string): Promise<Blob | null> {
    try {
      const token = typeof window !== 'undefined' 
        ? localStorage.getItem('auth_token') 
        : null

      const headers: Record<string, string> = {}
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${process.env.NODE_ENV === 'production' 
        ? 'https://mivvo-expertiz.vercel.app/api'
        : 'http://localhost:3001'}/paint-analysis/${reportId}/download`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Report download error:', error)
      return null
    }
  }

  // Analiz raporunu paylaş
  async shareReport(reportId: string, shareOptions: {
    email?: string
    phone?: string
    message?: string
  }): Promise<boolean> {
    const response = await apiClient.post(`/paint-analysis/${reportId}/share`, shareOptions)
    return response.success
  }

  // Analiz raporunu sil
  async deleteReport(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/paint-analysis/${reportId}`)
    return response.success
  }

  // Analiz istatistiklerini al
  async getAnalysisStats(): Promise<{
    totalAnalyses: number
    averageScore: number
    bestScore: number
    worstScore: number
    analysesThisMonth: number
  } | null> {
    const response = await apiClient.get('/paint-analysis/stats')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Analiz türlerini al
  async getAnalysisTypes(): Promise<{
    id: string
    name: string
    description: string
    price: number
    features: string[]
  }[]> {
    const response = await apiClient.get('/paint-analysis/types')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Analiz önizlemesi oluştur
  async createAnalysisPreview(images: UploadedImage[]): Promise<{
    previewId: string
    thumbnail: string
    estimatedScore: number
    estimatedTime: number
  } | null> {
    const formData = new FormData()
    
    images.forEach((image, index) => {
      if (image.file) {
        formData.append(`images`, image.file)
      }
    })

    const response = await apiClient.post('/paint-analysis/preview', formData, {
      'Content-Type': 'multipart/form-data'
    })
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Analiz durumunu kontrol et
  async checkAnalysisStatus(reportId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    estimatedTime?: number
  } | null> {
    const response = await apiClient.get(`/paint-analysis/${reportId}/status`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }
}

export const paintAnalysisService = new PaintAnalysisService()
export default paintAnalysisService
