/**
 * VIN Service (VIN Sorgulama Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, VIN (Vehicle Identification Number) sorgulama işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - VIN numarası sorgulama (NHTSA API)
 * - VIN geçmişi yönetimi
 * - VIN favori işlemleri
 * - VIN validasyonu
 * - VIN formatlaması
 * - VIN parsing (WMI, VDS, VIS)
 * 
 * VIN Yapısı:
 * - WMI (1-3): World Manufacturer Identifier
 * - VDS (4-9): Vehicle Descriptor Section
 * - VIS (10-17): Vehicle Identifier Section
 * 
 * Kullanım:
 * ```typescript
 * import { vinService } from './vinService'
 * 
 * const result = await vinService.lookupVIN('1HGBH41JXMN109186')
 * const isValid = vinService.validateVIN('1HGBH41JXMN109186')
 * ```
 */

import { apiClient } from './apiClient'
import { VINLookupResult } from '@/types'

// ===== INTERFACES =====

/**
 * VIN Lookup Request
 */
export interface VINLookupRequest {
  vin: string
}

/**
 * VIN Lookup Response
 */
export interface VINLookupResponse {
  success: boolean
  data?: VINLookupResult
  error?: string
  cached?: boolean
}

// ===== VIN SERVICE CLASS =====

/**
 * VIN Service Class
 */
class VINService {
  // ===== VIN LOOKUP =====

  /**
   * Lookup VIN (VIN Sorgula)
   * 
   * VIN numarasını NHTSA API'den sorgular.
   * 
   * @param vin - 17 haneli VIN numarası
   * 
   * @returns VINLookupResponse
   */
  async lookupVIN(vin: string): Promise<VINLookupResponse> {
    if (!vin || vin.length !== 17) {
      return {
        success: false,
        error: 'VIN numarası 17 karakter olmalıdır'
      }
    }

    const response = await apiClient.post<VINLookupResult>('/vin/decode', { vin })
    
    return {
      success: response.success,
      data: response.data,
      error: response.error,
      cached: response.data?.cached || false
    }
  }

  /**
   * Get VIN History (VIN Geçmişi)
   * 
   * Kullanıcının VIN sorgulama geçmişini getirir.
   * 
   * @returns VINLookupResult[]
   */
  async getVINHistory(): Promise<VINLookupResult[]> {
    const response = await apiClient.get<VINLookupResult[]>('/vin/history')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return []
  }

  /**
   * Get VIN Details (VIN Detayları)
   * 
   * Belirli bir VIN sorgusunun detaylarını getirir.
   * 
   * @param vinId - VIN ID
   * 
   * @returns VINLookupResult veya null
   */
  async getVINDetails(vinId: string): Promise<VINLookupResult | null> {
    const response = await apiClient.get<VINLookupResult>(`/api/vin/${vinId}`)
    
    if (response.success && response.data) {
      return response.data
    }
    
    return null
  }

  /**
   * Clear VIN History (VIN Geçmişini Temizle)
   * 
   * Kullanıcının tüm VIN sorgulama geçmişini siler.
   * 
   * @returns boolean
   */
  async clearVINHistory(): Promise<boolean> {
    const response = await apiClient.delete('/vin/history')
    return response.success
  }

  // ===== FAVORITES =====

  /**
   * Add To Favorites (Favorilere Ekle)
   * 
   * VIN'i favorilere ekler.
   * 
   * @param vinId - VIN ID
   * 
   * @returns boolean
   */
  async addToFavorites(vinId: string): Promise<boolean> {
    const response = await apiClient.post(`/api/vin/${vinId}/favorite`)
    return response.success
  }

  /**
   * Remove From Favorites (Favorilerden Çıkar)
   * 
   * VIN'i favorilerden çıkarır.
   * 
   * @param vinId - VIN ID
   * 
   * @returns boolean
   */
  async removeFromFavorites(vinId: string): Promise<boolean> {
    const response = await apiClient.delete(`/api/vin/${vinId}/favorite`)
    return response.success
  }

  /**
   * Get Favorite VINs (Favori VIN'ler)
   * 
   * Kullanıcının favori VIN'lerini getirir.
   * 
   * @returns VINLookupResult[]
   */
  async getFavoriteVINs(): Promise<VINLookupResult[]> {
    const response = await apiClient.get<VINLookupResult[]>('/vin/favorites')
    
    if (response.success && response.data) {
      return response.data
    }
    
    return []
  }

  // ===== VALIDATION AND FORMATTING =====

  /**
   * Validate VIN (VIN Validasyonu)
   * 
   * VIN numarasını doğrular.
   * 
   * Kurallar:
   * - 17 karakter olmalı
   * - I, O, Q harfleri kullanılamaz
   * - Sadece harf ve rakam
   * 
   * @param vin - VIN numarası
   * 
   * @returns Doğrulama sonucu
   */
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

  /**
   * Format VIN (VIN Formatla)
   * 
   * VIN numarasını formatlar (büyük harf + geçersiz karakterleri kaldırır).
   * 
   * @param vin - VIN numarası
   * 
   * @returns Formatlanmış VIN
   */
  formatVIN(vin: string): string {
    return vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '')
  }

  /**
   * Parse VIN (VIN Parse)
   * 
   * VIN numarasını parçalara ayırır.
   * 
   * @param vin - VIN numarası
   * 
   * @returns VIN parçaları veya null
   */
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

// ===== SINGLETON INSTANCE =====

/**
 * Singleton Instance
 */
export const vinService = new VINService()

/**
 * Default Export
 */
export default vinService
