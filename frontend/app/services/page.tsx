'use client'

import { motion } from 'framer-motion'
import { 
  SparklesIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CameraIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'

const services = [
  {
    id: 'PAINT_ANALYSIS',
    name: 'Boya Analizi',
    price: 25,
    description: 'Araç boyasının durumu ve kalitesi analizi',
    features: [
      'Renk eşleştirme ve kalite kontrolü',
      'Çizik ve hasar tespiti',
      'Boya kalınlığı ölçümü',
      'Renk solması analizi',
      'Detaylı raporlama'
    ],
    icon: '🎨',
    color: 'from-blue-500 to-cyan-500',
    duration: '5-10 dakika',
    accuracy: '99.5%'
  },
  {
    id: 'DAMAGE_ASSESSMENT',
    name: 'Hasar Değerlendirmesi',
    price: 35,
    description: 'Araç hasarlarının tespiti ve değerlendirmesi',
    features: [
      'Çarpışma hasarları tespiti',
      'Çizik ve çentik analizi',
      'Onarım maliyeti hesaplama',
      'Hasar derecesi belirleme',
      'Sigorta uyumlu rapor'
    ],
    icon: '🔧',
    color: 'from-green-500 to-emerald-500',
    duration: '10-15 dakika',
    accuracy: '98.8%'
  },
  {
    id: 'VALUE_ESTIMATION',
    name: 'Değer Tahmini',
    price: 20,
    description: 'Araç piyasa değeri tahmini',
    features: [
      'Piyasa analizi ve karşılaştırma',
      'Değer hesaplama algoritması',
      'Pazar trendleri analizi',
      'Araç durumu değerlendirmesi',
      'Güncel fiyat raporu'
    ],
    icon: '💰',
    color: 'from-purple-500 to-pink-500',
    duration: '3-5 dakika',
    accuracy: '97.2%'
  },
  {
    id: 'FULL_REPORT',
    name: 'Tam Expertiz',
    price: 75,
    description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
    features: [
      'Tüm analiz türleri dahil',
      'Detaylı teknik rapor',
      'Uzman görüşü ve öneriler',
      'Resmi belge niteliği',
      'Sigorta ve noter uyumlu'
    ],
    icon: '📋',
    color: 'from-orange-500 to-red-500',
    duration: '20-30 dakika',
    accuracy: '99.9%',
    popular: true
  }
]

const features = [
  {
    icon: SparklesIcon,
    title: 'Yapay Zeka Teknolojisi',
    description: 'Gelişmiş AI algoritmaları ile en yüksek doğruluk oranı',
    color: 'from-blue-500 to-purple-500'
  },
  {
    icon: ClockIcon,
    title: 'Hızlı Sonuçlar',
    description: 'Dakikalar içinde profesyonel raporlar alın',
    color: 'from-green-500 to-teal-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenilir Raporlar',
    description: 'Sigorta ve resmi işlemler için geçerli raporlar',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: CameraIcon,
    title: 'Kolay Kullanım',
    description: 'Sadece fotoğraf çekin, gerisini biz halledelim',
    color: 'from-orange-500 to-red-500'
  }
]

const processSteps = [
  {
    step: 1,
    title: 'Fotoğraf Yükleme',
    description: 'Araç fotoğraflarınızı yükleyin',
    icon: CameraIcon
  },
  {
    step: 2,
    title: 'AI Analizi',
    description: 'Yapay zeka araçınızı analiz eder',
    icon: SparklesIcon
  },
  {
    step: 3,
    title: 'Rapor Oluşturma',
    description: 'Detaylı raporunuz hazırlanır',
    icon: DocumentTextIcon
  },
  {
    step: 4,
    title: 'Sonuç Alma',
    description: 'Raporunuzu indirin ve kullanın',
    icon: CheckCircleIcon
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Ana Sayfa</Link>
              <Link href="/services" className="text-blue-600 font-medium">Hizmetler</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Fiyatlar</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Hakkımızda</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">Hizmetlerimiz</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Yapay zeka teknolojisi ile araç analizini hızlı, güvenilir ve ekonomik hale getiriyoruz.
              İhtiyacınıza uygun analiz paketini seçin.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <StaggerItem key={service.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`card card-hover p-6 text-center relative overflow-visible ${
                    service.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                        En Popüler
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="text-3xl font-bold gradient-text mb-4">{service.price}₺</div>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 text-blue-500 mr-2" />
                      {service.duration}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ChartBarIcon className="w-4 h-4 text-green-500 mr-2" />
                      {service.accuracy} doğruluk
                    </div>
                  </div>
                  
                  <ul className="text-sm text-gray-600 space-y-1 mb-6 text-left">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/register" className="btn btn-primary btn-md w-full">
                    Başla
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Neden <span className="gradient-text">Mivvo Expertiz</span>?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Yapay zeka teknolojisi ile araç analizini hızlı, güvenilir ve ekonomik hale getiriyoruz.
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-8 text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Nasıl Çalışır?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Sadece 4 adımda profesyonel araç expertizi raporu alın.
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Araç expertizi için beklemeyin. Yapay zeka teknolojisi ile hızlı ve güvenilir sonuçlar alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
                Ücretsiz Hesap Oluştur
              </Link>
              <Link href="/contact" className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                İletişime Geç
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Mivvo Expertiz</span>
              </div>
              <p className="text-gray-400 mb-4">
                Yapay zeka teknolojisi ile araç expertizi hizmetleri sunuyoruz.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hizmetler</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services" className="hover:text-white transition-colors">Boya Analizi</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Hasar Değerlendirmesi</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Değer Tahmini</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Tam Expertiz</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">İletişim</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">SSS</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Destek</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
