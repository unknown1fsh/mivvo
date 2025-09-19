'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { 
  ArrowLeftIcon,
  TruckIcon,
  CameraIcon,
  CloudArrowUpIcon,
  TrashIcon,
  CheckCircleIcon,
  SparklesIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { InteractiveCard } from '@/components/ui/InteractiveCard'
import { LoadingSpinner, LoadingDots } from '@/components/ui/LoadingComponents'
import { vehicleGarageService } from '@/services'
import { useAuth } from '@/hooks'
import toast from 'react-hot-toast'

const schema = yup.object({
  plate: yup.string()
    .matches(/^[0-9]{2}\s[A-Z]{1,3}\s[0-9]{2,4}$/, 'Geçerli plaka formatı: 34 ABC 123')
    .required('Plaka zorunludur'),
  brand: yup.string().required('Marka zorunludur'),
  model: yup.string().required('Model zorunludur'),
  year: yup.number()
    .min(1900, 'Geçerli bir yıl giriniz')
    .max(new Date().getFullYear() + 1, 'Gelecek yıl olamaz')
    .required('Yıl zorunludur'),
  color: yup.string().optional(),
  mileage: yup.number().min(0, 'Kilometre negatif olamaz').optional(),
  vin: yup.string().optional(),
  fuelType: yup.string().optional(),
  transmission: yup.string().optional(),
  engineSize: yup.string().optional(),
  bodyType: yup.string().optional(),
  doors: yup.number().min(2).max(6).optional(),
  seats: yup.number().min(2).max(9).optional(),
  notes: yup.string().optional(),
})

type FormData = yup.InferType<typeof schema>

export default function AddVehiclePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  })

  const watchedValues = watch()

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    
    const newImages = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
    )
    
    if (newImages.length !== files.length) {
      toast.error('Bazı dosyalar desteklenmiyor veya çok büyük (max 5MB)')
    }
    
    setUploadedImages(prev => [...prev, ...newImages].slice(0, 10)) // Max 10 images
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    try {
      const formData = new FormData()
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value.toString())
        }
      })
      
      // Add images
      uploadedImages.forEach((image, index) => {
        formData.append('images', image)
      })

      const response = await vehicleGarageService.addVehicle(formData as any)
      
      if (response.success && response.data) {
        const vehicleData = Array.isArray(response.data) ? response.data[0] : response.data
        
        if (uploadedImages.length > 0) {
          await vehicleGarageService.uploadVehicleImages(vehicleData.id, uploadedImages)
        }
        
        toast.success('Araç başarıyla garaja eklendi')
        router.push('/vehicle-garage')
      } else {
        toast.error(response.error || 'Araç eklenirken hata oluştu')
      }
    } catch (error) {
      console.error('Araç ekleme hatası:', error)
      toast.error('Araç eklenirken beklenmeyen bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <LoadingSpinner size="xl" />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-gray-600 text-lg"
          >
            Yükleniyor...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
              >
                <TruckIcon className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Yeni Araç Ekle
                </h1>
                <p className="text-gray-600 mt-1">Araç bilgilerini girin ve garajınıza ekleyin</p>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/vehicle-garage"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Geri Dön
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <AnimatedCard delay={0.1} glow gradient>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <TruckIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Temel Bilgiler</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plaka *
                  </label>
                  <input
                    {...register('plate')}
                    type="text"
                    placeholder="34 ABC 123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errors.plate && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.plate.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marka *
                  </label>
                  <input
                    {...register('brand')}
                    type="text"
                    placeholder="Toyota"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errors.brand && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.brand.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model *
                  </label>
                  <input
                    {...register('model')}
                    type="text"
                    placeholder="Corolla"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errors.model && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.model.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yıl *
                  </label>
                  <input
                    {...register('year', { valueAsNumber: true })}
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    placeholder="2023"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {errors.year && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-600"
                    >
                      {errors.year.message}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renk
                  </label>
                  <input
                    {...register('color')}
                    type="text"
                    placeholder="Beyaz"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kilometre
                  </label>
                  <input
                    {...register('mileage', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Technical Details */}
          <AnimatedCard delay={0.2} glow gradient>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Teknik Detaylar</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yakıt Türü
                  </label>
                  <select
                    {...register('fuelType')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Benzin">Benzin</option>
                    <option value="Dizel">Dizel</option>
                    <option value="Hibrit">Hibrit</option>
                    <option value="Elektrik">Elektrik</option>
                    <option value="LPG">LPG</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şanzıman
                  </label>
                  <select
                    {...register('transmission')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Manuel">Manuel</option>
                    <option value="Otomatik">Otomatik</option>
                    <option value="Yarı Otomatik">Yarı Otomatik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motor Hacmi
                  </label>
                  <input
                    {...register('engineSize')}
                    type="text"
                    placeholder="1.6L"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kasa Tipi
                  </label>
                  <select
                    {...register('bodyType')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="SUV">SUV</option>
                    <option value="Station Wagon">Station Wagon</option>
                    <option value="Coupe">Coupe</option>
                    <option value="Cabrio">Cabrio</option>
                    <option value="Pickup">Pickup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kapı Sayısı
                  </label>
                  <select
                    {...register('doors', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seçiniz</option>
                    <option value={2}>2 Kapı</option>
                    <option value={3}>3 Kapı</option>
                    <option value={4}>4 Kapı</option>
                    <option value={5}>5 Kapı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Koltuk Sayısı
                  </label>
                  <select
                    {...register('seats', { valueAsNumber: true })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Seçiniz</option>
                    <option value={2}>2 Koltuk</option>
                    <option value={4}>4 Koltuk</option>
                    <option value={5}>5 Koltuk</option>
                    <option value={7}>7 Koltuk</option>
                    <option value={9}>9 Koltuk</option>
                  </select>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Image Upload */}
          <AnimatedCard delay={0.3} glow gradient>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <CameraIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Araç Resimleri</h2>
              </div>

              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Resimleri buraya sürükleyin veya tıklayın
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, JPEG formatları desteklenir (Max 5MB)
                  </p>
                </motion.div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Uploaded Images */}
              <AnimatePresence>
                {uploadedImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6"
                  >
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Yüklenen Resimler ({uploadedImages.length}/10)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative group"
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimatedCard>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingDots />
                  <span className="ml-2">Ekleniyor...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Aracı Ekle
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}