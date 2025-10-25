'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface VehicleReport {
  id: number
  userId: number
  licensePlate: string
  chassisNumber: string
  brand: string
  model: string
  year: number
  color: string
  fuelType: string
  transmissionType: string
  mileage: number
  price: number
  status: string
  reportType: string[]
  images: string[]
  createdAt: string
  updatedAt: string
}

export default function ReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams?.get('status')
  
  const [reports, setReports] = useState<VehicleReport[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>(statusFilter || 'all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReports()
  }, [statusFilter])

  const getReportTypeName = (type: string): string => {
    if (!type) return 'Bilinmiyor'
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

  const fetchReports = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/user/reports')
      
      console.log('📊 Reports Page - API Response:', response.data)
      
      if (response.data.success) {
        let reports = response.data.data.reports
        
        console.log('📊 Reports Page - Raw reports:', reports)
        
        // Backend formatını frontend formatına çevir
        const formattedReports = reports.map((report: any) => ({
          id: report.id,
          userId: report.userId || report.user_id,
          licensePlate: report.vehiclePlate || report.vehicle_plate || 'Belirtilmemiş',
          chassisNumber: report.vehiclePlate || report.vehicle_plate || 'Belirtilmemiş',
          brand: report.vehicleBrand || report.vehicle_brand || 'Bilinmiyor',
          model: report.vehicleModel || report.vehicle_model || 'Bilinmiyor',
          year: report.vehicleYear || report.vehicle_year,
          color: report.vehicleColor || report.vehicle_color,
          fuelType: 'Belirtilmemiş',
          transmissionType: 'Belirtilmemiş',
          mileage: report.mileage || 0,
          price: Number(report.totalCost || report.total_cost || 0),
          status: (report.status || 'PENDING')?.toLowerCase(),
          reportType: report.reportType ? (Array.isArray(report.reportType) ? report.reportType.map(getReportTypeName) : [getReportTypeName(report.reportType)]) : [],
          images: report.vehicleImages?.map((img: any) => img.imageUrl || img.image_url) || [],
          createdAt: report.createdAt || report.created_at,
          updatedAt: report.updatedAt || report.updated_at
        }))
        
        console.log('📊 Reports Page - Formatted reports:', formattedReports)
        console.log('📊 Reports Page - Status filter value:', statusFilter)
        
        // Status filtresi uygula
        let filteredReports = formattedReports
        if (statusFilter && statusFilter !== 'all') {
          filteredReports = formattedReports.filter(
            (report: VehicleReport) => report.status === statusFilter
          )
          console.log('📊 Reports Page - Filtered reports after status:', filteredReports)
        }
        
        console.log('📊 Reports Page - Setting reports to state:', filteredReports.length, 'items')
        setReports(filteredReports)
      }
    } catch (error) {
      console.error('❌ Reports Page - Raporlar yüklenemedi:', error)
      toast.error('Raporlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getStatusText = (status: string) => {
    const texts = {
      completed: 'Tamamlandı',
      processing: 'İşleniyor',
      failed: 'Başarısız',
      pending: 'Bekliyor',
    }
    return texts[status as keyof typeof texts] || 'Bilinmiyor'
  }

  // Arama ve filtrelemeyi reports üzerinde uygula
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      // Eğer arama terimi boşsa, sadece raporu geç
      if (!searchTerm) {
        return true
      }
      
      // Arama terimini küçük harfe çevir
      const searchLower = searchTerm.toLowerCase()
      
      // Herhangi bir alanla eşleşen raporları göster
      return (
        report.licensePlate?.toLowerCase().includes(searchLower) ||
        report.brand?.toLowerCase().includes(searchLower) ||
        report.model?.toLowerCase().includes(searchLower) ||
        report.chassisNumber?.toLowerCase().includes(searchLower)
      )
    })
  }, [reports, searchTerm])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-6 h-6" />
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">Raporlarım</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Arama */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Plaka, marka, model veya şasi numarası ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Status Filtresi */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value)
                  if (e.target.value === 'all') {
                    router.push('/dashboard/reports')
                  } else {
                    router.push(`/dashboard/reports?status=${e.target.value}`)
                  }
                }}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Raporlar</option>
                <option value="completed">Tamamlanan</option>
                <option value="processing">İşleniyor</option>
                <option value="failed">Başarısız</option>
                <option value="pending">Bekleyen</option>
              </select>
            </div>
          </div>
        </div>

        {/* Raporlar Listesi */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Rapor bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter ? 'Bu filtre kriterlerine uygun rapor bulunamadı.' : 'Henüz rapor oluşturmadınız.'}
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Yeni Rapor Oluştur
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredReports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.brand} {report.model} ({report.year})
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      {report.licensePlate && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Plaka:</span>
                          <span>{report.licensePlate}</span>
                        </div>
                      )}
                      {report.year && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Yıl:</span>
                          <span>{report.year}</span>
                        </div>
                      )}
                      {report.mileage > 0 && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Kilometre:</span>
                          <span>{report.mileage.toLocaleString()} km</span>
                        </div>
                      )}
                      {report.createdAt && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Oluşturulma:</span>
                          <span>{new Date(report.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      )}
                    </div>
                    {report.reportType && report.reportType.length > 0 && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {report.reportType.map((type: string) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <ArrowLeftIcon className="h-6 w-6 text-gray-400 rotate-180" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

