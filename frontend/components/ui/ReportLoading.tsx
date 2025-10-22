/**
 * Report Loading Component
 * 
 * Premium loading ekranı - Tüm analiz raporları için
 * Analiz tipine göre renk, icon ve mesaj değişir
 * Multi-stage progress tracking ile kullanıcıyı teşvik eder
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PaintBrushIcon, 
  WrenchIcon, 
  CurrencyDollarIcon, 
  SpeakerWaveIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  CpuChipIcon,
  EyeIcon,
  ChartBarIcon,
  BeakerIcon,
  CameraIcon,
  HeartIcon,
  StarIcon,
  LightBulbIcon
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
 * Analiz adımları - Her analiz tipi için detaylı adımlar
 */
const analysisSteps = {
  paint: [
    { id: 'image_processing', title: 'Resim İşleniyor', description: 'Yüksek çözünürlüklü görüntü analizi', icon: CameraIcon },
    { id: 'ai_analysis', title: 'AI Analizi', description: 'Mivvo AI Vision API ile boya kalitesi değerlendiriliyor', icon: CpuChipIcon },
    { id: 'color_detection', title: 'Renk Tespiti', description: 'Renk kodu ve metalik özellikler analiz ediliyor', icon: EyeIcon },
    { id: 'surface_analysis', title: 'Yüzey Analizi', description: 'Boya kalınlığı ve yüzey kalitesi ölçülüyor', icon: BeakerIcon },
    { id: 'quality_assessment', title: 'Kalite Değerlendirmesi', description: 'Genel boya kalitesi ve öneriler hazırlanıyor', icon: ChartBarIcon },
    { id: 'report_generation', title: 'Rapor Oluşturuluyor', description: 'Detaylı analiz raporu hazırlanıyor', icon: PaintBrushIcon }
  ],
  damage: [
    { id: 'image_processing', title: 'Resim İşleniyor', description: 'Hasar tespiti için görüntü analizi', icon: CameraIcon },
    { id: 'ai_analysis', title: 'AI Analizi', description: 'Mivvo AI ile hasar tespiti ve sınıflandırması', icon: CpuChipIcon },
    { id: 'damage_detection', title: 'Hasar Tespiti', description: 'Çizik, çökme ve boya hasarları tespit ediliyor', icon: EyeIcon },
    { id: 'severity_assessment', title: 'Şiddet Değerlendirmesi', description: 'Hasar şiddeti ve aciliyet analizi', icon: ChartBarIcon },
    { id: 'repair_estimation', title: 'Onarım Tahmini', description: 'Onarım maliyeti ve süresi hesaplanıyor', icon: WrenchIcon },
    { id: 'report_generation', title: 'Rapor Oluşturuluyor', description: 'Detaylı hasar raporu hazırlanıyor', icon: BeakerIcon }
  ],
  value: [
    { id: 'market_research', title: 'Pazar Araştırması', description: 'Güncel piyasa verileri toplanıyor', icon: ChartBarIcon },
    { id: 'vehicle_assessment', title: 'Araç Değerlendirmesi', description: 'Araç durumu ve özellikleri analiz ediliyor', icon: EyeIcon },
    { id: 'ai_analysis', title: 'AI Analizi', description: 'Mivvo AI ile değer tahmini yapılıyor', icon: CpuChipIcon },
    { id: 'market_comparison', title: 'Pazar Karşılaştırması', description: 'Benzer araçlarla karşılaştırma', icon: BeakerIcon },
    { id: 'price_calculation', title: 'Fiyat Hesaplama', description: 'Detaylı fiyat kırılımı hazırlanıyor', icon: CurrencyDollarIcon },
    { id: 'report_generation', title: 'Rapor Oluşturuluyor', description: 'Kapsamlı değer raporu hazırlanıyor', icon: ChartBarIcon }
  ],
  engine: [
    { id: 'audio_processing', title: 'Ses İşleniyor', description: 'Motor sesi analiz için hazırlanıyor', icon: SpeakerWaveIcon },
    { id: 'frequency_analysis', title: 'Frekans Analizi', description: 'Ses frekansları ve harmonikler analiz ediliyor', icon: ChartBarIcon },
    { id: 'ai_analysis', title: 'AI Analizi', description: 'Mivvo AI ile motor sağlığı değerlendiriliyor', icon: CpuChipIcon },
    { id: 'issue_detection', title: 'Arıza Tespiti', description: 'Potansiyel motor arızaları tespit ediliyor', icon: EyeIcon },
    { id: 'performance_assessment', title: 'Performans Değerlendirmesi', description: 'Motor performansı ve verimliliği analiz ediliyor', icon: BeakerIcon },
    { id: 'report_generation', title: 'Rapor Oluşturuluyor', description: 'Detaylı motor analiz raporu hazırlanıyor', icon: SpeakerWaveIcon }
  ],
  comprehensive: [
    { id: 'damage_analysis', title: 'Hasar Analizi', description: 'Kaporta hasarları tespit ediliyor', icon: WrenchIcon },
    { id: 'paint_analysis', title: 'Boya Analizi', description: 'Boya kalitesi değerlendiriliyor', icon: PaintBrushIcon },
    { id: 'engine_analysis', title: 'Motor Analizi', description: 'Motor sağlığı kontrol ediliyor', icon: SpeakerWaveIcon },
    { id: 'value_estimation', title: 'Değer Tahmini', description: 'Piyasa değeri hesaplanıyor', icon: CurrencyDollarIcon },
    { id: 'ai_synthesis', title: 'AI Sentezi', description: 'Tüm veriler birleştiriliyor', icon: CpuChipIcon },
    { id: 'report_generation', title: 'Rapor Oluşturuluyor', description: 'Kapsamlı ekspertiz raporu hazırlanıyor', icon: SparklesIcon }
  ]
}

