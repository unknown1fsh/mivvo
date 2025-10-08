/**
 * Report Service (Rapor Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, rapor yönetimi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Rapor oluşturma
 * - Rapor listeleme
 * - Rapor detayı getirme
 * - Rapor güncelleme
 * - Rapor silme
 * - Rapor PDF indirme
 * - Rapor paylaşma
 * - Rapor istatistikleri
 * - Rapor şablonları
 * - Favori raporlar
 * - Rapor arama
 * 
 * Kullanım:
 * ```typescript
 * import { reportService } from './reportService'
 * 
 * const reports = await reportService.getReports()
 * const report = await reportService.getReport('123')
 * await reportService.downloadReportPDF('123')
 * ```
 */

import { apiClient } from './apiClient'
import { Report, ReportType, VehicleInfo } from '@/types'

// ===== INTERFACES =====

/**
 * Create Report Request
 * 
 * Rapor oluşturma için request interface'i.
 */
export interface CreateReportRequest {
  reportType: string
  vehicleInfo: VehicleInfo
  additionalData?: Record<string, any>
}

/**
 * Report Response
 * 
 * Rapor oluşturma yanıtı.
 */
export interface ReportResponse {
  success: boolean
  data?: Report
  error?: string
  reportId?: string
}

/**
 * Report List Response
 * 
 * Rapor listeleme yanıtı.
 */
export interface ReportListResponse {
  success: boolean
  data?: Report[]
  error?: string
  total?: number
  page?: number
  limit?: number
}

// ===== REPORT SERVICE CLASS =====

/**
 * Report Service Class
 * 
 * Rapor yönetimi işlemlerini yöneten servis.
 */
class ReportService {
  // ===== REPORT CRUD =====

