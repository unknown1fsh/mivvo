/**
 * VIN Controller (VIN Sorgulama Controller)
 * 
 * Clean Architecture - Controller Layer (API Katmanı)
 * 
 * Bu controller, VIN (Vehicle Identification Number) sorgulama işlemlerini yönetir.
 * 
 * Sorumluluklar:
 * - VIN decode (NHTSA API üzerinden)
 * - VIN cache yönetimi
 * - Temel VIN bilgisi çıkarma
 * - VIN sorgulama geçmişi
 * 
 * İş Akışı:
 * 1. VIN format kontrolü (17 haneli)
 * 2. Cache'den kontrol
 * 3. Cache yoksa NHTSA API'den sorgula
 * 4. Sonucu cache'e kaydet
 * 5. Kullanıcıya döndür
 * 
 * Özellikler:
 * - NHTSA (National Highway Traffic Safety Administration) API entegrasyonu
 * - Database cache (VINLookup tablosu)
 * - Hata toleranslı mimari (cache hatası devam eder)
 * - Türkçe çeviri desteği
 * 
 * API Endpoints:
 * - POST /api/vin/decode (VIN decode)
 * - GET /api/vin/basic/:vin (Temel bilgi)
 * - GET /api/vin/history (Sorgulama geçmişi)
 * 
 * Not: Bu controller class-based (static methods)
 */

import { Request, Response } from 'express';
import { VINService, VINData } from '../services/vinService';
import { PrismaClient } from '@prisma/client';

// ===== PRISMA CLIENT (SINGLETON) =====

/**
 * Prisma Client Singleton
 * 
 * Singleton pattern ile tek instance kullanımı.
 * 
 * Hata Durumu:
 * - İlk init hatası: Fallback olarak yeni instance
 * - DATABASE_URL env var kullanılır
 */
let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error('Prisma Client initialization error:', error);
  // Fallback olarak yeni instance oluştur
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });
}

// ===== CONTROLLER CLASS =====

