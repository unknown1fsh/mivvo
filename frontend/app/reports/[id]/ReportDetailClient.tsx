'use client'

import { useState, useEffect } from 'react'
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  CheckBadgeIcon,
  ClockIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import { analysisAPI } from '@/lib/api'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { ReportLoading } from '@/components/ui/ReportLoading'
import { Skeleton } from '@/components/ui/LoadingComponents'
import {
  DamageAnalysisResult,
  PaintAnalysisResult,
  AudioAnalysisResult,
  ValueEstimationResult,
  ComprehensiveExpertiseResult
} from '@/types'
import { DamageReport } from '@/components/features/DamageReport'
import { PaintReport } from '@/components/features/PaintReport'
import { AudioReport } from '@/components/features/AudioReport'
import { ValueReport } from '@/components/features/ValueReport'
import { ComprehensiveReport } from '@/components/features/ComprehensiveReport'

// ReportType'dan analiz tipini belirleyen utility fonksiyonu
function getAnalysisTypeFromReportType(reportType: string): 'damage' | 'paint' | 'engine' | 'value' | 'comprehensive' {
  const typeMap: Record<string, 'damage' | 'paint' | 'engine' | 'value' | 'comprehensive'> = {
    'DAMAGE_ASSESSMENT': 'damage',
    'DAMAGE_DETECTION': 'damage',
    'PAINT_ANALYSIS': 'paint',
    'ENGINE_SOUND_ANALYSIS': 'engine',
    'AUDIO_ANALYSIS': 'engine',
    'VALUE_ESTIMATION': 'value',
    'COMPREHENSIVE_EXPERTISE': 'comprehensive',
    'FULL_REPORT': 'comprehensive',
  }

  return typeMap[reportType] || 'comprehensive'
}

// ... (Normalize functions kept same as before for stability) ...
// NOTE: In a real refactor, these should be moved to a utility file.
// For now, I'm including them to ensure the file works standalone.

function normalizeDamageReportData(apiData: any) {
  const reportData = apiData.report || apiData
  const aiAnalysisData = reportData?.aiAnalysisData || apiData?.aiAnalysisData || {}
  return {
    id: reportData?.id || apiData?.id,
    vehicleInfo: {
      plate: reportData?.vehiclePlate || apiData?.vehiclePlate || '',
      brand: reportData?.vehicleBrand || apiData?.vehicleBrand || '',
      model: reportData?.vehicleModel || apiData?.vehicleModel || '',
      year: reportData?.vehicleYear || apiData?.vehicleYear || 0,
      vin: reportData?.vehicleVin || apiData?.vehicleVin || '',
      color: reportData?.vehicleColor || apiData?.vehicleColor || '',
      mileage: reportData?.mileage || apiData?.mileage || 0,
      fuelType: reportData?.fuelType || apiData?.fuelType || '',
      transmission: reportData?.transmission || apiData?.transmission || '',
      engine: reportData?.engine || apiData?.engine || '',
      bodyType: reportData?.bodyType || apiData?.bodyType || '',
    },
    reportType: reportData?.reportType || 'damage',
    status: reportData?.status || apiData?.status || 'COMPLETED',
    createdAt: reportData?.createdAt || apiData?.createdAt || new Date().toISOString(),
    totalCost: reportData?.totalCost || apiData?.totalCost || 0,
    overallScore: aiAnalysisData?.overallScore || aiAnalysisData?.genelDeğerlendirme?.satışDeğeri || 0,
    expertNotes: reportData?.expertNotes || apiData?.expertNotes || null,
    aiAnalysisData: aiAnalysisData,
    vehicleImages: reportData?.vehicleImages || apiData?.vehicleImages || []
  }
}

