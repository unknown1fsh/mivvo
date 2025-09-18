// Resim yükleyici bileşeni

import { CloudArrowUpIcon, PhotoIcon, CheckCircleIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/Button'
import { UploadedImage } from '@/types/vehicle'

interface ImageUploaderProps {
  uploadedImages: UploadedImage[]
  dragActive: boolean
  isUploading: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  handleDrag: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFiles: (files: File[]) => void
  removeImage: (id: string) => void
  onNext: () => void
  onPrev: () => void
}

export const ImageUploader = ({
  uploadedImages,
  dragActive,
  isUploading,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleFiles,
  removeImage,
  onNext,
  onPrev
}: ImageUploaderProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Resim Yükleme</h1>
        <p className="text-gray-600">Araç resimlerini yükleyin</p>
      </div>

      <div className="space-y-6">
        {/* Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <CloudArrowUpIcon className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Resimleri buraya sürükleyin veya tıklayın
              </h3>
              <p className="text-gray-600 mb-4">
                JPG, PNG, WebP formatlarında, maksimum 15MB
              </p>
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                variant="secondary"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <PhotoIcon className="w-5 h-5 mr-2" />
                    Dosya Seç
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>• Birden fazla resim seçebilirsiniz</p>
              <p>• Her resim otomatik olarak analiz edilir</p>
              <p>• Toplam boyut: {uploadedImages.length} resim</p>
            </div>
          </div>
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Yüklenen Resimler</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image.preview}
                      alt="Uploaded"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                          <EyeIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => removeImage(image.id)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                        >
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                        Yüklendi
                      </div>
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Type Suggestions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Önerilen Görünüm Açıları</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🚗</div>
                <span className="text-sm text-gray-600">Ön Görünüm</span>
              </div>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🚙</div>
                <span className="text-sm text-gray-600">Arka Görünüm</span>
              </div>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🚘</div>
                <span className="text-sm text-gray-600">Yan Görünüm</span>
              </div>
            </div>
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center p-4">
              <div className="text-center">
                <div className="text-2xl mb-2">🪑</div>
                <span className="text-sm text-gray-600">İç Mekan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrev}>
          Geri
        </Button>
        <Button onClick={onNext}>
          Devam Et
        </Button>
      </div>
    </div>
  )
}
