/**
 * Kullanıcı Repository (User Repository)
 * 
 * Clean Architecture - Repository Layer (Veri Erişim Katmanı)
 * 
 * User entity'si için özel veritabanı işlemlerini içerir.
 * BaseRepository'den miras alarak temel CRUD işlemlerini kullanır.
 * 
 * Kullanıcıya özel metod ekler:
 * - E-posta ile kullanıcı bulma
 * - E-posta varlık kontrolü
 * - Kredi bilgisiyle birlikte kullanıcı oluşturma
 * - Rol bazlı filtreleme
 * - Hesap durumu güncelleme
 * - E-posta doğrulama
 * 
 * Service katmanı bu repository üzerinden tüm user işlemlerini yapar.
 */

import { PrismaClient, User, Role } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * UserRepository Sınıfı
 * 
 * BaseRepository<User>'dan extends eder.
 * User entity'sine özel veritabanı işlemlerini tanımlar.
 */
export class UserRepository extends BaseRepository<User> {
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
   * @returns 'user' - Prisma şemasındaki model adı
   */
  protected getModelName(): string {
    return 'user';
  }

  /**
   * E-posta ile kullanıcı bulur
   * 
   * Giriş işlemi ve e-posta kontrolü için kullanılır.
   * UserCredits ilişkisi de dahil edilir (eager loading).
   * 
   * @param email - Aranacak e-posta adresi
   * @returns Kullanıcı entity'si (kredi bilgisiyle) veya null
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        userCredits: true, // Kullanıcının kredi bilgisini de getir
      },
    });
  }

  /**
   * E-posta adresi kayıtlı mı kontrol eder
   * 
   * Yeni kullanıcı kaydı öncesi duplicate kontrolü için kullanılır.
   * Spring Framework'teki existsByEmail() metoduna benzer.
   * 
   * @param email - Kontrol edilecek e-posta adresi
   * @returns true: e-posta kayıtlı, false: kayıtlı değil
   */
  async emailExists(email: string): Promise<boolean> {
    return await this.exists({ email });
  }

  /**
   * Yeni kullanıcı oluşturur ve kredi kaydı başlatır
   * 
   * Transaction kullanarak kullanıcı ve kredi kaydını atomik olarak oluşturur.
   * Kayıt sırasında UserCredits tablosunda da bir kayıt açar (başlangıç bakiyesi 0).
   * 
   * @param data - Kullanıcı bilgileri
   * @param data.email - E-posta adresi (unique)
   * @param data.passwordHash - Hash'lenmiş şifre
   * @param data.firstName - Ad
   * @param data.lastName - Soyad
   * @param data.phone - Telefon (opsiyonel)
   * @param data.role - Kullanıcı rolü (opsiyonel, default: USER)
   * @returns Oluşturulan kullanıcı (kredi bilgisiyle birlikte)
   */
  async createWithCredits(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: Role;
  }): Promise<User> {
    return await this.prisma.user.create({
      data: {
        ...data,
        userCredits: {
          create: {
            balance: 0,          // Başlangıç kredi bakiyesi
            totalPurchased: 0,   // Toplam satın alınan kredi
            totalUsed: 0,        // Toplam kullanılan kredi
          },
        },
      },
      include: {
        userCredits: true, // Oluşturulan kredi kaydını da döndür
      },
    });
  }

  /**
   * Belirli role sahip kullanıcıları getirir
   * 
   * Admin panel'de kullanıcı listeleme için kullanılır.
   * Spring Framework'teki findByRole() metoduna benzer.
   * 
   * @param role - Aranacak rol (USER, ADMIN, SUPERADMIN)
   * @returns Bu role sahip kullanıcılar listesi
   */
  async findByRole(role: Role): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: { role },
    });
  }

  /**
   * Kullanıcı hesap durumunu günceller
   * 
   * Admin tarafından hesap aktif/pasif yapma işlemi için kullanılır.
   * Pasif hesaplar giriş yapamaz.
   * 
   * @param id - Kullanıcı ID'si
   * @param isActive - true: aktif, false: pasif
   * @returns Güncellenmiş kullanıcı entity'si
   */
  async updateStatus(id: number, isActive: boolean): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { isActive },
    });
  }

  /**
   * Kullanıcının e-postasını doğrulanmış olarak işaretle
   * 
   * E-posta doğrulama linki tıklandığında çağrılır.
   * emailVerified flag'i true yapılır.
   * 
   * @param id - Kullanıcı ID'si
   * @returns Güncellenmiş kullanıcı entity'si
   */
  async verifyEmail(id: number): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { emailVerified: true },
    });
  }
}
