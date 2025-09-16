'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  CameraIcon, 
  DocumentTextIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { ProgressBar } from '@/components/ui'
import toast from 'react-hot-toast'

const schema = yup.object({
  reportType: yup.string().required('Rapor türü seçiniz'),
  vehiclePlate: yup.string().matches(/^[0-9]{2}\s[A-Z]{1,3}\s[0-9]{2,4}$/, 'Geçerli plaka formatı: 34 ABC 123'),
  vehicleBrand: yup.string().required('Marka zorunludur'),
  vehicleModel: yup.string().required('Model zorunludur'),
  vehicleYear: yup.number().min(1900).max(new Date().getFullYear() + 1).required('Yıl zorunludur'),
  vehicleColor: yup.string().required('Renk zorunludur'),
  mileage: yup.number().min(0).optional(),
})

type FormData = yup.InferType<typeof schema>

const reportTypes = [
  {
    id: 'PAINT_ANALYSIS',
    name: 'Boya Analizi',
    price: 25,
    description: 'Araç boyasının durumu ve kalitesi analizi',
    features: ['Renk eşleştirme', 'Çizik tespiti', 'Kalite değerlendirmesi'],
    icon: '🎨'
  },
  {
    id: 'DAMAGE_ASSESSMENT',
    name: 'Hasar Değerlendirmesi',
    price: 35,
    description: 'Araç hasarlarının tespiti ve değerlendirmesi',
    features: ['Çarpışma hasarları', 'Çizik analizi', 'Onarım maliyeti'],
    icon: '🔧'
  },
  {
    id: 'VALUE_ESTIMATION',
    name: 'Değer Tahmini',
    price: 20,
    description: 'Araç piyasa değeri tahmini',
    features: ['Piyasa analizi', 'Değer hesaplama', 'Raporlama'],
    icon: '💰'
  },
  {
    id: 'FULL_REPORT',
    name: 'Tam Expertiz',
    price: 75,
    description: 'Tüm analizlerin dahil olduğu kapsamlı rapor',
    features: ['Tüm analizler', 'Detaylı rapor', 'Uzman görüşü'],
    icon: '📋',
    popular: true
  }
]

