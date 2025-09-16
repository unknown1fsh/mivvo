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
  BellIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { ProgressBar, LoadingSpinner } from '@/components/ui'

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
  const [reports, setReports] = useState<VehicleReport[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalReports: 0,
    completedReports: 0,
    totalSpent: 0,
    creditBalance: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch user data from API
    setTimeout(() => {
      setReports([
        {
          id: '1',
          vehiclePlate: '34 ABC 123',
          vehicleBrand: 'Toyota',
          vehicleModel: 'Corolla',
          reportType: 'Tam Expertiz',
          status: 'completed',
          createdAt: '2024-01-15',
          totalCost: 75
        },
        {
          id: '2',
          vehiclePlate: '06 XYZ 789',
          vehicleBrand: 'Honda',
          vehicleModel: 'Civic',
          reportType: 'Boya Analizi',
          status: 'processing',
          createdAt: '2024-01-14',
          totalCost: 25
        }
      ])
      setStats({
        totalReports: 12,
        completedReports: 10,
        totalSpent: 450,
        creditBalance: 150
      })
      setIsLoading(false)
    }, 1000)
  }, [])

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
              <Link href="/" className="flex items-center space-x-2">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/vehicle/new-report" className="btn btn-primary btn-lg flex items-center justify-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Yeni Rapor Oluştur
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
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
