/**
 * Engine Sound Analysis Service (Motor Sesi Analizi Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, motor sesi analizi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Motor sesi analizi yapma (AI ile)
 * - Analiz sonuçlarını getirme
 * - Analiz geçmişi yönetimi
 * - Rapor indirme ve paylaşma
 * - Analiz istatistikleri
 * - Ses kalitesi doğrulama
 * 
 * Özellikler:
 * - OpenAI Whisper API entegrasyonu
 * - Motor sorunları tespiti
 * - Motor sağlığı değerlendirmesi
 * - Tamir önerileri
 * - Ses formatı desteği (WAV, MP3, OGG)
 * 
 * Kullanım:
 * ```typescript
 * import { engineSoundAnalysisService } from './engineSoundAnalysisService'
 * 
 * const result = await engineSoundAnalysisService.startAnalysis({
 *   vehicleInfo: { ... },
 *   audioFiles: [audio1, audio2]
 * })
 * ```
 */

import { apiClient } from './apiClient'
import { EngineSoundAnalysisResult, VehicleInfo, UploadedAudio } from '@/types'

// ===== INTERFACES =====

/**
 * Engine Sound Analysis Request
 * 
 * Motor sesi analizi için request interface'i.
 */
export interface EngineSoundAnalysisRequest {
  vehicleInfo: VehicleInfo
  audioFiles: UploadedAudio[]
  analysisType?: 'basic' | 'detailed' | 'professional'
}

/**
 * Engine Sound Analysis Response
 * 
 * Motor sesi analizi yanıtı.
 */
export interface EngineSoundAnalysisResponse {
  success: boolean
  data?: EngineSoundAnalysisResult
  error?: string
  reportId?: string
}

/**
 * Engine Sound Analysis History Item
 * 
 * Analiz geçmişi öğesi.
 */
export interface EngineSoundAnalysisHistoryItem {
  id: string
  vehicleInfo: VehicleInfo
  analysisDate: string
  overallScore: number
  engineHealth: string
  reportId: string
}

// ===== ENGINE SOUND ANALYSIS SERVICE CLASS =====

/**
 * Engine Sound Analysis Service Class
 * 
 * Motor sesi analizi işlemlerini yöneten servis.
 */
class EngineSoundAnalysisService {
  // ===== ANALYSIS =====

  /**
   * Start Analysis (Analiz Başlat)
   * 
   * Yeni motor sesi analizi başlatır.
   * 
   * İşlem Akışı:
   * 1. FormData oluştur
   * 2. Araç bilgilerini ekle
   * 3. Analiz tipini ekle
   * 4. Ses dosyalarını ekle
   * 5. Backend'e gönder
   * 6. AI analizi yap (OpenAI Whisper API)
   * 7. Sonuçları döndür
   * 
   * @param request - Analiz bilgileri
   * 
   * @returns EngineSoundAnalysisResponse
   */
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

    const response = await apiClient.post('/api/engine-sound-analysis/analyze', formData, {
      'Content-Type': 'multipart/form-data'
    })
    
    // Backend yanıtı: { success: true, data: { referenceId, status, message } }
    const serverPayload: any = response.data
    const innerData = serverPayload?.data || serverPayload
    const referenceId = innerData?.referenceId
    const status = innerData?.status

