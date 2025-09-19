'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  CogIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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

  useEffect(() => {
    if (!authLoading && requireAuth()) {
      loadVehicles()
    }
  }, [authLoading, isAuthenticated])

  const loadVehicles = async () => {
    try {
      setIsLoading(true)
      const data = await vehicleGarageService.getVehicleGarage()
      setVehicles(data)
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error)
      // 401 hatası durumunda kullanıcıyı login sayfasına yönlendir
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
        toast.success('Varsayılan araç ayarlandı')
        loadVehicles()
      } else {
        toast.error(response.error || 'Hata oluştu')
      }
    } catch (error) {
      console.error('Varsayılan araç ayarlama hatası:', error)
      toast.error('Varsayılan araç ayarlanırken hata oluştu')
    }
  }

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) return

    try {
      const response = await vehicleGarageService.deleteVehicle(selectedVehicle.id)
      if (response.success) {
        toast.success('Araç başarıyla silindi')
        loadVehicles()
        setShowDeleteModal(false)
        setSelectedVehicle(null)
      } else {
        toast.error(response.error || 'Hata oluştu')
      }
    } catch (error) {
      console.error('Araç silme hatası:', error)
      toast.error('Araç silinirken hata oluştu')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatMileage = (mileage?: number) => {
    if (!mileage) return 'Belirtilmemiş'
    return mileage.toLocaleString('tr-TR') + ' km'
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Router.push ile yönlendirme yapılacak
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Araçlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                ← Dashboard'a Dön
              </Link>
              <div className="flex items-center space-x-2">
                <TruckIcon className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Araç Garajım</span>
              </div>
            </div>
            <Link href="/vehicle-garage/add">
              <Button variant="primary" className="flex items-center">
                <PlusIcon className="w-5 h-5 mr-2" />
                Yeni Araç Ekle
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <FadeInUp>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card padding="lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Araç</p>
                  <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
                </div>
              </div>
            </Card>
            
            <Card padding="lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <StarIcon className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Varsayılan Araç</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.find(v => v.isDefault)?.plate || 'Yok'}
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Rapor</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {vehicles.reduce((total, v) => total + (v._count?.reports || 0), 0)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </FadeInUp>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <FadeInUp delay={0.2}>
            <Card padding="xl">
              <div className="text-center py-12">
                <TruckIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz araç eklenmemiş</h3>
                <p className="text-gray-600 mb-6">
                  Araç garajınıza ilk aracınızı ekleyerek başlayın.
                </p>
                <Link href="/vehicle-garage/add">
                  <Button variant="primary" size="lg">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    İlk Aracınızı Ekleyin
                  </Button>
                </Link>
              </div>
            </Card>
          </FadeInUp>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <StaggerItem key={vehicle.id}>
                <Card padding="lg" className="hover:shadow-lg transition-shadow">
                  {/* Vehicle Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        {vehicle.isDefault && (
                          <StarSolidIcon className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Plaka: {vehicle.plate}</p>
                      <p className="text-sm text-gray-600">Yıl: {vehicle.year}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="p-2"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      <Link href={`/vehicle-garage/edit/${vehicle.id}`}>
                        <Button variant="ghost" size="sm" className="p-2">
                          <PencilIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedVehicle(vehicle)
                          setShowDeleteModal(true)
                        }}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="space-y-2 mb-4">
                    {vehicle.color && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-16">Renk:</span>
                        <span className="font-medium">{vehicle.color}</span>
                      </div>
                    )}
                    {vehicle.mileage && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-16">Km:</span>
                        <span className="font-medium">{formatMileage(vehicle.mileage)}</span>
                      </div>
                    )}
                    {vehicle.fuelType && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-16">Yakıt:</span>
                        <span className="font-medium">{vehicle.fuelType}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      <span>{formatDate(vehicle.createdAt)}</span>
                    </div>
                  </div>

                  {/* Vehicle Images */}
                  {vehicle.vehicleImages.length > 0 && (
                    <div className="mb-4">
                      <div className="flex space-x-2 overflow-x-auto pb-2">
                        {vehicle.vehicleImages.slice(0, 3).map((image) => (
                          <div
                            key={image.id}
                            className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden"
                          >
                            <img
                              src={`http://localhost:3001/uploads/vehicle-garage/${image.imagePath.split('/').pop()}`}
                              alt={image.imageName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {vehicle.vehicleImages.length > 3 && (
                          <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">
                              +{vehicle.vehicleImages.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    {!vehicle.isDefault && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefault(vehicle.id)}
                        className="flex-1"
                      >
                        <StarIcon className="w-4 h-4 mr-1" />
                        Varsayılan
                      </Button>
                    )}
                    <Link href={`/vehicle/new-report?vehicleId=${vehicle.id}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full">
                        <DocumentTextIcon className="w-4 h-4 mr-1" />
                        Rapor Oluştur
                      </Button>
                    </Link>
                  </div>

                  {/* Report Count */}
                  {vehicle._count?.reports && vehicle._count.reports > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        {vehicle._count.reports} rapor oluşturuldu
                      </p>
                    </div>
                  )}
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aracı Sil
            </h3>
            <p className="text-gray-600 mb-6">
              <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong> aracını 
              garajınızdan silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedVehicle(null)
                }}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteVehicle}
                className="flex-1"
              >
                Sil
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
