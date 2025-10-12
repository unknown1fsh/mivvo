'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PlusIcon, 
  ChartBarIcon, 
  CreditCardIcon, 
  DocumentTextIcon,
  CameraIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  TruckIcon,
  PaintBrushIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { ProgressBar, LoadingSpinner } from '@/components/ui'
import { authService } from '@/services/authService'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface VehicleReport {
  id: string
  vehiclePlate: string
  vehicleBrand: string
  vehicleModel: string
  reportType: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  totalCost: number
}

interface UserStats {
  totalReports: number
  completedReports: number
  totalSpent: number
  creditBalance: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [reports, setReports] = useState<VehicleReport[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalReports: 0,
    completedReports: 0,
    totalSpent: 0,
    creditBalance: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Kullanıcı bilgilerini al
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    
    // Gerçek API'den veri çek
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Kullanıcı bilgisini al (currentUser tanımla)
      const currentUser = authService.getCurrentUser()
      
      // Kredi bakiyesini ve raporları çek
      const [creditsResponse, reportsResponse] = await Promise.all([
        api.get('/user/credits'),
        api.get('/user/reports')
      ])
      
      if (reportsResponse.data.success) {
        const userReports = reportsResponse.data.data?.reports || []
        
        console.log('📊 Dashboard - Backend response:', reportsResponse.data)
        console.log('📊 Dashboard - User reports:', userReports)
        
        // Rapor türü maliyetlerini map'le
        const reportCosts: Record<string, number> = {
          'PAINT_ANALYSIS': 25,
          'DAMAGE_ANALYSIS': 35,
          'DAMAGE_ASSESSMENT': 35,
          'ENGINE_SOUND_ANALYSIS': 30,
          'VALUE_ESTIMATION': 20,
          'COMPREHENSIVE_EXPERTISE': 85,
          'FULL_REPORT': 85
        }
        
        // Backend formatını frontend formatına çevir
        const formattedReports = userReports.slice(0, 5).map((report: any) => ({
          id: report.id.toString(),
          vehiclePlate: report.vehiclePlate || 'Bilinmiyor',
          vehicleBrand: report.vehicleBrand || 'Bilinmiyor',
          vehicleModel: report.vehicleModel || 'Bilinmiyor',
          reportType: getReportTypeName(report.reportType),
          status: report.status?.toLowerCase() || 'pending',
          createdAt: new Date(report.createdAt).toLocaleDateString('tr-TR'),
          totalCost: report.creditCost || reportCosts[report.reportType] || 0
        }))
        
        setReports(formattedReports)
        
        // İstatistikleri hesapla
        const totalReports = userReports.length
        const completedReports = userReports.filter((r: any) => r.status === 'COMPLETED').length
        const totalSpent = userReports.reduce((sum: number, r: any) => sum + (r.creditCost || reportCosts[r.reportType] || 0), 0)
        
        // Gerçek kredi bakiyesini API'den al
        const realCreditBalance = creditsResponse.data?.success 
          ? Number(creditsResponse.data.data?.credits?.balance || 0)
          : (currentUser?.credits || 0)
        
        setStats({
          totalReports,
          completedReports,
          totalSpent,
          creditBalance: realCreditBalance
        })

        // localStorage'daki user bilgisini de güncelle
        if (currentUser && creditsResponse.data?.success) {
          const updatedUser = {
            ...currentUser,
            credits: realCreditBalance
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      }
    } catch (error) {
      console.error('Dashboard veri çekme hatası:', error)
      toast.error('Veriler yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const getReportTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      'PAINT_ANALYSIS': 'Boya Analizi',
      'DAMAGE_ANALYSIS': 'Hasar Analizi',
      'DAMAGE_ASSESSMENT': 'Hasar Değerlendirmesi',
      'ENGINE_SOUND_ANALYSIS': 'Motor Ses Analizi',
      'VALUE_ESTIMATION': 'Değer Tahmini',
      'COMPREHENSIVE_EXPERTISE': 'Tam Ekspertiz',
      'FULL_REPORT': 'Tam Ekspertiz'
    }
    return typeMap[type] || type
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast.success('Başarıyla çıkış yapıldı')
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Çıkış yapılırken hata oluştu')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'failed':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı'
      case 'processing':
        return 'İşleniyor'
      case 'failed':
        return 'Başarısız'
      default:
        return 'Bekliyor'
    }
  }

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
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/notifications" className="p-2 text-gray-400 hover:text-gray-600 relative">
                <BellIcon className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </Link>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600">
                <CogIcon className="w-6 h-6" />
              </Link>
              <Link href="/profile" className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : 'Kullanıcı'}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                title="Çıkış Yap"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <FadeInUp>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hoş Geldiniz!</h1>
            <p className="text-gray-600">Araç expertiz işlemlerinizi buradan yönetebilirsiniz.</p>
          </div>
        </FadeInUp>

        {/* Stats Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StaggerItem>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Rapor</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedReports}</p>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSpent}₺</p>
                </div>
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="card p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Kredi Bakiyesi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.creditBalance}₺</p>
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Quick Actions */}
        <FadeInUp delay={0.2}>
          <div className="card p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/vehicle/new-report" className="btn btn-primary btn-lg flex items-center justify-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Yeni Rapor Oluştur
              </Link>
              <Link href="/vin-lookup" className="btn btn-secondary btn-lg flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white">
                <TruckIcon className="w-5 h-5 mr-2" />
                Şasi Sorgula
              </Link>
              <Link href="/vehicle-garage" className="btn btn-secondary btn-lg flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                <TruckIcon className="w-5 h-5 mr-2" />
                Araç Garajım
              </Link>
              <Link href="/vehicle/upload-images" className="btn btn-secondary btn-lg flex items-center justify-center">
                <CameraIcon className="w-5 h-5 mr-2" />
                Resim Yükle
              </Link>
              <Link href="/payment/add-credits" className="btn btn-secondary btn-lg flex items-center justify-center">
                <CreditCardIcon className="w-5 h-5 mr-2" />
                Kredi Yükle
              </Link>
            </div>
          </div>
        </FadeInUp>


        {/* Recent Reports */}
        <FadeInUp delay={0.4}>
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Son Raporlar</h2>
              <Link href="/reports" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Tümünü Gör
              </Link>
            </div>

            {reports.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz rapor yok</h3>
                <p className="text-gray-600 mb-4">İlk raporunuzu oluşturmak için başlayın.</p>
                <Link href="/vehicle/new-report" className="btn btn-primary">
                  Rapor Oluştur
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      // Rapor türüne göre doğru sayfaya yönlendir
                      const reportTypeMap: Record<string, string> = {
                        'Boya Analizi': 'paint-analysis',
                        'Hasar Analizi': 'damage-analysis',
                        'Motor Ses Analizi': 'engine-sound-analysis',
                        'Değer Tahmini': 'value-estimation',
                        'Tam Ekspertiz': 'comprehensive-expertise'
                      }
                      const reportPath = reportTypeMap[report.reportType] || 'comprehensive-expertise'
                      router.push(`/vehicle/${reportPath}/report?reportId=${report.id}`)
                    }}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(report.status)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.vehicleBrand} {report.vehicleModel}
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.vehiclePlate} • {report.reportType}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{report.totalCost}₺</p>
                      <p className="text-sm text-gray-600">{getStatusText(report.status)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
