'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CameraIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ImageUploadGuidelinesProps {
  /**
   * Kompakt görünüm için (daha az detay)
   */
  compact?: boolean
  
  /**
   * Sadece uyarıları göster
   */
  warningsOnly?: boolean
  
  /**
   * Başlangıçta açık mı?
   */
  defaultOpen?: boolean
  
  /**
   * Özel CSS sınıfı
   */
  className?: string
}

export default function ImageUploadGuidelines({
  compact = false,
  warningsOnly = false,
  defaultOpen = false,
  className = ''
}: ImageUploadGuidelinesProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [showExamples, setShowExamples] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)
  const toggleExamples = () => setShowExamples(!showExamples)

  // Kompakt görünüm için sadece temel bilgiler
  if (compact) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <CameraIcon className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            En iyi sonuç için:
          </span>
        </div>
        <ul className="text-xs text-blue-700 mt-1 space-y-1">
          <li>• Net fotoğraf çekin (kamerayı sabit tutun)</li>
          <li>• Doğal ışıkta çekim yapın</li>
          <li>• Minimum 800x600 piksel</li>
          <li>• JPEG, PNG, WebP formatı</li>
        </ul>
      </div>
    )
  }

  // Sadece uyarılar için
  if (warningsOnly) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2 mb-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-amber-800">Dikkat Edilmesi Gerekenler</span>
        </div>
        <ul className="text-sm text-amber-700 space-y-2">
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>Bulanık veya kötü ışıkta çekilmiş fotoğraflar</span>
          </li>
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>Çok küçük çözünürlükte fotoğraflar</span>
          </li>
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>Flaş kullanımı (yansıma yaratır)</span>
          </li>
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>Desteklenmeyen dosya formatları</span>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ana Bilgi Kartı */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <CameraIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Resim Kalitesi Rehberi</h3>
              <p className="text-sm text-blue-700">
                En iyi analiz sonucu için yüksek kaliteli fotoğraf gerekli
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleOpen}
            className="text-blue-600 hover:text-blue-700"
          >
            {isOpen ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 space-y-4"
            >
              {/* Kalite Gereksinimleri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* İyi Örnekler */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-800">✅ İyi Örnekler</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Net, odaklanmış fotoğraf</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Doğal ışıkta çekim</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Yakın plan, detayları gösteren</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Minimum 800x600 piksel</span>
                    </li>
                  </ul>
                </div>

                {/* Kötü Örnekler */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                    <h4 className="font-medium text-red-800">❌ Kaçınılması Gerekenler</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Bulanık veya odaksız fotoğraf</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Flaş kullanımı</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Çok uzak veya küçük görüntü</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Düşük çözünürlük</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Format Bilgileri */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Desteklenen Formatlar</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['JPEG', 'PNG', 'WebP', 'HEIC'].map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Maksimum dosya boyutu: 10MB
                </p>
              </div>

              {/* İpuçları */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">💡 İpuçları</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Kamerayı sabit tutun ve nefesinizi tutun</li>
                  <li>• Aracı yakından çekin - hasar detayları net görünsün</li>
                  <li>• Doğal ışıkta çekim yapın - flaş kullanmayın</li>
                  <li>• Hasar alanını tam kareye alın</li>
                  <li>• Gölge ve yansımaları minimize edin</li>
                </ul>
              </div>

              {/* Örnekler Göster/Gizle */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleExamples}
                  className="text-blue-600"
                >
                  {showExamples ? 'Örnekleri Gizle' : 'Örnekleri Göster'}
                </Button>
              </div>

              {/* Örnek Görseller */}
              <AnimatePresence>
                {showExamples && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    {/* İyi Örnek */}
                    <Card className="p-4 bg-green-50 border-green-200">
                      <div className="text-center">
                        <div className="w-full h-32 bg-gradient-to-br from-green-200 to-green-300 rounded-lg flex items-center justify-center mb-2">
                          <CameraIcon className="w-8 h-8 text-green-600" />
                        </div>
                        <h5 className="font-medium text-green-800">✅ İyi Örnek</h5>
                        <p className="text-xs text-green-600">Net, doğal ışıkta</p>
                      </div>
                    </Card>

                    {/* Kötü Örnek */}
                    <Card className="p-4 bg-red-50 border-red-200">
                      <div className="text-center">
                        <div className="w-full h-32 bg-gradient-to-br from-red-200 to-red-300 rounded-lg flex items-center justify-center mb-2 opacity-50">
                          <CameraIcon className="w-8 h-8 text-red-600" />
                        </div>
                        <h5 className="font-medium text-red-800">❌ Kötü Örnek</h5>
                        <p className="text-xs text-red-600">Bulanık, kötü ışık</p>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  )
}
