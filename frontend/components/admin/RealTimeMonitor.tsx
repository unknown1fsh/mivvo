'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  RefreshCw, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Settings,
  Wifi,
  WifiOff
} from 'lucide-react'
import { getRealTimeStats } from '@/services/adminService'
import toast from 'react-hot-toast'

interface RealTimeStats {
  totalReports: number
  completedReports: number
  failedReports: number
  processingReports: number
  activeUsers: number
  lastUpdate: string
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface RealTimeMonitorProps {
  onStatsUpdate?: (stats: RealTimeStats) => void
  refreshInterval?: number // milliseconds
}

export default function RealTimeMonitor({ 
  onStatsUpdate, 
  refreshInterval = 30000 // 30 saniye
}: RealTimeMonitorProps) {
  const [stats, setStats] = useState<RealTimeStats | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isConnected, setIsConnected] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Gerçek zamanlı veri güncellemesi
  const fetchRealTimeStats = useCallback(async () => {
    try {
      setIsRefreshing(true)
      
      // Gerçek API çağrısı
      const response = await getRealTimeStats()
      
      if (response.success && response.data) {
        setStats(response.data)
        setLastRefresh(new Date())
        onStatsUpdate?.(response.data)
      } else {
        throw new Error(response.error || 'Gerçek zamanlı istatistikler alınamadı')
      }
      
      // Önceki verilerle karşılaştır ve bildirim oluştur
      if (stats) {
        const newNotifications: Notification[] = []
        const newStats = response.data
        
        if (newStats.completedReports > stats.completedReports) {
          newNotifications.push({
            id: Date.now().toString(),
            type: 'success',
            title: 'Yeni Rapor Tamamlandı',
            message: `${newStats.completedReports - stats.completedReports} rapor başarıyla tamamlandı`,
            timestamp: new Date().toISOString(),
            read: false
          })
        }
        
        if (newStats.failedReports > stats.failedReports) {
          newNotifications.push({
            id: Date.now().toString(),
            type: 'error',
            title: 'Rapor Başarısız',
            message: `${newStats.failedReports - stats.failedReports} rapor başarısız oldu`,
            timestamp: new Date().toISOString(),
            read: false
          })
        }
        
        if (newStats.activeUsers > stats.activeUsers) {
          newNotifications.push({
            id: Date.now().toString(),
            type: 'info',
            title: 'Yeni Aktif Kullanıcı',
            message: `${newStats.activeUsers - stats.activeUsers} yeni kullanıcı aktif`,
            timestamp: new Date().toISOString(),
            read: false
          })
        }
        
        if (newNotifications.length > 0) {
          setNotifications(prev => [...newNotifications, ...prev.slice(0, 9)]) // Son 10 bildirimi tut
          
          // Toast bildirimleri göster
          newNotifications.forEach(notification => {
            switch (notification.type) {
              case 'success':
                toast.success(notification.message)
                break
              case 'error':
                toast.error(notification.message)
                break
              case 'warning':
                toast(notification.message, { icon: '⚠️' })
                break
              case 'info':
                toast(notification.message, { icon: 'ℹ️' })
                break
            }
          })
        }
      }
      
      setIsConnected(true)
      
    } catch (error) {
      console.error('Real-time stats error:', error)
      setIsConnected(false)
      toast.error('Gerçek zamanlı veriler alınamadı')
    } finally {
      setIsRefreshing(false)
    }
  }, [stats, onStatsUpdate])

  // Otomatik yenileme
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchRealTimeStats()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchRealTimeStats])

  // İlk yükleme
  useEffect(() => {
    fetchRealTimeStats()
  }, [])

  const handleManualRefresh = () => {
    fetchRealTimeStats()
    toast.success('Veriler yenilendi')
  }

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const clearAllNotifications = () => {
    setNotifications([])
    toast.success('Tüm bildirimler temizlendi')
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="space-y-6">
      {/* Bağlantı Durumu ve Kontroller */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Gerçek Zamanlı İzleme
            </CardTitle>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge variant="success" className="flex items-center">
                  <Wifi className="h-3 w-3 mr-1" />
                  Bağlı
                </Badge>
              ) : (
                <Badge variant="error" className="flex items-center">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Bağlantı Yok
                </Badge>
              )}
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "primary" : "outline"}
                size="sm"
              >
                {autoRefresh ? 'Otomatik Açık' : 'Otomatik Kapalı'}
              </Button>
              <Button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Son güncelleme: {lastRefresh.toLocaleString('tr-TR')}
            {autoRefresh && (
              <span className="ml-2">
                • Otomatik yenileme: {refreshInterval / 1000} saniye
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gerçek Zamanlı İstatistikler */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Rapor</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tamamlanan</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedReports}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Başarısız</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedReports}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">İşleniyor</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.processingReports}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bildirimler */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Bildirimler
              {unreadCount > 0 && (
                <Badge variant="error" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {notifications.length > 0 && (
              <Button onClick={clearAllNotifications} variant="outline" size="sm">
                Tümünü Temizle
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Henüz bildirim yok</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {notification.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {notification.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        {notification.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                        {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
