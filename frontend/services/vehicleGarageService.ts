/**
 * Vehicle Garage Service (Araç Garajı Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, kullanıcının araç garajı yönetimini sağlar.
 * 
 * Sorumluluklar:
 * - Araç listesi getirme
 * - Araç ekleme
 * - Araç güncelleme
 * - Araç silme
 * - Araç görselleri yönetme
 * - Varsayılan araç ayarlama
 * - Araç raporları getirme
 * - VehicleGarage → VehicleInfo dönüşümü
 * 
 * Kullanım:
 * ```typescript
 * import { vehicleGarageService } from './vehicleGarageService'
 * 
 * const vehicles = await vehicleGarageService.getVehicleGarage()
 * const vehicle = await vehicleGarageService.getVehicleById(1)
 * await vehicleGarageService.addVehicle({ plate: '34ABC123', ... })
 * ```
 */

import { apiClient } from './apiClient'
import { VehicleGarage, VehicleGarageImage } from '@/types'

// ===== INTERFACES =====

/**
 * Create Vehicle Data
 * 
 * Yeni araç oluşturma için veri interface'i.
 */
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

/**
 * Update Vehicle Data
 * 
 * Araç güncelleme için veri interface'i.
 */
export interface UpdateVehicleData extends Partial<CreateVehicleData> {
  id: number
}

/**
 * Vehicle Garage Response
 * 
 * Araç garajı işlemleri için yanıt interface'i.
 */
export interface VehicleGarageResponse {
  success: boolean
  data?: VehicleGarage | VehicleGarage[]
  error?: string
  message?: string
}

/**
 * Vehicle Image Upload Response
 * 
 * Görsel yükleme için yanıt interface'i.
 */
export interface VehicleImageUploadResponse {
  success: boolean
  data?: VehicleGarageImage[]
  error?: string
  message?: string
}

// ===== VEHICLE GARAGE SERVICE CLASS =====

/**
 * Vehicle Garage Service Class
 * 
 * Araç garajı yönetimi işlemlerini yöneten servis.
 */
class VehicleGarageService {
  // ===== VEHICLE CRUD =====

  /**
   * Get Vehicle Garage (Araç Garajını Getir)
   * 
   * Kullanıcının tüm araçlarını getirir.
   * 
   * Sıralama:
   * - Varsayılan araç önce (isDefault)
   * - Tarih sıralı (createdAt desc)
   * 
   * @returns VehicleGarage[]
   */
  async getVehicleGarage(): Promise<VehicleGarage[]> {
    const response = await apiClient.get<VehicleGarage[]>('/vehicle-garage')
    
    console.log('🔍 Vehicle garage response:', response)
    
    if (response.success && response.data) {
      // Güvenli kontrol: data array olup olmadığını kontrol et
      if (Array.isArray(response.data)) {
        console.log(`✅ ${response.data.length} araç bulundu`)
        return response.data
      } else {
        console.warn('Araç verisi beklenmeyen formatta:', response.data)
        return []
      }
    }
    
    console.log('⚠️ Araç verisi bulunamadı veya hata oluştu')
    return []
  }

  /**
   * Get Vehicle By ID (Araç Detayı)
   * 
   * Belirli bir aracın detaylarını getirir.
   * 
   * @param id - Araç ID
   * 
   * @returns VehicleGarage veya null
   */
  async getVehicleById(id: number): Promise<VehicleGarage | null> {
    const response = await apiClient.get<VehicleGarage>(`/api/vehicle-garage/${id}`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return null
  }

  /**
   * Add Vehicle (Araç Ekle)
   * 
   * Garaja yeni araç ekler.
   * 
   * Özellikler:
   * - Plaka benzersizlik kontrolü (backend)
   * - Varsayılan araç otomatik ayarlama
   * 
   * @param vehicleData - Araç bilgileri
   * 
   * @returns VehicleGarageResponse
   */
  async addVehicle(vehicleData: CreateVehicleData): Promise<VehicleGarageResponse> {
    const response = await apiClient.post<VehicleGarage>('/vehicle-garage', vehicleData)
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      message: response.message
    }
  }

