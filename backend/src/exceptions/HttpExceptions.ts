/**
 * HTTP Exception Sınıfları
 * 
 * Clean Architecture - Exception Layer (Hata Yönetim Katmanı)
 * 
 * Standart HTTP hata kodlarına karşılık gelen exception sınıflarını içerir.
 * Her sınıf BaseException'dan extends eder ve belirli bir HTTP status kodu temsil eder.
 * 
 * Kullanım amacı:
 * - Controller ve Service katmanlarında standart HTTP hatalarını fırlatmak
 * - ErrorHandler middleware'inin hataları doğru HTTP status kodu ile dönmesini sağlamak
 * - Kod okunabilirliğini artırmak (throw new NotFoundException() vs throw new Error())
 * 
 * Spring Framework'teki ResponseStatusException benzeri yapı.
 */

import { BaseException } from './BaseException';

/**
 * 400 Bad Request Exception
 * 
 * Kullanım: Client'tan gelen istek hatalı/eksik olduğunda.
 * Örnek: Eksik parametre, geçersiz format, validation hatası
 */
export class BadRequestException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Bad Request')
   */
  constructor(message: string = 'Bad Request') {
    super(message, 400); // HTTP 400 status kodu
    // Prototype chain düzeltmesi
    Object.setPrototypeOf(this, BadRequestException.prototype);
  }
}

/**
 * 401 Unauthorized Exception
 * 
 * Kullanım: Kimlik doğrulama gerektiğinde veya token geçersiz/süresi dolmuşsa.
 * Örnek: Token yok, token geçersiz, token süresi dolmuş
 */
export class UnauthorizedException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Unauthorized')
   */
  constructor(message: string = 'Unauthorized') {
    super(message, 401); // HTTP 401 status kodu
    Object.setPrototypeOf(this, UnauthorizedException.prototype);
  }
}

/**
 * 403 Forbidden Exception
 * 
 * Kullanım: Kullanıcı kimlik doğrulamış ama erişim yetkisi yoksa.
 * Örnek: Admin paneline normal kullanıcı erişmeye çalıştı
 */
export class ForbiddenException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Forbidden')
   */
  constructor(message: string = 'Forbidden') {
    super(message, 403); // HTTP 403 status kodu
    Object.setPrototypeOf(this, ForbiddenException.prototype);
  }
}

/**
 * 404 Not Found Exception
 * 
 * Kullanım: İstenen kayıt/resource veritabanında bulunamadığında.
 * Örnek: Kullanıcı ID'si yok, Rapor bulunamadı, Araç yok
 */
export class NotFoundException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Resource Not Found')
   */
  constructor(message: string = 'Resource Not Found') {
    super(message, 404); // HTTP 404 status kodu
    Object.setPrototypeOf(this, NotFoundException.prototype);
  }
}

/**
 * 409 Conflict Exception
 * 
 * Kullanım: Kayıt zaten mevcut veya conflikt durumu varsa.
 * Örnek: E-posta zaten kayıtlı, Plaka zaten var, Duplicate entry
 */
export class ConflictException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Conflict')
   */
  constructor(message: string = 'Conflict') {
    super(message, 409); // HTTP 409 status kodu
    Object.setPrototypeOf(this, ConflictException.prototype);
  }
}

/**
 * 422 Unprocessable Entity Exception (Validation Exception)
 * 
 * Kullanım: Veri formatı doğru ama validation kurallarına uymuyor.
 * Örnek: E-posta formatı hatalı, Şifre çok kısa, Yaş negatif
 * 
 * Ek özellik: errors dizisi ile detaylı validation hataları gönderilebilir.
 */
export class ValidationException extends BaseException {
  /**
   * Detaylı validation hataları
   * 
   * Örnek: [{ field: 'email', message: 'Invalid email format' }]
   */
  public readonly errors: any[];

  /**
   * Constructor
   * 
   * @param message - Genel hata mesajı (default: 'Validation Failed')
   * @param errors - Detaylı validation hataları dizisi (default: [])
   */
  constructor(message: string = 'Validation Failed', errors: any[] = []) {
    super(message, 422); // HTTP 422 status kodu
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}

/**
 * 500 Internal Server Error Exception
 * 
 * Kullanım: Beklenmeyen sunucu hatası (programlama hatası).
 * Örnek: Null reference, Syntax error, Database connection failed
 * 
 * Not: isOperational = false olarak ayarlanır (programlama hatası).
 * Client'a detay gösterilmemeli, sadece loglanmalı.
 */
export class InternalServerException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Internal Server Error')
   */
  constructor(message: string = 'Internal Server Error') {
    super(message, 500, false); // HTTP 500 status kodu, isOperational = false
    Object.setPrototypeOf(this, InternalServerException.prototype);
  }
}

/**
 * 503 Service Unavailable Exception
 * 
 * Kullanım: Dış servis erişilemez veya geçici olarak çalışmıyor.
 * Örnek: AI servisi down, Database down, Third-party API down
 */
export class ServiceUnavailableException extends BaseException {
  /**
   * Constructor
   * 
   * @param message - Hata mesajı (default: 'Service Unavailable')
   */
  constructor(message: string = 'Service Unavailable') {
    super(message, 503); // HTTP 503 status kodu
    Object.setPrototypeOf(this, ServiceUnavailableException.prototype);
  }
}
