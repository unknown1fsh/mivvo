/**
 * Paint Analysis Service (Boya Analizi Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, araç boya analizi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Boya analizi yapma (AI ile)
 * - Analiz sonuçlarını getirme
 * - Analiz geçmişi yönetimi
 * - Rapor indirme ve paylaşma
 * - Analiz istatistikleri
 * - Analiz önizlemesi
 * 
 * Özellikler:
 * - OpenAI Vision API entegrasyonu
 * - Boya durumu analizi
 * - Renk eşleşme tespiti
 * - Boya kalitesi değerlendirmesi
 * - Tamir önerileri
 * 
 * Kullanım:
 * ```typescript
 * import { paintAnalysisService } from './paintAnalysisService'
 * 
 * const result = await paintAnalysisService.startAnalysis({
 *   vehicleInfo: { ... },
 *   images: [image1, image2]
 * })
 * ```
 */

import { apiClient } from './apiClient'
import { PaintAnalysisResult, VehicleInfo, UploadedImage } from '@/types'

// ===== INTERFACES =====

/**
 * Paint Analysis Request
 * 
 * Boya analizi için request interface'i.
 */
export interface PaintAnalysisRequest {
  vehicleInfo: VehicleInfo
  images: UploadedImage[]
  analysisType?: 'basic' | 'detailed' | 'professional'
}

/**
 * Paint Analysis Response
 * 
 * Boya analizi yanıtı.
 */
export interface PaintAnalysisResponse {
  success: boolean
  data?: PaintAnalysisResult
  error?: string
  reportId?: string
}

/**
 * Analysis History Item
 * 
 * Analiz geçmişi öğesi.
 */
export interface AnalysisHistoryItem {
  id: string
  vehicleInfo: VehicleInfo
  analysisDate: string
  overallScore: number
  paintCondition: string
  reportId: string
}

// ===== PAINT ANALYSIS SERVICE CLASS =====

/**
 * Paint Analysis Service Class
 * 
 * Boya analizi işlemlerini yöneten servis.
 */
class PaintAnalysisService {
  // ===== ANALYSIS =====

  /**
   * Start Analysis (Analiz Başlat)
   * 
   * Yeni boya analizi başlatır.
   * 
   * İşlem Akışı:
   * 1. FormData oluştur
   * 2. Araç bilgilerini ekle
   * 3. Analiz tipini ekle
   * 4. Görselleri ekle
   * 5. Backend'e gönder
   * 6. AI analizi yap (OpenAI Vision API)
   * 7. Sonuçları döndür
   * 
   * @param request - Analiz bilgileri
   * 
   * @returns PaintAnalysisResponse
   */
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

  /**
   * Get Analysis Result (Analiz Sonucu)
   * 
   * Belirli bir analiz sonucunu getirir.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns PaintAnalysisResult veya null
   */
  async getAnalysisResult(reportId: string): Promise<PaintAnalysisResult | null> {
    const response = await apiClient.get<PaintAnalysisResult>(`/api/paint-analysis/${reportId}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // ===== HISTORY =====

  /**
   * Get Analysis History (Analiz Geçmişi)
   * 
   * Kullanıcının tüm boya analizlerini getirir.
   * 
   * @returns AnalysisHistoryItem[]
   */
  async getAnalysisHistory(): Promise<AnalysisHistoryItem[]> {
    const response = await apiClient.get<AnalysisHistoryItem[]>('/paint-analysis/history')
    
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
        : 'http://localhost:3001'}/api/paint-analysis/${reportId}/download`, {
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
    const response = await apiClient.post(`/api/paint-analysis/${reportId}/share`, shareOptions)
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
    const response = await apiClient.delete(`/api/paint-analysis/${reportId}`)
    return response.success
  }

  // ===== STATS =====

  /**
   * Get Analysis Stats (Analiz İstatistikleri)
   * 
   * Boya analizi istatistiklerini getirir.
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
    const response = await apiClient.get('/paint-analysis/stats')
    
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
    const response = await apiClient.get('/paint-analysis/types')
    
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
   * Özellikler:
   * - Tahmini skor
   * - Tahmini süre
   * - Küçük resim (thumbnail)
   * 
   * @param images - Görseller
   * 
   * @returns Önizleme bilgileri veya null
   */
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
    const response = await apiClient.get(`/api/paint-analysis/${reportId}/status`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const paintAnalysisService = new PaintAnalysisService()

/**
 * Default Export
 */
export default paintAnalysisService
