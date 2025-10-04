'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaintBrushIcon, 
  SparklesIcon, 
  EyeIcon,
  ChartBarIcon,
  BeakerIcon,
  CameraIcon,
  CpuChipIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface PaintAnalysisLoadingProps {
  vehicleInfo?: {
    make?: string
    model?: string
    year?: number
    plate?: string
  }
  progress?: number
}

const analysisSteps = [
  {
    id: 'image_processing',
    title: 'Resim İşleniyor',
    description: 'Yüksek çözünürlüklü görüntü analizi başlatılıyor',
    icon: CameraIcon,
    color: 'blue'
  },
  {
    id: 'ai_analysis',
    title: 'AI Analizi',
    description: 'OpenAI Vision API ile boya kalitesi değerlendiriliyor',
    icon: CpuChipIcon,
    color: 'purple'
  },
  {
    id: 'color_detection',
    title: 'Renk Tespiti',
    description: 'Renk kodu ve metalik özellikler analiz ediliyor',
    icon: EyeIcon,
    color: 'green'
  },
  {
    id: 'surface_analysis',
    title: 'Yüzey Analizi',
    description: 'Boya kalınlığı ve yüzey kalitesi ölçülüyor',
    icon: BeakerIcon,
    color: 'yellow'
  },
  {
    id: 'quality_assessment',
    title: 'Kalite Değerlendirmesi',
    description: 'Genel boya kalitesi ve öneriler hazırlanıyor',
    icon: ChartBarIcon,
    color: 'red'
  },
  {
    id: 'report_generation',
    title: 'Rapor Oluşturuluyor',
    description: 'Detaylı analiz raporu hazırlanıyor',
    icon: PaintBrushIcon,
    color: 'indigo'
  }
]

const funFacts = [
  "🎨 Bir araç boyasında ortalama 3-4 kat boya bulunur",
  "🔍 Boya kalınlığı mikron seviyesinde ölçülür (1 mikron = 0.001 mm)",
  "✨ Metalik boyalar özel pigmentler içerir",
  "🌞 UV ışınları boya rengini soldurabilir",
  "🚗 OEM boya kalitesi en yüksek standarttır",
  "💧 Clear coat (şeffaf kat) boyayı korur",
  "🎯 Renk eşleşmesi %95+ olmalıdır",
  "🔧 Portakal kabuğu efekti düzeltilebilir"
]

const tips = [
  "💡 İpucu: Düzenli yıkama boya ömrünü uzatır",
  "💡 İpucu: Seramik kaplama boyayı korur",
  "💡 İpucu: Kapalı park boya için idealdir",
  "💡 İpucu: Ağaç reçinesi boyaya zarar verir"
]

export default function PaintAnalysisLoading({ vehicleInfo, progress = 0 }: PaintAnalysisLoadingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  const [currentTip, setCurrentTip] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Adım ilerlemesi
  useEffect(() => {
    const stepProgress = Math.floor((progress / 100) * analysisSteps.length)
    setCurrentStep(Math.min(stepProgress, analysisSteps.length - 1))
    
    if (stepProgress > 0) {
      setCompletedSteps(Array.from({ length: stepProgress }, (_, i) => i))
    }
  }, [progress])

  // Eğlenceli bilgiler rotasyonu
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % funFacts.length)
    }, 4000)

    const tipInterval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 6000)

    return () => {
      clearInterval(factInterval)
      clearInterval(tipInterval)
    }
  }, [])

  const getStepColor = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'text-green-600 bg-green-100'
    if (stepIndex === currentStep) return 'text-blue-600 bg-blue-100'
    return 'text-gray-400 bg-gray-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PaintBrushIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎨 Boya Analizi Yapılıyor
          </h1>
          <p className="text-gray-600 text-lg">
            AI destekli profesyonel boya kalitesi değerlendirmesi
          </p>
          
          {vehicleInfo && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Analiz Edilen Araç:</p>
              <p className="font-semibold text-gray-900">
                {vehicleInfo.make} {vehicleInfo.model} ({vehicleInfo.year})
              </p>
              <p className="text-sm text-gray-500">Plaka: {vehicleInfo.plate}</p>
            </div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">İlerleme</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analysis Steps */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
              Analiz Adımları
            </h3>
            
            {analysisSteps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = completedSteps.includes(index)
              const isCurrent = index === currentStep
              const isPending = index > currentStep
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : isCurrent 
                        ? 'bg-blue-50 border-blue-200 shadow-md' 
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${getStepColor(index)}`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium transition-colors duration-300 ${
                        isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-600'
                      }`}>
                        {step.title}
                      </h4>
                      <p className={`text-sm transition-colors duration-300 ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    {isCurrent && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6"
                      >
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Fun Facts & Tips */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Fun Facts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BeakerIcon className="w-5 h-5 mr-2 text-green-500" />
                İlginç Bilgiler
              </h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFact}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-gray-700 text-lg font-medium">
                    {funFacts[currentFact]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-yellow-500" />
                Bakım İpuçları
              </h3>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTip}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <p className="text-gray-700 text-lg font-medium">
                    {tips[currentTip]}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Estimated Time */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Tahmini Süre</h3>
              <p className="text-blue-100">
                Analiz genellikle 30-60 saniye sürer. 
                Bu süre resim kalitesi ve AI sunucu yoğunluğuna bağlıdır.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <p className="text-gray-600 text-sm">
            Lütfen bu sayfayı kapatmayın. Analiz tamamlandığında otomatik olarak rapor sayfasına yönlendirileceksiniz.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
