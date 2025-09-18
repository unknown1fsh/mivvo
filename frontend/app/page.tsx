'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon,
  SparklesIcon,
  CameraIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  StarIcon,
  UserGroupIcon,
  CogIcon,
  TruckIcon
} from '@heroicons/react/24/outline'

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const features = [
    {
      icon: SparklesIcon,
      title: 'Yapay Zeka Analizi',
      description: 'Gelişmiş AI algoritmaları ile araç resimlerinizi analiz ediyor, boya durumu ve hasarları tespit ediyoruz.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: ClockIcon,
      title: 'Hızlı Sonuçlar',
      description: 'Dakikalar içinde detaylı expertiz raporu alın. Geleneksel yöntemlerden çok daha hızlı.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Güvenilir Raporlar',
      description: 'Profesyonel expertiz standartlarında detaylı raporlar. Sigorta ve resmi işlemler için geçerli.',
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const services = [
    {
      name: 'Boya Analizi',
      price: '25₺',
      description: 'Araç boyasının durumu ve kalitesi analizi',
      icon: '🎨',
      features: ['Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi'],
      popular: false
    },
    {
      name: 'Hasar Değerlendirmesi',
      price: '35₺',
      description: 'Araç hasarlarının tespiti ve değerlendirmesi',
      icon: '🔧',
      features: ['Çarpışma hasarları', 'Çizik analizi', 'Onarım maliyeti'],
      popular: false
    },
    {
      name: 'Değer Tahmini',
      price: '20₺',
      description: 'Araç piyasa değeri tahmini',
      icon: '💰',
      features: ['Piyasa analizi', 'Değer hesaplama', 'Raporlama'],
      popular: false
    },
    {
      name: 'Tam Expertiz',
      price: '75₺',
      description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
      icon: '📋',
      features: ['Tüm analizler', 'Detaylı rapor', 'Uzman görüşü'],
      popular: true
    }
  ]

  const stats = [
    { number: '10K+', label: 'Analiz Edilen Araç' },
    { number: '99.9%', label: 'Doğruluk Oranı' },
    { number: '2dk', label: 'Ortalama Süre' },
    { number: '24/7', label: 'Hizmet' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Mivvo</span>
              <span className="text-lg font-semibold text-gray-700">Expertiz</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">Ana Sayfa</Link>
              <Link href="/services" className="text-gray-700 hover:text-blue-600 transition-colors">Hizmetler</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Fiyatlar</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Hakkımızda</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="btn btn-ghost btn-md">Giriş Yap</Link>
                <Link href="/register" className="btn btn-primary btn-md">Kayıt Ol</Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200"
            >
              <div className="px-4 py-4 space-y-4">
                <Link href="/" className="block text-gray-700 hover:text-blue-600 transition-colors">Ana Sayfa</Link>
                <Link href="/services" className="block text-gray-700 hover:text-blue-600 transition-colors">Hizmetler</Link>
                <Link href="/vin-lookup" className="block text-gray-700 hover:text-green-600 transition-colors flex items-center">
                  <TruckIcon className="w-4 h-4 mr-2" />
                  Şasi Sorgula
                </Link>
                <Link href="/pricing" className="block text-gray-700 hover:text-blue-600 transition-colors">Fiyatlar</Link>
                <Link href="/about" className="block text-gray-700 hover:text-blue-600 transition-colors">Hakkımızda</Link>
                <Link href="/contact" className="block text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
                <div className="pt-4 space-y-2">
                  <Link href="/login" className="block btn btn-ghost btn-md w-full">Giriş Yap</Link>
                  <Link href="/register" className="block btn btn-primary btn-md w-full">Kayıt Ol</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 animated-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-6">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Yapay Zeka Teknolojisi
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                <span className="gradient-text">Araç Expertizi</span>
                <br />
                <span className="text-gray-800">Artık Çok Kolay</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Araç resimlerinizi yükleyin, yapay zeka teknolojisi ile boya analizi, hasar değerlendirmesi 
                ve değer tahmini yapın. Profesyonel expertiz raporları alın.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/register" className="btn btn-primary btn-lg group">
                Hemen Başla
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/vin-lookup" className="btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white btn-lg flex items-center justify-center">
                <TruckIcon className="w-5 h-5 mr-2" />
                Şasi Sorgula
              </Link>
              <Link href="/services" className="btn btn-secondary btn-lg">
                Hizmetleri İncele
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Neden <span className="gradient-text">Mivvo Expertiz</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Yapay zeka teknolojisi ile araç analizini hızlı, güvenilir ve ekonomik hale getiriyoruz.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="card card-hover p-8 text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hizmetlerimiz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Araç ihtiyaçlarınıza göre özelleştirilmiş analiz paketleri sunuyoruz.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`card card-hover p-6 ${service.popular ? 'ring-2 ring-blue-500 relative' : ''}`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      En Popüler
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="text-3xl font-bold gradient-text mb-4">{service.price}</div>
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
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hemen Başlayın
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Araç expertizi için beklemeyin. Yapay zeka teknolojisi ile hızlı ve güvenilir sonuçlar alın.
            </p>
            <Link href="/register" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
              Ücretsiz Hesap Oluştur
            </Link>
          </motion.div>
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
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-sm">in</span>
                </div>
              </div>
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
