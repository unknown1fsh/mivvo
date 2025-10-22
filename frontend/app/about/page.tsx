'use client'

import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  UserGroupIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  GlobeAltIcon,
  HeartIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowRightIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'

const stats = [
  { number: '10K+', label: 'Analiz Edilen Araç', icon: ChartBarIcon },
  { number: '99.9%', label: 'Doğruluk Oranı', icon: ShieldCheckIcon },
  { number: '2dk', label: 'Ortalama Süre', icon: ClockIcon },
  { number: '24/7', label: 'Hizmet', icon: GlobeAltIcon }
]

const values = [
  {
    icon: LightBulbIcon,
    title: 'İnovasyon',
    description: 'Yapay zeka teknolojisini kullanarak araç expertizi alanında devrim yaratıyoruz.',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenilirlik',
    description: 'Her analizimizde en yüksek doğruluk oranını hedefliyoruz.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: HeartIcon,
    title: 'Müşteri Odaklılık',
    description: 'Müşteri memnuniyeti bizim için her şeyden önce gelir.',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: TrophyIcon,
    title: 'Mükemmellik',
    description: 'Sürekli gelişim ve kalite artışı için çalışıyoruz.',
    color: 'from-purple-500 to-indigo-500'
  }
]

const advantages = [
  {
    icon: ClockIcon,
    title: 'Hızlı Sonuç',
    description: 'Geleneksel expertiz 1-2 gün sürerken, bizim sistemimizde sadece 2 dakika',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: ShieldCheckIcon,
    title: '%100 Para İade Garantisi',
    description: 'Raporunuz oluşmazsa bakiyeniz anında iade edilir',
    color: 'from-green-500 to-emerald-500',
    highlight: true
  },
  {
    icon: GlobeAltIcon,
    title: '7/24 Hizmet',
    description: 'İstediğiniz zaman, istediğiniz yerden analiz yapabilirsiniz',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: ChartBarIcon,
    title: '%99.9 Doğruluk',
    description: 'AI teknolojimiz ile en yüksek doğruluk oranı',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Büyük Tasarruf',
    description: 'Geleneksel expertiz 4.000-12.000₺, bizim fiyatımız 299-899₺',
    color: 'from-green-500 to-emerald-500',
    highlight: true
  }
]

const technologyFeatures = [
  {
    icon: SparklesIcon,
    title: 'Yapay Zeka Teknolojisi',
    description: 'En gelişmiş makine öğrenmesi algoritmaları ile analiz',
    details: ['Derin öğrenme modelleri', 'Görüntü işleme', 'Ses analizi']
  },
  {
    icon: ShieldCheckIcon,
    title: 'Güvenlik & Gizlilik',
    description: 'Verileriniz en yüksek güvenlik standartlarında korunur',
    details: ['SSL şifreleme', 'ISO 27001 sertifikası', 'KVKK uyumlu']
  },
  {
    icon: ChartBarIcon,
    title: 'Sürekli Gelişim',
    description: 'AI modellerimiz sürekli öğrenerek daha da gelişiyor',
    details: ['Otomatik model güncellemeleri', 'Performans optimizasyonu', 'Yeni özellik eklemeleri']
  }
]

const testimonials = [
  {
    name: 'Mehmet K.',
    rating: 5,
    comment: 'Çok hızlı ve doğru sonuç aldım. Geleneksel expertizden çok daha pratik.',
    date: '2024-01-15',
    vehicle: '2020 BMW 320i'
  },
  {
    name: 'Ayşe D.',
    rating: 5,
    comment: 'Para iade garantisi sayesinde hiç endişe etmeden denedim. Harika bir hizmet!',
    date: '2024-01-10',
    vehicle: '2019 Mercedes C200'
  },
  {
    name: 'Ali M.',
    rating: 5,
    comment: 'AI teknolojisi gerçekten etkileyici. Sonuçlar çok detaylı ve güvenilir.',
    date: '2024-01-08',
    vehicle: '2021 Audi A4'
  },
  {
    name: 'Fatma S.',
    rating: 5,
    comment: '7/24 hizmet vermeleri çok büyük avantaj. Gece bile analiz yapabiliyorum.',
    date: '2024-01-05',
    vehicle: '2020 Volkswagen Passat'
  },
  {
    name: 'Can Y.',
    rating: 5,
    comment: 'Fiyatlar çok uygun ve kalite mükemmel. Kesinlikle tavsiye ederim.',
    date: '2024-01-03',
    vehicle: '2018 Ford Focus'
  },
  {
    name: 'Zeynep A.',
    rating: 5,
    comment: 'Müşteri hizmetleri çok ilgili. Her sorumu anında yanıtladılar.',
    date: '2024-01-01',
    vehicle: '2019 Toyota Corolla'
  }
]

