'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MicrophoneIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface AudioRecordGuidelinesProps {
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
  
  /**
   * Kayıt süresini göster (saniye)
   */
  recordingDuration?: number
  
  /**
   * Kayıt durumu
   */
  isRecording?: boolean
}

export default function AudioRecordGuidelines({
  compact = false,
  warningsOnly = false,
  defaultOpen = false,
  className = '',
  recordingDuration = 0,
  isRecording = false
}: AudioRecordGuidelinesProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [showExamples, setShowExamples] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)
  const toggleExamples = () => setShowExamples(!showExamples)

  // Kayıt süresini formatla
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Kompakt görünüm için sadece temel bilgiler
  if (compact) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <MicrophoneIcon className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            En iyi sonuç için:
          </span>
        </div>
        <ul className="text-xs text-green-700 mt-1 space-y-1">
          <li>• Motor çalışırken kayıt yapın</li>
          <li>• Telefonu motora yakın tutun</li>
          <li>• Sessiz ortamda kayıt yapın</li>
          <li>• 10-30 saniye arası kayıt</li>
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
            <span>Çok kısa kayıtlar (5 saniyeden az)</span>
          </li>
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>Motor çalışmıyorken kayıt</span>
          </li>
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <span>Gürültülü ortam (trafik, konuşma)</span>
          </li>
          <li className="flex items-start space-x-2">
            <XCircleIcon className="w-4 h-4 text-amber-600 mt-avatar.5 flex-shrink-0" />
            <span>Telefonun motordan uzak olması</span>
          </li>
        </ul>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Ana Bilgi Kartı */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MicrophoneIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Ses Kaydı Rehberi</h3>
              <p className="text-sm text-green-700">
                En iyi analiz sonucu için kaliteli ses kaydı gerekli
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleOpen}
            className="text-green-600 hover:text-green-700"
          >
            {isOpen ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Kayıt Durumu Göstergesi */}
        {isRecording && (
          <div className="mt-3 p-3 bg-green-100 rounded-lg border border-green-300">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Kayıt devam ediyor: {formatDuration(recordingDuration)}
              </span>
            </div>
          </div>
        )}

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
                    <h4 className="font-medium text-green-800">✅ İyi Kayıt</h4>
                  </div>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Motor çalışırken kayıt</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Telefon motora yakın</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Sessiz ortam</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>10-30 saniye süre</span>
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
                      <span>Motor çalışmıyorken kayıt</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Telefon uzakta</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Gürültülü ortam</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <XCircleIcon className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span>Çok kısa kayıt</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Kayıt Adımları */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Kayıt Adımları</h4>
                </div>
                <ol className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">1</span>
                    <span>Motoru çalıştırın ve rölantide bekleyin</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">2</span>
                    <span>Telefonu motor bölgesine yakın tutun</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">3</span>
                    <span>Kayıt başlatın ve 10-15 saniye rölantide kaydedin</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">4</span>
                    <span>Sonra 10-15 saniye gaz vererek kaydedin</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">5</span>
                    <span>Toplam 20-30 saniye kayıt tamamlayın</span>
                  </li>
                </ol>
              </div>

              {/* Format Bilgileri */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900">Desteklenen Formatlar</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['WAV', 'MP3', 'M4A', 'AAC', '3GP'].map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md"
                    >
                      {format}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Maksimum dosya boyutu: 50MB
                </p>
              </div>

              {/* İpuçları */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                <h4 className="font-medium text-purple-800 mb-2">💡 İpuçları</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Motor rölantide iken kayıt başlatın</li>
                  <li>• 10-15 saniye rölanti, sonra gaz verin</li>
                  <li>• Çevresel gürültüyü minimize edin</li>
                  <li>• Telefonu motor bölgesine yakın tutun</li>
                  <li>• Hareket halindeyken kayıt yapmayın</li>
                </ul>
              </div>

              {/* Örnekler Göster/Gizle */}
              <div className="text-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleExamples}
                  className="text-green-600"
                >
                  {showExamples ? 'Örnekleri Gizle' : 'Örnekleri Göster'}
                </Button>
              </div>

              {/* Örnek Ses Dalgaları */}
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
                        <div className="w-full h-24 bg-gradient-to-r from-green-200 to-green-300 rounded-lg flex items-center justify-center relative overflow-hidden mb-2">
                          {/* Ses dalgası simülasyonu */}
                          <div className="flex items-center space-x-1">
                            {[...Array(8)].map((_, i) => (
                              <div 
                                key={i}
                                className="bg-green-600 rounded-full"
                                style={{
                                  width: '4px',
                                  height: `${Math.random() * 20 + 10}px`,
                                  animation: `pulse ${0.5 + i * 0.1}s infinite alternate`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-medium text-green-800">✅ İyi Kayıt</h5>
                        <p className="text-xs text-green-600">Net motor sesi</p>
                      </div>
                    </Card>

                    {/* Kötü Örnek */}
                    <Card className="p-4 bg-red-50 border-red-200">
                      <div className="text-center">
                        <div className="w-full h-24 bg-gradient-to-r from-red-200 to-red-300 rounded-lg flex items-center justify-center relative overflow-hidden mb-2">
                          {/* Gürültülü ses dalgası */}
                          <div className="flex items-center space-x-1">
                            {[...Array(12)].map((_, i) => (
                              <div 
                                key={i}
                                className="bg-red-600 rounded-full"
                                style={{
                                  width: '3px',
                                  height: `${Math.random() * 30 + 5}px`,
                                  animation: `pulse ${0.2 + i * 0.05}s infinite alternate`
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-medium text-red-800">❌ Kötü Kayıt</h5>
                        <p className="text-xs text-red-600">Gürültülü, kısa kayıt</p>
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