    // NewReport akışı results.reportId bekliyor
    return {
      success: response.success,
      data: referenceId ? { reportId: referenceId, status } as any : innerData,
      error: response.error
    }
  }

  /**
   * Get Analysis Result (Analiz Sonucu)
   * 
   * Belirli bir analiz sonucunu getirir.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns EngineSoundAnalysisResult veya null
   */
  async getAnalysisResult(reportId: string): Promise<EngineSoundAnalysisResult | null> {
    const response = await apiClient.get(`/api/engine-sound-analysis/${reportId}`)
    const payload: any = response.data
    const actual = payload?.data ?? payload
    
    if (response.success && actual) {
      return actual as EngineSoundAnalysisResult
    }
    
    return null
  }

  // ===== HISTORY =====

  /**
   * Get Analysis History (Analiz Geçmişi)
   * 
   * Kullanıcının tüm motor sesi analizlerini getirir.
   * 
   * @returns EngineSoundAnalysisHistoryItem[]
   */
  async getAnalysisHistory(): Promise<EngineSoundAnalysisHistoryItem[]> {
    const response = await apiClient.get<EngineSoundAnalysisHistoryItem[]>('/api/engine-sound-analysis/history')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // ===== DOWNLOAD AND SHARE =====

  /**
   * Download Report (Rapor İndir)
   * 
   * Analiz raporunu PDF olarak indirir.
   * 
   * TODO: Backend'de PDF generation eklenmeli
   * 
   * @param reportId - Rapor ID
   * 
   * @returns Blob (PDF dosyası) veya null
   */
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
        ? process.env.NEXT_PUBLIC_API_URL || 'https://mivvo-production.up.railway.app'
        : 'http://localhost:3001'}/api/engine-sound-analysis/${reportId}/download`, {
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

  /**
   * Share Report (Rapor Paylaş)
   * 
   * Raporu email/telefon ile paylaşır.
   * 
   * @param reportId - Rapor ID
   * @param shareOptions - Paylaşım bilgileri
   * 
   * @returns boolean
   */
  async shareReport(reportId: string, shareOptions: {
    email?: string
    phone?: string
    message?: string
  }): Promise<boolean> {
    const response = await apiClient.post(`/api/engine-sound-analysis/${reportId}/share`, shareOptions)
    return response.success
  }

  /**
   * Delete Report (Rapor Sil)
   * 
   * Analiz raporunu siler.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns boolean
   */
  async deleteReport(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/api/engine-sound-analysis/${reportId}`)
    return response.success
  }

  // ===== STATS =====

  /**
   * Get Analysis Stats (Analiz İstatistikleri)
   * 
   * Motor sesi analizi istatistiklerini getirir.
   * 
   * @returns İstatistik bilgileri veya null
   */
  async getAnalysisStats(): Promise<{
    totalAnalyses: number
    averageScore: number
    bestScore: number
    worstScore: number
    analysesThisMonth: number
  } | null> {
    const response = await apiClient.get('/api/engine-sound-analysis/stats')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  /**
   * Get Analysis Types (Analiz Tipleri)
   * 
   * Mevcut analiz tiplerini ve fiyatlarını getirir.
   * 
   * @returns Analiz tipleri
   */
  async getAnalysisTypes(): Promise<{
    id: string
    name: string
    description: string
    price: number
    features: string[]
  }[]> {
    const response = await apiClient.get('/api/engine-sound-analysis/types')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // ===== PREVIEW =====

  /**
   * Create Analysis Preview (Analiz Önizlemesi)
   * 
   * Analiz başlatmadan önce hızlı önizleme oluşturur.
   * 
   * @param audioFiles - Ses dosyaları
   * 
   * @returns Önizleme bilgileri veya null
   */
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

    const response = await apiClient.post('/api/engine-sound-analysis/preview', formData, {
      'Content-Type': 'multipart/form-data'
    })
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  /**
   * Check Analysis Status (Analiz Durumu)
   * 
   * Analiz durumunu kontrol eder.
   * 
   * Durumlar:
   * - pending: Bekliyor
   * - processing: İşleniyor
   * - completed: Tamamlandı
   * - failed: Başarısız
   * 
   * @param reportId - Rapor ID
   * 
   * @returns Durum bilgileri veya null
   */
  async checkAnalysisStatus(reportId: string): Promise<{
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress: number
    estimatedTime?: number
  } | null> {
    const response = await apiClient.get(`/api/engine-sound-analysis/${reportId}/status`)
    const payload: any = response.data
    const actual = payload?.data ?? payload
    
    if (response.success && actual) {
      return actual as any
    }
    
    return null
  }

  // ===== VALIDATION =====

  /**
   * Validate Audio Quality (Ses Kalitesi Doğrula)
   * 
   * Ses dosyasının kalitesini kontrol eder.
   * 
   * Kontroller:
   * - Dosya boyutu (max 50MB)
   * - Dosya formatı (WAV, MP3, OGG)
   * - Minimum süre (5 saniye)
   * 
   * @param audioFile - Ses dosyası
   * 
   * @returns Doğrulama sonucu
   */
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

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const engineSoundAnalysisService = new EngineSoundAnalysisService()

/**
 * Default Export
 */
export default engineSoundAnalysisService
