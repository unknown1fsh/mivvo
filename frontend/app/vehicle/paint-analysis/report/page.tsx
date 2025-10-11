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
  DocumentArrowDownIcon,
  ShareIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  SparklesIcon,
  EyeIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { apiClient } from '@/services/apiClient'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { savePageAsPDF } from '@/lib/savePageAsPDF'
import { ReportLoading } from '@/components/ui/ReportLoading'
import { ReportError } from '@/components/ui/ReportError'
import toast from 'react-hot-toast'

const paintConditions = {
  excellent: { label: 'Mükemmel', color: 'green' },
  good: { label: 'İyi', color: 'blue' },
  fair: { label: 'Orta', color: 'yellow' },
  poor: { label: 'Kötü', color: 'red' },
  iyi: { label: 'İyi', color: 'green' },
  orta: { label: 'Orta', color: 'yellow' },
  kötü: { label: 'Kötü', color: 'red' }
}

interface PaintAnalysisReport {
  id: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    plate: string
  }
  paintCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  paintQuality: {
    overallScore: number
    glossLevel: number
    smoothness: number
    uniformity: number
    adhesion: number
    durability: number
    weatherResistance: number
    uvProtection: number
  }
  colorAnalysis: {
    colorCode: string
    colorName: string
    colorFamily: string
    metallic: boolean
    pearl: boolean
    colorMatch: number
    colorConsistency: number
    colorDepth: number
    colorVibrance: number
    colorFading: number
    colorShifting: number
    originalColor: boolean
    repaintDetected: boolean
    colorHistory: string[]
  }
  surfaceAnalysis: {
    paintThickness: number
    primerThickness: number
    baseCoatThickness: number
    clearCoatThickness: number
    totalThickness: number
    thicknessUniformity: number
    surfaceRoughness: number
    orangePeel: number
    runs: number
    sags: number
    dirt: number
    contamination: number
    surfaceDefects: Array<{
      type: string
      severity: string
      location: string
      size: number
      description: string
      repairable: boolean
      repairCost: number
    }>
  }
  paintDefects: {
    surfaceDefects: Array<{
      id: string
      type: string
      severity: string
      location: string
      size: number
      description: string
      repairable: boolean
      repairCost: number
    }>
    colorIssues: any[]
    glossProblems: any[]
    thicknessVariations: any[]
    totalDefectScore: number
  }
  technicalDetails: {
    paintSystem: string
    primerType: string
    baseCoat: string
    clearCoat: string
    paintBrand: string
    paintType: string
    applicationMethod: string
    curingMethod: string
    paintAge: number
    lastRepaint: number
    paintLayers: number
    qualityGrade: string
  }
  recommendations: {
    immediate: string[]
    shortTerm: string[]
    longTerm: string[]
    maintenance: string[]
    protection: string[]
    qualityImprovement: string[]
    prevention: string[]
  }
  costEstimate: {
    totalCost: number
    laborCost: number
    materialCost: number
    preparationCost: number
    paintCost: number
    clearCoatCost: number
    additionalCosts: number
    breakdown: Array<{
      category: string
      cost: number
      description: string
    }>
    timeline: Array<{
      phase: string
      duration: number
      description: string
    }>
    warranty: {
      covered: boolean
      duration: string
      conditions: string[]
    }
  }
  analysisDate: string
  // Eksik alanlar için fallback
  overallScore?: number
  images?: any[]
  summary?: {
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    estimatedValue: number
    marketComparison: string
  }
}


