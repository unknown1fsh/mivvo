'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CarIcon,
  CameraIcon,
  CloudArrowUpIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreateVehicleData } from '@/services/vehicleGarageService'
import { vehicleGarageService } from '@/services'
import toast from 'react-hot-toast'

export default function AddVehiclePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  
  const [formData, setFormData] = useState<CreateVehicleData>({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: undefined,
    vin: '',
    fuelType: '',
    transmission: '',
    engineSize: '',
    bodyType: '',
    doors: undefined,
    seats: undefined,
    notes: '',
    isDefault: false
  })

  const handleInputChange = (field: keyof CreateVehicleData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024
      )
      setUploadedImages(prev => [...prev, ...newImages])
      
      if (newImages.length !== files.length) {
        toast.error('Bazı dosyalar desteklenmiyor veya çok büyük (max 10MB)')
      }
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.plate || !formData.brand || !formData.model) {
      toast.error('Plaka, marka ve model alanları zorunludur')
      return
    }

    setIsSubmitting(true)
    
    try {
      // First create the vehicle
      const response = await vehicleGarageService.addVehicle(formData)
      
      if (response.success && response.data) {
        // Upload images if any
        if (uploadedImages.length > 0) {
          await vehicleGarageService.uploadVehicleImages(response.data.id, uploadedImages)
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

  const fuelTypes = [
    'Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hibrit', 'Plug-in Hibrit'
  ]

  const transmissions = [
    'Manuel', 'Otomatik', 'Yarı Otomatik', 'CVT'
  ]

  const bodyTypes = [
    'Sedan', 'Hatchback', 'SUV', 'Station Wagon', 'Coupe', 'Cabrio', 'Pickup'
  ]

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/vehicle-garage" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Garaja Dön
              </Link>
              <div className="flex items-center space-x-2">
                <CarIcon className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Yeni Araç Ekle</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <FadeInUp>
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Temel Bilgiler</h3>
                
                <div className="space-y-4">
                  {/* Plate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plaka Numarası *
                    </label>
                    <input
                      type="text"
                      value={formData.plate}
                      onChange={(e) => handleInputChange('plate', e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="34 ABC 123"
                      required
                    />
                  </div>

                  {/* Brand & Model */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marka *
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleInputChange('brand', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Toyota"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model *
                      </label>
                      <input
                        type="text"
                        value={formData.model}
                        onChange={(e) => handleInputChange('model', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Corolla"
                        required
                      />
                    </div>
                  </div>

                  {/* Year & Color */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model Yılı
                      </label>
                      <select
                        value={formData.year}
                        onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Renk
                      </label>
                      <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Beyaz"
                      />
                    </div>
                  </div>

                  {/* Mileage & VIN */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kilometre
                      </label>
                      <input
                        type="number"
                        value={formData.mileage || ''}
                        onChange={(e) => handleInputChange('mileage', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şasi No (VIN)
                      </label>
                      <input
                        type="text"
                        value={formData.vin}
                        onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="17 karakterli şasi numarası"
                        maxLength={17}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </FadeInUp>

            {/* Right Column - Technical Info */}
            <FadeInUp delay={0.1}>
              <Card padding="lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Teknik Özellikler</h3>
                
                <div className="space-y-4">
                  {/* Fuel Type & Transmission */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Yakıt Türü
                      </label>
                      <select
                        value={formData.fuelType}
                        onChange={(e) => handleInputChange('fuelType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seçiniz</option>
                        {fuelTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Şanzıman
                      </label>
                      <select
                        value={formData.transmission}
                        onChange={(e) => handleInputChange('transmission', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seçiniz</option>
                        {transmissions.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Engine Size & Body Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motor Hacmi
                      </label>
                      <input
                        type="text"
                        value={formData.engineSize}
                        onChange={(e) => handleInputChange('engineSize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="1.6L"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kasa Tipi
                      </label>
                      <select
                        value={formData.bodyType}
                        onChange={(e) => handleInputChange('bodyType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seçiniz</option>
                        {bodyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Doors & Seats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kapı Sayısı
                      </label>
                      <select
                        value={formData.doors || ''}
                        onChange={(e) => handleInputChange('doors', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seçiniz</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Koltuk Sayısı
                      </label>
                      <select
                        value={formData.seats || ''}
                        onChange={(e) => handleInputChange('seats', e.target.value ? parseInt(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Seçiniz</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notlar
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Araç hakkında ek bilgiler..."
                    />
                  </div>

                  {/* Default Vehicle */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                      Varsayılan araç olarak ayarla
                    </label>
                  </div>
                </div>
              </Card>
            </FadeInUp>
          </div>

          {/* Image Upload */}
          <FadeInUp delay={0.2}>
            <Card padding="lg" className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Araç Resimleri</h3>
              
              <div className="space-y-4">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Resimleri buraya sürükleyin veya tıklayın</p>
                    <p className="text-sm text-gray-500">JPG, PNG, WebP formatları (max 10MB)</p>
                  </label>
                </div>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </FadeInUp>

          {/* Submit Button */}
          <FadeInUp delay={0.3}>
            <div className="flex justify-end space-x-4 mt-8">
              <Link href="/vehicle-garage">
                <Button variant="secondary">İptal</Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Araç Ekle
                  </>
                )}
              </Button>
            </div>
          </FadeInUp>
        </form>
      </div>
    </div>
  )
}
