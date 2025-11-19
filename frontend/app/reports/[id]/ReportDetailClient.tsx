'use client'

import { useState, useEffect } from 'react'
import { 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import jsPDF from 'jspdf'
import { analysisAPI } from '@/lib/api'
import { ReportLoading } from '@/components/ui/ReportLoading'
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

// Analiz tipini belirleyen utility fonksiyonu
function getAnalysisType(reportId: string): 'damage' | 'paint' | 'engine' | 'value' | 'comprehensive' {
  // Report ID'den analiz tipini belirle (örnek: damage_123, paint_456, vb.)
  if (reportId.includes('damage')) return 'damage'
  if (reportId.includes('paint')) return 'paint'
  if (reportId.includes('audio') || reportId.includes('engine')) return 'engine'
  if (reportId.includes('value')) return 'value'
  if (reportId.includes('comprehensive') || reportId.includes('full')) return 'comprehensive'
  
  // Varsayılan olarak comprehensive döndür
  return 'comprehensive'
}

// API'den gelen rapor verisini normalize eden fonksiyon
function normalizeReportData(apiData: any, analysisType: string) {
  const baseData = {
    id: apiData.report?.id || apiData.id,
    vehicleInfo: {
      plate: apiData.report?.vehiclePlate || apiData.vehicleInfo?.plate || '',
      brand: apiData.report?.vehicleBrand || apiData.vehicleInfo?.make || '',
      model: apiData.report?.vehicleModel || apiData.vehicleInfo?.model || '',
      year: apiData.report?.vehicleYear || apiData.vehicleInfo?.year || 0,
      vin: apiData.report?.vehicleVin || apiData.vehicleInfo?.vin || '',
      color: apiData.report?.vehicleColor || apiData.vehicleInfo?.color || '',
      mileage: apiData.report?.mileage || apiData.vehicleInfo?.mileage || 0,
      fuelType: apiData.report?.fuelType || apiData.vehicleInfo?.fuelType || '',
      transmission: apiData.report?.transmission || apiData.vehicleInfo?.transmission || '',
      engine: apiData.report?.engine || apiData.vehicleInfo?.engine || '',
      bodyType: apiData.report?.bodyType || apiData.vehicleInfo?.bodyType || '',
    },
    reportType: apiData.report?.reportType || analysisType,
    status: apiData.report?.status || apiData.status || 'COMPLETED',
    createdAt: apiData.report?.createdAt || apiData.createdAt || new Date().toISOString(),
    totalCost: apiData.report?.totalCost || 0,
    overallScore: apiData.overallScore || 0,
    aiAnalysisData: apiData.aiAnalysisData || apiData,
  }
  
  return baseData
}


export function ReportDetailClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<any>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const analysisType = getAnalysisType(reportId)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let response
        switch (analysisType) {
          case 'damage':
            response = await analysisAPI.damageAnalysis.getReport(reportId)
            break
          case 'paint':
            response = await analysisAPI.paintAnalysis.getReport(reportId)
            break
          case 'engine':
            response = await analysisAPI.audioAnalysis.getReport(reportId)
            break
          case 'value':
            response = await analysisAPI.valueEstimation.getReport(reportId)
            break
          case 'comprehensive':
            response = await analysisAPI.comprehensiveExpertise.getReport(reportId)
            break
          default:
            throw new Error('Geçersiz analiz tipi')
        }
        
        const normalizedData = normalizeReportData(response.data, analysisType)
        setReport(normalizedData)
      } catch (err: any) {
        console.error('Rapor yükleme hatası:', err)
        setError(err.response?.data?.message || 'Rapor yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [reportId, analysisType])

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hata Oluştu</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            href="/dashboard" 
            className="btn btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rapor Bulunamadı</h2>
          <p className="text-gray-600 mb-4">Bu rapor mevcut değil veya erişim yetkiniz yok.</p>
          <Link 
            href="/dashboard" 
            className="btn btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Dashboard&apos;a Dön
          </Link>
        </div>
      </div>
    )
  }

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    
    try {
      const pdf = new jsPDF()
      
      // PDF başlığı
      pdf.setFontSize(20)
      pdf.text('Mivvo Expertiz Raporu', 20, 20)
      
      // Araç bilgileri
      pdf.setFontSize(14)
      pdf.text(`${report.vehicleInfo.brand} ${report.vehicleInfo.model} ${report.vehicleInfo.year}`, 20, 40)
      pdf.text(`Plaka: ${report.vehicleInfo.plate}`, 20, 50)
      pdf.text(`VIN: ${report.vehicleInfo.vin}`, 20, 60)
      pdf.text(`Kilometre: ${report.vehicleInfo.mileage.toLocaleString()} km`, 20, 70)
      
      // Genel puan
      pdf.setFontSize(16)
      pdf.text(`Genel Puan: ${report.overallScore}/100`, 20, 90)
      
      // Piyasa değeri
      pdf.text(`Tahmini Değer: ${report.marketValue.estimatedValue.toLocaleString()}₺`, 20, 110)
      
      // Öneri
      pdf.setFontSize(12)
      pdf.text(`Genel Değerlendirme: ${report.summary.overallRecommendation}`, 20, 130)
      
      pdf.save(`mivvo-expertiz-raporu-${report.vehicleInfo.plate}.pdf`)
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Geri Dön</span>
              </Link>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={generatePDF}
                disabled={isGeneratingPDF}
                className="btn btn-primary bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <ArrowDownTrayIcon className="w-4 h-4" />
                )}
                <span>{isGeneratingPDF ? 'PDF Oluşturuluyor...' : 'PDF İndir'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeInUp>
          {/* Vehicle Info Card */}
          <div className="card p-6 mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {report.vehicleInfo.brand} {report.vehicleInfo.model}
                </h2>
                <p className="text-gray-600">{report.vehicleInfo.year}</p>
                <p className="text-sm text-gray-500">{report.reportType}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Plaka</p>
                <p className="font-semibold text-gray-900">{report.vehicleInfo.plate}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Kilometre</p>
                <p className="font-semibold text-gray-900">{report.vehicleInfo.mileage.toLocaleString()} km</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500 mb-1">Durum</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  report.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status === 'completed' ? 'Tamamlandı' : 'İşleniyor'}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Genel Değerlendirme</h3>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-4xl font-bold text-gray-900">{report.overallScore}</div>
                  <div>
                    <div className="text-sm text-gray-500">Genel Puan</div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${report.overallScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Section Scores */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(report.sections).map(([key, section]) => {
                    const sectionData = section as any
                    return (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {key}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{sectionData.score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${sectionData.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            </div>

            {/* Market Value */}
            <div className="card p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="w-5 h-5 text-green-600 mr-2" />
                Piyasa Değeri
              </h3>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {report.marketValue.estimatedValue.toLocaleString()}₺
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {report.marketValue.marketRange.min.toLocaleString()}₺ - {report.marketValue.marketRange.max.toLocaleString()}₺
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Değer Kaybı:</span>
                    <span className="font-medium">{report.marketValue.depreciation}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Piyasa Durumu:</span>
                    <span className="font-medium text-green-600">{report.marketValue.comparison}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Report Content */}
          <div className="card p-6">
            {analysisType === 'damage' && (
              <DamageReport
                data={report.aiAnalysisData as DamageAnalysisResult}
                vehicleInfo={report.vehicleInfo}
                showActions={true}
              />
            )}
            
            {analysisType === 'paint' && (
              <PaintReport 
                report={report.aiAnalysisData as PaintAnalysisResult}
                vehicleInfo={report.vehicleInfo}
                onGeneratePDF={generatePDF}
                isGeneratingPDF={isGeneratingPDF}
              />
            )}
            
            {analysisType === 'engine' && (
              <AudioReport 
                data={report.aiAnalysisData as AudioAnalysisResult}
                vehicleInfo={report.vehicleInfo}
                showActions={true}
              />
            )}
            
            {analysisType === 'value' && (
              <ValueReport 
                data={report.aiAnalysisData as ValueEstimationResult}
                vehicleInfo={report.vehicleInfo}
                showActions={true}
              />
            )}
            
            {analysisType === 'comprehensive' && (
              <ComprehensiveReport 
                data={report.aiAnalysisData as ComprehensiveExpertiseResult}
                vehicleInfo={report.vehicleInfo}
                showActions={true}
              />
            )}
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
