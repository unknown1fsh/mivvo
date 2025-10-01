'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  SparklesIcon,
  PaintBrushIcon,
  WrenchScrewdriverIcon,
  MusicalNoteIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  EyeIcon,
  ChartBarIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'

interface AnalysisType {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  originalPrice?: number
  discount?: number
  icon: React.ComponentType<any>
  color: string
  gradient: string
  features: string[]
  aiModels: string[]
  processingTime: string
  accuracy: number
  popularity: 'trending' | 'popular' | 'new' | 'premium'
  category: 'visual' | 'audio' | 'financial' | 'comprehensive'
  benefits: string[]
  useCases: string[]
  sampleResults: string[]
  technology: string[]
  badges: string[]
}

const analysisTypes: AnalysisType[] = [
  {
    id: 'paint-analysis',
    title: '🎨 Ultra HD Boya Analizi',
    subtitle: 'Piksel Seviyesinde Boya Kalitesi',
    description: 'Dünyanın en gelişmiş AI teknolojisi ile araç boyasının her detayını analiz edin. 4K çözünürlükte, mikron seviyesinde hassasiyetle.',
    price: 25,
    originalPrice: 45,
    discount: 44,
    icon: PaintBrushIcon,
    color: 'from-pink-500 to-rose-600',
    gradient: 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100',
    features: [
      '4K Ultra HD Görüntü Analizi',
      'Mikron Seviyesinde Kalınlık Ölçümü',
      'Renk Eşleştirme Doğruluğu %99.8',
      'UV Koruması Analizi',
      'Oksidasyon Tespiti',
      'Çizik Derinlik Analizi',
      'Boya Yaşı Tahmini',
      'Onarım Maliyet Hesaplama'
    ],
    aiModels: ['OpenAI GPT-4 Vision', 'Custom CNN Model'],
    processingTime: '3-5 saniye',
    accuracy: 98,
    popularity: 'trending',
    category: 'visual',
    benefits: [
      'Sigorta şirketleri için resmi rapor',
      'Alım-satım kararlarında güven',
      'Profesyonel onarım planlaması',
      'Değer kaybı hesaplama'
    ],
    useCases: [
      'İkinci el araç alımı',
      'Sigorta hasar tespiti',
      'Araç değerleme',
      'Onarım planlaması'
    ],
    sampleResults: [
      'Boya kalınlığı: 127.3 μm',
      'Renk eşleşmesi: %98.7',
      'Çizik sayısı: 3 (hafif)',
      'Onarım maliyeti: ₺2,450'
    ],
    technology: ['Computer Vision', 'Deep Learning', 'Image Processing', 'Color Science'],
    badges: ['En Popüler', 'AI Destekli', '4K Analiz']
  },
  {
    id: 'damage-analysis',
    title: '🔧 Profesyonel Hasar Tespiti',
    subtitle: 'AI Destekli Kapsamlı Hasar Analizi',
    description: 'Çarpışma, doğal afet, vandalizm ve normal aşınma hasarlarını tespit edin. Güvenlik riski değerlendirmesi ile birlikte.',
    price: 35,
    originalPrice: 60,
    discount: 42,
    icon: WrenchScrewdriverIcon,
    color: 'from-orange-500 to-red-600',
    gradient: 'bg-gradient-to-br from-orange-50 via-red-50 to-orange-100',
    features: [
      '360° Hasar Taraması',
      'Güvenlik Risk Analizi',
      'Onarım Öncelik Sıralaması',
      'Sigorta Kapsamı Değerlendirmesi',
      'Piyasa Değeri Etkisi',
      'Teknik Rapor Hazırlama',
      '3D Hasar Görselleştirme',
      'Uzman Görüşü Dahil'
    ],
    aiModels: ['OpenAI GPT-4 Vision', 'YOLO v8', 'Custom Damage CNN'],
    processingTime: '5-8 saniye',
    accuracy: 96,
    popularity: 'popular',
    category: 'visual',
    benefits: [
      'Sigorta taleplerinde güçlü kanıt',
      'Alım-satımda şeffaflık',
      'Güvenlik riski erken tespiti',
      'Onarım maliyeti optimizasyonu'
    ],
    useCases: [
      'Sigorta hasar tespiti',
      'İkinci el araç değerlendirmesi',
      'Kaza sonrası analiz',
      'Araç güvenlik kontrolü'
    ],
    sampleResults: [
      'Tespit edilen hasar: 7 bölge',
      'Güvenlik riski: Düşük',
      'Toplam onarım: ₺8,750',
      'Sigorta kapsamı: %85'
    ],
    technology: ['Object Detection', 'Damage Classification', 'Risk Assessment', '3D Reconstruction'],
    badges: ['Güvenlik Odaklı', 'Uzman Onaylı', 'Sigorta Uyumlu']
  },
  {
    id: 'engine-sound-analysis',
    title: '🎵 Akustik Motor Analizi',
    subtitle: 'Ses Dalgalarından Arıza Tespiti',
    description: 'Motor sesini analiz ederek gizli arızaları tespit edin. Frekans analizi ile erken uyarı sistemi.',
    price: 30,
    originalPrice: 50,
    discount: 40,
    icon: MusicalNoteIcon,
    color: 'from-blue-500 to-indigo-600',
    gradient: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100',
    features: [
      'Frekans Spektrum Analizi',
      'Motor Arıza Tespiti',
      'Performans Değerlendirmesi',
      'Yakıt Verimliliği Analizi',
      'Titreşim Analizi',
      'Akustik Kalite Ölçümü',
      'Arıza Öncelik Sıralaması',
      'Bakım Önerileri'
    ],
    aiModels: ['OpenAI Whisper', 'Custom Audio CNN', 'FFT Analysis'],
    processingTime: '4-6 saniye',
    accuracy: 94,
    popularity: 'new',
    category: 'audio',
    benefits: [
      'Erken arıza tespiti',
      'Bakım maliyeti tasarrufu',
      'Motor ömrü uzatma',
      'Yakıt verimliliği artışı'
    ],
    useCases: [
      'Motor bakım planlaması',
      'Arıza öncesi tespit',
      'Performans optimizasyonu',
      'Yakıt tasarrufu analizi'
    ],
    sampleResults: [
      'Motor sağlığı: %87',
      'Tespit edilen sorun: 2',
      'Bakım önceliği: Orta',
      'Tahmini tasarruf: ₺1,200/yıl'
    ],
    technology: ['Audio Processing', 'FFT Analysis', 'Machine Learning', 'Signal Processing'],
    badges: ['Yeni Teknoloji', 'Erken Tespit', 'Tasarruf Odaklı']
  },
  {
    id: 'value-estimation',
    title: '💰 Akıllı Değer Tahmini',
    subtitle: 'Piyasa Verileri ile Değer Hesaplama',
    description: 'Gerçek zamanlı piyasa verileri, araç geçmişi ve AI algoritmaları ile en doğru değer tahmini.',
    price: 20,
    originalPrice: 35,
    discount: 43,
    icon: CurrencyDollarIcon,
    color: 'from-green-500 to-emerald-600',
    gradient: 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100',
    features: [
      'Gerçek Zamanlı Piyasa Analizi',
      'Araç Geçmişi İncelemesi',
      'Bölgesel Fiyat Karşılaştırması',
      'Değer Kaybı Hesaplama',
      'Alım-Satım Önerileri',
      'Piyasa Trend Analizi',
      'Rekabetçi Fiyatlandırma',
      'Yatırım Potansiyeli'
    ],
    aiModels: ['OpenAI GPT-4', 'Custom ML Model', 'Market Data API'],
    processingTime: '2-4 saniye',
    accuracy: 92,
    popularity: 'popular',
    category: 'financial',
    benefits: [
      'Doğru fiyat belirleme',
      'Piyasa avantajı',
      'Yatırım kararları',
      'Zaman tasarrufu'
    ],
    useCases: [
      'Araç satış fiyatı belirleme',
      'Alım fiyatı değerlendirmesi',
      'Sigorta değer tespiti',
      'Yatırım analizi'
    ],
    sampleResults: [
      'Piyasa değeri: ₺485,000',
      'Önerilen satış: ₺495,000',
      'Piyasa pozisyonu: %15 üstü',
      'Yatırım potansiyeli: Yüksek'
    ],
    technology: ['Market Analysis', 'Predictive Modeling', 'Data Mining', 'Price Optimization'],
    badges: ['Piyasa Lideri', 'Gerçek Zamanlı', 'Yatırım Odaklı']
  },
  {
    id: 'comprehensive-expertise',
    title: '📋 Tam Expertiz Paketi',
    subtitle: 'Tüm Analizlerin Premium Kombinasyonu',
    description: 'Boya, hasar, motor ve değer analizlerinin hepsini tek pakette. Uzman görüşü ve detaylı raporlama ile.',
    price: 85,
    originalPrice: 150,
    discount: 43,
    icon: DocumentTextIcon,
    color: 'from-purple-500 to-violet-600',
    gradient: 'bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100',
    features: [
      'Tüm Analiz Türleri Dahil',
      'Uzman Görüşü ve Onayı',
      'Detaylı PDF Rapor',
      '3D Görselleştirme',
      'Video Analiz Özeti',
      'Mobil Uygulama Erişimi',
      '1 Yıl Veri Saklama',
      '7/24 Destek Hattı'
    ],
    aiModels: ['OpenAI GPT-4 Vision', 'Custom Ensemble Model', 'Expert System'],
    processingTime: '10-15 saniye',
    accuracy: 99,
    popularity: 'premium',
    category: 'comprehensive',
    benefits: [
      'Kapsamlı araç bilgisi',
      'Profesyonel raporlama',
      'Uzman onayı',
      'Maliyet avantajı'
    ],
    useCases: [
      'Profesyonel araç değerlendirmesi',
      'Sigorta ekspertizi',
      'Alım-satım danışmanlığı',
      'Araç portföy yönetimi'
    ],
    sampleResults: [
      'Genel durum: Mükemmel',
      'Toplam değer: ₺520,000',
      'Risk seviyesi: Düşük',
      'Önerilen işlem: Satış'
    ],
    technology: ['Ensemble Learning', 'Expert Systems', '3D Visualization', 'Report Generation'],
    badges: ['Premium', 'Uzman Onaylı', 'Kapsamlı']
  }
]

