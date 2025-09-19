// Motor sesi analizi servisi

import { apiClient } from './apiClient'
import { EngineSoundAnalysisResult, VehicleInfo, UploadedAudio } from '@/types'

export interface EngineSoundAnalysisRequest {
  vehicleInfo: VehicleInfo
  audioFiles: UploadedAudio[]
  analysisType?: 'basic' | 'detailed' | 'professional'
}

export interface EngineSoundAnalysisResponse {
  success: boolean
  data?: EngineSoundAnalysisResult
  error?: string
  reportId?: string
}

export interface EngineSoundAnalysisHistoryItem {
  id: string
  vehicleInfo: VehicleInfo
  analysisDate: string
  overallScore: number
  engineHealth: string
  reportId: string
}

class EngineSoundAnalysisService {
  // Motor sesi analizi başlat
  async startAnalysis(request: EngineSoundAnalysisRequest): Promise<EngineSoundAnalysisResponse> {
    const formData = new FormData()
    
    // Araç bilgilerini ekle
    formData.append('vehicleInfo', JSON.stringify(request.vehicleInfo))
    formData.append('analysisType', request.analysisType || 'detailed')
    
    // Ses dosyalarını ekle
    request.audioFiles.forEach((audio, index) => {
      if (audio.file) {
        formData.append(`audioFiles`, audio.file)
      }
    })

    const response = await apiClient.post<EngineSoundAnalysisResult>('/engine-sound-analysis/analyze', formData, {
      'Content-Type': 'multipart/form-data'
    })
    
    return {
      success: response.success,
      data: response.data,
      error: response.error
    }
  }

  // Analiz sonucunu al
  async getAnalysisResult(reportId: string): Promise<EngineSoundAnalysisResult | null> {
    const response = await apiClient.get<EngineSoundAnalysisResult>(`/engine-sound-analysis/${reportId}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Analiz geçmişini al
  async getAnalysisHistory(): Promise<EngineSoundAnalysisHistoryItem[]> {
    const response = await apiClient.get<EngineSoundAnalysisHistoryItem[]>('/engine-sound-analysis/history')
    
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
        : 'http://localhost:3001'}/engine-sound-analysis/${reportId}/download`, {
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
    const response = await apiClient.post(`/engine-sound-analysis/${reportId}/share`, shareOptions)
    return response.success
  }

  // Analiz raporunu sil
  async deleteReport(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/engine-sound-analysis/${reportId}`)
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
    const response = await apiClient.get('/engine-sound-analysis/stats')
    
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
    const response = await apiClient.get('/engine-sound-analysis/types')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Analiz önizlemesi oluştur
  async createAnalysisPreview(audioFiles: UploadedAudio[]): Promise<{
    previewId: string
    estimatedScore: number
    estimatedTime: number
    detectedIssues: string[]
  } | null> {
    const formData = new FormData()
    
    audioFiles.forEach((audio, index) => {
      if (audio.file) {
        formData.append(`audioFiles`, audio.file)
      }
    })

    const response = await apiClient.post('/engine-sound-analysis/preview', formData, {
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
    const response = await apiClient.get(`/engine-sound-analysis/${reportId}/status`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Ses dosyası kalitesini kontrol et
  async validateAudioQuality(audioFile: File): Promise<{
    isValid: boolean
    quality: 'excellent' | 'good' | 'fair' | 'poor'
    issues: string[]
    recommendations: string[]
  }> {
    // Temel ses dosyası validasyonu
    const issues: string[] = []
    const recommendations: string[] = []
    
    // Dosya boyutu kontrolü (max 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      issues.push('Dosya boyutu çok büyük')
      recommendations.push('Dosya boyutunu küçültün')
    }
    
    // Dosya formatı kontrolü
    const allowedFormats = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg']
    if (!allowedFormats.includes(audioFile.type)) {
      issues.push('Desteklenmeyen ses formatı')
      recommendations.push('WAV, MP3 veya OGG formatında kayıt yapın')
    }
    
    // Minimum süre kontrolü (5 saniye)
    // Bu gerçek uygulamada MediaRecorder API ile kontrol edilebilir
    
    let quality: 'excellent' | 'good' | 'fair' | 'poor' = 'good'
    if (issues.length === 0) {
      quality = 'excellent'
    } else if (issues.length <= 2) {
      quality = 'fair'
    } else {
      quality = 'poor'
    }
    
    return {
      isValid: issues.length === 0,
      quality,
      issues,
      recommendations
    }
  }
}

export const engineSoundAnalysisService = new EngineSoundAnalysisService()
export default engineSoundAnalysisService