function normalizePaintReportData(apiData: any) {
  const reportData = apiData.report || apiData
  const aiAnalysisData = reportData?.aiAnalysisData || apiData?.aiAnalysisData || {}
  return {
    id: reportData?.id || apiData?.id,
    vehicleInfo: {
      plate: reportData?.vehiclePlate || apiData?.vehiclePlate || '',
      brand: reportData?.vehicleBrand || apiData?.vehicleBrand || '',
      model: reportData?.vehicleModel || apiData?.vehicleModel || '',
      year: reportData?.vehicleYear || apiData?.vehicleYear || 0,
      vin: reportData?.vehicleVin || apiData?.vehicleVin || '',
      color: reportData?.vehicleColor || apiData?.vehicleColor || '',
      mileage: reportData?.mileage || apiData?.mileage || 0,
      fuelType: reportData?.fuelType || apiData?.fuelType || '',
      transmission: reportData?.transmission || apiData?.transmission || '',
      engine: reportData?.engine || apiData?.engine || '',
      bodyType: reportData?.bodyType || apiData?.bodyType || '',
    },
    reportType: reportData?.reportType || 'paint',
    status: reportData?.status || apiData?.status || 'COMPLETED',
    createdAt: reportData?.createdAt || apiData?.createdAt || new Date().toISOString(),
    totalCost: reportData?.totalCost || apiData?.totalCost || 0,
    overallScore: aiAnalysisData?.boyaKalitesi?.genelPuan || aiAnalysisData?.overallScore || 0,
    expertNotes: reportData?.expertNotes || apiData?.expertNotes || null,
    aiAnalysisData: aiAnalysisData,
    vehicleImages: reportData?.vehicleImages || apiData?.vehicleImages || []
  }
}

function normalizeAudioReportData(apiData: any) {
  const reportData = apiData.report || apiData
  const aiAnalysisData = reportData?.aiAnalysisData || apiData?.aiAnalysisData || {}
  return {
    id: reportData?.id || apiData?.id,
    vehicleInfo: {
      plate: reportData?.vehiclePlate || apiData?.vehiclePlate || '',
      brand: reportData?.vehicleBrand || apiData?.vehicleBrand || '',
      model: reportData?.vehicleModel || apiData?.vehicleModel || '',
      year: reportData?.vehicleYear || apiData?.vehicleYear || 0,
      vin: reportData?.vehicleVin || apiData?.vehicleVin || '',
      color: reportData?.vehicleColor || apiData?.vehicleColor || '',
      mileage: reportData?.mileage || apiData?.mileage || 0,
      fuelType: reportData?.fuelType || apiData?.fuelType || '',
      transmission: reportData?.transmission || apiData?.transmission || '',
      engine: reportData?.engine || apiData?.engine || '',
      bodyType: reportData?.bodyType || apiData?.bodyType || '',
    },
    reportType: reportData?.reportType || 'engine',
    status: reportData?.status || apiData?.status || 'COMPLETED',
    createdAt: reportData?.createdAt || apiData?.createdAt || new Date().toISOString(),
    totalCost: reportData?.totalCost || apiData?.totalCost || 0,
    overallScore: aiAnalysisData?.overallScore || 0,
    expertNotes: reportData?.expertNotes || apiData?.expertNotes || null,
    aiAnalysisData: aiAnalysisData,
    vehicleImages: reportData?.vehicleImages || apiData?.vehicleImages || []
  }
}

