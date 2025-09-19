'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeftIcon,
  CameraIcon,
  PhotoIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { FadeInUp } from '@/components/motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { UploadedImage } from '@/types'
import { useFileUpload } from '@/hooks/useFileUpload'
import toast from 'react-hot-toast'

export default function UploadImagesPage() {
  const [isUploading, setIsUploading] = useState(false)
  const fileUploadProps = useFileUpload()

  // LocalStorage'dan yüklenen resimleri al
  useEffect(() => {
    const savedImages = localStorage.getItem('globalVehicleImages')
    if (savedImages) {
      try {
        const images = JSON.parse(savedImages)
        // File objeleri localStorage'da saklanamaz, sadece metadata
        // Bu yüzden preview URL'lerini kullanacağız
        images.forEach((imageData: any) => {
          if (imageData.preview) {
            const mockFile = new File([''], imageData.name, { type: 'image/jpeg' })
            Object.defineProperty(mockFile, 'preview', {
              value: imageData.preview,
              writable: false
            })
            
            const uploadedImage: UploadedImage = {
              id: imageData.id,
              file: mockFile,
              preview: imageData.preview,
              name: imageData.name,
              size: imageData.size,
              status: 'uploaded',
              type: imageData.type || 'exterior'
            }
            
            fileUploadProps.setUploadedImages(prev => {
              const exists = prev.some(img => img.id === imageData.id)
              if (!exists) {
                return [...prev, uploadedImage]
              }
              return prev
            })
          }
        })
      } catch (error) {
        console.error('Resim verileri yüklenirken hata:', error)
      }
    }
  }, [])

  // Resimleri localStorage'a kaydet
  const saveImagesToStorage = (images: UploadedImage[]) => {
    const imageData = images.map(img => ({
      id: img.id,
      name: img.name,
      size: img.size,
      preview: img.preview,
      type: img.type,
      uploadDate: new Date().toISOString()
    }))
    localStorage.setItem('globalVehicleImages', JSON.stringify(imageData))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        await fileUploadProps.uploadFile(file)
      }
      
      // Resimleri localStorage'a kaydet
      saveImagesToStorage(fileUploadProps.uploadedImages)
      
      toast.success(`${files.length} resim başarıyla yüklendi`)
    } catch (error) {
      console.error('Resim yükleme hatası:', error)
      toast.error('Resim yüklenirken hata oluştu')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (imageId: string) => {
    fileUploadProps.removeImage(imageId)
    saveImagesToStorage(fileUploadProps.uploadedImages.filter(img => img.id !== imageId))
    toast.success('Resim silindi')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getImageTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      exterior: 'Dış Görünüm',
      interior: 'İç Mekan',
      engine: 'Motor',
      damage: 'Hasar',
      paint: 'Boya'
    }
    return labels[type] || 'Diğer'
  }

  const getImageTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      exterior: 'bg-blue-100 text-blue-800',
      interior: 'bg-green-100 text-green-800',
      engine: 'bg-red-100 text-red-800',
      damage: 'bg-orange-100 text-orange-800',
      paint: 'bg-purple-100 text-purple-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Dashboard'a Dön
              </Link>
              <div className="flex items-center space-x-2">
                <CameraIcon className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Resim Yönetimi</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <FadeInUp>
          <Card padding="lg" className="mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CloudArrowUpIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Araç Resimlerini Yükle</h2>
              <p className="text-gray-600 mb-6">
                Yüklediğiniz resimler tüm raporlarda kullanılabilir olacak
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isUploading}
                  className="inline-flex items-center"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  {isUploading ? 'Yükleniyor...' : 'Resim Seç'}
                </Button>
              </label>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>• JPG, PNG, WebP formatları desteklenir</p>
                <p>• Maksimum dosya boyutu: 10MB</p>
                <p>• Birden fazla resim seçebilirsiniz</p>
              </div>
            </div>
          </Card>
        </FadeInUp>

        {/* Image Gallery */}
        {fileUploadProps.uploadedImages.length > 0 && (
          <FadeInUp delay={0.2}>
            <Card padding="lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Yüklenen Resimler ({fileUploadProps.uploadedImages.length})
                </h3>
                <div className="text-sm text-gray-500">
                  Toplam boyut: {formatFileSize(fileUploadProps.uploadedImages.reduce((total, img) => total + img.size, 0))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fileUploadProps.uploadedImages.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Image */}
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(image.preview, '_blank')}
                          className="bg-white/90 hover:bg-white"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveImage(image.id)}
                          className="bg-red-500/90 hover:bg-red-600 text-white"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImageTypeColor(image.type || 'exterior')}`}>
                          {getImageTypeLabel(image.type || 'exterior')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatFileSize(image.size)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.name}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-center space-x-4">
                <Link href="/vehicle/new-report">
                  <Button variant="primary">
                    Bu Resimlerle Rapor Oluştur
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => {
                    fileUploadProps.clearImages()
                    localStorage.removeItem('globalVehicleImages')
                    toast.success('Tüm resimler silindi')
                  }}
                >
                  Tümünü Temizle
                </Button>
              </div>
            </Card>
          </FadeInUp>
        )}

        {/* Empty State */}
        {fileUploadProps.uploadedImages.length === 0 && (
          <FadeInUp delay={0.2}>
            <Card padding="lg">
              <div className="text-center py-12">
                <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz resim yüklenmemiş</h3>
                <p className="text-gray-600 mb-6">
                  Araç resimlerinizi yükleyerek expertiz raporlarınızda kullanabilirsiniz.
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="primary" size="lg">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    İlk Resminizi Yükleyin
                  </Button>
                </label>
              </div>
            </Card>
          </FadeInUp>
        )}
      </div>
    </div>
  )
}