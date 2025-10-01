'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { generateComprehensiveExpertisePDF } from '@/utils/pdfComprehensiveExpertise'

interface ComprehensiveReport {
  id: number
  vehiclePlate: string
  vehicleBrand: string
  vehicleModel: string
  vehicleYear: number
  reportType: string
  status: string
  createdAt: string
  aiAnalysisData: {
    overallScore: number
    expertiseGrade: string
    comprehensiveSummary: {
      vehicleOverview: string
      keyFindings: string[]
      criticalIssues: string[]
      strengths: string[]
      weaknesses: string[]
    }
    expertOpinion: {
      recommendation: string
      reasoning: string[]
    }
    finalRecommendations: {
      immediate: Array<{ priority: string; action: string; cost: number }>
      shortTerm: Array<{ priority: string; action: string; cost: number }>
      longTerm: Array<{ priority: string; action: string; cost: number }>
    }
    aiProvider: string
    model: string
    confidence: number
  }
}

function ComprehensiveReportContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId')
  const [report, setReport] = useState<ComprehensiveReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const generatePDF = async () => {
    if (!report) return

    setIsGeneratingPDF(true)
    try {
      const vehicleInfo = {
        make: report.vehicleBrand,
        model: report.vehicleModel,
        year: report.vehicleYear,
        plate: report.vehiclePlate
      }
      
      const reportData = {
        ...report,
        vehicleInfo
      }
      
      await generateComprehensiveExpertisePDF(reportData, report.aiAnalysisData)
      toast.success('PDF başarıyla oluşturuldu!')
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      toast.error('PDF oluşturulurken hata oluştu!')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        toast.error('Rapor ID bulunamadı')
        setLoading(false)
        return
      }

      try {
        const response = await api.get(`/comprehensive-expertise/${reportId}`)
        if (response.data.success) {
          setReport(response.data.data)
        } else {
          toast.error('Rapor yüklenemedi')
        }
      } catch (error) {
        console.error('Rapor yükleme hatası:', error)
        toast.error('Rapor yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rapor yükleniyor...</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Dashboard'a Dön
            </Link>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handlePrint}
                className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <PrinterIcon className="w-5 h-5 mr-2" />
                Yazdır
              </button>
              <button 
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                {isGeneratingPDF ? 'PDF Oluşturuluyor...' : 'PDF İndir'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rapor Başlığı */}
        <FadeInUp>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <SparklesIcon className="w-8 h-8 mr-2" />
                  <h1 className="text-3xl font-bold">Kapsamlı Expertiz Raporu</h1>
                </div>
                <p className="text-xl mt-2">
                  {report.vehicleBrand} {report.vehicleModel} - {report.vehicleYear}
                </p>
                <p className="text-sm opacity-90">Plaka: {report.vehiclePlate}</p>
              </div>
              <div className="text-right">
                <div className="text-6xl font-bold mb-2">{analysis.overallScore}/100</div>
                <div className="text-lg opacity-90">{analysis.expertiseGrade}</div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Genel Bakış */}
        {analysis.comprehensiveSummary && (
          <FadeInUp delay={0.1}>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Genel Bakış</h2>
              <p className="text-gray-700 mb-4">{analysis.comprehensiveSummary.vehicleOverview}</p>
              
              {/* Önemli Bulgular */}
              {analysis.comprehensiveSummary.keyFindings && analysis.comprehensiveSummary.keyFindings.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-2">🔍 Önemli Bulgular:</h3>
                  <ul className="space-y-1">
                    {analysis.comprehensiveSummary.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span className="text-gray-700">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kritik Sorunlar */}
              {analysis.comprehensiveSummary.criticalIssues && analysis.comprehensiveSummary.criticalIssues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-red-900 mb-2">⚠️ Kritik Sorunlar:</h3>
                  <ul className="space-y-1">
                    {analysis.comprehensiveSummary.criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span className="text-red-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Güçlü Yönler */}
                {analysis.comprehensiveSummary.strengths && analysis.comprehensiveSummary.strengths.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">✅ Güçlü Yönler:</h3>
                    <ul className="space-y-1">
                      {analysis.comprehensiveSummary.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span className="text-green-700 text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Zayıf Yönler */}
                {analysis.comprehensiveSummary.weaknesses && analysis.comprehensiveSummary.weaknesses.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Zayıf Yönler:</h3>
                    <ul className="space-y-1">
                      {analysis.comprehensiveSummary.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span className="text-yellow-700 text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Uzman Görüşü */}
        {analysis.expertOpinion && (
          <FadeInUp delay={0.2}>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">👨‍🔧 Uzman Görüşü</h2>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-4">
                <p className="font-semibold text-blue-900">
                  Öneri: {analysis.expertOpinion.recommendation}
                </p>
              </div>
              {analysis.expertOpinion.reasoning && analysis.expertOpinion.reasoning.length > 0 && (
                <ul className="space-y-2">
                  {analysis.expertOpinion.reasoning.map((reason, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FadeInUp>
        )}

        {/* Öneriler */}
        {analysis.finalRecommendations && (
          <FadeInUp delay={0.3}>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Öneriler</h2>
              
              {/* Acil Öneriler */}
              {analysis.finalRecommendations.immediate && analysis.finalRecommendations.immediate.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-red-900 mb-3">🚨 Acil Müdahale Gerekli:</h3>
                  <div className="space-y-2">
                    {analysis.finalRecommendations.immediate.map((item, index) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-red-900">{item.action}</span>
                            <p className="text-sm text-red-700 mt-1">Öncelik: {item.priority}</p>
                          </div>
                          <span className="font-bold text-red-900">₺{item.cost.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kısa Vadeli Öneriler */}
              {analysis.finalRecommendations.shortTerm && analysis.finalRecommendations.shortTerm.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-yellow-900 mb-3">⏰ Kısa Vadede Yapılmalı:</h3>
                  <div className="space-y-2">
                    {analysis.finalRecommendations.shortTerm.map((item, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-yellow-900">{item.action}</span>
                            <p className="text-sm text-yellow-700 mt-1">Öncelik: {item.priority}</p>
                          </div>
                          <span className="font-bold text-yellow-900">₺{item.cost.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uzun Vadeli Öneriler */}
              {analysis.finalRecommendations.longTerm && analysis.finalRecommendations.longTerm.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-900 mb-3">📅 Uzun Vadeli Planlama:</h3>
                  <div className="space-y-2">
                    {analysis.finalRecommendations.longTerm.map((item, index) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium text-blue-900">{item.action}</span>
                            <p className="text-sm text-blue-700 mt-1">Öncelik: {item.priority}</p>
                          </div>
                          <span className="font-bold text-blue-900">₺{item.cost.toLocaleString('tr-TR')}</span>
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
        <FadeInUp delay={0.4}>
          <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-600">
            <p>
              Bu kapsamlı rapor {analysis.aiProvider} tarafından %{analysis.confidence} güvenilirlik ile oluşturulmuştur.
            </p>
            <p className="mt-1 text-xs">
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

export default function ComprehensiveReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    }>
      <ComprehensiveReportContent />
    </Suspense>
  )
}
