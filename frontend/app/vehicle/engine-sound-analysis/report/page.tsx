'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { 
  SpeakerWaveIcon, 
  ChartBarIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui'
import { FadeInUp } from '@/components/motion'
import { engineSoundAnalysisService } from '@/services/engineSoundAnalysisService'
import { EngineSoundAnalysisResult } from '@/types'
import toast from 'react-hot-toast'

function EngineSoundAnalysisReportPageContent() {
  const searchParams = useSearchParams()
  const reportId = searchParams.get('reportId')
  
  const [analysisResult, setAnalysisResult] = useState<EngineSoundAnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'loading' | 'pending' | 'processing' | 'completed' | 'failed'>('loading')

  useEffect(() => {
    if (reportId) {
      fetchAnalysisResult()
    }
  }, [reportId])

  const fetchAnalysisResult = async () => {
    if (!reportId) return

    try {
      setLoading(true)
      
      // Önce durumu kontrol et
      const statusResponse = await engineSoundAnalysisService.checkAnalysisStatus(reportId)
      
      if (statusResponse) {
        setStatus(statusResponse.status as any)
        
        if (statusResponse.status === 'completed') {
          const result = await engineSoundAnalysisService.getAnalysisResult(reportId)
          if (result) {
            setAnalysisResult(result)
          }
        } else if (statusResponse.status === 'processing') {
          // 5 saniye sonra tekrar kontrol et
          setTimeout(fetchAnalysisResult, 5000)
        }
      }
    } catch (error) {
      console.error('Analiz sonucu alınırken hata:', error)
      toast.error('Analiz sonucu alınırken hata oluştu')
      setStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    if (!reportId) return

    try {
      const blob = await engineSoundAnalysisService.downloadReport(reportId)
      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `motor-sesi-analizi-${reportId}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Rapor indirildi')
      }
    } catch (error) {
      console.error('Rapor indirme hatası:', error)
      toast.error('Rapor indirilemedi')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Kritik'
      case 'high': return 'Yüksek'
      case 'medium': return 'Orta'
      case 'low': return 'Düşük'
      default: return 'Bilinmiyor'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analiz sonucu yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (status === 'processing' || status === 'pending' || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="lg" className="max-w-md w-full">
          <div className="text-center">
            <ClockIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Analiz Devam Ediyor
            </h2>
            <p className="text-gray-600 mb-4">
              Motor sesi analizi işleniyor. Bu işlem birkaç dakika sürebilir.
            </p>
            <ProgressBar value={75} />
            <p className="text-sm text-gray-500 mt-2">Tahmini süre: 2-3 dakika</p>
          </div>
        </Card>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="lg" className="max-w-md w-full">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Analiz Başarısız
            </h2>
            <p className="text-gray-600 mb-4">
              Motor sesi analizi tamamlanamadı. Lütfen tekrar deneyin.
            </p>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Sadece GERÇEK veri varsa render et
  if (!analysisResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card padding="lg" className="max-w-md w-full">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Veri Bulunamadı
            </h2>
            <p className="text-gray-600 mb-4">AI analiz verisi gelmedi. Lütfen birkaç saniye sonra tekrar deneyin.</p>
            <Button variant="primary" onClick={() => window.location.reload()}>Yenile</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeInUp>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <SpeakerWaveIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Motor Ses Analizi Raporu
            </h1>
            <p className="text-gray-600">
              {(analysisResult.vehicleInfo?.make || 'Belirtilmemiş')} {(analysisResult.vehicleInfo?.model || '')} ({analysisResult.vehicleInfo?.year || '-'})
            </p>
          </div>
        </FadeInUp>

        {/* Genel Skor */}
        <FadeInUp>
          <Card padding="lg" className="mb-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(analysisResult.overallScore)} mb-2`}>
                {analysisResult.overallScore}
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-1">
                Genel Motor Sağlığı: {analysisResult.engineHealth}
              </p>
              <p className="text-gray-600">100 üzerinden değerlendirme</p>
            </div>
          </Card>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Akustik Özellikler */}
          <FadeInUp>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Akustik Özellikler
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Süre:</span>
                  <span className="font-medium">{(((analysisResult as any) && (analysisResult as any).acousticFeatures?.durationSec) ?? '-')} sn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RMS (Ortalama Enerji):</span>
                  <span className="font-medium">{((analysisResult as any)?.acousticFeatures?.rms ?? '-')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zero Crossing Rate:</span>
                  <span className="font-medium">{((analysisResult as any)?.acousticFeatures?.zeroCrossingRate ?? '-')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Baskın Frekans:</span>
                  <span className="font-medium">{((analysisResult as any)?.acousticFeatures?.dominantFrequencyHz ?? '-')} Hz</span>
                </div>
              </div>
            </Card>
          </FadeInUp>
          {/* RPM Analizi */}
          <FadeInUp>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                RPM Analizi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rölanti RPM:</span>
                  <span className="font-medium">{analysisResult.rpmAnalysis?.idleRpm ?? '-' } rpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maksimum RPM:</span>
                  <span className="font-medium">{analysisResult.rpmAnalysis?.maxRpm ?? '-' } rpm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RPM Kararlılığı:</span>
                  <span className="font-medium">{analysisResult.rpmAnalysis?.rpmStability ?? '-' }%</span>
                </div>
              </div>
            </Card>
          </FadeInUp>

          {/* Frekans Analizi */}
          <FadeInUp>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SpeakerWaveIcon className="w-5 h-5 mr-2" />
                Frekans Analizi
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Harmonik Bozulma:</span>
                  <span className="font-medium">{typeof analysisResult.frequencyAnalysis?.harmonicDistortion === 'number' ? analysisResult.frequencyAnalysis!.harmonicDistortion.toFixed(1) : '-' }%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gürültü Seviyesi:</span>
                  <span className="font-medium">{typeof analysisResult.frequencyAnalysis?.noiseLevel === 'number' ? analysisResult.frequencyAnalysis!.noiseLevel.toFixed(1) : '-' } dB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dominant Frekanslar:</span>
                  <span className="font-medium">{Array.isArray(analysisResult.frequencyAnalysis?.dominantFrequencies) ? analysisResult.frequencyAnalysis!.dominantFrequencies.join(', ') : '-' } Hz</span>
                </div>
              </div>
            </Card>
          </FadeInUp>

          {/* Performans Metrikleri */}
          <FadeInUp>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performans Metrikleri
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Motor Verimliliği:</span>
                  <span className="font-medium">{analysisResult.performanceMetrics?.engineEfficiency ?? '-' }%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Titreşim Seviyesi:</span>
                  <span className="font-medium">{analysisResult.performanceMetrics?.vibrationLevel ?? '-' }%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Akustik Kalite:</span>
                  <span className="font-medium">{analysisResult.performanceMetrics?.acousticQuality ?? '-' }%</span>
                </div>
              </div>
            </Card>
          </FadeInUp>

          {/* Tespit Edilen Sorunlar */}
          <FadeInUp>
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Tespit Edilen Sorunlar
              </h3>
              {Array.isArray(analysisResult.detectedIssues) && analysisResult.detectedIssues.length > 0 ? (
                <div className="space-y-3">
                  {analysisResult.detectedIssues.map((issue, index) => (
                    <div key={index} className="border-l-4 border-yellow-400 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{issue.issue}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {getSeverityText(issue.severity)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{issue.description}</p>
                      <p className="text-sm text-blue-600 font-medium">{issue.recommendation}</p>
                      <p className="text-xs text-gray-500">Güven: %{issue.confidence}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600">AI veri setinde sorun listesi bulunamadı</p>
                </div>
              )}
            </Card>
          </FadeInUp>
        </div>

        {/* Öneriler */}
        <FadeInUp>
          <Card padding="lg" className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Uzman Önerileri
            </h3>
            {(analysisResult as any)?.analysisSummary && (
              <div className="mb-4 p-3 rounded bg-blue-50 text-blue-800 text-sm">
                {(analysisResult as any).analysisSummary}
              </div>
            )}
            <div className="space-y-2">
              {(analysisResult.recommendations || []).map((recommendation, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          </Card>
        </FadeInUp>

        {/* İndirme Butonu */}
        <FadeInUp>
          <div className="text-center mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={downloadReport}
              className="inline-flex items-center"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              Raporu İndir
            </Button>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}

// Loading component
function EngineSoundAnalysisReportPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-8"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

// Ana component Suspense ile sarmalanmış
export default function EngineSoundAnalysisReportPage() {
  return (
    <Suspense fallback={<EngineSoundAnalysisReportPageLoading />}>
      <EngineSoundAnalysisReportPageContent />
    </Suspense>
  )
}
