/**
 * Araç Mapper (Vehicle Mapper)
 * 
 * Clean Architecture - Mapper Layer (Dönüşüm Katmanı)
 * 
 * VehicleGarage entity'si ile DTO'lar arasında dönüşüm yapar.
 * 
 * Mapper'ın amacı:
 * - VehicleGarage entity'lerini Response DTO'lara dönüştürmek
 * - Request DTO'ları Prisma create/update data'ya dönüştürmek
 * - İlişkili verileri (images, reports) düzgün formatlayarak göndermek
 * 
 * Spring Framework'teki ModelMapper benzeri bir yapı sağlar.
 */

import { VehicleGarage } from '@prisma/client';

/**
 * VehicleMapper Static Sınıfı
 * 
 * Tüm metodlar static'tir, instance oluşturmaya gerek yoktur.
 * Utility sınıfı olarak çalışır.
 */
export class VehicleMapper {
  /**
   * VehicleGarage entity'sini Response DTO'ya dönüştürür
   * 
   * Veritabanından gelen entity'yi client için uygun formata çevirir.
   * İlişkili veriler (vehicleImages, reports) varsa dahil eder.
   * 
   * @param vehicle - VehicleGarage entity'si (ilişkili verilerle)
   * @returns Response DTO objesi - client'a gönderilmeye hazır
   */
  static toResponseDTO(vehicle: VehicleGarage & { vehicleImages?: any[]; reports?: any[] }) {
    return {
      id: vehicle.id,
      userId: vehicle.userId,
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color || null,          // undefined yerine null döndür
      mileage: vehicle.mileage || null,
      vin: vehicle.vin || null,
      fuelType: vehicle.fuelType || null,
      transmission: vehicle.transmission || null,
      engineSize: vehicle.engineSize || null,
      bodyType: vehicle.bodyType || null,
      doors: vehicle.doors || null,
      seats: vehicle.seats || null,
      notes: vehicle.notes || null,
      isDefault: vehicle.isDefault,
      images: vehicle.vehicleImages || [],    // İlişkili fotoğraflar
      recentReports: vehicle.reports || [],   // İlişkili raporlar
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
    };
  }

  /**
   * VehicleGarage entity listesini Response DTO listesine dönüştürür
   * 
   * Araç listeleme (garage sayfası) durumlarında kullanılır.
   * Her bir vehicle için toResponseDTO() metodunu çağırır.
   * 
   * @param vehicles - VehicleGarage entity'leri dizisi
   * @returns Response DTO dizisi
   */
  static toResponseDTOList(vehicles: VehicleGarage[]) {
    return vehicles.map((vehicle) => this.toResponseDTO(vehicle));
  }

  /**
   * CreateVehicleRequestDTO'yu Prisma create data'ya dönüştürür
   * 
   * Client'tan gelen DTO'yu veritabanı kayıt formatına çevirir.
   * Repository'nin create metoduna parametre olarak gönderilir.
   * 
   * @param dto - Araç oluşturma isteği DTO'su
   * @param dto.userId - Araç sahibi kullanıcı ID'si
   * @param dto.plate - Araç plakası
   * @param dto.brand - Araç markası
   * @param dto.model - Araç modeli
   * @param dto.year - Araç yılı
   * @param dto.color - Araç rengi (opsiyonel)
   * @param dto.mileage - Araç kilometresi (opsiyonel)
   * @param dto.vin - Şasi numarası (opsiyonel)
   * @param dto.fuelType - Yakıt tipi (opsiyonel)
   * @param dto.transmission - Vites türü (opsiyonel)
   * @param dto.engineSize - Motor hacmi (opsiyonel)
   * @param dto.bodyType - Kasa tipi (opsiyonel)
   * @param dto.doors - Kapı sayısı (opsiyonel)
   * @param dto.seats - Koltuk sayısı (opsiyonel)
   * @param dto.notes - Kullanıcı notları (opsiyonel)
   * @param dto.isDefault - Varsayılan araç mı (opsiyonel)
   * @returns Prisma create data objesi
   */
  static toCreateData(dto: {
    userId: number;
    plate: string;
    brand: string;
    model: string;
    year: number;
    color?: string;
    mileage?: number;
    vin?: string;
    fuelType?: string;
    transmission?: string;
    engineSize?: string;
    bodyType?: string;
    doors?: number;
    seats?: number;
    notes?: string;
    isDefault?: boolean;
  }) {
    return {
      userId: dto.userId,
      plate: dto.plate,
      brand: dto.brand,
      model: dto.model,
      year: dto.year,
      color: dto.color,
      mileage: dto.mileage,
      vin: dto.vin,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      engineSize: dto.engineSize,
      bodyType: dto.bodyType,
      doors: dto.doors,
      seats: dto.seats,
      notes: dto.notes,
      isDefault: dto.isDefault || false, // Default değer
    };
  }
}
