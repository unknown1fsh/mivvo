/**
 * Report Loading Component
 * 
 * Premium loading ekranı - Tüm analiz raporları için
 * Analiz tipine göre renk, icon ve mesaj değişir
 */

import { 
  PaintBrushIcon, 
  WrenchIcon, 
  CurrencyDollarIcon, 
  SpeakerWaveIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { Card } from './Card'
import { ProgressBar } from './LoadingComponents'

export interface ReportLoadingProps {
  /** Analiz tipi */
  type: 'paint' | 'damage' | 'value' | 'engine' | 'comprehensive'
  
  /** Araç bilgileri (opsiyonel) */
  vehicleInfo?: {
    make?: string
    model?: string
    year?: number
    plate?: string
  }
  
  /** İlerleme yüzdesi (0-100) */
  progress?: number
  
  /** Tahmini süre */
  estimatedTime?: string
  
  /** Mevcut adım (comprehensive için) */
  currentStep?: {
    step: number
    total: number
    name: string
  }
}

/**
 * Analiz tiplerine göre yapılandırma
 */
const analysisConfig = {
  paint: {
    gradient: 'from-blue-500 to-purple-500',
    bgGradient: 'from-blue-50 via-white to-purple-50',
    icon: PaintBrushIcon,
    emoji: '🎨',
    title: 'Boya Analizi Yapılıyor',
    subtitle: 'AI, araç boyasını mikroskobik seviyede inceliyor',
    defaultTime: '30-45 saniye',
    progressColor: 'bg-purple-600'
  },
  damage: {
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-50 via-white to-orange-50',
    icon: WrenchIcon,
    emoji: '🔧',
    title: 'Hasar Analizi Yapılıyor',
    subtitle: 'AI, kaporta hasarlarını tespit ediyor',
    defaultTime: '30-60 saniye',
    progressColor: 'bg-red-600'
  },
  value: {
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 via-white to-emerald-50',
    icon: CurrencyDollarIcon,
    emoji: '💰',
    title: 'Değer Tahmini Yapılıyor',
    subtitle: 'AI, piyasa analizini gerçekleştiriyor',
    defaultTime: '45-60 saniye',
    progressColor: 'bg-green-600'
  },
  engine: {
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 via-white to-cyan-50',
    icon: SpeakerWaveIcon,
    emoji: '🔊',
    title: 'Motor Ses Analizi Yapılıyor',
    subtitle: 'AI, motor akustiğini inceliyor',
    defaultTime: '60-90 saniye',
    progressColor: 'bg-cyan-600'
  },
  comprehensive: {
    gradient: 'from-amber-400 via-amber-500 to-amber-600',
    bgGradient: 'from-gray-50 via-blue-50 to-purple-50',
    icon: SparklesIcon,
    emoji: '✨',
    title: 'Tam Ekspertiz Raporu Hazırlanıyor',
    subtitle: 'AI, tüm verileri analiz edip kapsamlı rapor oluşturuyor',
    defaultTime: '2-3 dakika',
    progressColor: 'bg-amber-600'
  }
}

export function ReportLoading({
  type,
  vehicleInfo,
  progress = 75,
  estimatedTime,
  currentStep
}: ReportLoadingProps) {
  const config = analysisConfig[type]
  const Icon = config.icon
  const time = estimatedTime || config.defaultTime

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4`}>
      <Card padding="none" className="max-w-2xl w-full overflow-hidden">
        {/* Header - Gradient */}
        <div className={`bg-gradient-to-r ${config.gradient} p-8 text-white text-center relative overflow-hidden`}>
          {/* Decorative blur circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Animated Icon */}
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Icon className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold mb-2">{config.title}</h2>
            <p className="text-white/90">{config.subtitle}</p>
            
            {vehicleInfo && (vehicleInfo.make || vehicleInfo.model) && (
              <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 inline-block">
                <p className="text-sm font-medium">
                  {vehicleInfo.make} {vehicleInfo.model} 
                  {vehicleInfo.year && ` (${vehicleInfo.year})`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Comprehensive için multi-step progress */}
          {type === 'comprehensive' && currentStep && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Adım {currentStep.step}/{currentStep.total}: {currentStep.name}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep.step / currentStep.total) * 100)}%
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                {['Hasar Analizi', 'Boya Analizi', 'Motor Analizi', 'Değer Tahmini'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      index + 1 < currentStep.step ? 'bg-green-500' :
                      index + 1 === currentStep.step ? 'bg-amber-500 animate-pulse' :
                      'bg-gray-300'
                    }`}>
                      {index + 1 < currentStep.step ? (
                        <span className="text-white text-xs">✓</span>
                      ) : index + 1 === currentStep.step ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-white text-xs">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm ${
                      index + 1 <= currentStep.step ? 'text-gray-900 font-semibold' : 'text-gray-500'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-6">
            <ProgressBar value={progress} className={config.progressColor} />
          </div>

          {/* Status Messages */}
          <div className="space-y-3">
            <div className="flex items-center justify-center text-gray-700">
              <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-sm">
                Tahmini süre: <strong>{time}</strong>
              </span>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-3">
                AI modelimiz aracınızı detaylı olarak inceliyor. 
                Lütfen sayfayı kapatmayın veya yenilemeyin.
              </p>
              
              {/* Motivasyonel mesajlar */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
                <p className="text-sm text-blue-800 flex items-start">
                  <span className="text-lg mr-2">💡</span>
                  <span>
                    <strong>İpucu:</strong> Analiz tamamlandığında otomatik olarak rapor sayfasına yönlendirileceksiniz.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Animated dots */}
          <div className="flex items-center justify-center mt-6 space-x-2">
            <div className={`w-2 h-2 ${config.progressColor} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 ${config.progressColor} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 ${config.progressColor} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </Card>
    </div>
  )
}

