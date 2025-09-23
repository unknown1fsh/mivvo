'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  DocumentTextIcon,
  ChartBarIcon,
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
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  EyeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface DamageAnalysisReport {
  id: string
  vehicleInfo: {
    make: string
    model: string
    year: number
    vin: string
    plate: string
  }
  overallScore: number
  damageSeverity: 'low' | 'medium' | 'high' | 'critical'
  analysisDate: string
  images: Array<{
    angle: string
    damageAreas: Array<{
      x: number
      y: number
      width: number
      height: number
      type: 'scratch' | 'dent' | 'rust' | 'oxidation' | 'crack' | 'break'
      severity: 'low' | 'medium' | 'high'
      confidence: number
      description: string
      estimatedRepairCost: number
    }>
    totalDamageScore: number
    recommendations: string[]
  }>
  summary: {
    totalDamages: number
    criticalDamages: number
    estimatedRepairCost: number
    insuranceImpact: string
    safetyConcerns: string[]
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    marketValueImpact: number
  }
  technicalDetails: {
    analysisMethod: string
    aiModel: string
    confidence: number
    processingTime: string
    imageQuality: string
  }
}

const damageSeverities = {
  low: { label: 'Düşük', color: 'text-green-600', bg: 'bg-green-50', score: '0-25' },
  medium: { label: 'Orta', color: 'text-yellow-600', bg: 'bg-yellow-50', score: '26-50' },
  high: { label: 'Yüksek', color: 'text-orange-600', bg: 'bg-orange-50', score: '51-75' },
  critical: { label: 'Kritik', color: 'text-red-600', bg: 'bg-red-50', score: '76-100' }
}

const damageTypes = {
  scratch: { label: 'Çizik', icon: '📏', color: 'text-blue-600' },
  dent: { label: 'Göçük', icon: '🔨', color: 'text-orange-600' },
  rust: { label: 'Paslanma', icon: '🦠', color: 'text-red-600' },
  oxidation: { label: 'Oksidasyon', icon: '☀️', color: 'text-yellow-600' },
  crack: { label: 'Çatlak', icon: '💥', color: 'text-purple-600' },
  break: { label: 'Kırık', icon: '💔', color: 'text-red-800' }
}

