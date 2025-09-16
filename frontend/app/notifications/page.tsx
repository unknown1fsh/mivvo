'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  SparklesIcon,
  UserIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'

interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'warning' | 'info' | 'error'
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  useEffect(() => {
    // TODO: Fetch notifications from API
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          title: 'Rapor Tamamlandı',
          message: '34 ABC 123 plakalı Toyota Corolla için tam expertiz raporunuz hazır.',
          type: 'success',
          isRead: false,
          createdAt: '2024-01-15T10:30:00Z',
          actionUrl: '/reports/1'
        },
        {
          id: '2',
          title: 'Kredi Yüklendi',
          message: 'Hesabınıza 100₺ kredi yüklendi. Yeni bakiyeniz: 250₺',
          type: 'info',
          isRead: false,
          createdAt: '2024-01-14T15:45:00Z'
        },
        {
          id: '3',
          title: 'Rapor İşleniyor',
          message: '06 XYZ 789 plakalı Honda Civic için boya analizi devam ediyor.',
          type: 'info',
          isRead: true,
          createdAt: '2024-01-14T09:20:00Z'
        },
        {
          id: '4',
          title: 'Ödeme Başarısız',
          message: 'Son kredi yükleme işleminiz başarısız oldu. Lütfen tekrar deneyin.',
          type: 'warning',
          isRead: true,
          createdAt: '2024-01-13T14:15:00Z',
          actionUrl: '/payment/add-credits'
        },
        {
          id: '5',
          title: 'Hoş Geldiniz!',
          message: 'Mivvo Expertiz\'e hoş geldiniz! İlk raporunuzu oluşturmak için başlayın.',
          type: 'success',
          isRead: true,
          createdAt: '2024-01-12T08:00:00Z',
          actionUrl: '/vehicle/new-report'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead
    if (filter === 'read') return notification.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/notifications" className="p-2 text-blue-600 hover:text-blue-500 relative">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600">
                <CogIcon className="w-6 h-6" />
              </Link>
              <Link href="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Kullanıcı</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <FadeInUp>
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bildirimler</h1>
                <p className="text-gray-600">Tüm bildirimlerinizi buradan görüntüleyebilirsiniz.</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-secondary"
                >
                  Tümünü Okundu İşaretle
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              {[
                { key: 'all', label: 'Tümü', count: notifications.length },
                { key: 'unread', label: 'Okunmamış', count: unreadCount },
                { key: 'read', label: 'Okunmuş', count: notifications.length - unreadCount }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </FadeInUp>

        {/* Notifications List */}
        <StaggerContainer className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <FadeInUp>
              <div className="text-center py-12">
                <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'unread' ? 'Okunmamış bildirim yok' : 
                   filter === 'read' ? 'Okunmuş bildirim yok' : 'Bildirim yok'}
                </h3>
                <p className="text-gray-600">
                  {filter === 'unread' ? 'Tüm bildirimleriniz okunmuş.' : 
                   filter === 'read' ? 'Henüz okunmuş bildirim yok.' : 'Henüz bildirim almadınız.'}
                </p>
              </div>
            </FadeInUp>
          ) : (
            filteredNotifications.map((notification) => (
              <StaggerItem key={notification.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-6 border-l-4 ${getNotificationBgColor(notification.type)} ${
                    !notification.isRead ? 'ring-2 ring-blue-100' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-sm font-medium ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleString('tr-TR')}
                        </p>
                        {notification.actionUrl && (
                          <Link
                            href={notification.actionUrl}
                            className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-500 font-medium"
                          >
                            Detayları Gör →
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                          title="Okundu işaretle"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Sil"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))
          )}
        </StaggerContainer>
      </div>
    </div>
  )
}
