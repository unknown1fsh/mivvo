'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  ChartBarIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { authService } from '@/services/authService'

interface GuideStep {
  id: number
  title: string
  description: string
  content: React.ReactNode
  icon: React.ReactNode
}

export default function GuidePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const totalSteps = 5

  // Authentication kontrolü
  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
  }, [router])

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = async () => {
    setIsLoading(true)
    
    // localStorage'daki user verisini güncelle
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        hasSeenGuide: true
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    
    // Başarı mesajı göster
    toast.success('Rehber tamamlandı! Dashboard\'a yönlendiriliyorsunuz...')
    
    // Dashboard'a yönlendir
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/dashboard'
    }, 1000)
  }

  const handleClose = () => {
    // localStorage'daki user verisini güncelle
    const currentUser = authService.getCurrentUser()
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        hasSeenGuide: true
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
    
    // Dashboard'a yönlendir
    window.location.href = '/dashboard'
  }

  // Adım içerikleri
  const steps: GuideStep[] = [
    {
      id: 1,
      title: 'Hoş Geldiniz!',
      description: 'Mivvo Expertiz platformuna hoş geldiniz',
      icon: <SparklesIcon className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mivvo Expertiz'e Hoş Geldiniz!
            </h2>
            <p className="text-gray-600">
              Araç expertiz işlemlerinizi kolayca gerçekleştirebileceğiniz akıllı platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <CameraIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Görsel Analiz</h3>
              <p className="text-sm text-gray-600">Hasar ve boya analizi</p>
            </Card>
            <Card className="p-4 text-center">
              <MicrophoneIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Ses Analizi</h3>
              <p className="text-sm text-gray-600">Motor ses analizi</p>
            </Card>
            <Card className="p-4 text-center">
              <ChartBarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900">Değer Tahmini</h3>
              <p className="text-sm text-gray-600">Piyasa değeri analizi</p>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Resim Yükleme Kuralları',
      description: 'En iyi sonuç için resim kalitesi önemli',
      icon: <CameraIcon className="w-8 h-8 text-blue-600" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İyi Örnek */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-800">✅ İyi Örnek</h3>
              </div>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="space-y-3">
                  <div className="bg-green-100 rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gradient-to-br from-green-200 to-green-300 rounded-lg flex items-center justify-center">
                      <CameraIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700 mt-2">Net, doğal ışıkta</p>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Minimum 800x600 piksel</li>
                    <li>• Doğal ışıkta çekim</li>
                    <li>• Yakın plan, net odak</li>
                    <li>• JPEG, PNG, WebP formatı</li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Kötü Örnek */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-6 h-6 text-red-600" />
                <h3 className="font-semibold text-red-800">❌ Kötü Örnek</h3>
              </div>
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="space-y-3">
                  <div className="bg-red-100 rounded-lg p-4 text-center">
                    <div className="w-full h-32 bg-gradient-to-br from-red-200 to-red-300 rounded-lg flex items-center justify-center opacity-50">
                      <CameraIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-sm text-red-700 mt-2">Bulanık, kötü ışık</p>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Düşük çözünürlük</li>
                    <li>• Bulanık çekim</li>
                    <li>• Flaş kullanımı</li>
                    <li>• Desteklenmeyen format</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">💡 İpuçları</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Aracı yakından çekin - hasar detayları net görünsün</li>
              <li>• Kamerayı sabit tutun - bulanık çekim yapmayın</li>
              <li>• Doğal ışıkta çekim yapın - flaş kullanmayın</li>
              <li>• Hasar alanını tam kareye alın</li>
              <li>• Gölge ve yansımaları minimize edin</li>
            </ul>
          </Card>
        </div>
      )
    },
    {
      id: 3,
      title: 'Ses Kaydı Kuralları',
      description: 'Motor analizi için kaliteli ses kaydı gerekli',
      icon: <MicrophoneIcon className="w-8 h-8 text-green-600" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* İyi Örnek */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                <h3 className="font-semibold text-green-800">✅ İyi Kayıt</h3>
              </div>
              <Card className="p-4 bg-green-50 border-green-200">
                <div className="space-y-3">
                  <div className="bg-green-100 rounded-lg p-4 text-center">
                    <div className="w-full h-24 bg-gradient-to-r from-green-200 to-green-300 rounded-lg flex items-center justify-center relative overflow-hidden">
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
                    <p className="text-sm text-green-700 mt-2">Net motor sesi</p>
                  </div>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 10-30 saniye süre</li>
                    <li>• Sessiz ortam</li>
                    <li>• Motor rölantide + gaz</li>
                    <li>• Telefon motora yakın</li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Kötü Örnek */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <XCircleIcon className="w-6 h-6 text-red-600" />
                <h3 className="font-semibold text-red-800">❌ Kötü Kayıt</h3>
              </div>
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="space-y-3">
                  <div className="bg-red-100 rounded-lg p-4 text-center">
                    <div className="w-full h-24 bg-gradient-to-r from-red-200 to-red-300 rounded-lg flex items-center justify-center relative overflow-hidden">
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
                    <p className="text-sm text-red-700 mt-2">Gürültülü, kısa kayıt</p>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 5 saniyeden kısa</li>
                    <li>580 • Gürültülü ortam</li>
                    <li>• Motor çalışmıyor</li>
                    <li>• Telefon uzakta</li>
                  </ul>
                </div>
              </Card>
            </div>
          </div>

          <Card className="p-4 bg-green-50 border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">🎯 Kayıt Adımları</h4>
            <ol className="text-sm text-green-700 space-y-2">
              <li><strong>1.</strong> Motoru çalıştırın ve rölantide bekleyin</li>
              <li><strong>2.</strong> Telefonu motor bölgesine yakın tutun</li>
              <li><strong>3.</strong> Kayıt başlatın ve 10-15 saniye rölantide kaydedin</li>
              <li><strong>4.</strong> Sonra 10-15 saniye gaz vererek kaydedin</li>
              <li><strong>5.</strong> Toplam 20-30 saniye kayıt tamamlayın</li>
            </ol>
          </Card>
        </div>
      )
    },
    {
      id: 4,
      title: 'Analiz Türleri',
      description: 'Hangi analizi ne zaman kullanmalısınız',
      icon: <DocumentTextIcon className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CameraIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Hasar Analizi</h3>
                  <p className="text-sm text-gray-600 mb-2">Araç hasarlarını tespit eder</p>
                  <p className="text-xs text-gray-500">
                    <strong>Kullanım:</strong> Kazadan sonra, hasar kontrolü<br/>
                    <strong>Ücret:</strong> 499₺
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Boya Analizi</h3>
                  <p className="text-sm text-gray-600 mb-2">Boya kalitesini değerlendirir</p>
                  <p className="text-xs text-gray-500">
                    <strong>Kullanım:</strong> Satış öncesi, boya kontrolü<br/>
                    <strong>Ücret:</strong> 399₺
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MicrophoneIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Motor Ses Analizi</h3>
                  <p className="text-sm text-gray-600 mb-2">Motor sağlığını ses ile analiz eder</p>
                  <p className="text-xs text-gray-500">
                    <strong>Kullanım:</strong> Motor sorunları, bakım öncesi<br/>
                    <strong>Ücret:</strong> 299₺
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Değer Tahmini</h3>
                  <p className="text-sm text-gray-600 mb-2">Aracın piyasa değerini hesaplar</p>
                  <p className="text-xs text-gray-500">
                    <strong>Kullanım:</strong> Satış, sigorta, ekspertiz<br/>
                    <strong>Ücret:</strong> 299₺
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h4 className="font-semibold text-blue-800">Tam Ekspertiz</h4>
                <p className="text-sm text-blue-700">Tüm analizleri bir arada yapar</p>
                <p className="text-xs text-blue-600 mt-1">
                  <strong>Ücret:</strong> 899₺ (Tüm analizler dahil)
                </p>
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      id: 5,
      title: 'İlk Analizinizi Başlatın',
      description: 'Artık hazırsınız! İlk analizinizi başlatabilirsiniz',
      icon: <SparklesIcon className="w-8 h-8 text-purple-600" />,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Tebrikler! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Artık Mivvo Expertiz'i nasıl kullanacağınızı biliyorsunuz. 
              İlk analizinizi başlatabilirsiniz!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/vehicle/new-report">
              <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-300">
                <div className="text-center">
                  <SparklesIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Yeni Rapor Oluştur</h3>
                  <p className="text-sm text-gray-600">Hemen başlayın</p>
                </div>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="p-4 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-gray-300">
                <div className="text-center">
                  <ChartBarIcon className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">Dashboard'a Git</h3>
                  <p className="text-sm text-gray-600">Genel bakış</p>
                </div>
              </Card>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="dontShowAgain"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="dontShowAgain" className="text-sm text-gray-600">
              Bu rehberi bir daha gösterme
            </label>
          </div>
        </div>
      )
    }
  ]

  const currentStepData = steps.find(step => step.id === currentStep)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
          </div>
          
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Adım {currentStep} / {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              %{Math.round((currentStep / totalSteps) * 100)} tamamlandı
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  {currentStepData?.icon}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {currentStepData?.title}
                  </h1>
                  <p className="text-gray-600">
                    {currentStepData?.description}
                  </p>
                </div>
              </div>

              {/* Step Content */}
              <div className="mb-8">
                {currentStepData?.content}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      variant="secondary"
                      onClick={handlePrevious}
                      className="flex items-center space-x-2"
                    >
                      <ChevronLeftIcon className="w-4 h-4" />
                      <span>Geri</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {currentStep < totalSteps && (
                    <Button
                      variant="secondary"
                      onClick={handleSkip}
                      className="text-gray-600"
                    >
                      Atla
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <span>
                      {currentStep === totalSteps ? 'Tamamla' : 'İleri'}
                    </span>
                    {currentStep < totalSteps && <ChevronRightIcon className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  )
}
