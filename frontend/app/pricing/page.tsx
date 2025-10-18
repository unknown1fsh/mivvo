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
    name: 'Başlangıç Paketi',
    price: 149,
    credits: 150,
    bonus: 1,
    period: 'tek seferlik',
    description: 'İlk kez kullanıcılar için',
    features: [
      '150 kredi (150 TL değerinde)',
      '1 TL bonus kredi',
      '~3 Boya Analizi',
      '~2 Hasar Analizi',
      'Email destek',
      'Tüm analizlere erişim'
    ],
    limitations: [],
    popular: false,
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 'professional',
    name: 'Profesyonel Paket',
    price: 649,
    credits: 750,
    bonus: 101,
    period: 'tek seferlik',
    description: 'En popüler seçenek ⭐',
    features: [
      '750 kredi (750 TL değerinde)',
      '101 TL bonus kredi (%15.6)',
      '~15 Boya Analizi',
      '~10 Hasar Analizi',
      '~4 Kapsamlı Ekspertiz',
      'Öncelikli destek'
    ],
    limitations: [],
    popular: true,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'enterprise',
    name: 'Kurumsal Paket',
    price: 1199,
    credits: 1500,
    bonus: 301,
    period: 'tek seferlik',
    description: 'Galeri ve kurumsal müşteriler',
    features: [
      '1500 kredi (1500 TL değerinde)',
      '301 TL bonus kredi (%25.1)',
      '~30 Boya Analizi',
      '~21 Hasar Analizi',
      '~8 Kapsamlı Ekspertiz',
      '7/24 öncelikli destek',
      'Özel hesap yöneticisi'
    ],
    limitations: [],
    popular: false,
    color: 'from-purple-500 to-pink-600'
  }
]

const servicePricing = [
  {
    service: 'Boya Analizi',
    price: 399,
    description: 'AI destekli boya kalitesi ve renk analizi',
    features: ['1-5 resim analizi', 'Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi']
  },
  {
    service: 'Hasar Değerlendirmesi',
    price: 499,
    description: 'AI destekli hasar tespiti ve değerlendirme',
    features: ['1-5 resim analizi', 'Çarpışma hasarları', 'Çizik ve göçük analizi', 'Onarım maliyet tahmini']
  },
  {
    service: 'Motor Sesi Analizi',
    price: 299,
    description: 'Ses kaydı ile motor durumu AI analizi',
    features: ['Çoklu ses dosyası', 'Motor sağlık durumu', 'Anormallik tespiti', 'Detaylı rapor']
  },
  {
    service: 'Değer Tahmini',
    price: 299,
    description: 'AI tabanlı piyasa değeri hesaplama',
    features: ['Piyasa analizi', 'Değer hesaplama', 'Karşılaştırma', 'Detaylı rapor']
  },
  {
    service: 'Kapsamlı Ekspertiz',
    price: 899,
    originalPrice: 1496,
    discount: 597,
    description: 'Tüm analizleri içeren premium paket',
    features: ['Tüm analizler dahil', 'Boya + Hasar + Motor + Değer', 'Detaylı kapsamlı rapor', '597 TL tasarruf'],
    popular: true
  }
]

const faqs = [
  {
    question: 'Kredi sistemi nasıl çalışıyor?',
    answer: 'Kredi paketlerinden satın aldığınız kredilerle istediğiniz analiz hizmetini kullanabilirsiniz. 1 Kredi = 1 TL değerindedir. Her hizmetin farklı kredi maliyeti vardır. Örneğin Boya Analizi 399 kredi, Kapsamlı Ekspertiz 899 kredi tüketir.'
  },
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, banka kartı, banka havalesi ve mobil ödeme yöntemlerini kabul ediyoruz. Tüm ödemeler SSL ile güvenli şekilde şifrelenir ve işlenir.'
  },
  {
    question: 'Kredilerim ne kadar süre geçerli?',
    answer: 'Satın aldığınız kredilerin süresiz kullanım hakkı vardır. Hiçbir son kullanma tarihi yoktur, istediğiniz zaman kullanabilirsiniz.'
  },
  {
    question: 'Büyük paketlerde bonus ne kadar?',
    answer: 'Başlangıç paketinde %0.7, Profesyonel pakette %15.6, Kurumsal pakette ise %25.1 bonus kredi kazanırsınız. Büyük paket alarak daha fazla tasarruf edersiniz.'
  },
  {
    question: 'Kurumsal müşteriler için özel paket var mı?',
    answer: 'Evet, galeri, ekspertiz büroları ve kurumsal müşteriler için 1500 kredilik özel paketimiz bulunmaktadır. Daha büyük hacimler için özel fiyatlandırma da sunuyoruz. Bizimle iletişime geçin.'
  },
  {
    question: 'Kullanılmayan krediyi iade alabilir miyim?',
    answer: 'Satın alımdan sonraki 7 gün içinde ve hiçbir kredi kullanılmamışsa tam para iadesi yapılır. Kısmi kredi iadesi yapılmamaktadır.'
  }
]

export default function PricingPage() {

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
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Kredi satın alın, istediğiniz servisi kullanın. Büyük paketlerde daha fazla bonus kazanın!
            </p>
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
                      {plan.price}₺
                    </div>
                    <div className="text-gray-600 text-sm">
                      {plan.period}
                    </div>
                    {plan.bonus && plan.bonus > 0 && (
                      <div className="mt-2">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                          🎁 +{plan.bonus}₺ Bonus Kredi
                        </span>
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
                    Paketi Satın Al
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
              Analiz Hizmetleri
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AI destekli profesyonel araç analiz hizmetleri - Kredi ile kullanın
            </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicePricing.map((service, index) => (
              <StaggerItem key={index}>
                <div className={`card card-hover p-6 text-center relative ${service.popular ? 'ring-2 ring-blue-500 scale-105' : ''}`}>
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                        ⭐ En Avantajlı
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.service}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  
                  <div className="mb-4">
                    {service.originalPrice ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">{service.originalPrice}₺</div>
                        <div className="text-3xl font-bold gradient-text">{service.price}₺</div>
                        <div className="text-sm text-green-600 font-semibold">{service.discount}₺ tasarruf!</div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold gradient-text">{service.price}₺</div>
                    )}
                  </div>
                  
                  <ul className="text-sm text-gray-600 space-y-2 mb-6 text-left">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`btn ${service.popular ? 'btn-primary' : 'btn-secondary'} btn-md w-full`}>
                    Hemen Başla
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
