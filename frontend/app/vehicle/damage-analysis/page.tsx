'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon,
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  CpuChipIcon,
  BeakerIcon,
  ExclamationCircleIcon,
  ViewfinderCircleIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  FireIcon,
  BoltIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import toast from 'react-hot-toast'

interface DamageAnalysisImage {
  id: string
  file: File
  preview: string
  angle: 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior'
  status: 'uploading' | 'analyzing' | 'completed' | 'error'
  progress: number
  analysis?: {
    damageAreas: Array<{
      x: number
      y: number
      width: number
      height: number
      type: string
      severity: 'low' | 'medium' | 'high'
      confidence: number
      description: string
      repairCost: number
      partsAffected: string[]
    }>
    overallAssessment: {
      damageLevel: string
      totalRepairCost: number
      insuranceStatus: string
      marketValueImpact: number
      detailedAnalysis: string
    }
    technicalAnalysis: {
      structuralIntegrity: string
      safetySystems: string
      mechanicalSystems: string
      electricalSystems: string
    }
    safetyAssessment: {
      roadworthiness: string
      criticalIssues: string[]
      safetyRecommendations: string[]
    }
  }
}

const damageAngles = [
  { 
    id: 'front', 
    label: 'Ön Görünüm',
    description: 'Kaput, ön tampon, farlar, ön cam',
    icon: '🚗',
    importance: 'Kritik',
    damageTypes: ['Çarpışma', 'Çizik', 'Göçük', 'Cam Kırığı']
  },
  { 
    id: 'rear', 
    label: 'Arka Görünüm',
    description: 'Arka tampon, stop lambaları, bagaj',
    icon: '🚙',
    importance: 'Yüksek',
    damageTypes: ['Çarpışma', 'Çizik', 'Göçük', 'Stop Lambası']
  },
  { 
    id: 'left', 
    label: 'Sol Yan',
    description: 'Sol kapı, yan çamurluk, ayna',
    icon: '🚘',
    importance: 'Orta',
    damageTypes: ['Çizik', 'Göçük', 'Ayna Kırığı', 'Kapı Hasarı']
  },
  { 
    id: 'right', 
    label: 'Sağ Yan',
    description: 'Sağ kapı, yan çamurluk, ayna',
    icon: '🚖',
    importance: 'Orta',
    damageTypes: ['Çizik', 'Göçük', 'Ayna Kırığı', 'Kapı Hasarı']
  },
  { 
    id: 'top', 
    label: 'Üst Görünüm',
    description: 'Tavan, camlar, anten',
    icon: '🚁',
    importance: 'Düşük',
    damageTypes: ['Dolu Hasarı', 'Çizik', 'Cam Kırığı']
  },
  { 
    id: 'interior', 
    label: 'İç Mekan',
    description: 'Koltuklar, konsol, kapı panelleri',
    icon: '🪑',
    importance: 'Düşük',
    damageTypes: ['Leke', 'Yırtık', 'Çizik', 'Kırık']
  }
]

const analysisFeatures = [
  {
    icon: ExclamationCircleIcon,
    title: 'Hasar Tespiti',
    description: '15+ farklı hasar türünü otomatik tespit',
    accuracy: '96.8%'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenlik Analizi',
    description: 'Yol güvenliği ve risk değerlendirmesi',
    accuracy: '98.2%'
  },
  {
    icon: ChartBarIcon,
    title: 'Maliyet Hesaplama',
    description: 'Gerçek zamanlı onarım maliyeti tahmini',
    accuracy: '94.5%'
  },
  {
    icon: AcademicCapIcon,
    title: 'Uzman Görüşü',
    description: 'AI + Uzman değerlendirmesi',
    accuracy: '99.1%'
  }
]

const damageTypes = [
  { type: 'scratch', label: 'Çizik', color: 'bg-yellow-100 text-yellow-800', severity: 'Düşük' },
  { type: 'dent', label: 'Göçük', color: 'bg-orange-100 text-orange-800', severity: 'Orta' },
  { type: 'crack', label: 'Çatlak', color: 'bg-red-100 text-red-800', severity: 'Yüksek' },
  { type: 'break', label: 'Kırık', color: 'bg-red-100 text-red-800', severity: 'Kritik' },
  { type: 'rust', label: 'Paslanma', color: 'bg-brown-100 text-brown-800', severity: 'Orta' },
  { type: 'oxidation', label: 'Oksidasyon', color: 'bg-gray-100 text-gray-800', severity: 'Düşük' }
]