const popularityConfig = {
  trending: { label: '🔥 Trend', color: 'bg-red-500 text-white' },
  popular: { label: '⭐ Popüler', color: 'bg-blue-500 text-white' },
  new: { label: '🆕 Yeni', color: 'bg-green-500 text-white' },
  premium: { label: '👑 Premium', color: 'bg-purple-500 text-white' }
}

export default function AnalysisTypesPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [hoveredType, setHoveredType] = useState<string | null>(null)
  const router = useRouter()

  const handleSelect = (type: AnalysisType) => {
    setSelectedType(type.id)
    // Analiz türüne göre yönlendirme
    switch (type.id) {
      case 'paint-analysis':
        router.push('/vehicle/paint-analysis')
        break
      case 'damage-analysis':
        router.push('/vehicle/damage-analysis')
        break
      case 'engine-sound-analysis':
        router.push('/vehicle/engine-sound-analysis')
        break
      case 'value-estimation':
        router.push('/vehicle/value-estimation')
        break
      case 'comprehensive-expertise':
        router.push('/vehicle/comprehensive-expertise')
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              AI Destekli
              <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Araç Analizi
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              Dünyanın en gelişmiş yapay zeka teknolojisi ile araçlarınızı analiz edin. 
              Her detay, her hasar, her değer - hepsi AI ile tespit ediliyor.
            </p>
            <div className="flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span>%99.8 Doğruluk</span>
              </div>
              <div className="flex items-center">
                <BoltIcon className="w-5 h-5 mr-2" />
                <span>3-15 Saniye</span>
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2" />
                <span>Güvenli & Hızlı</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Analysis Types Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Analiz Türlerini Seçin
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            İhtiyacınıza uygun analiz türünü seçin ve AI destekli detaylı raporunuzu alın
          </p>
        </motion.div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {analysisTypes.map((type, index) => (
            <StaggerItem key={type.id} delay={index * 0.1}>
              <motion.div
                className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  selectedType === type.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
                onHoverStart={() => setHoveredType(type.id)}
                onHoverEnd={() => setHoveredType(null)}
                onClick={() => handleSelect(type)}
                whileHover={{ y: -8 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Card */}
                <div className={`relative overflow-hidden rounded-3xl ${type.gradient} p-8 h-full`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  </div>

                  {/* Popularity Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${popularityConfig[type.popularity].color}`}>
                      {popularityConfig[type.popularity].label}
                    </span>
                  </div>

                  {/* Discount Badge */}
                  {type.discount && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white">
                        %{type.discount} İndirim
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                    {type.title}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-600 mb-4 font-medium">
                    {type.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {type.description}
                  </p>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Özellikler:</h4>
                    <ul className="space-y-2">
                      {type.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* AI Models */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">AI Modelleri:</h4>
                    <div className="flex flex-wrap gap-2">
                      {type.aiModels.map((model, idx) => (
                        <span key={idx} className="px-2 py-1 bg-white/50 rounded-lg text-xs text-gray-700">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{type.accuracy}%</div>
                      <div className="text-xs text-gray-600">Doğruluk</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{type.processingTime}</div>
                      <div className="text-xs text-gray-600">Süre</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{type.features.length}</div>
                      <div className="text-xs text-gray-600">Özellik</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      {type.originalPrice && (
                        <span className="text-sm text-gray-500 line-through mr-2">
                          ₺{type.originalPrice}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-gray-900">
                        ₺{type.price}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Başlangıç</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${type.color} text-white font-semibold flex items-center justify-center group-hover:shadow-lg transition-all duration-300`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Analizi Başlat</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Hover Overlay */}
                  <AnimatePresence>
                    {hoveredType === type.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/5 rounded-3xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Hangi Analizi Seçeceğinizi Bilemiyor musunuz?
            </h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Uzman ekibimiz size en uygun analiz türünü önerebilir. 
              Ücretsiz danışmanlık için bizimle iletişime geçin.
            </p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-2xl font-semibold hover:bg-blue-50 transition-colors">
              Ücretsiz Danışmanlık Al
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