  /**
   * Create Report (Rapor Oluştur)
   * 
   * Yeni rapor oluşturur.
   * 
   * @param request - Rapor bilgileri
   * 
   * @returns ReportResponse
   */
  async createReport(request: CreateReportRequest): Promise<ReportResponse> {
    const response = await apiClient.post<Report>('/api/reports', request)
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      reportId: response.data?.id
    }
  }

  /**
   * Get Reports (Raporları Listele)
   * 
   * Kullanıcının tüm raporlarını listeler.
   * 
   * Özellikler:
   * - Pagination (page, limit)
   * - Filtreleme (type, status)
   * - Sıralama (sortBy, sortOrder)
   * 
   * @param options - Listeleme opsiyonları
   * 
   * @returns ReportListResponse
   */
  async getReports(options: {
    page?: number
    limit?: number
    type?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<ReportListResponse> {
    const queryParams = new URLSearchParams()
    
    if (options.page) queryParams.append('page', options.page.toString())
    if (options.limit) queryParams.append('limit', options.limit.toString())
    if (options.type) queryParams.append('type', options.type)
    if (options.status) queryParams.append('status', options.status)
    if (options.sortBy) queryParams.append('sortBy', options.sortBy)
    if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder)

    const endpoint = `/api/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get<{
      reports: Report[]
      total: number
      page: number
      limit: number
    }>(endpoint)
    
    return {
      success: response.success,
      data: response.data?.reports,
      error: response.error,
      total: response.data?.total,
      page: response.data?.page,
      limit: response.data?.limit
    }
  }

  /**
   * Get Report (Rapor Detayı)
   * 
   * Belirli bir raporun detaylarını getirir.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns Report veya null
   */
  async getReport(reportId: string): Promise<Report | null> {
    const response = await apiClient.get<Report>(`/api/reports/${reportId}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  /**
   * Update Report (Rapor Güncelle)
   * 
   * Rapor bilgilerini günceller.
   * 
   * @param reportId - Rapor ID
   * @param updates - Güncellenecek alanlar
   * 
   * @returns boolean
   */
  async updateReport(reportId: string, updates: Partial<Report>): Promise<boolean> {
    const response = await apiClient.put(`/api/reports/${reportId}`, updates)
    return response.success
  }

  /**
   * Delete Report (Rapor Sil)
   * 
   * Raporu siler.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns boolean
   */
  async deleteReport(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/api/reports/${reportId}`)
    return response.success
  }

  // ===== REPORT DOWNLOAD AND SHARE =====

  /**
   * Download Report PDF (Rapor PDF İndir)
   * 
   * Raporu PDF formatında indirir.
   * 
   * TODO: Backend'de PDF generation eklenmeli
   * 
   * @param reportId - Rapor ID
   * 
   * @returns Blob (PDF dosyası) veya null
   */
  async downloadReportPDF(reportId: string): Promise<Blob | null> {
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
        : 'http://localhost:3001'}/reports/${reportId}/pdf`, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.blob()
    } catch (error) {
      console.error('Report PDF download error:', error)
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
    expiresAt?: string
  }): Promise<boolean> {
    const response = await apiClient.post(`/api/reports/${reportId}/share`, shareOptions)
    return response.success
  }

  // ===== REPORT TYPES AND STATS =====

  /**
   * Get Report Types (Rapor Türleri)
   * 
   * Mevcut rapor türlerini getirir.
   * 
   * @returns ReportType[]
   */
  async getReportTypes(): Promise<ReportType[]> {
    const response = await apiClient.get<ReportType[]>('/api/reports/types')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  /**
   * Get Report Stats (Rapor İstatistikleri)
   * 
   * Rapor istatistiklerini getirir.
   * 
   * @returns İstatistik bilgileri veya null
   */
  async getReportStats(): Promise<{
    totalReports: number
    reportsThisMonth: number
    averageReportValue: number
    reportsByType: Record<string, number>
    reportsByStatus: Record<string, number>
  } | null> {
    const response = await apiClient.get('/api/reports/stats')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // ===== REPORT TEMPLATES =====

  /**
   * Get Report Templates (Rapor Şablonları)
   * 
   * Mevcut rapor şablonlarını getirir.
   * 
   * @returns Şablon listesi
   */
  async getReportTemplates(): Promise<{
    id: string
    name: string
    description: string
    type: string
    template: any
  }[]> {
    const response = await apiClient.get('/api/reports/templates')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  /**
   * Create Report Template (Rapor Şablonu Oluştur)
   * 
   * Yeni rapor şablonu oluşturur.
   * 
   * @param template - Şablon bilgileri
   * 
   * @returns boolean
   */
  async createReportTemplate(template: {
    name: string
    description: string
    type: string
    template: any
  }): Promise<boolean> {
    const response = await apiClient.post('/api/reports/templates', template)
    return response.success
  }

  // ===== FAVORITES =====

  /**
   * Add To Favorites (Favorilere Ekle)
   * 
   * Raporu favorilere ekler.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns boolean
   */
  async addToFavorites(reportId: string): Promise<boolean> {
    const response = await apiClient.post(`/api/reports/${reportId}/favorite`)
    return response.success
  }

  /**
   * Remove From Favorites (Favorilerden Çıkar)
   * 
   * Raporu favorilerden çıkarır.
   * 
   * @param reportId - Rapor ID
   * 
   * @returns boolean
   */
  async removeFromFavorites(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/api/reports/${reportId}/favorite`)
    return response.success
  }

  /**
   * Get Favorite Reports (Favori Raporlar)
   * 
   * Favori raporları getirir.
   * 
   * @returns Report[]
   */
  async getFavoriteReports(): Promise<Report[]> {
    const response = await apiClient.get<Report[]>('/api/reports/favorites')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // ===== SEARCH =====

  /**
   * Search Reports (Rapor Arama)
   * 
   * Raporları arar.
   * 
   * @param query - Arama sorgusu
   * @param filters - Filtre opsiyonları
   * 
   * @returns Report[]
   */
  async searchReports(query: string, filters: {
    type?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  } = {}): Promise<Report[]> {
    const searchParams = new URLSearchParams()
    searchParams.append('q', query)
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) searchParams.append(key, value)
    })

    const response = await apiClient.get<Report[]>(`/api/reports/search?${searchParams.toString()}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const reportService = new ReportService()

/**
 * Default Export
 */
export default reportService
