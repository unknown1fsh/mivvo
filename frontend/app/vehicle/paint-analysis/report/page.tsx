'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  ChartBarIcon,
  PaintBrushIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'

interface PaintAnalysisReport {
  id: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    plate: string
  }
  overallScore: number
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor'
  analysisDate: string
  images: Array<{
    angle: string
    score: number
    paintThickness: number
    colorMatch: number
    scratches: number
    dents: number
    rust: boolean
    oxidation: number
    glossLevel: number
    recommendations: string[]
  }>
  summary: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    estimatedValue: number
    marketComparison: string
  }
  technicalDetails: {
    paintSystem: string
    primerType: string
    baseCoat: string
    clearCoat: string
    totalThickness: number
    colorCode: string
  }
}

const paintConditions = {
  excellent: { label: 'Mükemmel', color: 'text-green-600', bg: 'bg-green-50', score: '90-100' },
  good: { label: 'İyi', color: 'text-blue-600', bg: 'bg-blue-50', score: '70-89' },
  fair: { label: 'Orta', color: 'text-yellow-600', bg: 'bg-yellow-50', score: '50-69' },
  poor: { label: 'Kötü', color: 'text-red-600', bg: 'bg-red-50', score: '0-49' }
}

export default function PaintAnalysisReportPage() {
  const [report, setReport] = useState<PaintAnalysisReport | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      // URL'den reportId'yi al
      const urlParams = new URLSearchParams(window.location.search)
      const reportId = urlParams.get('reportId')
      
      if (!reportId) {
        throw new Error('Rapor ID bulunamadı')
      }

      // Token kontrolü
      const token = localStorage.getItem('auth_token')
      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      // Backend API'den gerçek veriyi çek
      const response = await fetch(`/api/paint-analysis/report/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Rapor verisi alınamadı')
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        // Backend'den gelen veriyi frontend formatına çevir
        const reportData = transformBackendDataToFrontend(result.data)
        setReport(reportData)
      } else {
        throw new Error('Rapor verisi bulunamadı')
      }
    } catch (error) {
      console.error('Rapor yükleme hatası:', error)
      // Hata durumunda mock data kullan
      setReport({
        id: 'PA-2024-001',
        vehicleInfo: {
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          vin: '1HGBH41JXMN109186',
          plate: '34 ABC 123'
        },
        overallScore: 87,
        paintCondition: 'good',
        analysisDate: new Date().toLocaleDateString('tr-TR'),
        images: [],
        summary: {
          strengths: ['Veri yüklenemedi'],
          weaknesses: ['API bağlantı hatası'],
          recommendations: ['Lütfen tekrar deneyin'],
          estimatedValue: 0,
          marketComparison: 'Veri bulunamadı'
        },
        technicalDetails: {
          paintSystem: 'Veri bulunamadı',
          primerType: 'Veri bulunamadı',
          baseCoat: 'Veri bulunamadı',
          clearCoat: 'Veri bulunamadı',
          totalThickness: 0,
          colorCode: 'Veri bulunamadı'
        }
      })
    }
  }

  const transformBackendDataToFrontend = (backendData: any): PaintAnalysisReport => {
    return {
      id: backendData.id || 'PA-2024-001',
      vehicleInfo: {
        make: backendData.vehicleBrand || 'Bilinmiyor',
        model: backendData.vehicleModel || 'Bilinmiyor',
        year: backendData.vehicleYear || 2020,
        vin: backendData.vehicleVin || 'Bilinmiyor',
        plate: backendData.vehiclePlate || 'Bilinmiyor'
      },
      overallScore: backendData.aiAnalysisData?.overallScore || 0,
      paintCondition: backendData.aiAnalysisData?.paintCondition || 'fair',
      analysisDate: new Date(backendData.createdAt).toLocaleDateString('tr-TR'),
      images: backendData.aiAnalysisData?.images || [],
      summary: {
        strengths: backendData.aiAnalysisData?.summary?.strengths || [],
        weaknesses: backendData.aiAnalysisData?.summary?.weaknesses || [],
        recommendations: backendData.aiAnalysisData?.summary?.recommendations || [],
        estimatedValue: backendData.aiAnalysisData?.estimatedValue || 0,
        marketComparison: backendData.aiAnalysisData?.marketComparison || 'Veri bulunamadı'
      },
      technicalDetails: {
        paintSystem: backendData.aiAnalysisData?.technicalDetails?.paintSystem || 'Veri bulunamadı',
        primerType: backendData.aiAnalysisData?.technicalDetails?.primerType || 'Veri bulunamadı',
        baseCoat: backendData.aiAnalysisData?.technicalDetails?.baseCoat || 'Veri bulunamadı',
        clearCoat: backendData.aiAnalysisData?.technicalDetails?.clearCoat || 'Veri bulunamadı',
        totalThickness: backendData.aiAnalysisData?.technicalDetails?.totalThickness || 0,
        colorCode: backendData.aiAnalysisData?.technicalDetails?.colorCode || 'Veri bulunamadı'
      }
    }
  }

  const generatePDF = async () => {
    if (!report) return

    setIsGeneratingPDF(true)
    try {
      const primaryImage = report.images[0]

      await generatePaintAnalysisPDF({
        reportId: report.id,
        vehicleInfo: report.vehicleInfo,
        reportType: 'Boya Analizi',
        analysisDate: report.analysisDate,
        paintAnalysis: {
          id: report.id,
          vehicleInfo: report.vehicleInfo,
          overallScore: report.overallScore,
          paintCondition: paintConditions[report.paintCondition]?.label ?? report.paintCondition,
          colorMatching: primaryImage?.colorMatch ?? 0,
          paintThickness: primaryImage?.paintThickness ?? 0,
          scratchCount: primaryImage?.scratches ?? 0,
          dentCount: primaryImage?.dents ?? 0,
          rustDetected: Boolean(primaryImage?.rust),
          oxidationLevel: primaryImage?.oxidation ?? 0,
          glossLevel: primaryImage?.glossLevel ?? 0,
          recommendations: report.summary.recommendations,
          createdAt: new Date(report.analysisDate)
        },
        uploadedImages: report.images.length,
        uploadedAudios: 0,
        confidence: report.overallScore
      })
      toast.success('PDF başarıyla oluşturuldu!')
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      toast.error('PDF oluşturulurken hata oluştu!')
    } finally {
      setIsGeneratingPDF(false)
    }
  }


  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Rapor yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/vehicle/paint-analysis" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Analiz Sayfasına Dön
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Boya Analizi Raporu</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    PDF Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                    PDF İndir
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <FadeInUp>
          <div className="card p-8 mb-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <PaintBrushIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profesyonel Boya Analizi Raporu</h1>
            <p className="text-gray-600 mb-6">AI destekli detaylı boya kalitesi değerlendirmesi</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">{report.overallScore}/100</div>
                <div className="text-sm text-gray-600">Genel Skor</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {paintConditions[report.paintCondition].label}
                </div>
                <div className="text-sm text-gray-600">Boya Durumu</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {report.images.length}
                </div>
                <div className="text-sm text-gray-600">Analiz Edilen Açı</div>
              </div>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Vehicle Information */}
            <FadeInUp delay={0.1}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Araç Bilgileri</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marka:</span>
                      <span className="font-medium">{report.vehicleInfo.make}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{report.vehicleInfo.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Yıl:</span>
                      <span className="font-medium">{report.vehicleInfo.year}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Plaka:</span>
                      <span className="font-medium">{report.vehicleInfo.plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIN:</span>
                      <span className="font-medium text-xs">{report.vehicleInfo.vin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Analiz Tarihi:</span>
                      <span className="font-medium">{report.analysisDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Detailed Analysis */}
            <FadeInUp delay={0.2}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detaylı Analiz Sonuçları</h2>
                
                <StaggerContainer className="space-y-4">
                  {report.images.map((image, index) => (
                    <StaggerItem key={index}>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-gray-900 capitalize">
                            {image.angle} Görünüm
                          </h3>
                          <div className="text-lg font-bold text-blue-600">
                            {image.score}/100
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Boya Kalınlığı:</span>
                            <span className="font-medium">{image.paintThickness} μm</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Renk Eşleşmesi:</span>
                            <span className="font-medium">{image.colorMatch}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Çizik Sayısı:</span>
                            <span className="font-medium">{image.scratches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gloss Seviyesi:</span>
                            <span className="font-medium">{image.glossLevel}%</span>
                          </div>
                        </div>
                        
                        {image.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Öneriler:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {image.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <LightBulbIcon className="w-3 h-3 text-yellow-500 mt-1" />
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </FadeInUp>

            {/* Technical Details */}
            <FadeInUp delay={0.3}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Teknik Detaylar</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boya Sistemi:</span>
                      <span className="font-medium text-sm">{report.technicalDetails.paintSystem}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Primer Tipi:</span>
                      <span className="font-medium">{report.technicalDetails.primerType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Baz Kat:</span>
                      <span className="font-medium">{report.technicalDetails.baseCoat}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clear Kat:</span>
                      <span className="font-medium">{report.technicalDetails.clearCoat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toplam Kalınlık:</span>
                      <span className="font-medium">{report.technicalDetails.totalThickness} μm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Renk Kodu:</span>
                      <span className="font-medium">{report.technicalDetails.colorCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>

          {/* Sidebar */}
          <div>
            {/* Summary */}
            <FadeInUp delay={0.4}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Özet Değerlendirme</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center">
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Güçlü Yönler
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.summary.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-yellow-700 mb-2 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      İyileştirme Alanları
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.summary.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-yellow-500 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Recommendations */}
            <FadeInUp delay={0.5}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Öneriler</h3>
                
                <div className="space-y-3">
                  {report.summary.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <LightBulbIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* Market Value */}
            <FadeInUp delay={0.6}>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Piyasa Değeri</h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ₺{report.summary.estimatedValue.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-gray-600">Tahmini Değer</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 mb-1">
                      {report.summary.marketComparison}
                    </div>
                    <div className="text-sm text-gray-600">Piyasa Karşılaştırması</div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </div>
  )
}
