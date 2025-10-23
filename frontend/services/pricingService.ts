/**
 * Pricing Service (Fiyatlandırma Servisi)
 * 
 * Clean Architecture - Service Layer (Servis Katmanı)
 * 
 * Bu servis, fiyatlandırma ve kampanya yönetimi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Backend'ten paket bilgilerini çekme
 * - Kampanya verilerini alma
 * - Dinamik fiyatlandırma
 * 
 * Kullanım:
 * ```typescript
 * import { pricingService } from './pricingService'
 * 
 * const packages = await pricingService.getPricingPackages()
 * const campaigns = await pricingService.getActiveCampaigns()
 * ```
 */

import { apiClient } from './apiClient'

// ===== INTERFACES =====

export interface PricingPackage {
  id: string
  name: string
  price: number
  credits: number
  bonus: number
  period: string
  description: string
  features: string[]
  popular: boolean
  badge: string | null
  originalPrice?: number
  discount?: number
}

export interface Campaign {
  id: string
  name: string
  description: string
  discount: number
  validUntil: string
  isActive: boolean
}

export interface PricingResponse {
  success: boolean
  message: string
  data: {
    packages: PricingPackage[]
  }
}

export interface CampaignsResponse {
  success: boolean
  message: string
  data: {
    campaigns: Campaign[]
  }
}

export interface PackageDetailsResponse {
  success: boolean
  message: string
  data: {
    package: {
      id: string
      name: string
      price: number
      credits: number
      bonus: number
      discount: number
      realValue: number
    }
  }
}

// ===== SERVICE METHODS =====

/**
 * Fiyatlandırma Paketlerini Getir
 * 
 * Backend'ten gerçek paket verilerini çeker.
 * 
 * @returns Promise<PricingPackage[]> - Paket listesi
 * @throws Error - API hatası
 */
export const getPricingPackages = async (): Promise<PricingPackage[]> => {
  try {
    const response = await apiClient.get('/api/pricing/packages')
    const data = response.data as any
    
    console.log('📦 Pricing packages response:', response)
    
    // Response formatını kontrol et
    if (data.success && data.data && data.data.packages) {
      console.log('✅ Pricing packages başarıyla alındı:', data.data.packages)
      return data.data.packages
    } else if (data.packages) {
      // Alternatif format kontrolü
      console.log('✅ Pricing packages (alt format) başarıyla alındı:', data.packages)
      return data.packages
    } else {
      console.error('❌ Pricing packages format hatası:', response)
      throw new Error(data.message || data.error || 'Paketler getirilemedi')
    }
  } catch (error: any) {
    console.error('💥 Pricing packages fetch error:', error)
    
    // Eğer error bir Error objesi değilse, string'e çevir
    const errorMessage = error?.message || error?.error || 'Fiyatlandırma paketleri yüklenemedi'
    throw new Error(errorMessage)
  }
}

/**
 * Aktif Kampanyaları Getir
 * 
 * Backend'ten gerçek kampanya verilerini çeker.
 * 
 * @returns Promise<Campaign[]> - Kampanya listesi
 * @throws Error - API hatası
 */
export const getActiveCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await apiClient.get('/api/pricing/campaigns')
    const data = response.data as any
    
    console.log('🎯 Campaigns response:', response)
    
    // Response formatını kontrol et
    if (data.success && data.data && data.data.campaigns) {
      console.log('✅ Campaigns başarıyla alındı:', data.data.campaigns)
      return data.data.campaigns
    } else if (data.campaigns) {
      // Alternatif format kontrolü
      console.log('✅ Campaigns (alt format) başarıyla alındı:', data.campaigns)
      return data.campaigns
    } else {
      console.error('❌ Campaigns format hatası:', response)
      throw new Error(data.message || data.error || 'Kampanyalar getirilemedi')
    }
  } catch (error: any) {
    console.error('💥 Campaigns fetch error:', error)
    
    // Eğer error bir Error objesi değilse, string'e çevir
    const errorMessage = error?.message || error?.error || 'Kampanyalar yüklenemedi'
    throw new Error(errorMessage)
  }
}

/**
 * Paket Detaylarını Getir
 * 
 * Belirli bir paketin detaylarını backend'ten çeker.
 * 
 * @param packageId - Paket ID'si
 * @returns Promise<PackageDetails> - Paket detayları
 * @throws Error - API hatası
 */
export const getPackageDetails = async (packageId: string): Promise<any> => {
  try {
    const response = await apiClient.get(`/api/pricing/packages/${packageId}`)
    const data = response.data as any
    
    console.log('📋 Package details response:', response)
    
    // Response formatını kontrol et
    if (data.success && data.data && data.data.package) {
      console.log('✅ Package details başarıyla alındı:', data.data.package)
      return data.data.package
    } else if (data.package) {
      // Alternatif format kontrolü
      console.log('✅ Package details (alt format) başarıyla alındı:', data.package)
      return data.package
    } else {
      console.error('❌ Package details format hatası:', response)
      throw new Error(data.message || data.error || 'Paket detayları getirilemedi')
    }
  } catch (error: any) {
    console.error('💥 Package details fetch error:', error)
    
    // Eğer error bir Error objesi değilse, string'e çevir
    const errorMessage = error?.message || error?.error || 'Paket detayları yüklenemedi'
    throw new Error(errorMessage)
  }
}

// ===== SERVICE OBJECT =====

export const pricingService = {
  getPricingPackages,
  getActiveCampaigns,
  getPackageDetails
}
