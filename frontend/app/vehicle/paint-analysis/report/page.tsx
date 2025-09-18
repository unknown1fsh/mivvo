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
  DownloadIcon,
  PrinterIcon,
  ShareIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import jsPDF from 'jspdf'

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
    // Mock data - gerçek uygulamada API'den gelecek
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
      images: [
        {
          angle: 'front',
          score: 85,
          paintThickness: 95,
          colorMatch: 92,
          scratches: 2,
          dents: 0,
          rust: false,
          oxidation: 5,
          glossLevel: 88,
          recommendations: ['Küçük çizikler için retuş', 'Düzenli cilalama']
        },
        {
          angle: 'rear',
          score: 90,
          paintThickness: 98,
          colorMatch: 95,
          scratches: 1,
          dents: 0,
          rust: false,
          oxidation: 3,
          glossLevel: 92,
          recommendations: ['Mükemmel durum', 'Mevcut bakımı sürdürün']
        },
        {
          angle: 'left',
          score: 88,
          paintThickness: 92,
          colorMatch: 90,
          scratches: 3,
          dents: 1,
          rust: false,
          oxidation: 7,
          glossLevel: 85,
          recommendations: ['Hafif çizikler için retuş', 'Oksidasyon kontrolü']
        },
        {
          angle: 'right',
          score: 85,
          paintThickness: 89,
          colorMatch: 88,
          scratches: 4,
          dents: 0,
          rust: false,
          oxidation: 8,
          glossLevel: 82,
          recommendations: ['Çizikler için retuş', 'Cilalama önerilir']
        }
      ],
      summary: {
        strengths: [
          'Genel boya kalitesi iyi durumda',
          'Renk eşleşmesi mükemmel',
          'Paslanma problemi yok',
          'Boya kalınlığı standartlara uygun'
        ],
        weaknesses: [
          'Bazı bölgelerde küçük çizikler',
          'Hafif oksidasyon belirtileri',
          'Gloss seviyesi optimum değil'
        ],
        recommendations: [
          'Küçük çizikler için profesyonel retuş',
          'Düzenli cilalama ve koruyucu uygulama',
          '6 ayda bir detaylı temizlik',
          'Güneş koruması kullanımı'
        ],
        estimatedValue: 450000,
        marketComparison: 'Piyasa ortalamasının %5 üzerinde'
      },
      technicalDetails: {
        paintSystem: '3-Kat Sistem (Primer + Baz + Clear)',
        primerType: 'Epoksi Primer',
        baseCoat: 'Metalik Baz Kat',
        clearCoat: 'UV Korumalı Clear Kat',
        totalThickness: 93,
        colorCode: '1G3 (Silver Metallic)'
      }
    })
  }, [])

  const generatePDF = async () => {
    if (!report) return
    
    setIsGeneratingPDF(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      // Header
      pdf.setFillColor(59, 130, 246)
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('PROFESYONEL BOYA ANALIZI RAPORU', pageWidth / 2, 20, { align: 'center' })
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Mivvo Expertiz - AI Destekli Analiz', pageWidth / 2, 30, { align: 'center' })
      
      // Vehicle Info
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ARAC BILGILERI', 20, 50)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Marka: ${report.vehicleInfo.make}`, 20, 60)
      pdf.text(`Model: ${report.vehicleInfo.model}`, 20, 65)
      pdf.text(`Yil: ${report.vehicleInfo.year}`, 20, 70)
      pdf.text(`Plaka: ${report.vehicleInfo.plate}`, 20, 75)
      pdf.text(`VIN: ${report.vehicleInfo.vin}`, 20, 80)
      pdf.text(`Analiz Tarihi: ${report.analysisDate}`, 20, 85)
      
      // Overall Score
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('GENEL DEGERLENDIRME', 20, 100)
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Genel Skor: ${report.overallScore}/100`, 20, 110)
      pdf.text(`Boya Durumu: ${paintConditions[report.paintCondition].label}`, 20, 115)
      
      // Technical Details
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('TEKNIK DETAYLAR', 20, 130)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Boya Sistemi: ${report.technicalDetails.paintSystem}`, 20, 140)
      pdf.text(`Toplam Kalinlik: ${report.technicalDetails.totalThickness} μm`, 20, 145)
      pdf.text(`Renk Kodu: ${report.technicalDetails.colorCode}`, 20, 150)
      
      // Recommendations
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ONERILER', 20, 165)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      report.summary.recommendations.forEach((rec, index) => {
        pdf.text(`• ${rec}`, 20, 175 + (index * 5))
      })
      
      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Bu rapor Mivvo Expertiz AI teknolojisi kullanilarak olusturulmustur.', 20, 280)
      pdf.text('www.mivvo.com', pageWidth - 20, 280, { align: 'right' })
      
      const fileName = `boya-analizi-${report.vehicleInfo.plaka}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
                className="btn btn-primary"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    PDF Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-4 h-4 mr-2" />
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
