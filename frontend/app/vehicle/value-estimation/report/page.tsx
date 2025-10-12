'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { savePageAsPDF } from '@/lib/savePageAsPDF'
import { ReportLoading } from '@/components/ui/ReportLoading'
import { ReportError } from '@/components/ui/ReportError'

interface ValueEstimationReport {
  id: number
  vehiclePlate: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear: number
  reportType: string
  status: string
  createdAt: string
  aiAnalysisData: any
}

function ValueEstimationReportContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId')
  const [report, setReport] = useState<ValueEstimationReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!report) return

    try {
      await savePageAsPDF('report-content', `deger-tahmini-${report.vehiclePlate}.pdf`)
      toast.success('Rapor başarıyla kaydedildi!')
    } catch (error) {
      console.error('PDF kaydetme hatası:', error)
      toast.error('Rapor kaydedilirken hata oluştu!')
    }
  }

  const fetchReport = async () => {
    if (!reportId) {
      setError('not_found')
      setLoading(false)
      return
    }

    try {
      setError(null)
      setLoading(true)
      
      const response = await api.get(`/value-estimation/${reportId}`)
      if (response.data.success) {
        const reportData = response.data.data
        
        // Rapor FAILED durumunda ise hata göster
        if (reportData.status === 'FAILED') {
          setError('ai_failed')
          setLoading(false)
          return
        }
        
        // Rapor PROCESSING durumundaysa bekle
        if (reportData.status === 'PROCESSING' || reportData.status === 'PENDING') {
          // 1 saniye sonra tekrar kontrol et (hızlı response)
          setTimeout(fetchReport, 1000)
          return
        }
        
        setReport(reportData)
      } else {
        setError('generic')
      }
    } catch (error: any) {
      console.error('Rapor yükleme hatası:', error)
      
      // Hata tipini belirle
      if (error.message?.includes('Network') || error.message?.includes('network')) {
        setError('network_error')
      } else if (error.response?.status === 404) {
        setError('not_found')
      } else if (error.message?.includes('yoğun') || error.message?.includes('busy')) {
        setError('ai_busy')
      } else {
        setError('generic')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [reportId])

  if (loading) {
    return (
      <ReportLoading
        type="value"
        vehicleInfo={report ? {
          make: report.vehicleBrand,
          model: report.vehicleModel,
          year: report.vehicleYear,
          plate: report.vehiclePlate
        } : undefined}
        progress={80}
        estimatedTime="30-45 saniye"
      />
    )
  }

  if (error) {
    return (
      <ReportError
        type={error as any}
        creditRefunded={error === 'ai_failed'}
        onRetry={fetchReport}
        showDashboardLink={true}
        showSupportLink={true}
      />
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rapor Bulunamadı</h2>
          <p className="text-gray-600 mb-4">İstediğiniz rapor bulunamadı veya erişim yetkiniz yok.</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
            Dashboard'a Dön
          </Link>
        </div>
      </div>
    )
  }

  const analysis = report.aiAnalysisData

  return (
    <div id="report-content" className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Dashboard'a Dön
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rapor Başlığı */}
        <FadeInUp>
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <SparklesIcon className="w-8 h-8 text-blue-600 mr-3" />
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Değer Tahmini Raporu
                  </h1>
                </div>
                <p className="text-2xl text-gray-800 font-semibold mt-2">
                  {report.vehicleBrand} {report.vehicleModel}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>📅 {report.vehicleYear} Model</span>
                  <span>•</span>
                  <span>🚗 {report.vehiclePlate}</span>
                  <span>•</span>
                  <span>📊 %{analysis.confidence || 0} Güvenilirlik</span>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 shadow-sm">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Tamamlandı
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(report.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Tahmini Değer - Hero Section */}
        <FadeInUp delay={0.1}>
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl shadow-2xl p-12 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="text-center">
                <CurrencyDollarIcon className="w-20 h-20 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-4 opacity-90">Tahmini Piyasa Değeri</h2>
                <div className="text-7xl font-black mb-6 drop-shadow-lg">
                  ₺{analysis.estimatedValue?.toLocaleString('tr-TR') || '0'}
                </div>
                
                {analysis.marketAnalysis?.priceRange && (
                  <div className="flex items-center justify-center space-x-8 text-lg bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
                    <div>
                      <span className="opacity-75 block text-sm mb-1">Minimum</span>
                      <span className="font-bold text-2xl">
                        ₺{analysis.marketAnalysis.priceRange.min?.toLocaleString('tr-TR') || '0'}
                      </span>
                    </div>
                    <div className="w-px h-12 bg-white opacity-30"></div>
                    <div>
                      <span className="opacity-75 block text-sm mb-1">Ortalama</span>
                      <span className="font-bold text-2xl">
                        ₺{analysis.marketAnalysis.priceRange.average?.toLocaleString('tr-TR') || '0'}
                      </span>
                    </div>
                    <div className="w-px h-12 bg-white opacity-30"></div>
                    <div>
                      <span className="opacity-75 block text-sm mb-1">Maksimum</span>
                      <span className="font-bold text-2xl">
                        ₺{analysis.marketAnalysis.priceRange.max?.toLocaleString('tr-TR') || '0'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Piyasa Analizi */}
          <FadeInUp delay={0.2}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ChartBarIcon className="w-7 h-7 mr-3 text-blue-600" />
                Piyasa Analizi
              </h3>
              <div className="space-y-4">
                {analysis.marketAnalysis?.marketTrend && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-900">📈 Piyasa Trendi:</span>
                    </div>
                    <p className="text-blue-800 font-semibold">{analysis.marketAnalysis.marketTrend}</p>
                  </div>
                )}
                
                {analysis.marketAnalysis?.demandLevel && (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-green-900">🔥 Talep Seviyesi:</span>
                    </div>
                    <p className="text-green-800 font-semibold">{analysis.marketAnalysis.demandLevel}</p>
                  </div>
                )}

                {analysis.marketAnalysis?.seasonalImpact && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-purple-900">🌸 Mevsimsel Etki:</span>
                    </div>
                    <p className="text-purple-800 font-semibold">{analysis.marketAnalysis.seasonalImpact}</p>
                  </div>
                )}
              </div>

              {analysis.marketAnalysis?.marketInsights && analysis.marketAnalysis.marketInsights.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
                    Piyasa İçgörüleri
                  </h4>
                  <ul className="space-y-2">
                    {analysis.marketAnalysis.marketInsights.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <span className="text-blue-500 mr-2 mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </FadeInUp>

          {/* Yatırım Analizi */}
          <FadeInUp delay={0.3}>
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <ArrowTrendingUpIcon className="w-7 h-7 mr-3 text-green-600" />
                Yatırım Analizi
              </h3>
              <div className="space-y-4">
                {analysis.investmentAnalysis?.investmentGrade && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-900">💎 Yatırım Notu:</span>
                      <span className="font-bold text-lg text-green-700">{analysis.investmentAnalysis.investmentGrade}</span>
                    </div>
                  </div>
                )}

                {analysis.investmentAnalysis?.liquidityScore !== undefined && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-900">💧 Likidite Skoru:</span>
                      <span className="font-bold text-lg text-blue-700">{analysis.investmentAnalysis.liquidityScore}/100</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analysis.investmentAnalysis.liquidityScore}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {analysis.investmentAnalysis?.riskLevel && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-yellow-900">⚠️ Risk Seviyesi:</span>
                      <span className="font-bold text-yellow-700">{analysis.investmentAnalysis.riskLevel}</span>
                    </div>
                  </div>
                )}

                {analysis.investmentAnalysis?.depreciationRate && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-red-900">📉 Değer Kaybı:</span>
                      <span className="font-semibold text-red-700 text-right">{analysis.investmentAnalysis.depreciationRate}</span>
                    </div>
                  </div>
                )}
              </div>

              {analysis.investmentAnalysis?.investmentNotes && analysis.investmentAnalysis.investmentNotes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">📝 Yatırım Notları</h4>
                  <ul className="space-y-2">
                    {analysis.investmentAnalysis.investmentNotes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start text-sm text-gray-700">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </FadeInUp>
        </div>

        {/* Fiyat Stratejisi */}
        {analysis.recommendations?.sellingPrice && (
          <FadeInUp delay={0.4}>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-8 mb-8 text-white">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <CurrencyDollarIcon className="w-7 h-7 mr-3" />
                Fiyat Stratejisi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-2">Minimum Fiyat</div>
                  <div className="text-3xl font-bold">₺{analysis.recommendations.sellingPrice.min?.toLocaleString('tr-TR')}</div>
                  <div className="text-xs opacity-75 mt-2">Acele satış için</div>
                </div>
                <div className="bg-white bg-opacity-30 rounded-lg p-6 backdrop-blur-sm border-2 border-white">
                  <div className="text-sm opacity-90 mb-2">⭐ Optimal Fiyat</div>
                  <div className="text-4xl font-bold">₺{analysis.recommendations.sellingPrice.optimal?.toLocaleString('tr-TR')}</div>
                  <div className="text-xs opacity-75 mt-2">Önerilen satış fiyatı</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
                  <div className="text-sm opacity-90 mb-2">Maksimum Fiyat</div>
                  <div className="text-3xl font-bold">₺{analysis.recommendations.sellingPrice.max?.toLocaleString('tr-TR')}</div>
                  <div className="text-xs opacity-75 mt-2">Sabırlı satış için</div>
                </div>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Öneriler */}
        {analysis.recommendations?.negotiationTips && analysis.recommendations.negotiationTips.length > 0 && (
          <FadeInUp delay={0.5}>
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <LightBulbIcon className="w-7 h-7 mr-3 text-yellow-500" />
                Uzman Önerileri
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pazarlık İpuçları */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2 text-blue-600">💬</span>
                    Pazarlık İpuçları
                  </h4>
                  <ul className="space-y-3">
                    {analysis.recommendations.negotiationTips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Zamanlama Tavsiyeleri */}
                {analysis.recommendations.timingAdvice && analysis.recommendations.timingAdvice.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2 text-green-600">⏰</span>
                      Zamanlama Tavsiyeleri
                    </h4>
                    <ul className="space-y-3">
                      {analysis.recommendations.timingAdvice.map((advice: string, index: number) => (
                        <li key={index} className="flex items-start bg-green-50 rounded-lg p-3 border border-green-100">
                          <ClockIcon className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Değer Artırıcı Öneriler */}
              {analysis.recommendations.improvementSuggestions && analysis.recommendations.improvementSuggestions.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-2 text-purple-600">🔧</span>
                    Değer Artırıcı İyileştirmeler
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.recommendations.improvementSuggestions.map((suggestion: any, index: number) => (
                      <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                        <div className="font-semibold text-gray-900 mb-2">{suggestion.action}</div>
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-red-600">Maliyet: ₺{suggestion.cost?.toLocaleString('tr-TR')}</span>
                          <span className="text-green-600 font-semibold">Kazanç: ₺{suggestion.valueIncrease?.toLocaleString('tr-TR')}</span>
                        </div>
                        <p className="text-xs text-gray-600">{suggestion.description}</p>
                        <div className="mt-2 pt-2 border-t border-purple-200">
                          <span className="text-xs font-semibold text-purple-700">
                            Net Kazanç: ₺{(suggestion.valueIncrease - suggestion.cost)?.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FadeInUp>
        )}

        {/* AI Bilgisi */}
        <FadeInUp delay={0.6}>
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 text-center border border-gray-300">
            <div className="flex items-center justify-center mb-2">
              <ShieldCheckIcon className="w-5 h-5 text-gray-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Yapay Zeka Destekli Analiz</span>
            </div>
            <p className="text-sm text-gray-600">
              Bu rapor Mivvo AI tarafından %{analysis.confidence} güvenilirlik ile oluşturulmuştur.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Rapor tarihi: {new Date(report.createdAt).toLocaleDateString('tr-TR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}

export default function ValueEstimationReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ValueEstimationReportContent />
    </Suspense>
  )
}
