// Araç bilgileri formu bileşeni

import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { VEHICLE_BRANDS, VEHICLE_COLORS } from '@/constants/formValidation'
import { VehicleGarage } from '@/types'

interface VehicleInfoFormProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  onNext: () => void
  onPrev: () => void
  vehicles?: VehicleGarage[]
  selectedVehicle?: VehicleGarage | null
  useGarageVehicle?: boolean
  onVehicleSelect?: (vehicle: VehicleGarage | null) => void
  onUseGarageToggle?: (use: boolean) => void
  selectedReportType?: { id: string; name: string; icon: string } | null
}

export const VehicleInfoForm = ({ 
  register, 
  errors, 
  onNext, 
  onPrev,
  vehicles = [],
  selectedVehicle,
  useGarageVehicle = false,
  onVehicleSelect,
  onUseGarageToggle,
  selectedReportType
}: VehicleInfoFormProps) => {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Araç Bilgileri</h1>
        <p className="text-gray-600">Araç detaylarını girin</p>
      </div>

      {/* Araç Garajı Seçimi */}
      {vehicles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Araç Garajından Seç</h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useGarageVehicle"
                checked={useGarageVehicle}
                onChange={(e) => onUseGarageToggle?.(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useGarageVehicle" className="ml-2 block text-sm text-gray-700">
                Garajımdaki araçlardan birini kullan
              </label>
            </div>

            {useGarageVehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Araç Seçin
                </label>
                <select
                  value={selectedVehicle?.id || ''}
                  onChange={(e) => {
                    const vehicle = vehicles.find(v => v.id === parseInt(e.target.value))
                    onVehicleSelect?.(vehicle || null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Araç seçin</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plate}
                      {vehicle.isDefault && ' (Varsayılan)'}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manuel Giriş Formu */}
      <div className={`space-y-6 ${useGarageVehicle ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900">Araç Bilgilerini Manuel Girin</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="vehiclePlate" className="block text-sm font-medium text-gray-700 mb-2">
            Plaka *
          </label>
          <input
            {...register('vehiclePlate')}
            type="text"
            id="vehiclePlate"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="34 ABC 123"
          />
          {errors.vehiclePlate && (
            <p className="mt-1 text-sm text-red-600">{String(errors.vehiclePlate.message)}</p>
          )}
        </div>

        <div>
          <label htmlFor="vehicleBrand" className="block text-sm font-medium text-gray-700 mb-2">
            Marka *
          </label>
          <select
            {...register('vehicleBrand')}
            id="vehicleBrand"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Marka seçin</option>
            {VEHICLE_BRANDS.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
          {errors.vehicleBrand && (
            <p className="mt-1 text-sm text-red-600">{String(errors.vehicleBrand.message)}</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Corolla"
          />
          {errors.vehicleModel && (
            <p className="mt-1 text-sm text-red-600">{String(errors.vehicleModel.message)}</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
          {errors.vehicleYear && (
            <p className="mt-1 text-sm text-red-600">{String(errors.vehicleYear.message)}</p>
          )}
        </div>

        <div>
          <label htmlFor="vehicleColor" className="block text-sm font-medium text-gray-700 mb-2">
            Renk *
          </label>
          <select
            {...register('vehicleColor')}
            id="vehicleColor"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Renk seçin</option>
            {VEHICLE_COLORS.map(color => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
          {errors.vehicleColor && (
            <p className="mt-1 text-sm text-red-600">{String(errors.vehicleColor.message)}</p>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="50000"
            min="0"
          />
          {errors.mileage && (
            <p className="mt-1 text-sm text-red-600">{String(errors.mileage.message)}</p>
          )}
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
    </div>
  )
}
