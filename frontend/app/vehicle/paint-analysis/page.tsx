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
  PaintBrushIcon,
  DocumentTextIcon,
  ChartBarIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import toast from 'react-hot-toast'

interface PaintAnalysisImage {
  id: string
  file: File
  preview: string
  angle: 'front' | 'rear' | 'left' | 'right' | 'top' | 'interior'
  status: 'uploading' | 'analyzing' | 'completed' | 'error'
  progress: number
  analysis?: {
    paintCondition: 'excellent' | 'good' | 'fair' | 'poor'
    paintThickness: number
    colorMatch: number
    scratches: number
    dents: number
    rust: boolean
    oxidation: number
    glossLevel: number
    overallScore: number
    recommendations: string[]
    confidence: number
  }
}

const paintAngles = [
  { 
    id: 'front', 
    label: 'Ön Görünüm', 
    icon: '🚗', 
    desc: 'Aracın ön kısmı, far, kaput, tampon',
    required: true,
    tips: 'Kaput tamamen görünür olmalı, ışık yeterli olmalı'
  },
  { 
    id: 'rear', 
    label: 'Arka Görünüm', 
    icon: '🚙', 
    desc: 'Aracın arka kısmı, bagaj, stop lambaları',
    required: true,
    tips: 'Bagaj kapağı ve arka tampon net görünmeli'
  },
  { 
    id: 'left', 
    label: 'Sol Yan Görünüm', 
    icon: '🚘', 
    desc: 'Aracın sol tarafı, kapılar, çamurluk',
    required: true,
    tips: 'Tüm kapılar ve yan aynalar görünür olmalı'
  },
  { 
    id: 'right', 
    label: 'Sağ Yan Görünüm', 
    icon: '🚖', 
    desc: 'Aracın sağ tarafı, kapılar, çamurluk',
    required: true,
    tips: 'Tüm kapılar ve yan aynalar görünür olmalı'
  },
  { 
    id: 'top', 
    label: 'Üst Görünüm', 
    icon: '🚁', 
    desc: 'Aracın üst kısmı, tavan, camlar',
    required: false,
    tips: 'Mümkünse yukarıdan çekin, tavan net görünmeli'
  },
  { 
    id: 'interior', 
    label: 'İç Mekan', 
    icon: '🪑', 
    desc: 'Koltuklar, direksiyon, konsol',
    required: false,
    tips: 'İç mekan temizliği ve genel durum'
  }
]

