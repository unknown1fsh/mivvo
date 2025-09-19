// Rapor servisi

import { apiClient } from './apiClient'
import { Report, ReportType, VehicleInfo } from '@/types'

export interface CreateReportRequest {
  reportType: string
  vehicleInfo: VehicleInfo
  additionalData?: Record<string, any>
}

export interface ReportResponse {
  success: boolean
  data?: Report
  error?: string
  reportId?: string
}

export interface ReportListResponse {
  success: boolean
  data?: Report[]
  error?: string
  total?: number
  page?: number
  limit?: number
}

class ReportService {
  // Rapor oluştur
  async createReport(request: CreateReportRequest): Promise<ReportResponse> {
    const response = await apiClient.post<Report>('/reports', request)
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      reportId: response.data?.id
    }
  }

  // Raporları listele
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

    const endpoint = `/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
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

  // Rapor detayını al
  async getReport(reportId: string): Promise<Report | null> {
    const response = await apiClient.get<Report>(`/reports/${reportId}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Raporu güncelle
  async updateReport(reportId: string, updates: Partial<Report>): Promise<boolean> {
    const response = await apiClient.put(`/reports/${reportId}`, updates)
    return response.success
  }

  // Raporu sil
  async deleteReport(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/reports/${reportId}`)
    return response.success
  }

  // Rapor PDF'ini indir
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

  // Raporu paylaş
  async shareReport(reportId: string, shareOptions: {
    email?: string
    phone?: string
    message?: string
    expiresAt?: string
  }): Promise<boolean> {
    const response = await apiClient.post(`/reports/${reportId}/share`, shareOptions)
    return response.success
  }

  // Rapor türlerini al
  async getReportTypes(): Promise<ReportType[]> {
    const response = await apiClient.get<ReportType[]>('/reports/types')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Rapor istatistiklerini al
  async getReportStats(): Promise<{
    totalReports: number
    reportsThisMonth: number
    averageReportValue: number
    reportsByType: Record<string, number>
    reportsByStatus: Record<string, number>
  } | null> {
    const response = await apiClient.get('/reports/stats')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Rapor şablonlarını al
  async getReportTemplates(): Promise<{
    id: string
    name: string
    description: string
    type: string
    template: any
  }[]> {
    const response = await apiClient.get('/reports/templates')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Rapor şablonu oluştur
  async createReportTemplate(template: {
    name: string
    description: string
    type: string
    template: any
  }): Promise<boolean> {
    const response = await apiClient.post('/reports/templates', template)
    return response.success
  }

  // Raporu favorilere ekle
  async addToFavorites(reportId: string): Promise<boolean> {
    const response = await apiClient.post(`/reports/${reportId}/favorite`)
    return response.success
  }

  // Raporu favorilerden çıkar
  async removeFromFavorites(reportId: string): Promise<boolean> {
    const response = await apiClient.delete(`/reports/${reportId}/favorite`)
    return response.success
  }

  // Favori raporları al
  async getFavoriteReports(): Promise<Report[]> {
    const response = await apiClient.get<Report[]>('/reports/favorites')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Rapor arama
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

    const response = await apiClient.get<Report[]>(`/reports/search?${searchParams.toString()}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }
}

export const reportService = new ReportService()
export default reportService