  /**
   * Update Vehicle (Araç Güncelle)
   * 
   * Araç bilgilerini günceller.
   * 
   * @param vehicleData - Güncellenecek bilgiler (id dahil)
   * 
   * @returns VehicleGarageResponse
   */
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

  /**
   * Delete Vehicle (Araç Sil)
   * 
   * Aracı garajdan siler.
   * 
   * UYARI:
   * - İlişkili görseller de silinir
   * - Geri alınamaz!
   * 
   * @param id - Araç ID
   * 
   * @returns VehicleGarageResponse
   */
  async deleteVehicle(id: number): Promise<VehicleGarageResponse> {
    const response = await apiClient.delete(`/api/vehicle-garage/${id}`)
    
    return {
      success: response.success,
      error: response.error,
      message: response.message
    }
  }

  // ===== VEHICLE IMAGES =====

  /**
   * Upload Vehicle Images (Araç Görselleri Yükle)
   * 
   * Araca görseller yükler.
   * 
   * Multer ile FormData gönderilir.
   * 
   * @param vehicleId - Araç ID
   * @param files - Yüklenecek dosyalar
   * 
   * @returns VehicleImageUploadResponse
   */
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

  /**
   * Delete Vehicle Image (Araç Görseli Sil)
   * 
   * Belirli bir araç görselini siler.
   * 
   * @param vehicleId - Araç ID
   * @param imageId - Görsel ID
   * 
   * @returns VehicleGarageResponse
   */
  async deleteVehicleImage(vehicleId: number, imageId: number): Promise<VehicleGarageResponse> {
    const response = await apiClient.delete(`/api/vehicle-garage/${vehicleId}/images/${imageId}`)
    
    return {
      success: response.success,
      error: response.error,
      message: response.message
    }
  }

  // ===== VEHICLE SETTINGS =====

  /**
   * Set Default Vehicle (Varsayılan Araç Ayarla)
   * 
   * Belirli bir aracı varsayılan olarak ayarlar.
   * 
   * Varsayılan Araç:
   * - Rapor oluştururken otomatik seçilir
   * - Listelerde önce gösterilir
   * - Kullanıcı başına 1 tane
   * 
   * @param id - Araç ID
   * 
   * @returns VehicleGarageResponse
   */
  async setDefaultVehicle(id: number): Promise<VehicleGarageResponse> {
    const response = await apiClient.patch(`/api/vehicle-garage/${id}/set-default`)
    
    return {
      success: response.success,
      error: response.error,
      message: response.message
    }
  }

  // ===== VEHICLE REPORTS =====

  /**
   * Get Vehicle Reports (Araç Raporları)
   * 
   * Belirli bir araca ait tüm raporları getirir.
   * 
   * @param id - Araç ID
   * 
   * @returns Rapor listesi
   */
  async getVehicleReports(id: number): Promise<any[]> {
    const response = await apiClient.get(`/api/vehicle-garage/${id}/reports`)
    
    if (response.success && response.data) {
      return response.data as any
    }
    
    return []
  }

  // ===== UTILITY METHODS =====

  /**
   * Convert To Vehicle Info (VehicleInfo'ya Dönüştür)
   * 
   * VehicleGarage nesnesini rapor oluşturmak için VehicleInfo'ya dönüştürür.
   * 
   * Kullanım:
   * - Rapor oluştururken
   * - AI analizi başlatırken
   * 
   * @param vehicle - VehicleGarage nesnesi
   * 
   * @returns VehicleInfo nesnesi
   * 
   * @example
   * const vehicleInfo = vehicleGarageService.convertToVehicleInfo(vehicle)
   * await damageAnalysisService.startAnalysis({ vehicleInfo, images })
   */
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

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const vehicleGarageService = new VehicleGarageService()

/**
 * Default Export
 */
export default vehicleGarageService
