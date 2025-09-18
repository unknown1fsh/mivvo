// VIN sorgulama servisi

import { apiClient } from './apiClient'
import { VINLookupResult } from '@/types'

export interface VINLookupRequest {
  vin: string
}

export interface VINLookupResponse {
  success: boolean
  data?: VINLookupResult
  error?: string
  cached?: boolean
}

class VINService {
  // VIN sorgula
  async lookupVIN(vin: string): Promise<VINLookupResponse> {
    if (!vin || vin.length !== 17) {
      return {
        success: false,
        error: 'VIN numarası 17 karakter olmalıdır'
      }
    }

    const response = await apiClient.post<VINLookupResult>('/vin/lookup', { vin })
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      cached: response.data?.cached || false
    }
  }

  // VIN geçmişini al
  async getVINHistory(): Promise<VINLookupResult[]> {
    const response = await apiClient.get<VINLookupResult[]>('/vin/history')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return []
  }

  // VIN detaylarını al
  async getVINDetails(vinId: string): Promise<VINLookupResult | null> {
    const response = await apiClient.get<VINLookupResult>(`/vin/${vinId}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  // VIN geçmişini temizle
  async clearVINHistory(): Promise<boolean> {
    const response = await apiClient.delete('/vin/history')
    return response.success
  }

  // VIN'i favorilere ekle
  async addToFavorites(vinId: string): Promise<boolean> {
    const response = await apiClient.post(`/vin/${vinId}/favorite`)
    return response.success
  }

  // VIN'i favorilerden çıkar
  async removeFromFavorites(vinId: string): Promise<boolean> {
    const response = await apiClient.delete(`/vin/${vinId}/favorite`)
    return response.success
  }

  // Favori VIN'leri al
  async getFavoriteVINs(): Promise<VINLookupResult[]> {
    const response = await apiClient.get<VINLookupResult[]>('/vin/favorites')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return []
  }

  // VIN validasyonu
  validateVIN(vin: string): { valid: boolean; error?: string } {
    if (!vin) {
      return { valid: false, error: 'VIN numarası gerekli' }
    }

    if (vin.length !== 17) {
      return { valid: false, error: 'VIN numarası 17 karakter olmalıdır' }
    }

    // VIN format kontrolü (I, O, Q harfleri kullanılmaz)
    const invalidChars = /[IOQ]/i
    if (invalidChars.test(vin)) {
      return { valid: false, error: 'VIN numarası I, O, Q harflerini içeremez' }
    }

    // Sadece harf ve rakam kontrolü
    const validChars = /^[A-HJ-NPR-Z0-9]{17}$/i
    if (!validChars.test(vin)) {
      return { valid: false, error: 'VIN numarası sadece harf ve rakam içerebilir' }
    }

    return { valid: true }
  }

  // VIN formatını düzenle
  formatVIN(vin: string): string {
    return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
  }

  // VIN'i parçalara ayır
  parseVIN(vin: string): {
    wmi: string // World Manufacturer Identifier (1-3)
    vds: string // Vehicle Descriptor Section (4-9)
    vis: string // Vehicle Identifier Section (10-17)
  } | null {
    if (!this.validateVIN(vin).valid) {
      return null
    }

    const formattedVIN = this.formatVIN(vin)
    
    return {
      wmi: formattedVIN.substring(0, 3),
      vds: formattedVIN.substring(3, 9),
      vis: formattedVIN.substring(9, 17)
    }
  }
}

export const vinService = new VINService()
export default vinService
