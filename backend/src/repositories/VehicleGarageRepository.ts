/**
 * Araç Garajı Repository (Vehicle Garage Repository)
 * 
 * Clean Architecture - Repository Layer (Veri Erişim Katmanı)
 * 
 * VehicleGarage entity'si için özel veritabanı işlemlerini içerir.
 * BaseRepository'den miras alarak temel CRUD işlemlerini kullanır.
 * 
 * Kullanıcının kayıtlı araçlarını yönetir:
 * - Kullanıcıya göre araç listeleme
 * - Plaka ve VIN ile araç bulma
 * - Plaka varlık kontrolü
 * - Varsayılan araç belirleme
 * - Fotoğraflarla birlikte araç oluşturma
 * - Kullanıcı araç sayısı
 * 
 * Service katmanı tüm garage işlemlerini bu repository üzerinden yapar.
 */

import { PrismaClient, VehicleGarage } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * VehicleGarageRepository Sınıfı
 * 
 * BaseRepository<VehicleGarage>'dan extends eder.
 * VehicleGarage entity'sine özel veritabanı işlemlerini tanımlar.
 */
export class VehicleGarageRepository extends BaseRepository<VehicleGarage> {
  /**
   * Constructor - Dependency Injection
   * 
   * @param prisma - Prisma Client instance
   */
  constructor(prisma: PrismaClient) {
    super(prisma); // Parent constructor'ı çağır
  }

  /**
   * Prisma model adını döndürür
   * 
   * BaseRepository abstract metodunun implementasyonu.
   * 
   * @returns 'vehicleGarage' - Prisma şemasındaki model adı
   */
  protected getModelName(): string {
    return 'vehicleGarage';
  }

