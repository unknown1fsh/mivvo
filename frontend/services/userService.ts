// Kullanıcı servisi

import { apiClient } from './apiClient'
import { User, UserProfile, UserSettings } from '@/types'

export interface UpdateProfileRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  avatar?: File
}

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

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UserStats {
  totalReports: number
  totalVINLookups: number
  totalPaintAnalyses: number
  memberSince: string
  lastLogin: string
  credits: number
}

class UserService {
  // Kullanıcı profilini al
  async getProfile(): Promise<UserProfile | null> {
    const response = await apiClient.get<UserProfile>('/user/profile')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  // Kullanıcı profilini güncelle
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

  // Kullanıcı ayarlarını al
  async getSettings(): Promise<UserSettings | null> {
    const response = await apiClient.get<UserSettings>('/user/settings')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  // Kullanıcı ayarlarını güncelle
  async updateSettings(settings: UpdateSettingsRequest): Promise<boolean> {
    const response = await apiClient.put('/user/settings', settings)
    return response.success
  }

  // Şifre değiştir
  async changePassword(passwordData: ChangePasswordRequest): Promise<boolean> {
    const response = await apiClient.put('/user/change-password', passwordData)
    return response.success
  }

  // Kullanıcı istatistiklerini al
  async getUserStats(): Promise<UserStats | null> {
    const response = await apiClient.get<UserStats>('/user/stats')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  // Kullanıcı aktivitelerini al
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

    const endpoint = `/user/activity${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    const response = await apiClient.get(endpoint)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Kullanıcı kredilerini al
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

  // Kredi satın al
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

  // Kullanıcıyı sil
  async deleteAccount(password: string): Promise<boolean> {
    const response = await apiClient.delete('/user/account', {
      password
    })
    return response.success
  }

  // Hesap askıya al
  async suspendAccount(reason: string): Promise<boolean> {
    const response = await apiClient.post('/user/suspend', { reason })
    return response.success
  }

  // Hesap askıdan kaldır
  async unsuspendAccount(): Promise<boolean> {
    const response = await apiClient.post('/user/unsuspend')
    return response.success
  }

  // Kullanıcı bildirimlerini al
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

  // Bildirimi okundu olarak işaretle
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const response = await apiClient.put(`/user/notifications/${notificationId}/read`)
    return response.success
  }

  // Tüm bildirimleri okundu olarak işaretle
  async markAllNotificationsAsRead(): Promise<boolean> {
    const response = await apiClient.put('/user/notifications/read-all')
    return response.success
  }

  // Bildirimi sil
  async deleteNotification(notificationId: string): Promise<boolean> {
    const response = await apiClient.delete(`/user/notifications/${notificationId}`)
    return response.success
  }
}

export const userService = new UserService()
export default userService
