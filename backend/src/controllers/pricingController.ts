/**
 * Pricing Controller (Fiyatlandırma Kontrolcüsü)
 * 
 * Clean Architecture - Controller Layer (Kontrolcü Katmanı)
 * 
 * Bu dosya, fiyatlandırma ve kampanya yönetimi işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - Aktif kampanyaları döndürme
 * - Paket bilgilerini sağlama
 * - Dinamik fiyatlandırma
 * - Kampanya durumu kontrolü
 * 
 * Kullanım:
 * - GET /api/pricing/packages - Aktif paketler
 * - GET /api/pricing/campaigns - Aktif kampanyalar
 */

import { Request, Response } from 'express'
import { CREDIT_PRICING } from '../constants/CreditPricing'

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

// ===== CONTROLLER METHODS =====

/**
 * Aktif Fiyatlandırma Paketlerini Getir
 * 
 * @route   GET /api/pricing/packages
 * @access  Public
 * 
 * @returns 200 - Paket listesi
 * @returns 500 - Sunucu hatası
 * 
 * @example
 * GET /api/pricing/packages
 * Response: { success: true, data: { packages: [...] } }
 */
export const getPricingPackages = async (req: Request, res: Response): Promise<void> => {
  try {
    const packages: PricingPackage[] = [
      {
        id: 'starter',
        name: 'Başlangıç Paketi',
        price: CREDIT_PRICING.PACKAGES.STARTER.price,
        credits: CREDIT_PRICING.PACKAGES.STARTER.credits,
        bonus: CREDIT_PRICING.PACKAGES.STARTER.realValue - CREDIT_PRICING.PACKAGES.STARTER.price,
        period: 'tek seferlik',
        description: 'İlk kez kullanıcılar için',
        features: [
          `${CREDIT_PRICING.PACKAGES.STARTER.credits} kredi (${CREDIT_PRICING.PACKAGES.STARTER.realValue} TL değerinde)`,
          `${CREDIT_PRICING.PACKAGES.STARTER.realValue - CREDIT_PRICING.PACKAGES.STARTER.price} TL bonus kredi`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.STARTER.credits / CREDIT_PRICING.PAINT_ANALYSIS)} Boya Analizi (${CREDIT_PRICING.PAINT_ANALYSIS}₺)`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.STARTER.credits / CREDIT_PRICING.DAMAGE_ANALYSIS)} Hasar Analizi (${CREDIT_PRICING.DAMAGE_ANALYSIS}₺)`,
          'Tüm analizlere erişim'
        ],
        popular: false,
        badge: null
      },
      {
        id: 'professional',
        name: 'Profesyonel Paket',
        price: CREDIT_PRICING.PACKAGES.PROFESSIONAL.price,
        credits: CREDIT_PRICING.PACKAGES.PROFESSIONAL.credits,
        bonus: CREDIT_PRICING.PACKAGES.PROFESSIONAL.realValue - CREDIT_PRICING.PACKAGES.PROFESSIONAL.price,
        period: 'tek seferlik',
        description: 'En popüler seçenek ⭐',
        features: [
          `${CREDIT_PRICING.PACKAGES.PROFESSIONAL.credits} kredi (${CREDIT_PRICING.PACKAGES.PROFESSIONAL.realValue} TL değerinde)`,
          `${CREDIT_PRICING.PACKAGES.PROFESSIONAL.realValue - CREDIT_PRICING.PACKAGES.PROFESSIONAL.price} TL bonus kredi (%${(CREDIT_PRICING.PACKAGES.PROFESSIONAL.discount * 100).toFixed(1)})`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.PROFESSIONAL.credits / CREDIT_PRICING.PAINT_ANALYSIS)} Boya Analizi (${CREDIT_PRICING.PAINT_ANALYSIS}₺)`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.PROFESSIONAL.credits / CREDIT_PRICING.DAMAGE_ANALYSIS)} Hasar Analizi (${CREDIT_PRICING.DAMAGE_ANALYSIS}₺)`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.PROFESSIONAL.credits / CREDIT_PRICING.COMPREHENSIVE_EXPERTISE)} Kapsamlı Ekspertiz (${CREDIT_PRICING.COMPREHENSIVE_EXPERTISE}₺)`,
          'Öncelikli destek',
          '7/24 WhatsApp destek'
        ],
        popular: true,
        badge: 'En Popüler'
      },
      {
        id: 'enterprise',
        name: 'Kurumsal Paket',
        price: CREDIT_PRICING.PACKAGES.ENTERPRISE.price,
        credits: CREDIT_PRICING.PACKAGES.ENTERPRISE.credits,
        bonus: CREDIT_PRICING.PACKAGES.ENTERPRISE.realValue - CREDIT_PRICING.PACKAGES.ENTERPRISE.price,
        period: 'tek seferlik',
        description: 'Galeri ve kurumsal müşteriler',
        features: [
          `${CREDIT_PRICING.PACKAGES.ENTERPRISE.credits} kredi (${CREDIT_PRICING.PACKAGES.ENTERPRISE.realValue} TL değerinde)`,
          `${CREDIT_PRICING.PACKAGES.ENTERPRISE.realValue - CREDIT_PRICING.PACKAGES.ENTERPRISE.price} TL bonus kredi (%${(CREDIT_PRICING.PACKAGES.ENTERPRISE.discount * 100).toFixed(1)})`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.ENTERPRISE.credits / CREDIT_PRICING.PAINT_ANALYSIS)} Boya Analizi (${CREDIT_PRICING.PAINT_ANALYSIS}₺)`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.ENTERPRISE.credits / CREDIT_PRICING.DAMAGE_ANALYSIS)} Hasar Analizi (${CREDIT_PRICING.DAMAGE_ANALYSIS}₺)`,
          `~${Math.floor(CREDIT_PRICING.PACKAGES.ENTERPRISE.credits / CREDIT_PRICING.COMPREHENSIVE_EXPERTISE)} Kapsamlı Ekspertiz (${CREDIT_PRICING.COMPREHENSIVE_EXPERTISE}₺)`,
          '7/24 öncelikli destek',
          'Özel hesap yöneticisi',
          'Toplu işlem indirimleri'
        ],
        popular: false,
        badge: 'Kurumsal'
      }
    ]

    res.json({
      success: true,
      message: 'Fiyatlandırma paketleri başarıyla getirildi',
      data: { packages }
    })

  } catch (error) {
    console.error('Pricing packages getirme hatası:', error)
    res.status(500).json({
      success: false,
      message: 'Fiyatlandırma paketleri getirilemedi'
    })
  }
}

/**
 * Aktif Kampanyaları Getir
 * 
 * @route   GET /api/pricing/campaigns
 * @access  Public
 * 
 * @returns 200 - Kampanya listesi
 * @returns 500 - Sunucu hatası
 */
export const getActiveCampaigns = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date()
    const campaigns: Campaign[] = [
      {
        id: 'winter-boost-2025',
        name: 'Kışa Özel Kredi Boostu',
        description: 'Başlangıç paketinde +50₺ bonus, profesyonel pakette %20 ekstra kredi',
        discount: 20,
        validUntil: new Date('2025-03-31').toISOString(),
        isActive: now < new Date('2025-03-31')
      },
      {
        id: 'pro-upgrade-bundle',
        name: 'Profesyonel Paket Yükseltmesi',
        description: 'Profesyonel paket alımlarında %20 bonus + 3 taksit fırsatı',
        discount: 20,
        validUntil: new Date('2025-04-30').toISOString(),
        isActive: now < new Date('2025-04-30')
      },
      {
        id: 'loyalty-boost-2025',
        name: 'Sadakat Müşterisi Boostu',
        description: 'Son 90 günde 2+ rapor aldıysan %15 bonus kredi kazan',
        discount: 15,
        validUntil: new Date('2025-06-30').toISOString(),
        isActive: now < new Date('2025-06-30')
      }
    ]

    const activeCampaigns = campaigns.filter(campaign => campaign.isActive)

    res.json({
      success: true,
      message: 'Aktif kampanyalar başarıyla getirildi',
      data: { campaigns: activeCampaigns }
    })

  } catch (error) {
    console.error('Campaigns getirme hatası:', error)
    res.status(500).json({
      success: false,
      message: 'Kampanyalar getirilemedi'
    })
  }
}

/**
 * Paket Detaylarını Getir
 * 
 * @route   GET /api/pricing/packages/:id
 * @access  Public
 * 
 * @returns 200 - Paket detayı
 * @returns 404 - Paket bulunamadı
 * @returns 500 - Sunucu hatası
 */
export const getPackageDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    // Paket ID'sine göre CREDIT_PRICING'den veri al
    let packageData: any = null
    
    switch (id) {
      case 'starter':
        packageData = CREDIT_PRICING.PACKAGES.STARTER
        break
      case 'professional':
        packageData = CREDIT_PRICING.PACKAGES.PROFESSIONAL
        break
      case 'enterprise':
        packageData = CREDIT_PRICING.PACKAGES.ENTERPRISE
        break
      default:
        res.status(404).json({
          success: false,
          message: 'Paket bulunamadı'
        })
        return
    }

    const packageDetails = {
      id,
      name: `${id.charAt(0).toUpperCase() + id.slice(1)} Paket`,
      price: packageData.price,
      credits: packageData.credits,
      bonus: packageData.realValue - packageData.price,
      discount: packageData.discount,
      realValue: packageData.realValue
    }

    res.json({
      success: true,
      message: 'Paket detayları başarıyla getirildi',
      data: { package: packageDetails }
    })

  } catch (error) {
    console.error('Package details getirme hatası:', error)
    res.status(500).json({
      success: false,
      message: 'Paket detayları getirilemedi'
    })
  }
}