export default function NewReportPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedReportType, setSelectedReportType] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      // TODO: API call to create report
      console.log('Report data:', data)
      toast.success('Rapor başarıyla oluşturuldu!')
      // Redirect to dashboard or report detail
    } catch (error) {
      toast.error('Rapor oluşturulamadı!')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReportTypeSelect = (reportType: any) => {
    setSelectedReportType(reportType)
    setCurrentStep(2)
  }

  const steps = [
    { id: 1, name: 'Rapor Türü', description: 'Analiz türünü seçin' },
    { id: 2, name: 'Araç Bilgileri', description: 'Araç detaylarını girin' },
    { id: 3, name: 'Resim Yükleme', description: 'Araç resimlerini yükleyin' },
    { id: 4, name: 'Özet', description: 'Bilgileri kontrol edin' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Geri Dön
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">Mivvo Expertiz</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <FadeInUp>
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ml-4 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <ProgressBar value={(currentStep / steps.length) * 100} />
          </div>
        </FadeInUp>

        {/* Step 1: Report Type Selection */}
        {currentStep === 1 && (
          <FadeInUp>
            <div className="card p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Rapor Türü Seçin</h1>
                <p className="text-gray-600">İhtiyacınıza uygun analiz türünü seçin</p>
              </div>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportTypes.map((reportType) => (
                  <StaggerItem key={reportType.id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`card card-hover p-6 cursor-pointer relative overflow-visible ${
                        reportType.popular ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleReportTypeSelect(reportType)}
                    >
                      {reportType.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                            En Popüler
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-4xl mb-4">{reportType.icon}</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{reportType.name}</h3>
                        <p className="text-gray-600 mb-4">{reportType.description}</p>
                        <div className="text-3xl font-bold gradient-text mb-4">{reportType.price}₺</div>
                        <ul className="text-sm text-gray-600 space-y-1 mb-6">
                          {reportType.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <button className="btn btn-primary btn-md w-full">
                          Seç
                        </button>
                      </div>
                    </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </FadeInUp>
        )}

        {/* Step 2: Vehicle Information */}
        {currentStep === 2 && (
          <FadeInUp>
            <div className="card p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Araç Bilgileri</h1>
                <p className="text-gray-600">Araç detaylarını girin</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 mb-2">
                      Plaka *
                    </label>
                    <input
                      {...register('vehiclePlate')}
                      type="text"
                      id="vehiclePlate"
                      className="input w-full"
                      placeholder="34 ABC 123"
                    />
                    {errors.vehiclePlate && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehiclePlate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vehicleBrand" className="block text-sm font-medium text-gray-700 mb-2">
                      Marka *
                    </label>
                    <select
                      {...register('vehicleBrand')}
                      id="vehicleBrand"
                      className="input w-full"
                    >
                      <option value="">Marka seçin</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Ford">Ford</option>
                      <option value="Volkswagen">Volkswagen</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes">Mercedes</option>
                      <option value="Audi">Audi</option>
                      <option value="Hyundai">Hyundai</option>
                      <option value="Kia">Kia</option>
                      <option value="Renault">Renault</option>
                    </select>
                    {errors.vehicleBrand && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleBrand.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vehicleModel" className="block text-sm font-medium text-gray-700 mb-2">
                      Model *
                    </label>
                    <input
                      {...register('vehicleModel')}
                      type="text"
                      id="vehicleModel"
                      className="input w-full"
                      placeholder="Corolla"
                    />
                    {errors.vehicleModel && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleModel.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vehicleYear" className="block text-sm font-medium text-gray-700 mb-2">
                      Yıl *
                    </label>
                    <input
                      {...register('vehicleYear')}
                      type="number"
                      id="vehicleYear"
                      className="input w-full"
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                    {errors.vehicleYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleYear.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Renk *
                    </label>
                    <select
                      {...register('vehicleColor')}
                      id="vehicleColor"
                      className="input w-full"
                    >
                      <option value="">Renk seçin</option>
                      <option value="Beyaz">Beyaz</option>
                      <option value="Siyah">Siyah</option>
                      <option value="Gri">Gri</option>
                      <option value="Gümüş">Gümüş</option>
                      <option value="Mavi">Mavi</option>
                      <option value="Kırmızı">Kırmızı</option>
                      <option value="Yeşil">Yeşil</option>
                      <option value="Sarı">Sarı</option>
                      <option value="Kahverengi">Kahverengi</option>
                    </select>
                    {errors.vehicleColor && (
                      <p className="mt-1 text-sm text-red-600">{errors.vehicleColor.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                      Kilometre
                    </label>
                    <input
                      {...register('mileage')}
                      type="number"
                      id="mileage"
                      className="input w-full"
                      placeholder="50000"
                      min="0"
                    />
                    {errors.mileage && (
                      <p className="mt-1 text-sm text-red-600">{errors.mileage.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="btn btn-secondary"
                  >
                    Geri
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="btn btn-primary"
                  >
                    Devam Et
                  </button>
                </div>
              </form>
            </div>
          </FadeInUp>
        )}

        {/* Step 3: Image Upload */}
        {currentStep === 3 && (
          <FadeInUp>
            <div className="card p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Resim Yükleme</h1>
                <p className="text-gray-600">Araç resimlerini yükleyin</p>
              </div>

              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                  <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Resimleri sürükleyip bırakın</h3>
                  <p className="text-gray-600 mb-4">veya dosya seçmek için tıklayın</p>
                  <button className="btn btn-primary">
                    Dosya Seç
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    PNG, JPG, JPEG formatları desteklenir. Maksimum 10MB.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Ön Görünüm</span>
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Arka Görünüm</span>
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Yan Görünüm</span>
                  </div>
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">İç Mekan</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="btn btn-secondary"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="btn btn-primary"
                >
                  Devam Et
                </button>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Step 4: Summary */}
        {currentStep === 4 && (
          <FadeInUp>
            <div className="card p-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Özet</h1>
                <p className="text-gray-600">Bilgileri kontrol edin ve raporu oluşturun</p>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rapor Detayları</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Rapor Türü</p>
                      <p className="font-medium">{selectedReportType?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tutar</p>
                      <p className="font-medium">{selectedReportType?.price}₺</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Araç Bilgileri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Plaka</p>
                      <p className="font-medium">{watch('vehiclePlate') || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Marka</p>
                      <p className="font-medium">{watch('vehicleBrand') || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Model</p>
                      <p className="font-medium">{watch('vehicleModel') || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Yıl</p>
                      <p className="font-medium">{watch('vehicleYear') || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn btn-secondary"
                >
                  Geri
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Oluşturuluyor...
                    </div>
                  ) : (
                    'Rapor Oluştur'
                  )}
                </button>
              </div>
            </div>
          </FadeInUp>
        )}
      </div>
    </div>
  )
}
