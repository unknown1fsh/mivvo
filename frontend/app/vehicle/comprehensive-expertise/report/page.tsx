'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import toast from 'react-hot-toast'
import api from '@/lib/api'
import { savePageAsPDF } from '@/lib/savePageAsPDF'
import { ReportLoading } from '@/components/ui/ReportLoading'
import { ReportError } from '@/components/ui/ReportError'

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
      vehicleSpecsTable?: {
        makeModel: string;
        year: string;
        engineType: string;
        transmission: string;
        driveType: string;
        color: string;
        plate: string;
      };
      exteriorConditionTable?: {
        bodywork: { status: string; note: string };
        paint: { status: string; note: string };
        windows: { status: string; note: string };
        lights: { status: string; note: string };
        mirrors: { status: string; note: string };
      };
      mechanicalAnalysisTable?: {
        engine: { status: string; note: string };
        transmission: { status: string; note: string };
        suspension: { status: string; note: string };
        brakes: { status: string; note: string };
        electrical: { status: string; note: string };
      };
      expertiseScoreTable?: {
        bodyPaint: { score: number; status: string; note: string };
        chassis: { score: number; status: string; note: string };
        mechanical: { score: number; status: string; note: string };
        electrical: { score: number; status: string; note: string };
        tires: { score: number; status: string; note: string };
        wheels: { score: number; status: string; note: string };
        interior: { score: number; status: string; note: string };
        overall: { score: number; status: string; note: string };
      };
      marketValueTable?: {
        asIs: { min: number; max: number; note: string };
        afterRepair: { min: number; max: number; note: string };
        restored: { min: number; note: string };
      };
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
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState({ step: 3, total: 4, name: 'Kapsamlı Rapor Hazırlanıyor' })

  const handleSave = async () => {
    if (!report) return

    try {
      await savePageAsPDF('report-content', `tam-expertiz-${report.vehiclePlate}.pdf`)
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
      
      const response = await api.get(`/comprehensive-expertise/${reportId}`)
      if (response.data.success) {
        const reportData = response.data.data
        
        // Rapor FAILED durumunda ise hata göster
        if (reportData.status === 'FAILED') {
          setError('ai_failed')
          setLoading(false)
          return
        }
        
        // Rapor PROCESSING durumundaysa adım güncelle ve bekle
        if (reportData.status === 'PROCESSING' || reportData.status === 'PENDING') {
          setCurrentStep({ step: 3, total: 4, name: 'Tam Ekspertiz Oluşturuluyor' })
          // 1 saniye sonra tekrar kontrol et (hızlı response için)
          setTimeout(fetchReport, 1000)
          return
        }
        
        setReport(reportData)
        setCurrentStep({ step: 4, total: 4, name: 'Tamamlandı' })
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
        type="comprehensive"
        vehicleInfo={report ? {
          make: report.vehicleBrand,
          model: report.vehicleModel,
          year: report.vehicleYear,
          plate: report.vehiclePlate
        } : undefined}
        progress={85}
        estimatedTime="2-3 dakika"
        currentStep={currentStep}
      />
    )
  }

  if (error) {
    return (
      <ReportError
        type={error as any}
        creditRefunded={error === 'ai_failed'}
        refundedAmount={error === 'ai_failed' ? 85 : undefined}
        onRetry={fetchReport}
        showDashboardLink={true}
        showSupportLink={true}
      />
    )
  }

  if (!report) {
    return (
      <ReportError
        type="not_found"
        showDashboardLink={true}
        showSupportLink={false}
      />
    )
  }

  const analysis = report.aiAnalysisData as any

  return (
    <div id="report-content" className="min-h-screen bg-white">
      {/* Premium Header */}
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 shadow-2xl border-b-4 border-amber-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/dashboard" className="flex items-center text-amber-300 hover:text-amber-200 font-medium transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Dashboard'a Dön
            </Link>
            <div className="flex items-center space-x-3">
              {/* Premium Badge */}
              <div className="hidden md:flex items-center bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                <SparklesIcon className="w-4 h-4 mr-2" />
                PREMIUM EKSPERTİZ
              </div>
              <button 
                onClick={handleSave}
                className="flex items-center px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-gray-900 rounded-xl hover:from-amber-500 hover:to-amber-700 transition-all shadow-lg hover:shadow-2xl font-bold"
              >
                <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Premium Rapor Başlığı */}
        <FadeInUp>
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl shadow-2xl p-10 mb-8 border-4 border-amber-400">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-3 rounded-2xl shadow-lg mr-4">
                      <SparklesIcon className="w-8 h-8 text-gray-900" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200">
                        KAPSAMLI EKSPERTİZ RAPORU
                      </h1>
                      <p className="text-amber-400/80 text-sm font-medium mt-1">Premium AI Destekli Analiz</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-6 border border-white/20">
                    <p className="text-3xl font-bold text-white mb-2">
                      {report.vehicleBrand} {report.vehicleModel}
                    </p>
                    <div className="flex items-center space-x-6 text-amber-300">
                      <div className="flex items-center">
                        <span className="text-sm opacity-80 mr-2">Yıl:</span>
                        <span className="text-lg font-bold">{report.vehicleYear}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm opacity-80 mr-2">Plaka:</span>
                        <span className="text-lg font-bold">{report.vehiclePlate}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Premium Score Display */}
                <div className="text-center ml-8">
                  <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-3xl p-8 shadow-2xl border-4 border-amber-300">
                    <div className="text-7xl font-black text-gray-900 mb-2 drop-shadow-lg">
                      {analysis.overallScore}
                      <span className="text-3xl">/100</span>
                    </div>
                    <div className="bg-gray-900 text-amber-300 px-4 py-2 rounded-xl font-bold text-lg mt-3">
                      {analysis.expertiseGrade}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Genel Bakış */}
        {analysis.comprehensiveSummary && (
          <FadeInUp delay={0.1}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Genel Bakış</h2>
              </div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">{analysis.comprehensiveSummary.vehicleOverview}</p>
              
              {/* Önemli Bulgular */}
              {analysis.comprehensiveSummary.keyFindings && analysis.comprehensiveSummary.keyFindings.length > 0 && (
                <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                  <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🔍</span>
                    Önemli Bulgular
                  </h3>
                  <ul className="space-y-3">
                    {analysis.comprehensiveSummary.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start bg-white/60 rounded-lg p-3 shadow-sm">
                        <span className="text-blue-600 text-xl mr-3 mt-0.5">✓</span>
                        <span className="text-gray-800 font-medium">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Kritik Sorunlar */}
              {analysis.comprehensiveSummary.criticalIssues && analysis.comprehensiveSummary.criticalIssues.length > 0 && (
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 mb-6 shadow-lg">
                  <h3 className="font-bold text-xl text-red-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">⚠️</span>
                    Kritik Sorunlar
                  </h3>
                  <ul className="space-y-3">
                    {analysis.comprehensiveSummary.criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start bg-white/70 rounded-lg p-3 shadow-sm border-l-4 border-red-500">
                        <span className="text-red-600 text-xl mr-3 mt-0.5">⚡</span>
                        <span className="text-red-800 font-semibold">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detaylı Açıklama */}
              {analysis.comprehensiveSummary?.detailedDescription && (
                <div className="mb-6 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
                  <h3 className="font-bold text-2xl text-gray-900 mb-6 flex items-center">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl mr-3">
                      <span className="text-3xl">📝</span>
                    </div>
                    Detaylı İnceleme
                  </h3>
                  <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-line">
                    {analysis.comprehensiveSummary.detailedDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Güçlü Yönler */}
                {analysis.comprehensiveSummary.strengths && analysis.comprehensiveSummary.strengths.length > 0 && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg text-green-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">✅</span>
                      Güçlü Yönler
                    </h3>
                    <ul className="space-y-2">
                      {analysis.comprehensiveSummary.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start bg-white/60 rounded-lg p-2 shadow-sm">
                          <span className="text-green-600 text-lg mr-2 mt-0.5">★</span>
                          <span className="text-green-800 font-medium text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Zayıf Yönler */}
                {analysis.comprehensiveSummary.weaknesses && analysis.comprehensiveSummary.weaknesses.length > 0 && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg text-yellow-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">⚠️</span>
                      Zayıf Yönler
                    </h3>
                    <ul className="space-y-2">
                      {analysis.comprehensiveSummary.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start bg-white/60 rounded-lg p-2 shadow-sm">
                          <span className="text-yellow-600 text-lg mr-2 mt-0.5">▲</span>
                          <span className="text-yellow-800 font-medium text-sm">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Hasar Analizi Detayları */}
        {analysis.damageAnalysis && analysis.damageAnalysis.damageAreas && analysis.damageAnalysis.damageAreas.length > 0 && (
          <FadeInUp delay={0.18}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-red-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">🔧</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Hasar Analizi Detayları</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border-2 border-red-200">
                  <div className="text-sm text-red-700 font-semibold mb-1">Toplam Hasar</div>
                  <div className="text-3xl font-black text-red-900">{analysis.damageAnalysis.damageAreas.length}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4 border-2 border-orange-200">
                  <div className="text-sm text-orange-700 font-semibold mb-1">Kritik Hasar</div>
                  <div className="text-3xl font-black text-orange-900">
                    {analysis.damageAnalysis.damageAreas.filter(d => d.severity === 'critical' || d.severity === 'high').length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-700 font-semibold mb-1">Toplam Tamir Maliyeti</div>
                  <div className="text-2xl font-black text-blue-900">
                    {analysis.damageAnalysis.overallAssessment?.totalRepairCost 
                      ? `₺${analysis.damageAnalysis.overallAssessment.totalRepairCost.toLocaleString('tr-TR')}`
                      : '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {analysis.damageAnalysis.damageAreas.slice(0, 5).map((damage, index) => (
                  <div key={index} className="bg-white rounded-xl p-5 border-l-4 border-red-500 shadow-md hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">
                          {damage.type.toUpperCase()} - {damage.area}
                        </h4>
                        <p className="text-gray-700 mb-2">{damage.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        damage.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        damage.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        damage.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {damage.severity === 'critical' ? 'KRİTİK' :
                         damage.severity === 'high' ? 'YÜKSEK' :
                         damage.severity === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Güven:</span>
                        <span className="ml-2 font-bold text-gray-900">%{damage.confidence}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Maliyet:</span>
                        <span className="ml-2 font-bold text-red-600">₺{damage.repairCost.toLocaleString('tr-TR')}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Süre:</span>
                        <span className="ml-2 font-bold text-blue-600">{damage.estimatedRepairTime}h</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Boya Analizi Detayları */}
        {analysis.paintAnalysis && analysis.paintAnalysis.paintQuality && (
          <FadeInUp delay={0.2}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-pink-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">🎨</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Boya Kalitesi Analizi</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-4 border-2 border-pink-200">
                  <div className="text-sm text-pink-700 font-semibold mb-1">Genel Skor</div>
                  <div className="text-3xl font-black text-pink-900">{analysis.paintAnalysis.paintQuality.overallScore}/100</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200">
                  <div className="text-sm text-purple-700 font-semibold mb-1">Parlaklık</div>
                  <div className="text-3xl font-black text-purple-900">{analysis.paintAnalysis.paintQuality.glossLevel}/100</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-700 font-semibold mb-1">Pürüzsüzlük</div>
                  <div className="text-3xl font-black text-blue-900">{analysis.paintAnalysis.paintQuality.smoothness}/100</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <div className="text-sm text-green-700 font-semibold mb-1">Dayanıklılık</div>
                  <div className="text-3xl font-black text-green-900">{analysis.paintAnalysis.paintQuality.durability}/100</div>
                </div>
              </div>

              {analysis.paintAnalysis.colorAnalysis && (
                <div className="bg-gradient-to-br from-gray-50 to-pink-50 rounded-xl p-6 border-2 border-pink-100">
                  <h3 className="font-bold text-xl text-gray-900 mb-4">🌈 Renk Analizi</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-600">Renk:</span>
                      <span className="ml-2 font-bold text-gray-900">{analysis.paintAnalysis.colorAnalysis.colorName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Renk Kodu:</span>
                      <span className="ml-2 font-bold text-gray-900">{analysis.paintAnalysis.colorAnalysis.colorCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Orijinal Boya:</span>
                      <span className="ml-2 font-bold text-green-600">
                        {analysis.paintAnalysis.colorAnalysis.originalColor ? '✅ EVET' : '❌ DEĞİL'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Boyama Tespiti:</span>
                      <span className="ml-2 font-bold">
                        {analysis.paintAnalysis.colorAnalysis.repaintDetected ? '⚠️ Boyalı Panel Var' : '✅ Tüm Paneller Orijinal'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FadeInUp>
        )}

        {/* Motor Ses Analizi Detayları */}
        {analysis.audioAnalysis && analysis.audioAnalysis.rpmAnalysis && (
          <FadeInUp delay={0.22}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">🔊</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Motor Ses Analizi</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <div className="text-sm text-blue-700 font-semibold mb-1">Motor Sağlığı</div>
                  <div className="text-3xl font-black text-blue-900">{analysis.audioAnalysis.overallScore}/100</div>
                  <div className="text-sm text-blue-600 mt-1">{analysis.audioAnalysis.engineHealth}</div>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 border-2 border-cyan-200">
                  <div className="text-sm text-cyan-700 font-semibold mb-1">Rölanti RPM</div>
                  <div className="text-3xl font-black text-cyan-900">{analysis.audioAnalysis.rpmAnalysis.idleRpm}</div>
                  <div className="text-sm text-cyan-600 mt-1">RPM</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-xl p-4 border-2 border-teal-200">
                  <div className="text-sm text-teal-700 font-semibold mb-1">RPM Stabilitesi</div>
                  <div className="text-3xl font-black text-teal-900">{analysis.audioAnalysis.rpmAnalysis.rpmStability}%</div>
                </div>
              </div>

              {analysis.audioAnalysis.detectedIssues && analysis.audioAnalysis.detectedIssues.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                  <h3 className="font-bold text-xl text-gray-900 mb-4">⚙️ Tespit Edilen Sorunlar</h3>
                  <div className="space-y-3">
                    {analysis.audioAnalysis.detectedIssues.map((issue, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{issue.issue}</h4>
                            <p className="text-gray-700 text-sm mt-1">{issue.description}</p>
                            <p className="text-blue-600 text-sm mt-2 font-medium">💡 {issue.recommendation}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ml-3 ${
                            issue.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            issue.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            issue.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {issue.severity.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-3 text-xs text-gray-600">
                          <span>Güven: %{issue.confidence}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FadeInUp>
        )}

        {/* Teknik Özellikler Tablosu */}
        {analysis.comprehensiveSummary && (analysis as any).comprehensiveSummary?.vehicleSpecsTable && (
          <FadeInUp delay={0.15}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-indigo-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">🔧</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Genel Bilgi</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      <th className="border-2 border-indigo-300 px-6 py-4 text-left text-white font-bold">Özellik</th>
                      <th className="border-2 border-indigo-300 px-6 py-4 text-left text-white font-bold">Değer</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Marka / Model</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.makeModel ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Model Yılı</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.year ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Motor Tipi</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.engineType ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Aktarma</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.transmission ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Çekiş Sistemi</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.driveType ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Renk</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.color ?? '-'}</td>
                    </tr>
                    <tr className="hover:bg-indigo-50 transition-colors">
                      <td className="border-2 border-indigo-200 px-6 py-3 font-semibold text-gray-700">Plaka</td>
                      <td className="border-2 border-indigo-200 px-6 py-3 text-gray-900 font-bold">{(analysis as any).comprehensiveSummary?.vehicleSpecsTable?.plate ?? '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Dış Donanım & Kaporta Durumu */}
        {analysis.comprehensiveSummary?.exteriorConditionTable && (
          <FadeInUp delay={0.2}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-teal-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">🚗</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Dış Donanım & Kaporta Durumu</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-600 to-cyan-600">
                      <th className="border-2 border-teal-300 px-6 py-4 text-left text-white font-bold">Bölüm</th>
                      <th className="border-2 border-teal-300 px-6 py-4 text-left text-white font-bold">Durum</th>
                      <th className="border-2 border-teal-300 px-6 py-4 text-left text-white font-bold">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-teal-50 transition-colors">
                      <td className="border-2 border-teal-200 px-6 py-3 font-semibold text-gray-700">Kaporta</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.exteriorConditionTable.bodywork.status}</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.exteriorConditionTable.bodywork.note}</td>
                    </tr>
                    <tr className="hover:bg-teal-50 transition-colors">
                      <td className="border-2 border-teal-200 px-6 py-3 font-semibold text-gray-700">Boya</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.exteriorConditionTable.paint.status}</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.exteriorConditionTable.paint.note}</td>
                    </tr>
                    <tr className="hover:bg-teal-50 transition-colors">
                      <td className="border-2 border-teal-200 px-6 py-3 font-semibold text-gray-700">Camlar</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.exteriorConditionTable.windows.status}</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.exteriorConditionTable.windows.note}</td>
                    </tr>
                    <tr className="hover:bg-teal-50 transition-colors">
                      <td className="border-2 border-teal-200 px-6 py-3 font-semibold text-gray-700">Farlar & Stoplar</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.exteriorConditionTable.lights.status}</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.exteriorConditionTable.lights.note}</td>
                    </tr>
                    <tr className="hover:bg-teal-50 transition-colors">
                      <td className="border-2 border-teal-200 px-6 py-3 font-semibold text-gray-700">Aynalar</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.exteriorConditionTable.mirrors.status}</td>
                      <td className="border-2 border-teal-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.exteriorConditionTable.mirrors.note}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Motor ve Mekanik Durum */}
        {analysis.comprehensiveSummary?.mechanicalAnalysisTable && (
          <FadeInUp delay={0.25}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-orange-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">⚙️</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Motor ve Mekanik Durum</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-orange-600 to-red-600">
                      <th className="border-2 border-orange-300 px-6 py-4 text-left text-white font-bold">Bölüm</th>
                      <th className="border-2 border-orange-300 px-6 py-4 text-left text-white font-bold">Durum</th>
                      <th className="border-2 border-orange-300 px-6 py-4 text-left text-white font-bold">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="border-2 border-orange-200 px-6 py-3 font-semibold text-gray-700">Motor</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.mechanicalAnalysisTable.engine.status}</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.mechanicalAnalysisTable.engine.note}</td>
                    </tr>
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="border-2 border-orange-200 px-6 py-3 font-semibold text-gray-700">Şanzıman</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.mechanicalAnalysisTable.transmission.status}</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.mechanicalAnalysisTable.transmission.note}</td>
                    </tr>
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="border-2 border-orange-200 px-6 py-3 font-semibold text-gray-700">Süspansiyon</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.mechanicalAnalysisTable.suspension.status}</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.mechanicalAnalysisTable.suspension.note}</td>
                    </tr>
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="border-2 border-orange-200 px-6 py-3 font-semibold text-gray-700">Frenler</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.mechanicalAnalysisTable.brakes.status}</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.mechanicalAnalysisTable.brakes.note}</td>
                    </tr>
                    <tr className="hover:bg-orange-50 transition-colors">
                      <td className="border-2 border-orange-200 px-6 py-3 font-semibold text-gray-700">Elektrik Sistemleri</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.mechanicalAnalysisTable.electrical.status}</td>
                      <td className="border-2 border-orange-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.mechanicalAnalysisTable.electrical.note}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Ekspertiz Sonucu Özet Tablosu */}
        {analysis.comprehensiveSummary?.expertiseScoreTable && (
          <FadeInUp delay={0.3}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">📊</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Ekspertiz Sonucu Özet Tablosu</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-pink-600">
                      <th className="border-2 border-purple-300 px-6 py-4 text-left text-white font-bold">Bölüm</th>
                      <th className="border-2 border-purple-300 px-6 py-4 text-center text-white font-bold">Puan</th>
                      <th className="border-2 border-purple-300 px-6 py-4 text-left text-white font-bold">Durum</th>
                      <th className="border-2 border-purple-300 px-6 py-4 text-left text-white font-bold">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">Kaporta / Boya</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.bodyPaint.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.bodyPaint.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.bodyPaint.note}</td>
                    </tr>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">Şasi</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.chassis.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.chassis.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.chassis.note}</td>
                    </tr>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">Mekanik</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.mechanical.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.mechanical.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.mechanical.note}</td>
                    </tr>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">Elektrik</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.electrical.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.electrical.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.electrical.note}</td>
                    </tr>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">Lastikler</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.tires.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.tires.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.tires.note}</td>
                    </tr>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">Jantlar</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.wheels.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.wheels.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.wheels.note}</td>
                    </tr>
                    <tr className="hover:bg-purple-50 transition-colors">
                      <td className="border-2 border-purple-200 px-6 py-3 font-semibold text-gray-700">İç Mekan</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-center text-2xl font-black text-purple-600">{analysis.comprehensiveSummary.expertiseScoreTable.interior.score}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.interior.status}</td>
                      <td className="border-2 border-purple-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.expertiseScoreTable.interior.note}</td>
                    </tr>
                    <tr className="bg-gradient-to-r from-amber-100 to-amber-200 hover:from-amber-200 hover:to-amber-300 transition-colors">
                      <td className="border-4 border-amber-400 px-6 py-4 font-black text-gray-900 text-lg">Genel Durum</td>
                      <td className="border-4 border-amber-400 px-6 py-4 text-center text-3xl font-black text-amber-700">{analysis.comprehensiveSummary.expertiseScoreTable.overall.score}</td>
                      <td className="border-4 border-amber-400 px-6 py-4 text-gray-900 font-black text-lg">{analysis.comprehensiveSummary.expertiseScoreTable.overall.status}</td>
                      <td className="border-4 border-amber-400 px-6 py-4 text-gray-900 font-bold">{analysis.comprehensiveSummary.expertiseScoreTable.overall.note}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Piyasa Değeri Tablosu */}
        {analysis.comprehensiveSummary?.marketValueTable && (
          <FadeInUp delay={0.35}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-emerald-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">💰</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Piyasa Değeri (Ekim 2025)</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-600 to-green-600">
                      <th className="border-2 border-emerald-300 px-6 py-4 text-left text-white font-bold">Durum</th>
                      <th className="border-2 border-emerald-300 px-6 py-4 text-center text-white font-bold">Tahmini Değer (TL)</th>
                      <th className="border-2 border-emerald-300 px-6 py-4 text-left text-white font-bold">Not</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="hover:bg-emerald-50 transition-colors">
                      <td className="border-2 border-emerald-200 px-6 py-3 font-semibold text-gray-700">Mevcut Durumda</td>
                      <td className="border-2 border-emerald-200 px-6 py-3 text-center text-2xl font-black text-emerald-600">
                        {analysis.comprehensiveSummary.marketValueTable.asIs.min.toLocaleString('tr-TR')} - {analysis.comprehensiveSummary.marketValueTable.asIs.max.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="border-2 border-emerald-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.marketValueTable.asIs.note}</td>
                    </tr>
                    <tr className="hover:bg-emerald-50 transition-colors">
                      <td className="border-2 border-emerald-200 px-6 py-3 font-semibold text-gray-700">Tamir Sonrası</td>
                      <td className="border-2 border-emerald-200 px-6 py-3 text-center text-2xl font-black text-emerald-600">
                        {analysis.comprehensiveSummary.marketValueTable.afterRepair.min.toLocaleString('tr-TR')} - {analysis.comprehensiveSummary.marketValueTable.afterRepair.max.toLocaleString('tr-TR')} TL
                      </td>
                      <td className="border-2 border-emerald-200 px-6 py-3 text-gray-700">{analysis.comprehensiveSummary.marketValueTable.afterRepair.note}</td>
                    </tr>
                    <tr className="bg-gradient-to-r from-green-100 to-emerald-200 hover:from-green-200 hover:to-emerald-300 transition-colors">
                      <td className="border-4 border-emerald-400 px-6 py-4 font-black text-gray-900 text-lg">Restore Sonrası (Koleksiyonluk)</td>
                      <td className="border-4 border-emerald-400 px-6 py-4 text-center text-3xl font-black text-emerald-700">
                        {analysis.comprehensiveSummary.marketValueTable.restored.min.toLocaleString('tr-TR')} TL üzeri
                      </td>
                      <td className="border-4 border-emerald-400 px-6 py-4 text-gray-900 font-bold">{analysis.comprehensiveSummary.marketValueTable.restored.note}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Uzman Görüşü */}
        {analysis.expertOpinion && (
          <FadeInUp delay={0.4}>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl shadow-xl p-8 mb-6 border-2 border-indigo-200">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">👨‍🔧</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Uzman Görüşü</h2>
              </div>
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 border-l-4 border-amber-400 rounded-xl p-6 mb-6 shadow-lg">
                <p className="font-bold text-xl text-white leading-relaxed">
                  💼 Öneri: {analysis.expertOpinion.recommendation}
                </p>
              </div>
              {analysis.expertOpinion.reasoning && analysis.expertOpinion.reasoning.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-lg text-indigo-900 mb-3">📋 Gerekçeler:</h3>
                  {analysis.expertOpinion.reasoning.map((reason, index) => (
                    <div key={index} className="flex items-start bg-white/70 rounded-lg p-4 shadow-sm">
                      <CheckCircleIcon className="w-6 h-6 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-800 font-medium">{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FadeInUp>
        )}

        {/* Öneriler */}
        {analysis.finalRecommendations && (
          <FadeInUp delay={0.3}>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 border-2 border-purple-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl mr-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h2 className="text-3xl font-black text-gray-900">Öneriler ve Aksiyon Planı</h2>
              </div>
              
              {/* Acil Öneriler */}
              {analysis.finalRecommendations.immediate && analysis.finalRecommendations.immediate.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-red-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">🚨</span>
                    Acil Müdahale Gerekli
                  </h3>
                  <div className="space-y-3">
                    {analysis.finalRecommendations.immediate.map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-bold text-lg text-red-900 block mb-2">{item.action}</span>
                            <div className="inline-block bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Öncelik: {item.priority}
                            </div>
                          </div>
                          <div className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg ml-4">
                            ₺{item.cost.toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kısa Vadeli Öneriler */}
              {analysis.finalRecommendations.shortTerm && analysis.finalRecommendations.shortTerm.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-bold text-xl text-yellow-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">⏰</span>
                    Kısa Vadede Yapılmalı (1-3 Ay)
                  </h3>
                  <div className="space-y-3">
                    {analysis.finalRecommendations.shortTerm.map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-bold text-lg text-yellow-900 block mb-2">{item.action}</span>
                            <div className="inline-block bg-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Öncelik: {item.priority}
                            </div>
                          </div>
                          <div className="bg-yellow-600 text-white px-4 py-2 rounded-xl font-bold text-lg ml-4">
                            ₺{item.cost.toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uzun Vadeli Öneriler */}
              {analysis.finalRecommendations.longTerm && analysis.finalRecommendations.longTerm.length > 0 && (
                <div>
                  <h3 className="font-bold text-xl text-blue-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">📅</span>
                    Uzun Vadeli Planlama (6-12 Ay)
                  </h3>
                  <div className="space-y-3">
                    {analysis.finalRecommendations.longTerm.map((item, index) => (
                      <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-bold text-lg text-blue-900 block mb-2">{item.action}</span>
                            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                              Öncelik: {item.priority}
                            </div>
                          </div>
                          <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-lg ml-4">
                            ₺{item.cost.toLocaleString('tr-TR')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </FadeInUp>
        )}

        {/* Premium AI Bilgisi */}
        <FadeInUp delay={0.4}>
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-800 via-blue-900 to-purple-900 rounded-2xl p-8 text-center shadow-2xl border-2 border-amber-400">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <SparklesIcon className="w-8 h-8 text-amber-400 mr-2" />
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
                  AI Destekli Premium Analiz
                </h3>
              </div>
              <p className="text-amber-200 font-medium text-lg mb-2">
                Bu kapsamlı rapor <span className="font-black text-amber-300">Mivvo AI</span> tarafından 
                <span className="font-black text-green-400"> %{analysis.confidence} güvenilirlik</span> ile oluşturulmuştur.
              </p>
              <p className="text-amber-300/80 text-sm">
                Rapor tarihi: {new Date(report.createdAt).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <div className="h-1 w-24 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"></div>
                <span className="text-amber-400 text-xs font-bold">MIVVO PREMIUM</span>
                <div className="h-1 w-24 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"></div>
              </div>
            </div>
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
