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
    marketRange: {
      min: number
      max: number
    }
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

// Mock data for reports
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
        recommendations: [
          'Hafif çizikler için polishing önerilir',
          'Düzenli yıkama ve wax uygulaması'
        ]
      },
      interior: {
        score: 85,
        seatCondition: 'İyi',
        dashboardCondition: 'Mükemmel',
        electronicsWorking: true,
        cleanliness: 'Temiz',
        recommendations: [
          'Koltuklar için deri bakım ürünü kullanılabilir',
          'Elektronik sistemler düzenli kontrol edilmeli'
        ]
      },
      mechanical: {
        score: 90,
        engineCondition: 'Mükemmel',
        transmissionCondition: 'İyi',
        brakesCondition: 'Mükemmel',
        suspensionCondition: 'İyi',
        recommendations: [
          'Periyodik bakım takvimi takip edilmeli',
          'Fren balataları yakında değiştirilebilir'
        ]
      },
      safety: {
        score: 88,
        airbagStatus: 'Aktif',
        absWorking: true,
        seatbeltCondition: 'İyi',
        lightsWorking: true,
        recommendations: [
          'Güvenlik sistemleri düzenli test edilmeli',
          'Lastik diş derinliği kontrol edilmeli'
        ]
      }
    },
    marketValue: {
      estimatedValue: 485000,
      marketRange: {
        min: 460000,
        max: 510000
      },
      depreciation: 12,
      comparison: 'Piyasa ortalamasının üzerinde'
    },
    summary: {
      strengths: [
        'Mükemmel motor durumu',
        'Düşük kilometre',
        'Düzenli bakım geçmişi',
        'Güvenlik sistemleri aktif'
      ],
      weaknesses: [
        'Hafif çizikler mevcut',
        'Fren balataları yakında değişmeli'
      ],
      overallRecommendation: 'Satın alınabilir',
      priorityActions: [
        'Fren balatalarının değiştirilmesi',
        'Polishing işlemi yapılması'
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
        recommendations: [
          'Çoklu çizikler için profesyonel boya işlemi gerekli',
          'Oksidasyon temizliği yapılmalı'
        ]
      },
      interior: {
        score: 80,
        seatCondition: 'İyi',
        dashboardCondition: 'İyi',
        electronicsWorking: true,
        cleanliness: 'Orta',
        recommendations: [
          'İç temizlik yapılmalı',
          'Koltuklar için deri bakımı önerilir'
        ]
      },
      mechanical: {
        score: 82,
        engineCondition: 'İyi',
        transmissionCondition: 'İyi',
        brakesCondition: 'İyi',
        suspensionCondition: 'İyi',
        recommendations: [
          'Genel mekanik durum iyi',
          'Periyodik bakım devam etmeli'
        ]
      },
      safety: {
        score: 85,
        airbagStatus: 'Aktif',
        absWorking: true,
        seatbeltCondition: 'İyi',
        lightsWorking: true,
        recommendations: [
          'Güvenlik sistemleri kontrol edilmeli',
          'Lastik durumu değerlendirilmeli'
        ]
      }
    },
    marketValue: {
      estimatedValue: 425000,
      marketRange: {
        min: 400000,
        max: 450000
      },
      depreciation: 18,
      comparison: 'Piyasa ortalamasında'
    },
    summary: {
      strengths: [
        'Güvenilir motor',
        'Manuel şanzıman',
        'Güvenlik sistemleri aktif'
      ],
      weaknesses: [
        'Çoklu çizikler',
        'Yüksek kilometre',
        'Oksidasyon mevcut'
      ],
      overallRecommendation: 'Pazarlık yapılabilir',
      priorityActions: [
        'Boya işlemi yapılması',
        'Oksidasyon temizliği',
        'Genel bakım kontrolü'
      ]
    }
  }
}