export default function AboutPage() {
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
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Fiyatlar</Link>
              <Link href="/about" className="text-blue-600 font-medium">Hakkımızda</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeInUp>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                <span className="gradient-text">Hakkımızda</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Yapay zeka teknolojisi ile araç expertizi alanında devrim yaratıyoruz. 
                Geleceğin teknolojisini bugünün ihtiyaçlarına uyarlıyoruz.
              </p>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StaggerItem key={index}>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeInUp>
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Misyonumuz
                </h2>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Araç expertizi sürecini demokratikleştirerek, herkesin erişebileceği, 
                  hızlı ve güvenilir analiz hizmetleri sunmak. Yapay zeka teknolojisinin 
                  gücünü kullanarak geleneksel yöntemlerin ötesine geçiyoruz.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Teknoloji odaklı çözümler</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Müşteri memnuniyeti odaklı yaklaşım</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3" />
                    <span className="text-gray-700">Sürekli inovasyon ve gelişim</span>
                  </div>
                </div>
              </div>
            </FadeInUp>
            
            <FadeInUp delay={0.2}>
              <div className="relative">
                <div className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">AI Teknolojisi</h3>
                    <p className="text-blue-100">Geleceğin expertizi bugün</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-12 h-12 text-white" />
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Değerlerimiz
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Çalışma şeklimizi ve kararlarımızı yönlendiren temel değerler
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-8 text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Neden Bizi Seçmeli?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Geleneksel expertizden farklı olarak sunduğumuz benzersiz avantajlar
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => (
              <StaggerItem key={index}>
                <div className={`card card-hover p-8 text-center group relative ${advantage.highlight ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}>
                  {advantage.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      ⭐ ÖNE ÇIKAN
                    </div>
                  )}
                  <div className={`w-16 h-16 bg-gradient-to-r ${advantage.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <advantage.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{advantage.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{advantage.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Comparison Table */}
          <FadeInUp delay={0.3}>
            <div className="mt-20">
              <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
                Geleneksel Expertiz vs Mivvo Expertiz
              </h3>
              <div className="text-center mb-12">
                <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg mb-4">
                  <CurrencyDollarIcon className="w-6 h-6 mr-2" />
                  Geleneksel Expertiz: 4.000-12.000₺
                </div>
                <div className="text-2xl text-gray-600 mb-2">VS</div>
                <div className="inline-flex items-center px-6 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                  <CurrencyDollarIcon className="w-6 h-6 mr-2" />
                  Mivvo Expertiz: 299-899₺
                </div>
                <div className="mt-4">
                  <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-lg font-bold">
                    🎉 3.700-11.100₺ TASARRUF!
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Özellik</th>
                        <th className="px-6 py-4 text-center font-semibold">Geleneksel Expertiz</th>
                        <th className="px-6 py-4 text-center font-semibold">Mivvo Expertiz</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Süre</td>
                        <td className="px-6 py-4 text-center text-gray-600">1-2 gün</td>
                        <td className="px-6 py-4 text-center text-green-600 font-semibold">2 dakika</td>
                      </tr>
                      <tr className="hover:bg-gray-50 bg-red-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Maliyet</td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-red-600 font-bold text-lg">4.000-12.000₺</div>
                          <div className="text-xs text-gray-500">Geleneksel expertiz</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-green-600 font-bold text-lg">299-899₺</div>
                          <div className="text-xs text-green-500">Mivvo Expertiz</div>
                          <div className="mt-2">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                              💰 3.700-11.100₺ TASARRUF!
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Erişilebilirlik</td>
                        <td className="px-6 py-4 text-center text-gray-600">Randevu gerekli</td>
                        <td className="px-6 py-4 text-center text-green-600 font-semibold">7/24 online</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Doğruluk</td>
                        <td className="px-6 py-4 text-center text-gray-600">%85-90</td>
                        <td className="px-6 py-4 text-center text-green-600 font-semibold">%99.9</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">Para İade</td>
                        <td className="px-6 py-4 text-center text-gray-600">Yok</td>
                        <td className="px-6 py-4 text-center text-green-600 font-semibold">%100 Garanti</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Teknolojimiz
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                En gelişmiş yapay zeka teknolojisi ile güvenilir analiz hizmetleri
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {technologyFeatures.map((feature, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-8 h-full">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center text-gray-700">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Müşteri Görüşleri
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Binlerce memnun müşterimizin deneyimleri
              </p>
              <div className="mt-6 flex items-center justify-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-3 text-2xl font-bold text-gray-900">4.9/5</span>
                <span className="ml-2 text-gray-600">(10,000+ değerlendirme)</span>
              </div>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6 h-full">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">{testimonial.date}</span>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.comment}"</p>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.vehicle}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Bizimle Çalışın
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Yapay zeka teknolojisi ile araç expertizi alanında devrim yaratmaya katılın. 
              Geleceğin teknolojisini birlikte şekillendirelim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
                İletişime Geç
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Link>
              <span className="btn border-white text-white opacity-50 cursor-not-allowed btn-lg">
                Kariyer Fırsatları (Yakında)
              </span>
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
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><span className="text-gray-500 cursor-not-allowed">Kariyer (Yakında)</span></li>
                <li><Link href="/press" className="hover:text-white transition-colors">Basın</Link></li>
                <li><Link href="/investors" className="hover:text-white transition-colors">Yatırımcılar</Link></li>
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
              <h3 className="text-lg font-semibold mb-4">Yasal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Gizlilik</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Çerez Politikası</Link></li>
                <li><Link href="/gdpr" className="hover:text-white transition-colors">KVKK</Link></li>
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
