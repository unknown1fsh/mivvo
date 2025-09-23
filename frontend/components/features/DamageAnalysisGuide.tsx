'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PhotoIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface PhotoGuide {
  id: string
  title: string
  description: string
  angle: string
  importance: 'critical' | 'high' | 'medium' | 'low'
  tips: string[]
  examples: string[]
  aiAccuracy: number
}

const photoGuides: PhotoGuide[] = [
  {
    id: 'front',
    title: 'Ön Görünüm',
    description: 'Araç ön kısmının tam görünümü',
    angle: 'front',
    importance: 'critical',
    tips: [
      'Tampon, farlar ve kaput tamamen görünür olmalı',
      'Araç merkezde ve düz durmalı',
      'Güneş ışığı doğrudan gelmemeli',
      'Minimum 2 metre mesafeden çekin'
    ],
    examples: [
      'Ön tampon hasarları',
      'Far kırıkları',
      'Kaput göçükleri',
      'Ön cam çatlakları'
    ],
    aiAccuracy: 95
  },
  {
    id: 'rear',
    title: 'Arka Görünüm',
    description: 'Araç arka kısmının tam görünümü',
    angle: 'rear',
    importance: 'critical',
    tips: [
      'Arka tampon, stop lambaları ve bagaj kapağı görünür olmalı',
      'Plaka net okunabilir olmalı',
      'Araç merkezde ve düz durmalı',
      'Arka cam tamamen görünür olmalı'
    ],
    examples: [
      'Arka tampon hasarları',
      'Stop lambası kırıkları',
      'Bagaj kapağı göçükleri',
      'Arka cam çatlakları'
    ],
    aiAccuracy: 92
  },
  {
    id: 'left',
    title: 'Sol Yan Görünüm',
    description: 'Araç sol tarafının tam görünümü',
    angle: 'left',
    importance: 'high',
    tips: [
      'Sol kapı, ayna ve lastik tamamen görünür olmalı',
      'Araç yan profilden çekilmeli',
      'Gölge oluşturmayacak açı seçin',
      'Minimum 3 metre mesafeden çekin'
    ],
    examples: [
      'Kapı göçükleri',
      'Ayna kırıkları',
      'Yan çizikler',
      'Lastik hasarları'
    ],
    aiAccuracy: 88
  },
  {
    id: 'right',
    title: 'Sağ Yan Görünüm',
    description: 'Araç sağ tarafının tam görünümü',
    angle: 'right',
    importance: 'high',
    tips: [
      'Sağ kapı, ayna ve lastik tamamen görünür olmalı',
      'Araç yan profilden çekilmeli',
      'Gölge oluşturmayacak açı seçin',
      'Minimum 3 metre mesafeden çekin'
    ],
    examples: [
      'Kapı göçükleri',
      'Ayna kırıkları',
      'Yan çizikler',
      'Lastik hasarları'
    ],
    aiAccuracy: 88
  },
  {
    id: 'engine',
    title: 'Motor Bölgesi',
    description: 'Motor kaputu açık halde motor bölgesi',
    angle: 'engine',
    importance: 'medium',
    tips: [
      'Motor kaputu tamamen açık olmalı',
      'Motor bölgesi iyi aydınlatılmış olmalı',
      'Motor parçaları net görünür olmalı',
      'Yakından çekin (1-1.5 metre)'
    ],
    examples: [
      'Motor hasarları',
      'Sıvı sızıntıları',
      'Kablo kopukları',
      'Motor parça eksikleri'
    ],
    aiAccuracy: 85
  },
  {
    id: 'interior',
    title: 'İç Mekan',
    description: 'Araç iç mekanının genel görünümü',
    angle: 'interior',
    importance: 'low',
    tips: [
      'Tüm koltuklar ve dashboard görünür olmalı',
      'İyi aydınlatma sağlayın',
      'Kapılar açık olabilir',
      'Geniş açıdan çekin'
    ],
    examples: [
      'Koltuk hasarları',
      'Dashboard çatlakları',
      'İç mekan kirliliği',
      'Elektronik arızalar'
    ],
    aiAccuracy: 75
  }
]

const importanceColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-blue-100 text-blue-800 border-blue-200'
}

const importanceLabels = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük'
}

export default function DamageAnalysisGuide() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const currentGuide = photoGuides[currentStep]

  const nextStep = () => {
    if (currentStep < photoGuides.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const resetGuide = () => {
    setCurrentStep(0)
    setIsOpen(false)
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <CameraIcon className="w-5 h-5" />
        <span>Fotoğraf Çekme Rehberi</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <CameraIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Hasar Analizi Fotoğraf Rehberi</h2>
                      <p className="text-blue-100">AI'nın en iyi sonuçları vermesi için fotoğraf çekme ipuçları</p>
                    </div>
                  </div>
                  <button
                    onClick={resetGuide}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-100 px-6 py-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Adım {currentStep + 1} / {photoGuides.length}</span>
                  <span>%{Math.round(((currentStep + 1) / photoGuides.length) * 100)} tamamlandı</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / photoGuides.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Guide Header */}
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PhotoIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentGuide.title}</h3>
                    <p className="text-gray-600 mb-4">{currentGuide.description}</p>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${importanceColors[currentGuide.importance]}`}>
                        {importanceLabels[currentGuide.importance]} Öncelik
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        %{currentGuide.aiAccuracy} AI Doğruluğu
                      </span>
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                      <LightBulbIcon className="w-5 h-5 mr-2" />
                      Fotoğraf Çekme İpuçları
                    </h4>
                    <ul className="space-y-3">
                      {currentGuide.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-blue-800">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div className="bg-orange-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
                      <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                      Bu Açıdan Tespit Edilen Hasar Türleri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {currentGuide.examples.map((example, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                          <span className="text-orange-800">{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Info */}
                  <div className="bg-purple-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
                      <SparklesIcon className="w-5 h-5 mr-2" />
                      AI Analiz Bilgisi
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">%{currentGuide.aiAccuracy}</div>
                        <div className="text-sm text-purple-700">Doğruluk Oranı</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">2-4s</div>
                        <div className="text-sm text-purple-700">Analiz Süresi</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">COCO-SSD</div>
                        <div className="text-sm text-purple-700">AI Modeli</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeftIcon className="w-4 h-4" />
                  <span>Önceki</span>
                </button>

                <div className="flex space-x-2">
                  {photoGuides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {currentStep < photoGuides.length - 1 ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>Sonraki</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={resetGuide}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Tamamla</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
