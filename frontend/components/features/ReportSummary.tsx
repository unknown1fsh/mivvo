// Rapor özeti bileşeni

import { Button } from '@/components/ui/Button'
import { ReportType, VehicleInfo, UploadedImage } from '@/types'

interface ReportSummaryProps {
  selectedReportType: ReportType | null
  formData: any
  uploadedImages: UploadedImage[]
  onSubmit: () => void
  isLoading: boolean
  onPrev: () => void
}

export const ReportSummary = ({
  selectedReportType,
  formData,
  uploadedImages,
  onSubmit,
  isLoading,
  onPrev
}: ReportSummaryProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yüklenen Resimler</h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Toplam resim sayısı</p>
            <p className="font-medium">{uploadedImages.length} resim</p>
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
