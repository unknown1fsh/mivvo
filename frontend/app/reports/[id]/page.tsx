'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
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
  SparklesIcon,
  TruckIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  StarIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import jsPDF from 'jspdf'

interface DetailedReport {
  id: string
  vehicleInfo: {
    plate: string
    brand: string
    model: string
    year: number
    vin: string
    color: string
    mileage: number
    fuelType: string
    transmission: string
    engine: string
    bodyType: string
  }
  reportType: string
  status: string
  createdAt: string
  totalCost: number
  overallScore: number
  sections: {
    exterior: {
      score: number
      paintCondition: string
      scratches: number
      dents: number
      rust: boolean
      oxidation: number
      glossLevel: number
      recommendations: string[]
    }
    interior: {
      score: number
      seatCondition: string
      dashboardCondition: string
      electronicsWorking: boolean
      cleanliness: string
      recommendations: string[]
    }
    mechanical: {
      score: number
      engineCondition: string
      transmissionCondition: string
      brakesCondition: string
      suspensionCondition: string
      recommendations: string[]
    }
    safety: {
      score: number
      airbagStatus: string
      absWorking: boolean
      seatbeltCondition: string
      lightsWorking: boolean
      recommendations: string[]
    }
  }
  marketValue: {
    estimatedValue: number
    marketRange: { min: number; max: number }
    depreciation: number
    comparison: string
  }
  summary: {
    strengths: string[]
    weaknesses: string[]
    overallRecommendation: string
    priorityActions: string[]
  }
}

const mockReports: { [key: string]: DetailedReport } = {
  '1': {
    id: '1',
    vehicleInfo: {
      plate: '34 ABC 123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      vin: '1HGBH41JXMN109186',
      color: 'Gümüş',
      mileage: 45000,
      fuelType: 'Benzin',
      transmission: 'CVT',
      engine: '1.6L 4-Silindir',
      bodyType: 'Sedan'
    },
    reportType: 'Tam Expertiz',
    status: 'completed',
    createdAt: '2024-01-15',
    totalCost: 75,
    overallScore: 87,
    sections: {
      exterior: {
        score: 92,
        paintCondition: 'Mükemmel',
        scratches: 2,
        dents: 0,
        rust: false,
        oxidation: 5,
        glossLevel: 95,
        recommendations: ['Hafif çizikler için polish uygulaması', '6 ayda bir wax uygulaması']
      },
      interior: {
        score: 85,
        seatCondition: 'İyi',
        dashboardCondition: 'Mükemmel',
        electronicsWorking: true,
        cleanliness: 'Temiz',
        recommendations: ['Koltuk temizliği', 'Deri bakım ürünü kullanımı']
      },
      mechanical: {
        score: 90,
        engineCondition: 'Mükemmel',
        transmissionCondition: 'İyi',
        brakesCondition: 'Mükemmel',
        suspensionCondition: 'İyi',
        recommendations: ['Transmisyon yağı değişimi', 'Fren disk kontrolü']
      },
      safety: {
        score: 88,
        airbagStatus: 'Aktif',
        absWorking: true,
        seatbeltCondition: 'İyi',
        lightsWorking: true,
        recommendations: ['Yıllık güvenlik kontrolü', 'Emniyet kemeri kontrolü']
      }
    },
    marketValue: {
      estimatedValue: 485000,
      marketRange: { min: 460000, max: 510000 },
      depreciation: 12,
      comparison: 'Piyasa ortalamasının üzerinde'
    },
    summary: {
      strengths: [
        'Düşük kilometre',
        'Mükemmel motor durumu',
        'Az kullanılmış',
        'Güvenilir marka',
        'İyi bakım geçmişi'
      ],
      weaknesses: [
        'Hafif çizikler',
        'Transmisyon bakımı gerekli',
        'Koltuk aşınması'
      ],
      overallRecommendation: 'Satın alınabilir',
      priorityActions: [
        'Transmisyon yağı değişimi',
        'Koltuk temizliği',
        'Polish uygulaması'
      ]
    }
  },
  '2': {
    id: '2',
    vehicleInfo: {
      plate: '06 XYZ 789',
      brand: 'Honda',
      model: 'Civic',
      year: 2019,
      vin: '1HGBH41JXMN109187',
      color: 'Kırmızı',
      mileage: 62000,
      fuelType: 'Benzin',
      transmission: 'Manuel',
      engine: '1.5L Turbo',
      bodyType: 'Hatchback'
    },
    reportType: 'Boya Analizi',
    status: 'processing',
    createdAt: '2024-01-14',
    totalCost: 25,
    overallScore: 78,
    sections: {
      exterior: {
        score: 75,
        paintCondition: 'İyi',
        scratches: 8,
        dents: 3,
        rust: false,
        oxidation: 15,
        glossLevel: 70,
        recommendations: ['Boya onarımı gerekli', 'Detailing yapılmalı', 'Çizik onarımı']
      },
      interior: {
        score: 80,
        seatCondition: 'İyi',
        dashboardCondition: 'İyi',
        electronicsWorking: true,
        cleanliness: 'Orta',
        recommendations: ['Derinlemesine temizlik', 'Koltuk bakımı']
      },
      mechanical: {
        score: 82,
        engineCondition: 'İyi',
        transmissionCondition: 'İyi',
        brakesCondition: 'İyi',
        suspensionCondition: 'İyi',
        recommendations: ['Genel kontrol', 'Filtre değişimi']
      },
      safety: {
        score: 85,
        airbagStatus: 'Aktif',
        absWorking: true,
        seatbeltCondition: 'İyi',
        lightsWorking: true,
        recommendations: ['Güvenlik kontrolü']
      }
    },
    marketValue: {
      estimatedValue: 425000,
      marketRange: { min: 400000, max: 450000 },
      depreciation: 18,
      comparison: 'Piyasa ortalamasında'
    },
    summary: {
      strengths: [
        'Güvenilir motor',
        'İyi güvenlik',
        'Turbo performans',
        'Manuel şanzıman'
      ],
      weaknesses: [
        'Boya hasarları',
        'Yüksek kilometre',
        'Çizikler ve dents',
        'Oksidasyon'
      ],
      overallRecommendation: 'Pazarlık yapılabilir',
      priorityActions: [
        'Boya onarımı',
        'Detailing',
        'Çizik onarımı',
        'Genel bakım'
      ]
    }
  }
}