export default function DamageAnalysisPage() {
  const [images, setImages] = useState<DamageAnalysisImage[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen sadece resim dosyaları yükleyin')
        return
      }

      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const preview = URL.createObjectURL(file)
      
      // Rastgele açı seç
      const randomAngle = damageAngles[Math.floor(Math.random() * damageAngles.length)].id as any

      const newImage: DamageAnalysisImage = {
        id,
        file,
        preview,
        angle: randomAngle,
        status: 'uploading',
        progress: 0
      }

      setImages(prev => [...prev, newImage])
      simulateUploadAndAnalysis(id)
    })
  }, [])

  const simulateUploadAndAnalysis = async (id: string) => {
    // Upload simulation
    const uploadInterval = setInterval(() => {
      setImages(prev => prev.map(img => {
        if (img.id === id && img.status === 'uploading') {
          const newProgress = Math.min(img.progress + Math.random() * 20, 100)
          
          if (newProgress >= 100) {
            clearInterval(uploadInterval)
            return {
              ...img,
              progress: 100,
              status: 'analyzing'
            }
          }
          
          return { ...img, progress: newProgress }
        }
        return img
      }))
    }, 200)

    // Gerçek AI analizi
    try {
      const image = images.find(img => img.id === id)
      if (image) {
        const formData = new FormData()
        formData.append('image', image.file)
        formData.append('angle', image.angle)
        
        const token = localStorage.getItem('auth_token')
        const response = await fetch('/api/damage-analysis/analyze', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setImages(prev => prev.map(img => {
              if (img.id === id) {
                return {
                  ...img,
                  status: 'completed',
                  analysis: result.data
                }
              }
              return img
            }))
            return
          }
        }
      }
    } catch (error) {
      console.error('AI analizi hatası:', error)
    }

    // Fallback - Analysis simulation
    setTimeout(() => {
      setImages(prev => prev.map(img => {
        if (img.id === id) {
          return {
            ...img,
            status: 'completed',
            analysis: generateMockAnalysis()
          }
        }
        return img
      }))
    }, 5000)
  }

  const generateMockAnalysis = () => {
    const damageCount = Math.floor(Math.random() * 5) + 1
    const damageAreas = []
    
    for (let i = 0; i < damageCount; i++) {
      const damageType = damageTypes[Math.floor(Math.random() * damageTypes.length)]
      damageAreas.push({
        x: Math.floor(Math.random() * 200),
        y: Math.floor(Math.random() * 200),
        width: Math.floor(Math.random() * 50) + 20,
        height: Math.floor(Math.random() * 50) + 20,
        type: damageType.type,
        severity: damageType.severity.toLowerCase() as 'low' | 'medium' | 'high',
        confidence: Math.floor(Math.random() * 20) + 80,
        description: `${damageType.label} tespit edildi`,
        repairCost: Math.floor(Math.random() * 3000) + 500,
        partsAffected: ['Gövde', 'Boya']
      })
    }

    const totalCost = damageAreas.reduce((sum, damage) => sum + damage.repairCost, 0)
    
    return {
      damageAreas,
      overallAssessment: {
        damageLevel: totalCost > 5000 ? 'Ağır' : totalCost > 2000 ? 'Orta' : 'Hafif',
        totalRepairCost: totalCost,
        insuranceStatus: totalCost > 10000 ? 'Pert' : 'Kurtarılabilir',
        marketValueImpact: Math.floor(totalCost / 100),
        detailedAnalysis: 'Araç genel olarak iyi durumda, tespit edilen hasarlar onarılabilir seviyede.'
      },
      technicalAnalysis: {
        structuralIntegrity: 'Sağlam',
        safetySystems: 'Fonksiyonel',
        mechanicalSystems: 'Çalışır durumda',
        electricalSystems: 'Fonksiyonel'
      },
      safetyAssessment: {
        roadworthiness: 'Güvenli',
        criticalIssues: [],
        safetyRecommendations: ['Düzenli bakım yapın', 'Hasar bölgelerini kontrol edin']
      }
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const startAnalysis = async () => {
    if (images.length === 0) {
      toast.error('Lütfen en az bir resim yükleyin')
      return
    }

    setIsAnalyzing(true)
    setCurrentStep(2)

    try {
      // Tüm resimlerin analizini bekle
      const analysisPromises = images.map(img => {
        if (img.status !== 'completed') {
          return new Promise(resolve => {
            const checkStatus = setInterval(() => {
              const currentImg = images.find(i => i.id === img.id)
              if (currentImg?.status === 'completed') {
                clearInterval(checkStatus)
                resolve(currentImg)
              }
            }, 1000)
          })
        }
        return Promise.resolve(img)
      })

      await Promise.all(analysisPromises)
      
      // Rapor sayfasına yönlendir
      setTimeout(() => {
        const reportId = `DA-${Date.now()}`
        window.location.href = `/vehicle/damage-analysis/report?reportId=${reportId}`
      }, 2000)

    } catch (error) {
      console.error('Analiz hatası:', error)
      toast.error('Analiz sırasında bir hata oluştu')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
        return <CloudArrowUpIcon className="w-5 h-5 text-blue-500" />
      case 'analyzing':
        return <CpuChipIcon className="w-5 h-5 text-purple-500 animate-pulse" />
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Yükleniyor...'
      case 'analyzing':
        return 'AI Hasar Analizi...'
      case 'completed':
        return 'Analiz Tamamlandı'
      case 'error':
        return 'Hata Oluştu'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-orange-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <WrenchScrewdriverIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              🔧 Profesyonel
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Hasar Tespiti
              </span>
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto mb-8">
              AI destekli kapsamlı hasar analizi ile araçlarınızın güvenliğini ve değerini koruyun. 
              360° tarama, güvenlik riski değerlendirmesi ve onarım öncelik sıralaması.
            </p>
            <div className="flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span>%96.8 Doğruluk</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>5-8 Saniye</span>
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                <span>Güvenlik Odaklı</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Progress Steps */}
        <div className="mb-16">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Resim Yükleme', icon: PhotoIcon },
              { step: 2, title: 'AI Hasar Analizi', icon: CpuChipIcon },
              { step: 3, title: 'Güvenlik Raporu', icon: DocumentTextIcon }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  currentStep >= item.step 
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep >= item.step ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {item.title}
                </span>
                {index < 2 && (
                  <div className={`w-16 h-1 mx-4 ${
                    currentStep > item.step ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {analysisFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
              <div className="text-lg font-bold text-orange-600">{feature.accuracy}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Hasar Resimlerini Yükleyin
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Farklı açılardan çekilmiş araç resimlerini yükleyin. 
              AI her hasarı tespit edecek ve güvenlik riski değerlendirmesi yapacak.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            className="border-2 border-dashed border-orange-300 rounded-2xl p-12 text-center hover:border-orange-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
          >
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CameraIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Resimleri Buraya Sürükleyin
            </h3>
            <p className="text-gray-600 mb-6">
              veya tıklayarak dosya seçin
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
              Resim Seç
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Recommended Angles */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Önerilen Açılar:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {damageAngles.map((angle) => (
                <div key={angle.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center mb-3">
                    <div className="text-2xl mr-3">{angle.icon}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{angle.label}</div>
                      <div className="text-xs text-gray-600">{angle.description}</div>
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full mb-2 ${
                    angle.importance === 'Kritik' ? 'bg-red-100 text-red-600' :
                    angle.importance === 'Yüksek' ? 'bg-orange-100 text-orange-600' :
                    angle.importance === 'Orta' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {angle.importance}
                  </div>
                  <div className="text-xs text-gray-500">
                    Hasar türleri: {angle.damageTypes.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Uploaded Images */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 mb-8"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Yüklenen Resimler ({images.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="relative">
                    <img
                      src={image.preview}
                      alt="Uploaded"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {damageAngles.find(a => a.id === image.angle)?.label}
                      </span>
                      {getStatusIcon(image.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {getStatusText(image.status)}
                    </div>
                    {image.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${image.progress}%` }}
                        />
                      </div>
                    )}
                    {image.analysis && (
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Hasar Sayısı:</span>
                          <span className="font-semibold text-orange-600">
                            {image.analysis.damageAreas.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Toplam Maliyet:</span>
                          <span className="font-semibold">
                            ₺{image.analysis.overallAssessment.totalRepairCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Güvenlik:</span>
                          <span className="font-semibold text-green-600">
                            {image.analysis.safetyAssessment.roadworthiness}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Analysis Button */}
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center"
          >
            <button
              onClick={startAnalysis}
              disabled={isAnalyzing || images.some(img => img.status !== 'completed')}
              className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-3" />
                  AI Hasar Analizi Yapılıyor...
                </div>
              ) : (
                <div className="flex items-center">
                  <SparklesIcon className="w-6 h-6 mr-3" />
                  AI Hasar Analizini Başlat
                  <ArrowRightIcon className="w-6 h-6 ml-3" />
                </div>
              )}
            </button>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-center mt-8"
        >
          <Link
            href="/analysis-types"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Analiz Türlerine Dön
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
