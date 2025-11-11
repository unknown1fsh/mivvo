'use client'

import { useState, useEffect } from 'react'
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
import { authService } from '@/services/authService'
import { pricingService } from '@/services/pricingService'

const pricingPlans = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    price: 399,
    credits: 400,
    bonus: 40,
    period: 'tek seferlik',
    description: 'İlk kez kullanıcılar için güçlü başlangıç',
    originalPrice: null,
    discount: null,
    features: [
      '400 kredi (400 TL değerinde) anında hesabında',
      '+40 TL hoş geldin bonusu ile %10 ekstra bakiye',
      '1 Boya Analizi veya 1 Motor + 1 Değer Tahmini için ideal',
      'Tüm yapay zekâ analiz modüllerine sınırsız erişim',
      'E-posta ve uygulama içi destek ile her adımda yanında'
    ],
    limitations: [],
    popular: false,
    color: 'from-gray-500 to-gray-600',
    badge: null
  },
  {
    id: 'professional',
    name: 'Profesyonel Paket',
    price: 949,
    credits: 1200,
    bonus: 180,
    period: 'tek seferlik',
    description: 'Büyüyen ekipler için en popüler seçim ⭐',
    originalPrice: 1099,
    discount: 150,
    features: [
      '1200 kredi (1200 TL değerinde) yoğun raporlar için hazır',
      '+180 TL profesyonel bonus ile %15 ek bakiye',
      '3 Boya + 1 Hasar Analizi kombinasyonunu tek pakette sun',
      'Öncelikli uzman hattı ile dakikalar içinde çözüm al',
      '7/24 WhatsApp desteği ve canlı takip bildirimleri'
    ],
    limitations: [],
    popular: true,
    color: 'from-blue-500 to-purple-600',
    badge: 'En Popüler'
  },
  {
    id: 'enterprise',
    name: 'Kurumsal Paket',
    price: 1799,
    credits: 2500,
    bonus: 450,
    period: 'tek seferlik',
    description: 'Galeri ve kurumsal müşteriler',
    originalPrice: 2199,
    discount: 400,
    features: [
      '2500 kredi (2500 TL değerinde) portföy yönetimine özel',
      '+450 TL sadakat bonusu ile %18 ek değer',
      'Aylık 6 Hasar + 4 Boya Analizi gibi hacimleri rahatça karşıla',
      '7/24 öncelikli destek ve SLA garantili çözüm',
      'Özel hesap yöneticisi, ekip onboarding ve toplu işlem indirimleri'
    ],
    limitations: [],
    popular: false,
    color: 'from-purple-500 to-pink-600',
    badge: 'Kurumsal'
  }
]

const servicePricing = [
  {
    service: 'Boya Analizi',
    price: 399,
    description: 'AI destekli boya kalitesi ve renk analizi',
    features: ['1-5 resim analizi', 'Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi'],
    popular: false,
    badge: null
  },
  {
    service: 'Hasar Değerlendirmesi',
    price: 499,
    description: 'AI destekli hasar tespiti ve değerlendirme',
    features: ['1-5 resim analizi', 'Çarpışma hasarları', 'Çizik ve göçük analizi', 'Onarım maliyet tahmini'],
    popular: false,
    badge: null
  },
  {
    service: 'Motor Sesi Analizi',
    price: 299,
    description: 'Ses kaydı ile motor durumu AI analizi',
    features: ['Çoklu ses dosyası', 'Motor sağlık durumu', 'Anormallik tespiti', 'Detaylı rapor'],
    popular: false,
    badge: null
  },
  {
    service: 'Değer Tahmini',
    price: 299,
    description: 'AI tabanlı piyasa değeri hesaplama',
    features: ['Piyasa analizi', 'Değer hesaplama', 'Karşılaştırma', 'Detaylı rapor'],
    popular: false,
    badge: null
  },
  {
    service: 'Kapsamlı Ekspertiz',
    price: 899,
    originalPrice: 1496,
    discount: 597,
    description: 'Tüm analizleri içeren premium paket',
    features: ['Tüm analizler dahil', 'Boya + Hasar + Motor + Değer', 'Detaylı kapsamlı rapor', '597 TL tasarruf'],
    popular: true,
    badge: 'En Avantajlı'
  }
]