export default function PaintAnalysisReportPage() {
  const [report, setReport] = useState<PaintAnalysisReport | null>(null)

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
      const result = await apiClient.get(`/api/paint-analysis/${reportId}`)
      
      if (!result.success) {
        console.error('API Hatası:', result.error)
        throw new Error(`Rapor verisi alınamadı: ${result.error}`)
      }
      
      if (result.success && result.data) {
        console.log('🔍 Backend\'den gelen veri:', result.data)
        console.log('🔍 AI Analysis Data:', (result.data as any).aiAnalysisData)
        
        // Rapor durumunu kontrol et
        const actualData = (result.data as any).data || result.data
        const reportStatus = actualData.status
        console.log('📊 Rapor durumu:', reportStatus)
        console.log('📊 Tam response data:', result.data)
        console.log('📊 Actual data:', actualData)
        console.log('📊 Response data keys:', Object.keys(result.data))
        console.log('📊 Actual data keys:', Object.keys(actualData))
        console.log('📊 Status field:', actualData.status)
        console.log('📊 Status type:', typeof actualData.status)
        
        if (!reportStatus) {
          console.error('❌ Rapor durumu bulunamadı!')
          toast.error('Rapor durumu alınamadı. Lütfen tekrar deneyin.')
          return
        }
        
        if (reportStatus === 'PROCESSING') {
          console.log('⏳ Rapor henüz işleniyor, 5 saniye sonra tekrar denenecek...')
          toast.loading('AI analizi devam ediyor, lütfen bekleyin...', { id: 'paint-analysis-waiting' })
          
          // 5 saniye sonra tekrar dene
          setTimeout(() => {
            toast.dismiss('paint-analysis-waiting')
            fetchReportData()
          }, 5000)
          return
        }
        
        // AI analiz verisini kontrol et
        const aiAnalysisData = actualData.aiAnalysisData || actualData.analysisResult
        if (!aiAnalysisData || Object.keys(aiAnalysisData).length === 0) {
          console.warn('⚠️ AI analiz verisi boş! Rapor durumu:', reportStatus)
          toast.error('AI analizi henüz tamamlanmamış. Lütfen birkaç dakika sonra tekrar deneyin.')
          return
        }
        
        console.log('✅ AI analiz verisi bulundu:', aiAnalysisData)
        
        // Backend'den gelen veriyi frontend formatına çevir
        const reportData = transformBackendDataToFrontend(actualData)
        setReport(reportData)
        
        console.log('✅ Rapor verisi başarıyla yüklendi:', reportData)
      } else {
        throw new Error('Rapor verisi bulunamadı')
      }
    } catch (error) {
      console.error('Rapor yükleme hatası:', error)
      
      if (error instanceof Error && error.message.includes('AI analizi tamamlanmamış')) {
        toast.error('AI analizi henüz tamamlanmamış. Lütfen birkaç dakika sonra tekrar deneyin.')
      } else {
        toast.error('Rapor yüklenirken hata oluştu. Lütfen tekrar deneyin.')
      }
      
      // Mock data kullanmıyoruz - sadece gerçek AI verileri
    }
  }

  const transformBackendDataToFrontend = (backendData: any): PaintAnalysisReport => {
    const analysisData = backendData.aiAnalysisData || backendData.analysisResult || {}
    
    console.log('🔍 Backend AI Analysis Data:', analysisData)
    
    // AI'dan gelen veriyi kontrol et
    if (!analysisData || Object.keys(analysisData).length === 0) {
      console.warn('⚠️ AI analiz verisi boş!')
      throw new Error('AI analizi tamamlanmamış. Lütfen analizi tekrar çalıştırın.')
    }
    
    return {
      id: backendData.id || 'PA-2024-001',
      vehicleInfo: {
        make: backendData.vehicleBrand || 'Bilinmiyor',
        model: backendData.vehicleModel || 'Bilinmiyor',
        year: backendData.vehicleYear || 2020,
        vin: backendData.vehicleVin || 'Bilinmiyor',
        plate: backendData.vehiclePlate || 'Bilinmiyor'
      },
      paintCondition: analysisData.paintCondition || 'fair',
      paintQuality: analysisData.paintQuality || {
        overallScore: 0,
        glossLevel: 0,
        smoothness: 0,
        uniformity: 0,
        adhesion: 0,
        durability: 0,
        weatherResistance: 0,
        uvProtection: 0
      },
      colorAnalysis: analysisData.colorAnalysis || {
        colorCode: 'Bilinmiyor',
        colorName: 'Bilinmiyor',
        colorFamily: 'Bilinmiyor',
        metallic: false,
        pearl: false,
        colorMatch: 0,
        colorConsistency: 0,
        colorDepth: 0,
        colorVibrance: 0,
        colorFading: 0,
        colorShifting: 0,
        originalColor: true,
        repaintDetected: false,
        colorHistory: []
      },
      surfaceAnalysis: analysisData.surfaceAnalysis || {
        paintThickness: 0,
        primerThickness: 0,
        baseCoatThickness: 0,
        clearCoatThickness: 0,
        totalThickness: 0,
        thicknessUniformity: 0,
        surfaceRoughness: 0,
        orangePeel: 0,
        runs: 0,
        sags: 0,
        dirt: 0,
        contamination: 0,
        surfaceDefects: []
      },
      paintDefects: analysisData.paintDefects || {
        surfaceDefects: [],
        colorIssues: [],
        glossProblems: [],
        thicknessVariations: [],
        totalDefectScore: 0
      },
      technicalDetails: analysisData.technicalDetails || {
        paintSystem: 'Veri bulunamadı',
        primerType: 'Veri bulunamadı',
        baseCoat: 'Veri bulunamadı',
        clearCoat: 'Veri bulunamadı',
        paintBrand: 'Veri bulunamadı',
        paintType: 'Veri bulunamadı',
        applicationMethod: 'Veri bulunamadı',
        curingMethod: 'Veri bulunamadı',
        paintAge: 0,
        lastRepaint: 0,
        paintLayers: 0,
        qualityGrade: 'Bilinmiyor'
      },
      recommendations: analysisData.recommendations || {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        maintenance: [],
        protection: [],
        qualityImprovement: [],
        prevention: []
      },
      costEstimate: analysisData.costEstimate || {
        totalCost: 0,
        laborCost: 0,
        materialCost: 0,
        preparationCost: 0,
        paintCost: 0,
        clearCoatCost: 0,
        additionalCosts: 0,
        breakdown: [],
        timeline: [],
        warranty: {
          covered: false,
          duration: 'Veri bulunamadı',
          conditions: []
        }
      },
      analysisDate: new Date(backendData.createdAt).toLocaleDateString('tr-TR')
    }
  }


  const handleSave = async () => {
    if (!report) return

    try {
      await savePageAsPDF('report-content', `boya-analizi-${report.vehicleInfo.plate}.pdf`)
      toast.success('Rapor başarıyla kaydedildi!')
    } catch (error) {
      console.error('PDF kaydetme hatası:', error)
      toast.error('Rapor kaydedilirken hata oluştu!')
    }
  }


  if (!report || !report.paintQuality) {
    return (
      <ReportLoading
        type="paint"
        vehicleInfo={report ? {
          make: report.vehicleInfo.make,
          model: report.vehicleInfo.model,
          year: report.vehicleInfo.year,
          plate: report.vehicleInfo.plate
        } : undefined}
        progress={70}
        estimatedTime="20-30 saniye"
      />
    )
  }

  return (
    <div id="report-content" className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 no-print">
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
                onClick={handleSave}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-700 hover:to-purple-700"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                Kaydet
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
                <div className="text-3xl font-bold text-blue-600 mb-1">{report.paintQuality.overallScore}/100</div>
                <div className="text-sm text-gray-600">Genel Skor</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {paintConditions[report.paintCondition as keyof typeof paintConditions]?.label || report.paintCondition}
                </div>
                <div className="text-sm text-gray-600">Boya Durumu</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {report.surfaceAnalysis.totalThickness}μm
                </div>
                <div className="text-sm text-gray-600">Toplam Kalınlık</div>
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

            {/* Paint Quality Analysis */}
            <FadeInUp delay={0.2}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-2 text-blue-500" />
                  Boya Kalitesi Analizi
                </h2>
                
                {/* Genel Skor Gösterimi */}
                <div className="mb-6">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {report.paintQuality.overallScore}/100
                    </div>
                    <div className="text-lg text-gray-700 mb-2">Genel Kalite Skoru</div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                        style={{ width: `${report.paintQuality.overallScore}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {report.paintQuality.overallScore >= 90 ? 'Mükemmel Kalite' :
                       report.paintQuality.overallScore >= 70 ? 'İyi Kalite' :
                       report.paintQuality.overallScore >= 50 ? 'Orta Kalite' :
                       report.paintQuality.overallScore >= 30 ? 'Düşük Kalite' : 'Kritik Kalite'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Gloss Seviyesi:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.glossLevel}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.glossLevel}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Düzgünlük:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.smoothness}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.smoothness}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Uniformite:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.uniformity}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.uniformity}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Yapışma:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.adhesion}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.adhesion}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Dayanıklılık:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.durability}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.durability}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Hava Direnci:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.weatherResistance}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.weatherResistance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">UV Koruması:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.paintQuality.uvProtection}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full"
                            style={{ width: `${report.paintQuality.uvProtection}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Color Analysis */}
            <FadeInUp delay={0.3}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <EyeIcon className="w-6 h-6 mr-2 text-green-500" />
                  Renk Analizi
                </h2>
                
                {/* Renk Bilgileri */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-800 mb-1">{report.colorAnalysis.colorCode}</div>
                    <div className="text-sm text-blue-600">Renk Kodu</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg text-center">
                    <div className="text-lg font-bold text-green-800 mb-1">{report.colorAnalysis.colorName}</div>
                    <div className="text-sm text-green-600">Renk Adı</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg text-center">
                    <div className="text-lg font-bold text-purple-800 mb-1">{report.colorAnalysis.colorFamily}</div>
                    <div className="text-sm text-purple-600">Renk Ailesi</div>
                  </div>
                </div>

                {/* Renk Özellikleri */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Renk Eşleşmesi:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.colorAnalysis.colorMatch}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${report.colorAnalysis.colorMatch}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Renk Tutarlılığı:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.colorAnalysis.colorConsistency}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${report.colorAnalysis.colorConsistency}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Renk Derinliği:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.colorAnalysis.colorDepth}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${report.colorAnalysis.colorDepth}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Renk Canlılığı:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.colorAnalysis.colorVibrance}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${report.colorAnalysis.colorVibrance}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Renk Solması:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.colorAnalysis.colorFading}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full"
                            style={{ width: `${report.colorAnalysis.colorFading}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Renk Değişimi:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.colorAnalysis.colorShifting}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full"
                            style={{ width: `${report.colorAnalysis.colorShifting}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renk Durumu */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg text-center ${report.colorAnalysis.metallic ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="text-lg font-bold mb-1">{report.colorAnalysis.metallic ? 'Metalik' : 'Düz Renk'}</div>
                    <div className="text-sm text-gray-600">Renk Tipi</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${report.colorAnalysis.originalColor ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="text-lg font-bold mb-1">{report.colorAnalysis.originalColor ? 'Orijinal' : 'Yeniden Boyanmış'}</div>
                    <div className="text-sm text-gray-600">Boya Durumu</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${report.colorAnalysis.repaintDetected ? 'bg-orange-50 border border-orange-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="text-lg font-bold mb-1">{report.colorAnalysis.repaintDetected ? 'Tespit Edildi' : 'Tespit Edilmedi'}</div>
                    <div className="text-sm text-gray-600">Yeniden Boyama</div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Surface Analysis */}
            <FadeInUp delay={0.4}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BeakerIcon className="w-6 h-6 mr-2 text-purple-500" />
                  Yüzey Analizi
                </h2>
                
                {/* Kalınlık Analizi */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Boya Katman Kalınlıkları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-800 mb-1">{report.surfaceAnalysis.paintThickness} μm</div>
                      <div className="text-sm text-blue-600">Boya Kalınlığı</div>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div className="text-2xl font-bold text-green-800 mb-1">{report.surfaceAnalysis.totalThickness} μm</div>
                      <div className="text-sm text-green-600">Toplam Kalınlık</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">{report.surfaceAnalysis.primerThickness} μm</div>
                      <div className="text-sm text-gray-600">Primer</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">{report.surfaceAnalysis.baseCoatThickness} μm</div>
                      <div className="text-sm text-gray-600">Baz Kat</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-lg font-bold text-gray-800 mb-1">{report.surfaceAnalysis.clearCoatThickness} μm</div>
                      <div className="text-sm text-gray-600">Clear Kat</div>
                    </div>
                  </div>
                </div>

                {/* Yüzey Kalitesi */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Yüzey Kalitesi</h3>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Kalınlık Uniformitesi:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.thicknessUniformity}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.thicknessUniformity}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Yüzey Pürüzlülüğü:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.surfaceRoughness}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.surfaceRoughness}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Portakal Kabuğu:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.orangePeel}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.orangePeel}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Yüzey Kusurları</h3>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Akma:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.runs}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.runs}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Sarkma:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.sags}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.sags}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Kirlilik:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.dirt}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gray-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.dirt}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Kontaminasyon:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{report.surfaceAnalysis.contamination}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-red-400 h-2 rounded-full"
                            style={{ width: `${report.surfaceAnalysis.contamination}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Technical Details */}
            <FadeInUp delay={0.5}>
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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clear Kat:</span>
                      <span className="font-medium">{report.technicalDetails.clearCoat}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boya Markası:</span>
                      <span className="font-medium">{report.technicalDetails.paintBrand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boya Tipi:</span>
                      <span className="font-medium">{report.technicalDetails.paintType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uygulama Yöntemi:</span>
                      <span className="font-medium">{report.technicalDetails.applicationMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kalite Sınıfı:</span>
                      <span className="font-medium">{report.technicalDetails.qualityGrade}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>

          {/* Sidebar */}
          <div>
            {/* Recommendations */}
            <FadeInUp delay={0.6}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Öneriler</h3>
                
                <div className="space-y-4">
                  {report.recommendations.immediate.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Acil Öneriler
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.recommendations.immediate.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {report.recommendations.shortTerm.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2 flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Kısa Vadeli
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.recommendations.shortTerm.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-yellow-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {report.recommendations.qualityImprovement.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2 flex items-center">
                        <SparklesIcon className="w-4 h-4 mr-2" />
                        Kalite İyileştirme
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {report.recommendations.qualityImprovement.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </FadeInUp>

            {/* Cost Estimate */}
            <FadeInUp delay={0.7}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Maliyet Tahmini</h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      ₺{report.costEstimate.totalCost.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-gray-600">Toplam Maliyet</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İşçilik:</span>
                      <span className="font-medium">₺{report.costEstimate.laborCost.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Malzeme:</span>
                      <span className="font-medium">₺{report.costEstimate.materialCost.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hazırlık:</span>
                      <span className="font-medium">₺{report.costEstimate.preparationCost.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Paint Defects */}
            {report.paintDefects.surfaceDefects.length > 0 && (
              <FadeInUp delay={0.8}>
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tespit Edilen Kusurlar</h3>
                  
                  <div className="space-y-3">
                    {report.paintDefects.surfaceDefects.map((defect, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{defect.type}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            defect.severity === 'low' ? 'bg-green-100 text-green-800' :
                            defect.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {defect.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{defect.description}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Konum:</span>
                          <span className="font-medium">{defect.location}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Onarım Maliyeti:</span>
                          <span className="font-medium">₺{defect.repairCost.toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
