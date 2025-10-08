/**
 * Araç Raporu Repository (Vehicle Report Repository)
 * 
 * Clean Architecture - Repository Layer (Veri Erişim Katmanı)
 * 
 * VehicleReport entity'si için özel veritabanı işlemlerini içerir.
 * BaseRepository'den miras alarak temel CRUD işlemlerini kullanır.
 * 
 * Araç raporlarına özel metodlar:
 * - Kullanıcıya göre rapor listeleme (filtreleme ve pagination ile)
 * - Görsel ve ses dosyalarıyla birlikte rapor oluşturma
 * - Rapor durumu güncelleme
 * - AI analiz verilerini güncelleme
 * - Kullanıcı rapor sayısını sayma
 * - Detaylı rapor bilgisi getirme (join'lerle)
 * 
 * Service katmanı tüm rapor işlemlerini bu repository üzerinden yapar.
 */

import { PrismaClient, VehicleReport, ReportType, ReportStatus } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * VehicleReportRepository Sınıfı
 * 
 * BaseRepository<VehicleReport>'dan extends eder.
 * VehicleReport entity'sine özel veritabanı işlemlerini tanımlar.
 */
export class VehicleReportRepository extends BaseRepository<VehicleReport> {
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
   * @returns 'vehicleReport' - Prisma şemasındaki model adı
   */
  protected getModelName(): string {
    return 'vehicleReport';
  }

  /**
   * Kullanıcının raporlarını getirir (filtreleme ve pagination ile)
   * 
   * Dashboard'da kullanıcının geçmiş raporlarını listelemek için kullanılır.
   * İlişkili veriler eager loading ile getirilir (images, audios, analysis).
   * 
   * @param userId - Raporları getirilecek kullanıcının ID'si
   * @param options - Filtreleme ve pagination ayarları (opsiyonel)
   * @param options.skip - Kaç rapor atlanacak (pagination için)
   * @param options.take - Kaç rapor getirilecek (limit)
   * @param options.reportType - Rapor türü filtresi (DAMAGE_DETECTION, PAINT_ANALYSIS vb.)
   * @param options.status - Rapor durumu filtresi (PENDING, COMPLETED, FAILED)
   * @returns Kullanıcının raporları listesi (ilişkili verilerle birlikte)
   */
  async findByUserId(
    userId: number,
    options?: {
      skip?: number;
      take?: number;
      reportType?: ReportType;
      status?: ReportStatus;
    }
  ): Promise<VehicleReport[]> {
    // Filtreleme koşullarını oluştur
    const where: any = { userId };

    // Rapor türü filtresi varsa ekle
    if (options?.reportType) {
      where.reportType = options.reportType;
    }

    // Rapor durumu filtresi varsa ekle
    if (options?.status) {
      where.status = options.status;
    }

    return await this.prisma.vehicleReport.findMany({
      where,
      skip: options?.skip,       // Pagination - başlangıç noktası
      take: options?.take,       // Pagination - sayfa başına kayıt
      orderBy: { createdAt: 'desc' }, // En yeni raporlar önce
      include: {
        vehicleImages: true,        // Rapora ait fotoğrafları getir
        vehicleAudios: true,        // Rapora ait ses kayıtlarını getir
        aiAnalysisResults: true,    // AI analiz sonuçlarını getir
        vehicleGarage: true,        // İlişkili araç bilgisini getir
      },
    });
  }