  /**
   * Kullanıcının tüm araçlarını getirir
   * 
   * Garage sayfasında kullanıcının kayıtlı araçlarını listelemek için kullanılır.
   * Varsayılan araç en üstte, sonra oluşturulma tarihine göre sıralanır.
   * İlişkili fotoğraflar ve son 5 rapor da dahil edilir.
   * 
   * @param userId - Araçları getirilecek kullanıcının ID'si
   * @returns Kullanıcının araçları listesi (fotoğraf ve rapor bilgileriyle)
   */
  async findByUserId(userId: number): Promise<VehicleGarage[]> {
    return await this.prisma.vehicleGarage.findMany({
      where: { userId },
      orderBy: [
        { isDefault: 'desc' },    // Varsayılan araç önce
        { createdAt: 'desc' },    // Sonra en yeni eklenenler
      ],
      include: {
        vehicleImages: true,      // Araç fotoğrafları
        reports: {
          take: 5,                // Son 5 rapor
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            reportType: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Plaka ile araç bulur
   * 
   * Plaka unique olduğu için sadece bir araç döner.
   * Analiz sırasında plaka ile araç bilgisi çekmek için kullanılır.
   * 
   * @param plate - Aranacak araç plakası
   * @returns Araç entity'si (fotoğraflarla) veya null
   */
  async findByPlate(plate: string): Promise<VehicleGarage | null> {
    return await this.prisma.vehicleGarage.findUnique({
      where: { plate },
      include: {
        vehicleImages: true, // Araç fotoğraflarını da getir
      },
    });
  }

  /**
   * VIN (Şasi Numarası) ile araç bulur
   * 
   * VIN unique olduğu için sadece bir araç döner.
   * VIN lookup servisi ile araç bilgisi çekmek için kullanılır.
   * 
   * @param vin - Aranacak VIN numarası
   * @returns Araç entity'si (fotoğraflarla) veya null
   */
  async findByVin(vin: string): Promise<VehicleGarage | null> {
    return await this.prisma.vehicleGarage.findUnique({
      where: { vin },
      include: {
        vehicleImages: true, // Araç fotoğraflarını da getir
      },
    });
  }

  /**
   * Plaka kayıtlı mı kontrol eder
   * 
   * Yeni araç eklerken veya plaka güncellerken duplicate kontrolü için kullanılır.
   * excludeId parametresi ile güncelleme sırasında kendi kaydını hariç tutar.
   * 
   * @param plate - Kontrol edilecek plaka
   * @param excludeId - Hariç tutulacak kayıt ID'si (güncelleme için) (opsiyonel)
   * @returns true: plaka kayıtlı, false: plaka müsait
   */
  async plateExists(plate: string, excludeId?: number): Promise<boolean> {
    const where: any = { plate };
    
    // Güncelleme işleminde kendi kaydını hariç tut
    if (excludeId) {
      where.NOT = { id: excludeId };
    }
    
    return await this.exists(where);
  }

  /**
   * Kullanıcı için varsayılan araç belirler
   * 
   * Kullanıcının birden fazla aracı varsa, birini varsayılan yapabilir.
   * İşlem atomic olarak yapılır: önce tüm isDefault false yapılır, sonra seçilen true yapılır.
   * 
   * @param userId - Kullanıcı ID'si
   * @param vehicleId - Varsayılan yapılacak araç ID'si
   * @returns Güncellenmiş araç entity'si
   */
  async setDefault(userId: number, vehicleId: number): Promise<VehicleGarage> {
    // 1. Adım: Kullanıcının tüm araçlarında isDefault'u false yap
    await this.prisma.vehicleGarage.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // 2. Adım: Seçilen aracı varsayılan yap
    return await this.prisma.vehicleGarage.update({
      where: { id: vehicleId },
      data: { isDefault: true },
    });
  }

  /**
   * Kullanıcının varsayılan aracını getirir
   * 
   * Hızlı analiz için varsayılan araç bilgisi çekmek için kullanılır.
   * Kullanıcının birden fazla aracı varsa isDefault=true olanı döner.
   * 
   * @param userId - Kullanıcı ID'si
   * @returns Varsayılan araç entity'si veya null (yoksa)
   */
  async getDefaultVehicle(userId: number): Promise<VehicleGarage | null> {
    return await this.prisma.vehicleGarage.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      include: {
        vehicleImages: true, // Araç fotoğraflarını da getir
      },
    });
  }

  /**
   * Kullanıcının toplam araç sayısını döndürür
   * 
   * Dashboard istatistikleri için kullanılır.
   * 
   * @param userId - Kullanıcı ID'si
   * @returns Toplam araç sayısı
   */
  async countUserVehicles(userId: number): Promise<number> {
    return await this.count({ userId });
  }

  /**
   * Yeni araç oluşturur ve fotoğraflarını da kaydeder
   * 
   * Transaction kullanarak araç ve fotoğrafları atomik olarak oluşturur.
   * Kullanıcı garajına araç eklerken fotoğraflarla birlikte kayıt yapar.
   * 
   * @param data - Araç bilgileri
   * @param data.userId - Araç sahibi kullanıcı ID'si
   * @param data.plate - Araç plakası (unique)
   * @param data.brand - Araç markası
   * @param data.model - Araç modeli
   * @param data.year - Araç model yılı
   * @param data.color - Araç rengi (opsiyonel)
   * @param data.mileage - Araç kilometresi (opsiyonel)
   * @param data.vin - Şasi numarası (opsiyonel, unique)
   * @param data.fuelType - Yakıt tipi (opsiyonel)
   * @param data.transmission - Vites türü (opsiyonel)
   * @param data.engineSize - Motor hacmi (opsiyonel)
   * @param data.bodyType - Kasa tipi (opsiyonel)
   * @param data.doors - Kapı sayısı (opsiyonel)
   * @param data.seats - Koltuk sayısı (opsiyonel)
   * @param data.notes - Kullanıcı notları (opsiyonel)
   * @param data.isDefault - Varsayılan araç mı? (opsiyonel)
   * @param data.images - Yüklenecek fotoğraflar listesi (opsiyonel)
   * @returns Oluşturulan araç (fotoğraflarla birlikte)
   */
  async createWithImages(data: {
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
    images?: Array<{
      imagePath: string;
      imageName: string;
      imageType: string;
      fileSize?: number;
    }>;
  }): Promise<VehicleGarage> {
    // Images'i data'dan ayır (Prisma nested create için)
    const { images, ...vehicleData } = data;

    return await this.prisma.vehicleGarage.create({
      data: {
        ...vehicleData,
        vehicleImages: images
          ? {
              create: images.map((img) => ({
                imagePath: img.imagePath,
                imageName: img.imageName,
                imageType: (img.imageType?.toUpperCase?.() as any) || 'EXTERIOR',
                fileSize: img.fileSize,
              })), // Nested create ile fotoğrafları da oluştur
            }
          : undefined,
      },
      include: {
        vehicleImages: true, // Oluşturulan fotoğrafları da döndür
      },
    });
  }
}
