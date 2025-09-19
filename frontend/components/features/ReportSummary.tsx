// Rapor özeti bileşeni

import { Button } from '@/components/ui/Button'
import { ReportType, VehicleInfo, UploadedImage, UploadedAudio } from '@/types'

interface ReportSummaryProps {
  selectedReportType: ReportType | null
  formData: any
  uploadedImages: UploadedImage[]
  uploadedAudios?: UploadedAudio[]
  onSubmit: () => void
  isLoading: boolean
  onPrev: () => void
  useGlobalImages?: boolean
}

export const ReportSummary = ({
  selectedReportType,
  formData,
  uploadedImages,
  uploadedAudios = [],
  onSubmit,
  isLoading,
  onPrev,
  useGlobalImages = true
}: ReportSummaryProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        {selectedReportType && (
          <div className="mb-4">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <span className="mr-2">{selectedReportType.icon}</span>
              {selectedReportType.name}
            </div>
          </div>
        )}
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
              <p className="font-medium">{formData.vehiclePlate || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Marka</p>
              <p className="font-medium">{formData.vehicleBrand || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Model</p>
              <p className="font-medium">{formData.vehicleModel || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Yıl</p>
              <p className="font-medium">{formData.vehicleYear || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Renk</p>
              <p className="font-medium">{formData.vehicleColor || 'Belirtilmemiş'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kilometre</p>
              <p className="font-medium">{formData.mileage || 'Belirtilmemiş'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yüklenen Medya</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {useGlobalImages ? 'Global resim sayısı' : 'Bu rapor için resim sayısı'}
              </p>
              <p className="font-medium">{uploadedImages.length} resim</p>
            </div>
            {useGlobalImages && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  ℹ️ Global resimler tüm raporlarda kullanılabilir
                </p>
              </div>
            )}
            {uploadedAudios.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Ses kaydı sayısı</p>
                <p className="font-medium">{uploadedAudios.length} ses kaydı</p>
              </div>
            )}
            {uploadedAudios.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Toplam ses süresi</p>
                <p className="font-medium">
                  {Math.floor(uploadedAudios.reduce((total, audio) => total + audio.duration, 0) / 60)}:
                  {(uploadedAudios.reduce((total, audio) => total + audio.duration, 0) % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrev}>
          Geri
        </Button>
        <Button 
          onClick={onSubmit}
          loading={isLoading}
          size="lg"
        >
          {isLoading ? 'Oluşturuluyor...' : 'Rapor Oluştur'}
        </Button>
      </div>
    </div>
  )
}
