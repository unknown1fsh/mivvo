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
  ArrowRightIcon
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

const team = [
  {
    name: 'Dr. Ahmet Yılmaz',
    role: 'Kurucu & CEO',
    image: '👨‍💼',
    description: '15 yıllık otomotiv sektörü deneyimi. Yapay zeka ve makine öğrenmesi uzmanı.',
    expertise: ['Yapay Zeka', 'Otomotiv', 'İş Geliştirme']
  },
  {
    name: 'Elif Demir',
    role: 'CTO',
    image: '👩‍💻',
    description: 'Yazılım geliştirme ve sistem mimarisi konularında uzman. 10+ yıl deneyim.',
    expertise: ['Yazılım Geliştirme', 'Sistem Mimarisi', 'DevOps']
  },
  {
    name: 'Mehmet Kaya',
    role: 'AI Araştırma Direktörü',
    image: '👨‍🔬',
    description: 'Makine öğrenmesi ve görüntü işleme alanında doktora sahibi.',
    expertise: ['Makine Öğrenmesi', 'Görüntü İşleme', 'Derin Öğrenme']
  },
  {
    name: 'Ayşe Özkan',
    role: 'Müşteri Deneyimi Müdürü',
    image: '👩‍💼',
    description: 'Müşteri ilişkileri ve kullanıcı deneyimi tasarımı uzmanı.',
    expertise: ['UX/UI Tasarım', 'Müşteri İlişkileri', 'Pazarlama']
  }
]

const milestones = [
  {
    year: '2020',
    title: 'Kuruluş',
    description: 'Mivvo Expertiz\'in kuruluşu ve ilk AI algoritmalarının geliştirilmesi'
  },
  {
    year: '2021',
    title: 'İlk Prototip',
    description: 'Boya analizi için ilk AI modelinin başarıyla test edilmesi'
  },
  {
    year: '2022',
    title: 'Beta Sürüm',
    description: 'Seçili kullanıcılarla beta test sürecinin başlatılması'
  },
  {
    year: '2023',
    title: 'Lansman',
    description: 'Genel kullanıma açılması ve ilk 1000 müşteriye ulaşılması'
  },
  {
    year: '2024',
    title: 'Büyüme',
    description: '10.000+ analiz ve yeni özelliklerin eklenmesi'
  }
]

const achievements = [
  {
    icon: TrophyIcon,
    title: 'En İyi AI Startup',
    description: '2023 Türkiye Teknoloji Ödülleri',
    year: '2023'
  },
  {
    icon: StarIcon,
    title: 'Müşteri Memnuniyeti',
    description: '4.9/5 ortalama müşteri puanı',
    year: '2024'
  },
  {
    icon: ShieldCheckIcon,
    title: 'ISO 27001 Sertifikası',
    description: 'Bilgi güvenliği yönetim sistemi',
    year: '2023'
  },
  {
    icon: ChartBarIcon,
    title: '%99.9 Doğruluk',
    description: 'AI analiz doğruluk oranı',
    year: '2024'
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

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ekibimiz
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Alanında uzman profesyonellerden oluşan dinamik ekibimiz
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                    {member.image}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Yolculuğumuz
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mivvo Expertiz'in kuruluşundan bugüne kadar olan önemli kilometre taşları
              </p>
            </div>
          </FadeInUp>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500"></div>
            
            <StaggerContainer className="space-y-12">
              {milestones.map((milestone, index) => (
                <StaggerItem key={index}>
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                      <div className="card p-6">
                        <div className="text-2xl font-bold text-blue-600 mb-2">{milestone.year}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center relative z-10">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Başarılarımız
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Aldığımız ödüller ve elde ettiğimiz başarılar
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <achievement.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{achievement.description}</p>
                  <div className="text-blue-600 font-medium">{achievement.year}</div>
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
              <Link href="/careers" className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                Kariyer Fırsatları
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
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">Hakkımızda</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Kariyer</Link></li>
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
