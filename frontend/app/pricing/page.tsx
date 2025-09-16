'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  StarIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { Accordion } from '@/components/ui'

const pricingPlans = [
  {
    id: 'starter',
    name: 'Başlangıç',
    price: 0,
    period: 'ay',
    description: 'Küçük işlemler için ideal',
    features: [
      '1 ücretsiz analiz',
      'Temel raporlar',
      'Email destek',
      'Mobil uygulama erişimi'
    ],
    limitations: [
      'Aylık 5 analiz limiti',
      'Temel rapor formatı'
    ],
    popular: false,
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'professional',
    name: 'Profesyonel',
    price: 99,
    period: 'ay',
    description: 'En popüler seçenek',
    features: [
      'Sınırsız analiz',
      'Detaylı raporlar',
      'Öncelikli destek',
      'API erişimi',
      'Toplu analiz',
      'Özel rapor formatları'
    ],
    limitations: [],
    popular: true,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'enterprise',
    name: 'Kurumsal',
    price: 299,
    period: 'ay',
    description: 'Büyük işletmeler için',
    features: [
      'Tüm Profesyonel özellikler',
      'Özel entegrasyonlar',
      '7/24 telefon desteği',
      'Özel hesap yöneticisi',
      'Gelişmiş analitikler',
      'Beyaz etiket çözümü'
    ],
    limitations: [],
    popular: false,
    color: 'from-purple-500 to-pink-600'
  }
]

const servicePricing = [
  {
    service: 'Boya Analizi',
    price: 25,
    description: 'Araç boyasının durumu ve kalitesi analizi',
    features: ['Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi']
  },
  {
    service: 'Hasar Değerlendirmesi',
    price: 35,
    description: 'Araç hasarlarının tespiti ve değerlendirmesi',
    features: ['Çarpışma hasarları', 'Çizik analizi', 'Onarım maliyeti']
  },
  {
    service: 'Değer Tahmini',
    price: 20,
    description: 'Araç piyasa değeri tahmini',
    features: ['Piyasa analizi', 'Değer hesaplama', 'Raporlama']
  },
  {
    service: 'Tam Expertiz',
    price: 75,
    description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
    features: ['Tüm analizler', 'Detaylı rapor', 'Uzman görüşü']
  }
]

const faqs = [
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, banka kartı, banka havalesi ve mobil ödeme yöntemlerini kabul ediyoruz. Tüm ödemeler SSL ile güvenli şekilde işlenir.'
  },
  {
    question: 'Fiyatlarımı değiştirebilir miyim?',
    answer: 'Evet, istediğiniz zaman planınızı yükseltebilir veya düşürebilirsiniz. Değişiklikler bir sonraki faturalama döneminde geçerli olur.'
  },
  {
    question: 'İptal ettiğimde para iadesi alabilir miyim?',
    answer: 'Evet, 30 gün içinde iptal ederseniz tam para iadesi alırsınız. İptal işlemi hesap sayfanızdan kolayca yapılabilir.'
  },
  {
    question: 'Kurumsal plan için özel fiyatlandırma var mı?',
    answer: 'Evet, 100+ kullanıcılı kurumsal müşterilerimiz için özel fiyatlandırma ve indirimler sunuyoruz. İletişime geçin.'
  },
  {
    question: 'API kullanımı için ek ücret var mı?',
    answer: 'Profesyonel ve Kurumsal planlarda API kullanımı dahildir. Başlangıç planında API erişimi bulunmaz.'
  }
]

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const getDiscountedPrice = (price: number) => {
    return billingPeriod === 'yearly' ? Math.round(price * 10) : price
  }

  const getSavings = (price: number) => {
    return Math.round(price * 2)
  }

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
              <Link href="/services" className="text-gray-700 hover:text-blue-600 transition-colors">Hizmetler</Link>
              <Link href="/pricing" className="text-blue-600 font-medium">Fiyatlar</Link>
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
              <span className="gradient-text">Basit ve Şeffaf</span>
              <br />
              <span className="text-gray-800">Fiyatlandırma</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              İhtiyacınıza uygun planı seçin. Tüm planlarımızda ücretsiz deneme süresi ve para iadesi garantisi var.
            </p>
          </FadeInUp>

          {/* Billing Toggle */}
          <FadeInUp delay={0.2}>
            <div className="flex items-center justify-center mb-12">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Aylık
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    billingPeriod === 'yearly'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Yıllık
                  <span className="ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                    %20 indirim
                  </span>
                </button>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <StaggerItem key={plan.id}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`card card-hover p-8 text-center relative ${
                    plan.popular ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                        En Popüler
                      </span>
                    </div>
                  )}

                  <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <CurrencyDollarIcon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="text-4xl font-bold text-gray-900">
                      {plan.price === 0 ? 'Ücretsiz' : `${getDiscountedPrice(plan.price)}₺`}
                    </div>
                    {plan.price > 0 && (
                      <div className="text-gray-600">
                        /{plan.period}
                        {billingPeriod === 'yearly' && (
                          <span className="text-green-600 ml-2">
                            (Yılda {getSavings(plan.price)}₺ tasarruf)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="text-left space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center">
                        <ClockIcon className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-500">{limitation}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/register"
                    className={`btn w-full btn-lg ${
                      plan.popular ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {plan.price === 0 ? 'Ücretsiz Başla' : 'Planı Seç'}
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Service Pricing */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Hizmet Fiyatları
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Tek seferlik analizler için ayrı fiyatlandırma
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicePricing.map((service, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6 text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.service}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-3xl font-bold gradient-text mb-4">{service.price}₺</div>
                  <ul className="text-sm text-gray-600 space-y-1 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className="btn btn-primary btn-md w-full">
                    Başla
                  </Link>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Sıkça Sorulan Sorular
              </h2>
              <p className="text-xl text-gray-600">
                Fiyatlandırma hakkında merak ettikleriniz
              </p>
            </div>
          </FadeInUp>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FadeInUp key={index} delay={index * 0.1}>
                <Accordion title={faq.question}>
                  <p className="text-gray-700">{faq.answer}</p>
                </Accordion>
              </FadeInUp>
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
              Ücretsiz deneme ile başlayın, istediğiniz zaman iptal edin. Hiçbir gizli ücret yok.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
                Ücretsiz Deneme Başlat
              </Link>
              <Link href="/contact" className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                Satış Ekibiyle Konuş
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
              <h3 className="text-lg font-semibold mb-4">Planlar</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Başlangıç</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Profesyonel</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Kurumsal</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Özel Çözümler</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">SSS</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">İletişim</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Teknik Destek</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Kariyer</Link></li>
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
