'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  CameraIcon,
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  UserIcon,
  CogIcon,
  BellIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  EyeIcon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import toast from 'react-hot-toast'

interface UploadedImage {
  id: string
  file: File
  preview: string
  type: 'exterior' | 'interior' | 'engine' | 'damage' | 'paint'
  status: 'uploading' | 'success' | 'error'
  progress: number
  analysis?: {
    paintCondition: string
    damageDetected: boolean
    confidence: number
  }
}

const imageTypes = [
  { id: 'exterior', label: 'Dış Görünüm', icon: '🚗', desc: 'Aracın dış yüzeyi, kapılar, tamponlar' },
  { id: 'interior', label: 'İç Mekan', icon: '🪑', desc: 'Koltuklar, direksiyon, konsol' },
  { id: 'engine', label: 'Motor', icon: '🔧', desc: 'Motor bölümü, kaput altı' },
  { id: 'damage', label: 'Hasar', icon: '⚠️', desc: 'Çizikler, çukurlar, hasarlar' },
  { id: 'paint', label: 'Boya Analizi', icon: '🎨', desc: 'Boya kalitesi ve durumu' }
]

export default function UploadImagesPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [selectedType, setSelectedType] = useState<string>('exterior')
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
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
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      
      if (!isValidType) {
        toast.error(`${file.name} geçerli bir resim dosyası değil!`)
        return false
      }
      if (!isValidSize) {
        toast.error(`${file.name} çok büyük! Maksimum 10MB olmalı.`)
        return false
      }
      return true
    })

    validFiles.forEach(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)
      
      const newImage: UploadedImage = {
        id,
        file,
        preview,
        type: selectedType as any,
        status: 'uploading',
        progress: 0
      }

      setUploadedImages(prev => [...prev, newImage])
      simulateUpload(id)
    })
  }

  const simulateUpload = (id: string) => {
    const interval = setInterval(() => {
      setUploadedImages(prev => prev.map(img => {
        if (img.id === id) {
          const newProgress = Math.min(img.progress + Math.random() * 30, 100)
          
          if (newProgress >= 100) {
            clearInterval(interval)
            return {
              ...img,
              progress: 100,
              status: 'success',
              analysis: {
                paintCondition: Math.random() > 0.5 ? 'İyi' : 'Orta',
                damageDetected: Math.random() > 0.7,
                confidence: Math.floor(Math.random() * 30) + 70
              }
            }
          }
          
          return { ...img, progress: newProgress }
        }
        return img
      }))
    }, 200)
  }

  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return <CloudArrowUpIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return 'Yüklendi'
      case 'error':
        return 'Hata'
      default:
        return 'Yükleniyor...'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Geri Dön
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/notifications" className="p-2 text-gray-400 hover:text-gray-600">
                <BellIcon className="w-6 h-6" />
              </Link>
              <Link href="/settings" className="p-2 text-gray-400 hover:text-gray-600">
                <CogIcon className="w-6 h-6" />
              </Link>
              <Link href="/profile" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Kullanıcı</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <FadeInUp>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resim Yükle</h1>
            <p className="text-gray-600">Aracınızın resimlerini yükleyin ve AI analizi yapın.</p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <FadeInUp delay={0.1}>
              <div className="card p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Resim Türü Seçin</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {imageTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedType === type.id
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{type.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-900">{type.label}</h3>
                          <p className="text-sm text-gray-600">{type.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
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
                        Resimleri buraya sürükleyin veya tıklayın
                      </h3>
                      <p className="text-gray-600 mb-4">
                        JPG, PNG, WebP formatlarında, maksimum 10MB
                      </p>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-primary"
                      >
                        <PhotoIcon className="w-5 h-5 mr-2" />
                        Dosya Seç
                      </button>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <p>• Birden fazla resim seçebilirsiniz</p>
                      <p>• Her resim otomatik olarak analiz edilir</p>
                      <p>• Toplam boyut: {uploadedImages.length} resim</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <FadeInUp delay={0.2}>
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Yüklenen Resimler</h2>
                    <span className="text-sm text-gray-600">{uploadedImages.length} resim</span>
                  </div>
                  
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {uploadedImages.map((image) => (
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
                                image.status === 'success' ? 'bg-green-100 text-green-700' :
                                image.status === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {getStatusIcon(image.status)}
                                <span className="ml-1">{getStatusText(image.status)}</span>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            {image.status === 'uploading' && (
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
                              {(image.file.size / 1024 / 1024).toFixed(2)} MB • {imageTypes.find(t => t.id === image.type)?.label}
                            </p>
                            
                            {/* Analysis Results */}
                            {image.analysis && (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Boya Durumu:</span>
                                  <span className={`font-medium ${
                                    image.analysis.paintCondition === 'İyi' ? 'text-green-600' : 'text-yellow-600'
                                  }`}>
                                    {image.analysis.paintCondition}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Hasar:</span>
                                  <span className={`font-medium ${
                                    image.analysis.damageDetected ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {image.analysis.damageDetected ? 'Tespit Edildi' : 'Yok'}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">Güven:</span>
                                  <span className="font-medium text-blue-600">
                                    %{image.analysis.confidence}
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
            <FadeInUp delay={0.3}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Yükleme İstatistikleri</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Toplam Resim</span>
                    <span className="font-medium text-gray-900">{uploadedImages.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Başarılı</span>
                    <span className="font-medium text-green-600">
                      {uploadedImages.filter(img => img.status === 'success').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Yükleniyor</span>
                    <span className="font-medium text-blue-600">
                      {uploadedImages.filter(img => img.status === 'uploading').length}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hatalı</span>
                    <span className="font-medium text-red-600">
                      {uploadedImages.filter(img => img.status === 'error').length}
                    </span>
                  </div>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.4}>
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Analiz Sonuçları</h3>
                
                {uploadedImages.filter(img => img.analysis).length > 0 ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">Genel Durum</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Araç genel olarak iyi durumda görünüyor.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <MagnifyingGlassIcon className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">Tespit Edilenler</span>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Boya kalitesi: Orta</li>
                        <li>• Küçük çizikler tespit edildi</li>
                        <li>• Genel durum: Kabul edilebilir</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Resim yükleyin ve AI analizi başlasın</p>
                  </div>
                )}
              </div>
            </FadeInUp>

            <FadeInUp delay={0.5}>
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sonraki Adımlar</h3>
                
                <div className="space-y-3">
                  <Link href="/vehicle/new-report" className="btn btn-primary w-full">
                    📋 Rapor Oluştur
                  </Link>
                  <Link href="/dashboard" className="btn btn-secondary w-full">
                    🏠 Dashboard'a Dön
                  </Link>
                  <button className="btn btn-secondary w-full">
                    📊 Detaylı Analiz
                  </button>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </div>
    </div>
  )
}
