/**
 * Temel Repository Sınıfı (Base Repository)
 * 
 * Clean Architecture - Repository Layer (Veri Erişim Katmanı)
 * 
 * Bu sınıf, tüm repository'ler için ortak veritabanı işlemlerini sağlar.
 * Tekrar eden CRUD (Create, Read, Update, Delete) kodlarını tek bir yerde toplar.
 * 
 * Generic type <T> kullanarak farklı entity tipleriyle çalışabilir.
 * Spring Framework'teki JpaRepository benzeri bir yapı sağlar.
 * 
 * Avantajları:
 * - Kod tekrarını önler (DRY prensibi)
 * - Tutarlı veritabanı işlemleri
 * - Prisma Client'ı service katmanından izole eder
 * - Test edilebilirlik (mock'lanabilir)
 */

import { PrismaClient } from '@prisma/client';

/**
 * Temel Repository Abstract Sınıfı
 * 
 * @template T - Entity tipi (User, VehicleReport, VehicleGarage vb.)
 */
export abstract class BaseRepository<T> {
  /**
   * Prisma Client instance
   * Protected olarak tanımlandı, sadece child class'lar erişebilir
   */
  protected prisma: PrismaClient;

  /**
   * Constructor - Dependency Injection ile Prisma Client alır
   * 
   * @param prisma - Prisma Client instance (singleton olarak inject edilir)
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Prisma model adını döndüren abstract method
   * 
   * Her child repository bu metodu implement etmek zorundadır.
   * Örnek: UserRepository için 'user', VehicleRepository için 'vehicle'
   * 
   * @returns Prisma model adı (küçük harf)
   */
  protected abstract getModelName(): string;

  /**
   * ID'ye göre tek kayıt bulur
   * 
   * Spring Framework'teki findById() metoduna benzer.
   * 
   * @param id - Aranacak kaydın primary key ID'si
   * @returns Bulunan entity veya null (bulunamazsa)
   */
  async findById(id: number): Promise<T | null> {
    const model = this.getModel();
    return await model.findUnique({
      where: { id },
    }) as T | null;
  }

  /**
   * Tüm kayıtları getirir (opsiyonel sayfalama ve sıralama ile)
   * 
   * Spring Framework'teki findAll() metoduna benzer.
   * 
   * @param options - Opsiyonel filtreleme ayarları
   * @param options.skip - Kaç kayıt atlanacak (pagination için)
   * @param options.take - Kaç kayıt getirilecek (limit)
   * @param options.orderBy - Sıralama kriteri (örn: { createdAt: 'desc' })
   * @returns Entity listesi
   */
  async findAll(options?: {
    skip?: number;
    take?: number;
    orderBy?: any;
  }): Promise<T[]> {
    const model = this.getModel();
    return await model.findMany({
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy,
    }) as T[];
  }

  /**
   * Yeni kayıt oluşturur
   * 
   * Spring Framework'teki save() metoduna benzer (insert durumu).
   * 
   * @param data - Oluşturulacak entity verisi
   * @returns Oluşturulan entity (ID dahil)
   */
  async create(data: any): Promise<T> {
    const model = this.getModel();
    return await model.create({
      data,
    }) as T;
  }

  /**
   * Mevcut kaydı günceller
   * 
   * Spring Framework'teki save() metoduna benzer (update durumu).
   * 
   * @param id - Güncellenecek kaydın ID'si
   * @param data - Güncellenecek veri (partial update destekler)
   * @returns Güncellenmiş entity
   */
  async update(id: number, data: any): Promise<T> {
    const model = this.getModel();
    return await model.update({
      where: { id },
      data,
    }) as T;
  }

  /**
   * Kaydı siler
   * 
   * Spring Framework'teki deleteById() metoduna benzer.
   * 
   * @param id - Silinecek kaydın ID'si
   * @returns Silinen entity
   */
  async delete(id: number): Promise<T> {
    const model = this.getModel();
    return await model.delete({
      where: { id },
    }) as T;
  }

  /**
   * Belirtilen koşula uyan kayıt sayısını döndürür
   * 
   * Spring Framework'teki count() metoduna benzer.
   * 
   * @param where - Filtreleme koşulu (opsiyonel, yoksa tüm kayıtları sayar)
   * @returns Toplam kayıt sayısı
   */
  async count(where?: any): Promise<number> {
    const model = this.getModel();
    return await model.count({
      where,
    });
  }

  /**
   * Belirtilen koşula uyan kayıt var mı kontrol eder
   * 
   * Spring Framework'teki exists() metoduna benzer.
   * 
   * @param where - Filtreleme koşulu
   * @returns true: kayıt var, false: kayıt yok
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Prisma model delegate'ini döndürür
   * 
   * Private helper metod. getModelName() ile dinamik olarak model'e erişir.
   * Örnek: 'user' -> prisma.user, 'vehicle' -> prisma.vehicle
   * 
   * @returns Prisma model delegate
   */
  protected getModel(): any {
    const modelName = this.getModelName();
    return (this.prisma as any)[modelName];
  }
}

