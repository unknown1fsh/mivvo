import { Request, Response } from 'express';
import { VINService, VINData } from '../services/vinService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class VINController {
  /**
   * VIN numarasından araç bilgilerini sorgular
   */
  static async decodeVIN(req: Request, res: Response): Promise<void> {
    try {
      const { vin } = req.body;

      if (!vin) {
        res.status(400).json({
          success: false,
          message: 'VIN numarası gereklidir'
        });
        return;
      }

      // VIN formatını kontrol et
      if (!VINService.isValidVIN(vin)) {
        res.status(400).json({
          success: false,
          message: 'Geçersiz VIN formatı. VIN 17 haneli olmalıdır.'
        });
        return;
      }

      // Önce cache'den kontrol et
      const cachedData = await prisma.vINLookup.findFirst({
        where: { vin: vin.toUpperCase() }
      });

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

      // Cache'e kaydet
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
          plantCompanyName: vinData.plantCompanyName
        }
      });

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
      
      // Hata tipine göre farklı HTTP status kodları
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
   * VIN numarasından temel bilgileri çıkarır (hızlı sorgu)
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
   * VIN sorgulama geçmişini getirir
   */
  static async getLookupHistory(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

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
