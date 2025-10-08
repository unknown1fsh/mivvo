/**
 * Kullanıcı Mapper (User Mapper)
 * 
 * Clean Architecture - Mapper Layer (Dönüşüm Katmanı)
 * 
 * User entity'si ile DTO'lar arasında dönüşüm yapar.
 * 
 * Mapper'ın amacı:
 * - Entity'leri DTO'lara dönüştürmek (toDTO)
 * - DTO'ları Entity'lere dönüştürmek (fromDTO)
 * - Hassas bilgileri filtrelemek (sanitize)
 * - Service ve Controller katmanlarını birbirinden izole etmek
 * 
 * Spring Framework'teki ModelMapper benzeri bir yapı sağlar.
 * 
 * Avantajları:
 * - Katmanlar arası veri transferini standartlaştırır
 * - Hassas bilgilerin (passwordHash gibi) client'a gitmesini engeller
 * - Entity değişikliklerinden API response'unu korur
 * - Test edilebilirlik
 */

import { User } from '@prisma/client';
import { UserInfoDTO } from '../dto/response/AuthResponseDTO';

/**
 * UserMapper Static Sınıfı
 * 
 * Tüm metodlar static'tir, instance oluşturmaya gerek yoktur.
 * Utility sınıfı olarak çalışır.
 */
export class UserMapper {
  /**
   * User entity'sini UserInfoDTO'ya dönüştürür
   * 
   * Veritabanından gelen User entity'sinden hassas bilgiler (passwordHash) çıkarılır.
   * Client'a güvenli bir şekilde kullanıcı bilgisi göndermek için kullanılır.
   * 
   * @param user - Veritabanından gelen User entity'si
   * @returns UserInfoDTO - Client'a gönderilecek güvenli kullanıcı bilgisi
   */
  static toUserInfoDTO(user: User): UserInfoDTO {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      // passwordHash dahil edilmez - güvenlik
    };
  }

  /**
   * Birden fazla User entity'sini UserInfoDTO listesine dönüştürür
   * 
   * Kullanıcı listeleme (admin panel gibi) durumlarında kullanılır.
   * Her bir user için toUserInfoDTO() metodunu çağırır.
   * 
   * @param users - User entity'leri dizisi
   * @returns UserInfoDTO dizisi
   */
  static toUserInfoDTOList(users: User[]): UserInfoDTO[] {
    return users.map((user) => this.toUserInfoDTO(user));
  }

  /**
   * User entity'sinden hassas bilgileri çıkarır
   * 
   * passwordHash alanını çıkararak geri kalan tüm alanları döndürür.
   * Loglama veya dahili işlemler için kullanılır.
   * 
   * Not: Client'a gönderilecekse toUserInfoDTO() tercih edilmelidir.
   * 
   * @param user - User entity'si
   * @returns passwordHash alanı olmayan User objesi
   */
  static sanitize(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
