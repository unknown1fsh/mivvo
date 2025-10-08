/**
 * İş Mantığı Exception Sınıfları (Business Exceptions)
 * 
 * Clean Architecture - Exception Layer (Hata Yönetim Katmanı)
 * 
 * Uygulamaya özgü iş mantığı hatalarını temsil eden exception sınıflarını içerir.
 * Her sınıf BaseException'dan extends eder ve belirli bir iş kuralı ihlalini temsil eder.
 * 
 * Kullanım amacı:
 * - Service katmanında iş kuralı ihlallerini fırlatmak
 * - Domain-specific hataları standartlaştırmak
 * - Kod okunabilirliğini artırmak
 * - Client'a anlamlı hata mesajları göndermek
 * 
 * HttpExceptions'tan farkı:
 * - HttpExceptions: Genel HTTP hataları (tüm web uygulamalarında ortak)
 * - BusinessExceptions: Uygulamaya özel iş mantığı hataları
 */

import { BaseException } from './BaseException';

/**
 * Yetersiz Kredi Bakiyesi Exception
 * 
 * Kullanım: Kullanıcının kredi bakiyesi işlem için yeterli değilse.
 * Örnek: Hasar analizi 50 kredi gerektiriyor ama kullanıcıda 20 kredi var.
 * 
 * HTTP Status: 402 Payment Required
 */
export class InsufficientCreditsException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Yetersiz kredi bakiyesi')
   */
  constructor(message: string = 'Yetersiz kredi bakiyesi') {
    super(message, 402); // HTTP 402 Payment Required
    Object.setPrototypeOf(this, InsufficientCreditsException.prototype);
  }
}

/**
 * AI Servisi Hatası Exception
 * 
 * Kullanım: AI servisi (OpenAI, Google Gemini) erişilemez veya hata döndürdü.
 * Örnek: OpenAI API timeout, Gemini rate limit aşıldı.
 * 
 * HTTP Status: 503 Service Unavailable
 */
export class AIServiceException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'AI servisi kullanılamıyor')
   */
  constructor(message: string = 'AI servisi kullanılamıyor') {
    super(message, 503); // HTTP 503 Service Unavailable
    Object.setPrototypeOf(this, AIServiceException.prototype);
  }
}

/**
 * Dosya Yükleme Hatası Exception
 * 
 * Kullanım: Dosya yükleme işlemi başarısız olduğunda.
 * Örnek: Dosya boyutu çok büyük, disk dolu, yazma izni yok.
 * 
 * HTTP Status: 400 Bad Request
 */
export class FileUploadException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Dosya yükleme hatası')
   */
  constructor(message: string = 'Dosya yükleme hatası') {
    super(message, 400); // HTTP 400 Bad Request
    Object.setPrototypeOf(this, FileUploadException.prototype);
  }
}

/**
 * Dosya Bulunamadı Exception
 * 
 * Kullanım: İstenen dosya disk üzerinde bulunamadığında.
 * Örnek: Rapor fotoğrafı silinmiş, ses dosyası kayıp.
 * 
 * HTTP Status: 404 Not Found
 */
export class FileNotFoundException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Dosya bulunamadı')
   */
  constructor(message: string = 'Dosya bulunamadı') {
    super(message, 404); // HTTP 404 Not Found
    Object.setPrototypeOf(this, FileNotFoundException.prototype);
  }
}

/**
 * Geçersiz Dosya Tipi Exception
 * 
 * Kullanım: Yüklenen dosya kabul edilen formatta değilse.
 * Örnek: PDF yüklenmeye çalışıldı ama sadece JPG/PNG kabul ediliyor.
 * 
 * HTTP Status: 400 Bad Request
 */
export class InvalidFileTypeException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Geçersiz dosya tipi')
   */
  constructor(message: string = 'Geçersiz dosya tipi') {
    super(message, 400); // HTTP 400 Bad Request
    Object.setPrototypeOf(this, InvalidFileTypeException.prototype);
  }
}

/**
 * Ödeme Hatası Exception
 * 
 * Kullanım: Ödeme işlemi başarısız olduğunda.
 * Örnek: Kart reddedildi, bakiye yetersiz, banka hatası.
 * 
 * HTTP Status: 402 Payment Required
 */
export class PaymentException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Ödeme işlemi başarısız')
   */
  constructor(message: string = 'Ödeme işlemi başarısız') {
    super(message, 402); // HTTP 402 Payment Required
    Object.setPrototypeOf(this, PaymentException.prototype);
  }
}

