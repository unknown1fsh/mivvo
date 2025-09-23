'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon,
  TruckIcon,
  CameraIcon,
  TrashIcon,
  PencilIcon,
  StarIcon,
  DocumentTextIcon,
  EyeIcon,
  CalendarIcon,
  CogIcon,
  SparklesIcon,
  ChartBarIcon,
  BoltIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { InteractiveCard } from '@/components/ui/InteractiveCard'
import { FloatingActionButton } from '@/components/ui/FloatingActionButton'
import { LoadingSpinner, LoadingDots } from '@/components/ui/LoadingComponents'
import { VehicleGarage } from '@/types'
import { vehicleGarageService } from '@/services'
import { useAuth } from '@/hooks'
import toast from 'react-hot-toast'

export default function VehicleGaragePage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, requireAuth } = useAuth()
  const [vehicles, setVehicles] = useState<VehicleGarage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleGarage | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && requireAuth()) {
      loadVehicles()
    }
  }, [authLoading, isAuthenticated])

  const loadVehicles = async () => {
    try {
      setIsLoading(true)
      const response = await vehicleGarageService.getVehicleGarage()
      
      // Response yapısını kontrol et
      if (response && Array.isArray(response)) {
        setVehicles(response)
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        setVehicles((response as any).data)
      } else {
        console.warn('Araç verisi beklenmeyen formatta:', response)
        setVehicles([])
      }
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error)
      setVehicles([])
      if (error instanceof Error && error.message.includes('401')) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.')
        router.push('/login')
        return
      }
      toast.error('Araçlar yüklenirken hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetDefault = async (vehicleId: number) => {
    try {
      const response = await vehicleGarageService.setDefaultVehicle(vehicleId)
      if (response.success) {
        toast.success('Varsayılan araç güncellendi')
        loadVehicles()
      } else {
        toast.error(response.error || 'Varsayılan araç güncellenirken hata oluştu')
      }
    } catch (error) {
      console.error('Varsayılan araç güncelleme hatası:', error)
      toast.error('Varsayılan araç güncellenirken hata oluştu')
    }
  }

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return

    try {
      setIsDeleting(true)
      const response = await vehicleGarageService.deleteVehicle(selectedVehicle.id)
      if (response.success) {
        toast.success('Araç başarıyla silindi')
        setShowDeleteModal(false)
        setSelectedVehicle(null)
        loadVehicles()
      } else {
        toast.error(response.error || 'Araç silinirken hata oluştu')
      }
    } catch (error) {
      console.error('Araç silme hatası:', error)
      toast.error('Araç silinirken hata oluştu')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleAddVehicle = () => {
    router.push('/vehicle-garage/add')
  }

  if (authLoading || isLoading) {
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
            Araçlarınız yükleniyor...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const defaultVehicle = Array.isArray(vehicles) ? vehicles.find(v => v.isDefault) : null
  const totalVehicles = Array.isArray(vehicles) ? vehicles.length : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                  Araç Garajım
                </h1>
                <p className="text-gray-600 mt-1">Araçlarınızı yönetin ve takip edin</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  <HomeIcon className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/vehicle-garage/add"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Yeni Araç Ekle
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard delay={0.1} glow gradient>
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Araç</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVehicles}</p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} glow gradient>
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Varsayılan Araç</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {defaultVehicle?.plate || 'Yok'}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} glow gradient>
            <div className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Rapor</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {Array.isArray(vehicles) ? vehicles.reduce((sum, v) => sum + (v._count?.reports || 0), 0) : 0}
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Vehicles Grid */}
        <AnimatePresence mode="wait">
          {Array.isArray(vehicles) && vehicles.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatedCard glow gradient>
                <div className="text-center py-16">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  >
                    <TruckIcon className="w-12 h-12 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Henüz araç eklenmemiş</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Araç garajınıza ilk aracınızı ekleyerek başlayın. Araçlarınızı yönetin, 
                    raporlar oluşturun ve takip edin.
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href="/vehicle-garage/add"
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
                    >
                      <PlusIcon className="w-5 h-5 mr-2" />
                      İlk Aracınızı Ekleyin
                    </Link>
                  </motion.div>
                </div>
              </AnimatedCard>
            </motion.div>
          ) : (
            <motion.div
              key="vehicles"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.isArray(vehicles) && vehicles.map((vehicle, index) => (
                <InteractiveCard
                  key={vehicle.id}
                  delay={index * 0.1}
                  glow
                  gradient
                  className="group"
                >
                  <div className="p-6">
                    {/* Vehicle Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {vehicle.brand} {vehicle.model}
                          </h3>
                          {vehicle.isDefault && (
                            <motion.div
                              animate={{ 
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                              }}
                              transition={{ 
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Plaka: {vehicle.plate}</p>
                        <p className="text-sm text-gray-500">{vehicle.year} • {vehicle.color}</p>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      >
                        <button
                          onClick={() => {
                            setSelectedVehicle(vehicle)
                            setShowDeleteModal(true)
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {vehicle.year}
                      </div>
                      {vehicle.mileage && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BoltIcon className="w-4 h-4 mr-2" />
                          {vehicle.mileage.toLocaleString()} km
                        </div>
                      )}
                      {vehicle._count?.reports && vehicle._count.reports > 0 && (
                        <div className="flex items-center text-sm text-blue-600">
                          <DocumentTextIcon className="w-4 h-4 mr-2" />
                          {vehicle._count.reports} rapor
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !vehicle.isDefault && handleSetDefault(vehicle.id)}
                        disabled={vehicle.isDefault}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          vehicle.isDefault
                            ? 'bg-yellow-100 text-yellow-800 cursor-default'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        {vehicle.isDefault ? 'Varsayılan' : 'Varsayılan Yap'}
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router.push(`/vehicle-garage/${vehicle.id}`)}
                        className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                      >
                        Detaylar
                      </motion.button>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={handleAddVehicle}
        icon={<PlusIcon className="w-6 h-6" />}
        label="Yeni Araç Ekle"
        variant="primary"
        size="lg"
      />

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedVehicle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <TrashIcon className="w-8 h-8 text-red-600" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Aracı Sil
                </h3>
                <p className="text-gray-600 mb-6">
                  <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong> aracını 
                  silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </p>
                
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedVehicle(null)
                    }}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    İptal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteVehicle}
                    disabled={isDeleting}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <LoadingDots />
                    ) : (
                      'Sil'
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}