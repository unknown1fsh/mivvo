'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  PaintBrushIcon,
  WrenchIcon,
  CurrencyDollarIcon,
  MusicalNoteIcon,
  SparklesIcon,
  CalendarIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { formatDate } from '@/utils/dateUtils'

interface VehicleReport {
  id: number
  vehiclePlate: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear: number
  reportType: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  totalCost: number
  createdAt: string
  updatedAt: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

const reportTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  'PAINT_ANALYSIS': { 
    label: 'Boya Analizi', 
    icon: PaintBrushIcon,
    color: 'bg-blue-100 text-blue-700'
  },
  'DAMAGE_ANALYSIS': { 
    label: 'Hasar Analizi', 
    icon: WrenchIcon,
    color: 'bg-red-100 text-red-700'
  },
  'VALUE_ESTIMATION': { 
    label: 'Değer Tahmini', 
    icon: CurrencyDollarIcon,
    color: 'bg-green-100 text-green-700'
  },
  'ENGINE_SOUND_ANALYSIS': { 
    label: 'Motor Ses Analizi', 
    icon: MusicalNoteIcon,
    color: 'bg-purple-100 text-purple-700'
  },
  'COMPREHENSIVE_EXPERTISE': { 
    label: 'Tam Ekspertiz', 
    icon: SparklesIcon,
    color: 'bg-yellow-100 text-yellow-700'
  },
  'FULL_REPORT': { 
    label: 'Tam Rapor', 
    icon: DocumentTextIcon,
    color: 'bg-indigo-100 text-indigo-700'
  }
}

const statusLabels: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  'PENDING': { 
    label: 'Beklemede', 
    icon: ClockIcon,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100'
  },
  'PROCESSING': { 
    label: 'İşleniyor', 
    icon: ArrowPathIcon,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  'COMPLETED': { 
    label: 'Tamamlandı', 
    icon: CheckCircleIcon,
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  'FAILED': { 
    label: 'Başarısız', 
    icon: ExclamationCircleIcon,
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
}

export default function ReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<VehicleReport[]>([])
  const [filteredReports, setFilteredReports] = useState<VehicleReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [pagination.page])

  useEffect(() => {
    filterReports()
  }, [searchQuery, selectedType, selectedStatus, reports])

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      
      const response = await api.get(`/user/reports?page=${pagination.page}&limit=${pagination.limit}`)
      
      if (response.data.success) {
        const userReports = response.data.data?.reports || []
        const paginationData = response.data.data?.pagination || {}
        
        console.log('📊 Reports - Backend response:', response.data)
        
        setReports(userReports)
        setPagination({
          page: paginationData.page || 1,
          limit: paginationData.limit || 12,
          total: paginationData.total || 0,
          pages: paginationData.pages || 0
        })
      } else {
        toast.error('Raporlar yüklenemedi')
      }
    } catch (error) {
      console.error('Reports fetch error:', error)
      toast.error('Raporlar yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = [...reports]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(report => 
        report.vehiclePlate?.toLowerCase().includes(query) ||
        report.vehicleBrand?.toLowerCase().includes(query) ||
        report.vehicleModel?.toLowerCase().includes(query)
      )
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(report => report.reportType === selectedType)
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(report => report.status === selectedStatus)
    }

    setFilteredReports(filtered)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
    setSelectedStatus('all')
  }

  const getReportTypeInfo = (type: string) => {
    return reportTypeLabels[type] || { 
      label: type, 
      icon: DocumentTextIcon,
      color: 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusInfo = (status: string) => {
    return statusLabels[status] || { 
      label: status, 
      icon: ClockIcon,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100'
    }
  }

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedStatus !== 'all'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ChevronLeftIcon className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tüm Raporlar</h1>
                <p className="text-sm text-gray-600">
                  {pagination.total} rapor bulundu
                </p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/vehicle/new-report')}
              className="btn btn-primary"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Yeni Rapor
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <FadeInUp>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Plaka, marka veya model ile ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-secondary flex items-center ${hasActiveFilters ? 'ring-2 ring-primary-500' : ''}`}
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filtrele
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary-500 text-white text-xs rounded-full px-2 py-0.5">
                    {[searchQuery, selectedType !== 'all', selectedStatus !== 'all'].filter(Boolean).length}
                  </span>
                )}
              </button>

              <button
                onClick={fetchReports}
                className="btn btn-secondary"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Yenile
              </button>
            </div>

            {/* Filter Options */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Report Type Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rapor Türü
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">Tümü</option>
                          {Object.entries(reportTypeLabels).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Durum
                        </label>
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="all">Tümü</option>
                          {Object.entries(statusLabels).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={clearFilters}
                          className="text-sm text-gray-600 hover:text-gray-900 flex items-center"
                        >
                          <XMarkIcon className="w-4 h-4 mr-1" />
                          Filtreleri Temizle
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </FadeInUp>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="large" />
          </div>
        ) : filteredReports.length === 0 ? (
          <FadeInUp>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? 'Filtreye uygun rapor bulunamadı' : 'Henüz rapor oluşturmadınız'}
              </h3>
              <p className="text-gray-600 mb-6">
                {hasActiveFilters 
                  ? 'Farklı filtreler deneyin veya yeni rapor oluşturun'
                  : 'İlk raporunuzu oluşturarak başlayın'}
              </p>
              <button
                onClick={() => router.push('/vehicle/new-report')}
                className="btn btn-primary"
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                Yeni Rapor Oluştur
              </button>
            </div>
          </FadeInUp>
        ) : (
          <>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredReports.map((report) => {
                const typeInfo = getReportTypeInfo(report.reportType)
                const statusInfo = getStatusInfo(report.status)
                const TypeIcon = typeInfo.icon
                const StatusIcon = statusInfo.icon

                return (
                  <StaggerItem key={report.id}>
                    <motion.div
                      whileHover={{ y: -4, shadow: 'lg' }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link href={`/reports/${report.id}`}>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-lg ${typeInfo.color}`}>
                              <TypeIcon className="w-6 h-6" />
                            </div>
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>

                          {/* Vehicle Info */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
                              <TruckIcon className="w-5 h-5 mr-2 text-gray-500" />
                              {report.vehiclePlate || 'Plaka Yok'}
                            </h3>
                            <p className="text-gray-600">
                              {report.vehicleBrand} {report.vehicleModel}
                              {report.vehicleYear && ` (${report.vehicleYear})`}
                            </p>
                          </div>

                          {/* Report Type */}
                          <div className="mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="w-4 h-4 mr-1" />
                              {formatDate(report.createdAt)}
                            </div>
                            <div className="text-lg font-bold text-primary-600">
                              ₺{report.totalCost}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <FadeInUp>
                <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
                  <div className="text-sm text-gray-600">
                    Sayfa {pagination.page} / {pagination.pages} 
                    <span className="ml-2 text-gray-400">
                      (Toplam {pagination.total} rapor)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum: number
                        
                        if (pagination.pages <= 5) {
                          pageNum = i + 1
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i
                        } else {
                          pageNum = pagination.page - 2 + i
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === pagination.page
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </FadeInUp>
            )}
          </>
        )}
      </div>
    </div>
  )
}