export class VINController {
  /**
   * VIN Decode (VIN Numarasını Çöz)
   * 
   * VIN numarasından detaylı araç bilgilerini getirir.
   * 
   * İşlem Akışı:
   * 1. VIN varlık kontrolü
   * 2. VIN format doğrulama (17 hane)
   * 3. Database bağlantı testi
   * 4. Cache kontrolü (VINLookup tablosu)
   * 5. Cache varsa direkt döndür
   * 6. Cache yoksa NHTSA API çağrısı
   * 7. Sonucu cache'e kaydet
   * 8. Kullanıcıya döndür
   * 
   * Cache Stratejisi:
   * - VIN her sorgulandığında cache'e kaydedilir
   * - Cache hatası durumunda API sonucu döner (fail-safe)
   * - updatedAt timestamp ile cache freshness
   * 
   * NHTSA API:
   * - https://vpic.nhtsa.dot.gov/api/
   * - Free public API (rate limit yok)
   * - 17 haneli VIN decode
   * 
   * @route   POST /api/vin/decode
   * @access  Public/Private (check route)
   * 
   * @param req.body.vin - 17 haneli VIN numarası
   * 
   * @returns 200 - VIN bilgileri (cached veya API'den)
   * @returns 400 - Geçersiz VIN formatı
   * @returns 404 - VIN bilgileri bulunamadı
   * @returns 500 - Database/API hatası
   * 
   * @example
   * POST /api/vin/decode
   * Body: { "vin": "1HGBH41JXMN109186" }
   * Response: {
   *   "success": true,
   *   "data": {
   *     "vin": "1HGBH41JXMN109186",
   *     "make": "Honda",
   *     "model": "Accord",
   *     "modelYear": "2021",
   *     "cached": true,
   *     "lastUpdated": "2024-01-15T10:30:00Z"
   *   }
   * }
   */
  static async decodeVIN(req: Request, res: Response): Promise<void> {
    try {
      console.log('VIN decode request received:', { body: req.body, headers: req.headers });
      
      const { vin } = req.body;

      // VIN varlık kontrolü
      if (!vin) {
        console.log('VIN missing in request body');
        res.status(400).json({
          success: false,
          message: 'VIN numarası gereklidir'
        });
        return;
      }

      // VIN format kontrolü (17 hane)
      if (!VINService.isValidVIN(vin)) {
        console.log('Invalid VIN format:', vin);
        res.status(400).json({
          success: false,
          message: 'Geçersiz VIN formatı. VIN 17 haneli olmalıdır.'
        });
        return;
      }

      // Database bağlantı testi
      try {
        await prisma.$connect();
        console.log('Database connected successfully');
      } catch (dbError) {
        console.error('Database connection error:', dbError);
        res.status(500).json({
          success: false,
          message: 'Veritabanı bağlantı hatası'
        });
        return;
      }

      // Cache kontrolü (VINLookup tablosu)
      let cachedData = null;
      try {
        cachedData = await prisma.vINLookup.findFirst({
          where: { vin: vin.toUpperCase() }
        });
        console.log('Cache check completed:', cachedData ? 'Found' : 'Not found');
      } catch (cacheError) {
        console.error('Cache lookup error:', cacheError);
        // Cache hatası varsa devam et, API'den sorgula
      }

      // Cache varsa direkt döndür
      if (cachedData) {
        res.json({
          success: true,
          data: {
            vin: cachedData.vin,
            make: cachedData.make,
            model: cachedData.model,
            modelYear: cachedData.modelYear,
            manufacturer: cachedData.manufacturer,
            plantCountry: cachedData.plantCountry,
            vehicleType: cachedData.vehicleType,
            bodyClass: cachedData.bodyClass,
            engineCylinders: cachedData.engineCylinders,
            engineDisplacement: cachedData.engineDisplacement,
            fuelType: cachedData.fuelType,
            transmissionStyle: cachedData.transmissionStyle,
            driveType: cachedData.driveType,
            trim: cachedData.trim,
            series: cachedData.series,
            doors: cachedData.doors,
            windows: cachedData.windows,
            wheelBase: cachedData.wheelBase,
            gvwr: cachedData.gvwr,
            plantCity: cachedData.plantCity,
            plantState: cachedData.plantState,
            plantCompanyName: cachedData.plantCompanyName,
            cached: true,
            lastUpdated: cachedData.updatedAt
          },
          message: 'VIN bilgileri cache\'den alındı'
        });
        return;
      }

      // NHTSA API'den sorgula
      const vinData = await VINService.decodeVIN(vin);

      if (!vinData) {
        res.status(404).json({
          success: false,
          message: 'VIN bilgileri bulunamadı'
        });
        return;
      }

      // Sonucu cache'e kaydet (fail-safe)
      try {
        await prisma.vINLookup.create({
          data: {
            vin: vinData.vin,
            make: vinData.make,
            model: vinData.model,
            modelYear: vinData.modelYear,
            manufacturer: vinData.manufacturer,
            plantCountry: vinData.plantCountry,
            vehicleType: vinData.vehicleType,
            bodyClass: vinData.bodyClass,
            engineCylinders: vinData.engineCylinders,
            engineDisplacement: vinData.engineDisplacement,
            fuelType: vinData.fuelType,
            transmissionStyle: vinData.transmissionStyle,
            driveType: vinData.driveType,
            trim: vinData.trim,
            series: vinData.series,
            doors: vinData.doors,
            windows: vinData.windows,
            wheelBase: vinData.wheelBase,
            gvwr: vinData.gvwr,
            plantCity: vinData.plantCity,
            plantState: vinData.plantState,
            plantCompanyName: vinData.plantCompanyName,
            errorCode: vinData.errorCode,
            errorText: vinData.errorText
          }
        });
        console.log('VIN data cached successfully');
      } catch (cacheSaveError) {
        console.error('Cache save error:', cacheSaveError);
        // Cache hatası varsa devam et, kullanıcıya sonucu göster
      }

      // API sonucunu döndür
      res.json({
        success: true,
        data: {
          ...vinData,
          cached: false
        },
        message: 'VIN bilgileri başarıyla alındı',
        warnings: vinData.errorCode && parseInt(vinData.errorCode) >= 14 ? 
          ['Bazı VIN karakterleri için detaylı bilgi mevcut değil, ancak temel bilgiler doğru.'] : []
      });

    } catch (error) {
      console.error('VIN sorgulama hatası:', error);
      
      // Hata tipine göre HTTP status kodları
      if (error instanceof Error) {
        if (error.message.includes('Geçersiz VIN formatı')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
        } else if (error.message.includes('VIN sorgulama hatası')) {
          res.status(400).json({
            success: false,
            message: error.message
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'VIN sorgulama sırasında hata oluştu'
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'VIN sorgulama sırasında hata oluştu'
        });
      }
    }
  }

  /**
   * Temel VIN Bilgisi (Hızlı Sorgu)
   * 
   * VIN numarasından temel bilgileri çıkarır (API çağrısı yapmadan).
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
   * @route   GET /api/vin/basic/:vin
   * @access  Public/Private
   * 
   * @param req.params.vin - VIN numarası
   * 
   * @returns 200 - Temel VIN bilgileri
   * @returns 400 - VIN eksik
   * @returns 500 - İşlem hatası
   * 
   * @example
   * GET /api/vin/basic/1HGBH41JXMN109186
   * Response: {
   *   "success": true,
   *   "data": {
   *     "wmi": "1HG",
   *     "countryOfOrigin": "United States",
   *     "modelYear": "2021"
   *   }
   * }
   */
  static async getBasicInfo(req: Request, res: Response): Promise<void> {
    try {
      const { vin } = req.params;

      if (!vin) {
        res.status(400).json({
          success: false,
          message: 'VIN numarası gereklidir'
        });
        return;
      }

      // VIN'den temel bilgi çıkar (offline)
      const basicInfo = VINService.extractBasicInfo(vin);

      res.json({
        success: true,
        data: basicInfo,
        message: 'Temel VIN bilgileri alındı'
      });

    } catch (error) {
      console.error('Temel VIN bilgisi hatası:', error);
      res.status(500).json({
        success: false,
        message: 'Temel VIN bilgisi alınırken hata oluştu'
      });
    }
  }

  /**
   * VIN Sorgulama Geçmişi
   * 
   * Sistemde yapılmış tüm VIN sorgularını listeler.
   * 
   * Kullanım:
   * - Admin paneli
   * - İstatistikler
   * - Popüler araç modelleri
   * 
   * Pagination:
   * - Default: page=1, limit=10
   * - Tarih sıralı (yeni önce)
   * 
   * @route   GET /api/vin/history
   * @access  Admin/Private
   * 
   * @param req.query.page - Sayfa numarası
   * @param req.query.limit - Sayfa boyutu
   * 
   * @returns 200 - VIN sorgulama geçmişi (paginated)
   * @returns 500 - İşlem hatası
   * 
   * @example
   * GET /api/vin/history?page=1&limit=20
   * Response: {
   *   "success": true,
   *   "data": {
   *     "lookups": [...],
   *     "pagination": { "page": 1, "total": 50, "pages": 3 }
   *   }
   * }
   */
  static async getLookupHistory(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Paralel sorgular (performans)
      const [lookups, total] = await Promise.all([
        prisma.vINLookup.findMany({
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          select: {
            vin: true,
            make: true,
            model: true,
            modelYear: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.vINLookup.count()
      ]);

      res.json({
        success: true,
        data: {
          lookups,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        },
        message: 'VIN sorgulama geçmişi alındı'
      });

    } catch (error) {
      console.error('VIN geçmişi hatası:', error);
      res.status(500).json({
        success: false,
        message: 'VIN sorgulama geçmişi alınırken hata oluştu'
      });
    }
  }
}
