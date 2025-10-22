'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { motion } from 'framer-motion'
import { 
  SparklesIcon,
  ClockIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  LightBulbIcon,
  HeartIcon,
  TrophyIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  LinkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { toast } from 'react-hot-toast'
import { careerService } from '@/services/careerService'

function CareersPagePlaceholder() {
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
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
              <span className="text-gray-400 cursor-not-allowed">Kariyer</span>
            </nav>
          </div>
        </div>
      </header>

      {/* Coming Soon Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <ClockIcon className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                <span className="gradient-text">Kariyer Fırsatları</span>
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
                Yakında!
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Mivvo Expertiz ailesine katılmak için heyecanlı mısınız? 
                Kariyer sayfamız yakında açılacak. Şimdilik bizimle iletişime geçebilirsiniz.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Bizimle İletişime Geçin
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-center justify-center p-6 bg-blue-50 rounded-xl">
                  <EnvelopeIcon className="w-8 h-8 text-blue-600 mr-4" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">sce@scegrup.com</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center p-6 bg-green-50 rounded-xl">
                  <PhoneIcon className="w-8 h-8 text-green-600 mr-4" />
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">Telefon</h4>
                    <p className="text-gray-600">0850 888 1 889</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Aradığımız Pozisyonlar:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Frontend Developer
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Backend Developer
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    AI Engineer
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Product Manager
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Marketing Specialist
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn btn-primary btn-lg group">
                İletişim Formu
                <ArrowLeftIcon className="w-5 h-5 ml-2 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <Link href="/" className="btn btn-secondary btn-lg">
                Ana Sayfaya Dön
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
              <h3 className="text-lg font-semibold mb-4">Kariyer</h3>
              <ul className="space-y-2 text-gray-400">
                <li><span className="text-gray-500">Açık Pozisyonlar (Yakında)</span></li>
                <li><span className="text-gray-500">Başvuru Süreci (Yakında)</span></li>
                <li><span className="text-gray-500">Yan Haklar (Yakında)</span></li>
                <li><span className="text-gray-500">Ekip Kültürü (Yakında)</span></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  0850 888 1 889
                </li>
                <li className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  sce@scegrup.com
                </li>
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
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const schema = yup.object({
  name: yup.string().required('Ad soyad zorunludur'),
  email: yup.string().email('Geçerli bir email adresi giriniz').required('Email zorunludur'),
  phone: yup.string().required('Telefon numarası zorunludur'),
  position: yup.string().required('Pozisyon seçimi zorunludur'),
  department: yup.string(),
  experience: yup.number().min(0, 'Deneyim yılı 0\'dan küçük olamaz'),
  education: yup.string(),
  coverLetter: yup.string(),
  linkedIn: yup.string().url('Geçerli bir URL giriniz'),
  portfolio: yup.string().url('Geçerli bir URL giriniz')
})

type FormData = yup.InferType<typeof schema>

const openPositions = [
  {
    id: 'frontend-developer',
    title: 'Frontend Developer',
    department: 'Teknoloji',
    type: 'Tam Zamanlı',
    location: 'İstanbul / Uzaktan',
    experience: '2-4 yıl',
    description: 'React, Next.js ve TypeScript ile modern web uygulamaları geliştirme',
    requirements: [
      'React ve Next.js deneyimi',
      'TypeScript bilgisi',
      'Tailwind CSS kullanımı',
      'Git versiyon kontrolü',
      'API entegrasyonu deneyimi'
    ],
    benefits: ['Esnek çalışma saatleri', 'Uzaktan çalışma', 'Eğitim bütçesi', 'Sağlık sigortası']
  },
  {
    id: 'backend-developer',
    title: 'Backend Developer',
    department: 'Teknoloji',
    type: 'Tam Zamanlı',
    location: 'İstanbul / Uzaktan',
    experience: '3-5 yıl',
    description: 'Node.js, TypeScript ve PostgreSQL ile güçlü backend sistemleri geliştirme',
    requirements: [
      'Node.js ve Express.js deneyimi',
      'TypeScript bilgisi',
      'PostgreSQL veritabanı deneyimi',
      'RESTful API tasarımı',
      'Prisma ORM kullanımı'
    ],
    benefits: ['Esnek çalışma saatleri', 'Uzaktan çalışma', 'Eğitim bütçesi', 'Sağlık sigortası']
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    department: 'Teknoloji',
    type: 'Tam Zamanlı',
    location: 'İstanbul / Uzaktan',
    experience: '2-4 yıl',
    description: 'Makine öğrenmesi ve görüntü işleme algoritmaları geliştirme',
    requirements: [
      'Python ve TensorFlow/PyTorch deneyimi',
      'Görüntü işleme bilgisi',
      'Makine öğrenmesi algoritmaları',
      'OpenCV kullanımı',
      'Model deployment deneyimi'
    ],
    benefits: ['Esnek çalışma saatleri', 'Uzaktan çalışma', 'Eğitim bütçesi', 'Sağlık sigortası']
  },
  {
    id: 'product-manager',
    title: 'Product Manager',
    department: 'Ürün',
    type: 'Tam Zamanlı',
    location: 'İstanbul',
    experience: '3-5 yıl',
    description: 'Ürün stratejisi ve roadmap yönetimi',
    requirements: [
      'Ürün yönetimi deneyimi',
      'Agile/Scrum metodolojisi',
      'Veri analizi becerileri',
      'Kullanıcı deneyimi odaklı düşünme',
      'İletişim ve liderlik becerileri'
    ],
    benefits: ['Esnek çalışma saatleri', 'Performans bonusu', 'Eğitim bütçesi', 'Sağlık sigortası']
  },
  {
    id: 'marketing-specialist',
    title: 'Marketing Specialist',
    department: 'Pazarlama',
    type: 'Tam Zamanlı',
    location: 'İstanbul / Uzaktan',
    experience: '2-3 yıl',
    description: 'Dijital pazarlama ve sosyal medya yönetimi',
    requirements: [
      'Dijital pazarlama deneyimi',
      'Sosyal medya yönetimi',
      'Google Analytics ve Ads',
      'İçerik üretimi',
      'SEO/SEM bilgisi'
    ],
    benefits: ['Esnek çalışma saatleri', 'Uzaktan çalışma', 'Eğitim bütçesi', 'Sağlık sigortası']
  }
]

const whyWorkWithUs = [
  {
    icon: LightBulbIcon,
    title: 'İnovatif Teknoloji',
    description: 'Yapay zeka ve makine öğrenmesi alanında çığır açan projelerde çalışın',
    color: 'from-yellow-500 to-orange-500'
  },
  {
    icon: HeartIcon,
    title: 'Şirket Kültürü',
    description: 'Açık iletişim, takım çalışması ve sürekli öğrenme odaklı ortam',
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: TrophyIcon,
    title: 'Kariyer Gelişimi',
    description: 'Kişisel ve profesyonel gelişiminiz için eğitim ve mentorluk desteği',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: GlobeAltIcon,
    title: 'Esnek Çalışma',
    description: 'Uzaktan çalışma, esnek saatler ve work-life balance',
    color: 'from-green-500 to-teal-500'
  }
]

const benefits = [
  {
    icon: CurrencyDollarIcon,
    title: 'Rekabetçi Maaş',
    description: 'Piyasa standartlarının üzerinde maaş ve performans bonusu'
  },
  {
    icon: ShieldCheckIcon,
    title: 'Sağlık Sigortası',
    description: 'Kapsamlı sağlık sigortası ve aile üyeleri için ek paketler'
  },
  {
    icon: AcademicCapIcon,
    title: 'Eğitim Desteği',
    description: 'Konferans, kurs ve sertifika programları için eğitim bütçesi'
  },
  {
    icon: ClockIcon,
    title: 'Esnek Çalışma',
    description: 'Uzaktan çalışma, hibrit model ve esnek çalışma saatleri'
  },
  {
    icon: TrophyIcon,
    title: 'Performans Bonusu',
    description: 'Yıllık performans değerlendirmesi ve başarı bonusları'
  },
  {
    icon: HeartIcon,
    title: 'Sosyal Aktiviteler',
    description: 'Takım etkinlikleri, şirket piknikleri ve sosyal sorumluluk projeleri'
  }
]

const applicationProcess = [
  {
    step: 1,
    title: 'Başvuru',
    description: 'Online formu doldurun ve CV\'nizi yükleyin',
    duration: '5 dakika'
  },
  {
    step: 2,
    title: 'İnceleme',
    description: 'CV\'nizi ve başvurunuzu değerlendiriyoruz',
    duration: '3-5 gün'
  },
  {
    step: 3,
    title: 'Mülakat',
    description: 'Teknik ve kültürel uyum mülakatları',
    duration: '1-2 hafta'
  },
  {
    step: 4,
    title: 'Karar',
    description: 'Sonuç bildirimi ve işe başlama süreci',
    duration: '1 hafta'
  }
]

const teamCulture = [
  {
    title: 'Açık İletişim',
    description: 'Her seviyede şeffaf ve açık iletişim kültürü',
    icon: '💬'
  },
  {
    title: 'Takım Çalışması',
    description: 'Birlikte başarma ve karşılıklı destekleme',
    icon: '🤝'
  },
  {
    title: 'Sürekli Öğrenme',
    description: 'Yeni teknolojiler ve metodolojiler öğrenme',
    icon: '📚'
  },
  {
    title: 'İnovasyon',
    description: 'Yaratıcı çözümler ve yenilikçi yaklaşımlar',
    icon: '💡'
  }
]

export default function CareersPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      let resumeUrl = ''
      
      // CV yükleme
      if (resumeFile) {
        const uploadResponse = await careerService.uploadResume(resumeFile)
        resumeUrl = uploadResponse.resumeUrl
      }

      const applicationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        position: selectedPosition || data.position,
        department: data.department || undefined,
        experience: data.experience || undefined,
        education: data.education || undefined,
        coverLetter: data.coverLetter || undefined,
        resumeUrl: resumeUrl || undefined,
        linkedIn: data.linkedIn || undefined,
        portfolio: data.portfolio || undefined
      }

      await careerService.submitApplication(applicationData)
      toast.success('Başvurunuz başarıyla gönderildi! En kısa sürede size dönüş yapacağız.')
      setIsSubmitted(true)
      reset()
      setResumeFile(null)
    } catch (error: any) {
      toast.error(error.message || 'Başvuru gönderilemedi! Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('CV dosyası 5MB\'dan küçük olmalıdır')
        return
      }
      
      // Dosya tipi kontrolü
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Sadece PDF, DOC ve DOCX dosyaları kabul edilir')
        return
      }
      
      setResumeFile(file)
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
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Başvurunuz Gönderildi!</h1>
            <p className="text-gray-600 mb-6">
              Başvurunuz başarıyla alındı. En kısa sürede size dönüş yapacağız. 
              Teşekkür ederiz!
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setIsSubmitted(false)}
                className="btn btn-primary btn-lg w-full"
              >
                Yeni Başvuru Gönder
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
              <Link href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">İletişim</Link>
              <Link href="/careers" className="text-blue-600 font-medium">Kariyer</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="gradient-text">Bizimle Çalışın</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Yapay zeka teknolojisi ile araç expertizi alanında devrim yaratmaya katılın. 
              Geleceğin teknolojisini birlikte şekillendirelim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#open-positions" className="btn btn-primary btn-lg group">
                Açık Pozisyonları Gör
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#application-form" className="btn btn-secondary btn-lg">
                Hemen Başvur
              </a>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Neden <span className="gradient-text">Bizimle</span> Çalışmalısınız?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Teknoloji odaklı, yenilikçi ve büyüyen bir ekibin parçası olun
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyWorkWithUs.map((item, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-8 text-center group">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Açık <span className="gradient-text">Pozisyonlar</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Yetenekli profesyonelleri ekibimize katılmaya davet ediyoruz
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="space-y-6">
            {openPositions.map((position, index) => (
              <StaggerItem key={position.id}>
                <div className="card card-hover p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <BriefcaseIcon className="w-6 h-6 text-blue-600 mr-3" />
                        <h3 className="text-2xl font-bold text-gray-900">{position.title}</h3>
                        <span className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {position.type}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-1" />
                          {position.location}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {position.experience}
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {position.department}
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{position.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Gereksinimler:</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {position.requirements.map((req, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Yan Haklar:</h4>
                        <div className="flex flex-wrap gap-2">
                          {position.benefits.map((benefit, idx) => (
                            <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:ml-8">
                      <button
                        onClick={() => {
                          setSelectedPosition(position.title)
                          setValue('position', position.title)
                          document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="btn btn-primary btn-lg w-full lg:w-auto"
                      >
                        Bu Pozisyona Başvur
                      </button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Başvuru <span className="gradient-text">Süreci</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Başvurunuzdan işe başlamaya kadar olan süreç
              </p>
            </div>
          </FadeInUp>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {applicationProcess.map((step, index) => (
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
                    <span className="text-2xl font-bold text-white">{step.step}</span>
                  </div>
                  {index < applicationProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform translate-x-4"></div>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-2">{step.description}</p>
                <div className="text-sm text-blue-600 font-medium">{step.duration}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Culture */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ekip <span className="gradient-text">Kültürü</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Birlikte çalıştığımız değerler ve kültürümüz
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamCulture.map((culture, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6 text-center">
                  <div className="text-4xl mb-4">{culture.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{culture.title}</h3>
                  <p className="text-gray-600 text-sm">{culture.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Yan <span className="gradient-text">Haklar</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Çalışanlarımız için sunduğumuz avantajlar
              </p>
            </div>
          </FadeInUp>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <StaggerItem key={index}>
                <div className="card card-hover p-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInUp>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Başvuru <span className="gradient-text">Formu</span>
              </h2>
              <p className="text-xl text-gray-600">
                Hayalinizdeki pozisyona başvurmak için formu doldurun
              </p>
            </div>
          </FadeInUp>

          <div className="card p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Soyad *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    id="name"
                    className="input w-full"
                    placeholder="Adınız Soyadınız"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    className="input w-full"
                    placeholder="ornek@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    id="phone"
                    className="input w-full"
                    placeholder="+90 555 123 45 67"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                    Pozisyon *
                  </label>
                  <select
                    {...register('position')}
                    id="position"
                    className="input w-full"
                    value={selectedPosition}
                    onChange={(e) => {
                      setSelectedPosition(e.target.value)
                      setValue('position', e.target.value)
                    }}
                  >
                    <option value="">Pozisyon seçiniz</option>
                    {openPositions.map((pos) => (
                      <option key={pos.id} value={pos.title}>
                        {pos.title} - {pos.department}
                      </option>
                    ))}
                  </select>
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                    Departman
                  </label>
                  <input
                    {...register('department')}
                    type="text"
                    id="department"
                    className="input w-full"
                    placeholder="Departman"
                  />
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    Deneyim (Yıl)
                  </label>
                  <input
                    {...register('experience')}
                    type="number"
                    id="experience"
                    className="input w-full"
                    placeholder="0"
                    min="0"
                  />
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600">{errors.experience.message}</p>
                  )}
                </div>
              </div>

              {/* Education */}
              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-2">
                  Eğitim Bilgisi
                </label>
                <textarea
                  {...register('education')}
                  id="education"
                  rows={3}
                  className="input w-full resize-none"
                  placeholder="Üniversite, bölüm, mezuniyet yılı vb."
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                  CV Yükle *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="resume"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>CV dosyası seçin</span>
                        <input
                          id="resume"
                          name="resume"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">veya sürükleyip bırakın</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</p>
                    {resumeFile && (
                      <p className="text-sm text-green-600 font-medium">
                        ✓ {resumeFile.name} seçildi
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Ön Yazı
                </label>
                <textarea
                  {...register('coverLetter')}
                  id="coverLetter"
                  rows={6}
                  className="input w-full resize-none"
                  placeholder="Neden bu pozisyona uygun olduğunuzu ve şirketimize neler katabileceğinizi açıklayın..."
                />
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profili
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('linkedIn')}
                      type="url"
                      id="linkedIn"
                      className="input w-full pl-10"
                      placeholder="https://linkedin.com/in/kullaniciadi"
                    />
                  </div>
                  {errors.linkedIn && (
                    <p className="mt-1 text-sm text-red-600">{errors.linkedIn.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-2">
                    Portfolio/GitHub
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('portfolio')}
                      type="url"
                      id="portfolio"
                      className="input w-full pl-10"
                      placeholder="https://github.com/kullaniciadi"
                    />
                  </div>
                  {errors.portfolio && (
                    <p className="mt-1 text-sm text-red-600">{errors.portfolio.message}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading || !resumeFile}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Gönderiliyor...
                    </div>
                  ) : (
                    <>
                      Başvuruyu Gönder
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
                {!resumeFile && (
                  <p className="mt-2 text-sm text-red-600 text-center">
                    CV dosyası yüklemek zorunludur
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeInUp>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Hemen Başvurun
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Hayalinizdeki pozisyona başvurmak için beklemeyin. 
              Ekibimize katılmak için hemen başvurun.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#application-form" className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg shadow-xl">
                Başvuru Formu
              </a>
              <Link href="/contact" className="btn border-white text-white hover:bg-white hover:text-blue-600 btn-lg">
                Sorularınız İçin İletişim
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
              <h3 className="text-lg font-semibold mb-4">Kariyer</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/careers" className="hover:text-white transition-colors">Açık Pozisyonlar</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Başvuru Süreci</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Yan Haklar</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Ekip Kültürü</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  0850 888 1 889
                </li>
                <li className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  sce@scegrup.com
                </li>
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
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Mivvo Expertiz. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
