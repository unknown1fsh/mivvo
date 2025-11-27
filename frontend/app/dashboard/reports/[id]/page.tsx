'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '@/services/apiClient'

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
  aiAnalysis?: any
  damageAnalysis?: any
  paintAnalysis?: any
  engineSoundAnalysis?: any
  valueEstimation?: any
  comprehensiveExpertise?: any
  failedReason?: string | null
  refundStatus?: string | null
  createdAt: string
  updatedAt: string
}

export default function ReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params?.id as string
  
  const [report, setReport] = useState<VehicleReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const fetchReport = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/user/reports/${reportId}`)
      
      if ((response.data as any)?.success) {
        setReport((response.data as any).data.report)
      }
    } catch (error) {
      console.error('Rapor yüklenemedi:', error)
      toast.error('Rapor yüklenemedi')
      router.push('/dashboard/reports')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: { class: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      processing: { class: 'bg-blue-100 text-blue-800', icon: ClockIcon },
      failed: { class: 'bg-red-100 text-red-800', icon: XCircleIcon },
      pending: { class: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Rapor bulunamadı</h3>
          <p className="mt-1 text-sm text-gray-500">Aradığınız rapor mevcut değil veya erişim yetkiniz yok.</p>
          <div className="mt-6">
            <Link
              href="/dashboard/reports"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Raporlara Dön
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = getStatusBadge(report.status)
  const StatusIcon = statusBadge.icon
  const isFailedReport = report.status?.toLowerCase?.() === 'failed'
  const getRefundStatusText = (status?: string) => {
    switch (status) {
      case 'REFUNDED':
        return 'Kredi iadesi tamamlandı'
      case 'FAILED':
        return 'Kredi iadesi başarısız'
      case 'PENDING':
        return 'İade bekleniyor'
      default:
        return 'İade durumu kaydedilmedi'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/reports" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-6 h-6" />
                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">Rapor Detayı</span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusBadge.class.includes('green') ? 'text-green-600' : statusBadge.class.includes('red') ? 'text-red-600' : statusBadge.class.includes('blue') ? 'text-blue-600' : 'text-yellow-600'}`} />
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.class}`}>
                {getStatusText(report.status)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isFailedReport && report.failedReason && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">AI analizi tamamlanamadı.</p>
            <p className="mt-1">{report.failedReason}</p>
            <p className="mt-1 text-xs text-red-600">{getRefundStatusText(report.refundStatus)}</p>
            <p className="text-xs text-gray-500">Rapor ID: #{report.id}</p>
          </div>
        )}
        {/* Araç Bilgileri */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Araç Bilgileri</h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Marka</label>
                <p className="mt-1 text-sm text-gray-900">{report.brand}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Model</label>
                <p className="mt-1 text-sm text-gray-900">{report.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Yıl</label>
                <p className="mt-1 text-sm text-gray-900">{report.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Plaka</label>
                <p className="mt-1 text-sm text-gray-900">{report.licensePlate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Şasi Numarası</label>
                <p className="mt-1 text-sm text-gray-900">{report.chassisNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Renk</label>
                <p className="mt-1 text-sm text-gray-900">{report.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Yakıt Tipi</label>
                <p className="mt-1 text-sm text-gray-900">{report.fuelType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Kilometre</label>
                <p className="mt-1 text-sm text-gray-900">{report.mileage.toLocaleString()} km</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analiz Türleri */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analiz Türleri</h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              {report.reportType.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Analiz Sonuçları */}
        {report.status === 'completed' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Analiz Sonuçları</h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">Analiz sonuçları burada görüntülenecek.</p>
              {/* Analiz sonuçlarını buraya ekleyebilirsiniz */}
            </div>
          </div>
        )}

        {/* Görseller */}
        {report.images && report.images.length > 0 && (
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Görseller</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Araç görseli ${index + 1}`}
                    className="rounded-lg object-cover h-48 w-full"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

