/**
 * Kimlik Doğrulama Yanıt DTO'ları (Data Transfer Objects)
 * 
 * Bu dosya, kimlik doğrulama işlemlerinden dönen yanıtları temsil eden
 * veri transfer nesnelerini içerir. Clean Architecture'ın Response Layer'ında yer alır.
 * 
 * Service katmanından dönen veriler bu DTO'lar aracılığıyla client'a iletilir.
 */

/**
 * Giriş Yanıtı DTO
 * 
 * Başarılı kullanıcı girişi sonrası dönen bilgileri içerir.
 * JWT token ve kullanıcı bilgileri ile birlikte gönderilir.
 * 
 * @property success - İşlemin başarılı olup olmadığını belirtir (zorunlu)
 * @property token - JWT access token (oturum için kullanılır) (zorunlu)
 * @property refreshToken - JWT refresh token (token yenileme için kullanılır) (opsiyonel)
 * @property user - Giriş yapan kullanıcının detay bilgileri (zorunlu)
 */
export interface LoginResponseDTO {
  success: boolean;
  token: string;
  refreshToken?: string;
  user: UserInfoDTO;
}

/**
 * Kullanıcı Bilgileri DTO
 * 
 * Kullanıcı entity'sinden hassas bilgileri (şifre hash'i gibi) çıkarılmış halidir.
 * Client'a güvenli bir şekilde kullanıcı bilgisi göndermek için kullanılır.
 * 
 * @property id - Kullanıcı ID'si (primary key)
 * @property email - Kullanıcı e-posta adresi
 * @property firstName - Kullanıcı adı
 * @property lastName - Kullanıcı soyadı
 * @property role - Kullanıcı rolü (USER, ADMIN, SUPERADMIN)
 * @property isActive - Hesap aktif mi? (pasif hesaplar giriş yapamaz)
 * @property emailVerified - E-posta doğrulandı mı?
 * @property createdAt - Hesap oluşturulma tarihi
 */
export interface UserInfoDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

/**
 * Kayıt Yanıtı DTO
 * 
 * Başarılı kullanıcı kaydı sonrası dönen bilgileri içerir.
 * Başarı durumu, mesaj ve yeni kullanıcı bilgisi içerir.
 * 
 * @property success - İşlemin başarılı olup olmadığını belirtir (zorunlu)
 * @property message - İşlem sonucu hakkında kullanıcıya gösterilecek mesaj (zorunlu)
 * @property user - Oluşturulan kullanıcının bilgileri (opsiyonel, başarılıysa doldurulur)
 */
export interface RegisterResponseDTO {
  success: boolean;
  message: string;
  user?: UserInfoDTO;
}

