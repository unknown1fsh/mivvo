/**
 * User Service (Kullanıcı Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, kullanıcı yönetimi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Kullanıcı profil yönetimi
 * - Kullanıcı ayarları
 * - Şifre değiştirme
 * - Kullanıcı istatistikleri
 * - Kullanıcı aktiviteleri
 * - Kredi yönetimi
 * - Bildirim yönetimi
 * - Hesap yönetimi
 * 
 * Kullanım:
 * ```typescript
 * import { userService } from './userService'
 * 
 * const profile = await userService.getProfile()
 * await userService.updateProfile({ firstName: 'John' })
 * const credits = await userService.getUserCredits()
 * ```
 */

import { apiClient } from './apiClient'
import { User, UserProfile, UserSettings } from '@/types'

// ===== INTERFACES =====

/**
 * Update Profile Request
 * 
 * Profil güncelleme için request interface'i.
 */
export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  avatar?: File
}

/**
 * Update Settings Request
 * 
 * Ayarlar güncelleme için request interface'i.
 */
export interface UpdateSettingsRequest {
  notifications?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy?: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showPhone: boolean
  }
  preferences?: {
    language: string
    timezone: string
    currency: string
  }
}

/**
 * Change Password Request
 * 
 * Şifre değiştirme için request interface'i.
 */
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * User Stats
 * 
 * Kullanıcı istatistikleri.
 */
export interface UserStats {
  totalReports: number
  totalVINLookups: number
  totalPaintAnalyses: number
  memberSince: string
  lastLogin: string
  credits: number
}

// ===== USER SERVICE CLASS =====

/**
 * User Service Class
 * 
 * Kullanıcı yönetimi işlemlerini yöneten servis.
 */
class UserService {
  // ===== PROFILE MANAGEMENT =====