/**
 * Veritabanı Hatası Exception
 * 
 * Kullanım: Veritabanı işlemi başarısız olduğunda (programlama hatası).
 * Örnek: Connection timeout, Constraint violation, Query error.
 * 
 * HTTP Status: 500 Internal Server Error
 * Not: isOperational = false (programlama hatası)
 */
export class DatabaseException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Veritabanı hatası')
   */
  constructor(message: string = 'Veritabanı hatası') {
    super(message, 500, false); // HTTP 500, isOperational = false
    Object.setPrototypeOf(this, DatabaseException.prototype);
  }
}

/**
 * E-posta Zaten Kayıtlı Exception
 * 
 * Kullanım: Kayıt sırasında e-posta adresi zaten kullanılıyorsa.
 * Örnek: user@example.com zaten kayıtlı.
 * 
 * HTTP Status: 409 Conflict
 */
export class EmailAlreadyExistsException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Bu e-posta adresi zaten kullanılıyor')
   */
  constructor(message: string = 'Bu e-posta adresi zaten kullanılıyor') {
    super(message, 409); // HTTP 409 Conflict
    Object.setPrototypeOf(this, EmailAlreadyExistsException.prototype);
  }
}

/**
 * Geçersiz Kimlik Bilgileri Exception
 * 
 * Kullanım: Giriş sırasında e-posta veya şifre hatalıysa.
 * Örnek: Yanlış şifre, kullanıcı bulunamadı.
 * 
 * HTTP Status: 401 Unauthorized
 */
export class InvalidCredentialsException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Geçersiz kullanıcı adı veya şifre')
   */
  constructor(message: string = 'Geçersiz kullanıcı adı veya şifre') {
    super(message, 401); // HTTP 401 Unauthorized
    Object.setPrototypeOf(this, InvalidCredentialsException.prototype);
  }
}

/**
 * Hesap Pasif Exception
 * 
 * Kullanım: Kullanıcı hesabı admin tarafından pasif yapılmışsa.
 * Örnek: isActive = false olan kullanıcı giriş yapmaya çalıştı.
 * 
 * HTTP Status: 403 Forbidden
 */
export class AccountInactiveException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Hesabınız aktif değil')
   */
  constructor(message: string = 'Hesabınız aktif değil') {
    super(message, 403); // HTTP 403 Forbidden
    Object.setPrototypeOf(this, AccountInactiveException.prototype);
  }
}

/**
 * VIN Bulunamadı Exception
 * 
 * Kullanım: VIN lookup servisi şasi numarasını bulamadığında.
 * Örnek: Girilen VIN numarası geçersiz veya kayıtlı değil.
 * 
 * HTTP Status: 404 Not Found
 */
export class VINNotFoundException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'VIN numarası bulunamadı')
   */
  constructor(message: string = 'VIN numarası bulunamadı') {
    super(message, 404); // HTTP 404 Not Found
    Object.setPrototypeOf(this, VINNotFoundException.prototype);
  }
}

/**
 * Rapor Bulunamadı Exception
 * 
 * Kullanım: İstenen rapor ID veritabanında bulunamadığında.
 * Örnek: Kullanıcı başka kullanıcının raporuna erişmeye çalıştı.
 * 
 * HTTP Status: 404 Not Found
 */
export class ReportNotFoundException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Rapor bulunamadı')
   */
  constructor(message: string = 'Rapor bulunamadı') {
    super(message, 404); // HTTP 404 Not Found
    Object.setPrototypeOf(this, ReportNotFoundException.prototype);
  }
}

/**
 * Araç Bulunamadı Exception
 * 
 * Kullanım: İstenen araç ID veya plaka bulunamadığında.
 * Örnek: Kullanıcı olmayan bir araca analiz yapmaya çalıştı.
 * 
 * HTTP Status: 404 Not Found
 */
export class VehicleNotFoundException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Araç bulunamadı')
   */
  constructor(message: string = 'Araç bulunamadı') {
    super(message, 404); // HTTP 404 Not Found
    Object.setPrototypeOf(this, VehicleNotFoundException.prototype);
  }
}

/**
 * Plaka Zaten Kayıtlı Exception
 * 
 * Kullanım: Araç eklerken veya güncellerken plaka zaten başka bir araçta kayıtlıysa.
 * Örnek: 34ABC123 plakası zaten garajda kayıtlı.
 * 
 * HTTP Status: 409 Conflict
 */
export class PlateAlreadyExistsException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Bu plaka zaten kayıtlı')
   */
  constructor(message: string = 'Bu plaka zaten kayıtlı') {
    super(message, 409); // HTTP 409 Conflict
    Object.setPrototypeOf(this, PlateAlreadyExistsException.prototype);
  }
}
