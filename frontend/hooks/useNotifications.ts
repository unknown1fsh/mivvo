/**
 * Use Notifications Hook
 * 
 * Bildirim sayısını yöneten custom hook.
 * 
 * Özellikler:
 * - Gerçek zamanlı bildirim sayısı
 * - Otomatik güncelleme
 * - Hata yönetimi
 * - Cache yönetimi
 */

import { useState, useEffect, useCallback } from 'react'
import { userService } from '@/services/userService'

interface NotificationData {
  notifications: any[]
  total: number
  unreadCount: number
}

interface UseNotificationsReturn {
  unreadCount: number
  notifications: any[]
  isLoading: boolean
  error: string | null
  refreshNotifications: () => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

/**
 * Bildirim hook'u
 * 
 * @param options - Hook seçenekleri
 * @returns Bildirim verileri ve işlemler
 */
export function useNotifications(options: {
  autoRefresh?: boolean
  refreshInterval?: number
  page?: number
  limit?: number
} = {}): UseNotificationsReturn {
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 saniye
    page = 1,
    limit = 50
  } = options

  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Bildirimleri yenile
   */
  const refreshNotifications = useCallback(async () => {
    try {
      setError(null)
      const result = await userService.getNotifications({ page, limit })
      
      if (result) {
        setNotifications(result.notifications || [])
        setUnreadCount(result.unreadCount || 0)
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Bildirimler yüklenirken hata:', err)
      setError(err instanceof Error ? err.message : 'Bildirimler yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }, [page, limit])

  /**
   * Bildirimi okundu olarak işaretle
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await userService.markNotificationAsRead(notificationId)
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
      
      // Okunmamış sayısını azalt
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Bildirim okundu işaretlenirken hata:', err)
    }
  }, [])

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await userService.markAllNotificationsAsRead()
      
      // Local state'i güncelle
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      
      // Okunmamış sayısını sıfırla
      setUnreadCount(0)
    } catch (err) {
      console.error('Tüm bildirimler okundu işaretlenirken hata:', err)
    }
  }, [])

  // İlk yükleme
  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  // Otomatik yenileme
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(refreshNotifications, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshNotifications])

  return {
    unreadCount,
    notifications,
    isLoading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead
  }
}

/**
 * Sadece okunmamış bildirim sayısını döndüren basit hook
 */
export function useUnreadNotificationCount(): number {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await userService.getNotifications({ unreadOnly: true })
        if (result) {
          setUnreadCount(result.unreadCount || 0)
        }
      } catch (error) {
        console.error('Okunmamış bildirim sayısı yüklenirken hata:', error)
        setUnreadCount(0)
      }
    }

    fetchUnreadCount()
    
    // 30 saniyede bir yenile
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return unreadCount
}

export default useNotifications