  /**
   * Get Profile (Profil Getir)
   * 
   * Kullanıcı profilini getirir.
   * 
   * @returns UserProfile veya null
   */
  async getProfile(): Promise<UserProfile | null> {
    const response = await apiClient.get<UserProfile>('/user/profile')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  /**
   * Update Profile (Profil Güncelle)
   * 
   * Kullanıcı profilini günceller.
   * 
   * FormData ile çalışır (avatar upload için).
   * 
   * @param updates - Güncellenecek alanlar
   * 
   * @returns UserProfile veya null
   */
  async updateProfile(updates: UpdateProfileRequest): Promise<UserProfile | null> {
    const formData = new FormData()
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'avatar' && value instanceof File) {
          formData.append('avatar', value)
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    const response = await apiClient.put<UserProfile>('/user/profile', formData, {
      'Content-Type': 'multipart/form-data'
    })
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  // ===== SETTINGS MANAGEMENT =====

  /**
   * Get Settings (Ayarları Getir)
   * 
   * Kullanıcı ayarlarını getirir.
   * 
   * @returns UserSettings veya null
   */
  async getSettings(): Promise<UserSettings | null> {
    const response = await apiClient.get<UserSettings>('/user/settings')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  /**
   * Update Settings (Ayarları Güncelle)
   * 
   * Kullanıcı ayarlarını günceller.
   * 
   * @param settings - Güncellenecek ayarlar
   * 
   * @returns boolean
   */
  async updateSettings(settings: UpdateSettingsRequest): Promise<boolean> {
    const response = await apiClient.put('/user/settings', settings)
    return response.success
  }

  /**
   * Change Password (Şifre Değiştir)
   * 
   * Kullanıcı şifresini değiştirir.
   * 
   * @param passwordData - Mevcut ve yeni şifre
   * 
   * @returns boolean
   */
  async changePassword(passwordData: ChangePasswordRequest): Promise<boolean> {
    const response = await apiClient.put('/user/change-password', passwordData)
    return response.success
  }

  // ===== STATS AND ACTIVITY =====

  /**
   * Get User Stats (Kullanıcı İstatistikleri)
   * 
   * Kullanıcı istatistiklerini getirir.
   * 
   * @returns UserStats veya null
   */
  async getUserStats(): Promise<UserStats | null> {
    const response = await apiClient.get<UserStats>('/user/stats')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  /**
   * Get User Activity (Kullanıcı Aktiviteleri)
   * 
   * Kullanıcı aktivitelerini getirir.
   * 
   * @param options - Pagination ve filtreleme opsiyonları
   * 
   * @returns Aktivite listesi veya null
   */
  async getUserActivity(options: {
    page?: number
    limit?: number
    type?: string
  } = {}): Promise<{
    activities: any[]
    total: number
    page: number
    limit: number
  } | null> {
    const queryParams = new URLSearchParams()
    
    if (options.page) queryParams.append('page', options.page.toString())
    if (options.limit) queryParams.append('limit', options.limit.toString())
    if (options.type) queryParams.append('type', options.type)

    const endpoint = `/api/user/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get(endpoint)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // ===== CREDIT MANAGEMENT =====

  /**
   * Get User Credits (Kullanıcı Kredileri)
   * 
   * Kullanıcı kredi bakiyesi ve işlem geçmişini getirir.
   * 
   * @returns Kredi bilgileri veya null
   */
  async getUserCredits(): Promise<{
    credits: number
    transactions: {
      id: string
      type: 'earned' | 'spent' | 'refunded'
      amount: number
      description: string
      date: string
    }[]
  } | null> {
    const response = await apiClient.get('/user/credits')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  /**
   * Purchase Credits (Kredi Satın Al)
   * 
   * Kredi satın alma işlemi başlatır.
   * 
   * @param amount - Satın alınacak kredi miktarı
   * @param paymentMethod - Ödeme yöntemi
   * 
   * @returns Ödeme bilgileri
   */
  async purchaseCredits(amount: number, paymentMethod: string): Promise<{
    success: boolean
    transactionId?: string
    paymentUrl?: string
    error?: string
  }> {
    const response = await apiClient.post('/user/credits/purchase', {
      amount,
      paymentMethod
    })
    
    return {
      success: response.success,
      transactionId: (response.data as any)?.transactionId,
      paymentUrl: (response.data as any)?.paymentUrl,
      error: response.error
    }
  }

  // ===== ACCOUNT MANAGEMENT =====

  /**
   * Delete Account (Hesap Sil)
   * 
   * Kullanıcı hesabını siler.
   * 
   * UYARI: Bu işlem geri alınamaz!
   * 
   * @param password - Onay için mevcut şifre
   * 
   * @returns boolean
   */
  async deleteAccount(password: string): Promise<boolean> {
    const response = await apiClient.delete('/user/account', {
      password
    })
    return response.success
  }

  /**
   * Suspend Account (Hesap Askıya Al)
   * 
   * Kullanıcı hesabını geçici olarak askıya alır.
   * 
   * @param reason - Askıya alma sebebi
   * 
   * @returns boolean
   */
  async suspendAccount(reason: string): Promise<boolean> {
    const response = await apiClient.post('/user/suspend', { reason })
    return response.success
  }

  /**
   * Unsuspend Account (Hesap Askıdan Kaldır)
   * 
   * Askıya alınmış hesabı tekrar aktif eder.
   * 
   * @returns boolean
   */
  async unsuspendAccount(): Promise<boolean> {
    const response = await apiClient.post('/user/unsuspend')
    return response.success
  }

  // ===== NOTIFICATION MANAGEMENT =====

  /**
   * Get Notifications (Bildirimleri Getir)
   * 
   * Kullanıcı bildirimlerini getirir.
   * 
   * @param options - Pagination ve filtreleme opsiyonları
   * 
   * @returns Bildirim listesi veya null
   */
  async getNotifications(options: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  } = {}): Promise<{
    notifications: any[]
    total: number
    unreadCount: number
  } | null> {
    const queryParams = new URLSearchParams()
    
    if (options.page) queryParams.append('page', options.page.toString())
    if (options.limit) queryParams.append('limit', options.limit.toString())
    if (options.unreadOnly) queryParams.append('unreadOnly', 'true')

    const endpoint = `/user/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get(endpoint)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  /**
   * Mark Notification As Read (Bildirimi Okundu İşaretle)
   * 
   * Belirli bir bildirimi okundu olarak işaretler.
   * 
   * @param notificationId - Bildirim ID
   * 
   * @returns boolean
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const response = await apiClient.put(`/user/notifications/${notificationId}/read`)
    return response.success
  }

  /**
   * Mark All Notifications As Read (Tüm Bildirimleri Okundu İşaretle)
   * 
   * Tüm bildirimleri okundu olarak işaretler.
   * 
   * @returns boolean
   */
  async markAllNotificationsAsRead(): Promise<boolean> {
    const response = await apiClient.put('/user/notifications/read-all')
    return response.success
  }

  /**
   * Delete Notification (Bildirim Sil)
   * 
   * Belirli bir bildirimi siler.
   * 
   * @param notificationId - Bildirim ID
   * 
   * @returns boolean
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    const response = await apiClient.delete(`/user/notifications/${notificationId}`)
    return response.success
  }
}

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const userService = new UserService()

/**
 * Default Export
 */
export default userService
