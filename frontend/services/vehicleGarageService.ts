import { apiClient } from './apiClient'
import { VehicleGarage, VehicleGarageImage } from '@/types'

export interface CreateVehicleData {
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  mileage?: number
  vin?: string
  fuelType?: string
  transmission?: string
  engineSize?: string
  bodyType?: string
  doors?: number
  seats?: number
  notes?: string
  isDefault?: boolean
}

export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  id: number
}

export interface VehicleGarageResponse {
  success: boolean
  data?: VehicleGarage | VehicleGarage[]
  error?: string
  message?: string
}

export interface VehicleImageUploadResponse {
  success: boolean
  data?: VehicleGarageImage[]
  error?: string
  message?: string
}

class VehicleGarageService {
  // Get all vehicles in user's garage
  async getVehicleGarage(): Promise<VehicleGarage[]> {
    const response = await apiClient.get<VehicleGarage[]>('/api/vehicle-garage')
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Get single vehicle by ID
  async getVehicleById(id: number): Promise<VehicleGarage | null> {
    const response = await apiClient.get<VehicleGarage>(`/api/vehicle-garage/${id}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  // Add new vehicle to garage
  async addVehicle(vehicleData: CreateVehicleData): Promise<VehicleGarageResponse> {
    const response = await apiClient.post<VehicleGarage>('/api/vehicle-garage', vehicleData)
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    }
  }

  // Update vehicle
  async updateVehicle(vehicleData: UpdateVehicleData): Promise<VehicleGarageResponse> {
    const { id, ...data } = vehicleData
    const response = await apiClient.put<VehicleGarage>(`/api/vehicle-garage/${id}`, data)
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    }
  }

  // Delete vehicle
  async deleteVehicle(id: number): Promise<VehicleGarageResponse> {
    const response = await apiClient.delete(`/api/vehicle-garage/${id}`)
    
    return {
      success: response.success,
      error: response.error,
      message: response.message
    }
  }

  // Upload vehicle images
  async uploadVehicleImages(vehicleId: number, files: File[]): Promise<VehicleImageUploadResponse> {
    const formData = new FormData()
    
    files.forEach(file => {
      formData.append('images', file)
    })

    const response = await apiClient.post<VehicleGarageImage[]>(
      `/api/vehicle-garage/${vehicleId}/images`, 
      formData
    )

    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    }
  }

  // Delete vehicle image
  async deleteVehicleImage(vehicleId: number, imageId: number): Promise<VehicleGarageResponse> {
    const response = await apiClient.delete(`/api/vehicle-garage/${vehicleId}/images/${imageId}`)
    
    return {
      success: response.success,
      error: response.error,
      message: response.message
    }
  }

  // Set default vehicle
  async setDefaultVehicle(id: number): Promise<VehicleGarageResponse> {
    const response = await apiClient.patch(`/api/vehicle-garage/${id}/set-default`)
    
    return {
      success: response.success,
      error: response.error,
      message: response.message
    }
  }

  // Get vehicle reports
  async getVehicleReports(id: number): Promise<any[]> {
    const response = await apiClient.get(`/api/vehicle-garage/${id}/reports`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // Convert VehicleGarage to VehicleInfo for reports
  convertToVehicleInfo(vehicle: VehicleGarage) {
    return {
      plate: vehicle.plate,
      make: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year.toString(),
      vin: vehicle.vin || 'Belirtilmemiş'
    }
  }
}

export const vehicleGarageService = new VehicleGarageService()
export default vehicleGarageService
