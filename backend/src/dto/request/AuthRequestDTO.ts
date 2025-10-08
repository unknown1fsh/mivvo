/**
 * Kimlik Doğrulama İstek DTO'ları (Data Transfer Objects)
 * 
 * Bu dosya, kimlik doğrulama işlemleri için client'tan gelen istekleri temsil eden
 * veri transfer nesnelerini içerir. Clean Architecture'ın Request Layer'ında yer alır.
 * 
 * DTO'lar, controller ve service katmanları arasında veri taşımak için kullanılır.
 * Bu sayede iş mantığı katmanı HTTP request detaylarından izole edilir.
 */

/**
 * Giriş İsteği DTO
 * 
 * Kullanıcı giriş işlemi için gerekli bilgileri taşır.
 * Controller, bu DTO'yu kullanarak AuthService'e giriş talebini iletir.
 * 
 * @property email - Kullanıcının e-posta adresi (zorunlu)
 * @property password - Kullanıcının şifresi (zorunlu)
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
}

/**
 * Kayıt İsteği DTO
 * 
 * Yeni kullanıcı kaydı için gerekli tüm bilgileri taşır.
 * Controller, bu DTO'yu kullanarak AuthService'e kayıt talebini iletir.
 * 
 * @property email - Kullanıcının e-posta adresi (zorunlu, unique olmalı)
 * @property password - Kullanıcının şifresi (zorunlu, hash'lenecek)
 * @property firstName - Kullanıcının adı (zorunlu)
 * @property lastName - Kullanıcının soyadı (zorunlu)
 * @property phone - Kullanıcının telefon numarası (opsiyonel)
 */
export interface RegisterRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Şifre Sıfırlama Talebi DTO
 * 
 * Kullanıcı şifresini unuttuğunda, şifre sıfırlama linki talep etmek için kullanılır.
 * Bu DTO ile e-posta adresine sıfırlama token'ı gönderilir.
 * 
 * @property email - Şifre sıfırlama linki gönderilecek e-posta adresi (zorunlu)
 */
export interface ForgotPasswordRequestDTO {
  email: string;
}

/**
 * Şifre Sıfırlama DTO
 * 
 * E-postaya gelen token ile yeni şifre belirleme işleminde kullanılır.
 * Token doğrulandıktan sonra şifre güncellenir.
 * 
 * @property token - E-posta ile gönderilen benzersiz sıfırlama token'ı (zorunlu)
 * @property newPassword - Kullanıcının yeni şifresi (zorunlu, hash'lenecek)
 */
export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

/**
 * Şifre Değiştirme DTO
 * 
 * Oturum açmış kullanıcının şifresini değiştirmesi için kullanılır.
 * Güvenlik için mevcut şifre doğrulaması yapılır.
 * 
 * @property currentPassword - Kullanıcının mevcut şifresi (doğrulama için zorunlu)
 * @property newPassword - Kullanıcının yeni şifresi (zorunlu, hash'lenecek)
 */
export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

