'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  scratch: { 
    label: 'Çizik', 
    icon: '📏', 
    color: 'text-blue-600',
    description: 'Yüzeyde oluşan ince çizikler',
    severity: 'Orta'
  },
  dent: { 
    label: 'Göçük', 
    icon: '🔨', 
    color: 'text-orange-600',
    description: 'Metal yüzeyde oluşan çukur',
    severity: 'Yüksek'
  },
  rust: { 
    label: 'Paslanma', 
    icon: '🦠', 
    color: 'text-red-600',
    description: 'Metal yüzeyde oluşan pas',
    severity: 'Kritik'
  },
  oxidation: { 
    label: 'Boya Bozulması', 
    icon: '☀️', 
    color: 'text-yellow-600',
    description: 'Güneş ışığından kaynaklanan boya bozulması',
    severity: 'Orta'
  },
  crack: { 
    label: 'Çatlak', 
    icon: '💥', 
    color: 'text-purple-600',
    description: 'Yüzeyde oluşan çatlak',
    severity: 'Yüksek'
  },
  break: { 
    label: 'Kırık', 
    icon: '💔', 
    color: 'text-red-800',
    description: 'Parçada oluşan kırık',
    severity: 'Kritik'
  },
  // Gemini'den gelebilecek ek tipler
  paint: { 
    label: 'Boya Hasarı', 
    icon: '🎨', 
    color: 'text-pink-600',
    description: 'Boya yüzeyinde hasar',
    severity: 'Orta'
  },
  bumper: { 
    label: 'Tampon Hasarı', 
    icon: '🛡️', 
    color: 'text-indigo-600',
    description: 'Tampon bölgesinde hasar',
    severity: 'Orta'
  },
  door: { 
    label: 'Kapı Hasarı', 
    icon: '🚪', 
    color: 'text-cyan-600',
    description: 'Kapı panelinde hasar',
    severity: 'Yüksek'
  },
  window: { 
    label: 'Cam Hasarı', 
    icon: '🪟', 
    color: 'text-slate-600',
    description: 'Cam yüzeyinde hasar',
    severity: 'Orta'
  },
  headlight: { 
    label: 'Far Hasarı', 
    icon: '💡', 
    color: 'text-yellow-500',
    description: 'Far camında hasar',
    severity: 'Orta'
  },
  taillight: { 
    label: 'Stop Lambası', 
    icon: '🔴', 
    color: 'text-red-500',
    description: 'Stop lambasında hasar',
    severity: 'Orta'
  },
  mirror: { 
    label: 'Ayna Hasarı', 
    icon: '🪞', 
    color: 'text-gray-600',
    description: 'Yan aynada hasar',
    severity: 'Düşük'
  },
  wheel: { 
    label: 'Jant Hasarı', 
    icon: '⚙️', 
    color: 'text-gray-700',
    description: 'Jant veya tekerlekte hasar',
    severity: 'Orta'
  },
  body: { 
    label: 'Kaporta Hasarı', 
    icon: '🚗', 
    color: 'text-blue-700',
    description: 'Araç gövdesinde hasar',
    severity: 'Yüksek'
  }
}