const faqs = [
  {
    question: 'Kredi sistemi nasıl çalışıyor?',
    answer: 'Kredi paketlerinden satın aldığınız kredilerle istediğiniz analiz hizmetini kullanabilirsiniz. 1 Kredi = 1 TL değerindedir. Her hizmetin farklı kredi maliyeti vardır. Örneğin Boya Analizi 399 kredi, Hasar Analizi 499 kredi, Kapsamlı Ekspertiz 899 kredi tüketir.'
  },
  {
    question: 'Yılbaşı kampanyası ne kadar sürecek?',
    answer: 'Yılbaşı kampanyası sınırlı süre için geçerlidir. Başlangıç paketinde +40₺ bonus kredi, profesyonel pakette %15 ekstra bakiye, kurumsal pakette %18 sadakat bonusu kazanabilirsiniz. Kampanya bitmeden fırsatı kaçırmayın!'
  },
  {
    question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    answer: 'Kredi kartı, banka kartı, banka havalesi ve mobil ödeme yöntemlerini kabul ediyoruz. Tüm ödemeler SSL ile güvenli şekilde şifrelenir ve işlenir. Anında kredi aktarımı yapılır.'
  },
  {
    question: 'Kredilerim ne kadar süre geçerli?',
    answer: 'Satın aldığınız kredilerin süresiz kullanım hakkı vardır. Hiçbir son kullanma tarihi yoktur, istediğiniz zaman kullanabilirsiniz. Bonus krediler de aynı şekilde süresizdir.'
  },
  {
    question: 'İlk alışveriş indirimi nasıl alabilirim?',
    answer: 'Yeni kullanıcılara özel %10 ek indirim kampanyamız bulunmaktadır. İlk kredi paketi alışverişyerinizde bu indirim otomatik olarak uygulanır. Kampanya detayları için iletişime geçin.'
  },
  {
    question: 'Kurumsal müşteriler için özel paket var mı?',
    answer: 'Evet, galeri, ekspertiz büroları ve kurumsal müşteriler için 2500 kredilik özel paketimiz bulunmaktadır. %18 bonus kredi ve özel hesap yöneticisi ile büyük tasarruf sağlarsınız. Daha yüksek hacimler için ek indirimler de sunuyoruz.'
  },
  {
    question: 'Kullanılmayan krediyi iade alabilir miyim?',
    answer: 'Satın alımdan sonraki 7 gün içinde ve hiçbir kredi kullanılmamışsa tam para iadesi yapılır. Kısmi kredi iadesi yapılmamaktadır. Güven garantimiz kapsamında koşulsuz para iadesi sunuyoruz.'
  },
  {
    question: 'Kapsamlı Ekspertiz paketi ne kadar tasarruf sağlar?',
    answer: 'Kapsamlı Ekspertiz paketi (899₺) ile 597₺ tasarruf edersiniz! Normal fiyatlar: Boya Analizi (399₺) + Hasar Analizi (499₺) + Motor Sesi (299₺) + Değer Tahmini (299₺) = 1496₺. Paket fiyatı: 899₺. Tasarruf: 597₺ (%40 indirim).'
  }
]

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [pricingPackages, setPricingPackages] = useState<any[]>([])

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
    
    // Backend'ten paket bilgilerini çek
    fetchPricingPackages()
  }, [])
  
  const fetchPricingPackages = async () => {
    try {
      const packages = await pricingService.getPricingPackages()
      
      if (!Array.isArray(packages) || packages.length === 0) {
        console.warn('⚠️ PricingPage - Geçersiz paket verisi, fallback kullanılacak:', packages)
        setPricingPackages(pricingPlans)
        return
      }

      const normalizedPackages = packages.map((pkg: any) => ({
        ...pkg,
        features: Array.isArray(pkg.features) ? pkg.features : [],
        limitations: Array.isArray(pkg.limitations) ? pkg.limitations : [],
        color: pkg.color || 'from-blue-500 to-purple-600',
      }))

      setPricingPackages(normalizedPackages)
    } catch (error) {
      console.error('Pricing packages fetch error:', error)
      // Fallback olarak mevcut pricingPlans'ı kullan
      setPricingPackages(pricingPlans)
    }
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
            <div className="mb-6">
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                🎉 Yılbaşı Bonusları - %25&apos;e Varan Kredi Avantajı
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">Cazip Fiyatlar</span>
              <br />
              <span className="text-gray-800">Maksimum Tasarruf</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Yeni yıl kampanyamızla başlangıç paketinde avantajlı giriş fiyatı, profesyonel ve kurumsal paketlerde yükseltilmiş bonus krediler ve anında kullanım hazır bakiyeler sizi bekliyor.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 mb-8">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>7/24 WhatsApp Destek</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Anında Kredi Aktarımı</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Güvenli Ödeme</span>
              </div>
            </div>
            
            {/* Money Back Guarantee Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg animate-pulse">
              <ShieldCheckIcon className="w-6 h-6 mr-3" />
              %100 Para İade Garantisi - Raporunuz oluşmazsa bakiyeniz anında iade edilir
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(pricingPackages.length > 0 ? pricingPackages : pricingPlans).map((plan) => {
              const featureList = Array.isArray(plan.features) ? plan.features : []
              const limitationList = Array.isArray(plan.limitations) ? plan.limitations : []

              return (
                <StaggerItem key={plan.id}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`card card-hover p-8 text-center relative ${
                      plan.popular ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <CurrencyDollarIcon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      {plan.originalPrice ? (
                        <div>
                          <div className="text-sm text-gray-500 line-through">{plan.originalPrice}₺</div>
                          <div className="text-4xl font-bold gradient-text">{plan.price}₺</div>
                          <div className="text-sm text-green-600 font-semibold">🎁 {plan.discount}₺ tasarruf!</div>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-gray-900">
                          {plan.price}₺
                        </div>
                      )}
                      <div className="text-gray-600 text-sm mt-2">
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
                      {featureList.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {limitationList.map((limitation, index) => (
                        <li key={index} className="flex items-center">
                          <ClockIcon className="w-5 h-5 text-yellow-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-500">{limitation}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={user ? `/dashboard/purchase?package=${plan.id}` : "/register"}
                      className={`btn w-full btn-lg ${
                        plan.popular ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {user ? 'Satın Al' : 'Paketi Satın Al'}
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                  </motion.div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Special Offers */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                🎉 Özel Kampanyalar
              </h2>
              <p className="text-xl text-green-100 max-w-3xl mx-auto">
                Sınırlı süre için geçerli özel fırsatlar - Kaçırmayın!
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StaggerItem>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Başlangıç Turbo Bonusu</h3>
                <p className="text-green-100 mb-4">Başlangıç paketi alan herkese anında +40₺ bonus kredi</p>
                <div className="text-3xl font-bold text-white mb-2">+40₺</div>
                <div className="text-sm text-green-100">Kupon gerektirmez, yeni üyelerde otomatik uygulanır</div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Profesyonel Seviye Boostu</h3>
                <p className="text-green-100 mb-4">Profesyonel pakette %15 bonus ile her raporda daha fazla kredi</p>
                <div className="text-3xl font-bold text-white mb-2">%15</div>
                <div className="text-sm text-green-100">Satın alma sırasında bonusunuz otomatik yüklenir</div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 text-center border border-white/20">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Kurumsal Sadakat Programı</h3>
                <p className="text-green-100 mb-4">Kurumsal paketlerde %18 bonus ve özel hesap yöneticisi</p>
                <div className="text-3xl font-bold text-white mb-2">%18</div>
                <div className="text-sm text-green-100">Aylık 15+ rapor oluşturan galerilere ekstra kredi hediyesi</div>
              </div>
            </StaggerItem>
          </div>
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
                  {service.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-lg">
                        ⭐ {service.badge}
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
                  <Link href={user ? `/dashboard/purchase?package=${service.service.toLowerCase().replace(' ', '-')}` : "/register"} className={`btn ${service.popular ? 'btn-primary' : 'btn-secondary'} btn-md w-full`}>
                    {user ? 'Satın Al' : 'Hemen Başla'}
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
            <div className="mb-6">
              <span className="bg-white/20 text-white px-6 py-2 rounded-full text-sm font-semibold">
                ⏰ Sınırlı Süre - Yılbaşı Bonus Programı
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hemen Başlayın ve Tasarruf Edin!
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Başlangıç paketinde +40₺ bonus kredi, profesyonel pakette %15 ekstra bakiye ve kurumsal pakette %18 sadakat avantajıyla yeni yılın en yüksek kredi fırsatlarını yakalayın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href={user ? "/dashboard/purchase?package=professional" : "/register"} className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
                🎁 {user ? 'Bonus Kredi Al' : 'Bonus Kredi Al'}
              </Link>
              <Link href="/contact" className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                💬 WhatsApp Destek
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                <span>Anında Kredi Aktarımı</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                <span>7 Gün Para İadesi</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                <span>SSL Güvenli Ödeme</span>
              </div>
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
                <li><span className="text-gray-500 cursor-not-allowed">Kariyer (Yakında)</span></li>
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
