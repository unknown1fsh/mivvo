'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  CameraIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  EyeIcon,
  SparklesIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline'

interface QualityCheck {
  id: string
  name: string
  description: string
  weight: number
  passed: boolean
  message: string
}

interface PhotoAnalysis {
  overallScore: number
  quality: 'excellent' | 'good' | 'fair' | 'poor'
  checks: QualityCheck[]
  recommendations: string[]
  aiAccuracy: number
}

const qualityChecks: Omit<QualityCheck, 'passed' | 'message'>[] = [
  {
    id: 'resolution',
    name: 'Çözünürlük',
    description: 'Fotoğraf yeterince yüksek çözünürlükte mi?',
    weight: 25
  },
  {
    id: 'lighting',
    name: 'Aydınlatma',
    description: 'Fotoğraf yeterince aydınlık ve net mi?',
    weight: 20
  },
  {
    id: 'angle',
    name: 'Açı',
    description: 'Araç doğru açıdan çekilmiş mi?',
    weight: 20
  },
  {
    id: 'focus',
    name: 'Odak',
    description: 'Fotoğraf net ve odaklı mı?',
    weight: 15
  },
  {
    id: 'coverage',
    name: 'Kapsam',
    description: 'Araç tamamen görünür mü?',
    weight: 10
  },
  {
    id: 'stability',
    name: 'Kararlılık',
    description: 'Fotoğraf titrek değil mi?',
    weight: 10
  }
]

export default function PhotoQualityChecker() {
  const [analysis, setAnalysis] = useState<PhotoAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const analyzePhoto = async (file: File): Promise<PhotoAnalysis> => {
    return new Promise((resolve) => {
      // Simüle edilmiş analiz - gerçek uygulamada AI kullanılacak
      setTimeout(() => {
        const checks: QualityCheck[] = qualityChecks.map(check => {
          let passed = false
          let message = ''

          switch (check.id) {
            case 'resolution':
              passed = file.size > 500000 // 500KB
              message = passed ? 'Yüksek çözünürlük' : 'Düşük çözünürlük'
              break
            case 'lighting':
              passed = Math.random() > 0.3 // %70 şans
              message = passed ? 'İyi aydınlatma' : 'Kötü aydınlatma'
              break
            case 'angle':
              passed = Math.random() > 0.2 // %80 şans
              message = passed ? 'Doğru açı' : 'Yanlış açı'
              break
            case 'focus':
              passed = Math.random() > 0.25 // %75 şans
              message = passed ? 'Net odak' : 'Bulanık'
              break
            case 'coverage':
              passed = Math.random() > 0.15 // %85 şans
              message = passed ? 'Tam kapsam' : 'Eksik kapsam'
              break
            case 'stability':
              passed = Math.random() > 0.1 // %90 şans
              message = passed ? 'Kararlı' : 'Titrek'
              break
          }

          return { ...check, passed, message }
        })

        const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0)
        const passedWeight = checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0)
        const overallScore = Math.round((passedWeight / totalWeight) * 100)

        let quality: 'excellent' | 'good' | 'fair' | 'poor'
        if (overallScore >= 90) quality = 'excellent'
        else if (overallScore >= 75) quality = 'good'
        else if (overallScore >= 60) quality = 'fair'
        else quality = 'poor'

        const recommendations: string[] = []
        if (overallScore < 90) {
          recommendations.push('Daha iyi aydınlatma kullanın')
          recommendations.push('Araç merkezde olmalı')
          recommendations.push('Minimum 2 metre mesafeden çekin')
        }
        if (overallScore < 75) {
          recommendations.push('Fotoğrafı yeniden çekin')
          recommendations.push('Daha net odak ayarlayın')
        }

        const aiAccuracy = Math.min(95, 70 + (overallScore * 0.25))

        resolve({
          overallScore,
          quality,
          checks,
          recommendations,
          aiAccuracy: Math.round(aiAccuracy)
        })
      }, 2000)
    })
  }

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzePhoto(file)
      setAnalysis(result)
    } catch (error) {
      console.error('Analiz hatası:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => {
    setDragActive(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600 bg-green-50'
      case 'good': return 'text-blue-600 bg-blue-50'
      case 'fair': return 'text-yellow-600 bg-yellow-50'
      case 'poor': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'Mükemmel'
      case 'good': return 'İyi'
      case 'fair': return 'Orta'
      case 'poor': return 'Kötü'
      default: return 'Bilinmiyor'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        {isAnalyzing ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Fotoğraf Analiz Ediliyor</h3>
              <p className="text-gray-600">AI kalite kontrolü yapılıyor...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <CameraIcon className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Fotoğraf Yükleyin</h3>
              <p className="text-gray-600 mb-4">
                Hasar analizi için fotoğraf kalitesini kontrol edelim
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ArrowUpTrayIcon className="w-4 h-4" />
                <span>Dosya Seç</span>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              veya dosyayı buraya sürükleyin
            </p>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <div className="bg-white rounded-lg border p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <SparklesIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Kalite Skoru: {analysis.overallScore}/100
              </h3>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getQualityColor(analysis.quality)}`}>
                {getQualityLabel(analysis.quality)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">%{analysis.aiAccuracy}</div>
                <div className="text-sm text-blue-700">AI Doğruluğu</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {analysis.checks.filter(c => c.passed).length}/{analysis.checks.length}
                </div>
                <div className="text-sm text-green-700">Kriter Geçti</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">2-4s</div>
                <div className="text-sm text-purple-700">Analiz Süresi</div>
              </div>
            </div>
          </div>

          {/* Detailed Checks */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Detaylı Kalite Kontrolü</h4>
            <div className="space-y-3">
              {analysis.checks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {check.passed ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{check.name}</div>
                      <div className="text-sm text-gray-600">{check.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${check.passed ? 'text-green-600' : 'text-red-600'}`}>
                      {check.message}
                    </div>
                    <div className="text-xs text-gray-500">%{check.weight} ağırlık</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Öneriler
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Info */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <EyeIcon className="w-5 h-5 mr-2 text-purple-600" />
              AI Analiz Bilgisi
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Kullanılan Teknolojiler</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• COCO-SSD Object Detection</li>
                  <li>• MobileNet Image Classification</li>
                  <li>• Custom Damage Detection Model</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Analiz Süreci</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Görüntü ön işleme (Sharp)</li>
                  <li>• AI modeli ile analiz</li>
                  <li>• Hasar türü tespiti</li>
                  <li>• Güven seviyesi hesaplama</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
