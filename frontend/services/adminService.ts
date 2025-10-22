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

// Admin API client
export const adminApiClient = {
  async get(url: string) {
    const token = getAdminToken()
    
    const response = await fetch(`http://localhost:3001${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    return data
  },
  async post(url: string, data?: any) {
    const token = getAdminToken()
    return fetch(`http://localhost:3001${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    }).then(res => res.json())
  },
  async put(url: string, data?: any) {
    const token = getAdminToken()
    return fetch(`http://localhost:3001${url}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    }).then(res => res.json())
  },
  async delete(url: string) {
    const token = getAdminToken()
    return fetch(`http://localhost:3001${url}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
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
  const response = await adminApiClient.delete(
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
}