function normalizeValueReportData(apiData: any) {
  const reportData = apiData.report || apiData
  const aiAnalysisData = reportData?.aiAnalysisData || apiData?.aiAnalysisData || {}
  return {
    id: reportData?.id || apiData?.id,
    vehicleInfo: {
      plate: reportData?.vehiclePlate || apiData?.vehiclePlate || '',
      brand: reportData?.vehicleBrand || apiData?.vehicleBrand || '',
      model: reportData?.vehicleModel || apiData?.vehicleModel || '',
      year: reportData?.vehicleYear || apiData?.vehicleYear || 0,
      vin: reportData?.vehicleVin || apiData?.vehicleVin || '',
      color: reportData?.vehicleColor || apiData?.vehicleColor || '',
      mileage: reportData?.mileage || apiData?.mileage || 0,
      fuelType: reportData?.fuelType || apiData?.fuelType || '',
      transmission: reportData?.transmission || apiData?.transmission || '',
      engine: reportData?.engine || apiData?.engine || '',
      bodyType: reportData?.bodyType || apiData?.bodyType || '',
    },
    reportType: reportData?.reportType || 'value',
    status: reportData?.status || apiData?.status || 'COMPLETED',
    createdAt: reportData?.createdAt || apiData?.createdAt || new Date().toISOString(),
    totalCost: reportData?.totalCost || apiData?.totalCost || 0,
    overallScore: 0,
    expertNotes: reportData?.expertNotes || apiData?.expertNotes || null,
    aiAnalysisData: aiAnalysisData,
    vehicleImages: reportData?.vehicleImages || apiData?.vehicleImages || [],
    marketValue: {
      estimatedValue: aiAnalysisData?.estimatedValue || 0,
      marketRange: aiAnalysisData?.marketAnalysis?.priceRange || { min: 0, max: 0, average: 0 },
      depreciation: aiAnalysisData?.vehicleCondition?.depreciation || 0,
      comparison: aiAnalysisData?.marketPosition?.priceComparison || 'Değerlendiriliyor'
    }
  }
}

function normalizeComprehensiveReportData(apiData: any) {
  const reportData = apiData.report || apiData
  const aiAnalysisData = reportData?.aiAnalysisData || apiData?.aiAnalysisData || {}
  return {
    id: reportData?.id || apiData?.id,
    vehicleInfo: {
      plate: reportData?.vehiclePlate || apiData?.vehiclePlate || '',
      brand: reportData?.vehicleBrand || apiData?.vehicleBrand || '',
      model: reportData?.vehicleModel || apiData?.vehicleModel || '',
      year: reportData?.vehicleYear || apiData?.vehicleYear || 0,
      vin: reportData?.vehicleVin || apiData?.vehicleVin || '',
      color: reportData?.vehicleColor || apiData?.vehicleColor || '',
      mileage: reportData?.mileage || apiData?.mileage || 0,
      fuelType: reportData?.fuelType || apiData?.fuelType || '',
      transmission: reportData?.transmission || apiData?.transmission || '',
      engine: reportData?.engine || apiData?.engine || '',
      bodyType: reportData?.bodyType || apiData?.bodyType || '',
    },
    reportType: reportData?.reportType || 'comprehensive',
    status: reportData?.status || apiData?.status || 'COMPLETED',
    createdAt: reportData?.createdAt || apiData?.createdAt || new Date().toISOString(),
    totalCost: reportData?.totalCost || apiData?.totalCost || 0,
    overallScore: aiAnalysisData?.overallScore || 0,
    expertNotes: reportData?.expertNotes || apiData?.expertNotes || null,
    aiAnalysisData: aiAnalysisData,
    vehicleImages: reportData?.vehicleImages || apiData?.vehicleImages || []
  }
}

