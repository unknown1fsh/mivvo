/**
 * VIN Routes (VIN Sorgulama Rotaları)
 * 
 * Clean Architecture - Route Layer (API Katmanı)
 * 
 * Bu dosya, VIN (Vehicle Identification Number) sorgulama route'larını tanımlar.
 * 
 * Route Kategorileri:
 * 1. VIN Decode:
 *    - POST /decode (VIN numarasını çöz)
 * 
 * 2. Temel Bilgi:
 *    - GET /basic/:vin (Temel VIN bilgisi)
 * 
 * 3. Sorgulama Geçmişi:
 *    - GET /history (VIN sorgulama geçmişi)
 * 
 * Özellikler:
 * - NHTSA API entegrasyonu
 * - Database cache (VINLookup)
 * - Türkçe çeviri desteği
 * - Hata toleranslı (fail-safe cache)
 * 
 * VIN Formatı:
 * - 17 haneli alfanumerik kod
 * - Örnek: 1HGBH41JXMN109186
 */

import { Router } from 'express';
import { VINController } from '../controllers/vinController';

const router = Router();

// ===== VIN DECODING ROUTES (VIN ÇÖZÜMLEME) =====

/**
 * POST /vin/decode
 * 
 * VIN numarasından detaylı araç bilgilerini getir.
 * 
 * Body:
 * - vin: string (17 haneli VIN numarası)
 * 
 * İş Akışı:
 * 1. VIN format kontrolü (17 hane)
 * 2. Database cache kontrolü
 * 3. Cache varsa direkt döndür
 * 4. Cache yoksa NHTSA API'den sorgula
 * 5. Sonucu cache'e kaydet
 * 6. Türkçe çeviri ile döndür
 * 
 * NHTSA API:
 * - https://vpic.nhtsa.dot.gov/api/
 * - Free public API
 * - 17 haneli VIN decode
 * 
 * Response:
 * - vin: VIN numarası
 * - make: Marka (Türkçe)
 * - model: Model (Türkçe)
 * - modelYear: Model yılı
 * - manufacturer: Üretici
 * - vehicleType: Araç tipi
 * - bodyClass: Kasa tipi
 * - engineCylinders: Motor silindir sayısı
 * - fuelType: Yakıt türü
 * - transmission: Vites türü
 * - cached: Cache'den mi geldi?
 * - lastUpdated?: Cache tarihi
 * 
 * @example
 * POST /vin/decode
 * Body: { "vin": "1HGBH41JXMN109186" }
 */
router.post('/decode', VINController.decodeVIN);

/**
 * GET /vin/basic/:vin
 * 
 * VIN'den temel bilgileri çıkar (offline, API yok).
 * 
 * Params:
 * - vin: VIN numarası
 * 
 * VIN Yapısı:
 * - İlk 3 hane: WMI (World Manufacturer Identifier)
 * - 4-8. haneler: VDS (Vehicle Descriptor Section)
 * - 10. hane: Model yılı
 * - 11. hane: Üretim tesisi
 * - 12-17. haneler: Seri numarası
 * 
 * Kullanım:
 * - Hızlı önizleme
 * - API çağrısı yapmadan temel kontrol
 * 
 * Response:
 * - wmi: İlk 3 hane
 * - countryOfOrigin: Üretim ülkesi
 * - modelYear: Model yılı (tahmin)
 * 
 * @example
 * GET /vin/basic/1HGBH41JXMN109186
 */
router.get('/basic/:vin', VINController.getBasicInfo);

/**
 * GET /vin/history
 * 
 * VIN sorgulama geçmişini getir.
 * 
 * Query:
 * - page?: number (default: 1)
 * - limit?: number (default: 10)
 * 
 * Kullanım:
 * - Admin paneli
 * - İstatistikler
 * - Popüler araç modelleri
 * 
 * Response:
 * - lookups: VIN sorgulama geçmişi
 * - pagination: Sayfalama bilgisi
 * 
 * @example
 * GET /vin/history?page=1&limit=20
 */
router.get('/history', VINController.getLookupHistory);

export default router;
