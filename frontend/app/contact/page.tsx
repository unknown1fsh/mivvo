'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required('Ad soyad zorunludur'),
  email: yup.string().email('Geçerli bir email adresi giriniz').required('Email zorunludur'),
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, 'Geçerli bir telefon numarası giriniz'),
  company: yup.string(),
  subject: yup.string().required('Konu zorunludur'),
  message: yup.string().min(10, 'Mesaj en az 10 karakter olmalıdır').required('Mesaj zorunludur'),
  inquiryType: yup.string().required('İletişim türü seçiniz'),
})

type FormData = yup.InferType<typeof schema>

const contactInfo = [
  {
    icon: PhoneIcon,
    title: 'Telefon',
    details: ['+90 212 555 0123', '+90 532 555 0123'],
    description: 'Pazartesi - Cuma: 09:00 - 18:00',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: EnvelopeIcon,
    title: 'Email',
    details: ['info@mivvo.com', 'destek@mivvo.com'],
    description: '24 saat içinde yanıt veriyoruz',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: MapPinIcon,
    title: 'Adres',
    details: ['Maslak Mahallesi', 'Büyükdere Caddesi No:123', 'Sarıyer/İstanbul'],
    description: 'Ofisimizi ziyaret edebilirsiniz',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: ClockIcon,
    title: 'Çalışma Saatleri',
    details: ['Pazartesi - Cuma: 09:00 - 18:00', 'Cumartesi: 10:00 - 16:00'],
    description: 'Pazar günleri kapalıyız',
    color: 'from-orange-500 to-red-500'
  }
]

const inquiryTypes = [
  {
    id: 'general',
    label: 'Genel Bilgi',
    description: 'Genel sorularınız için'
  },
  {
    id: 'technical',
    label: 'Teknik Destek',
    description: 'Teknik sorunlarınız için'
  },
  {
    id: 'sales',
    label: 'Satış',
    description: 'Ürün ve hizmetlerimiz hakkında'
  },
  {
    id: 'partnership',
    label: 'İş Birliği',
    description: 'Ortaklık teklifleri için'
  },
  {
    id: 'media',
    label: 'Medya',
    description: 'Basın ve medya soruları'
  },
  {
    id: 'career',
    label: 'Kariyer',
    description: 'İş başvuruları için'
  }
]

