/**
 * Admin Service
 * 
 * Admin paneli için API çağrılarını yöneten servis.
 */

import { apiClient } from './apiClient'
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

  const response = await apiClient.get(
    `/api/admin/users?${queryParams.toString()}`
  )
  return response
}

/**
 * Kullanıcı Detayını Getir
 */
export const getUserById = async (userId: number): Promise<any> => {
  const response = await apiClient.get(
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
  const response = await apiClient.put(
    `/api/admin/users/${userId}`,
    payload
  )
  return response
}

/**
 * Kullanıcıyı Sil (Soft Delete)
 */
export const deleteUser = async (userId: number): Promise<any> => {
  const response = await apiClient.delete(`/api/admin/users/${userId}`)
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
  const response = await apiClient.post(
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
  const response = await apiClient.post(
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
  const response = await apiClient.post(
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
  const response = await apiClient.post(
    `/api/admin/users/${userId}/suspend`,
    payload || {}
  )
  return response
}

/**
 * Kullanıcıyı Aktifleştir
 */
export const activateUser = async (userId: number): Promise<any> => {
  const response = await apiClient.post(
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
  const response = await apiClient.delete(
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

  const response = await apiClient.get(
    `/api/admin/reports?${queryParams.toString()}`
  )
  return response
}

/**
 * Rapor Detayını Getir
 */
export const getReportById = async (reportId: number): Promise<any> => {
  const response = await apiClient.get(`/api/admin/reports/${reportId}`)
  return response
}

/**
 * Rapor Durumunu Güncelle
 */
export const updateReportStatus = async (
  reportId: number,
  payload: { status: string; expertNotes?: string }
): Promise<any> => {
  const response = await apiClient.put(
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
  const response = await apiClient.get('/admin/stats')
  return response
}

/**
 * Detaylı İstatistikleri Getir
 */
export const getDetailedStats = async (): Promise<any> => {
  const response = await apiClient.get(
    '/admin/stats/detailed'
  )
  return response
}

/**
 * Zaman Serisi İstatistiklerini Getir
 */
export const getTimelineStats = async (
  days: number = 30
): Promise<any> => {
  const response = await apiClient.get(
    `/api/admin/stats/timeline?days=${days}`
  )
  return response
}

/**
 * Rapor Dağılımını Getir
 */
export const getReportsBreakdown = async (): Promise<any> => {
  const response = await apiClient.get(
    '/admin/stats/reports-breakdown'
  )
  return response
}

// ===== FİYATLANDIRMA =====

/**
 * Servis Fiyatlarını Getir
 */
export const getServicePricing = async (): Promise<any> => {
  const response = await apiClient.get('/admin/pricing')
  return response
}

/**
 * Servis Fiyatlarını Güncelle
 */
export const updateServicePricing = async (payload: {
  pricing: Array<{ id: number; basePrice: number; isActive: boolean }>
}): Promise<any> => {
  const response = await apiClient.put('/admin/pricing', payload)
  return response
}

// ===== SİSTEM AYARLARI =====

/**
 * Sistem Ayarlarını Getir
 */
export const getSystemSettings = async (): Promise<any> => {
  const response = await apiClient.get('/admin/settings')
  return response
}

/**
 * Sistem Ayarlarını Güncelle
 */
export const updateSystemSettings = async (payload: {
  settings: Array<{ settingKey: string; settingValue: string }>
}): Promise<any> => {
  const response = await apiClient.put('/admin/settings', payload)
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
  
  // Pricing
  getServicePricing,
  updateServicePricing,
  
  // Settings
  getSystemSettings,
  updateSystemSettings,
}