export function ReportDetailClient({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<DetailedReport | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Mock data yükleme
    setTimeout(() => {
      const mockReport = mockReports[reportId]
      if (mockReport) {
        setReport(mockReport)
      }
    }, 500)
  }, [reportId])

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

  const sectionNames = {
    exterior: 'Dış Görünüm',
    interior: 'İç Mekan',
    mechanical: 'Mekanik',
    safety: 'Güvenlik'
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
                  {Object.entries(report.sections).map(([key, section]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {sectionNames[key as keyof typeof sectionNames]}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{section.score}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${section.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
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

          {/* Tabs */}
          <div className="card p-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'overview', name: 'Genel Bakış', icon: ChartBarIcon },
                  { id: 'exterior', name: 'Dış Görünüm', icon: PaintBrushIcon },
                  { id: 'interior', name: 'İç Mekan', icon: EyeIcon },
                  { id: 'mechanical', name: 'Mekanik', icon: WrenchScrewdriverIcon },
                  { id: 'safety', name: 'Güvenlik', icon: ShieldCheckIcon },
                  { id: 'market', name: 'Piyasa Değeri', icon: CurrencyDollarIcon }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Genel Değerlendirme</h4>
                    <p className="text-gray-600 mb-4">{report.summary.overallRecommendation}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">Güçlü Yönler</h5>
                      <ul className="space-y-1">
                        {report.summary.strengths.map((strength, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-orange-700 mb-2">Dikkat Edilmesi Gerekenler</h5>
                      <ul className="space-y-1">
                        {report.summary.weaknesses.map((weakness, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <ExclamationTriangleIcon className="w-4 h-4 text-orange-500 mr-2" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-blue-700 mb-2">Öncelikli Aksiyonlar</h5>
                    <ul className="space-y-1">
                      {report.summary.priorityActions.map((action, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <LightBulbIcon className="w-4 h-4 text-blue-500 mr-2" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'exterior' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Dış Görünüm Analizi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Boya Durumu</p>
                          <p className="font-medium">{report.sections.exterior.paintCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Çizik Sayısı</p>
                          <p className="font-medium">{report.sections.exterior.scratches}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Göçük Sayısı</p>
                          <p className="font-medium">{report.sections.exterior.dents}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Pas Durumu</p>
                          <p className="font-medium">{report.sections.exterior.rust ? 'Pas Var' : 'Pas Yok'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Oksidasyon (%)</p>
                          <p className="font-medium">{report.sections.exterior.oxidation}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Parlaklık Seviyesi</p>
                          <p className="font-medium">{report.sections.exterior.glossLevel}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {report.sections.exterior.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Öneriler</h5>
                      <ul className="space-y-1">
                        {report.sections.exterior.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <LightBulbIcon className="w-4 h-4 text-blue-500 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'interior' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">İç Mekan Analizi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Koltuk Durumu</p>
                          <p className="font-medium">{report.sections.interior.seatCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Konsol Durumu</p>
                          <p className="font-medium">{report.sections.interior.dashboardCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Elektronik Sistemler</p>
                          <p className="font-medium">
                            {report.sections.interior.electronicsWorking ? 'Çalışıyor' : 'Sorun Var'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Temizlik Durumu</p>
                          <p className="font-medium">{report.sections.interior.cleanliness}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {report.sections.interior.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Öneriler</h5>
                      <ul className="space-y-1">
                        {report.sections.interior.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <LightBulbIcon className="w-4 h-4 text-blue-500 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'mechanical' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Mekanik Sistem Analizi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Motor Durumu</p>
                          <p className="font-medium">{report.sections.mechanical.engineCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Şanzıman Durumu</p>
                          <p className="font-medium">{report.sections.mechanical.transmissionCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Fren Durumu</p>
                          <p className="font-medium">{report.sections.mechanical.brakesCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Süspansiyon Durumu</p>
                          <p className="font-medium">{report.sections.mechanical.suspensionCondition}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {report.sections.mechanical.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Öneriler</h5>
                      <ul className="space-y-1">
                        {report.sections.mechanical.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <LightBulbIcon className="w-4 h-4 text-blue-500 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Güvenlik Sistemleri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Hava Yastığı Durumu</p>
                          <p className="font-medium">{report.sections.safety.airbagStatus}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">ABS Sistemi</p>
                          <p className="font-medium">
                            {report.sections.safety.absWorking ? 'Çalışıyor' : 'Sorun Var'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Emniyet Kemeri</p>
                          <p className="font-medium">{report.sections.safety.seatbeltCondition}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aydınlatma Sistemleri</p>
                          <p className="font-medium">
                            {report.sections.safety.lightsWorking ? 'Çalışıyor' : 'Sorun Var'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {report.sections.safety.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-700 mb-2">Öneriler</h5>
                      <ul className="space-y-1">
                        {report.sections.safety.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <LightBulbIcon className="w-4 h-4 text-blue-500 mr-2" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'market' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Piyasa Değeri Analizi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Tahmini Değer</p>
                          <p className="text-2xl font-bold text-green-600">
                            {report.marketValue.estimatedValue.toLocaleString()}₺
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Değer Aralığı</p>
                          <p className="font-medium">
                            {report.marketValue.marketRange.min.toLocaleString()}₺ - {report.marketValue.marketRange.max.toLocaleString()}₺
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Değer Kaybı</p>
                          <p className="font-medium">{report.marketValue.depreciation}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Piyasa Durumu</p>
                          <p className="font-medium text-green-600">{report.marketValue.comparison}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