/**
 * Teşvik edici mesajlar - Her analiz tipi için
 */
const motivationalMessages = {
  paint: [
    "🎨 Boya analizi ile aracınızın gerçek değerini öğrenin!",
    "✨ Profesyonel boya kalitesi değerlendirmesi yapılıyor",
    "🔍 Mikroskobik seviyede detaylı analiz gerçekleştiriliyor",
    "💎 Boya kalitesi aracınızın değerini etkiler",
    "🌟 Mivvo AI ile en yüksek kalitede analiz"
  ],
  damage: [
    "🔧 Hasar analizi ile güvenli sürüş sağlayın!",
    "🛡️ Potansiyel güvenlik riskleri tespit ediliyor",
    "💰 Onarım maliyetlerini önceden öğrenin",
    "⚡ Hızlı ve doğru hasar tespiti",
    "🎯 Profesyonel hasar değerlendirmesi"
  ],
  value: [
    "💰 Doğru fiyatlandırma ile pazarlık gücünüzü artırın!",
    "📈 Piyasa trendlerini takip edin",
    "💎 Aracınızın gerçek değerini öğrenin",
    "🚀 Yatırım kararlarınızı doğru verin",
    "⭐ Uzman değerlendirmesi ile güvenli alım-satım"
  ],
  engine: [
    "🔊 Motor sağlığınızı koruyun!",
    "⚙️ Erken arıza tespiti ile büyük masraflardan kaçının",
    "🚗 Güvenli sürüş için motor kontrolü",
    "💡 Bakım önerileri ile aracınızı koruyun",
    "🎯 Profesyonel motor analizi"
  ],
  comprehensive: [
    "✨ Kapsamlı ekspertiz ile tam güven!",
    "🏆 Profesyonel araç değerlendirmesi",
    "💎 Tüm açılardan detaylı analiz",
    "🎯 Doğru yatırım kararları için ekspertiz",
    "🌟 Mivvo AI ile en kapsamlı analiz"
  ]
}

/**
 * İlginç bilgiler - Her analiz tipi için
 */