function normalizeReportData(apiData: any, analysisType: string) {
  switch (analysisType) {
    case 'damage': return normalizeDamageReportData(apiData)
    case 'paint': return normalizePaintReportData(apiData)
    case 'engine': return normalizeAudioReportData(apiData)
    case 'value': return normalizeValueReportData(apiData)
    case 'comprehensive': return normalizeComprehensiveReportData(apiData)
    default:
      const reportData = apiData.report || apiData
      const aiAnalysisData = reportData?.aiAnalysisData || apiData?.aiAnalysisData || {}
      return {
        id: reportData?.id || apiData?.id,
        vehicleInfo: {
          plate: reportData?.vehiclePlate || apiData?.vehiclePlate || '',
          brand: reportData?.vehicleBrand || apiData?.vehicleBrand || '',
          model: reportData?.vehicleModel || apiData?.vehicleModel || '',
          year: reportData?.vehicleYear || apiData?.vehicleYear || 0,
          vin: reportData?.vehicleVin || apiData?.vehicleVin || '',
          color: reportData?.vehicleColor || apiData?.vehicleColor || '',
          mileage: reportData?.mileage || apiData?.mileage || 0,
          fuelType: reportData?.fuelType || apiData?.fuelType || '',
          transmission: reportData?.transmission || apiData?.transmission || '',
          engine: reportData?.engine || apiData?.engine || '',
          bodyType: reportData?.bodyType || apiData?.bodyType || '',
        },
        reportType: reportData?.reportType || analysisType,
        status: reportData?.status || apiData?.status || 'COMPLETED',
        createdAt: reportData?.createdAt || apiData?.createdAt || new Date().toISOString(),
        totalCost: reportData?.totalCost || apiData?.totalCost || 0,
        overallScore: aiAnalysisData?.overallScore || 0,
        expertNotes: reportData?.expertNotes || apiData?.expertNotes || null,
        aiAnalysisData: aiAnalysisData,
        vehicleImages: reportData?.vehicleImages || apiData?.vehicleImages || []
      }
  }
}