const paintConditions = {
  excellent: { label: 'Mükemmel', color: 'text-green-600', bg: 'bg-green-50' },
  good: { label: 'İyi', color: 'text-blue-600', bg: 'bg-blue-50' },
  fair: { label: 'Orta', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  poor: { label: 'Kötü', color: 'text-red-600', bg: 'bg-red-50' }
}

export default function PaintAnalysisPage() {
  const [images, setImages] = useState<PaintAnalysisImage[]>([])
  const [selectedAngle, setSelectedAngle] = useState<string>('front')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [])

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 15 * 1024 * 1024 // 15MB
      
      if (!isValidType) {
        toast.error(`${file.name} geçerli bir resim dosyası değil!`)
        return false
      }
      if (!isValidSize) {
        toast.error(`${file.name} çok büyük! Maksimum 15MB olmalı.`)
        return false
      }
      return true
    })

    validFiles.forEach(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)
      
      const newImage: PaintAnalysisImage = {
        id,
        file,
        preview,
        angle: selectedAngle as any,
        status: 'uploading',
        progress: 0
      }

      setImages(prev => [...prev, newImage])
      simulateUploadAndAnalysis(id)
    })
  }

  const simulateUploadAndAnalysis = (id: string) => {
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

    // Analysis simulation
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
    }, 3000)
  }

  const generateMockAnalysis = () => {
    const conditions: Array<'excellent' | 'good' | 'fair' | 'poor'> = ['excellent', 'good', 'fair', 'poor']
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    
    return {
      paintCondition: condition,
      paintThickness: Math.floor(Math.random() * 50) + 80, // 80-130 microns
      colorMatch: Math.floor(Math.random() * 20) + 80, // 80-100%
      scratches: Math.floor(Math.random() * 10),
      dents: Math.floor(Math.random() * 5),
      rust: Math.random() > 0.8,
      oxidation: Math.floor(Math.random() * 30),
      glossLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
      overallScore: Math.floor(Math.random() * 30) + 70, // 70-100
      recommendations: [
        'Boya kalitesi genel olarak iyi durumda',
        'Küçük çizikler için retuş önerilir',
        'Düzenli yıkama ve cilalama yapın'
      ],
      confidence: Math.floor(Math.random() * 15) + 85 // 85-100%
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const getRequiredImages = () => {
    return paintAngles.filter(angle => angle.required)
  }

  const getCompletedAngles = () => {
    const completedAngles = new Set(images.map(img => img.angle))
    return paintAngles.filter(angle => completedAngles.has(angle.id as any))
  }

  const getOverallScore = () => {
    const completedImages = images.filter(img => img.analysis)
    if (completedImages.length === 0) return 0
    
    const totalScore = completedImages.reduce((sum, img) => sum + (img.analysis?.overallScore || 0), 0)
    return Math.round(totalScore / completedImages.length)
  }

  const canProceedToReport = () => {
    const requiredAngles = getRequiredImages().map(angle => angle.id)
    const completedAngles = getCompletedAngles().map(angle => angle.id)
    
    return requiredAngles.every(angle => completedAngles.includes(angle))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'analyzing':
        return <MagnifyingGlassIcon className="w-5 h-5 text-blue-500 animate-pulse" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <CloudArrowUpIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Analiz Tamamlandı'
      case 'analyzing':
        return 'AI Analiz Ediyor...'
      case 'error':
        return 'Hata'
      default:
        return 'Yükleniyor...'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Dashboard'a Dön
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <PaintBrushIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Boya Analizi</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Adım {currentStep}/3
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <FadeInUp>
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8 mb-6">
              <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <CameraIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Resim Yükle</span>
              </div>
              
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              
              <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <MagnifyingGlassIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">AI Analiz</span>
              </div>
              
              <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              
              <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <DocumentTextIcon className="w-4 h-4" />
                </div>
                <span className="font-medium">Rapor Oluştur</span>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profesyonel Boya Analizi</h1>
              <p className="text-gray-600 max-w-3xl mx-auto">
                AI destekli boya kalitesi analizi ile aracınızın boya durumunu detaylı olarak değerlendirin.
                Dünya standartlarında profesyonel analiz raporu alın.
              </p>
            </div>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Image Upload */}
            {currentStep === 1 && (
              <FadeInUp>
                <div className="card p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Görünüm Açısı Seçin</h2>
                    <div className="text-sm text-gray-600">
                      {getCompletedAngles().length}/{paintAngles.length} tamamlandı
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {paintAngles.map((angle) => {
                      const hasImage = images.some(img => img.angle === angle.id)
                      const isCompleted = images.some(img => img.angle === angle.id && img.status === 'completed')
                      
                      return (
                        <button
                          key={angle.id}
                          onClick={() => setSelectedAngle(angle.id)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            selectedAngle === angle.id
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : isCompleted
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{angle.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium text-gray-900">{angle.label}</h3>
                                {angle.required && (
                                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                    Zorunlu
                                  </span>
                                )}
                                {isCompleted && (
                                  <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{angle.desc}</p>
                              <p className="text-xs text-blue-600 mt-2 font-medium">{angle.tips}</p>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
                        <CloudArrowUpIcon className="w-8 h-8 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {paintAngles.find(a => a.id === selectedAngle)?.label} için resim yükleyin
                        </h3>
                        <p className="text-gray-600 mb-4">
                          JPG, PNG, WebP formatlarında, maksimum 15MB
                        </p>
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="btn btn-primary"
                        >
                          <PhotoIcon className="w-5 h-5 mr-2" />
                          Resim Seç
                        </button>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>• Yüksek kaliteli, net resimler kullanın</p>
                        <p>• Yeterli ışık altında çekin</p>
                        <p>• Araç temiz olmalı</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Step 2: Analysis Results */}
            {currentStep === 2 && (
              <FadeInUp>
                <div className="card p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">AI Analiz Sonuçları</h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Analiz Tamamlandı</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {images.filter(img => img.analysis).map((image) => (
                      <div key={image.id} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <img
                            src={image.preview}
                            alt="Analysis"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {paintAngles.find(a => a.id === image.angle)?.label}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Genel Skor: <span className="font-medium text-blue-600">
                                {image.analysis?.overallScore}/100
                              </span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Boya Durumu:</span>
                            <span className={`font-medium ${
                              paintConditions[image.analysis?.paintCondition || 'good'].color
                            }`}>
                              {paintConditions[image.analysis?.paintCondition || 'good'].label}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Boya Kalınlığı:</span>
                            <span className="font-medium">{image.analysis?.paintThickness} μm</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Renk Eşleşmesi:</span>
                            <span className="font-medium">{image.analysis?.colorMatch}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Çizik Sayısı:</span>
                            <span className="font-medium">{image.analysis?.scratches}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Güven:</span>
                            <span className="font-medium text-green-600">
                              %{image.analysis?.confidence}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Step 3: Report Generation */}
            {currentStep === 3 && (
              <FadeInUp>
                <div className="card p-6 mb-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DocumentTextIcon className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Profesyonel Rapor Hazır!</h2>
                    <p className="text-gray-600">
                      AI analizi tamamlandı. Detaylı boya analizi raporunuz hazır.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <ChartBarIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{getOverallScore()}/100</div>
                      <div className="text-sm text-gray-600">Genel Skor</div>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <ShieldCheckIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        {images.filter(img => img.analysis).length}
                      </div>
                      <div className="text-sm text-gray-600">Analiz Edilen</div>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <LightBulbIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">
                        {images.filter(img => img.analysis?.recommendations).length}
                      </div>
                      <div className="text-sm text-gray-600">Öneri</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Link 
                      href="/vehicle/paint-analysis/report" 
                      className="btn btn-primary btn-lg"
                    >
                      <DocumentTextIcon className="w-5 h-5 mr-2" />
                      Detaylı Raporu Görüntüle
                    </Link>
                  </div>
                </div>
              </FadeInUp>
            )}

            {/* Uploaded Images */}
            {images.length > 0 && (
              <FadeInUp delay={0.2}>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Yüklenen Resimler</h2>
                    <span className="text-sm text-gray-600">{images.length} resim</span>
                  </div>
                  
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {images.map((image) => (
                      <StaggerItem key={image.id}>
                        <div className="relative group">
                          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={image.preview}
                              alt="Uploaded"
                              className="w-full h-full object-cover"
                            />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="flex space-x-2">
                                <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                                  <EyeIcon className="w-5 h-5 text-gray-600" />
                                </button>
                                <button 
                                  onClick={() => removeImage(image.id)}
                                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                                >
                                  <TrashIcon className="w-5 h-5 text-red-600" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="absolute top-2 right-2">
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                image.status === 'completed' ? 'bg-green-100 text-green-700' :
                                image.status === 'analyzing' ? 'bg-blue-100 text-blue-700' :
                                image.status === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {getStatusIcon(image.status)}
                                <span className="ml-1">{getStatusText(image.status)}</span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            {(image.status === 'uploading' || image.status === 'analyzing') && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                                <motion.div
                                  className="h-full bg-blue-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${image.progress}%` }}
                                  transition={{ duration: 0.3 }}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Image Info */}
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {image.file.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {(image.file.size / 1024 / 1024).toFixed(2)} MB • {paintAngles.find(a => a.id === image.angle)?.label}
                            </p>
                            
                            {/* Analysis Results */}
                            {image.analysis && (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Genel Skor:</span>
                                  <span className="font-medium text-blue-600">
                                    {image.analysis.overallScore}/100
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Boya Durumu:</span>
                                  <span className={`font-medium ${
                                    paintConditions[image.analysis.paintCondition].color
                                  }`}>
                                    {paintConditions[image.analysis.paintCondition].label}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                </div>
              </FadeInUp>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Progress Card */}
            <FadeInUp delay={0.3}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İlerleme Durumu</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Zorunlu Görünümler</span>
                    <span className="font-medium text-gray-900">
                      {getCompletedAngles().filter(angle => paintAngles.find(a => a.id === angle.id)?.required).length}/
                      {getRequiredImages().length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Resim</span>
                    <span className="font-medium text-gray-900">{images.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Analiz Tamamlanan</span>
                    <span className="font-medium text-green-600">
                      {images.filter(img => img.status === 'completed').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Genel Skor</span>
                    <span className="font-medium text-blue-600">{getOverallScore()}/100</span>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Next Steps */}
            <FadeInUp delay={0.4}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sonraki Adımlar</h3>
                
                <div className="space-y-3">
                  {currentStep < 3 && (
                    <button 
                      onClick={() => setCurrentStep(prev => Math.min(prev + 1, 3))}
                      disabled={!canProceedToReport() && currentStep === 1}
                      className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowRightIcon className="w-4 h-4 mr-2" />
                      {currentStep === 1 ? 'Analiz Et' : 'Rapor Oluştur'}
                    </button>
                  )}
                  
                  {currentStep > 1 && (
                    <button 
                      onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                      className="btn btn-secondary w-full"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Geri Dön
                    </button>
                  )}
                  
                  <Link href="/dashboard" className="btn btn-secondary w-full">
                    🏠 Dashboard'a Dön
                  </Link>
                </div>
              </div>
            </FadeInUp>

            {/* Tips */}
            <FadeInUp delay={0.5}>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Profesyonel İpuçları</h3>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>Yeterli ışık altında çekin</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>Araç temiz olmalı</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>Yüksek çözünürlük kullanın</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <LightBulbIcon className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span>Tüm açıları net çekin</span>
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
