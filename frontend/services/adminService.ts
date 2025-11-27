/**
 * Admin Service
 * 
 * Admin paneli için API çağrılarını yöneten servis.
 */

import { apiClient } from './apiClient'

// Admin token'ı al
const getAdminToken = () => {
  return localStorage.getItem('admin_token')
}

// Admin API client - Dynamic base URL
const getApiBaseUrl = () => {
  // Production'da Railway backend URL'ini kullan
  if (typeof window !== 'undefined') {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
    if (apiUrl) {
      return apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`
    }
  }
  
  // Development'ta localhost
  return 'http://localhost:3001'
}

// Admin API client
export const adminApiClient = {
  async get(url: string) {
    const token = getAdminToken()
    const baseUrl = getApiBaseUrl()
    
    const response = await fetch(`${baseUrl}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  async post(url: string, data?: any) {
    const token = getAdminToken()
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  async put(url: string, data?: any) {
    const token = getAdminToken()
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  async patch(url: string, data?: any) {
    const token = getAdminToken()
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  },
  async delete(url: string) {
    const token = getAdminToken()
    const baseUrl = getApiBaseUrl()
    const response = await fetch(`${baseUrl}${url}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response.json()
  }
}
import {
  AdminUsersResponse,
  AdminUserDetailResponse,
  AdminReportsResponse,
  AdminStatsResponse,
  DetailedStatsResponse,
  TimelineStatsResponse,
  ReportsBreakdownResponse,
  AddCreditsPayload,
  ResetCreditsPayload,
  RefundCreditsPayload,
  SuspendUserPayload,
  HardDeleteUserPayload,
  UpdateUserPayload,
  RefundReportPayload,
} from '@/types/admin'

// ===== KULLANICI YÖNETİMİ =====

/**
 * Tüm Kullanıcıları Listele
 */
export const getAllUsers = async (params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
}): Promise<any> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.role) queryParams.append('role', params.role)

  const response = await adminApiClient.get(
    `/api/admin/users?${queryParams.toString()}`
  )
  return response
}

/**
 * Kullanıcı Detayını Getir
 */
export const getUserById = async (userId: number): Promise<any> => {
  const response = await adminApiClient.get(
    `/api/admin/users/${userId}`
  )
  return response
}

/**
 * Kullanıcı Güncelle
 */
export const updateUser = async (
  userId: number,
  payload: UpdateUserPayload
): Promise<any> => {
  const response = await adminApiClient.put(
    `/api/admin/users/${userId}`,
    payload
  )
  return response
}

/**
 * Kullanıcıyı Sil (Soft Delete)
 */
export const deleteUser = async (userId: number): Promise<any> => {
  const response = await adminApiClient.delete(`/api/admin/users/${userId}`)
  return response
}

// ===== KREDİ YÖNETİMİ =====

/**
 * Kullanıcıya Kredi Ekle
 */
export const addUserCredits = async (
  userId: number,
  payload: AddCreditsPayload
): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/admin/users/${userId}/credits/add`,
    payload
  )
  return response
}

/**
 * Kullanıcı Kredilerini Sıfırla
 */
export const resetUserCredits = async (
  userId: number,
  payload?: ResetCreditsPayload
): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/admin/users/${userId}/credits/reset`,
    payload || {}
  )
  return response
}

/**
 * Kullanıcıya Kredi İadesi Yap
 */
export const refundUserCredits = async (
  userId: number,
  payload: RefundCreditsPayload
): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/admin/users/${userId}/credits/refund`,
    payload
  )
  return response
}

// ===== KULLANICI DURUM YÖNETİMİ =====

/**
 * Kullanıcıyı Dondur
 */
export const suspendUser = async (
  userId: number,
  payload?: SuspendUserPayload
): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/admin/users/${userId}/suspend`,
    payload || {}
  )
  return response
}

/**
 * Kullanıcıyı Aktifleştir
 */
export const activateUser = async (userId: number): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/admin/users/${userId}/activate`,
    {}
  )
  return response
}

/**
 * Kullanıcıyı Kalıcı Olarak Sil
 */
export const hardDeleteUser = async (
  userId: number,
  payload: HardDeleteUserPayload
): Promise<any> => {
  const response = await (adminApiClient as any).delete(
    `/api/admin/users/${userId}/hard-delete`,
    { data: payload }
  )
  return response
}

// ===== RAPOR YÖNETİMİ =====

/**
 * Tüm Raporları Listele
 */
export const getAllReports = async (params?: {
  page?: number
  limit?: number
  status?: string
  reportType?: string
}): Promise<any> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.reportType) queryParams.append('reportType', params.reportType)

  const response = await adminApiClient.get(
    `/api/admin/reports?${queryParams.toString()}`
  )
  return response
}

