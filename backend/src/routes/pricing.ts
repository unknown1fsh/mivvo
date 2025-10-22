/**
 * Pricing Routes (Fiyatlandırma Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, fiyatlandırma ve kampanya yönetimi route'larını tanımlar.
 * 
 * Route Kategorileri:
 * 1. Paket Yönetimi:
 *    - GET /packages (Tüm paketler)
 *    - GET /packages/:id (Paket detayı)
 * 
 * 2. Kampanya Yönetimi:
 *    - GET /campaigns (Aktif kampanyalar)
 * 
 * Özellikler:
 * - Public endpoint'ler (authentication gerekmez)
 * - Async error handling (asyncHandler)
 * - Gerçek veritabanı verileri
 * 
 * Güvenlik:
 * - Rate limiting (opsiyonel)
 * - Input validation
 */

import { Router } from 'express'
import { asyncHandler } from '../middleware/errorHandler'
import {
  getPricingPackages,
  getActiveCampaigns,
  getPackageDetails
} from '../controllers/pricingController'

const router = Router()

// ===== PUBLIC ROUTES (Authentication gerekmez) =====

/**
 * GET /api/pricing/packages
 * 
 * Aktif fiyatlandırma paketlerini getir.
 * 
 * İş Akışı:
 * 1. CREDIT_PRICING constants'ından paket bilgilerini al
 * 2. Dinamik hesaplamalar yap (bonus, özellikler)
 * 3. Paket listesini döndür
 * 
 * Response:
 * - success: true
 * - data: { packages: [...] }
 * 
 * Kullanım:
 * - Pricing sayfasında paket listesi
 * - Dashboard kampanya kartları
 * - Frontend constants yerine backend verisi
 */
router.get('/packages', asyncHandler(getPricingPackages))

/**
 * GET /api/pricing/packages/:id
 * 
 * Belirli bir paketin detaylarını getir.
 * 
 * İş Akışı:
 * 1. Paket ID'sini validate et
 * 2. CREDIT_PRICING'den paket bilgilerini al
 * 3. Detaylı paket bilgisini döndür
 * 
 * Response:
 * - success: true
 * - data: { package: {...} }
 * 
 * Kullanım:
 * - Purchase sayfasında paket detayları
 * - Paket karşılaştırma
 */
router.get('/packages/:id', asyncHandler(getPackageDetails))

/**
 * GET /api/pricing/campaigns
 * 
 * Aktif kampanyaları getir.
 * 
 * İş Akışı:
 * 1. Kampanya listesini tanımla
 * 2. Aktif kampanyaları filtrele
 * 3. Kampanya listesini döndür
 * 
 * Response:
 * - success: true
 * - data: { campaigns: [...] }
 * 
 * Kullanım:
 * - Kampanya banner'ları
 * - İndirim bilgileri
 * - Sınırlı süre vurguları
 */
router.get('/campaigns', asyncHandler(getActiveCampaigns))

export default router