export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  const [report, setReport] = useState<DetailedReport | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const foundReport = mockReports[reportId]
    if (foundReport) {
      setReport(foundReport)
    }
  }, [reportId])

  const generatePDF = async () => {
    if (!report) return
    
    setIsGeneratingPDF(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Başlık
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('DETAYLI EXPERTİZ RAPORU', pageWidth / 2, 30, { align: 'center' })
      
      // Araç bilgileri
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ARAÇ BİLGİLERİ', 20, 50)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${report.vehicleInfo.brand} ${report.vehicleInfo.model} ${report.vehicleInfo.year}`, 20, 60)
      pdf.text(`Plaka: ${report.vehicleInfo.plate}`, 20, 65)
      pdf.text(`VIN: ${report.vehicleInfo.vin}`, 20, 70)
      pdf.text(`Renk: ${report.vehicleInfo.color}`, 20, 75)
      pdf.text(`Kilometre: ${report.vehicleInfo.mileage.toLocaleString()} km`, 20, 80)
      
      // Genel değerlendirme
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('GENEL DEĞERLENDİRME', 20, 95)
      
      pdf.setFontSize(12)
      pdf.text(`Toplam Puan: ${report.overallScore}/100`, 20, 105)
      pdf.text(`Tahmini Değer: ${report.marketValue.estimatedValue.toLocaleString()}₺`, 20, 110)
      
      // Öneriler
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ÖNERİLER', 20, 125)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      report.summary.priorityActions.forEach((action, index) => {
        pdf.text(`• ${action}`, 25, 135 + (index * 5))
      })
      
      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Bu rapor Mivvo Expertiz AI teknolojisi kullanılarak oluşturulmuştur.', 20, pageHeight - 20)
      pdf.text('www.mivvo.com', pageWidth - 20, pageHeight - 20, { align: 'right' })
      
      const fileName = `expertiz-raporu-${report.vehicleInfo.plate}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Mükemmel'
    if (score >= 80) return 'İyi'
    if (score >= 70) return 'Orta'
    return 'Kötü'
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Rapor yükleniyor...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: ChartBarIcon },
    { id: 'exterior', label: 'Dış Görünüm', icon: PaintBrushIcon },
    { id: 'interior', label: 'İç Mekan', icon: EyeIcon },
    { id: 'mechanical', label: 'Mekanik', icon: WrenchScrewdriverIcon },
    { id: 'safety', label: 'Güvenlik', icon: ShieldCheckIcon },
    { id: 'market', label: 'Piyasa Değeri', icon: CurrencyDollarIcon }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Dashboard'a Dön</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Report Header */}
        <FadeInUp>
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                  <TruckIcon className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {report.vehicleInfo.brand} {report.vehicleInfo.model} {report.vehicleInfo.year}
                  </h1>
                  <div className="flex items-center space-x-6 text-gray-600">
                    <span className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{report.createdAt}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <DocumentTextIcon className="w-4 h-4" />
                      <span>{report.reportType}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <CurrencyDollarIcon className="w-4 h-4" />
                      <span>{report.totalCost}₺</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getScoreColor(report.overallScore)}`}>
                  <StarIcon className="w-4 h-4 mr-2" />
                  {report.overallScore}/100 - {getScoreText(report.overallScore)}
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {report.marketValue.estimatedValue.toLocaleString()}₺
                </p>
                <p className="text-sm text-gray-600">Tahmini Piyasa Değeri</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TruckIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plaka</p>
                    <p className="font-semibold text-gray-900">{report.vehicleInfo.plate}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kilometre</p>
                    <p className="font-semibold text-gray-900">{report.vehicleInfo.mileage.toLocaleString()} km</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PaintBrushIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Renk</p>
                    <p className="font-semibold text-gray-900">{report.vehicleInfo.color}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CpuChipIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Motor</p>
                    <p className="font-semibold text-gray-900">{report.vehicleInfo.engine}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Tabs */}
        <FadeInUp delay={0.1}>
          <div className="bg-white rounded-xl shadow-lg mb-8">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <StaggerContainer className="space-y-8">
                  <StaggerItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Genel Puanlar */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">Bölüm Puanları</h3>
                        {Object.entries(report.sections).map(([key, section]) => {
                          const sectionNames: { [key: string]: string } = {
                            exterior: 'Dış Görünüm',
                            interior: 'İç Mekan',
                            mechanical: 'Mekanik',
                            safety: 'Güvenlik'
                          }
                          return (
                            <div key={key} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{sectionNames[key]}</h4>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(section.score)}`}>
                                  {section.score}/100
                                </div>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    section.score >= 90 ? 'bg-green-500' :
                                    section.score >= 80 ? 'bg-blue-500' :
                                    section.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${section.score}%` }}
                                ></div>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Güçlü/Zayıf Yönler */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900">Değerlendirme</h3>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="font-medium text-green-900 mb-3 flex items-center">
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Güçlü Yönler
                          </h4>
                          <ul className="space-y-2">
                            {report.summary.strengths.map((strength, index) => (
                              <li key={index} className="text-sm text-green-700 flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-50 rounded-lg p-4">
                          <h4 className="font-medium text-red-900 mb-3 flex items-center">
                            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                            Zayıf Yönler
                          </h4>
                          <ul className="space-y-2">
                            {report.summary.weaknesses.map((weakness, index) => (
                              <li key={index} className="text-sm text-red-700 flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
                        <LightBulbIcon className="w-5 h-5 mr-2" />
                        Genel Öneri
                      </h3>
                      <p className="text-blue-800 text-lg font-medium">{report.summary.overallRecommendation}</p>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="bg-yellow-50 rounded-lg p-6">
                      <h3 className="text-xl font-semibold text-yellow-900 mb-4 flex items-center">
                        <ClockIcon className="w-5 h-5 mr-2" />
                        Öncelikli Aksiyonlar
                      </h3>
                      <ul className="space-y-2">
                        {report.summary.priorityActions.map((action, index) => (
                          <li key={index} className="text-yellow-800 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Exterior Tab */}
              {activeTab === 'exterior' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Dış Görünüm Detayları</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Boya Durumu</span>
                            <span className="font-medium">{report.sections.exterior.paintCondition}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Çizik Sayısı</span>
                            <span className="font-medium">{report.sections.exterior.scratches}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dent Sayısı</span>
                            <span className="font-medium">{report.sections.exterior.dents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pas Durumu</span>
                            <span className="font-medium">{report.sections.exterior.rust ? 'Var' : 'Yok'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Oksidasyon</span>
                            <span className="font-medium">%{report.sections.exterior.oxidation}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Parlaklık Seviyesi</span>
                            <span className="font-medium">%{report.sections.exterior.glossLevel}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Öneriler</h3>
                        <ul className="space-y-2">
                          {report.sections.exterior.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Mechanical Tab */}
              {activeTab === 'mechanical' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Mekanik Sistem Detayları</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-blue-900">Motor Durumu</h4>
                              <span className="text-sm font-medium text-blue-700">{report.sections.mechanical.score >= 90 ? 'Mükemmel' : report.sections.mechanical.score >= 80 ? 'İyi' : 'Orta'}</span>
                            </div>
                            <div className="space-y-2 text-sm text-blue-800">
                              <div className="flex justify-between">
                                <span>Yağ Seviyesi</span>
                                <span className="font-medium">Normal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Soğutma Sistemi</span>
                                <span className="font-medium">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Egzoz Sistemi</span>
                                <span className="font-medium">Temiz</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Hava Filtresi</span>
                                <span className="font-medium">Temiz</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-green-900">Fren Sistemi</h4>
                              <span className="text-sm font-medium text-green-700">Mükemmel</span>
                            </div>
                            <div className="space-y-2 text-sm text-green-800">
                              <div className="flex justify-between">
                                <span>Fren Balata Kalınlığı</span>
                                <span className="font-medium">8mm (Yeni)</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fren Diski</span>
                                <span className="font-medium">İyi Durumda</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fren Hidroliği</span>
                                <span className="font-medium">Normal Seviye</span>
                              </div>
                              <div className="flex justify-between">
                                <span>El Freni</span>
                                <span className="font-medium">Çalışıyor</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-purple-900">Süspansiyon</h4>
                              <span className="text-sm font-medium text-purple-700">İyi</span>
                            </div>
                            <div className="space-y-2 text-sm text-purple-800">
                              <div className="flex justify-between">
                                <span>Ön Amortisör</span>
                                <span className="font-medium">Normal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Arka Amortisör</span>
                                <span className="font-medium">Normal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Direksiyon Boşluğu</span>
                                <span className="font-medium">Minimal</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lastik Dengesi</span>
                                <span className="font-medium">İyi</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Teknik Özellikler</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Motor Tipi</span>
                              <span className="font-medium">{report.vehicleInfo.engine}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Şanzıman</span>
                              <span className="font-medium">{report.vehicleInfo.transmission}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Yakıt Tipi</span>
                              <span className="font-medium">{report.vehicleInfo.fuelType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Güç</span>
                              <span className="font-medium">132 HP</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tork</span>
                              <span className="font-medium">160 Nm</span>
                            </div>
                          </div>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6">Mekanik Öneriler</h3>
                        <ul className="space-y-2">
                          {report.sections.mechanical.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Dikkat Edilmesi Gerekenler</h4>
                          <ul className="text-sm text-yellow-800 space-y-1">
                            <li>• 50.000 km'de büyük bakım yapılmalı</li>
                            <li>• Motor yağı 6 ayda bir kontrol edilmeli</li>
                            <li>• Fren sistemi yılda bir kontrol edilmeli</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Safety Tab */}
              {activeTab === 'safety' && (
                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Güvenlik Sistemleri</h3>
                        <div className="space-y-4">
                          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-red-900">Hava Yastığı Sistemi</h4>
                              <span className="text-sm font-medium text-green-600">✓ Aktif</span>
                            </div>
                            <div className="space-y-2 text-sm text-red-800">
                              <div className="flex justify-between">
                                <span>Sürücü Hava Yastığı</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Yolcu Hava Yastığı</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Yan Hava Yastıkları</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Perde Hava Yastıkları</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-blue-900">Fren Güvenlik Sistemleri</h4>
                              <span className="text-sm font-medium text-green-600">✓ Aktif</span>
                            </div>
                            <div className="space-y-2 text-sm text-blue-800">
                              <div className="flex justify-between">
                                <span>ABS (Kilitlenme Önleyici)</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>EBD (Elektronik Fren Dağıtımı)</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>BA (Fren Yardımcısı)</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>ESP (Elektronik Stabilite)</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-green-900">Aydınlatma Sistemi</h4>
                              <span className="text-sm font-medium text-green-600">✓ Çalışıyor</span>
                            </div>
                            <div className="space-y-2 text-sm text-green-800">
                              <div className="flex justify-between">
                                <span>Farlar</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Stop Lambaları</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sinyal Lambaları</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Plaka Aydınlatması</span>
                                <span className="font-medium text-green-600">Çalışıyor</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-900">Güvenlik Değerlendirmesi</h3>
                        
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                          <h4 className="font-medium text-green-900 mb-3">🛡️ Güvenlik Puanı: {report.sections.safety.score}/100</h4>
                          <div className="space-y-2 text-sm text-green-800">
                            <div className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Tüm güvenlik sistemleri aktif</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Emniyet kemerleri sağlam</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Aydınlatma sistemi tam</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-3">📋 Güvenlik Kontrol Listesi</h4>
                          <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Hava yastığı sistemleri kontrol edildi</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Fren güvenlik sistemleri test edildi</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Emniyet kemeri mekanizmaları kontrol edildi</span>
                            </li>
                            <li className="flex items-center space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-600" />
                              <span>Aydınlatma sistemi test edildi</span>
                            </li>
                          </ul>
                        </div>

                        <h3 className="text-xl font-semibold text-gray-900 mt-6">Güvenlik Önerileri</h3>
                        <ul className="space-y-2">
                          {report.sections.safety.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700">{rec}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <h4 className="font-medium text-orange-900 mb-2">⚠️ Güvenlik Uyarıları</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Güvenlik sistemleri yılda bir kontrol edilmeli</li>
                            <li>• Emniyet kemerleri 5 yılda bir değiştirilmeli</li>
                            <li>• Hava yastığı sensörleri düzenli kontrol edilmeli</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}

              {/* Market Value Tab */}
              {activeTab === 'market' && (
                <StaggerContainer className="space-y-8">
                  <StaggerItem>
                    {/* Ana Değer Kartı */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Tahmini Piyasa Değeri</h3>
                          <p className="text-green-100 mb-4">AI destekli analiz sonucu</p>
                          <div className="text-5xl font-bold mb-2">
                            {report.marketValue.estimatedValue.toLocaleString()}₺
                          </div>
                          <div className="flex items-center space-x-4 text-green-100">
                            <span className="flex items-center space-x-1">
                              <StarIcon className="w-4 h-4" />
                              <span>Güvenilirlik: %95</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <ClockIcon className="w-4 h-4" />
                              <span>Son güncelleme: Bugün</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-sm text-green-100">Piyasa Aralığı</div>
                            <div className="text-xl font-bold">
                              {report.marketValue.marketRange.min.toLocaleString()}₺
                            </div>
                            <div className="text-sm text-green-100">-</div>
                            <div className="text-xl font-bold">
                              {report.marketValue.marketRange.max.toLocaleString()}₺
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Değer Kaybı Analizi */}
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-red-900">Değer Kaybı</h4>
                          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <ChartBarIcon className="w-6 h-6 text-red-600" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-red-600 mb-2">
                          %{report.marketValue.depreciation}
                        </div>
                        <div className="text-sm text-red-700 mb-3">
                          {report.marketValue.depreciation < 15 ? 'Düşük kayıp' : 
                           report.marketValue.depreciation < 25 ? 'Orta kayıp' : 'Yüksek kayıp'}
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(report.marketValue.depreciation * 2, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Piyasa Konumu */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-blue-900">Piyasa Konumu</h4>
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div className="text-lg font-bold text-blue-600 mb-2">
                          {report.marketValue.comparison}
                        </div>
                        <div className="text-sm text-blue-700 mb-3">
                          Benzer araçlara göre
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.marketValue.comparison.includes('üzerinde') ? (
                            <>
                              <ArrowDownTrayIcon className="w-4 h-4 text-green-600 rotate-180" />
                              <span className="text-sm text-green-600">Pozitif</span>
                            </>
                          ) : (
                            <>
                              <ArrowDownTrayIcon className="w-4 h-4 text-blue-600" />
                              <span className="text-sm text-blue-600">Nötr</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Yatırım Potansiyeli */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-purple-900">Yatırım Potansiyeli</h4>
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-purple-600" />
                          </div>
                        </div>
                        <div className="text-lg font-bold text-purple-600 mb-2">
                          {report.summary.overallRecommendation.includes('Satın') ? 'Yüksek' : 'Orta'}
                        </div>
                        <div className="text-sm text-purple-700 mb-3">
                          {report.summary.overallRecommendation.includes('Satın') ? 'Değerli yatırım' : 'Dikkatli değerlendirin'}
                        </div>
                        <div className="flex items-center space-x-2">
                          <StarIcon className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-purple-600">
                            {report.summary.overallRecommendation.includes('Satın') ? '4.5/5' : '3.5/5'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    {/* Detaylı Piyasa Analizi */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6">Detaylı Piyasa Analizi</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Piyasa Karşılaştırması */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Benzer Araçlar Karşılaştırması</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Ortalama Piyasa Fiyatı</div>
                                <div className="text-sm text-gray-600">Aynı segment</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">475.000₺</div>
                                <div className={`text-sm ${report.marketValue.estimatedValue > 475000 ? 'text-green-600' : 'text-red-600'}`}>
                                  {report.marketValue.estimatedValue > 475000 ? '+2.1%' : '-1.2%'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Aynı Yaş Ortalaması</div>
                                <div className="text-sm text-gray-600">2020 model yılı</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">468.000₺</div>
                                <div className={`text-sm ${report.marketValue.estimatedValue > 468000 ? 'text-green-600' : 'text-red-600'}`}>
                                  {report.marketValue.estimatedValue > 468000 ? '+3.6%' : '-0.8%'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">Aynı Kilometre Aralığı</div>
                                <div className="text-sm text-gray-600">40-50K km</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">492.000₺</div>
                                <div className={`text-sm ${report.marketValue.estimatedValue > 492000 ? 'text-green-600' : 'text-red-600'}`}>
                                  {report.marketValue.estimatedValue > 492000 ? '+1.4%' : '-1.4%'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fiyat Trendi */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Fiyat Trendi (Son 6 Ay)</h4>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm text-gray-600">Trend Yönü</span>
                              <span className="text-sm font-medium text-green-600">↗ Yükseliş</span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Ocak 2024</span>
                                <span className="font-medium">478.000₺</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Şubat 2024</span>
                                <span className="font-medium">482.000₺</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Mart 2024</span>
                                <span className="font-medium">485.000₺</span>
                              </div>
                              <div className="flex justify-between text-sm font-bold">
                                <span>Güncel</span>
                                <span className="text-green-600">485.000₺</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                            <h5 className="font-medium text-yellow-900 mb-2">📈 Fiyat Öngörüsü</h5>
                            <p className="text-sm text-yellow-800">
                              Piyasa koşulları değişmezse, 3 ay içinde %2-3 artış bekleniyor.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>

                  <StaggerItem>
                    {/* Öneriler ve Aksiyonlar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                        <h4 className="font-semibold text-green-900 mb-4 flex items-center">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Satış Önerileri
                        </h4>
                        <ul className="space-y-2 text-sm text-green-800">
                          <li className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Mevcut fiyat aralığında satış yapılabilir</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Pazarlık payı %5-8 arasında bırakılmalı</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Hızlı satış için üst limit kullanılabilir</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                          <LightBulbIcon className="w-5 h-5 mr-2" />
                          Değer Artırma Önerileri
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-800">
                          <li className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Küçük onarımlar yapılarak +15.000₺ artış sağlanabilir</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Detailing ile görsel değer artırılabilir</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span>Bakım geçmişi belgelenmelidir</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </StaggerItem>
                </StaggerContainer>
              )}
            </div>
          </div>
        </FadeInUp>

        {/* Action Buttons */}
        <FadeInUp delay={0.2}>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              className="btn btn-primary btn-lg flex items-center space-x-2"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>PDF Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  <span>PDF İndir</span>
                </>
              )}
            </button>
            
            <button className="btn btn-secondary btn-lg flex items-center space-x-2">
              <PrinterIcon className="w-5 h-5" />
              <span>Yazdır</span>
            </button>
            
            <button className="btn btn-secondary btn-lg flex items-center space-x-2">
              <ShareIcon className="w-5 h-5" />
              <span>Paylaş</span>
            </button>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