/**
 * Rapor Detayını Getir
 */
export const getReportById = async (reportId: number): Promise<any> => {
  const response = await adminApiClient.get(`/api/admin/reports/${reportId}`)
  return response
}

/**
 * Rapor Durumunu Güncelle
 */
export const updateReportStatus = async (
  reportId: number,
  payload: { status: string; expertNotes?: string }
): Promise<any> => {
  const response = await adminApiClient.put(
    `/api/admin/reports/${reportId}/status`,
    payload
  )
  return response
}

/**
 * Rapor kredisi iadesi (manual)
 */
export const refundReportCredits = async (
  reportId: number,
  payload: RefundReportPayload
): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/admin/reports/${reportId}/refund`,
    payload
  )
  return response
}

// ===== İSTATİSTİKLER =====

/**
 * Sistem İstatistiklerini Getir
 */
export const getSystemStats = async (): Promise<any> => {
  const response = await adminApiClient.get('/api/admin/stats')
  return response
}

/**
 * Detaylı İstatistikleri Getir
 */
export const getDetailedStats = async (): Promise<any> => {
  const response = await adminApiClient.get(
    '/api/admin/stats/detailed'
  )
  return response
}

/**
 * Zaman Serisi İstatistiklerini Getir
 */
export const getTimelineStats = async (
  days: number = 30
): Promise<any> => {
  const response = await adminApiClient.get(
    `/api/admin/stats/timeline?days=${days}`
  )
  return response
}

/**
 * Rapor Dağılımını Getir
 */
export const getReportsBreakdown = async (): Promise<any> => {
  const response = await adminApiClient.get(
    '/api/admin/stats/reports-breakdown'
  )
  return response
}

/**
 * Gerçek Zamanlı İstatistikleri Getir
 */
export const getRealTimeStats = async (): Promise<any> => {
  const response = await adminApiClient.get('/api/admin/stats/realtime')
  return response
}

// ===== FİYATLANDIRMA =====

/**
 * Servis Fiyatlarını Getir
 */
export const getServicePricing = async (): Promise<any> => {
  const response = await adminApiClient.get('/api/admin/pricing')
  return response
}

/**
 * Servis Fiyatlarını Güncelle
 */
export const updateServicePricing = async (payload: {
  pricing: Array<{ id: number; basePrice: number; isActive: boolean }>
}): Promise<any> => {
  const response = await adminApiClient.put('/api/admin/pricing', payload)
  return response
}

// ===== SİSTEM AYARLARI =====

/**
 * Sistem Ayarlarını Getir
 */
export const getSystemSettings = async (): Promise<any> => {
  const response = await adminApiClient.get('/api/admin/settings')
  return response
}

/**
 * Sistem Ayarlarını Güncelle
 */
export const updateSystemSettings = async (payload: {
  settings: Array<{ settingKey: string; settingValue: string }>
}): Promise<any> => {
  const response = await adminApiClient.put('/api/admin/settings', payload)
  return response
}

// ===== RAPOR İSTATİSTİKLERİ VE İZLEME =====

/**
 * Rapor İstatistiklerini Getir
 */
export const getReportStatistics = async (): Promise<any> => {
  const response = await adminApiClient.get('/api/admin/report-statistics')
  return response
}

/**
 * Detaylı Rapor İzleme
 */
export const getReportMonitoring = async (params?: {
  period?: string
  type?: string
  userId?: string
}): Promise<any> => {
  const queryParams = new URLSearchParams()
  if (params?.period) queryParams.append('period', params.period)
  if (params?.type) queryParams.append('type', params.type)
  if (params?.userId) queryParams.append('userId', params.userId)
  
  const response = await adminApiClient.get(
    `/api/admin/report-monitoring?${queryParams.toString()}`
  )
  return response
}

/**
 * Rapor Detayını Getir
 */
export const getReportDetail = async (reportId: number): Promise<any> => {
  const response = await adminApiClient.get(`/api/admin/report-monitoring/${reportId}`)
  return response
}

// ===== DIŞA AKTARMA SİSTEMİ =====

/**
 * CSV Dışa Aktarma
 */
export const exportReportsCSV = async (params?: any): Promise<Blob> => {
  const queryParams = new URLSearchParams()
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
  }
  
  const token = localStorage.getItem('auth_token')
  const response = await fetch(
    `/api/admin/reports/export/csv?${queryParams.toString()}`,
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('CSV dışa aktarma başarısız')
  }
  
  return await response.blob()
}

/**
 * PDF Dışa Aktarma
 */
export const exportReportsPDF = async (params?: any): Promise<Blob> => {
  const queryParams = new URLSearchParams()
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
  }
  
  const token = localStorage.getItem('auth_token')
  const response = await fetch(
    `/api/admin/reports/export/pdf?${queryParams.toString()}`,
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('PDF dışa aktarma başarısız')
  }
  
  return await response.blob()
}

/**
 * Excel Dışa Aktarma (İsteğe Bağlı)
 */
export const exportReportsExcel = async (params?: any): Promise<Blob> => {
  const queryParams = new URLSearchParams()
  if (params) {
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key])
      }
    })
  }
  
  const token = localStorage.getItem('auth_token')
  const response = await fetch(
    `/api/admin/reports/export/excel?${queryParams.toString()}`,
    {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('Excel dışa aktarma başarısız')
  }
  
  return await response.blob()
}

// ===== DESTEK TALEPLERİ YÖNETİMİ =====

/**
 * Tüm Destek Taleplerini Listele
 */
export const getAllSupportTickets = async (params?: {
  page?: number
  limit?: number
  status?: string
  priority?: string
  category?: string
}): Promise<any> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.status) queryParams.append('status', params.status)
  if (params?.priority) queryParams.append('priority', params.priority)
  if (params?.category) queryParams.append('category', params.category)

  const response = await adminApiClient.get(
    `/api/support/admin/tickets?${queryParams.toString()}`
  )
  return response
}

/**
 * Destek Talebi Detayını Getir
 */
export const getSupportTicketById = async (ticketId: number): Promise<any> => {
  const response = await adminApiClient.get(
    `/api/support/tickets/${ticketId}`
  )
  return response
}

/**
 * Destek Talebine Mesaj Ekle (Admin)
 */
export const addMessageToTicket = async (
  ticketId: number,
  message: string,
  attachments?: string
): Promise<any> => {
  const response = await adminApiClient.post(
    `/api/support/tickets/${ticketId}/messages`,
    { message, attachments }
  )
  return response
}

/**
 * Destek Talebi Durumunu Güncelle
 */
export const updateSupportTicketStatus = async (
  ticketId: number,
  status: string
): Promise<any> => {
  const response = await adminApiClient.patch(
    `/api/support/admin/tickets/${ticketId}/status`,
    { status }
  )
  return response
}

/**
 * Destek Talebi Önceliğini Güncelle
 */
export const updateSupportTicketPriority = async (
  ticketId: number,
  priority: string
): Promise<any> => {
  const response = await adminApiClient.patch(
    `/api/support/admin/tickets/${ticketId}/priority`,
    { priority }
  )
  return response
}

export default {
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  
  // Credit Management
  addUserCredits,
  resetUserCredits,
  refundUserCredits,
  
  // User Status
  suspendUser,
  activateUser,
  hardDeleteUser,
  
  // Reports
  getAllReports,
  getReportById,
  updateReportStatus,
  
  // Stats
  getSystemStats,
  getDetailedStats,
  getTimelineStats,
  getReportsBreakdown,
  
  // Report Statistics & Monitoring
  getReportStatistics,
  getReportMonitoring,
  getReportDetail,
  
  // Export System
  exportReportsCSV,
  exportReportsPDF,
  exportReportsExcel,
  
  // Pricing
  getServicePricing,
  updateServicePricing,
  
  // Settings
  getSystemSettings,
  updateSystemSettings,
  
  // Support Tickets
  getAllSupportTickets,
  getSupportTicketById,
  addMessageToTicket,
  updateSupportTicketStatus,
  updateSupportTicketPriority,
}