  /**
   * Yeni rapor oluşturur ve fotoğrafları da kaydeder
   * 
   * Transaction kullanarak rapor ve fotoğrafları atomik olarak oluşturur.
   * Hasar ve boya analizi gibi işlemlerde fotoğraflarla birlikte rapor açar.
   * 
   * @param data - Rapor bilgileri
   * @param data.userId - Raporu oluşturan kullanıcı ID'si
   * @param data.vehicleGarageId - İlişkili araç ID'si (garajdan) (opsiyonel)
   * @param data.vehiclePlate - Araç plakası (opsiyonel)
   * @param data.vehicleBrand - Araç markası (opsiyonel)
   * @param data.vehicleModel - Araç modeli (opsiyonel)
   * @param data.vehicleYear - Araç yılı (opsiyonel)
   * @param data.vehicleColor - Araç rengi (opsiyonel)
   * @param data.mileage - Araç kilometresi (opsiyonel)
   * @param data.reportType - Rapor türü (DAMAGE_DETECTION, PAINT_ANALYSIS vb.)
   * @param data.totalCost - İşlem maliyeti (kredi olarak)
   * @param data.images - Yüklenecek fotoğraflar listesi (opsiyonel)
   * @returns Oluşturulan rapor (fotoğraflarla birlikte)
   */
  async createWithImages(data: {
    userId: number;
    vehicleGarageId?: number;
    vehiclePlate?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehicleYear?: number;
    vehicleColor?: string;
    mileage?: number;
    reportType: ReportType;
    totalCost: number;
    images?: Array<{
      imageUrl: string;
      imageType: string;
      fileSize?: number;
    }>;
  }): Promise<VehicleReport> {
    // Images'i data'dan ayır (Prisma nested create için)
    const { images, ...reportData } = data;

    return await this.prisma.vehicleReport.create({
      data: {
        ...reportData,
        vehicleImages: images && images.length > 0
          ? {
              create: images.map(img => ({
                imageUrl: img.imageUrl,
                imageType: img.imageType as any, // Enum type casting
                fileSize: img.fileSize,
              })),
            }
          : undefined,
      },
      include: {
        vehicleImages: true, // Oluşturulan fotoğrafları da döndür
      },
    });
  }

  /**
   * Rapor durumunu günceller
   * 
   * AI analizi tamamlandığında PENDING -> COMPLETED
   * Hata oluştuğunda PENDING -> FAILED
   * 
   * @param id - Rapor ID'si
   * @param status - Yeni durum (PENDING, PROCESSING, COMPLETED, FAILED)
   * @returns Güncellenmiş rapor entity'si
   */
  async updateStatus(id: number, status: ReportStatus): Promise<VehicleReport> {
    return await this.prisma.vehicleReport.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * AI analiz sonuçlarını rapora kaydeder
   * 
   * AI servisi analizi tamamladıktan sonra sonuçları JSON olarak kaydeder.
   * aiAnalysisData alanı JSONB tipindedir, karmaşık obje tutabilir.
   * 
   * @param id - Rapor ID'si
   * @param aiAnalysisData - AI analiz sonucu (JSON obje)
   * @returns Güncellenmiş rapor entity'si
   */
  async updateAnalysisData(id: number, aiAnalysisData: any): Promise<VehicleReport> {
    return await this.prisma.vehicleReport.update({
      where: { id },
      data: { aiAnalysisData },
    });
  }

  /**
   * Kullanıcının toplam rapor sayısını döndürür
   * 
   * Dashboard istatistikleri için kullanılır.
   * Rapor türüne göre filtreleme yapılabilir.
   * 
   * @param userId - Kullanıcı ID'si
   * @param reportType - Rapor türü filtresi (opsiyonel)
   * @returns Toplam rapor sayısı
   */
  async countUserReports(userId: number, reportType?: ReportType): Promise<number> {
    const where: any = { userId };
    if (reportType) {
      where.reportType = reportType;
    }
    return await this.count(where);
  }

  /**
   * Raporu tüm detaylarıyla getirir (join'lerle)
   * 
   * Rapor detay sayfası için kullanılır.
   * İlişkili tüm veriler eager loading ile getirilir.
   * 
   * @param id - Rapor ID'si
   * @returns Detaylı rapor entity'si veya null (bulunamazsa)
   */
  async findByIdWithDetails(id: number): Promise<VehicleReport | null> {
    return await this.prisma.vehicleReport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            // passwordHash gibi hassas bilgiler dahil edilmez
          },
        },
        vehicleGarage: true,      // İlişkili araç bilgisi
        vehicleImages: true,      // Rapora ait fotoğraflar
        vehicleAudios: true,      // Rapora ait ses kayıtları
        aiAnalysisResults: true,  // AI analiz sonuçları
      },
    });
  }
}