const faqs = [
  {
    question: 'Ne kadar sürede yanıt alırım?',
    answer: 'Genel sorularınıza 24 saat içinde, teknik destek taleplerinize ise 4 saat içinde yanıt veriyoruz.'
  },
  {
    question: 'Hangi iletişim kanallarını kullanabilirim?',
    answer: 'Telefon, email, canlı destek ve sosyal medya hesaplarımızdan bize ulaşabilirsiniz.'
  },
  {
    question: 'Acil durumlar için özel bir hat var mı?',
    answer: 'Evet, kritik sistem sorunları için 7/24 acil destek hattımız mevcuttur.'
  },
  {
    question: 'Şirket ziyareti yapabilir miyim?',
    answer: 'Tabii ki! Randevu alarak ofisimizi ziyaret edebilir, ekibimizle tanışabilirsiniz.'
  }
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // TODO: API call to send contact form
      console.log('Contact form data:', data)
      toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
      setIsSubmitted(true)
      reset()
    } catch (error) {
      toast.error('Mesaj gönderilemedi! Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Mesajınız Gönderildi!</h1>
            <p className="text-gray-600 mb-6">
              Mesajınız başarıyla alındı. En kısa sürede size dönüş yapacağız. 
              Teşekkür ederiz!
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-primary btn-lg w-full"
              >
                Yeni Mesaj Gönder
              </button>
              <Link href="/" className="btn btn-secondary w-full">
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
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
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Fiyatlar</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">Hakkımızda</Link>
              <Link href="/contact" className="text-blue-600 font-medium">İletişim</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">İletişime Geçin</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sorularınız mı var? Yardıma mı ihtiyacınız var? Bizimle iletişime geçin, 
              size en kısa sürede yardımcı olalım.
            </p>
          </FadeInUp>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6 text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <info.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-700 text-sm">{detail}</p>
                    ))}
                  </div>
                  <p className="text-gray-500 text-xs">{info.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <FadeInUp>
              <div className="card p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mesaj Gönderin</h2>
                    <p className="text-gray-600">Size en kısa sürede dönüş yapacağız</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Ad Soyad *
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register('name')}
                          type="text"
                          id="name"
                          className="input w-full pl-10"
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register('email')}
                          type="email"
                          id="email"
                          className="input w-full pl-10"
                          placeholder="ornek@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register('phone')}
                          type="tel"
                          id="phone"
                          className="input w-full pl-10"
                          placeholder="+90 555 123 45 67"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                        Şirket
                      </label>
                      <div className="relative">
                        <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          {...register('company')}
                          type="text"
                          id="company"
                          className="input w-full pl-10"
                          placeholder="Şirket Adı"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inquiryType" className="block text-sm font-medium text-gray-700 mb-2">
                      İletişim Türü *
                    </label>
                    <select
                      {...register('inquiryType')}
                      id="inquiryType"
                      className="input w-full"
                    >
                      <option value="">Seçiniz</option>
                      {inquiryTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label} - {type.description}
                        </option>
                      ))}
                    </select>
                    {errors.inquiryType && (
                      <p className="mt-1 text-sm text-red-600">{errors.inquiryType.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Konu *
                    </label>
                    <input
                      {...register('subject')}
                      type="text"
                      id="subject"
                      className="input w-full"
                      placeholder="Mesajınızın konusu"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={6}
                      className="input w-full resize-none"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary btn-lg w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Gönderiliyor...
                      </div>
                    ) : (
                      <>
                        Mesaj Gönder
                        <PaperAirplaneIcon className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </FadeInUp>

            {/* Additional Info */}
            <FadeInUp delay={0.2}>
              <div className="space-y-8">
                {/* Quick Contact */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Hızlı İletişim</h3>
                  <div className="space-y-4">
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <PhoneIcon className="w-6 h-6 text-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Acil Destek</p>
                        <p className="text-sm text-gray-600">+90 532 555 0123</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <EnvelopeIcon className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Email Destek</p>
                        <p className="text-sm text-gray-600">destek@mivvo.com</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <GlobeAltIcon className="w-6 h-6 text-purple-600 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Canlı Destek</p>
                        <p className="text-sm text-gray-600">7/24 Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Sıkça Sorulan Sorular</h3>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                        <p className="text-sm text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Office Hours */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Ofis Saatleri</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pazartesi - Cuma</span>
                      <span className="font-medium">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cumartesi</span>
                      <span className="font-medium">10:00 - 16:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pazar</span>
                      <span className="font-medium text-red-600">Kapalı</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Ofisimizi Ziyaret Edin</h2>
              <p className="text-xl text-gray-600">Randevu alarak ofisimizi ziyaret edebilirsiniz</p>
            </div>
          </FadeInUp>

          <div className="card p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Adres Bilgileri</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPinIcon className="w-6 h-6 text-blue-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Mivvo Expertiz A.Ş.</p>
                      <p className="text-gray-600">Maslak Mahallesi</p>
                      <p className="text-gray-600">Büyükdere Caddesi No:123</p>
                      <p className="text-gray-600">Sarıyer/İstanbul 34485</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <PhoneIcon className="w-6 h-6 text-green-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Telefon</p>
                      <p className="text-gray-600">+90 212 555 0123</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <EnvelopeIcon className="w-6 h-6 text-purple-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">info@mivvo.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <MapPinIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Harita burada görünecek</p>
                  <p className="text-sm">Google Maps entegrasyonu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hemen İletişime Geçin
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Sorularınız için beklemeyin. Uzman ekibimiz size yardımcı olmaya hazır.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:+905325550123" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
                Hemen Ara
              </a>
              <a href="mailto:info@mivvo.com" className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                Email Gönder
              </a>
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
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li>+90 212 555 0123</li>
                <li>info@mivvo.com</li>
                <li>Maslak, İstanbul</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Destek</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Yardım Merkezi</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">SSS</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
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
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