const funFacts = {
  paint: [
    "🎨 Bir araç boyasında ortalama 3-4 kat boya bulunur",
    "🔍 Boya kalınlığı mikron seviyesinde ölçülür (1 mikron = 0.001 mm)",
    "✨ Metalik boyalar özel pigmentler içerir",
    "🌞 UV ışınları boya rengini soldurabilir",
    "🚗 OEM boya kalitesi en yüksek standarttır"
  ],
  damage: [
    "🔧 Küçük çizikler bile araç değerini %5-10 düşürebilir",
    "🛡️ Yapısal hasarlar güvenlik riski oluşturur",
    "💰 Hasar geçmişi sigorta primlerini etkiler",
    "⚡ Erken tespit edilen hasarlar daha ucuz onarılır",
    "🎯 Profesyonel değerlendirme ile doğru karar"
  ],
  value: [
    "💰 Araç değeri kilometre, yaş ve duruma göre değişir",
    "📈 Piyasa koşulları fiyatları etkiler",
    "💎 Özel donanımlar değeri artırır",
    "🚀 Yeni model çıkışları eski modelleri etkiler",
    "⭐ Bakım geçmişi değeri etkiler"
  ],
  engine: [
    "🔊 Motor sesi sağlık göstergesidir",
    "⚙️ Erken arıza tespiti büyük masrafları önler",
    "🚗 Düzenli bakım motor ömrünü uzatır",
    "💡 Motor sesi değişiklikleri önemli işaretlerdir",
    "🎯 Profesyonel analiz ile güvenli sürüş"
  ],
  comprehensive: [
    "✨ Kapsamlı ekspertiz tüm açıları kapsar",
    "🏆 Profesyonel değerlendirme standartı",
    "💎 Detaylı analiz ile doğru karar",
    "🎯 Yatırım güvenliği için ekspertiz",
    "🌟 Mivvo AI ile en kapsamlı analiz"
  ]
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
  // Type mapping - backend'den gelen type'ları frontend type'larına çevir
  const typeMapping: { [key: string]: keyof typeof analysisConfig } = {
    'damage': 'damage',
    'paint': 'paint', 
    'audio': 'engine',  // Backend 'audio' gönderiyor, frontend 'engine' bekliyor
    'engine': 'engine',
    'value': 'value',
    'comprehensive': 'comprehensive'
  }
  
  const mappedType = typeMapping[type] || 'comprehensive'
  const config = analysisConfig[mappedType]
  const Icon = config.icon
  const time = estimatedTime || config.defaultTime
  
  // State for dynamic content
  const [currentMessage, setCurrentMessage] = useState(0)
  const [currentFact, setCurrentFact] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  const steps = analysisSteps[mappedType]
  const messages = motivationalMessages[mappedType]
  const facts = funFacts[mappedType]
  
  // Calculate current step based on progress
  useEffect(() => {
    const stepProgress = Math.floor((progress / 100) * steps.length)
    setCurrentStepIndex(Math.min(stepProgress, steps.length - 1))
  }, [progress, steps.length])
  
  // Rotate motivational messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length)
    }, 3000)
    
    return () => clearInterval(messageInterval)
  }, [messages.length])
  
  // Rotate fun facts
  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length)
    }, 5000)
    
    return () => clearInterval(factInterval)
  }, [facts.length])

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4`}>
      <div className="max-w-6xl w-full">
        {/* Header - Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-gradient-to-r ${config.gradient} p-8 text-white text-center relative overflow-hidden rounded-t-2xl`}
        >
          {/* Decorative blur circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Animated Icon */}
            <motion.div 
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Icon className="w-10 h-10 text-white" />
            </motion.div>
            
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
        </motion.div>

        {/* Content */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Progress & Steps */}
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-700">İlerleme</span>
                  <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
                </div>
                <ProgressBar value={progress} className={config.progressColor} showPercentage={false} />
              </div>

              {/* Analysis Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Analiz Adımları
                </h3>
                
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon
                    const isCompleted = index < currentStepIndex
                    const isCurrent = index === currentStepIndex
                    const isPending = index > currentStepIndex
                    
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
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isCompleted ? 'text-green-600 bg-green-100' :
                            isCurrent ? 'text-blue-600 bg-blue-100' :
                            'text-gray-400 bg-gray-100'
                          }`}>
                            {isCompleted ? (
                              <CheckCircleIcon className="w-6 h-6" />
                            ) : (
                              <StepIcon className="w-6 h-6" />
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
                </div>
              </div>
            </div>

            {/* Right Column - Motivational Content */}
            <div className="space-y-6">
              {/* Motivational Message */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Teşvik Mesajı
                </h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentMessage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-lg font-medium"
                  >
                    {messages[currentMessage]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Fun Facts */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
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
                      {facts[currentFact]}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Estimated Time */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                  Tahmini Süre
                </h3>
                <p className="text-gray-600">
                  <strong>{time}</strong> - Analiz genellikle bu sürede tamamlanır. 
                  Bu süre veri kalitesi ve AI sunucu yoğunluğuna bağlıdır.
                </p>
              </div>

              {/* Status Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 flex items-start">
                  <span className="text-lg mr-2">💡</span>
                  <span>
                    <strong>İpucu:</strong> Analiz tamamlandığında otomatik olarak rapor sayfasına yönlendirileceksiniz. 
                    Lütfen sayfayı kapatmayın veya yenilemeyin.
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Animated Dots */}
          <div className="flex items-center justify-center mt-8 space-x-2">
            <motion.div 
              className={`w-3 h-3 ${config.progressColor} rounded-full`}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0 }}
            />
            <motion.div 
              className={`w-3 h-3 ${config.progressColor} rounded-full`}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div 
              className={`w-3 h-3 ${config.progressColor} rounded-full`}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