export default function DamageAnalysisReportPage() {
  const [report, setReport] = useState<DamageAnalysisReport | null>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDamage, setSelectedDamage] = useState<any>(null)
  const [showDamagePopup, setShowDamagePopup] = useState(false)

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

  const showDamageLocation = (damage: any) => {
    setSelectedDamage(damage)
    setShowDamagePopup(true)
  }

  const closeDamagePopup = () => {
    setShowDamagePopup(false)
    setSelectedDamage(null)
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
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🚗 Araç Hasar Raporu</h1>
            <p className="text-gray-600 mb-6">Yapay zeka destekli detaylı hasar tespiti ve onarım önerileri</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                <div className="text-4xl font-bold text-red-600 mb-2">{report.overallScore}/100</div>
                <div className="text-sm font-medium text-gray-700 mb-1">Genel Durum</div>
                <div className="text-xs text-gray-500">
                  {report.overallScore >= 80 ? '✅ Çok İyi' : 
                   report.overallScore >= 60 ? '⚠️ Orta' : 
                   report.overallScore >= 40 ? '🔶 Dikkat' : '🚨 Acil'}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {damageSeverities[report.damageSeverity].label}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Hasar Seviyesi</div>
                <div className="text-xs text-gray-500">
                  {report.damageSeverity === 'critical' ? '🚨 Acil müdahale gerekli' :
                   report.damageSeverity === 'high' ? '⚠️ Önemli hasarlar var' :
                   report.damageSeverity === 'medium' ? '🔶 Bazı hasarlar var' : '✅ Hasar az'}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {report.summary.totalDamages}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Tespit Edilen</div>
                <div className="text-xs text-gray-500">
                  {report.summary.totalDamages === 0 ? '✅ Hasar yok' : 
                   report.summary.totalDamages <= 5 ? '🔶 Az hasar' :
                   '⚠️ Çok hasar'}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  ₺{(report.summary.estimatedRepairCost || 0).toLocaleString('tr-TR')}
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Onarım Bedeli</div>
                <div className="text-xs text-gray-500">
                  {(report.summary.estimatedRepairCost || 0) === 0 ? '✅ Ücretsiz' :
                   (report.summary.estimatedRepairCost || 0) <= 5000 ? '🔶 Uygun' :
                   '⚠️ Yüksek'}
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Vehicle Information */}
            <FadeInUp delay={0.1}>
              <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🚗</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Araç Bilgileri</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500 mb-1">Araç Markası</div>
                      <div className="font-semibold text-lg text-gray-900">{report.vehicleInfo.make}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500 mb-1">Model</div>
                      <div className="font-semibold text-lg text-gray-900">{report.vehicleInfo.model}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500 mb-1">Model Yılı</div>
                      <div className="font-semibold text-lg text-gray-900">{report.vehicleInfo.year}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500 mb-1">Plaka Numarası</div>
                      <div className="font-semibold text-lg text-gray-900 bg-blue-100 px-3 py-1 rounded-full inline-block">{report.vehicleInfo.plate}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500 mb-1">Şasi Numarası (VIN)</div>
                      <div className="font-medium text-sm text-gray-600 font-mono">{report.vehicleInfo.vin}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="text-sm text-gray-500 mb-1">Analiz Tarihi</div>
                      <div className="font-semibold text-lg text-gray-900">{report.analysisDate}</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Detailed Damage Analysis */}
            <FadeInUp delay={0.2}>
              <div className="card p-6 mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-lg">🔍</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">Hasar Detayları</h2>
                  <div className="ml-auto bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                    {report.summary.totalDamages} hasar tespit edildi
                  </div>
                </div>
                
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
                              <div key={damageIndex} className="p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
                                      <span className="text-2xl">{damageTypes[damage.type]?.icon || '🔍'}</span>
                                    </div>
                                    <div>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className={`font-semibold text-lg ${damageTypes[damage.type]?.color || 'text-gray-600'}`}>
                                          {damageTypes[damage.type]?.label || damage.type}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          damage.severity === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                                          damage.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                          'bg-green-100 text-green-800 border border-green-200'
                                        }`}>
                                          {damage.severity === 'high' ? '⚠️ Yüksek' :
                                           damage.severity === 'medium' ? '🔶 Orta' : '✅ Düşük'}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {damageTypes[damage.type]?.description || 'Hasar tespit edildi'}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-green-600 text-lg">
                                      ₺{(damage.estimatedRepairCost || 0).toLocaleString('tr-TR')}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      %{damage.confidence} güvenilirlik
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg mb-3">
                                  <p className="text-sm text-gray-700 font-medium">{damage.description}</p>
                                </div>
                                
                                {/* Etkilenen Parçalar */}
                                {(damage as any).partsAffected && (damage as any).partsAffected.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                      <span className="text-sm font-medium text-gray-700 mr-2">🔧 Etkilenen Parçalar:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {(damage as any).partsAffected.map((part: string, partIndex: number) => (
                                        <span key={partIndex} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200">
                                          {part}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Hasar Bölgesi */}
                                {(damage as any).area && (
                                  <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                      <span className="text-sm font-medium text-gray-700 mr-2">📍 Hasar Konumu:</span>
                                    </div>
                                    <button
                                      onClick={() => showDamageLocation(damage)}
                                      className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full border border-orange-200 hover:bg-orange-200 hover:border-orange-300 transition-colors cursor-pointer"
                                    >
                                      {(damage as any).area === 'front' ? '🚗 Ön Bölge' :
                                       (damage as any).area === 'side' ? '🚪 Yan Bölge' :
                                       (damage as any).area === 'rear' ? '🔙 Arka Bölge' :
                                       (damage as any).area === 'mechanical' ? '⚙️ Mekanik Bölge' : 
                                       `📍 ${(damage as any).area}`}
                                    </button>
                                  </div>
                                )}
                                
                                {/* Teknik Detaylar */}
                                <div className="bg-gray-100 p-3 rounded-lg">
                                  <div className="flex items-center justify-between text-xs text-gray-600">
                                    <div className="flex items-center space-x-1">
                                      <MapPinIcon className="w-3 h-3" />
                                      <span>Koordinat: {damage.x}, {damage.y}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <EyeIcon className="w-3 h-3" />
                                      <span>Alan: {damage.width}×{damage.height}px</span>
                                    </div>
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
                          <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center mb-3">
                              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                                <LightBulbIcon className="w-4 h-4 text-yellow-600" />
                              </div>
                              <h4 className="text-sm font-semibold text-gray-800">💡 Öneriler</h4>
                            </div>
                            <div className="space-y-2">
                              {image.recommendations.map((rec, i) => (
                                <div key={i} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                  <span className="text-yellow-600 text-sm">•</span>
                                  <span className="text-sm text-gray-700">{rec}</span>
                                </div>
                              ))}
                            </div>
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
              <div className="card p-6 mb-6 bg-gradient-to-br from-red-50 to-orange-50 border border-red-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-800">🚨 Acil Dikkat</h3>
                </div>
                
                {report.summary.safetyConcerns.length > 0 ? (
                  <div className="space-y-3">
                    {report.summary.safetyConcerns.map((concern, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-red-200 shadow-sm">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{concern}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600">✅ Kritik sorun tespit edilmedi</p>
                  </div>
                )}
              </div>
            </FadeInUp>

            {/* Summary */}
            <FadeInUp delay={0.5}>
              <div className="card p-6 mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <ChartBarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">📊 Genel Değerlendirme</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Güçlü Yönler */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-green-700">✅ İyi Durumda Olanlar</h4>
                    </div>
                    {report.summary.strengths.length > 0 ? (
                      <div className="space-y-2">
                        {report.summary.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="text-green-600 text-sm mt-0.5">✓</span>
                            <span className="text-sm text-gray-700">{strength}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        Belirgin güçlü yön tespit edilmedi
                      </div>
                    )}
                  </div>
                  
                  {/* Sorunlu Alanlar */}
                  <div>
                    <div className="flex items-center mb-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-red-700">⚠️ Dikkat Gerekenler</h4>
                    </div>
                    {report.summary.weaknesses.length > 0 ? (
                      <div className="space-y-2">
                        {report.summary.weaknesses.map((weakness, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="text-red-600 text-sm mt-0.5">!</span>
                            <span className="text-sm text-gray-700">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 text-gray-500 text-sm">
                        Belirgin sorun tespit edilmedi
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Recommendations */}
            <FadeInUp delay={0.6}>
              <div className="card p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <LightBulbIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">💡 Öneriler & Aksiyonlar</h3>
                </div>
                
                {report.summary.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {report.summary.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-green-200 shadow-sm">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <LightBulbIcon className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{rec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <LightBulbIcon className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">Henüz öneri bulunmuyor</p>
                  </div>
                )}
              </div>
            </FadeInUp>

            {/* Financial Impact */}
            <FadeInUp delay={0.7}>
              <div className="card p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <CurrencyDollarIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">💰 Mali Durum</h3>
                </div>
                
                <div className="space-y-4">
                  {/* Onarım Maliyeti */}
                  <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">🔧 Onarım Bedeli</span>
                      <span className="text-xs text-gray-500">
                        {(report.summary.estimatedRepairCost || 0) === 0 ? '✅ Ücretsiz' :
                         (report.summary.estimatedRepairCost || 0) <= 5000 ? '🔶 Uygun' :
                         '⚠️ Yüksek'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      ₺{(report.summary.estimatedRepairCost || 0).toLocaleString('tr-TR')}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Tahmini onarım maliyeti
                    </div>
                  </div>
                  
                  {/* Piyasa Değeri Etkisi */}
                  <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">📈 Piyasa Değeri</span>
                      <span className="text-xs text-gray-500">
                        {(report.summary.marketValueImpact || 0) <= 5 ? '✅ Az Etki' :
                         (report.summary.marketValueImpact || 0) <= 15 ? '🔶 Orta Etki' :
                         '⚠️ Yüksek Etki'}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      %{report.summary.marketValueImpact || 0}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Piyasa değerine etkisi
                    </div>
                  </div>
                  
                  {/* Sigorta Durumu */}
                  <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">🛡️ Sigorta</span>
                      <span className="text-xs text-gray-500">
                        {report.summary.insuranceImpact === 'Değerlendirilecek' ? '🔍 İncelenecek' : '✅ Durum Belirli'}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {report.summary.insuranceImpact || 'Değerlendirilecek'}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sigorta şirketi durumu
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>

      {/* Hasar Konumu Popup */}
      <AnimatePresence>
        {showDamagePopup && selectedDamage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeDamagePopup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">📍 Hasar Konumu Detayı</h3>
                <button
                  onClick={closeDamagePopup}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Araç Çizimi */}
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center mb-4">
                    <div className="w-32 h-20 mx-auto bg-blue-100 rounded-lg relative border border-blue-300">
                      {/* Araç çizimi - basit SVG */}
                      <svg viewBox="0 0 200 120" className="w-full h-full">
                        {/* Araç gövdesi */}
                        <rect x="20" y="40" width="160" height="60" rx="8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2"/>
                        
                        {/* Ön cam */}
                        <rect x="30" y="45" width="60" height="25" rx="4" fill="#93C5FD"/>
                        
                        {/* Arka cam */}
                        <rect x="110" y="45" width="60" height="25" rx="4" fill="#93C5FD"/>
                        
                        {/* Tekerlekler */}
                        <circle cx="50" cy="110" r="12" fill="#374151"/>
                        <circle cx="150" cy="110" r="12" fill="#374151"/>
                        
                        {/* Hasar noktası */}
                        {selectedDamage && (
                          <circle 
                            cx={selectedDamage.x || 100} 
                            cy={selectedDamage.y || 60} 
                            r="8" 
                            fill="#EF4444" 
                            stroke="#DC2626" 
                            strokeWidth="2"
                            className="animate-pulse"
                          >
                            <title>Hasar Noktası</title>
                          </circle>
                        )}
                      </svg>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Araç Şematik Görünümü</p>
                  </div>
                </div>
              </div>

              {/* Hasar Detayları */}
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">🔍 Hasar Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hasar Türü:</span>
                      <span className="font-medium">{damageTypes[selectedDamage.type]?.label || selectedDamage.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Şiddet:</span>
                      <span className={`font-medium ${
                        selectedDamage.severity === 'high' ? 'text-red-600' :
                        selectedDamage.severity === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {selectedDamage.severity === 'high' ? 'Yüksek' :
                         selectedDamage.severity === 'medium' ? 'Orta' : 'Düşük'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Koordinat:</span>
                      <span className="font-medium">{selectedDamage.x}, {selectedDamage.y}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Boyut:</span>
                      <span className="font-medium">{selectedDamage.width}×{selectedDamage.height}px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Güven:</span>
                      <span className="font-medium">%{selectedDamage.confidence}</span>
                    </div>
                  </div>
                </div>

                {/* Etkilenen Parçalar */}
                {selectedDamage.partsAffected && selectedDamage.partsAffected.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🔧 Etkilenen Parçalar</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDamage.partsAffected.map((part: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {part}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Onarım Maliyeti */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">💰 Onarım Maliyeti</h4>
                  <div className="text-2xl font-bold text-green-600">
                    ₺{selectedDamage.estimatedRepairCost?.toLocaleString('tr-TR') || selectedDamage.repairCost?.toLocaleString('tr-TR') || '0'}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Tahmini onarım bedeli</p>
                </div>

                {/* Hasar Açıklaması */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">📝 Açıklama</h4>
                  <p className="text-sm text-gray-700">{selectedDamage.description}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeDamagePopup}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}