export default function DamageAnalysisReportPage() {
  const [report, setReport] = useState<DamageAnalysisReport | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // URL'den reportId'yi al
      const urlParams = new URLSearchParams(window.location.search)
      const reportId = urlParams.get('reportId')
      
      if (!reportId) {
        throw new Error('Rapor ID bulunamadı')
      }

      // Token kontrolü
      const token = localStorage.getItem('auth_token')
      console.log('🔑 Token kontrolü:', {
        hasToken: !!token,
        tokenLength: token?.length,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
      })

      if (!token) {
        throw new Error('Giriş yapmanız gerekiyor')
      }

      // Backend API'den gerçek veriyi çek
      console.log('📞 API çağrısı yapılıyor:', `/damage-analysis/${reportId}`)
      const response = await api.get(`/damage-analysis/${reportId}`)
      const result = response.data
      console.log('📥 API yanıtı alındı:', result)
      
      if (result.success && result.data) {
        // Backend'den gelen veriyi frontend formatına çevir
        const reportData = transformBackendDataToFrontend(result.data)
        setReport(reportData)
      } else {
        throw new Error('Rapor verisi bulunamadı')
      }
    } catch (error) {
      console.error('Rapor yükleme hatası:', error)
      setError(error instanceof Error ? error.message : 'Bilinmeyen hata')
    } finally {
      setLoading(false)
    }
  }

  const transformBackendDataToFrontend = (backendData: any): DamageAnalysisReport => {
    // Backend'den gelen veriyi frontend formatına çevir
    const aiAnalysisData = backendData.aiAnalysisData || {}
    console.log('🔍 Backend Data:', backendData)
    console.log('🔍 AI Analysis Data:', aiAnalysisData)
    console.log('🔍 Analysis Results:', aiAnalysisData.analysisResults)
    console.log('🔍 Vehicle Images:', backendData.vehicleImages)
    
    return {
      id: backendData.id.toString(),
      vehicleInfo: {
        make: backendData.vehicleBrand || 'Bilinmiyor',
        model: backendData.vehicleModel || 'Bilinmiyor',
        year: backendData.vehicleYear || 2020,
        vin: 'Bilinmiyor',
        plate: backendData.vehiclePlate || 'Bilinmiyor'
      },
      overallScore: aiAnalysisData.overallScore || 0,
      damageSeverity: aiAnalysisData.damageSeverity || 'low',
      analysisDate: new Date(backendData.createdAt).toLocaleDateString('tr-TR'),
      images: transformImagesData(backendData.vehicleImages || [], aiAnalysisData.analysisResults || []),
      summary: aiAnalysisData.summary || {
        totalDamages: 0,
        criticalDamages: 0,
        estimatedRepairCost: 0,
        insuranceImpact: 'Değerlendirilecek',
        safetyConcerns: [],
        strengths: [],
        weaknesses: [],
        recommendations: [],
        marketValueImpact: 0
      },
        technicalDetails: aiAnalysisData.technicalDetails || {
          analysisMethod: 'Google Gemini AI Analizi',
          aiModel: 'Gemini 1.5 Flash',
          confidence: 95,
          processingTime: '2.5 saniye',
          imageQuality: 'Yüksek (1024x1024)'
        }
    }
  }

  const transformImagesData = (vehicleImages: any[], analysisResults: any[]) => {
    // Backend'den gelen resim verilerini frontend formatına çevir
    console.log('🔍 TransformImagesData - VehicleImages:', vehicleImages)
    console.log('🔍 TransformImagesData - AnalysisResults:', analysisResults)
    
    return vehicleImages.map((image, index) => {
      // imageId ile eşleştir
      const analysisResult = analysisResults.find((result: any) => result.imageId === image.id) || {}
      const damageAreas = analysisResult.damageAreas || []
      console.log(`🔍 Image ${index} (ID: ${image.id}) - AnalysisResult:`, analysisResult)
      console.log(`🔍 Image ${index} (ID: ${image.id}) - DamageAreas:`, damageAreas)
      
      return {
        angle: getAngleFromImageType(image.imageType) || 'front',
        damageAreas: damageAreas.map((damage: any) => ({
          x: damage.x || 0,
          y: damage.y || 0,
          width: damage.width || 0,
          height: damage.height || 0,
          type: damage.type || 'scratch',
          severity: damage.severity || 'low',
          confidence: damage.confidence || 0,
          description: damage.description || 'Hasar tespit edildi',
          estimatedRepairCost: damage.repairCost || damage.estimatedRepairCost || 0,
          partsAffected: damage.partsAffected || [],
          area: damage.area || 'front'
        })),
        totalDamageScore: analysisResult.totalDamageScore || 0,
        recommendations: generateRecommendationsFromDamageAreas(damageAreas)
      }
    })
  }

  const getAngleFromImageType = (imageType: string): string => {
    switch (imageType) {
      case 'EXTERIOR': return 'front'
      case 'DAMAGE': return 'front'
      case 'PAINT': return 'front'
      default: return 'front'
    }
  }

  const generateRecommendationsFromDamageAreas = (damageAreas: any[]): string[] => {
    const recommendations: string[] = []
    
    damageAreas.forEach(damage => {
      // Gemini'den gelen gerçek verileri kullan
      if (damage.partsAffected && damage.partsAffected.length > 0) {
        recommendations.push(`${damage.description} - Etkilenen parçalar: ${damage.partsAffected.join(', ')}`)
      } else if (damage.severity === 'high') {
        recommendations.push(`${damage.type} hasarı acil müdahale gerektirir`)
      } else if (damage.severity === 'medium') {
        recommendations.push(`${damage.type} hasarı onarım önerilir`)
      }
      
      // Onarım maliyeti bilgisi ekle
      if (damage.estimatedRepairCost > 0) {
        recommendations.push(`Tahmini onarım maliyeti: ₺${damage.estimatedRepairCost.toLocaleString()}`)
      }
    })
    
    if (recommendations.length === 0) {
      recommendations.push('Genel bakım önerilir')
    }
    
    return recommendations
  }

  const generatePDF = async () => {
    if (!report) return
    
    setIsGeneratingPDF(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      
      // Header
      pdf.setFillColor(220, 38, 38) // Red for damage analysis
      pdf.rect(0, 0, pageWidth, 40, 'F')
      
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('HASAR ANALİZİ RAPORU', pageWidth / 2, 20, { align: 'center' })
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Mivvo Expertiz - Gelişmiş Analiz Sistemi (OpenAI Quota Aşıldı)', pageWidth / 2, 30, { align: 'center' })
      
      // Vehicle Info
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ARAÇ BİLGİLERİ', 20, 50)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Marka: ${report.vehicleInfo.make}`, 20, 60)
      pdf.text(`Model: ${report.vehicleInfo.model}`, 20, 65)
      pdf.text(`Yıl: ${report.vehicleInfo.year}`, 20, 70)
      pdf.text(`Plaka: ${report.vehicleInfo.plate}`, 20, 75)
      pdf.text(`VIN: ${report.vehicleInfo.vin}`, 20, 80)
      pdf.text(`Analiz Tarihi: ${report.analysisDate}`, 20, 85)
      
      // Damage Summary
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('HASAR ÖZETİ', 20, 100)
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Toplam Hasar: ${report.summary.totalDamages}`, 20, 110)
      pdf.text(`Kritik Hasar: ${report.summary.criticalDamages}`, 20, 115)
      pdf.text(`Tahmini Onarım Maliyeti: ₺${(report.summary.estimatedRepairCost || 0).toLocaleString('tr-TR')}`, 20, 120)
      pdf.text(`Piyasa Değeri Etkisi: %${report.summary.marketValueImpact || 0}`, 20, 125)
      
      // Critical Issues
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('KRİTİK SORUNLAR', 20, 140)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      report.summary.safetyConcerns.forEach((concern, index) => {
        pdf.text(`• ${concern}`, 20, 150 + (index * 5))
      })
      
      // Recommendations
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('ÖNERİLER', 20, 180)
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      report.summary.recommendations.forEach((rec, index) => {
        pdf.text(`• ${rec}`, 20, 190 + (index * 5))
      })
      
      // Footer
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Bu rapor Mivvo Expertiz Gelişmiş Analiz Sistemi kullanılarak oluşturulmuştur (OpenAI quota aşıldı).', 20, 280)
      pdf.text('www.mivvo.com', pageWidth - 20, 280, { align: 'right' })
      
      const fileName = `hasar-analizi-${report.vehicleInfo.plate}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      toast.success('PDF başarıyla oluşturuldu!')
      
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      toast.error('PDF oluşturulurken hata oluştu!')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePrint = async () => {
    setIsPrinting(true)
    try {
      // Print styles
      const printStyles = `
        <style>
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .print-break { page-break-before: always; }
          }
        </style>
      `
      
      // Add print styles to head
      const styleSheet = document.createElement("style")
      styleSheet.innerText = printStyles
      document.head.appendChild(styleSheet)
      
      // Print
      window.print()
      
      // Clean up
      setTimeout(() => {
        document.head.removeChild(styleSheet)
        setIsPrinting(false)
      }, 1000)
      
      toast.success('Yazdırma başlatıldı!')
      
    } catch (error) {
      console.error('Yazdırma hatası:', error)
      toast.error('Yazdırma sırasında hata oluştu!')
      setIsPrinting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hasar Analizi Raporu',
          text: `${report?.vehicleInfo.make} ${report?.vehicleInfo.model} hasar analizi raporu`,
          url: window.location.href
        })
        toast.success('Rapor paylaşıldı!')
      } catch (error) {
        console.error('Paylaşım hatası:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link panoya kopyalandı!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Google Gemini AI ile analiz yapılıyor...</p>
          <p className="text-sm text-gray-500">Bu işlem 2-3 saniye sürebilir</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rapor Yüklenemedi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchReportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Rapor Bulunamadı</h2>
          <p className="text-gray-600">Bu rapor mevcut değil veya erişim yetkiniz yok.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/vehicle/new-report" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Analiz Sayfasına Dön
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Hasar Analizi Raporu</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 no-print">
              <button
                onClick={handleShare}
                className="btn btn-outline"
              >
                <ShareIcon className="w-4 h-4 mr-2" />
                Paylaş
              </button>
              
              <button
                onClick={handlePrint}
                disabled={isPrinting}
                className="btn btn-outline"
              >
                {isPrinting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Yazdırılıyor...
                  </>
                ) : (
                  <>
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Yazdır
                  </>
                )}
              </button>
              
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
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hasar Analizi Raporu</h1>
            <p className="text-gray-600 mb-6">Google Gemini AI ile hasar tespiti ve değerlendirmesi</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600 mb-1">{report.overallScore}/100</div>
                <div className="text-sm text-gray-600">Hasar Skoru</div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {damageSeverities[report.damageSeverity].label}
                </div>
                <div className="text-sm text-gray-600">Hasar Şiddeti</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {report.summary.totalDamages}
                </div>
                <div className="text-sm text-gray-600">Toplam Hasar</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ₺{(report.summary.estimatedRepairCost || 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-sm text-gray-600">Tahmini Onarım</div>
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

            {/* Detailed Damage Analysis */}
            <FadeInUp delay={0.2}>
              <div className="card p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Detaylı Hasar Analizi</h2>
                
                <StaggerContainer className="space-y-6">
                  {report.images.map((image, index) => (
                    <StaggerItem key={index}>
                      <div className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium text-gray-900 capitalize text-lg">
                            {image.angle} Görünüm
                          </h3>
                          <div className="text-lg font-bold text-red-600">
                            {image.totalDamageScore}/100
                          </div>
                        </div>
                        
                        {image.damageAreas.length > 0 ? (
                          <div className="space-y-4">
                            {image.damageAreas.map((damage, damageIndex) => (
                              <div key={damageIndex} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{damageTypes[damage.type].icon}</span>
                                    <span className={`font-medium ${damageTypes[damage.type].color}`}>
                                      {damageTypes[damage.type].label}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      damage.severity === 'high' ? 'bg-red-100 text-red-800' :
                                      damage.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {damage.severity === 'high' ? 'Yüksek' :
                                       damage.severity === 'medium' ? 'Orta' : 'Düşük'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-600">
                                      ₺{(damage.estimatedRepairCost || 0).toLocaleString('tr-TR')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      %{damage.confidence} güven
                                    </div>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-3 font-medium">{damage.description}</p>
                                
                                {/* Gemini'den gelen gerçek veriler */}
                                {(damage as any).partsAffected && (damage as any).partsAffected.length > 0 && (
                                  <div className="mb-3">
                                    <div className="text-xs font-medium text-gray-600 mb-1">Etkilenen Parçalar:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {(damage as any).partsAffected.map((part: string, partIndex: number) => (
                                        <span key={partIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                          {part}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {(damage as any).area && (
                                  <div className="mb-3">
                                    <div className="text-xs font-medium text-gray-600 mb-1">Hasar Bölgesi:</div>
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                      {(damage as any).area === 'front' ? 'Ön Bölge' :
                                       (damage as any).area === 'side' ? 'Yan Bölge' :
                                       (damage as any).area === 'rear' ? 'Arka Bölge' :
                                       (damage as any).area === 'mechanical' ? 'Mekanik Bölge' : (damage as any).area}
                                    </span>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center space-x-1">
                                    <MapPinIcon className="w-3 h-3" />
                                    <span>Konum: {damage.x}, {damage.y}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <EyeIcon className="w-3 h-3" />
                                    <span>Boyut: {damage.width}x{damage.height}px</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <CheckCircleIcon className="w-12 h-12 mx-auto mb-2 text-green-500" />
                            <p>Bu açıda hasar tespit edilmedi</p>
                          </div>
                        )}
                        
                        {image.recommendations.length > 0 && (
                          <div className="mt-4 pt-4 border-t">
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
                      <span className="text-gray-600">Analiz Yöntemi:</span>
                      <span className="font-medium">{report.technicalDetails.analysisMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">AI Modeli:</span>
                      <span className="font-medium text-sm">{report.technicalDetails.aiModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Güven Seviyesi:</span>
                      <span className="font-medium">%{report.technicalDetails.confidence}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">İşlem Süresi:</span>
                      <span className="font-medium">{report.technicalDetails.processingTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Görüntü Kalitesi:</span>
                      <span className="font-medium">{report.technicalDetails.imageQuality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rapor ID:</span>
                      <span className="font-medium text-xs">{report.id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>

          {/* Sidebar */}
          <div>
            {/* Critical Issues */}
            <FadeInUp delay={0.4}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                  Kritik Sorunlar
                </h3>
                
                <div className="space-y-3">
                  {report.summary.safetyConcerns.map((concern, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5" />
                      <span className="text-sm text-gray-700">{concern}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeInUp>

            {/* Summary */}
            <FadeInUp delay={0.5}>
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
                    <h4 className="font-medium text-red-700 mb-2 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                      Sorunlu Alanlar
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {report.summary.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">•</span>
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Recommendations */}
            <FadeInUp delay={0.6}>
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

            {/* Financial Impact */}
            <FadeInUp delay={0.7}>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mali Etki</h3>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      ₺{(report.summary.estimatedRepairCost || 0).toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-gray-600">Tahmini Onarım Maliyeti</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600 mb-1">
                      %{report.summary.marketValueImpact || 0}
                    </div>
                    <div className="text-sm text-gray-600">Piyasa Değeri Etkisi</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm font-bold text-blue-600 mb-1">
                      {report.summary.insuranceImpact || 'Değerlendirilecek'}
                    </div>
                    <div className="text-xs text-gray-600">Sigorta Durumu</div>
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