export function ReportDetailClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<any>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<'damage' | 'paint' | 'engine' | 'value' | 'comprehensive'>('damage')

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)

        const reportsResponse = await api.get('/api/user/reports')

        if (!reportsResponse.data?.success) {
          throw new Error('Raporlar alınamadı')
        }

        const reports = reportsResponse.data.data?.reports || []
        const reportData = reports.find((r: any) => r.id.toString() === reportId.toString())

        if (!reportData) {
          throw new Error('Rapor bulunamadı')
        }

        const detectedAnalysisType = getAnalysisTypeFromReportType(reportData.reportType)
        setAnalysisType(detectedAnalysisType)

        let response
        switch (detectedAnalysisType) {
          case 'damage': response = await analysisAPI.damageAnalysis.getReport(reportId); break
          case 'paint': response = await analysisAPI.paintAnalysis.getReport(reportId); break
          case 'engine': response = await analysisAPI.audioAnalysis.getReport(reportId); break
          case 'value': response = await analysisAPI.valueEstimation.getReport(reportId); break
          case 'comprehensive': response = await analysisAPI.comprehensiveExpertise.getReport(reportId); break
          default: throw new Error('Geçersiz analiz tipi')
        }

        if (!response || !response.data) {
          throw new Error('Rapor verisi alınamadı')
        }

        const normalizedData = normalizeReportData(response.data, detectedAnalysisType)
        setReport(normalizedData)
      } catch (err: any) {
        console.error('Rapor yükleme hatası:', err)
        const errorMessage = err.response?.data?.message || err.message || 'Rapor yüklenirken bir hata oluştu'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      fetchReport()
    }
  }, [reportId])

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const { reportService } = await import('@/services/reportService')
      const blob = await reportService.downloadReportPDF(reportId, report?.reportType)
      if (!blob) throw new Error('PDF indirilemedi')

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mivvo-expertiz-raporu-${report?.vehicleInfo?.plate || reportId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF başarıyla indirildi!')
    } catch (error: any) {
      console.error('PDF oluşturma hatası:', error)
      toast.error(error?.message || 'PDF indirilemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <ReportLoading
        type={analysisType}
        vehicleInfo={{
          plate: reportId,
          make: 'Yükleniyor',
          model: '...',
          year: new Date().getFullYear()
        }}
        progress={75}
        estimatedTime={analysisType === 'comprehensive' ? '2-3 dakika' : '30-60 saniye'}
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-medium hover:from-gray-900 hover:to-black transition-all shadow-lg hover:shadow-xl"
          >
            Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    )
  }

  if (!report) return null

  // FAILED state
  if (report.status === 'FAILED') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analiz Tamamlanamadı</h2>

            <div className="bg-red-50 rounded-xl p-6 mb-8 text-left border border-red-100">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Sorun Detayı
              </h3>
              <p className="text-red-700">
                AI servisinden beklenen yanıt alınamadı. Bu durum genellikle geçici bir bağlantı sorunundan kaynaklanır.
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6 mb-8 text-left border border-green-100">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                Kredi İadesi Yapıldı
              </h3>
              <p className="text-green-700">
                Kullanılan kredi hesabınıza otomatik olarak iade edilmiştir. Ücret yansıtılmamıştır.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Dashboard&apos;a Dön
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Premium Gradient Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navbar */}
          <div className="flex items-center justify-between h-20 border-b border-white/10">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors group"
            >
              <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                <ArrowLeftIcon className="w-5 h-5" />
              </div>
              <span className="font-medium">Dashboard</span>
            </Link>

            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                Mivvo Expertiz
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all disabled:opacity-50 border border-white/10"
              >
                {isGeneratingPDF ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowDownTrayIcon className="w-5 h-5" />
                )}
                <span className="font-medium">PDF İndir</span>
              </button>
            </div>
          </div>

          {/* Hero Content */}
          <div className="py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-200 border border-purple-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    {report.reportType === 'comprehensive' ? 'Kapsamlı Ekspertiz' :
                      report.reportType === 'damage' ? 'Hasar Analizi' :
                        report.reportType === 'paint' ? 'Boya Analizi' :
                          report.reportType === 'engine' ? 'Motor Ses Analizi' :
                            report.reportType === 'value' ? 'Değer Tahmini' : 'Ekspertiz Raporu'}
                  </span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-200 border border-green-500/30 rounded-full text-sm font-medium backdrop-blur-sm flex items-center">
                    <CheckBadgeIcon className="w-4 h-4 mr-1" />
                    Tamamlandı
                  </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                  {report.vehicleInfo.brand} {report.vehicleInfo.model}
                </h1>
                <div className="flex items-center text-white/60 space-x-4 text-lg">
                  <span>{report.vehicleInfo.year}</span>
                  <span>•</span>
                  <span>{report.vehicleInfo.plate}</span>
                  <span>•</span>
                  <span>{report.vehicleInfo.mileage.toLocaleString()} km</span>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[300px]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white/60">Rapor Tarihi</span>
                  <span className="text-white font-medium">
                    {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Rapor ID</span>
                  <span className="font-mono text-white/80 bg-black/20 px-2 py-1 rounded text-sm">
                    #{report.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <FadeInUp>
          {analysisType === 'damage' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <DamageReport
                data={report.aiAnalysisData as DamageAnalysisResult}
                vehicleInfo={report.vehicleInfo}
                vehicleImages={report.vehicleImages || []}
                showActions={true}
              />
            </div>
          )}

          {analysisType === 'paint' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <PaintReport
                report={report.aiAnalysisData as any}
                vehicleInfo={report.vehicleInfo}
                vehicleImages={report.vehicleImages || []}
                onGeneratePDF={generatePDF}
                isGeneratingPDF={isGeneratingPDF}
              />
            </div>
          )}

          {analysisType === 'engine' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <AudioReport
                data={report.aiAnalysisData as AudioAnalysisResult}
                vehicleInfo={report.vehicleInfo}
                vehicleImages={report.vehicleImages || []}
                showActions={true}
              />
            </div>
          )}

          {analysisType === 'value' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <ValueReport
                data={report.aiAnalysisData as ValueEstimationResult}
                vehicleInfo={report.vehicleInfo}
                vehicleImages={report.vehicleImages || []}
                showActions={true}
              />
            </div>
          )}

          {analysisType === 'comprehensive' && (
            <ComprehensiveReport
              data={report.aiAnalysisData as ComprehensiveExpertiseResult}
              vehicleInfo={report.vehicleInfo}
              vehicleImages={report.vehicleImages || []}
              showActions={true}
            />
          )}
        </FadeInUp>
      </div>
    </div>
  )
}
